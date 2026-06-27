import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage({ onLogin, onRegister }) {
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="landing-page-wrapper">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .landing-page-wrapper {
          font-family: "DM Sans", sans-serif;
          background: var(--black);
          color: var(--white);
          min-height: 100vh;
          overflow-x: hidden;
          cursor: default;
          position: relative;
        }

        /* ── GRAIN TEXTURE OVERLAY ── */
        .landing-page-wrapper::before {
          content: "";
          position: fixed; inset: 0; z-index: 0;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        /* ── ANIMATED GRADIENT BG ── */
        .bg-layer {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 60% at 10% -10%, rgba(255,255,255,0.04) 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 90% 100%, rgba(255,255,255,0.03) 0%, transparent 55%),
            var(--black);
        }

        /* ── LAYOUT ── */
        .page-container { position: relative; z-index: 1; max-width: 1140px; margin: 0 auto; padding: 0 32px; }

        /* ── NAV ── */
        nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 24px;
          margin: 24px 0 0;
          border: 1px solid var(--border-light);
          border-radius: 20px;
          background: var(--primary);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          position: sticky; top: 16px; z-index: 100;
        }

        .nav-brand { display: flex; align-items: center; gap: 13px; flex-shrink: 0; }
        .nav-logo {
          height: 40px; width: auto;
          max-width: 160px;
          object-fit: contain;
          filter: none;
        }
        .nav-brand-text .name {
          font-family: "Playfair Display", serif;
          font-weight: 900; font-size: 16px; text-transform: uppercase;
          color: var(--white); letter-spacing: 0.03em;
        }
        .nav-brand-text .sub { font-size: 11px; color: var(--grey); font-weight: 300; letter-spacing: 0.02em; }

        .nav-links { display: flex; gap: 30px; }
        .nav-links a {
          font-size: 13.5px; font-weight: 400;
          color: var(--white); text-decoration: none;
          transition: opacity .2s; letter-spacing: 0.01em;
        }
        .nav-links a:hover { opacity: 0.8; }

        .nav-actions { display: flex; gap: 10px; flex-shrink: 0; }

        .btn {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: "DM Sans", sans-serif; font-weight: 500;
          font-size: 13.5px; letter-spacing: 0.02em;
          padding: 10px 22px; border-radius: 11px;
          border: none; cursor: pointer;
          transition: all .22s ease;
          text-decoration: none; white-space: nowrap;
        }
        .btn-white {
          background: var(--white); color: var(--primary);
        }
        .btn-white:hover { background: #f0f0f0; transform: translateY(-1px); box-shadow: 0 6px 28px rgba(255,255,255,0.35); }

        .btn-outline {
          background: transparent; color: var(--white);
          border: 1px solid var(--border-light);
        }
        .btn-outline:hover { background: var(--surface-hover); transform: translateY(-1px); }

        .btn-lg { padding: 14px 32px; font-size: 15px; border-radius: 14px; }

        /* ── HERO ── */
        .hero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 48px;
          align-items: center;
          padding: 96px 0 72px;
          min-height: 82vh;
        }

        .hero-left { display: flex; flex-direction: column; align-items: flex-start; }

        /* Badge */
        .badge {
          display: inline-flex; align-items: center; gap: 9px;
          border: 1px solid var(--border-light);
          background: var(--surface);
          border-radius: 999px; padding: 6px 16px 6px 10px;
          font-size: 12px; font-weight: 500; color: var(--light-grey);
          margin-bottom: 32px; letter-spacing: 0.03em;
        }
        .badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--primary);
          box-shadow: 0 0 10px rgba(26,122,46,0.9), 0 0 20px rgba(26,122,46,0.4);
          animation: pulse-dot 2.5s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 6px rgba(26,122,46,0.9); }
          50% { box-shadow: 0 0 14px rgba(26,122,46,1), 0 0 28px rgba(26,122,46,0.5); }
        }

        /* Headline */
        .headline {
          font-family: "Playfair Display", serif;
          font-size: clamp(2.6rem, 4.5vw, 4rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: var(--white);
          margin-bottom: 24px;
        }
        .headline em {
          font-style: italic; font-weight: 400;
          color: var(--light-grey);
        }

        /* Thin horizontal rule accent */
        .headline-rule {
          width: 56px; height: 2px;
          background: linear-gradient(90deg, var(--white), transparent);
          margin-bottom: 24px;
        }

        .hero-sub {
          font-size: 16px; font-weight: 300;
          color: var(--grey); line-height: 1.8;
          max-width: 460px; margin-bottom: 40px;
        }

        .hero-cta { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }

        .cta-note { font-size: 12px; color: var(--grey); margin-top: 14px; letter-spacing: 0.02em; }

        /* ── HERO IMAGE ── */
        .hero-right { display: flex; align-items: center; justify-content: flex-end; position: relative; }

        .logo-frame {
          position: relative;
          width: 100%; max-width: 420px;
        }

        /* Decorative geometric ring behind logo */
        .logo-ring {
          position: absolute;
          inset: -24px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.07);
          animation: spin-slow 30s linear infinite;
        }
        .logo-ring::before {
          content: "";
          position: absolute;
          top: 10%; left: -1px;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
        }
        @keyframes spin-slow { to { transform: rotate(360deg); } }

        .logo-ring-2 {
          position: absolute;
          inset: -52px;
          border-radius: 50%;
          border: 1px dashed rgba(255,255,255,0.04);
          animation: spin-slow 50s linear infinite reverse;
        }

        .logo-hero {
          width: 100%;
          border-radius: 28px;
          object-fit: contain;
          background: #ffffff;
          position: relative; z-index: 1;
          padding: 32px;
          box-shadow:
            0 0 0 1px rgba(26,122,46,0.15),
            0 24px 80px rgba(0,0,0,0.8),
            0 4px 24px rgba(0,0,0,0.5);
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%,100% { transform: translateY(0px) rotate(-0.3deg); }
          50% { transform: translateY(-12px) rotate(0.3deg); }
        }

        /* ── DIVIDER ── */
        .divider {
          display: flex; align-items: center; gap: 20px;
          margin: 16px 0 52px;
        }
        .divider-line { flex: 1; height: 1px; background: var(--border); }
        .divider-text { font-size: 11px; color: var(--mid); letter-spacing: 0.15em; text-transform: uppercase; }

        /* ── SECTION LABEL ── */
        .section-label {
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.18em; color: var(--grey);
          text-transform: uppercase; margin-bottom: 22px;
        }

        /* ── FEATURES ── */
        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
          margin-bottom: 14px;
        }

        .feature-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px; padding: 26px 22px;
          backdrop-filter: blur(10px);
          transition: border-color .3s, transform .3s, background .3s;
          position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: "";
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
        }
        .feature-card:hover {
          border-color: rgba(255,255,255,0.16);
          background: var(--surface-hover);
          transform: translateY(-5px);
        }

        .feature-num {
          font-family: "Playfair Display", serif;
          font-size: 42px; font-weight: 900;
          color: rgba(255,255,255,0.06);
          line-height: 1; margin-bottom: 14px;
          letter-spacing: -0.04em;
        }

        .feature-card h3 {
          font-family: "Playfair Display", serif;
          font-size: 17px; font-weight: 700;
          color: var(--white); margin-bottom: 10px;
          letter-spacing: -0.01em;
        }
        .feature-card p { font-size: 13.5px; color: var(--grey); line-height: 1.7; font-weight: 300; }

        /* ── STATS ── */
        .stats-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px; padding: 28px 24px;
          text-align: center;
          transition: border-color .25s, background .25s;
          position: relative; overflow: hidden;
        }
        .stat-card::after {
          content: "";
          position: absolute; bottom: 0; left: 20%; right: 20%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }
        .stat-card:hover {
          border-color: rgba(255,255,255,0.16);
          background: var(--surface-hover);
        }
        .stat-value {
          font-family: "Playfair Display", serif;
          font-size: 3rem; font-weight: 900;
          color: var(--white); letter-spacing: -0.04em;
          line-height: 1;
        }
        .stat-label {
          font-size: 12.5px; color: var(--grey);
          margin-top: 8px; font-weight: 300; letter-spacing: 0.01em;
        }

        /* ── FOOTER ── */
        footer {
          margin-top: 100px; padding: 40px 0;
          border-top: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-logo { height: 100px; border-radius: 20px; border: 1px solid var(--border-light); box-shadow: 0 15px 30px rgba(0,0,0,0.3); }
        .footer-copy { font-size: 12px; color: var(--grey); font-weight: 300; }

        /* ── MOBILE MENU ── */
        .hamburger {
          display: none;
          background: var(--surface); border: 1px solid var(--border-light);
          border-radius: 10px; padding: 9px; cursor: pointer;
          color: var(--white); transition: background .2s;
        }
        .hamburger:hover { background: var(--surface-hover); }

        #mobile-nav {
          display: none; position: fixed; inset: 0; z-index: 200;
          background: rgba(13,13,13,0.98); backdrop-filter: blur(30px);
          flex-direction: column; align-items: center; justify-content: center;
          gap: 32px;
        }
        #mobile-nav.open { display: flex; }
        #mobile-nav a {
          font-family: "Playfair Display", serif;
          font-size: 28px; font-weight: 700;
          color: var(--white); text-decoration: none;
          letter-spacing: -0.02em; transition: color .2s;
        }
        #mobile-nav a:hover { color: var(--light-grey); }
        .mobile-close {
          position: absolute; top: 24px; right: 24px;
          background: var(--surface); border: 1px solid var(--border-light);
          border-radius: 10px; padding: 9px 14px; cursor: pointer;
          color: var(--white); font-size: 18px;
        }

        /* ── ENTRANCE ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .hero-left > * { animation: fadeUp .7s cubic-bezier(.16,1,.3,1) both; }
        .hero-left > *:nth-child(1) { animation-delay: .05s; }
        .hero-left > *:nth-child(2) { animation-delay: .15s; }
        .hero-left > *:nth-child(3) { animation-delay: .22s; }
        .hero-left > *:nth-child(4) { animation-delay: .30s; }
        .hero-left > *:nth-child(5) { animation-delay: .38s; }
        .hero-left > *:nth-child(6) { animation-delay: .44s; }
        .hero-right { animation: fadeIn .9s ease .3s both; }

        .feature-card { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) both; }
        .feature-card:nth-child(1) { animation-delay: .5s; }
        .feature-card:nth-child(2) { animation-delay: .62s; }
        .feature-card:nth-child(3) { animation-delay: .74s; }

        .stat-card { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) both; }
        .stat-card:nth-child(1) { animation-delay: .8s; }
        .stat-card:nth-child(2) { animation-delay: .9s; }
        .stat-card:nth-child(3) { animation-delay: 1.0s; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .nav-links { display: none; }
          .nav-actions { display: none; }
          .hamburger { display: flex; }
        }
        @media (max-width: 768px) {
          .hero { grid-template-columns: 1fr; text-align: center; padding: 56px 0 40px; min-height: auto; }
          .hero-left { align-items: center; }
          .hero-right { order: -1; justify-content: center; }
          .logo-frame { max-width: 280px; }
          .logo-ring, .logo-ring-2 { display: none; }
          .features-grid, .stats-grid { grid-template-columns: 1fr; }
          .footer { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <div className="bg-layer"></div>

      {/* MOBILE NAV */}
      <div id="mobile-nav" className={isMobileMenuOpen ? 'open' : ''}>
        <button className="mobile-close" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        <a href="#accueil" onClick={() => setIsMobileMenuOpen(false)}>{t('home')}</a>
        <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>{t('landing_features_label')}</a>
        <a href="#stats" onClick={() => setIsMobileMenuOpen(false)}>{t('landing_stats_label')}</a>
        <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>{t('profile')}</a>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-outline" style={{ fontSize: '16px', padding: '13px 28px' }} onClick={onLogin}>{t('login_btn')}</button>
          <button className="btn btn-white" style={{ fontSize: '16px', padding: '13px 28px' }} onClick={onRegister}>{t('login_create_account')}</button>
        </div>
      </div>

      <div className="page-container">
        {/* NAV */}
        <nav>
          <div className="nav-brand">
            <img className="nav-logo" src="/nattat.jpeg" alt="Logo Nataal Tontine" />
          </div>

          <div className="nav-links">
            <a href="#accueil">{t('home')}</a>
            <a href="#features">{t('landing_features_label')}</a>
            <a href="#stats">{t('landing_stats_label')}</a>
            <a href="#about">{t('profile')}</a>
          </div>

          <div className="nav-actions">
            <button className="btn btn-outline" onClick={onLogin}>{t('login_title')}</button>
            <button className="btn btn-white" onClick={onRegister}>{t('register_title')}</button>
          </div>

          <button className="hamburger" onClick={() => setIsMobileMenuOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </nav>

        {/* HERO */}
        <section className="hero" id="accueil">
          <div className="hero-left">
            <div className="badge">
              <div className="badge-dot"></div>
              <span>{t('landing_hero_badge')}</span>
            </div>
            <h1 className="headline">{t('landing_hero_title')}</h1>
            <div className="headline-rule"></div>
            <p className="hero-sub">
              {t('landing_hero_sub')}
            </p>
            <div className="hero-cta">
              <button className="btn btn-white btn-lg" onClick={onRegister}>{t('landing_cta_start')}</button>
              <button className="btn btn-outline btn-lg" onClick={onLogin}>{t('landing_cta_view')}</button>
            </div>
            <p className="cta-note">{t('landing_cta_note')}</p>
          </div>

          <div className="hero-right">
            <div className="logo-frame">
              <div className="logo-ring"></div>
              <div className="logo-ring-2"></div>
              <img className="logo-hero" src="/hero image.jpeg" alt="Nataal Tontine Logo" />
            </div>
          </div>
        </section>

        <div className="divider">
          <div className="divider-line"></div>
          <div className="divider-text">{t('landing_divider_text')}</div>
          <div className="divider-line"></div>
        </div>

        {/* FEATURES */}
        <div className="section-label" id="features">{t('landing_features_label')}</div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-num">01</div>
            <h3>{t('landing_feat1_title')}</h3>
            <p>{t('landing_feat1_text')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-num">02</div>
            <h3>{t('landing_feat2_title')}</h3>
            <p>{t('landing_feat2_text')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-num">03</div>
            <h3>{t('landing_feat3_title')}</h3>
            <p>{t('landing_feat3_text')}</p>
          </div>
        </div>

        <div style={{ height: '40px' }} id="stats"></div>

        {/* STATS */}
        <div className="section-label">{t('landing_stats_label')}</div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">5M+</div>
            <div className="stat-label">{t('landing_stat1_label')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">100%</div>
            <div className="stat-label">{t('landing_stat2_label')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">24/7</div>
            <div className="stat-label">{t('landing_stat3_label')}</div>
          </div>
        </div>

        {/* FOOTER */}
        <footer>
          <img className="footer-logo" src="/nattat.jpeg" alt="Logo Nataal" />
          <div className="footer-copy">{t('landing_footer_copy')}</div>
        </footer>
      </div>
    </div>
  );
}
