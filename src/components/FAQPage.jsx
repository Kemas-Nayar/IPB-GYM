import React, { useState } from 'react';
import '../styles/SubPage.css';

const faqCategories = [
  { id: 1, icon: '💡', color: '#F2C94C', label: 'Memulai IPB Wellness Hub' },
  { id: 2, icon: '✅', color: '#2F5DAA', label: 'Reservasi & Pembayaran' },
  { id: 3, icon: '👤', color: '#C8102E', label: 'Akun & Pengaturan' },
];

const FAQPage = ({ onNavigate }) => {
  const [search, setSearch] = useState('');

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
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="faq-list">
          {filtered.map((f) => (
            <button className="faq-item" key={f.id}>
              <div className="faq-icon-wrap" style={{ background: f.color }}>
                <span className="faq-icon">{f.icon}</span>
              </div>
              <span className="faq-label">{f.label}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;