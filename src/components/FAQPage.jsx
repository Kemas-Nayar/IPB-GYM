import React, { useState } from 'react';
import '../styles/SubPage.css';

const FAQ_DATA = {
  1: [
    { q: 'Apa itu IPB Wellness Hub?', a: 'IPB Wellness Hub adalah fasilitas kebugaran terintegrasi milik IPB University yang menggabungkan program latihan, gizi, dan teknologi AI.' },
    { q: 'Bagaimana cara mendaftar?', a: 'Klik tombol "Daftar" di halaman utama, isi data email dan password, lalu lengkapi biodata kamu.' },
    { q: 'Apakah ada biaya pendaftaran?', a: 'Silakan hubungi admin kami di gymgizi@gmail.com atau Instagram @nutrigymipb untuk informasi biaya terkini.' },
  ],
  2: [
    { q: 'Bagaimana cara membuat reservasi gym?', a: 'Masuk ke menu "Gym Reservation", pilih tanggal dan sesi yang tersedia, lalu konfirmasi reservasi kamu.' },
    { q: 'Apakah reservasi bisa dibatalkan?', a: 'Untuk pembatalan reservasi, silakan hubungi admin kami minimal 1 jam sebelum jadwal.' },
    { q: 'Berapa kapasitas tiap sesi?', a: 'Kapasitas setiap sesi gym ditampilkan secara real-time saat kamu memilih jadwal.' },
  ],
  3: [
    { q: 'Bagaimana cara mengubah data pribadi?', a: 'Pergi ke Profile → Informasi Pribadi, lalu klik tombol Edit di pojok kanan atas.' },
    { q: 'Lupa password?', a: 'Klik "Forgot Password?" di halaman Login, masukkan email kamu, dan kami akan kirimkan link reset.' },
    { q: 'Bagaimana cara mengganti email?', a: 'Untuk mengganti email akun, silakan hubungi admin kami karena perubahan email memerlukan verifikasi.' },
  ],
};

const faqCategories = [
  { id: 1, icon: '💡', color: '#F2C94C', label: 'Memulai IPB Wellness Hub' },
  { id: 2, icon: '✅', color: '#2F5DAA', label: 'Reservasi & Pembayaran' },
  { id: 3, icon: '👤', color: '#C8102E', label: 'Akun & Pengaturan' },
];

const FAQPage = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [openCategory, setOpenCategory] = useState(null);
  const [openQuestion, setOpenQuestion] = useState(null);

  const filtered = faqCategories.filter(f =>
    f.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="subpage">
      <div className="subpage-header">
        <button className="subpage-back" onClick={() => onNavigate('profile')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div style={{ flex: 1 }} />
      </div>

      <div className="faq-body">
        <h1 className="faq-title">FAQ & Help Center</h1>
        <p className="faq-subtitle">Apa yang bisa kubantu hari ini? Cari jawaban atau mencari dari topik-topik berikut!</p>

        <div className="faq-search-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
          </svg>
          <input
            className="faq-search"
            placeholder="Search for answers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpenCategory(null); }}
          />
        </div>

        <div className="faq-list">
          {filtered.map((f) => (
            <div key={f.id}>
              <button
                className="faq-item"
                onClick={() => setOpenCategory(openCategory === f.id ? null : f.id)}
              >
                <div className="faq-icon-wrap" style={{ background: f.color }}>
                  <span className="faq-icon">{f.icon}</span>
                </div>
                <span className="faq-label">{f.label}</span>
                <svg
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"
                  style={{ transform: openCategory === f.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {openCategory === f.id && (
                <div style={{ padding: '8px 16px 8px 52px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  {FAQ_DATA[f.id].map((item, idx) => (
                    <div key={idx} style={{ marginBottom: 8 }}>
                      <button
                        onClick={() => setOpenQuestion(openQuestion === `${f.id}-${idx}` ? null : `${f.id}-${idx}`)}
                        style={{
                          width: '100%', textAlign: 'left', background: 'none', border: 'none',
                          cursor: 'pointer', fontWeight: '600', fontSize: 13, color: '#333',
                          padding: '6px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        {item.q}
                        <span style={{ fontSize: 16, color: '#aaa' }}>{openQuestion === `${f.id}-${idx}` ? '−' : '+'}</span>
                      </button>
                      {openQuestion === `${f.id}-${idx}` && (
                        <p style={{ fontSize: 12, color: '#666', margin: '4px 0 8px', lineHeight: 1.6 }}>
                          {item.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32, padding: '0 16px' }}>
          <p style={{ fontSize: 13, color: '#888' }}>Tidak menemukan jawaban?</p>
          <a
            href="mailto:gymgizi@gmail.com"
            style={{
              display: 'inline-block', marginTop: 8, padding: '10px 24px',
              background: '#C8102E', color: '#fff', borderRadius: 20,
              fontSize: 13, textDecoration: 'none'
            }}
          >
            Hubungi Kami
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
