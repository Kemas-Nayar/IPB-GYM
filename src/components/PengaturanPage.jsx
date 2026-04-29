import React, { useState } from 'react';
import '../styles/PengaturanPage.css';

const PengaturanPage = ({ onNavigate }) => {
  const [notifOn, setNotifOn] = useState(() =>
    localStorage.getItem('pref_notif') === 'true'
  );
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('pref_dark') === 'true'
  );
  const [showAbout, setShowAbout] = useState(false);

  const handleToggleNotif = () => {
    const next = !notifOn;
    setNotifOn(next);
    localStorage.setItem('pref_notif', String(next));
  };

  const handleToggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('pref_dark', String(next));
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  return (
    <div className="pg-page">

      {/* Header */}
      <div className="pg-header">
        <button className="pg-back" onClick={() => onNavigate('profile')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="pg-title">Pengaturan</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Preferensi Section */}
      <div className="pg-section-label">Preferensi</div>
      <div className="pg-card">

        {/* Notifikasi */}
        <div className="pg-item">
          <div className="pg-item-icon" style={{ background: '#FFF0F0' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </div>
          <div className="pg-item-info">
            <p className="pg-item-label">Notifikasi</p>
            <p className="pg-item-desc">Push notification & reminder</p>
          </div>
          <div
            className={`pg-toggle ${notifOn ? 'pg-toggle-on' : ''}`}
            onClick={handleToggleNotif}
          >
            <div className="pg-toggle-thumb" />
          </div>
        </div>

        <div className="pg-divider" />

        {/* Bahasa */}
        <div className="pg-item">
          <div className="pg-item-icon" style={{ background: '#F0F4FF' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F5DAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
            </svg>
          </div>
          <div className="pg-item-info">
            <p className="pg-item-label">Bahasa</p>
            <p className="pg-item-desc">Pilih bahasa tampilan</p>
          </div>
          <div className="pg-item-value-row">
            <span className="pg-item-value">Indonesia</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round">
              <path d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>

        <div className="pg-divider" />

        {/* Mode Gelap */}
        <div className="pg-item">
          <div className="pg-item-icon" style={{ background: '#F5F0FF' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          </div>
          <div className="pg-item-info">
            <p className="pg-item-label">Mode Gelap</p>
            <p className="pg-item-desc">Tampilan gelap untuk mata</p>
          </div>
          <div
            className={`pg-toggle ${darkMode ? 'pg-toggle-on' : ''}`}
            onClick={handleToggleDark}
          >
            <div className="pg-toggle-thumb" />
          </div>
        </div>

      </div>

      {/* Info Section */}
      <div className="pg-section-label">Informasi</div>
      <div className="pg-card">

        {/* Tentang Kami */}
        <button className="pg-item pg-item-btn" onClick={() => setShowAbout(!showAbout)}>
          <div className="pg-item-icon" style={{ background: '#F0FFF4' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <div className="pg-item-info">
            <p className="pg-item-label">Tentang Kami</p>
            <p className="pg-item-desc">Info aplikasi & tim</p>
          </div>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round"
            style={{ transform: showAbout ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
          >
            <path d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        {showAbout && (
          <div className="pg-about-panel">
            <div className="pg-about-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Jl. Raya Dramaga, Kampus IPB Dramaga, Bogor</span>
            </div>
            <div className="pg-about-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="M22 6l-10 7L2 6"/>
              </svg>
              <span>gymgizi@gmail.com</span>
            </div>
            <div className="pg-about-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01"/>
              </svg>
              <span>@nutrigymipb</span>
            </div>
          </div>
        )}

      </div>

      {/* Version */}
      <div className="pg-version">
        <div className="pg-version-dot" />
        <span>NutriGym IPB v1.0.0</span>
      </div>

    </div>
  );
};

export default PengaturanPage;