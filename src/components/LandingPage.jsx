import React, { useEffect, useRef } from 'react';
import '../styles/LandingPage.css';
import iwhLogo      from '../assets/logo_iwh.png';
import headerImg    from '../assets/header.png';
import iconAI       from '../assets/icon_ai.png';
import iconTraining from '../assets/icon_training.png';
import iconProgress from '../assets/icon_progress.png';
import iconGizi     from '../assets/icon_gizi.png';
import iconKonsultasi  from '../assets/icon_konsultasi.png';
import iconMonitoring  from '../assets/icon_monitoring.png';

/* ─── Data ────────────────────────────────────────────────────────────── */

const BADGES = [
  { icon: iconAI,       label: 'AI-Based Program' },
  { icon: iconTraining, label: 'Personal Training' },
  { icon: iconProgress, label: 'Progress Tracking' },
];

const STATS = [
  { number: '500+', label: 'Member Aktif' },
  { number: '4.9★', label: 'Rating Pengguna' },
  { number: '3 bln', label: 'Rata-rata Hasil' },
];

const FEATURES = [
  {
    icon: iconGizi,
    name: 'Tracking Gizi',
    desc: 'Pantau kalori & nutrisi harian secara otomatis',
  },
  {
    icon: iconKonsultasi,
    name: 'Konsultasi Kesehatan',
    desc: 'Rekomendasi program latihan via AI',
  },
  {
    icon: iconMonitoring,
    name: 'Monitoring Progress',
    desc: 'Dashboard perkembangan real-time',
  },
];

const STEPS = [
  { num: 1, label: 'Buat Akun' },
  { num: 2, label: 'Isi data diri & komposisi tubuh' },
  { num: 3, label: 'Dapatkan program personal' },
  { num: 4, label: 'Lakukan konsultasi dengan AI' },
  { num: 5, label: 'Pantau progress dan raih tujuanmu' },
];

/* ─── Component ───────────────────────────────────────────────────────── */

const LandingPage = ({ onNavigate }) => {
  const observerRef = useRef(null);
  const navbarRef   = useRef(null);

  /* Scroll-reveal animation */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lp-visible');
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.10, rootMargin: '0px 0px -40px 0px' }
    );

    const targets = document.querySelectorAll('.lp-animate');
    targets.forEach((el) => observerRef.current.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  /* Navbar shadow on scroll */
  useEffect(() => {
    const navbar = navbarRef.current;
    if (!navbar) return;

    const handleScroll = () => {
      navbar.classList.toggle('lp-navbar--scrolled', window.scrollY > 8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Render ── */
  return (
    <div className="lp-page">

      {/* ═══ NAVBAR ═══════════════════════════════════════════════════════ */}
      <header ref={navbarRef} className="lp-navbar" role="banner">
        <img
          src={iwhLogo}
          className="lp-navbar-logo"
          alt="IPB Wellness Hub"
          width="120"
          height="34"
        />
        <button
          className="lp-navbar-cta"
          onClick={() => onNavigate('signup')}
          aria-label="Daftar sekarang"
        >
          Daftar
        </button>
      </header>

      {/* ═══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="lp-hero" aria-labelledby="hero-title">

        <div className="lp-hero-bg" role="img" aria-label="Atlet berlari di gym">
          <img
            src={headerImg}
            className="lp-hero-img"
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="lp-hero-scrim" aria-hidden="true" />
          <div className="lp-hero-accent"  aria-hidden="true" />
        </div>

        <div className="lp-hero-content">
          <span className="lp-hero-eyebrow" aria-hidden="true">
            <span className="lp-hero-eyebrow-dot" />
            IPB University · Bogor
          </span>

          <h1 id="hero-title" className="lp-hero-title">
            Be Healthy,<br />
            Go Wealthy with<br />
            <span className="lp-hero-title-accent">IPB Wellness Hub</span>
          </h1>

          <p className="lp-hero-desc">
            Program latihan dan gizi terintegrasi dengan
            Artificial Intelligence (AI) dan teknologi terkini.
          </p>

          <div className="lp-hero-actions">
            <button
              className="lp-btn-primary"
              onClick={() => onNavigate('signup')}
              aria-label="Mulai sekarang — daftar gratis"
            >
              Mulai Sekarang
            </button>
            <button
              className="lp-btn-outline"
              onClick={() => onNavigate('login')}
              aria-label="Masuk ke akun"
            >
              Masuk Akun
            </button>
          </div>
        </div>

        {/* Feature badges strip */}
        <div className="lp-badges" role="list" aria-label="Fitur unggulan">
          {BADGES.map((badge, i) => (
            <React.Fragment key={badge.label}>
              {i > 0 && <div className="lp-badge-divider" aria-hidden="true" />}
              <div className="lp-badge" role="listitem">
                <img
                  src={badge.icon}
                  className="lp-badge-icon"
                  alt=""
                  aria-hidden="true"
                  width="28"
                  height="28"
                />
                <span className="lp-badge-text">{badge.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ═══ STATS ═════════════════════════════════════════════════════════ */}
      <section className="lp-stats" aria-label="Statistik IPB Wellness Hub">
        <div
          className="lp-stats-grid lp-animate"
          style={{ transitionDelay: '0ms' }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="lp-stat-item">
              <span className="lp-stat-number">{stat.number}</span>
              <span className="lp-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ══════════════════════════════════════════════════════ */}
      <section className="lp-features" aria-labelledby="features-heading">
        <div className="lp-section-header lp-animate" style={{ transitionDelay: '0ms' }}>
          <span className="lp-section-tag" aria-hidden="true">Fitur Unggulan</span>
          <h2 id="features-heading" className="lp-section-title">
            Fitur Utama Nutrigym IPB
          </h2>
          <p className="lp-section-subtitle">
            Fasilitas kebugaran terintegrasi dengan ilmu gizi
            untuk membantumu mencapai gaya hidup sehat.
          </p>
        </div>

        <div className="lp-features-grid" role="list">
          {FEATURES.map((f, i) => (
            <article
              key={f.name}
              className="lp-feature-card lp-animate"
              style={{ transitionDelay: `${i * 80}ms` }}
              role="listitem"
              aria-label={f.name}
            >
              <div className="lp-feature-icon-wrap" aria-hidden="true">
                <img
                  src={f.icon}
                  className="lp-feature-icon"
                  alt=""
                  width="22"
                  height="22"
                />
              </div>
              <p className="lp-feature-name">{f.name}</p>
              <p className="lp-feature-desc">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ═══ STEPS ═════════════════════════════════════════════════════════ */}
      <section className="lp-steps" aria-labelledby="steps-heading">
        <div className="lp-section-header lp-animate" style={{ transitionDelay: '0ms' }}>
          <span className="lp-section-tag" aria-hidden="true">Cara Mulai</span>
          <h2 id="steps-heading" className="lp-section-title">
            Mulai di IPB Wellness Hub
          </h2>
          <p className="lp-section-subtitle">
            Lima langkah mudah menuju tubuh lebih sehat dan hidup lebih berkualitas.
          </p>
        </div>

        <ol className="lp-steps-list" aria-label="Langkah-langkah memulai">
          {STEPS.map((step, index) => (
            <li
              key={step.num}
              className="lp-step lp-animate"
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <div className="lp-step-left" aria-hidden="true">
                <div className="lp-step-num">{step.num}</div>
                {index < STEPS.length - 1 && (
                  <div className="lp-step-line" />
                )}
              </div>
              <div className="lp-step-body">
                <div className="lp-step-label">{step.label}</div>
              </div>
            </li>
          ))}
        </ol>

        {/* Mid-page CTA */}
        <div
          className="lp-mid-cta lp-animate"
          style={{ transitionDelay: '80ms' }}
          role="complementary"
          aria-label="Ajakan daftar"
        >
          <div className="lp-mid-cta-group">
            <p className="lp-mid-cta-eyebrow">Bergabung sekarang</p>
            <p className="lp-mid-cta-text">
              Siap memulai<br />perjalananmu?
            </p>
            <p className="lp-mid-cta-sub">Pendaftaran gratis. Mulai kapan saja.</p>
          </div>
          <button
            className="lp-btn-primary"
            onClick={() => onNavigate('signup')}
            aria-label="Daftar gratis sekarang"
          >
            Daftar Gratis →
          </button>
        </div>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="lp-footer" role="contentinfo">
        <div className="lp-footer-grid">
          <div className="lp-footer-col">
            <p className="lp-footer-heading">Tentang Kami</p>
            <p className="lp-footer-text">
              NutriGym IPB adalah fasilitas kebugaran terintegrasi
              milik IPB University, dibuka untuk umum sejak 2024.
            </p>
          </div>
          <div className="lp-footer-col">
            <p className="lp-footer-heading">Alamat</p>
            <p className="lp-footer-text">
              Jl. Raya Dramaga, Kampus IPB Dramaga,<br />
              Kabupaten Bogor, Jawa Barat.
            </p>
          </div>
          <div className="lp-footer-col">
            <p className="lp-footer-heading">Kontak</p>
            <p className="lp-footer-text">
              <a
                href="mailto:gymgizi@gmail.com"
                className="lp-footer-link"
              >
                Email: gymgizi@gmail.com
              </a>
            </p>
            <p className="lp-footer-text">
              <a
                href="https://instagram.com/nutrigymipb"
                className="lp-footer-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram NutriGym IPB"
              >
                Instagram: @nutrigymipb
              </a>
            </p>
            <p className="lp-footer-text">
              <a
                href="https://tiktok.com/@nutrigymipb"
                className="lp-footer-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok NutriGym IPB"
              >
                TikTok: @nutrigymipb
              </a>
            </p>
          </div>
        </div>

        <div className="lp-footer-bottom">
          © 2025 NutriGym Gizi – IPB University. Hak cipta dilindungi.
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;