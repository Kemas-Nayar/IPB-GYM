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
        .select('id, date, start_time, end_time, gym_name, notes')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setReservations(data);
      setLoading(false);
    };
    fetchReservations();
  }, [user]);

  const getStatus = (r) => {
    if (!r.date || !r.start_time || !r.end_time) return 'upcoming';
    const now = new Date();
    const resDate = new Date(`${r.date}T${r.start_time}`);
    const resEnd = new Date(`${r.date}T${r.end_time}`);
    if (now >= resDate && now <= resEnd) return 'berlangsung';
    if (now > resEnd) return 'selesai';
    return 'upcoming';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (t) => t?.slice(0, 5).replace(':', '.') || '';

  const statusLabel = (status) => {
    switch (status) {
      case 'berlangsung': return 'Sedang Berlangsung';
      case 'selesai': return 'Selesai';
      case 'menunggu': return 'Menunggu Konfirmasi';
      case 'dibatalkan': return 'Dibatalkan';
      default: return 'Upcoming';
    }
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'berlangsung': return 'badge-yellow';
      case 'selesai':     return 'badge-green';
      case 'dibatalkan':  return 'badge-red';
      case 'menunggu':    return 'badge-gray';
      default:            return 'badge-blue';  // upcoming / dikonfirmasi
    }
  };

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
          <button
            onClick={() => onNavigate('gym-reservation')}
            style={{
              marginTop: 16, padding: '10px 24px', background: '#C8102E',
              color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 14
            }}
          >
            Buat Reservasi
          </button>
        </div>
      ) : (
        <div className="reservasi-outer-card">
          {reservations.map((r) => {
            const status = getStatus(r);
            return (
              <div className="reservasi-card" key={r.id}>
                <div className="reservasi-card-left">
                  <p className="reservasi-date">{formatDate(r.date)}</p>
                  <p className="reservasi-time">
                    {formatTime(r.start_time)} - {formatTime(r.end_time)}
                  </p>
                  {r.notes && (
                    <p style={{ fontSize: 11, color: '#888', margin: '2px 0' }}>{r.notes}</p>
                  )}
                  <span className={`reservasi-badge ${statusBadgeClass(status)}`}>
                    {statusLabel(status)}
                  </span>
                </div>
                <div className="reservasi-card-right">
                  {status === 'selesai' ? (
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
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