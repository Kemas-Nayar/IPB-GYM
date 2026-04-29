import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import nutrigymLogo from '../assets/logo_nutrigymipb.png';
import '../styles/HomePage.css';

const HomePage = ({ onNavigate, user }) => {
  const [profile, setProfile] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [workoutData] = useState([
    { day: 'Sun', value: 22 },
    { day: 'Mon', value: 36 },
    { day: 'Tue', value: 45 },
    { day: 'Wed', value: 57 },
    { day: 'Thu', value: 48 },
    { day: 'Fri', value: 59 },
  ]);
  const [videoProgress] = useState({
    completed: 7,
    total: 10,
  });

  const progressPct = Math.round((videoProgress.completed / videoProgress.total) * 100);

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

    const fetchReservation = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(1)
        .single();

      if (data) setReservation(data);
    };

    fetchProfile();
    fetchReservation();
  }, [user]);

  const formatReservationDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const firstName = profile?.nama_lengkap?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const avatarInitial = firstName.charAt(0).toUpperCase();

  const handleAdminLogin = () => {
    const pin = prompt("🔒 Masukkan PIN Admin:");

    if (pin === "ipb123") {
      onNavigate('admin'); 
    } else if (pin !== null) {
      alert("❌ PIN Salah! Akses ditolak.");
    }
  };

  return (
    <div className="home-page">

      {/* Header */}
      <div className="home-header">
        <div className="home-header-left">
          <img src={nutrigymLogo} alt="NutriGym" className="home-logo" />
          <div className="home-header-text">
            <h2 className="home-greeting">Hello, {firstName}! 👋</h2>
            <p className="home-subtitle">Yuk olahraga bareng aku!</p>
          </div>
        </div>
        <div className="home-header-right">
          <button className="home-bell-btn" onClick={() => onNavigate('notifications')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="home-avatar" onClick={() => onNavigate('profile')}>
            {avatarInitial}
          </div>
        </div>
      </div>

      {/* Quick Menu */}
      <div className="home-quick-menu">
        <button className="quick-menu-btn" onClick={() => onNavigate('health-assistant')}>
          <span className="quick-menu-icon">🤖</span>
          <span>Health Assistant</span>
        </button>
        <button className="quick-menu-btn" onClick={() => onNavigate('gym-reservation')}>
          <span className="quick-menu-icon">📋</span>
          <span>Gym Reservation</span>
        </button>
        <button className="quick-menu-btn" onClick={() => onNavigate('health-module')}>
          <span className="quick-menu-icon">💪</span>
          <span>Health Module</span>
        </button>
      </div>

      {/* Dashboard Bar */}
      <div className="home-dashboard-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        <span>Dashboard kamu!</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v2M12 20v2M20 12h2M2 12h2M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/>
        </svg>
      </div>

      {/* Cards Grid */}
      <div className="home-cards">

        {/* Aktivitas Latihan */}
        <div className="home-card card-wide">
          <h3 className="card-title red">Aktivitas Latihan</h3>
          <div className="workout-badge">57k</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={workoutData}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#aaa' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#aaa' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#F2C94C"
                strokeWidth={2}
                dot={{ r: 3, fill: '#F2C94C' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Reservasiku */}
        <div className="home-card card-half">
          <h3 className="card-title red">Reservasiku</h3>
          {reservation ? (
            <>
              <div className="reservation-info">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                <div>
                  <p className="reservation-date">
                    {formatReservationDate(reservation.date)}
                  </p>
                  <p className="reservation-time">
                    {reservation.start_time?.slice(0, 5)} - {reservation.end_time?.slice(0, 5)}
                  </p>
                </div>
              </div>
              <button
                className="reservation-btn"
                onClick={() => onNavigate('riwayat-reservasi')}
              >
                Klik untuk detail
              </button>
            </>
          ) : (
            <p className="empty-state">Belum ada reservasi</p>
          )}
        </div>

        {/* Video Terselesaikan */}
        <div className="home-card card-half">
          <h3 className="card-title red">Video Terselesaikan</h3>
          <div className="progress-bar-wrap">
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="progress-pct">{progressPct}%</span>
          </div>
          <p className="progress-label">
            {videoProgress.completed} dari {videoProgress.total} video selesai
          </p>
        </div>

        {/* Topik Trending */}
        <div className="home-card card-half">
          <h3 className="card-title red">Topik Trending</h3>
          <div className="trending-grid">
            <div className="trending-img-wrap">
              <span className="trending-img-placeholder">🏋️</span>
            </div>
            <div className="trending-img-wrap">
              <span className="trending-img-placeholder">🤸</span>
            </div>
          </div>
        </div>

        {/* Tips Lainnya */}
        <div className="home-card card-half">
          <h3 className="card-title red">Tips Lainnya</h3>
          <div className="tips-list">
            <button className="tips-btn">🍒 Tips Diet</button>
            <button className="tips-btn">💪 Latihan</button>
            <button className="tips-btn">💤 Tidur</button>
          </div>
        </div>

      </div> {/* Ini adalah penutup div "home-cards" */}

      {/* Tepat di bawah penutup home-cards, TAMBAHKAN KODE INI: */}
      <div style={{ textAlign: 'center', marginTop: '30px', paddingBottom: '30px' }}>
        <button 
          onClick={handleAdminLogin} 
          style={{
            background: 'transparent',
            border: 'none',
            color: '#cbd5e0',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          Masuk sebagai Admin
        </button>
      </div>

    </div> // Ini adalah penutup div "home-page"
  );
};

export default HomePage;
