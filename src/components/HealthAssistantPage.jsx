// src/components/HealthAssistantPage.jsx
import React, { useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import doctorAvatar from '../assets/doctor_avatar.png';
import '../styles/HealthAssistantPage.css';

const HealthAssistantPage = ({ onNavigate, user }) => {
  const { messages, input, setInput, handleInputChange, isLoading, append } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome-message',
        role: 'assistant',
        content: 'Tentu! Aku disini untuk membantumu! Apa yang mau kau tanyakan tentang kesehatanmu?',
      },
    ],
  });

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ FIX: Ambil langsung dari state 'input' & proteksi undefined
  const sendMessage = () => {
    if (!input || !input.trim() || isLoading) return;
    
    append({
      role: 'user',
      content: input,
    });

    // ✅ FIX: Gunakan setInput bawaan SDK untuk clear field
    setInput('');
  };

  // ✅ Khusus Quick Topic tetap pakai parameter karena nilainya statis/luar state
  const handleQuickTopic = (prompt) => {
    if (isLoading) return;
    append({
      role: 'user',
      content: prompt,
    });
  };

  const quickTopics = [
    { label: '🍒 Tips Diet', prompt: 'Berikan tips diet sehat untuk saya' },
    { label: '💪 Latihan', prompt: 'Berikan rekomendasi latihan olahraga yang baik' },
    { label: '💤 Tidur', prompt: 'Bagaimana cara meningkatkan kualitas tidur saya?' },
  ];

  return (
    <div className="ha-page">
      <div className="ha-header">
        <button className="ha-back-btn" onClick={() => onNavigate('home')}>←</button>
        <div className="ha-header-text">
          <h2 className="ha-title">Health Assistant</h2>
          <p className="ha-subtitle">Tanyakan aku pertanyaan tentang kesehatanmu!</p>
        </div>
        <button className="ha-help-btn">?</button>
      </div>

      <div className="ha-body">
        <div className="ha-chat-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`ha-msg-row ${msg.role === 'user' ? 'ha-msg-user' : 'ha-msg-ai'}`}>
              {msg.role === 'assistant' && (
                <img src={doctorAvatar} className="ha-avatar" alt="AI" />
              )}
              <div className={`ha-bubble ${msg.role === 'assistant' ? 'ha-bubble-ai' : 'ha-bubble-user'}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="ha-msg-row ha-msg-ai">
              <img src={doctorAvatar} className="ha-avatar" alt="AI" />
              <div className="ha-bubble ha-bubble-ai ha-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="ha-quick-topics">
          {quickTopics.map((t, i) => (
            <button 
              key={i} 
              className="ha-topic-btn" 
              onClick={() => handleQuickTopic(t.prompt)} 
              disabled={isLoading}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ha-input-bar">
        <input
          className="ha-input"
          placeholder="Tulis pertanyaanmu..."
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendMessage(); // ✅ Tanpa parameter
            }
          }}
        />
        <button
          type="button"
          className="ha-send-btn"
          disabled={isLoading || !input?.trim()} // ✅ Opsional chaining untuk amankan trim
          onClick={sendMessage} // ✅ Langsung referensi fungsi
        >
          →
        </button>
      </div>
    </div>
  );
};

export default HealthAssistantPage;
