import React, { useState } from 'react';
import { supabase } from '../supabase';
import nutrigymLogo from '../assets/logo_nutrigymipb.png';
import '../styles/ConfirmPage.css';

// ===== ICONS =====
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconCheckWhite = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const Spinner = () => (
  <svg className="confirm-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
  </svg>
);

// ===== HELPERS =====
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const formatDate = (date) => {
  if (!date) return '-';
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '-';
    return `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return '-';
  }
};

const getBmiInfo = (bmi) => {
  const v = parseFloat(bmi);
  if (isNaN(v))  return { label: '-',       color: '#aaa',    bg: '#f5f5f5' };
  if (v < 18.5)  return { label: 'Kurus',   color: '#2F5DAA', bg: '#EEF3FF' };
  if (v < 25)    return { label: 'Normal',  color: '#27AE60', bg: '#EDFFF5' };
  if (v < 30)    return { label: 'Gemuk',   color: '#F2994A', bg: '#FFF5EB' };
  return          { label: 'Obesitas', color: '#C8102E', bg: '#FFEEEE' };
};

// ===== COMPONENT =====
const ConfirmPage = ({ onNavigate, biodata }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  // ── GUARD: biodata null → redirect balik ke biodata ──
  if (!biodata) {
    // Pakai setTimeout agar tidak setState saat render
    setTimeout(() => onNavigate('biodata'), 0);
    return null;
  }

  const {
    userId,
    namaLengkap  = '',
    gender       = '',
    tanggalLahir = null,
    email        = '',
    nomorTelepon = null,
    berat        = 0,
    tinggi       = 0,
  } = biodata;

  const bmi = berat && tinggi && berat > 0 && tinggi > 0
    ? (berat / Math.pow(tinggi / 100, 2)).toFixed(1)
    : null;
  const bmiInfo = bmi ? getBmiInfo(bmi) : null;

  const handleConfirm = async () => {
    setIsLoading(true);
    setError('');
    try {
      const tanggalStr = tanggalLahir instanceof Date
        ? tanggalLahir.toISOString().split('T')[0]
        : tanggalLahir
          ? new Date(tanggalLahir).toISOString().split('T')[0]
          : null;

      const { error: err } = await supabase.from('profiles').upsert({
        id:            userId,
        nama_lengkap:  namaLengkap,
        gender,
        tanggal_lahir: tanggalStr,
        email,
        nomor_telepon: nomorTelepon || null,
        berat_kg:      berat,
        tinggi_cm:     tinggi,
        updated_at:    new Date().toISOString(),
      });
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => onNavigate('home'), 1400);
    } catch (err) {
      console.error(err);
      setError('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const Row = ({ label, value }) => (
    <div className="confirm-row">
      <span className="confirm-row-label">{label}</span>
      <span className="confirm-row-value">{value || '-'}</span>
    </div>
  );

  return (
    <div className="confirm-page">

      <div className="confirm-header">
        <button className="confirm-back-btn" onClick={() => onNavigate('biodata')} aria-label="Kembali edit">
          <IconBack /> Ubah Data
        </button>
        <img src={nutrigymLogo} alt="NutriGym" className="confirm-logo" />
      </div>

      <div className="confirm-progress" aria-label="Langkah 2 dari 2">
        <div className="confirm-progress-track">
          <div className="confirm-progress-fill" />
        </div>
        <span className="confirm-progress-label">Langkah 2 dari 2</span>
      </div>

      <h1 className="confirm-title">Konfirmasi Data</h1>
      <p className="confirm-subtitle">Pastikan semua data sudah benar sebelum disimpan</p>

      {error && <div className="confirm-error" role="alert">{error}</div>}

      {/* Identitas */}
      <div className="confirm-card">
        <div className="confirm-card-header">
          <span className="confirm-card-label">Identitas</span>
          <button className="confirm-edit-btn" onClick={() => onNavigate('biodata')}>
            <IconEdit /> Edit
          </button>
        </div>
        <div className="confirm-card-body">
          <Row label="Nama Lengkap"  value={namaLengkap} />
          <Row label="Jenis Kelamin" value={gender === 'laki-laki' ? '♂ Laki-laki' : gender === 'perempuan' ? '♀ Perempuan' : '-'} />
          <Row label="Tanggal Lahir" value={formatDate(tanggalLahir)} />
          <Row label="Email"         value={email} />
          {nomorTelepon && <Row label="No. Telepon" value={nomorTelepon} />}
        </div>
      </div>

      {/* Data Fisik */}
      <div className="confirm-card">
        <div className="confirm-card-header">
          <span className="confirm-card-label">Data Fisik</span>
          <button className="confirm-edit-btn" onClick={() => onNavigate('biodata')}>
            <IconEdit /> Edit
          </button>
        </div>
        <div className="confirm-card-body">
          <Row label="Berat Badan"  value={berat ? `${berat} kg` : '-'} />
          <Row label="Tinggi Badan" value={tinggi ? `${tinggi} cm` : '-'} />
          {bmi && bmiInfo && (
            <div className="confirm-bmi" style={{ background: bmiInfo.bg }}>
              <div className="confirm-bmi-left">
                <span className="confirm-bmi-label">Indeks Massa Tubuh</span>
                <span className="confirm-bmi-value" style={{ color: bmiInfo.color }}>{bmi}</span>
              </div>
              <span className="confirm-bmi-badge" style={{ background: bmiInfo.color }}>
                {bmiInfo.label}
              </span>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className={`confirm-submit-btn ${success ? 'success' : ''}`}
        onClick={handleConfirm}
        disabled={isLoading || success}
      >
        {isLoading ? (
          <><Spinner /> Menyimpan...</>
        ) : success ? (
          <><IconCheckWhite /> Tersimpan!</>
        ) : (
          'Simpan & Mulai →'
        )}
      </button>

      <button
        type="button"
        className="confirm-cancel-btn"
        onClick={() => onNavigate('biodata')}
        disabled={isLoading}
      >
        Kembali & Ubah Data
      </button>

    </div>
  );
};

export default ConfirmPage;