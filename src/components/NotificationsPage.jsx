import React from 'react';
import '../styles/NotificationsPage.css';

const notifications = [
  {
    id: 1,
    type: 'achievement',
    title: 'Pencapaian Terbuka!',
    description: 'Kerja bagus! kamu meraih lencana "Morning Person" selama 7 hari berturut-turut.',
    timestamp: 'Baru saja',
    color: '#F2C94C',
    icon: '⭐',
  },
  {
    id: 2,
    type: 'tips',
    title: 'Tips Kesehatan!',
    description: 'Konsumsi protein untuk kepenuhan serat harian',
    timestamp: '1 jam yang lalu',
    color: '#C8102E',
    icon: '🔔',
  },
  {
    id: 3,
    type: 'workout',
    title: 'Latihan sudah selesai!',
    description: 'Selamat! kamu telah melakukan latihan selama 30 menit',
    timestamp: '1 hari yang lalu',
    color: '#2F5DAA',
    icon: '✅',
  },
];

const NotificationsPage = ({ onNavigate }) => {
  return (
    <div className="notif-page">
      <div className="notif-header">
        <button className="notif-back" onClick={() => onNavigate('home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="notif-title">Notifications</h1>
      </div>

      <div className="notif-list">
        {notifications.map((notif) => (
          <div className="notif-card" key={notif.id}>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;