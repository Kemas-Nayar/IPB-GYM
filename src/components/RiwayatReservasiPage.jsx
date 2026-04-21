import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import '../styles/SubPage.css';

const RiwayatReservasiPage = ({ onNavigate, user }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchReservations = async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (!error && data) setReservations(data);
      setLoading(false);
    };
    fetchReservations();
  }, [user]);

  const getStatus = (r) => {
    const now = new Date();
    const resDate = new Date(`${r.date}T${r.start_time}`);
    const resEnd = new Date(`${r.date}T${r.end_time}`);
    if (now >= resDate && now <= resEnd) return 'berlangsung';
    if (now > resEnd) return 'selesai';
    return 'upcoming';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Minggu','Senin','Selasa','Rabu','Kamis',"Jum'at",'Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni',
      'Juli','Agustus','September','Oktober','November','Desember'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (t) => t?.slice(0, 5).replace(':', '.') || '';

  return (
    <div className="subpage" style={{ background: '#fdf0f0' }}>
      <div className="subpage-header">
        <button className="subpage-back" onClick={() => onNavigate('profile')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="subpage-title">Riwayat Reservasi</span>
        <div style={{ width: 60 }} />
      </div>

      {loading ? (
        <div className="reservasi-empty">
          <p>Memuat data...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="reservasi-empty">
          <span className="reservasi-empty-icon">📅</span>
          <p className="reservasi-empty-title">Belum ada reservasi</p>
          <p className="reservasi-empty-desc">Kamu belum pernah melakukan reservasi gym</p>
        </div>
      ) : (
        <div className="reservasi-outer-card">
          {reservations.map((r) => {
            const status = getStatus(r);
            return (
              <div className="reservasi-card" key={r.id}>
                <div className="reservasi-card-left">
                  <p className="reservasi-date">{formatDate(r.date)}</p>
                  <p className="reservasi-time">{formatTime(r.start_time)} - {formatTime(r.end_time)}</p>
                  <span className={`reservasi-badge ${
                    status === 'berlangsung' ? 'badge-yellow' :
                    status === 'selesai' ? 'badge-red' : 'badge-blue'
                  }`}>
                    {status === 'berlangsung' ? 'Sedang Berlangsung' :
                     status === 'selesai' ? 'Selesai' : 'Upcoming'}
                  </span>
                </div>
                <div className="reservasi-card-right">
                  {status === 'berlangsung' ? (
                    <button
                      className="reservasi-qr"
                      onClick={() => onNavigate('qr-scan', { reservationId: r.id })}
                    >
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                        <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
                      </svg>
                    </button>
                  ) : (
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiwayatReservasiPage;