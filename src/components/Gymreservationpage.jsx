import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import '../styles/GymReservationPage.css';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const MONTHS    = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAYS      = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Fallback hardcoded slots jika tabel sesi kosong
const FALLBACK_SLOTS = [
  { id: 'f1', jam_mulai: '16:30:00', jam_selesai: '17:30:00', nama_sesi: 'Sesi Sore 1', terisi: 0, kapasitas_max: 20 },
  { id: 'f2', jam_mulai: '17:30:00', jam_selesai: '19:00:00', nama_sesi: 'Sesi Sore 2', terisi: 0, kapasitas_max: 20 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDay    = (y, m) => new Date(y, m, 1).getDay();
const toDateStr      = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const fmtTime        = (t) => t?.slice(0,5).replace(':','.') || '';
const fmtDate        = (y, m, d) => {
  if (!d) return '';
  const date = new Date(y, m, d);
  return `${['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][date.getDay()]}, ${d} ${MONTHS_ID[m]} ${y}`;
};

// ─── ICONS ───────────────────────────────────────────────────────────────────
const IcArrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);
const IcChevL = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IcChevR = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IcCal = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2.5"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);
const IcClock = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcUsers = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcCheckCircle = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcConfetti = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 15L2 22l7-3.5"/><path d="M14 2l-1.5 3.5L16 7l-3.5 1.5L14 12l-1.5-3.5L9 10l3.5-1.5L11 5l3 1z"/>
    <path d="M20 10l-1 2.5 2.5-1L20 14l-1-2.5L16.5 12 19 11z"/>
  </svg>
);

// ─── SKELETON ────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="gr-skel-list">
    {[1,2].map(i => (
      <div key={i} className="gr-skel-card">
        <div className="gr-skel-line gr-skel-lg"/>
        <div className="gr-skel-line gr-skel-md"/>
        <div className="gr-skel-line gr-skel-sm"/>
      </div>
    ))}
  </div>
);

// ─── CALENDAR ────────────────────────────────────────────────────────────────
const Calendar = ({ year, month, selectedDate, onSelectDate, onPrev, onNext }) => {
  const today       = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDay(year, month);
  const prevDays    = getDaysInMonth(year, month - 1);

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isPast  = (d) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, curr: false });
  for (let d = 1; d <= daysInMonth; d++)   cells.push({ day: d, curr: true });
  while (cells.length < 42)                cells.push({ day: cells.length - daysInMonth - firstDay + 1, curr: false });

  return (
    <div className="gr-cal">
      <div className="gr-cal-nav">
        <button className="gr-cal-nav-btn" onClick={onPrev}><IcChevL /></button>
        <span className="gr-cal-title">{MONTHS[month]} {year}</span>
        <button className="gr-cal-nav-btn" onClick={onNext}><IcChevR /></button>
      </div>
      <div className="gr-cal-grid">
        {DAYS.map(d => <div key={d} className="gr-cal-dn">{d}</div>)}
        {cells.map((c, i) => {
          const sel = c.curr && selectedDate === c.day;
          const dis = !c.curr || isPast(c.day);
          return (
            <button key={i} disabled={dis}
              onClick={() => !dis && onSelectDate(c.day)}
              className={[
                'gr-cal-day',
                !c.curr                         ? 'gr-cal-day--dim'   : '',
                c.curr && isPast(c.day)          ? 'gr-cal-day--past'  : '',
                c.curr && isToday(c.day) && !sel ? 'gr-cal-day--today' : '',
                sel                              ? 'gr-cal-day--sel'   : '',
              ].filter(Boolean).join(' ')}>
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── SESSION LIST ────────────────────────────────────────────────────────────
const SessionList = ({ selectedDate, sessions, loading, selectedSession, onSelect }) => {
  if (!selectedDate) return (
    <div className="gr-empty">
      <IcCal size={28} />
      <p>Pilih tanggal untuk melihat jadwal</p>
    </div>
  );
  if (loading) return <Skeleton />;
  if (!sessions.length) return (
    <div className="gr-empty">
      <IcCal size={28} />
      <p>Tidak ada sesi pada tanggal ini</p>
      <span>Coba pilih tanggal lain</span>
    </div>
  );

  return (
    <div className="gr-sess-list">
      {sessions.map(s => {
        const terisi    = s.terisi ?? 0;
        const kapasitas = s.kapasitas_max ?? 20;
        const sisa      = kapasitas - terisi;
        const penuh     = sisa <= 0;
        const sel       = selectedSession?.id === s.id;

        return (
          <button key={s.id} disabled={penuh} onClick={() => onSelect(s)}
            className={['gr-sess', sel ? 'gr-sess--sel' : '', penuh ? 'gr-sess--full' : ''].filter(Boolean).join(' ')}>
            <div className="gr-sess-left">
              <div className="gr-sess-time-row">
                <IcClock />
                <span className="gr-sess-time">{fmtTime(s.jam_mulai)} – {fmtTime(s.jam_selesai)}</span>
              </div>
              <span className="gr-sess-name">{s.nama_sesi || 'Sesi Gym'}</span>
            </div>
            <div className="gr-sess-right">
              {penuh ? (
                <span className="gr-badge gr-badge--full">Penuh</span>
              ) : (
                <>
                  <div className="gr-quota"><IcUsers /><span>{terisi}/{kapasitas}</span></div>
                  <span className="gr-sisa">{sisa} tersisa</span>
                </>
              )}
            </div>
            {sel && <div className="gr-sess-check">✓</div>}
          </button>
        );
      })}
    </div>
  );
};

// ─── CONFIRM ─────────────────────────────────────────────────────────────────
const ConfirmModal = ({ year, month, selectedDate, selectedSession, loading, error, onConfirm, onCancel }) => (
  <div className="gr-conf-page">
    <div className="gr-topbar">
      <button className="gr-ic-btn" onClick={onCancel}><IcArrow /></button>
      <span className="gr-topbar-title">Konfirmasi Reservasi</span>
      <div style={{ width: 36 }} />
    </div>

    <div className="gr-conf-body">
      <div className="gr-conf-card">
        {/* Header */}
        <div className="gr-conf-head">
          <div className="gr-conf-icon"><IcCal size={26} /></div>
          <div>
            <p className="gr-conf-eyebrow">Reservasi Baru</p>
            <h3 className="gr-conf-title">Konfirmasi<br />Reservasi</h3>
          </div>
        </div>

        <div className="gr-conf-sep" />

        {/* Detail */}
        <p className="gr-conf-label">Anda akan reservasi pada:</p>
        <div className="gr-conf-detail">
          <div className="gr-conf-detail-icon"><IcCal size={16} /></div>
          <div>
            <p className="gr-conf-date">{fmtDate(year, month, selectedDate)}</p>
            <p className="gr-conf-time">{fmtTime(selectedSession?.jam_mulai)} – {fmtTime(selectedSession?.jam_selesai)}</p>
            <p className="gr-conf-sess">{selectedSession?.nama_sesi || 'Sesi Gym'}</p>
          </div>
        </div>

        {error && <div className="gr-error">{error}</div>}

        <div className="gr-conf-sep" />

        {/* Actions */}
        <div className="gr-conf-actions">
          <button className="gr-btn-ghost" onClick={onCancel} disabled={loading}>Batal</button>
          <button className="gr-btn-primary" onClick={onConfirm} disabled={loading}>
            {loading
              ? <span className="gr-btn-loading"><span className="gr-spinner" />Memproses</span>
              : 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── SUCCESS ─────────────────────────────────────────────────────────────────
const SuccessState = ({ year, month, selectedDate, selectedSession, onNavigate }) => (
  <div className="gr-succ-page">
    <div className="gr-succ-bg" />
    <div className="gr-succ-content">
      <div className="gr-succ-confetti"><IcConfetti /></div>
      <div className="gr-succ-ring">
        <div className="gr-succ-circle"><IcCheckCircle /></div>
      </div>

      <h2 className="gr-succ-title">Reservasi Berhasil!</h2>
      <p className="gr-succ-desc">
        Kamu berhasil reservasi <strong>{selectedSession?.nama_sesi || 'Sesi Gym'}</strong>
      </p>

      <div className="gr-succ-pills">
        <div className="gr-succ-pill">
          <IcCal size={14} />
          <span>{fmtDate(year, month, selectedDate)}</span>
        </div>
        <div className="gr-succ-pill">
          <IcClock size={14} />
          <span>{fmtTime(selectedSession?.jam_mulai)} – {fmtTime(selectedSession?.jam_selesai)}</span>
        </div>
      </div>

      <div className="gr-succ-actions">
        <button className="gr-btn-primary gr-btn-full" onClick={() => onNavigate('riwayat-reservasi')}>
          Lihat Riwayat Reservasi
        </button>
        <button className="gr-btn-ghost gr-btn-full" onClick={() => onNavigate('home')}>
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  </div>
);

// ─── MAIN ────────────────────────────────────────────────────────────────────
const GymReservationPage = ({ onNavigate, user }) => {
  const today = new Date();
  const [year,    setYear]    = useState(today.getFullYear());
  const [month,   setMonth]   = useState(today.getMonth());
  const [selDate, setSelDate] = useState(null);
  const [selSess, setSelSess] = useState(null);
  const [sessions,setSessions]= useState([]);
  const [loadSess,setLoadSess]= useState(false);
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState('');

  // Fetch sessions dari tabel reservations (hardcoded fallback)
  useEffect(() => {
    if (!selDate) { setSessions([]); return; }
    let cancelled = false;
    setLoadSess(true);
    setSelSess(null);

    // Coba fetch dari tabel 'sesi' dulu, fallback ke hardcoded
    supabase
      .from('sesi')
      .select('*')
      .eq('tanggal', toDateStr(year, month, selDate))
      .order('jam_mulai')
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err || !data || data.length === 0) {
          // Fallback: gunakan hardcoded slots dengan id unik per tanggal
          const dateStr = toDateStr(year, month, selDate);
          setSessions(FALLBACK_SLOTS.map(s => ({ ...s, id: `${dateStr}-${s.id}`, tanggal: dateStr })));
        } else {
          setSessions(data);
        }
        setLoadSess(false);
      });

    return () => { cancelled = true; };
  }, [selDate, year, month]);

  const prevMonth = () => {
    setSelDate(null); setSelSess(null); setError('');
    month === 0 ? (setMonth(11), setYear(y => y-1)) : setMonth(m => m-1);
  };
  const nextMonth = () => {
    setSelDate(null); setSelSess(null); setError('');
    month === 11 ? (setMonth(0), setYear(y => y+1)) : setMonth(m => m+1);
  };

  const handleConfirm = async () => {
    if (!selDate || !selSess || !user) return;
    setBusy(true); setError('');

    try {
      // Cek apakah sudah reservasi di tanggal yang sama
      const dateStr = toDateStr(year, month, selDate);
      const { data: existing } = await supabase
        .from('reservations')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .maybeSingle();

      if (existing) throw new Error('Kamu sudah memiliki reservasi pada tanggal ini.');

      // Insert ke tabel reservations (skema lama yang bekerja)
      const { error: err } = await supabase
        .from('reservations')
        .insert({
          user_id:    user.id,
          date:       dateStr,
          start_time: selSess.jam_mulai,
          end_time:   selSess.jam_selesai,
          gym_name:   'NutriGym IPB',
          notes:      selSess.nama_sesi || 'Sesi Gym',
        });

      if (err) {
        if (err.code === '23505') throw new Error('Kamu sudah memiliki reservasi pada tanggal ini.');
        throw new Error(err.message);
      }

      setConfirm(false);
      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  if (success) return (
    <SuccessState year={year} month={month} selectedDate={selDate} selectedSession={selSess} onNavigate={onNavigate} />
  );
  if (confirm) return (
    <ConfirmModal year={year} month={month} selectedDate={selDate} selectedSession={selSess}
      loading={busy} error={error} onConfirm={handleConfirm} onCancel={() => { setConfirm(false); setError(''); }} />
  );

  return (
    <div className="gr-page">
      <div className="gr-topbar">
        <button className="gr-ic-btn" onClick={() => onNavigate('home')}><IcArrow /></button>
        <span className="gr-topbar-title">Reservasi Gym</span>
        <div style={{ width: 36 }} />
      </div>

      <div className="gr-scroll">
        <Calendar
          year={year} month={month} selectedDate={selDate}
          onSelectDate={d => { setSelDate(d); setSelSess(null); setError(''); }}
          onPrev={prevMonth} onNext={nextMonth}
        />

        <div className="gr-sess-section">
          <div className="gr-sess-header">
            <div className="gr-sess-bar" />
            <h3 className="gr-sess-title">
              Pilih Sesi
              {selDate && !loadSess && sessions.length > 0 && (
                <span className="gr-sess-date-hint"> · {fmtDate(year, month, selDate)}</span>
              )}
            </h3>
          </div>
          <SessionList
            selectedDate={selDate} sessions={sessions} loading={loadSess}
            selectedSession={selSess} onSelect={s => { setSelSess(s); setError(''); }}
          />
        </div>

        {error && <div className="gr-error">{error}</div>}

        <button className="gr-btn-primary gr-btn-full"
          disabled={!selDate || !selSess}
          onClick={() => { setError(''); setConfirm(true); }}>
          Lanjut Reservasi
        </button>
      </div>
    </div>
  );
};

export default GymReservationPage;