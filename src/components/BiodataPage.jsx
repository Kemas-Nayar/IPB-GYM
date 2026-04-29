import React, { useState } from 'react';
import nutrigymLogo from '../assets/logo_nutrigymipb.png';
import DatePicker from './DatePicker';
import '../styles/BiodataPage.css';
import '../styles/DatePicker.css';

// ===== SVG ICONS =====
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconMale = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="14" r="5"/>
    <path d="M19 5l-5.5 5.5M15 5h4v4"/>
  </svg>
);

const IconFemale = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5"/>
    <path d="M12 13v8M9 18h6"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);

const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7"/>
  </svg>
);

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <path d="M22 6l-10 7L2 6"/>
  </svg>
);

const IconPhone = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
  </svg>
);

const IconWeight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4l3 3"/>
  </svg>
);

const IconHeight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);

// ===== HELPERS =====
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const formatDate = (date) => {
  if (!date) return '';
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return ''; }
};

const getBmiCategory = (bmi) => {
  const val = parseFloat(bmi);
  if (val < 18.5) return { label: 'Kurus',    color: '#2F5DAA', bg: '#EEF3FF', range: '< 18.5' };
  if (val < 25)   return { label: 'Normal',   color: '#27AE60', bg: '#EDFFF5', range: '18.5 – 24.9' };
  if (val < 30)   return { label: 'Gemuk',    color: '#F2994A', bg: '#FFF5EB', range: '25 – 29.9' };
  return           { label: 'Obesitas', color: '#C8102E', bg: '#FFEEEE', range: '≥ 30' };
};

// ===== COMPONENT =====
// initialData: dikirim dari App.jsx (biodataTemp) saat user balik dari ConfirmPage
const BiodataPage = ({ onNavigate, user, initialData }) => {
  const [namaLengkap, setNamaLengkap]       = useState(initialData?.namaLengkap || '');
  const [gender, setGender]                 = useState(initialData?.gender || null);
  const [tanggalLahir, setTanggalLahir]     = useState(() => {
    if (!initialData?.tanggalLahir) return null;
    const d = initialData.tanggalLahir instanceof Date
      ? initialData.tanggalLahir
      : new Date(initialData.tanggalLahir);
    return isNaN(d.getTime()) ? null : d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail]                   = useState(initialData?.email || user?.email || '');
  const [nomorTelepon, setNomorTelepon]     = useState(initialData?.nomorTelepon || '');
  const [berat, setBerat]                   = useState(initialData?.berat ? String(initialData.berat) : '');
  const [tinggi, setTinggi]                 = useState(initialData?.tinggi ? String(initialData.tinggi) : '');
  const [errors, setErrors]                 = useState({});

  const clearError = (field) => setErrors(prev => ({ ...prev, [field]: '' }));

  const validate = () => {
    const e = {};
    if (!namaLengkap.trim())              e.namaLengkap  = 'Nama lengkap wajib diisi';
    if (!gender)                           e.gender       = 'Pilih jenis kelamin';
    if (!tanggalLahir)                     e.tanggalLahir = 'Pilih tanggal lahir';
    if (!email.trim())                     e.email        = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email        = 'Format email tidak valid';
    if (!berat)                            e.berat        = 'Berat badan wajib diisi';
    else if (parseFloat(berat) <= 0)       e.berat        = 'Berat harus lebih dari 0';
    else if (parseFloat(berat) > 300)      e.berat        = 'Berat tidak valid (maks 300kg)';
    if (!tinggi)                           e.tinggi       = 'Tinggi badan wajib diisi';
    else if (parseFloat(tinggi) <= 0)      e.tinggi       = 'Tinggi harus lebih dari 0';
    else if (parseFloat(tinggi) > 300)     e.tinggi       = 'Tinggi tidak valid (maks 300cm)';
    return e;
  };

  // ── Tidak simpan ke Supabase — navigasi ke ConfirmPage dulu ──
  const handleNext = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTimeout(() => {
        const el = document.querySelector('.bio-error-msg');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    onNavigate('confirm', {
      userId:       user.id,
      namaLengkap:  namaLengkap.trim(),
      gender,
      tanggalLahir,
      email:        email.trim(),
      nomorTelepon: nomorTelepon || null,
      berat:        parseFloat(berat),
      tinggi:       parseFloat(tinggi),
    });
  };

  const bmi = berat && tinggi && parseFloat(berat) > 0 && parseFloat(tinggi) > 0
    ? (parseFloat(berat) / Math.pow(parseFloat(tinggi) / 100, 2)).toFixed(1)
    : null;
  const bmiInfo = bmi ? getBmiCategory(bmi) : null;

  const ErrorMsg = ({ field }) => errors[field]
    ? <p className="bio-error-msg" role="alert"><span aria-hidden="true">!</span> {errors[field]}</p>
    : null;

  return (
    <div className="biodata-page">

      <div className="biodata-header">
        <button className="biodata-back-btn" onClick={() => onNavigate('login')} aria-label="Kembali">
          <IconBack /> Kembali
        </button>
        <img src={nutrigymLogo} alt="NutriGym" className="biodata-logo" />
      </div>

      <div className="biodata-progress" aria-label="Langkah 1 dari 2">
        <div className="biodata-progress-track">
          <div className="biodata-progress-fill" />
        </div>
        <span className="biodata-progress-label">Langkah 1 dari 2</span>
      </div>

      <h1 className="biodata-title">Isi Biodata</h1>
      <p className="biodata-subtitle">
        Lengkapi data diri untuk mendapatkan program yang personal
      </p>

      {errors.submit && (
        <div className="bio-submit-error" role="alert">{errors.submit}</div>
      )}

      {/* INFORMASI PRIBADI */}
      <div className="bio-card">
        <div className="bio-card-header">
          <div className="bio-card-icon"><IconUser /></div>
          <span className="bio-card-label">Informasi Pribadi</span>
        </div>
        <div className="bio-card-body">
          <div className={`bio-input-row ${errors.namaLengkap ? 'has-error' : namaLengkap ? 'has-value' : ''}`}>
            <IconUser />
            <input type="text" placeholder="Nama Lengkap" value={namaLengkap}
              onChange={(e) => { setNamaLengkap(e.target.value); clearError('namaLengkap'); }}
              className="bio-input" autoComplete="name" />
            {namaLengkap && !errors.namaLengkap && <IconCheck />}
          </div>
          <ErrorMsg field="namaLengkap" />

          <div className="bio-gender-row">
            <button type="button"
              className={`bio-gender-btn ${gender === 'laki-laki' ? 'selected' : ''} ${errors.gender ? 'has-error' : ''}`}
              onClick={() => { setGender('laki-laki'); clearError('gender'); }}
              aria-pressed={gender === 'laki-laki'}>
              <IconMale active={gender === 'laki-laki'} /> Laki-laki
            </button>
            <button type="button"
              className={`bio-gender-btn ${gender === 'perempuan' ? 'selected' : ''} ${errors.gender ? 'has-error' : ''}`}
              onClick={() => { setGender('perempuan'); clearError('gender'); }}
              aria-pressed={gender === 'perempuan'}>
              <IconFemale active={gender === 'perempuan'} /> Perempuan
            </button>
          </div>
          <ErrorMsg field="gender" />

          <button type="button"
            className={`bio-date-row ${errors.tanggalLahir ? 'has-error' : tanggalLahir ? 'has-value' : ''}`}
            onClick={() => setShowDatePicker(true)}>
            <div className="bio-date-left">
              <IconCalendar />
              <span className={tanggalLahir ? 'bio-date-value' : 'bio-date-placeholder'}>
                {tanggalLahir ? formatDate(tanggalLahir) : 'Pilih Tanggal Lahir'}
              </span>
            </div>
            <IconChevronRight />
          </button>
          <ErrorMsg field="tanggalLahir" />
        </div>
      </div>

      {/* KONTAK */}
      <div className="bio-card">
        <div className="bio-card-header">
          <div className="bio-card-icon"><IconMail /></div>
          <span className="bio-card-label">Kontak</span>
        </div>
        <div className="bio-card-body">
          <div className={`bio-input-row ${errors.email ? 'has-error' : email && !errors.email ? 'has-value' : ''}`}>
            <IconMail />
            <input type="email" placeholder="Alamat Email" value={email}
              onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
              className="bio-input" autoComplete="email" inputMode="email" />
            {email && !errors.email && /\S+@\S+\.\S+/.test(email) && <IconCheck />}
          </div>
          <ErrorMsg field="email" />

          <div className="bio-input-row bio-optional-row">
            <IconPhone />
            <input type="tel" placeholder="Nomor Telepon" value={nomorTelepon}
              onChange={(e) => setNomorTelepon(e.target.value)}
              className="bio-input" autoComplete="tel" inputMode="tel" />
            <span className="bio-optional-badge">Opsional</span>
          </div>
        </div>
      </div>

      {/* DATA FISIK */}
      <div className="bio-card">
        <div className="bio-card-header">
          <div className="bio-card-icon"><IconHeight /></div>
          <span className="bio-card-label">Data Fisik</span>
        </div>
        <div className="bio-card-body">
          <div className="bio-fisik-row">
            <div className="bio-fisik-col">
              <div className={`bio-input-row bio-fisik-input ${errors.berat ? 'has-error' : berat ? 'has-value' : ''}`}>
                <IconWeight />
                <input type="number" placeholder="Berat (kg)" value={berat}
                  onChange={(e) => { setBerat(e.target.value); clearError('berat'); }}
                  className="bio-input" min="1" max="300" inputMode="decimal" />
              </div>
              <ErrorMsg field="berat" />
            </div>
            <div className="bio-fisik-col">
              <div className={`bio-input-row bio-fisik-input ${errors.tinggi ? 'has-error' : tinggi ? 'has-value' : ''}`}>
                <IconHeight />
                <input type="number" placeholder="Tinggi (cm)" value={tinggi}
                  onChange={(e) => { setTinggi(e.target.value); clearError('tinggi'); }}
                  className="bio-input" min="1" max="300" inputMode="decimal" />
              </div>
              <ErrorMsg field="tinggi" />
            </div>
          </div>

          {bmi && bmiInfo && (
            <div className="bio-bmi-preview" style={{ background: bmiInfo.bg }}>
              <div className="bio-bmi-preview-left">
                <p className="bio-bmi-label">BMI Kamu</p>
                <p className="bio-bmi-value" style={{ color: bmiInfo.color }}>{bmi}</p>
                <p className="bio-bmi-range" style={{ color: bmiInfo.color }}>Normal: 18.5 – 24.9</p>
              </div>
              <div className="bio-bmi-right">
                <span className="bio-bmi-badge" style={{ background: bmiInfo.color }}>{bmiInfo.label}</span>
                <p className="bio-bmi-range-badge" style={{ color: bmiInfo.color }}>{bmiInfo.range}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <button type="button" className="bio-submit-btn" onClick={handleNext}>
        Lanjut ke Konfirmasi →
      </button>

      <button type="button" className="bio-cancel-btn" onClick={() => onNavigate('login')}>
        Batalkan
      </button>

      {showDatePicker && (
        <DatePicker value={tanggalLahir}
          onCancel={() => setShowDatePicker(false)}
          onDone={(date) => { setTanggalLahir(date); clearError('tanggalLahir'); setShowDatePicker(false); }}
        />
      )}
    </div>
  );
};

export default BiodataPage;