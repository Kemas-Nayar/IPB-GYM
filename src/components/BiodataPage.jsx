import React, { useState } from 'react';
import nutrigymLogo from '../assets/logo_nutrigymipb.png';
import DatePicker from './DatePicker';
import { supabase } from '../supabase';
import '../styles/BiodataPage.css';
import '../styles/DatePicker.css';

const BiodataPage = ({ onNavigate, user }) => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [gender, setGender] = useState(null);
  const [tanggalLahir, setTanggalLahir] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState('');
  const [nomorTelepon, setNomorTelepon] = useState('');
  const [berat, setBerat] = useState('');
  const [tinggi, setTinggi] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const formatDate = (date) =>
    `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

  const handleSubmit = async () => {
    if (!namaLengkap || !gender || !tanggalLahir || !email || !berat || !tinggi) {
      alert('Mohon lengkapi semua data!');
      return;
    }
    if (parseFloat(berat) <= 0 || parseFloat(tinggi) <= 0) {
      alert('Berat dan tinggi harus lebih dari 0!');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nama_lengkap: namaLengkap,
          gender: gender,
          tanggal_lahir: tanggalLahir.toISOString().split('T')[0],
          email: email,
          nomor_telepon: nomorTelepon,
          berat_kg: parseFloat(berat),
          tinggi_cm: parseFloat(tinggi),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving biodata:', error);
        alert('Gagal menyimpan data: ' + error.message);
        return;
      }

      onNavigate('home');

    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Terjadi kesalahan, coba lagi!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="biodata-page">

      <div className="biodata-logo-wrap">
        <img src={nutrigymLogo} alt="NutriGym" className="biodata-logo" />
      </div>

      <h1 className="biodata-title">Isi Biodata</h1>

      {/* === INFORMASI PRIBADI === */}
      <div className="bio-card">
        <div className="bio-card-header">
          <div className="bio-card-icon icon-amber">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="8" r="4" />
              <path d="M12 14c-6 0-8 3-8 6v2h16v-2c0-3-2-6-8-6z" />
            </svg>
          </div>
          <span className="bio-card-label">Informasi Pribadi</span>
        </div>
        <div className="bio-card-body">
          <div className="bio-input-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#aaa">
              <circle cx="12" cy="8" r="4" />
              <path d="M12 14c-6 0-8 3-8 6v2h16v-2c0-3-2-6-8-6z" />
            </svg>
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              className="bio-input"
            />
          </div>
          <div className="bio-gender-row">
            <button
              className={`bio-gender-btn ${gender === 'laki-laki' ? 'selected' : ''}`}
              onClick={() => setGender('laki-laki')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C9.8 2 8 3.8 8 6s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 10c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" />
              </svg>
              Laki-laki
            </button>
            <button
              className={`bio-gender-btn ${gender === 'perempuan' ? 'selected' : ''}`}
              onClick={() => setGender('perempuan')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C9.8 2 8 3.8 8 6s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-1 10v2H9v2h2v4h2v-4h2v-2h-2v-2c3.3 0 5 1.7 5 3v1H7v-1c0-1.3 1.7-3 5-3z" />
              </svg>
              Perempuan
            </button>
          </div>
          <button className="bio-date-row" onClick={() => setShowDatePicker(true)}>
            <div className="bio-date-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className={tanggalLahir ? 'bio-date-value' : 'bio-date-placeholder'}>
                {tanggalLahir ? formatDate(tanggalLahir) : 'Tanggal Lahir'}
              </span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* === KONTAK === */}
      <div className="bio-card">
        <div className="bio-card-header">
          <div className="bio-card-icon icon-amber">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="bio-card-label">Kontak</span>
        </div>
        <div className="bio-card-body">
          <div className="bio-input-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
              <path d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bio-input"
            />
          </div>
          <div className="bio-input-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
            </svg>
            <input
              type="tel"
              placeholder="Nomor Telepon"
              value={nomorTelepon}
              onChange={(e) => setNomorTelepon(e.target.value)}
              className="bio-input"
            />
          </div>
        </div>
      </div>

      {/* === FISIK === */}
      <div className="bio-card">
        <div className="bio-card-header">
          <div className="bio-card-icon icon-orange">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="bio-card-label">Fisik</span>
        </div>
        <div className="bio-card-body">
          <div className="bio-fisik-row">
            <div className="bio-input-row bio-fisik-input">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              <input
                type="number"
                placeholder="Berat (kg)"
                value={berat}
                onChange={(e) => setBerat(e.target.value)}
                className="bio-input"
                min="0"
              />
            </div>
            <div className="bio-input-row bio-fisik-input">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              <input
                type="number"
                placeholder="Tinggi (cm)"
                value={tinggi}
                onChange={(e) => setTinggi(e.target.value)}
                className="bio-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        className="bio-submit-btn"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? 'Menyimpan...' : 'Submit'}
      </button>

      {/* Batalkan */}
      <button
        className="bio-cancel-btn"
        onClick={() => onNavigate('signup')}
        disabled={isLoading}
      >
        Batalkan
      </button>

      {/* DATE PICKER */}
      {showDatePicker && (
        <DatePicker
          value={tanggalLahir}
          onCancel={() => setShowDatePicker(false)}
          onDone={(date) => {
            setTanggalLahir(date);
            setShowDatePicker(false);
          }}
        />
      )}

    </div>
  );
};

export default BiodataPage;