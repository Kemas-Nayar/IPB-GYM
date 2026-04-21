import React from 'react';
import { supabase } from '../supabase';
import '../styles/SubPage.css';

const GantiAkunPage = ({ onNavigate, user, profile }) => {
  const userName = profile?.nama_lengkap || user?.email?.split('@')[0] || 'User';
  const userEmail = profile?.email || user?.email || '';
  const avatarInitial = userName.charAt(0).toUpperCase();

  const handleAddAccount = () => {
    onNavigate('signup');
  };

  return (
    <div className="subpage" style={{ background: '#fdf0f0' }}>
      <div className="subpage-header">
        <button className="subpage-back" onClick={() => onNavigate('profile')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="subpage-title">Ganti Akun</span>
        <div style={{ width: 60 }} />
      </div>

      <div className="gantiakun-banner" />

      <div className="gantiakun-group">
        {/* Akun aktif */}
        <div className="gantiakun-item">
          <div className="gantiakun-avatar">{avatarInitial}</div>
          <div className="gantiakun-info">
            <p className="gantiakun-name">{userName}</p>
            <p className="gantiakun-email">{userEmail}</p>
          </div>
          <div className="gantiakun-active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span>Saat Ini</span>
          </div>
        </div>

        <div className="setting-divider" />

        {/* Tambah akun */}
        <button className="gantiakun-item" onClick={handleAddAccount}>
          <div className="gantiakun-add-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="gantiakun-add-label">Tambahkan Akun</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GantiAkunPage;