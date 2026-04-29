import React, { useState } from 'react';
import '../styles/NotificationsPage.css';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'achievement',
    title: 'Pencapaian Terbuka!',
    description: 'Kerja bagus! kamu meraih lencana "Morning Person" selama 7 hari berturut-turut.',
    timestamp: 'Baru saja',
    color: '#F2C94C',
    icon: '⭐',
    read: false,
  },
  {
    id: 2,
    type: 'tips',
    title: 'Tips Kesehatan!',
    description: 'Konsumsi protein untuk kepenuhan serat harian',
    timestamp: '1 jam yang lalu',
    color: '#C8102E',
    icon: '🔔',
    read: false,
  },
  {
    id: 3,
    type: 'workout',
    title: 'Latihan sudah selesai!',
    description: 'Selamat! kamu telah melakukan latihan selama 30 menit',
    timestamp: '1 hari yang lalu',
    color: '#2F5DAA',
    icon: '✅',
    read: true,
  },
];

const NotificationsPage = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotif = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="notif-page">
      <div className="notif-header">
        <button className="notif-back" onClick={() => onNavigate('home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="notif-title">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: '#C8102E', fontWeight: '600', whiteSpace: 'nowrap'
            }}
          >
            Baca Semua
          </button>
        )}
      </div>

      {unreadCount > 0 && (
        <div style={{ padding: '8px 16px', background: '#fff8f8', borderBottom: '1px solid #f5e0e0' }}>
          <p style={{ fontSize: 12, color: '#C8102E', margin: 0 }}>
            {unreadCount} notifikasi belum dibaca
          </p>
        </div>
      )}

      <div className="notif-list">
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🔔</p>
            <p style={{ fontSize: 14, color: '#aaa' }}>Belum ada notifikasi</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              className="notif-card"
              key={notif.id}
              onClick={() => markRead(notif.id)}
              style={{
                opacity: notif.read ? 0.7 : 1,
                background: notif.read ? '#fff' : '#fffbf0',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              {!notif.read && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 8, height: 8, borderRadius: '50%', background: '#C8102E'
                }} />
              )}
              <div className="notif-icon-wrap" style={{ background: notif.color }}>
                <span className="notif-icon">{notif.icon}</span>
              </div>
              <div className="notif-content">
                <div className="notif-top">
                  <p className="notif-card-title">{notif.title}</p>
                  <span className="notif-time">{notif.timestamp}</span>
                </div>
                <p className="notif-desc">{notif.description}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                style={{
                  position: 'absolute', bottom: 8, right: 12,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 11, color: '#bbb'
                }}
              >
                Hapus
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
