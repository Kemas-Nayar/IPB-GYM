import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase'; 
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ onNavigate }) => {
  const [reservasiList, setReservasiList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReservasi();
  }, []);

  const fetchReservasi = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservasi')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setReservasiList(data || []);
    } catch (error) {
      alert('Error fetching data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk update status (Setujui/Tolak)
  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('reservasi')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update state lokal agar tampilan langsung berubah tanpa reload berat
      setReservasiList(prev => 
        prev.map(item => item.id === id ? { ...item, status: newStatus } : item)
      );
      
      console.log(`Berhasil mengubah status menjadi ${newStatus}`);
    } catch (error) {
      alert('Gagal mengupdate status: ' + error.message);
    }
  };

  // Helper untuk menentukan warna badge
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'disetujui': return 'status-approved';
      case 'ditolak': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h2>IPB Wellness Admin</h2>
        <ul className="admin-menu">
          <li className="active">Dashboard</li>
          <li>Pengguna</li>
          <li>Pengaturan</li>
        </ul>
        <button className="admin-logout-btn" onClick={() => onNavigate('home')}>
          Kembali ke Beranda
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1>Daftar Reservasi Gym</h1>
          <button className="refresh-btn" onClick={fetchReservasi}>
            🔄 Segarkan Data
          </button>
        </div>

        <div className="admin-card">
          {isLoading ? (
            <p>Memuat data reservasi...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Tanggal</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reservasiList.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nama || 'Anonim'}</td>
                    <td>{item.tanggal}</td>
                    <td>{item.waktu}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(item.status)}`}>
                        {item.status || 'Menunggu'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="action-btn approve"
                        onClick={() => updateStatus(item.id, 'Disetujui')}
                        disabled={item.status === 'Disetujui'}
                      >
                        Setujui
                      </button>
                      <button 
                        className="action-btn reject"
                        onClick={() => updateStatus(item.id, 'Ditolak')}
                        disabled={item.status === 'Ditolak'}
                      >
                        Tolak
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
