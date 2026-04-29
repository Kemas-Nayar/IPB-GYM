import React from 'react';
import '../styles/GantiAkunPage.css';

const GantiAkunPage = ({ onNavigate, user, profile }) => {
  const userName = profile?.nama_lengkap || user?.email?.split('@')[0] || 'User';
  const userEmail = profile?.email || user?.email || '';
  const avatarInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="ga-page">
      {/* Header */}
      <div className="ga-header">
        <button className="ga-back" onClick={() => onNavigate('profile')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="ga-title">Ganti Akun</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Akun Section */}
      <div className="ga-section-label">Akun Tersimpan</div>

      <div className="ga-card">
        {/* Akun aktif */}
        <div className="ga-account-item">
          <div className="ga-avatar">{avatarInitial}</div>
          <div className="ga-info">
            <p className="ga-name">{userName}</p>
            <p className="ga-email">{userEmail}</p>
          </div>
          <div className="ga-active-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Aktif</span>
          </div>
        </div>

        <div className="ga-divider" />

        {/* Tambah akun */}
        <button className="ga-add-item" onClick={() => onNavigate('signup')}>
          <div className="ga-add-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <span className="ga-add-label">Tambahkan Akun</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round">
            <path d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {/* Info */}
      <p className="ga-info-text">
        Kamu bisa login dengan akun berbeda tanpa keluar dari akun ini.
      </p>
    </div>
  );
};

export default GantiAkunPage;