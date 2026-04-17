-- ============================================================
-- IPB WELLNESS HUB - PostgreSQL Database Schema
-- Mata Kuliah KOM 1231 Rekayasa Perangkat Lunak
-- Kelompok 5 | Semester Genap 2025/2026
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 1. DATA PENGGUNA
--    Menyimpan seluruh informasi akun pengguna (mahasiswa & admin)
-- ============================================================

CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    nama_role   VARCHAR(50) NOT NULL UNIQUE,  -- 'mahasiswa', 'admin'
    deskripsi   TEXT
);

INSERT INTO roles (nama_role, deskripsi) VALUES
    ('mahasiswa', 'Pengguna utama sistem gym IPB'),
    ('admin',     'Pengelola operasional gym IPB');


CREATE TABLE pengguna (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nim             VARCHAR(20) UNIQUE,                      -- NIM khusus mahasiswa
    nama_lengkap    VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    no_telepon      VARCHAR(20),
    whatsapp        VARCHAR(20),
    password_hash   TEXT NOT NULL,
    role_id         INT NOT NULL REFERENCES roles(id),
    sso_provider    VARCHAR(50) DEFAULT 'IPB_SSO',           -- OAuth 2.0 via SSO IPB
    sso_subject     VARCHAR(255),                            -- Subject ID dari SSO
    avatar_url      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pengguna_nim   ON pengguna(nim);
CREATE INDEX idx_pengguna_email ON pengguna(email);
CREATE INDEX idx_pengguna_role  ON pengguna(role_id);


-- ============================================================
-- 2. DATA KESEHATAN
--    Rekam data fisik pengguna secara berkala (berat, tinggi, BMI)
-- ============================================================

CREATE TABLE data_kesehatan (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pengguna_id     UUID NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
    berat_badan_kg  NUMERIC(5, 2) NOT NULL,   -- Sensitif, disembunyikan secara default
    tinggi_badan_cm NUMERIC(5, 2) NOT NULL,   -- Sensitif, disembunyikan secara default
    bmi             NUMERIC(5, 2)             -- Dihitung otomatis: berat / (tinggi/100)^2
                    GENERATED ALWAYS AS (
                        berat_badan_kg / POWER(tinggi_badan_cm / 100.0, 2)
                    ) STORED,
    kategori_bmi    VARCHAR(30),              -- 'Underweight', 'Normal', 'Overweight', 'Obese'
    catatan         TEXT,
    tanggal_rekam   DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kesehatan_pengguna ON data_kesehatan(pengguna_id);
CREATE INDEX idx_kesehatan_tanggal  ON data_kesehatan(tanggal_rekam);


-- ============================================================
-- 3. DATA MODUL LATIHAN
--    Konten program latihan yang dikelola admin
-- ============================================================

CREATE TABLE kategori_latihan (
    id      SERIAL PRIMARY KEY,
    nama    VARCHAR(100) NOT NULL UNIQUE,   -- 'Cardio', 'Strength', 'Flexibility', dll.
    ikon    TEXT
);

CREATE TABLE modul_latihan (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul           VARCHAR(200) NOT NULL,
    deskripsi       TEXT,
    kategori_id     INT REFERENCES kategori_latihan(id),
    durasi_menit    INT NOT NULL DEFAULT 30,
    tingkat_kesulitan VARCHAR(20) CHECK (tingkat_kesulitan IN ('Pemula', 'Menengah', 'Lanjutan')),
    instruksi       TEXT,                  -- Panduan langkah demi langkah
    thumbnail_url   TEXT,
    dibuat_oleh     UUID REFERENCES pengguna(id),   -- Admin yang membuat
    is_aktif        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_modul_kategori ON modul_latihan(kategori_id);
CREATE INDEX idx_modul_aktif    ON modul_latihan(is_aktif);


-- Riwayat akses modul latihan oleh mahasiswa
CREATE TABLE riwayat_modul_latihan (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pengguna_id     UUID NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
    modul_id        UUID NOT NULL REFERENCES modul_latihan(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'dimulai'
                    CHECK (status IN ('dimulai', 'selesai')),
    durasi_aktual_menit INT,
    tanggal_akses   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_riwayat_modul_pengguna ON riwayat_modul_latihan(pengguna_id);


-- ============================================================
-- 4. DATA RESERVASI
--    Jadwal sesi gym, reservasi, dan kehadiran via QR Code
-- ============================================================

CREATE TABLE sesi_gym (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_sesi       VARCHAR(100) NOT NULL,          -- Contoh: 'Sesi Pagi Senin'
    tanggal         DATE NOT NULL,
    jam_mulai       TIME NOT NULL,
    jam_selesai     TIME NOT NULL,
    kapasitas_max   INT NOT NULL DEFAULT 15,        -- Maksimal 15 orang per sesi
    dibuat_oleh     UUID REFERENCES pengguna(id),  -- Admin yang membuat jadwal
    is_aktif        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_jam CHECK (jam_selesai > jam_mulai)
);

CREATE INDEX idx_sesi_tanggal ON sesi_gym(tanggal);
CREATE INDEX idx_sesi_aktif   ON sesi_gym(is_aktif);


CREATE TABLE reservasi (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pengguna_id     UUID NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
    sesi_id         UUID NOT NULL REFERENCES sesi_gym(id) ON DELETE CASCADE,
    status          VARCHAR(20) NOT NULL DEFAULT 'menunggu'
                    CHECK (status IN ('menunggu', 'dikonfirmasi', 'dibatalkan', 'hadir', 'tidak_hadir')),
    qr_code_token   TEXT UNIQUE,        -- Token unik untuk QR Code (ISO/IEC 18004)
    qr_code_url     TEXT,               -- URL/path gambar QR Code
    waktu_reservasi TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    waktu_konfirmasi TIMESTAMPTZ,
    waktu_pembatalan TIMESTAMPTZ,
    alasan_batal    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Satu pengguna hanya boleh reservasi satu kali per sesi
    CONSTRAINT uq_reservasi_pengguna_sesi UNIQUE (pengguna_id, sesi_id)
);

CREATE INDEX idx_reservasi_pengguna ON reservasi(pengguna_id);
CREATE INDEX idx_reservasi_sesi     ON reservasi(sesi_id);
CREATE INDEX idx_reservasi_status   ON reservasi(status);
CREATE INDEX idx_reservasi_qr       ON reservasi(qr_code_token);


-- Log verifikasi QR Code saat check-in di gym
CREATE TABLE log_checkin (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservasi_id    UUID NOT NULL REFERENCES reservasi(id) ON DELETE CASCADE,
    waktu_checkin   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metode          VARCHAR(30) DEFAULT 'QR_CODE',
    verified_by     UUID REFERENCES pengguna(id),   -- Admin yang verifikasi (jika manual)
    keterangan      TEXT
);

CREATE INDEX idx_checkin_reservasi ON log_checkin(reservasi_id);


-- ============================================================
-- 5. NOTIFIKASI
--    Riwayat notifikasi email/WhatsApp kepada pengguna
-- ============================================================

CREATE TABLE notifikasi (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pengguna_id     UUID NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
    reservasi_id    UUID REFERENCES reservasi(id),
    tipe            VARCHAR(50) NOT NULL
                    CHECK (tipe IN ('konfirmasi_reservasi', 'pengingat_sesi', 'pembatalan', 'info_kuota', 'umum')),
    channel         VARCHAR(20) NOT NULL
                    CHECK (channel IN ('email', 'whatsapp')),
    judul           VARCHAR(255),
    isi_pesan       TEXT NOT NULL,
    status_kirim    VARCHAR(20) NOT NULL DEFAULT 'menunggu'
                    CHECK (status_kirim IN ('menunggu', 'terkirim', 'gagal')),
    waktu_kirim     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_pengguna ON notifikasi(pengguna_id);
CREATE INDEX idx_notif_status   ON notifikasi(status_kirim);


-- ============================================================
-- 6. AI HEALTH ASSISTANT
--    Riwayat percakapan chatbot kesehatan
-- ============================================================

CREATE TABLE sesi_chatbot (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pengguna_id     UUID NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
    judul_sesi      VARCHAR(255),
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ
);

CREATE TABLE pesan_chatbot (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sesi_id         UUID NOT NULL REFERENCES sesi_chatbot(id) ON DELETE CASCADE,
    pengirim        VARCHAR(10) NOT NULL CHECK (pengirim IN ('user', 'ai')),
    isi_pesan       TEXT NOT NULL,
    token_digunakan INT,            -- Jumlah token AI yang dikonsumsi (untuk monitoring)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pesan_sesi ON pesan_chatbot(sesi_id);


-- ============================================================
-- 7. ACTIVITY LOG (Traceability)
--    Melacak seluruh aktivitas pengguna dalam sistem
-- ============================================================

CREATE TABLE activity_log (
    id              BIGSERIAL PRIMARY KEY,
    pengguna_id     UUID REFERENCES pengguna(id),
    aksi            VARCHAR(100) NOT NULL,   -- Contoh: 'LOGIN', 'BUAT_RESERVASI', 'CHECKIN_QR'
    entitas         VARCHAR(50),             -- Tabel terkait: 'reservasi', 'sesi_gym', dll.
    entitas_id      UUID,
    detail          JSONB,                   -- Data tambahan dalam format JSON
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_log_pengguna   ON activity_log(pengguna_id);
CREATE INDEX idx_log_aksi       ON activity_log(aksi);
CREATE INDEX idx_log_created_at ON activity_log(created_at DESC);


-- ============================================================
-- 8. VIEW: KUOTA SESI (memudahkan monitoring kapasitas)
-- ============================================================

CREATE OR REPLACE VIEW v_kuota_sesi AS
SELECT
    s.id                                        AS sesi_id,
    s.nama_sesi,
    s.tanggal,
    s.jam_mulai,
    s.jam_selesai,
    s.kapasitas_max,
    COUNT(r.id) FILTER (WHERE r.status = 'dikonfirmasi') AS terisi,
    s.kapasitas_max - COUNT(r.id) FILTER (WHERE r.status = 'dikonfirmasi') AS sisa_kuota,
    CASE
        WHEN COUNT(r.id) FILTER (WHERE r.status = 'dikonfirmasi') >= s.kapasitas_max
        THEN TRUE ELSE FALSE
    END                                         AS penuh
FROM sesi_gym s
LEFT JOIN reservasi r ON r.sesi_id = s.id
WHERE s.is_aktif = TRUE
GROUP BY s.id, s.nama_sesi, s.tanggal, s.jam_mulai, s.jam_selesai, s.kapasitas_max;


-- ============================================================
-- 9. FUNCTION: Auto-update kolom updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pengguna_updated_at
    BEFORE UPDATE ON pengguna
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sesi_updated_at
    BEFORE UPDATE ON sesi_gym
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reservasi_updated_at
    BEFORE UPDATE ON reservasi
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_modul_updated_at
    BEFORE UPDATE ON modul_latihan
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 10. FUNCTION: Validasi kuota sebelum konfirmasi reservasi
-- ============================================================

CREATE OR REPLACE FUNCTION validasi_kuota_reservasi()
RETURNS TRIGGER AS $$
DECLARE
    jumlah_terkonfirmasi INT;
    kapasitas            INT;
BEGIN
    -- Hanya validasi saat status berubah menjadi 'dikonfirmasi'
    IF NEW.status = 'dikonfirmasi' THEN
        SELECT kapasitas_max INTO kapasitas
        FROM sesi_gym WHERE id = NEW.sesi_id;

        SELECT COUNT(*) INTO jumlah_terkonfirmasi
        FROM reservasi
        WHERE sesi_id = NEW.sesi_id
          AND status = 'dikonfirmasi'
          AND id <> NEW.id;

        IF jumlah_terkonfirmasi >= kapasitas THEN
            RAISE EXCEPTION 'Sesi sudah penuh. Kapasitas maksimal % peserta telah tercapai.', kapasitas;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validasi_kuota
    BEFORE INSERT OR UPDATE ON reservasi
    FOR EACH ROW EXECUTE FUNCTION validasi_kuota_reservasi();


-- ============================================================
-- 11. DATA AWAL (Seed)
-- ============================================================

-- Kategori latihan dasar
INSERT INTO kategori_latihan (nama, ikon) VALUES
    ('Cardio',       '🏃'),
    ('Strength',     '💪'),
    ('Flexibility',  '🧘'),
    ('HIIT',         '⚡'),
    ('Recovery',     '🛌');
