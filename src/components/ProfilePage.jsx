import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import '../styles/ProfilePage.css';

const menuItems = [
  { icon: '👤', label: 'Informasi Pribadi', page: 'personal-info' },
  { icon: '📅', label: 'Riwayat Reservasi', page: 'riwayat-reservasi' },
  { icon: '❓', label: 'FAQ & Help Center', page: 'faq' },
  { icon: '⚙️', label: 'Pengaturan', page: 'pengaturan' },
];

const ProfilePage = ({ onNavigate, user }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('nama_lengkap, email')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, [user]);

  const userName = profile?.nama_lengkap || user?.email?.split('@')[0] || 'User';
  const userEmail = profile?.email || user?.email || '';
  const avatarInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="profile-page">

      {/* Header */}
      <div className="profile-header">
        <button className="profile-back" onClick={() => onNavigate('home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="profile-header-title">Profile</span>
        <div style={{ width: 24 }} />
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-banner" />
        <div className="profile-info">
          <div className="profile-avatar">{avatarInitial}</div>
          <div>
            <p className="profile-name">{userName}</p>
            <p className="profile-email">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Setting Menu */}
      <div className="profile-section-label">Setting</div>
      <div className="profile-menu-group">
        {menuItems.map((item, i) => (
          <button
            key={i}
            className="profile-menu-item"
            onClick={() => item.page && onNavigate(item.page)}
          >
            <span className="profile-menu-icon">{item.icon}</span>
            <span className="profile-menu-label">{item.label}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
      </div>

      {/* Ganti Akun */}
      <div className="profile-menu-group">
        <button
          className="profile-menu-item"
          onClick={() => onNavigate('ganti-akun')}
        >
          <span className="profile-menu-icon">🔄</span>
          <span className="profile-menu-label">Ganti Akun</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Logout */}
      <div className="profile-menu-group">
        <button
          className="profile-menu-item logout"
          onClick={() => onNavigate('logout')}
        >
          <span className="profile-menu-icon red">🚪</span>
          <span className="profile-menu-label red">Keluar dari akun</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

    </div>
  );
};

export default ProfilePage;