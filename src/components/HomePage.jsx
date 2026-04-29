import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from 'recharts';
import nutrigymLogo from '../assets/logo_nutrigymipb.png';
import healthAssistantLogo from '../assets/health_assistant.png';
import gymReservationLogo from '../assets/gym_reservation.png';
import healthModuleLogo from '../assets/health_module.png';
import '../styles/HomePage.css';

// ===== STATIC DATA =====
const ARTICLES = [
  { id: 1, title: "HIIT for Beginners", category: "HIIT", views: 900, desc: "Start your HIIT journey with these foundational moves." },
  { id: 2, title: "Yoga Recovery", category: "Yoga", views: 1200, desc: "How yoga helps your body recover faster after workouts." },
  { id: 3, title: "Cardio vs Strength", category: "Cardio", views: 850, desc: "Which is better for your fitness goals?" },
  { id: 4, title: "Advanced Yoga Poses", category: "Yoga", views: 980, desc: "Level up your yoga practice with these advanced poses." },
  { id: 5, title: "Gym Basics", category: "gym", views: 760, desc: "Everything you need to know before hitting the gym." },
  { id: 6, title: "HIIT Fat Burn", category: "HIIT", views: 1100, desc: "Maximize fat burning with this HIIT protocol." },
];

const TIPS = [
  { id: 1, title: "Stay Hydrated", text: "Drink at least 8 glasses of water daily, especially before and after workouts.", icon: "water" },
  { id: 2, title: "Prioritize Sleep", text: "Aim for 7-9 hours of sleep to allow muscle recovery and mental clarity.", icon: "sleep" },
  { id: 3, title: "Balanced Nutrition", text: "Combine carbs, protein, and healthy fats for sustained energy throughout the day.", icon: "nutrition" },
];

// ===== HELPERS =====
const generateActivityData = (reservations, days = 14) => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days + 1);
  const dateMap = {};
  reservations.forEach(r => {
    const dateStr = r.date || null;
    if (dateStr) dateMap[dateStr] = true;
  });
  const data = [];
  let boost = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    if (dateMap[dateStr]) boost += 35;
    const activity = Math.max(10, Math.min(100, 10 + boost));
    boost = Math.max(0, boost - 7);
    data.push({ date: label, activity: Math.round(activity) });
  }
  return data;
};

const computeStreak = (reservations) => {
  const dates = [...new Set(
    reservations
      .map(r => r.date)
      .filter(Boolean)
  )].sort().reverse();
  if (!dates.length) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let checkDate = new Date(today);
  for (const dateStr of dates) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.round((checkDate - d) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      streak++;
      checkDate = new Date(d);
      checkDate.setDate(checkDate.getDate() - 1);
    } else { break; }
  }
  return streak;
};

const getTrending = (articles) => {
  const catViews = {};
  const catCount = {};
  articles.forEach(a => {
    const cat = a.category.toLowerCase();
    catViews[cat] = (catViews[cat] || 0) + a.views;
    catCount[cat] = (catCount[cat] || 0) + 1;
  });
  const scored = Object.keys(catViews).map(cat => ({
    cat, score: catViews[cat] * 0.7 + catCount[cat] * 1000,
  }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored[0]?.cat || '';
  const filtered = articles.filter(a => a.category.toLowerCase() === top).sort((a, b) => b.views - a.views);
  return { trendingCategory: top, trendingArticles: filtered };
};

const getBmiInfo = (bmi) => {
  if (!bmi) return null;
  const val = parseFloat(bmi);
  if (val < 18.5) return { label: 'Kurus', color: '#2F5DAA', bg: '#EEF3FF' };
  if (val < 25) return { label: 'Normal', color: '#27AE60', bg: '#EDFFF5' };
  if (val < 30) return { label: 'Gemuk', color: '#F2994A', bg: '#FFF5EB' };
  return { label: 'Obesitas', color: '#C8102E', bg: '#FFEEEE' };
};

const formatReservationDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// ===== SVG ICONS =====
const tipIcons = {
  water: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F5DAA" strokeWidth="2" strokeLinecap="round"><path d="M12 2C6 8 4 13 4 16a8 8 0 0016 0c0-3-2-8-8-14z" /></svg>,
  sleep: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>,
  nutrition: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
};
const tipIconBg = { water: '#EEF3FF', sleep: '#F3F0FF', nutrition: '#EDFFF5' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-date">{label}</p>
        <p className="chart-tooltip-value">{payload[0].value} pts</p>
      </div>
    );
  }
  return null;
};

// ===== FEATURE CARDS CONFIG =====
const FEATURE_CARDS = [
  {
    key: 'health-assistant',
    label: 'AI Health Assistant',
    desc: 'Tanya soal kesehatan, nutrisi, dan program latihanmu kapan saja',
    color: '#2F5DAA',
    lightBg: '#EEF3FF',
    logoKey: 'health-assistant',
  },
  {
    key: 'gym-reservation',
    label: 'Gym Reservation',
    desc: 'Reservasi sesi gym favoritmu dengan mudah dan cepat',
    color: '#C8102E',
    lightBg: '#FFF0F0',
    logoKey: 'gym-reservation',
  },
  {
    key: 'health-module',
    label: 'Health Module',
    desc: 'Akses video edukasi kesehatan dan wellness terkurasi',
    color: '#1A9E5C',
    lightBg: '#EDFFF5',
    logoKey: 'health-module',
  },
];

// ===== MAIN COMPONENT =====
const HomePage = ({ onNavigate, user }) => {
  const [profile, setProfile] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [allReservations, setAllReservations] = useState([]);
  const [loadingReservation, setLoadingReservation] = useState(true);
  const [bmi, setBmi] = useState(null);
  const [videoProgress, setVideoProgress] = useState({ completed: 0, total: 10 });
  const [selectedArticle, setSelectedArticle] = useState(null);

  const progressPct = Math.round((videoProgress.completed / videoProgress.total) * 100);
  const { trendingCategory, trendingArticles } = useMemo(() => getTrending(ARTICLES), []);

  const gymStreak = useMemo(() => computeStreak(allReservations), [allReservations]);
  const totalSessions = useMemo(() =>
    allReservations.length,
    [allReservations]
  );
  const totalDurationHrs = (totalSessions * 1.5).toFixed(1);
  const activityData = useMemo(() => generateActivityData(allReservations), [allReservations]);
  const hasActivity = allReservations.length > 0;
  const allZero = gymStreak === 0 && totalSessions === 0;

  // Map logoKey → actual imported asset
  const featureLogos = {
    'health-assistant': healthAssistantLogo,
    'gym-reservation': gymReservationLogo,
    'health-module': healthModuleLogo,
  };

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('nama_lengkap, email, berat_kg, tinggi_cm, avatar_url')
        .eq('id', user.id)
        .single();
      if (data) {
        let finalAvatarUrl = data.avatar_url;
        if (finalAvatarUrl && !finalAvatarUrl.startsWith('http')) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(finalAvatarUrl);
          finalAvatarUrl = urlData?.publicUrl || null;
        }
        setProfile({ ...data, avatar_url: finalAvatarUrl });
        if (data.berat_kg && data.tinggi_cm) {
          const tinggiM = data.tinggi_cm / 100;
          setBmi((data.berat_kg / (tinggiM * tinggiM)).toFixed(1));
        }
      }
    };

    const fetchReservations = async () => {
      setLoadingReservation(true);
      try {
        const { data: allData, error: resError } = await supabase
          .from('reservations')
          .select('id, date, start_time, end_time, gym_name, notes')
          .eq('user_id', user.id)
          .order('date', { ascending: true });
        if (allData) {
          setAllReservations(allData);
          const now = new Date();
          // Reservasi terdekat yang belum selesai
          const upcoming = allData.find(r => {
            const endDateTime = new Date(`${r.date}T${r.end_time}`);
            return endDateTime >= now;
          }) || null;
          setReservation(upcoming);
        }
      } catch (e) {
        console.error('fetchReservations error:', e);
      }
      setLoadingReservation(false);
    };

    const loadVideoProgress = () => {
      try {
        const progress = JSON.parse(localStorage.getItem('hm_progress') || '{}');
        const completed = Object.values(progress).filter(v => (v.progress || 0) >= 90).length;
        setVideoProgress({ completed, total: 10 });
      } catch {
        setVideoProgress({ completed: 0, total: 10 });
      }
    };

    fetchProfile();
    fetchReservations();
    loadVideoProgress();
  }, [user]);

  const firstName = profile?.nama_lengkap?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  const resNow = new Date();
  const resStart = reservation?.date && reservation?.start_time
    ? new Date(`${reservation.date}T${reservation.start_time}`) : null;
  const resEnd = reservation?.date && reservation?.end_time
    ? new Date(`${reservation.date}T${reservation.end_time}`) : null;
  const resIsBerlangsung = resStart && resEnd && resNow >= resStart && resNow <= resEnd;
  const resIsUpcoming = resEnd ? resEnd > resNow : true;
  const resStatusText = resIsBerlangsung ? '🟡 Sedang Berlangsung' : resIsUpcoming ? '🔵 Upcoming' : '✅ Selesai';
  const avatarInitial = firstName.charAt(0).toUpperCase();
  const bmiInfo = getBmiInfo(bmi);

  return (
    <div className="home-page">

      {/* ===== HEADER ===== */}
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
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="home-avatar" onClick={() => onNavigate('profile')}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : avatarInitial}
          </div>
        </div>
      </div>

      {/* ===== STATS BANNER ===== */}
      <div className="home-stats-banner">
        <div className="home-stat-item">
          <div className="stat-icon-wrap" style={{ background: '#FFF5EB' }}>🔥</div>
          <div>
            <p className="home-stat-value">{gymStreak}</p>
            <p className="home-stat-label">Day Streak</p>
          </div>
        </div>
        <div className="home-stat-divider" />
        <div className="home-stat-item">
          <div className="stat-icon-wrap" style={{ background: '#FFF0F0' }}>🏋️</div>
          <div>
            <p className="home-stat-value">{totalSessions}</p>
            <p className="home-stat-label">Total Sesi</p>
          </div>
        </div>
        <div className="home-stat-divider" />
        <div className="home-stat-item">
          <div className="stat-icon-wrap" style={{ background: '#EEF3FF' }}>⏱️</div>
          <div>
            <p className="home-stat-value">{totalDurationHrs}j</p>
            <p className="home-stat-label">Durasi</p>
          </div>
        </div>
        {allZero && (
          <button className="stats-nudge-btn" onClick={() => onNavigate('gym-reservation')}>
            Mulai sesi pertama →
          </button>
        )}
      </div>

      {/* ===== SPOTLIGHT FEATURE CARDS ===== */}
      <p className="section-label">Fitur Utama</p>
      <div className="feature-spotlight-list">
        {FEATURE_CARDS.map((f, idx) => (
          <button
            key={f.key}
            className="feature-spotlight-card"
            style={{
              '--feat-color': f.color,
              '--feat-light': f.lightBg,
              animationDelay: `${idx * 80}ms`,
            }}
            onClick={() => onNavigate(f.key)}
          >
            {/* Icon */}
            <div className="feat-icon-container">
              <img
                src={featureLogos[f.logoKey]}
                alt={f.label}
                className="feat-logo"
              />
            </div>

            {/* Text */}
            <div className="feat-content">
              <p className="feat-title" style={{ color: f.color }}>{f.label}</p>
              <p className="feat-desc">{f.desc}</p>
            </div>

            {/* Arrow button */}
            <div className="feat-arrow" style={{ background: f.lightBg }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={f.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* ===== CARDS GRID ===== */}
      <div className="home-cards">

        {/* BMI Card */}
        {bmi && bmiInfo && (
          <div className="home-card card-wide bmi-card" style={{ background: bmiInfo.bg }}>
            <div className="bmi-left">
              <p className="bmi-label">Body Mass Index (BMI)</p>
              <div className="bmi-value-row">
                <span className="bmi-number" style={{ color: bmiInfo.color }}>{bmi}</span>
                <span className="bmi-unit">kg/m²</span>
              </div>
              <span className="bmi-status" style={{ background: bmiInfo.color }}>
                {bmiInfo.label}
              </span>
              <p className="bmi-detail">{profile?.berat_kg} kg · {profile?.tinggi_cm} cm</p>
            </div>
            <div className="bmi-gauge-wrap">
              <div className="bmi-gauge">
                <div className="bmi-gauge-bar">
                  <div className="bmi-gauge-fill" style={{
                    width: `${Math.min(Math.max((parseFloat(bmi) - 10) / 30 * 100, 5), 95)}%`,
                    background: bmiInfo.color
                  }} />
                  <div className="bmi-gauge-thumb" style={{
                    left: `${Math.min(Math.max((parseFloat(bmi) - 10) / 30 * 100, 5), 95)}%`,
                    background: bmiInfo.color
                  }} />
                </div>
                <div className="bmi-gauge-labels">
                  <span>Kurus</span><span>Normal</span><span>Gemuk</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aktivitas Latihan */}
        <div className="home-card card-wide">
          <div className="card-header-row">
            <h3 className="card-title red">Aktivitas Latihan</h3>
            <span className="workout-badge">{activityData[activityData.length - 1]?.activity ?? 10} pts</span>
          </div>
          {hasActivity ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={activityData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#ccc', fontFamily: 'Poppins, sans-serif' }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 9, fill: '#ccc', fontFamily: 'Poppins, sans-serif' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="activity" stroke="#F2C94C" strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5, fill: '#F2C94C', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                <span className="chart-legend-dot" />
                <span className="chart-legend-text">Skor naik setiap reservasi gym</span>
              </div>
            </>
          ) : (
            <div className="chart-empty-state">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 12h4l3-8 4 16 3-8h4" />
              </svg>
              <p className="chart-empty-title">Belum ada data aktivitas</p>
              <p className="chart-empty-desc">Grafik akan muncul setelah reservasi gym pertamamu</p>
              <button className="chart-empty-btn" onClick={() => onNavigate('gym-reservation')}>
                Reservasi Sekarang →
              </button>
            </div>
          )}
        </div>

        {/* Reservasiku */}
        <div className="home-card card-half">
          <h3 className="card-title red">Reservasiku</h3>
          {loadingReservation ? (
            <div className="card-loading">
              <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
            </div>
          ) : reservation ? (
            <>
              <div className="reservation-info">
                <div className="reservation-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <div>
                  <p className="reservation-date">
                    {reservation.date ? formatReservationDate(reservation.date) : 'Jadwal belum ditentukan'}
                  </p>
                  <p className="reservation-time">
                    {reservation.start_time && reservation.end_time
                      ? `${reservation.start_time.slice(0, 5)} - ${reservation.end_time.slice(0, 5)}`
                      : 'Waktu belum ditentukan'}
                  </p>
                  <span className="reservation-status-badge">{resStatusText}</span>
                </div>
              </div>
              {resIsBerlangsung ? (
                <button className="reservation-btn" style={{ background: '#F2C94C', color: '#333' }}
                  onClick={() => onNavigate('qr-scan', { reservationId: reservation.id })}>
                  📷 Scan QR Sekarang
                </button>
              ) : (
                <button className="reservation-btn" onClick={() => onNavigate('riwayat-reservasi')}>
                  Klik untuk detail
                </button>
              )}
            </>
          ) : (
            <div className="reservation-empty">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <p className="empty-state">Belum ada reservasi</p>
              <button className="reservation-btn" onClick={() => onNavigate('gym-reservation')}>
                + Buat Reservasi
              </button>
            </div>
          )}
        </div>

        {/* Video Terselesaikan */}
        <div className="home-card card-half">
          <h3 className="card-title red">Video Selesai</h3>
          <div className="video-progress-circle-wrap">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#f0f0f0" strokeWidth="7" />
              <circle cx="36" cy="36" r="30" fill="none" stroke="#F2C94C" strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - progressPct / 100)}`}
                transform="rotate(-90 36 36)"
              />
              <text x="36" y="36" textAnchor="middle" dominantBaseline="middle"
                fontSize="13" fontWeight="800" fill="#333"
                fontFamily="Poppins, sans-serif">{progressPct}%</text>
            </svg>
          </div>
          <p className="progress-label" style={{ textAlign: 'center', marginTop: 6 }}>
            {videoProgress.completed}/{videoProgress.total} video
          </p>
          <button className="card-link-btn" onClick={() => onNavigate('health-module')}>
            Lihat modul →
          </button>
        </div>

        {/* Topik Trending */}
        <div className="home-card card-half">
          <div className="card-header-row">
            <h3 className="card-title red">Trending</h3>
            <span className="trending-cat-badge">{trendingCategory.toUpperCase()}</span>
          </div>
          <div className="trending-list-inline">
            {trendingArticles.slice(0, 2).map((a, i) => (
              <button
                key={a.id}
                className={`trending-item-inline ${selectedArticle?.id === a.id ? 'active' : ''}`}
                onClick={() => setSelectedArticle(selectedArticle?.id === a.id ? null : a)}
              >
                <span className="trending-rank-inline">#{i + 1}</span>
                <span className="trending-title-inline">{a.title}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
          {selectedArticle && (
            <div className="trending-detail-inline">
              <p className="trending-detail-title">{selectedArticle.title}</p>
              <p className="trending-detail-desc">{selectedArticle.desc}</p>
            </div>
          )}
        </div>

        {/* Tips Sehat */}
        <div className="home-card card-half">
          <h3 className="card-title red">Tips Sehat</h3>
          <div className="tips-list-inline">
            {TIPS.map(tip => (
              <div className="tips-item-inline" key={tip.id}>
                <div className="tips-icon-inline" style={{ background: tipIconBg[tip.icon] }}>
                  {tipIcons[tip.icon]}
                </div>
                <div>
                  <p className="tips-item-title">{tip.title}</p>
                  <p className="tips-item-text">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;