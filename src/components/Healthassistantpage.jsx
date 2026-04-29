import React, { useState, useRef, useEffect, useCallback } from 'react';
import doctorAvatar from '../assets/doctor_avatar.png';
import '../styles/HealthAssistantPage.css';

/* ─── Constants ────────────────────────────────────────────────────────────── */
const WELCOME = {
  id: 'welcome-message',
  role: 'assistant',
  content: 'Halo! Aku Nuri, Health Assistant dari IPB Wellness Hub 👋\nApa yang mau kamu tanyakan tentang kesehatan, gizi, atau olahraga hari ini?',
};

const SYSTEM_PROMPT = `Kamu adalah Health Assistant bernama Nuri dari IPB Wellness Hub. 
Kamu membantu pengguna dengan pertanyaan seputar kesehatan, gizi, olahraga, dan gaya hidup sehat. 
Jawab dalam Bahasa Indonesia, ramah, singkat (maks 3 paragraf), dan informatif. 
Jangan memberikan diagnosis medis. Jika pertanyaan tidak berhubungan dengan kesehatan, 
tolak dengan sopan dan arahkan kembali ke topik kesehatan.`;

const QUICK_TOPICS = [
  { label: '🍒 Tips Diet',  prompt: 'Berikan tips diet sehat untuk saya' },
  { label: '💪 Latihan',    prompt: 'Berikan rekomendasi latihan olahraga yang baik untuk pemula' },
  { label: '💤 Tidur',      prompt: 'Bagaimana cara meningkatkan kualitas tidur saya?' },
  { label: '💧 Hidrasi',    prompt: 'Berapa banyak air yang harus saya minum setiap hari?' },
];

/* ─── SVG Icons ────────────────────────────────────────────────────────────── */
const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconSend = ({ disabled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={disabled ? '#bbb' : '#1a1a1a'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

/* ─── Sub-components ───────────────────────────────────────────────────────── */
const TypingIndicator = () => (
  <div className="ha-msg-row ha-msg-ai ha-anim-in">
    <img src={doctorAvatar} className="ha-avatar" alt="Nuri AI" />
    <div className="ha-bubble ha-bubble-ai ha-typing">
      <span /><span /><span />
    </div>
  </div>
);

const Message = ({ msg }) => (
  <div className={`ha-msg-row ${msg.role === 'user' ? 'ha-msg-user' : 'ha-msg-ai'} ha-anim-in`}>
    {msg.role === 'assistant' && (
      <img src={doctorAvatar} className="ha-avatar" alt="Nuri AI" />
    )}
    <div className={`ha-bubble ${msg.role === 'assistant' ? 'ha-bubble-ai' : 'ha-bubble-user'}`}
      style={{ whiteSpace: 'pre-wrap' }}>
      {msg.content}
    </div>
  </div>
);

/* ─── Main Component ───────────────────────────────────────────────────────── */
const HealthAssistantPage = ({ onNavigate, user }) => {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setIsLoading(true);

    const history = next
      .filter(m => m.id !== 'welcome-message')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const contents = [
      { role: 'user',  parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Baik, saya mengerti. Saya siap membantu!' }] },
      ...history,
    ];

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('VITE_GEMINI_API_KEY belum diset di file .env');

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents }) }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data  = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Maaf, aku tidak bisa menjawab saat ini.';
      setMessages(prev => [...prev, { id: Date.now() + '-ai', role: 'assistant', content: reply }]);
    } catch (err) {
      const msg = err.message.includes('VITE_GEMINI')
        ? err.message
        : 'Maaf, terjadi kesalahan koneksi. Coba lagi ya!';
      setMessages(prev => [...prev, { id: Date.now() + '-err', role: 'assistant', content: msg }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, messages]);

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };
  const handleClear = () => { setMessages([WELCOME]); };

  const showChips = messages.length <= 2;

  return (
    <div className="ha-page">

      {/* ── Header ── */}
      <div className="ha-header">
        <button className="ha-back-btn" onClick={() => onNavigate('home')} aria-label="Kembali">
          <IconBack />
        </button>

        <div className="ha-header-avatar">
          <img src={doctorAvatar} alt="Nuri" />
          <span className="ha-online-dot" />
        </div>

        <div className="ha-header-text">
          <h2 className="ha-title">Health Assistant</h2>
          <p className="ha-subtitle">Nuri · IPB Wellness Hub</p>
        </div>

        <button className="ha-clear-btn" onClick={handleClear} aria-label="Hapus percakapan">
          <IconTrash />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="ha-body">

        {/* Date label */}
        <div className="ha-date-label">Hari ini</div>

        {/* Messages */}
        <div className="ha-chat-area">
          {messages.map(msg => <Message key={msg.id} msg={msg} />)}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick chips */}
        {showChips && (
          <div className="ha-quick-topics">
            {QUICK_TOPICS.map((t, i) => (
              <button
                key={i}
                className="ha-topic-btn"
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => sendMessage(t.prompt)}
                disabled={isLoading}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <form className="ha-input-bar" onSubmit={handleSubmit}>
        <div className={`ha-input-wrap ${input ? 'ha-input-wrap--active' : ''}`}>
          <input
            ref={inputRef}
            className="ha-input"
            placeholder="Tulis pertanyaanmu..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className={`ha-send-btn ${input.trim() && !isLoading ? 'ha-send-btn--active' : ''}`}
          disabled={!input.trim() || isLoading}
          aria-label="Kirim"
        >
          <IconSend disabled={!input.trim() || isLoading} />
        </button>
      </form>

    </div>
  );
};

export default HealthAssistantPage;