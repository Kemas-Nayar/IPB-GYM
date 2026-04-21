import React, { useState } from 'react';
import '../styles/SubPage.css';

const PengaturanPage = ({ onNavigate }) => {
  const [notifOn, setNotifOn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="subpage" style={{ background: '#fdf0f0' }}>
      <div className="subpage-header">
        <button className="subpage-back" onClick={() => onNavigate('profile')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="subpage-title">Pengaturan</span>
        <div style={{ width: 60 }} />
      </div>

      <div className="setting-banner" />

      <div className="setting-menu-group">
        {/* Notifikasi */}
        <div className="setting-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="setting-label">Notifikasi</span>
          <div
            className={`toggle ${notifOn ? 'toggle-on' : ''}`}
            onClick={() => setNotifOn(!notifOn)}
          >
            <div className="toggle-thumb" />
          </div>
        </div>

        <div className="setting-divider" />

        {/* Bahasa */}
        <div className="setting-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
          </svg>
          <span className="setting-label">Bahasa</span>
          <div className="setting-value-row">
            <span className="setting-value">Indonesia</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="setting-divider" />

        {/* Mode Gelap */}
        <div className="setting-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8">
            <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <span className="setting-label">Mode Gelap</span>
          <div
            className={`toggle ${darkMode ? 'toggle-on' : ''}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            <div className="toggle-thumb" />
          </div>
        </div>

        <div className="setting-divider" />

        {/* Tentang Kami */}
        <div className="setting-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01" strokeLinecap="round"/>
          </svg>
          <span className="setting-label">Tentang Kami</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default PengaturanPage;