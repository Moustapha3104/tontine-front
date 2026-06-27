import React, { useState, useEffect, useRef, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { api, assetUrl } from "./services/api";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import LandingPage from "./components/LandingPage";
import { LoanItem } from "./components/LoanItem";
import SpinWheel from "./components/SpinWheel";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from "./context/ThemeContext";
import { useLanguage, LanguageContext } from "./context/LanguageContext";
import PWAInstallBanner from "./components/PWAInstallBanner";

// ─── ERROR BOUNDARY ──────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("Error Boundary:", error, info); }
  static contextType = LanguageContext;
  render() {
    const { t } = this.context || { t: k => k };
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: "white", textAlign: "center", paddingTop: "40vh", background: "#000", minHeight: "100dvh" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ marginBottom: 12 }}>{t('error_occurred')}</h2>
          <button onClick={() => window.location.reload()} style={{ padding: "12px 24px", borderRadius: 14, border: "none", background: "#FFF", color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{t('refresh')}</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── ICONS (PREMIUM) ──────────────────────────────────────────────────────────
const PremiumHomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg>
);
const PremiumTontineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M17.5 14v7M14 17.5h7" /></svg>
);
const PremiumTirageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" /></svg>
);
const PremiumNotifIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
);
const PremiumRappelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
);
const PremiumMembersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
);
const PremiumFinanceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
);
const PremiumProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const LogoutIconPremium = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a1515" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
);
const RefreshIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>
);
const CloseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const LogoutIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
);
const CheckIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);




// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const GLOBAL_CSS = ``;

// ─── MODAL ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, forced = false }) {
  return (
    <div className="mdl" onClick={forced ? undefined : onClose}>
      <div className="mdl-c" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--white)" }}>{title}</span>
          {!forced && (
            <button onClick={onClose} className="mact" style={{ width: 32, height: 32, background: "var(--surface-hover)", borderRadius: "50%" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}


// ─── PAGES ───────────────────────────────────────────────────────────────────

function HomePage({ tontine, tours, transactions, onCotiser, onLoan, loading, onRefresh, refreshing, isGerant, userId, memberDashboard, tirage, isMembre, onSetPage, stats, cotisation }) {
  const { t } = useLanguage();

  // Non-gerant member who hasn't joined any tontine yet
  if (!isGerant && !isMembre && !loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24, padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: 72 }}>🏦</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10, letterSpacing: '-0.02em' }}>{t('no_tontine_title')}</div>
          <div style={{ fontSize: 13, color: 'var(--grey)', maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>{t('no_tontine_sub')}</div>
        </div>
        <button
          onClick={() => onSetPage?.('tontines')}
          className="btn-w"
          style={{ background: 'var(--primary)', color: '#FFF', border: 'none', boxShadow: '0 4px 14px var(--primary-glow)', paddingInline: 32, marginTop: 8 }}
        >
          {t('no_tontine_btn')}
        </button>
      </div>
    );
  }

  if (loading || refreshing || (!tontine && isMembre)) return (
    <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
      <div style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: 24, marginBottom: 12 }}>⟳</div>
      <div>{t('loading')}</div>
    </div>
  );

  if (!tontine) return null;

  const personalHistory = memberDashboard?.history || transactions.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 0 16px" }}>

      {/* Welcome Message for Member */}
      {!isGerant && memberDashboard && (
        <div style={{ padding: "8px 4px 0" }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>{t('welcome_message')}, {memberDashboard.membre.name}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.62)", marginTop: 4 }}>
            {t('welcome_subtitle')}
          </div>
        </div>
      )}

      {/* Bannière bénéficiaire du mois */}
      {!isGerant && tirage?.tirageActuel && tirage.tirageActuel.membre_id === memberDashboard?.membre?.id && (
        <div style={{
          background: "linear-gradient(135deg, #1a7a2e, #155a22)",
          borderRadius: 20, padding: "18px 18px",
          display: "flex", alignItems: "center", gap: 14,
          animation: "fadeIn .4s ease"
        }}>
          <div style={{ fontSize: 36 }}>🎉</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#FFF" }}>{t('beneficiary_banner_title')}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 3 }}>
              {tirage.tirageActuel.statut === 'envoyé'
                ? `✅ ${tirage.tirageActuel.montant?.toLocaleString('fr-FR')} FCFA ${t('amount_sent')}`
                : `${tirage.tirageActuel.montant?.toLocaleString('fr-FR')} FCFA ${t('amount_will_be_sent')}`
              }
            </div>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: 10, flexShrink: 0 }}>
            {tirage.tirageActuel.statut === 'envoyé' ? t('status_received') : t('status_pending')}
          </div>
        </div>
      )}

      {/* Balances */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
        <button onClick={onRefresh} disabled={refreshing} style={{
          background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "#D1D1DE", cursor: "pointer",
          borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 600, opacity: refreshing ? 0.5 : 1,
          transition: "all .2s", backdropFilter: "blur(8px)"
        }}>
          <RefreshIcon size={14} />
          {refreshing ? t('refreshing') : t('update_data')}
        </button>
      </div>

      {/* Main Card */}
      <div className="card" style={{ background: "linear-gradient(145deg, rgba(255,255,255,.11), rgba(255,255,255,.04))", backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="sc-label" style={{ color: "rgba(255,255,255,.62)" }}>{t('active_cycle')}</div>
            <div className="sb-status" style={{ background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.12)", color: "#FFF" }}>
              <div className="sb-pip" style={{ background: "#00C853", boxShadow: "0 0 8px rgba(0, 200, 83, 0.8)" }}></div>
              {t('system_active')} • {t('current_tour')} {tontine.tour_actuel}/{tontine.tour_total}
            </div>
          </div>
          {tours && tours.find(tour => tour.statut === 'en_attente') && (
            <div style={{ textAlign: "right" }}>
              <div className="sc-label" style={{ color: "rgba(255,255,255,.62)" }}>{t('next_beneficiary')}</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{tours.find(tour => tour.statut === 'en_attente').membre_name}</div>
            </div>
          )}
        </div>

        <div style={{ fontSize: 13, marginBottom: 4, color: "rgba(255,255,255,.66)" }}>{t('total_pool')}</div>
        <div className="sc-val" style={{ fontSize: "clamp(28px, 8vw, 38px)" }}>
          {(tontine.cagnotte || 0).toLocaleString('fr-FR')} F
        </div>

        <div style={{ marginTop: 18, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,.64)", marginBottom: 6 }}>
            <span>{t('cycle_progression')}</span><span>{tontine.progression || 0}%</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,.14)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${tontine.progression || 0}%`, height: "100%", background: "linear-gradient(90deg, var(--primary), var(--primary-light))", borderRadius: 3, transition: "width .6s ease" }} />
          </div>
        </div>

        {!isGerant && (
          <button className="btn-w" onClick={onCotiser} style={{ background: "linear-gradient(145deg,#1a7a2e,#155a22)", color: "#FFF", border: "1px solid rgba(255,255,255,.16)" }}>
            <div style={{ width: 16, height: 16, background: "var(--primary-light)", borderRadius: 4, flexShrink: 0 }} />
            {t('pay_cotisation_wave')}
          </button>
        )}
      </div>


      {/* Bento */}
      <div className="sg">
        {[
          { label: isGerant ? t('target_cotisation') : t('amount_contributed'), value: isGerant ? `${cotisation.toLocaleString('fr-FR')} F` : `${(stats.totalCotisations || 0).toLocaleString()} F`, sub: isGerant ? t('per_member_month') : t('total_personal') },
          { label: isGerant ? t('current_tour') : t('next_tour'), value: isGerant ? `${tontine.tour_actuel}/${tontine.tour_total}` : (stats.nextTourOrder ? `Tour #${stats.nextTourOrder}` : "N/A"), sub: isGerant ? t('global_progress') : t('estimated_order') },
        ].map(c => (
          <div key={c.label} className="sc">
            <div className="sc-label">{c.label}</div>
            <div className="sc-val" style={{ fontSize: "clamp(20px, 5vw, 24px)" }}>{c.value}</div>
            <div className="sc-tag">{c.sub}</div>
          </div>
        ))}
      </div>


      {/* Tour Actions (Gérant) */}
      {isGerant && tours && tours.find(tour => tour.statut === 'en_attente') && (() => {
        const nextTour = tours.find(tour => tour.statut === 'en_attente');
        const nextTourApprobations = JSON.parse(nextTour.approbations || "[]");
        const alreadySigned = nextTourApprobations.includes(userId);
        const signCount = nextTourApprobations.length;

        return (
          <button
            className="btn-o"
            onClick={async () => {
              if (alreadySigned) return;
              const msg = signCount === 0
                ? t('sign_payout_1').replace('{amount}', nextTour.montant.toLocaleString('fr-FR')).replace('{name}', nextTour.membre_name)
                : t('sign_payout_2');

              if (window.confirm(msg)) {
                try {
                  await api.completeTour(nextTour.id);
                  onRefresh();
                } catch (e) { alert(e.message); }
              }
            }}
            disabled={alreadySigned}
            style={{
              width: "100%",
              justifyContent: "space-between",
              marginTop: 4,
              opacity: alreadySigned ? 0.6 : 1
            }}
          >
            <span>{alreadySigned ? `✓ ${t('signed_payout')}` : signCount === 0 ? `${t('sign_for_payout')} (1/2)` : `${t('confirm_payout_msg')} (2/2)`}</span>
            <span style={{ fontSize: 11, background: "#333", padding: "2px 8px", borderRadius: 10 }}>{signCount}/2</span>
          </button>

        );
      })()}

      {/* Actions - Masqués pour le gérant */}
      {!isGerant && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
          <button className="btn-w" onClick={onCotiser}>
            <div style={{ width: 16, height: 16, background: "#FF7900", borderRadius: 4, flexShrink: 0 }} />
            {t('pay_cotisation_orange')}
          </button>
          <button className="btn-o" onClick={onLoan} style={{ width: "100%" }}>
            {t('make_loan_request')}
          </button>
        </div>

      )}

      {/* Activity */}
      <div style={{ marginTop: 16 }}>
        <div className="sc-label" style={{ marginLeft: 4 }}>{isGerant ? t('recent_activity_log') : t('recent_activity')}</div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {personalHistory.length === 0 && (
            <div className="card" style={{ textAlign: "center", color: "var(--grey)", padding: 32 }}>
              {t('no_recent_activity')}
            </div>
          )}
          {personalHistory.map(tx => (
            <div key={tx.id} className="tr">
              <div className="mav">{tx.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-name">{tx.name}</div>
                <div className="t-sub">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
              <div style={{ fontWeight: 700, color: tx.type === 'cotisation' ? "var(--white)" : "var(--danger)", fontSize: 13 }}>
                {tx.type === 'cotisation' ? '+' : '-'}{tx.amount.toLocaleString()} F
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}


function FinancesPage({ stats, transactions, prets, onCotiser, onLoan, isGerant, onRefresh, userId, memberId }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState("dashboard");
  const [exporting, setExporting] = useState(false);
  const [dashData, setDashData] = useState(null);
  const [loanFilter, setLoanFilter] = useState("Tous");

  useEffect(() => {
    api.getFinanceDashboard().then(data => setDashData(data)).catch(console.error);
  }, [stats, transactions]);

  const tabStyle = (active) => ({
    flex: 1, padding: "10px 0", textAlign: "center", borderRadius: 14,
    background: active ? "rgba(255,255,255,.92)" : "transparent", color: active ? "#0A0A12" : "rgba(255,255,255,.58)",
    fontWeight: 700, fontSize: 13, border: "1px solid transparent", cursor: "pointer", transition: "all .2s"
  });

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await api.exportReport(format);
    } catch (e) {
      alert("Erreur lors de l'export: " + e.message);
    } finally {
      setExporting(false);
    }
  };

  if (!stats) return (
    <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
      <div style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: 24, marginBottom: 12 }}>⟳</div>
      <div>{t('loading')}</div>
    </div>
  );

  // Loan data
  const LOAN_FILTERS = [
    { key: "Tous", label: t('all') },
    { key: "En attente", label: t('pending') },
    { key: "Approuvé", label: t('approved') },
    { key: "Remboursé", label: t('repaid') },
    { key: "Rejeté", label: t('rejected') },
  ];
  const userPrets = isGerant ? prets : prets.filter(p => p.membre_id === memberId);
  const filteredPrets = loanFilter === "Tous"
    ? userPrets
    : userPrets.filter(p => p.status === loanFilter);

  const d = dashData || {};
  const topCotisants = d.topCotisants || [];
  const maxCotisant = topCotisants.length > 0 ? Math.max(...topCotisants.map(c => c.total), 1) : 1;
  const chartData = d.chartData || [];
  
  const filteredTransactions = isGerant ? transactions : transactions.filter(tx => tx.membre_id === memberId);
  const dernieres = isGerant ? (d.dernieresTransactions || transactions.slice(0, 20)) : filteredTransactions.slice(0, 20);
  const totalTx = isGerant ? (d.totalTransactions || transactions.length) : filteredTransactions.length;

  const sectionCard = { background: 'rgba(255,255,255,.07)', borderRadius: 20, padding: '16px 14px', border: '1px solid rgba(255,255,255,.10)', backdropFilter: 'blur(10px)' };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 0 16px" }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, color: 'rgba(255,255,255,.58)' }}>
          {t('financial_performance')}
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)',
            padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, color: '#00C853'
          }}>
            <div style={{ width: 5, height: 5, background: '#00C853', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            {t('real_time')}
          </div>
          {isGerant && (
            <>
              <button onClick={() => handleExport('pdf')} disabled={exporting} style={{
                background: '#1A1A1A', color: '#FF5252', border: '1px solid #222',
                padding: '5px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700, cursor: 'pointer'
              }}>📄 PDF</button>
              <button onClick={() => handleExport('xlsx')} disabled={exporting} style={{
                background: '#1A1A1A', color: '#00C853', border: '1px solid #222',
                padding: '5px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700, cursor: 'pointer'
              }}>📊 Excel</button>
            </>
          )}
        </div>
      </div>

      <div className="tab-strip">
        {["dashboard", "prets"].map(id => (
          <button key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>
            {id === "dashboard" ? t('dashboard_overview') : `${t('loans')}${userPrets.length > 0 ? ` (${userPrets.length})` : ''}`}
          </button>
        ))}
      </div>
      <div className="page-sub" style={{ margin: "2px 4px 10px" }}>
        {t('finance_intro')}
      </div>


      {tab === "dashboard" ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* ── 3 Stat Cards ────────────────────────────── */}
          <div className="sg" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              {
                label: t('cotisations_today'),
                value: d.cotisationsJour?.count || 0,
                sub: `${(d.cotisationsJour?.total || 0).toLocaleString('fr-FR')} F collectés`,
                color: 'var(--success)',
              },
              {
                label: t('pending_penalties'),
                value: d.penalites?.count || 0,
                sub: `${d.penalites?.membresEnRetard || 0} en retard`,
                color: 'var(--warning)',
              },
              {
                label: t('active_loans'),
                value: d.pretsEnCours?.count || 0,
                sub: `${(d.pretsEnCours?.total || 0).toLocaleString('fr-FR')} F`,
                color: 'var(--primary-2)',
              },
            ].map(c => (
              <div key={c.label} className="sc">
                <div className="sc-label">{c.label}</div>
                <div className="sc-val" style={{ color: c.color }}>{c.value}</div>
                <div className="sc-tag">{c.sub}</div>
              </div>
            ))}
          </div>


          {/* ── Top Cotisants + Résumé Session ──────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* TOP COTISANTS */}
            <div className="card">
              <div className="sc-label" style={{ marginBottom: 14 }}>
                {t('top_contributors')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topCotisants.map((c, i) => {
                  const barColors = ['var(--primary)', 'var(--primary-2)', '#BB8FCE', '#82E0AA'];
                  const barWidth = maxCotisant > 0 ? Math.max((c.total / maxCotisant) * 100, 6) : 6;
                  const firstName = (c.name || '').split(' ')[0];
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 50, fontSize: 11, fontWeight: 600, color: 'var(--grey)', flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstName}</div>
                      <div style={{ flex: 1, height: 6, background: 'var(--surface-hover)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${barWidth}%`, height: '100%',
                          background: barColors[i % barColors.length],
                          borderRadius: 3, transition: 'width .6s ease'
                        }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--white)', flexShrink: 0, minWidth: 30, textAlign: 'right' }}>
                        {c.total >= 1000 ? `${Math.round(c.total / 1000)}k` : c.total || 0}
                      </div>
                    </div>
                  );
                })}
                {topCotisants.length === 0 && (
                  <div style={{ fontSize: 11, color: 'var(--mid)', textAlign: 'center', padding: '8px 0' }}>{t('no_data')}</div>
                )}
              </div>
            </div>

            {/* RÉSUMÉ SESSION */}
            <div className="card">
              <div className="sc-label" style={{ marginBottom: 14 }}>
                {t('cycle_summary')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: t('total_collected'), value: `${(d.resume?.totalCollecte || 0).toLocaleString('fr-FR')} F` },
                  { label: t('pending_penalties'), value: `${(d.resume?.totalPenalites || 0).toLocaleString('fr-FR')} F` },
                  { label: t('active_loans'), value: `${(d.resume?.totalPretsDecaisses || 0).toLocaleString('fr-FR')} F` },
                  { label: t('loan_repayment_rate'), value: `${d.resume?.tauxCotisation || 0}%` },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--grey)' }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--white)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* ── Chart: Activité en temps réel ──────────── */}
          <div style={sectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#FFF' }}>{t('real_time_flow')}</span>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { color: '#4ECDC4', label: t('cotisation') },
                  { color: '#FF7900', label: t('penalty') },
                  { color: '#1DC0F1', label: t('loan') },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#666' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
            {chartData.length > 0 ? (
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#555' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#555' }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                    <Tooltip
                      contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 12, fontSize: 12 }}
                      itemStyle={{ fontWeight: 700 }}
                      formatter={(value) => [`${value.toLocaleString('fr-FR')} F`]}
                    />
                    <Line type="monotone" dataKey="cotisation" stroke="#4ECDC4" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="penalite" stroke="#FF7900" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="pret" stroke="#1DC0F1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 12 }}>
                {t('no_activity_period')}
              </div>
            )}
          </div>

          {/* ── Dernières transactions ─────────────────── */}
          <div>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, color: '#666', display: 'block', marginBottom: 10, marginLeft: 4 }}>
              {t('latest_transactions')}
              <span style={{ marginLeft: 8, background: '#222', padding: '2px 8px', borderRadius: 8, fontSize: 9, color: '#555', fontWeight: 700 }}>{totalTx} tx</span>
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dernieres.length === 0 && (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.52)', padding: 32, background: 'rgba(255,255,255,.07)', borderRadius: 20, border: '1px solid rgba(255,255,255,.10)' }}>{t('no_transaction')}</div>
              )}
              {dernieres.map(tx => (
                <div key={tx.id} style={{
                  background: 'rgba(255,255,255,.07)', borderRadius: 20, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,.10)', backdropFilter: 'blur(8px)'
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: tx.color || '#333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#888', flexShrink: 0
                  }}>{tx.initials}</div>
                  <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.name}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                    {tx.type === 'cotisation' ? t('cotisation') : tx.type === 'penalite' ? t('penalty') : tx.type === 'pret' ? t('loan') : tx.type === 'tirage' ? t('draw') : t('disbursement')}
                      {' · '}{new Date(tx.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: tx.type === 'cotisation' ? '#FFF' : '#FF5252', flexShrink: 0, marginLeft: 8, fontSize: 14 }}>
                    {tx.type === 'cotisation' ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')} F
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {!isGerant && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={onCotiser} style={{
                background: '#FFF', color: '#000', border: 'none', padding: 14, borderRadius: 20,
                fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%'
              }}>{t('pay_cotisation_wave')}</button>
              <button onClick={onLoan} style={{
                background: 'rgba(255,255,255,.07)', color: '#FFF', border: '1px solid rgba(255,255,255,.12)', padding: 14, borderRadius: 20,
                fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%'
              }}>{t('make_loan_request')}</button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ── Loan Stats Row ────────────────────────────────── */}
          {userPrets.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { label: t('loan_total_borrowed'), value: userPrets.reduce((a, p) => a + (p.montant || 0), 0), color: "#FFF" },
                { label: t('loan_pending_count'), value: userPrets.filter(p => p.status === 'En attente').length, color: "#FF7900", isCount: true },
                { label: t('loan_repaid_count'), value: userPrets.filter(p => p.status === 'Remboursé').length, color: "#00C853", isCount: true },
              ].map(c => (
                <div key={c.label} style={{ background: 'rgba(255,255,255,.07)', borderRadius: 20, padding: '12px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,.10)' }}>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,.52)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>{c.label}</div>
                  <div style={{ fontSize: c.isCount ? 22 : 14, fontWeight: 800, color: c.color, letterSpacing: c.isCount ? 0 : -0.5 }}>
                    {c.isCount ? c.value : `${c.value.toLocaleString('fr-FR')} F`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Filter Pills ──────────────────────────────────── */}
          {userPrets.length > 0 && (
            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
              {LOAN_FILTERS.map(({ key, label }) => {
                const count = key === "Tous" ? userPrets.length : userPrets.filter(p => p.status === key).length;
                const isActive = loanFilter === key;
                const FCOLORS = { "En attente": "#FF7900", "Approuvé": "#1DC0F1", "Remboursé": "#00C853", "Rejeté": "#FF5252" };
                const accentColor = FCOLORS[key] || "#FFF";
                return (
                  <button
                    key={key}
                    onClick={() => setLoanFilter(key)}
                    style={{
                      background: isActive ? (key === "Tous" ? "#FFF" : accentColor) : "#1A1A1A",
                      color: isActive ? (key === "Tous" ? "#000" : "#fff") : "#666",
                      border: isActive ? "none" : `1px solid #2A2A2A`,
                      padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s",
                      display: "flex", alignItems: "center", gap: 5, flexShrink: 0
                    }}
                  >
                    {label}
                    {count > 0 && (
                      <span style={{
                        background: isActive ? "rgba(0,0,0,0.2)" : "#333",
                        color: isActive ? "#fff" : "#888",
                        fontSize: 10, fontWeight: 800,
                        padding: "1px 6px", borderRadius: 10
                      }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Loans List ────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredPrets.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px 20px",
                background: "#111", borderRadius: 20,
                border: "1px dashed #2A2A2A"
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>
                  {loanFilter === "Tous" ? "📋" : loanFilter === "En attente" ? "⏳" : loanFilter === "Remboursé" ? "✅" : loanFilter === "Rejeté" ? "❌" : "📄"}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#666", marginBottom: 6 }}>
                  {loanFilter === "Tous" ? t('loan_none') : `${t('loan_none_filtered')} "${loanFilter}"`}
                </div>
                {loanFilter === "Tous" && (
                  <button onClick={onLoan} style={{
                    marginTop: 12, background: "#FFF", color: "#000", border: "none",
                    padding: "10px 20px", borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: "pointer"
                  }}>
                    {t('loan_create_request')}
                  </button>
                )}
              </div>
            ) : (
              filteredPrets.map(l => (
                <LoanItem key={l.id} l={l} isGerant={isGerant} onRefresh={onRefresh} userId={userId} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MembresPage({ membres, isGerant, onRefresh, onOpenMessage, onAddMember, onEditMember, onDeleteMember }) {
  const { t } = useLanguage();
  const [sending, setSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchMethod, setBatchMethod] = useState("wave");
  const [batchLoading, setBatchLoading] = useState(false);

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBatchCotiser = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Encaisser les cotisations pour les ${selectedIds.length} membres sélectionnés via ${batchMethod} ?`)) return;
    setBatchLoading(true);
    try {
      const res = await api.cotiserBatch(batchMethod, selectedIds);
      alert(res.message);
      setSelectedIds([]);
      if (onRefresh) onRefresh();
    } catch (e) {
      alert("Erreur: " + e.message);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleSendReminders = async () => {
    if (!window.confirm(t('confirm_reminder_all'))) return;
    setSending(true);
    try {
      const res = await api.sendReminders();
      alert(res.message);
    } catch (e) {
      alert("Erreur: " + e.message);
    } finally {
      setSending(false);
    }
  };

  const handleApplyPenalty = async (m) => {
    if (!window.confirm(`Appliquer une pénalité automatique de retard pour ${m.name} ?`)) return;
    try {
      const res = await api.applyPenalty(m.id);
      alert(res.message);
      if (onRefresh) onRefresh();
    } catch (e) {
      alert("Erreur: " + e.message);
    }
  };

  if (!membres || !membres.length) return (
    <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
      <div>{t('no_member_found')}</div>
    </div>
  );

  const paid = membres.filter(m => m.paid).length;
  const percent = membres.length ? Math.round(paid / membres.length * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 0 16px" }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        {isGerant && (
          <button className="btn-o" onClick={onAddMember}>
            + {t('members')}
          </button>
        )}
        <button className="btn-o" onClick={handleSendReminders} disabled={sending} style={{ opacity: sending ? 0.7 : 1 }}>
          {sending ? t('refreshing') : t('send_reminders')}
        </button>
      </div>
      {/* Stats */}
      <div className="sg" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        {[
          { label: t('members').toUpperCase(), value: membres.length },
          { label: t('paid_members').toUpperCase(), value: paid },
          { label: t('pending').toUpperCase(), value: membres.length - paid },
        ].map(c => (
          <div key={c.label} className="sc" style={{ textAlign: "center" }}>
            <div className="sc-label">{c.label}</div>
            <div className="sc-val" style={{ fontSize: "clamp(22px, 6vw, 28px)" }}>{c.value}</div>
          </div>
        ))}
      </div>


      {/* Progress bar */}
      {/* Progress bar */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10, fontWeight: 600 }}>
          <div className="sc-label">{t('loan_repayment_rate') || "Taux de paiement global"}</div>
          <span style={{ color: "var(--success)" }}>{percent}%</span>
        </div>
        <div style={{ height: 8, background: "var(--surface-hover)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${percent}%`, height: "100%", background: "var(--success)", borderRadius: 4, transition: "width .6s ease" }} />
        </div>
      </div>


      {/* Component pour cotisation par lot */}
      {isGerant && selectedIds.length > 0 && (
        <div style={{ background: "var(--primary)", borderRadius: 20, padding: 16, animation: "fadeIn .3s ease" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#FFF", marginBottom: 12 }}>
            {selectedIds.length} {t('batch_selected')}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setBatchMethod('wave')} style={{ flex: 1, padding: 8, borderRadius: 10, border: "none", background: batchMethod === 'wave' ? "var(--primary-light)" : "#000", color: batchMethod === 'wave' ? "#000" : "#FFF", fontWeight: 700, cursor: "pointer" }}>Wave</button>
            <button onClick={() => setBatchMethod('orange')} style={{ flex: 1, padding: 8, borderRadius: 10, border: "none", background: batchMethod === 'orange' ? "#FF7900" : "#000", color: batchMethod === 'orange' ? "#000" : "#FFF", fontWeight: 700, cursor: "pointer" }}>Orange Money</button>
            <button onClick={() => setBatchMethod('especes')} style={{ flex: 1, padding: 8, borderRadius: 10, border: "none", background: batchMethod === 'especes' ? "#FFF" : "#000", color: batchMethod === 'especes' ? "#000" : "#FFF", fontWeight: 700, cursor: "pointer" }}>Espèces</button>
          </div>
          <button onClick={handleBatchCotiser} disabled={batchLoading} style={{ width: "100%", background: "#000", color: "#FFF", border: "none", padding: 14, borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: batchLoading ? 0.7 : 1 }}>
            {batchLoading ? t('refreshing') : t('confirm_action')}
          </button>
        </div>
      )}

      {/* Member list */}
      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700, color: "rgba(255,255,255,.56)", marginLeft: 4 }}>{t('members_list')}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {membres.map(m => (
          <div key={m.id} style={{
            background: "var(--surface)", borderRadius: 20, padding: "12px 14px",
            display: "flex", alignItems: "center", flexDirection: "column",
            border: selectedIds.includes(m.id) ? "2px solid var(--primary)" : "1px solid var(--border)",
            cursor: !m.paid && isGerant ? "pointer" : "default"
          }} onClick={() => { if (!m.paid && isGerant) toggleSelection(m.id); }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              {isGerant && !m.paid && (
                <div style={{ width: 22, height: 22, borderRadius: 6, border: "2px solid var(--border-light)", background: selectedIds.includes(m.id) ? "var(--primary)" : "transparent", marginRight: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {selectedIds.includes(m.id) && <CheckIcon />}
                </div>
              )}
              <div style={{
                width: 42, height: 42, borderRadius: '50%', background: m.color || '#2A2A2A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#aaa', flexShrink: 0, overflow: 'hidden'
              }}>
                {m.photo
                  ? <img src={assetUrl(m.photo)} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : m.initials
                }
              </div>
              <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--grey)', marginTop: 2 }}>
                  {m.role === 'GÃ©rant' ? 'Gérant' : m.role} • {t('turn')} #{m.turn_number}
                </div>
                {m.telephone && (
                  <div style={{ fontSize: 11, color: 'var(--light-grey)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📞 {m.telephone}
                  </div>
                )}
                {m.email && (
                  <div style={{ fontSize: 11, color: 'var(--light-grey)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ✉️ {m.email}
                  </div>
                )}
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                background: m.paid ? "rgba(0,200,83,.12)" : "rgba(255,82,82,.12)",
                padding: "5px 10px", borderRadius: 20, flexShrink: 0
              }}>
                {m.paid ? <CheckIcon /> : null}
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: m.paid ? "#00C853" : "#FF5252"
                }}>{m.paid ? t('paid') : t('pending')}</span>
              </div>
            </div>

            {/* Boutons d'actions Gérant */}
            {isGerant && (
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px dashed #222', paddingTop: 8, width: '100%', flexWrap: 'wrap' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenMessage(m); }}
                  style={{ background: '#222', color: '#FFF', border: 'none', padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  ✉️
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEditMember(m); }}
                  style={{ background: 'var(--primary)', color: '#FFF', border: 'none', padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  ✏️ {t('edit')}
                </button>
                {!m.paid && (
                  <button onClick={(e) => { e.stopPropagation(); handleApplyPenalty(m); }} style={{ background: '#FF5252', color: '#FFF', border: 'none', padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    + {t('penalty')}
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteMember(m); }}
                  style={{ background: '#3a1c1c', color: '#FF5252', border: '1px solid #FF525233', padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ParametresPage({ logout }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const RowCard = ({ children }) => (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 16 }}>
      {children}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0 16px" }}>
      <div className="sc-label" style={{ marginLeft: 4 }}>{t('dashboard_overview')} & {t('profile')}</div>

      <RowCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900 }}>{t('change_language')}</div>
            <div style={{ fontSize: 11, color: "var(--grey)", marginTop: 2 }}>{language.toUpperCase()}</div>
          </div>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{
            background: "var(--surface-hover)", border: "1px solid var(--border-light)", color: "var(--white)",
            padding: "10px 12px", borderRadius: 14, fontWeight: 900, outline: "none"
          }}>
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
            <option value="wo">🇸🇳 Wolof</option>
          </select>
        </div>
      </RowCard>

      <button className="btn-o" onClick={() => setPwdOpen(true)} style={{ width: "100%", padding: 16, borderRadius: 20, justifyContent: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 18 }}>🔑</span>
        <span style={{ fontWeight: 800 }}>{t('change_password')}</span>
      </button>

      <button onClick={() => setShowLogoutConfirm(true)} style={{
        background: "rgba(255, 82, 82, 0.1)", color: "var(--danger)", border: "1px solid rgba(255, 82, 82, 0.2)",
        padding: "16px", borderRadius: 20, fontSize: 15, fontWeight: 900,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        width: "100%", transition: "opacity .2s", marginTop: 10
      }}>
        <LogoutIcon />
        {t('logout')}
      </button>

      {pwdOpen && (
        <Modal title={t('change_password')} onClose={() => setPwdOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: "#888", fontWeight: 800, marginBottom: 6 }}>{t('old_password')}</div>
              <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} style={{ width: "100%", padding: "12px 12px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--white)", outline: "none" }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#888", fontWeight: 800, marginBottom: 6 }}>{t('new_password')}</div>
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} style={{ width: "100%", padding: "12px 12px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--white)", outline: "none" }} />
            </div>
            <button
              onClick={async () => {
                if (!oldPass || !newPass) return alert(t('fill_all_fields'));
                setPwdSaving(true);
                try {
                  await api.updatePassword({ oldPass, newPass });
                  alert(t('password_changed_msg'));
                  setPwdOpen(false);
                  setOldPass('');
                  setNewPass('');
                } catch (e) {
                  alert(e.message);
                } finally {
                  setPwdSaving(false);
                }
              }}
              disabled={pwdSaving}
              style={{ marginTop: 6, background: "var(--primary)", color: "#fff", border: "none", padding: "14px 14px", borderRadius: 16, fontWeight: 900, cursor: pwdSaving ? "not-allowed" : "pointer", boxShadow: "0 4px 14px var(--primary-glow)" }}
            >
              {pwdSaving ? t('settings_saving') : t('validate_change')}
            </button>
          </div>
        </Modal>
      )}

      {showLogoutConfirm && (
        <Modal title={t('logout_confirm_title')} onClose={() => setShowLogoutConfirm(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 48 }}></div>
            <div style={{ fontSize: 14, color: 'var(--grey)', lineHeight: 1.6 }}>{t('logout_confirm_msg')}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-o" style={{ flex: 1 }}>{t('logout_confirm_no')}</button>
              <button onClick={() => { setShowLogoutConfirm(false); logout(); }} className="btn-w" style={{ flex: 1, background: 'var(--danger)', color: '#FFF', border: 'none' }}>{t('logout_confirm_yes')}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ProfilPage({ user, onSetPage }) {
  const { t } = useLanguage();
  const initials = (user.initials || user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "??");
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [photo, setPhoto] = useState(undefined); // undefined = unchanged
  const [photoPreview, setPhotoPreview] = useState(user.photo ? assetUrl(user.photo) : null);
  const [error, setError] = useState('');

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError(t('photo_too_large')); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setPhoto(reader.result); setPhotoPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0 16px" }}>
      <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "28px 20px" }}>
        <div className="u-av" style={{ width: 80, height: 80, fontSize: 28, marginBottom: 14 }}>
          {user.photo ? <img src={assetUrl(user.photo)} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{user.name}</div>
        <div className="msub" style={{ marginBottom: 8 }}>{user.email}</div>
        <div className="u-role-badge" style={{
          background: user.role === 'admin' ? 'rgba(255,215,0,0.15)' : user.role === 'gerant' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.08)',
          color: user.role === 'admin' ? '#FFD700' : user.role === 'gerant' ? '#A78BFA' : '#FFF',
          padding: '4px 12px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 800,
          border: user.role === 'admin' ? '1px solid rgba(255,215,0,0.3)' : user.role === 'gerant' ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.15)',
          marginBottom: 16,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4
        }}>
          {user.role === 'admin' ? 'Super Admin' : user.role === 'gerant' ? 'Gérant' : 'Membre'}
        </div>
        <button className="btn-w" onClick={() => setEditOpen(true)} style={{ background: "var(--primary)", color: "#FFF" }}>{t('edit_profile')}</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { label: t('page_privacy'), icon: "🔒", id: "privacy" },
          { label: t('page_cgu'), icon: "📄", id: "cgu" },
          { label: t('page_faq'), icon: "❓", id: "faq" },
        ].map((o) => (
          <button key={o.id} onClick={() => onSetPage(o.id)} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 18, padding: "14px 14px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            color: "var(--white)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{o.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 900 }}>{o.label}</span>
            </div>
            <span style={{ color: "var(--grey)", fontWeight: 900 }}>›</span>
          </button>
        ))}
      </div>

      {editOpen && (
        <Modal title={t('edit_profile')} onClose={() => setEditOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {error && <div style={{ color: 'var(--danger)', fontSize: 12, textAlign: 'center' }}>{error}</div>}

            {/* Photo Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface)', padding: 14, borderRadius: 20, border: '1px solid var(--border)', marginBottom: 8 }}>
              <label htmlFor="profile-photo-upload" style={{ cursor: 'pointer', flexShrink: 0 }}>
                <div className="u-av" style={{ width: 64, height: 64, fontSize: 24, border: '1px dashed var(--border-light)' }}>
                  {photoPreview
                    ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials
                  }
                </div>
              </label>
              <input id="profile-photo-upload" type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t('photo')}</div>
                <div style={{ fontSize: 11, color: 'var(--grey)' }}>{t('profile_click_to_modify')}</div>
                {photoPreview && (
                  <button onClick={() => { setPhoto(''); setPhotoPreview(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 11, cursor: 'pointer', padding: 0, marginTop: 4, fontWeight: 700 }}>
                    ✕ {t('remove_photo')}
                  </button>
                )}
              </div>
            </div>

            <div className="ff">
              <label className="fl2">{t('register_name_label')}</label>
              <input value={name} onChange={e => setName(e.target.value)} className="fi3" />
            </div>
            <div className="ff">
              <label className="fl2">{t('modal_email_label_short')}</label>
              <input value={email} onChange={e => setEmail(e.target.value)} className="fi3" />
            </div>

            <button onClick={async () => {
              setSaving(true);
              setError('');
              try {
                const photoToSend = photo === undefined ? undefined : photo;
                await api.updateProfile({ name, email, photo: photoToSend });
                setEditOpen(false);
                window.location.reload(); // Refresh to show new data
              } catch (e) { setError(e.message); } finally { setSaving(false); }
            }} disabled={saving} className="btn-w" style={{ background: "var(--primary)", color: "#FFF", padding: 14, marginTop: 10 }}>
              {saving ? t('saving') : t('save_changes')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PrivacyPage() {
  const { t } = useLanguage();
  return (
    <div className="card" style={{ padding: 24, lineHeight: 1.6 }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16 }}>{t('privacy_title')}</h2>
      <p style={{ color: "var(--grey)", fontSize: 14 }}>{t('privacy_intro')}</p>
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{t('privacy_h1')}</h3>
        <p style={{ fontSize: 13, color: "var(--grey)" }}>{t('privacy_p1')}</p>
      </div>
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{t('privacy_h2')}</h3>
        <p style={{ fontSize: 13, color: "var(--grey)" }}>{t('privacy_p2')}</p>
      </div>
    </div>
  );
}

function CGUPage() {
  const { t } = useLanguage();
  return (
    <div className="card" style={{ padding: 24, lineHeight: 1.6 }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16 }}>{t('cgu_title')}</h2>
      <p style={{ color: "var(--grey)", fontSize: 14 }}>{t('cgu_intro')}</p>
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{t('cgu_h1')}</h3>
        <p style={{ fontSize: 13, color: "var(--grey)" }}>{t('cgu_p1')}</p>
      </div>
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{t('cgu_h2')}</h3>
        <p style={{ fontSize: 13, color: "var(--grey)" }}>{t('cgu_p2')}</p>
      </div>
    </div>
  );
}

function FAQPage() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(0);
  const items = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((it, i) => (
        <div key={i} className="card" onClick={() => setOpen(open === i ? -1 : i)} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 14 }}>
            <span>{it.q}</span>
            <span>{open === i ? "−" : "+"}</span>
          </div>
          {open === i && <p style={{ marginTop: 12, fontSize: 13, color: "var(--grey)", borderTop: "1px solid var(--border)", paddingTop: 12 }}>{it.a}</p>}
        </div>
      ))}
    </div>
  );
}

function AuditPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs()
      .then(data => setLogs(data))
      .catch(err => console.error("Erreur audit logs", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
      <div style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: 24, marginBottom: 12 }}>⟳</div>
      <div>{t('loading_history')}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 0 16px" }}>
      <div className="sc-label" style={{ textAlign: "center", marginBottom: 8 }}>{t('audit_title')}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {logs.length === 0 && <div className="card" style={{ textAlign: "center", color: "var(--grey)", padding: 48 }}>{t('no_security_log')}</div>}
        {logs.map(log => (
          <div key={log.id} className="tr" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--warning)" }}>{log.action}</span>
              <span style={{ fontSize: 10, color: "var(--mid)" }}>{new Date(log.created_at).toLocaleString('fr-FR')}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--white)" }}>{t('user')}: <span style={{ fontWeight: 700 }}>{log.user_name}</span></div>
            <div style={{ fontSize: 11, color: "var(--grey)", background: "var(--surface)", padding: "8px 12px", borderRadius: 10, marginTop: 4, width: "100%", fontFamily: "monospace", border: "1px solid var(--border)" }}>
              {log.details.length > 2 ? log.details : t('no_recent_activity')}
            </div>
          </div>
        ))}
      </div>
    </div>

  );
}

// ─── TIRAGE PAGE ────────────────────────────────────────────────────────────
function TiragePage({ onRefresh, membres, tontine }) {
  const { t, language } = useLanguage();
  const [tirage, setTirage] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [montant, setMontant] = useState("50000");
  const [lancing, setLancing] = useState(false);
  const [sending, setSending] = useState(false);

  const loadTirage = async () => {
    setLoadingData(true);
    try {
      const data = await api.getTirage();
      setTirage(data);
    } catch (e) {
      console.error("Erreur tirage", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { loadTirage(); }, []);

  const eligibles = (membres || []).filter(m => !m.a_recu_tirage);
  const moisCourant = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', { month: 'long', year: 'numeric' });
  const moisFormatted = moisCourant.charAt(0).toUpperCase() + moisCourant.slice(1);

  const handleSpinResult = async (winner) => {
    if (!montant || parseInt(montant) <= 0) return alert(t('invalid_amount'));
    setLancing(true);
    try {
      const res = await api.effectuerTirage(parseInt(montant), winner.id);
      alert(res.message);
      loadTirage();
      if (onRefresh) onRefresh();
    } catch (e) {
      alert("Erreur: " + e.message);
    } finally {
      setLancing(false);
    }
  };

  const handleEnvoyer = async (id) => {
    if (!window.confirm(`${t('payout_confirm_msg')} ${t('irreversible_action')}`)) return;
    setSending(true);
    try {
      const res = await api.envoyerTirage(id);
      alert(res.message);
      loadTirage();
      if (onRefresh) onRefresh();
    } catch (e) {
      alert("Erreur: " + e.message);
    } finally {
      setSending(false);
    }
  };

  if (loadingData) return (
    <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
      <div style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: 24, marginBottom: 12 }}>⟳</div>
      <div>{t('loading')}</div>
    </div>
  );

  const tirageActuel = tirage?.tirageActuel;
  const historique = tirage?.historique || [];
  const dejaRecus = tirage?.cycle?.dejaRecu ?? 0;
  const totalMembres = tirage?.cycle?.totalMembres ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "0 0 24px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, textAlign: "center" }}>🎲 {t('tirage_title')}</h2>

      {/* Progression du cycle */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
          <div className="sc-label">{t('cycle_in_progress')}</div>
          <span style={{ color: "var(--primary)" }}>{dejaRecus}/{totalMembres} {t('members_served')}</span>
        </div>
        <div style={{ height: 8, background: "var(--surface-hover)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${totalMembres > 0 ? (dejaRecus / totalMembres) * 100 : 0}%`, height: "100%", background: "var(--primary)", borderRadius: 4, transition: "width .5s ease" }} />
        </div>
        {dejaRecus === totalMembres && totalMembres > 0 && (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--success)", fontWeight: 700, textAlign: "center" }}>
            ✅ {t('all_beneficiaries_served')}
          </div>
        )}
      </div>


      {/* Tirage du mois en cours */}
      {tirageActuel ? (
        <div className="card" style={{ border: `1px solid ${tirageActuel.statut === 'envoyé' ? 'var(--success)' : 'var(--primary)'}33` }}>
          <div className="sc-label" style={{ marginBottom: 12 }}>{t('tirage_current_month')}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div className="mav" style={{ width: 52, height: 52, fontSize: 16 }}>
              {tirageActuel.membre_initials}
            </div>
            <div style={{ flex: 1 }}>
              <div className="mname" style={{ fontSize: 18 }}>{tirageActuel.membre_name}</div>
              <div className="msub">{t('tirage_beneficiary_selected')}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="sc-label">{t('tirage_amount')}</div>
              <div className="sc-val" style={{ fontSize: 20 }}>{tirageActuel.montant?.toLocaleString('fr-FR')} F</div>
            </div>
          </div>

          {tirageActuel.statut === 'en_attente' ? (
            <button
              className="btn-w"
              onClick={() => handleEnvoyer(tirageActuel.id)}
              disabled={sending}
              style={{ background: "var(--primary)" }}
            >
              {sending ? t('tirage_sending') : t('tirage_confirm_send')}
            </button>
          ) : (
            <div style={{ background: "rgba(0,200,83,.12)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <span style={{ color: "var(--success)", fontWeight: 700, fontSize: 14 }}>{t('tirage_sent_on')} {new Date(tirageActuel.sent_at).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
        </div>

      ) : (
        /* Formulaire de nouveau tirage */
        <div className="card">
          <div className="sc-label" style={{ marginBottom: 16 }}>{t('tirage_new_month')}</div>
          <div className="ff">
            <div className="fl2">{t('tirage_amount_label')}</div>
            <input
              type="number"
              value={montant}
              onChange={e => setMontant(e.target.value)}
              className="fi3"
              style={{ fontSize: 22, fontWeight: 700 }}
            />
          </div>
          <div className="info-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <span>{t('tirage_info')}</span>
          </div>

          {eligibles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--grey)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
              <div style={{ fontWeight: 700 }}>{t('tirage_no_eligible_title')}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{t('tirage_no_eligible_msg')}</div>
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              <SpinWheel
                participants={eligibles}
                montant={parseInt(montant) || 0}
                mois={moisFormatted}
                onResult={handleSpinResult}
                onClose={() => {}}
                disabled={lancing || !montant || parseInt(montant) <= 0}
              />
            </div>
          )}
        </div>

      )}

      {/* Historique */}
      {historique.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div className="sc-label" style={{ marginLeft: 4, marginBottom: 10 }}>{t('tirage_history')}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {historique.map(item => (
              <div key={item.id} className="tr">
                <div className="mav">
                  {item.membre_initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mname">{item.membre_name}</div>
                  <div className="msub">{item.mois}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="sc-val" style={{ fontSize: 14 }}>{item.montant?.toLocaleString('fr-FR')} F</div>
                  <div className={`st ${item.statut === 'envoyé' ? 'on' : 'wait'}`}>
                    {item.statut === 'envoyé' ? t('tirage_sent_status') : t('tirage_waiting_status')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function SettingsPage({ tontine, onRefresh }) {
  const { t } = useLanguage();
  const [nom, setNom] = useState(tontine?.nom || '');
  const [description, setDescription] = useState(tontine?.description || '');
  const [cotisation, setCotisation] = useState(tontine?.cotisation_mensuelle || 50000);
  const [frequence, setFrequence] = useState(tontine?.frequence || 'mensuelle');
  const [fraisGestion, setFraisGestion] = useState(tontine?.frais_gestion ?? 0);
  const [nombrePlaces, setNombrePlaces] = useState(tontine?.nombre_places || tontine?.tour_total || 12);
  const [dateDebut, setDateDebut] = useState(tontine?.date_debut || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const fieldStyle = {
    width: '100%', background: '#111', border: '1px solid #2A2A2A',
    borderRadius: 14, padding: '14px 16px', fontSize: 15, color: 'white',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s', colorScheme: 'dark',
  };
  const labelStyle = { fontSize: 12, color: '#888', marginBottom: 8, fontWeight: 700, display: 'block', letterSpacing: '0.5px', textTransform: 'uppercase' };
  const cardStyle = { background: '#111', borderRadius: 20, padding: '16px 18px', border: '1px solid #1A1A1A' };

  const handleSave = async () => {
    if (!nom.trim()) return alert(t('settings_title_required'));
    setLoading(true);
    try {
      const payload = {
        nom: nom.trim(),
        description,
        cotisation_mensuelle: parseInt(cotisation),
        frequence,
        frais_gestion: parseFloat(fraisGestion),
        nombre_places: parseInt(nombrePlaces),
        tour_total: parseInt(nombrePlaces),
        date_debut: dateDebut
      };
      const res = tontine
        ? await api.updateTontine(payload)
        : await api.createTontine(payload);
      if (res.code) alert(`${t('invite_code')}: ${res.code}`);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onRefresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0 24px' }}>
      <div style={{ textAlign: 'center', padding: '8px 0 8px' }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>{tontine ? t('tontine_settings') : t('settings_new_pool')}</div>
      </div>

      {/* Titre */}
      <div className="ff">
        <label className="fl2">{t('settings_title_label')}</label>
        <input
          value={nom}
          onChange={e => setNom(e.target.value)}
          placeholder={t('tontine_name_placeholder')}
          className="fi3"
        />
      </div>


      {/* Description */}
      <div className="ff">
        <label className="fl2">{t('settings_description_label')} <span style={{ color: 'var(--mid)', fontWeight: 400, textTransform: 'none' }}>{t('settings_description_optional')}</span></label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={t('tontine_desc_placeholder')}
          rows={3}
          className="fi3"
          style={{ resize: 'vertical', minHeight: 80, lineHeight: 1.5 }}
        />
      </div>


      {/* Montant par place */}
      <div className="ff">
        <label className="fl2">{t('settings_amount_per_place')}</label>
        <input
          type="number"
          value={cotisation}
          onChange={e => setCotisation(e.target.value)}
          placeholder="50000"
          className="fi3"
        />
      </div>


      {/* Fréquence + Frais — 2 colonnes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={cardStyle}>
          <label style={labelStyle}>{t('settings_frequency_label')}</label>
          <div style={{ position: 'relative' }}>
            <select
              value={frequence}
              onChange={e => setFrequence(e.target.value)}
              style={{ ...fieldStyle, paddingRight: 32, cursor: 'pointer' }}
            >
              <option value="mensuelle">{t('settings_freq_monthly')}</option>
              <option value="hebdomadaire">{t('settings_freq_weekly')}</option>
              <option value="quotidienne">{t('settings_freq_daily')}</option>
            </select>
            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#666', pointerEvents: 'none', fontSize: 12 }}>▾</div>
          </div>
        </div>
        <div style={cardStyle}>
          <label style={labelStyle}>{t('settings_fees_label')}</label>
          <div style={{ position: 'relative' }}>
            <select
              value={fraisGestion}
              onChange={e => setFraisGestion(e.target.value)}
              style={{ ...fieldStyle, paddingRight: 32, cursor: 'pointer' }}
            >
              <option value={0}>0%</option>
              <option value={2}>2%</option>
              <option value={5}>5%</option>
              <option value={10}>10%</option>
            </select>
            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#666', pointerEvents: 'none', fontSize: 12 }}>▾</div>
          </div>
        </div>
      </div>

      {/* Places + Date — 2 colonnes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={cardStyle}>
          <label style={labelStyle}>{t('settings_nb_places')}</label>
          <input
            type="number"
            value={nombrePlaces}
            onChange={e => setNombrePlaces(e.target.value)}
            placeholder="12"
            min={2}
            style={fieldStyle}
            onFocus={e => e.target.style.borderColor = '#555'}
            onBlur={e => e.target.style.borderColor = '#2A2A2A'}
          />
        </div>
        <div style={cardStyle}>
          <label style={labelStyle}>{t('settings_start_date')}</label>
          <input
            type="date"
            value={dateDebut}
            onChange={e => setDateDebut(e.target.value)}
            style={fieldStyle}
            onFocus={e => e.target.style.borderColor = '#555'}
            onBlur={e => e.target.style.borderColor = '#2A2A2A'}
          />
        </div>
      </div>

      {/* Récapitulatif dynamique */}
      {parseInt(cotisation || 0) > 0 && parseInt(nombrePlaces || 0) > 0 && (
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(26,122,46,0.1), rgba(0,0,0,0.5))', border: '1px solid rgba(26,122,46,0.2)' }}>
          <div className="sc-label" style={{ marginBottom: 12 }}>RÉCAPITULATIF</div>
          <div className="sg" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {[
              { label: t('settings_total_pool'), value: `${(parseInt(cotisation || 0) * parseInt(nombrePlaces || 0)).toLocaleString('fr-FR')} F` },
              { label: t('settings_frequency_label'), value: frequence === 'mensuelle' ? t('settings_freq_value_monthly') : frequence === 'hebdomadaire' ? t('settings_freq_value_weekly') : t('settings_freq_value_daily') },
              { label: t('settings_nb_places'), value: `${nombrePlaces} places` },
              { label: t('settings_fees_label'), value: `${fraisGestion}%` },
            ].map(item => (
              <div key={item.label} className="sc">
                <div className="sc-label">{item.label}</div>
                <div className="sc-val" style={{ fontSize: 14 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code d'invitation - Visible pour l'admin */}
      {tontine && tontine.code_invitation && (
        <div style={{ background: "var(--near-black)", border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--grey)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>
            {t('invite_code')} - {t('share_with_members') || "À partager avec les membres"}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: 12, background: "rgba(78, 205, 196, 0.1)", borderRadius: 10, border: "1px solid rgba(78, 205, 196, 0.2)" }}>
            <div style={{ fontSize: 24, fontWeight: 1000, letterSpacing: "3px", color: "var(--primary)", fontFamily: "monospace" }}>
              {tontine.code_invitation || "—"}
            </div>
            <button 
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(tontine.code_invitation || '');
                  alert(t('copy_success') || "Code copié !");
                } catch (e) {
                  alert("Erreur lors de la copie");
                }
              }}
              style={{ 
                background: "var(--primary)", 
                color: "#FFF", 
                border: "none", 
                padding: "10px 14px", 
                borderRadius: 10, 
                fontWeight: 900, 
                cursor: "pointer",
                fontSize: 12,
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              {t('copy')} 📋
            </button>
          </div>
        </div>
      )}


      <button
        className="btn-w"
        onClick={handleSave}
        disabled={loading}
        style={{
          background: saved ? 'var(--success)' : 'var(--primary)',
          color: '#FFF',
          marginTop: 12,
          border: 'none',
          boxShadow: saved ? 'none' : '0 4px 14px var(--primary-glow)'
        }}
      >
        {loading ? t('settings_saving') : saved ? t('settings_saved') : t('settings_save_btn')}
      </button>

    </div>
  );
}

function TontinesPage({ tontine, onRefresh, isGerant, onJoinSuccess }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState(isGerant ? 'liste' : (tontine ? 'etat' : 'rejoindre')); // liste | creer | rejoindre | etat
  const [code, setCode] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [tontines, setTontines] = useState([]);
  const [loadingTontines, setLoadingTontines] = useState(false);
  const [selectedTontineForCode, setSelectedTontineForCode] = useState(null);
  const [inputCode, setInputCode] = useState('');

  const fetchTontines = useCallback(async () => {
    setLoadingTontines(true);
    try {
      const res = await api.getTontines();
      if (res && res.data) setTontines(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTontines(false);
    }
  }, []);

  useEffect(() => {
    fetchTontines();
  }, [fetchTontines]);

  useEffect(() => {
    if (tab !== 'creer' || !isGerant) return;
    setLoadingCode(true);
    api.getTontineCode().then(c => setCode(c)).catch(() => { }).finally(() => setLoadingCode(false));
  }, [tab, isGerant]);

  const handleSelectTontine = (id) => {
    localStorage.setItem('selectedTontineId', id);
    onRefresh(); // Re-fetch dashboard, membres, etc. for the selected tontine
  };

  const pill = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      flex: 1,
      background: tab === id ? "var(--surface-hover)" : "transparent",
      border: "1px solid " + (tab === id ? "var(--border-light)" : "var(--border)"),
      color: "var(--white)",
      padding: "10px 12px",
      borderRadius: 16,
      fontWeight: 900,
      cursor: "pointer",
      fontSize: 12
    }}>{label}</button>
  );

  const status = tontine?.progression >= 100 ? 'terminée' : (tontine?.progression > 0 ? 'en cours' : 'en attente');

  const handleJoinSuccess = async (res) => {
    fetchTontines();
    if (onJoinSuccess) {
      await onJoinSuccess(res);
    } else {
      await onRefresh?.();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0 24px" }}>
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px' }}>{t('nav_tontines')}</div>
        <div style={{ fontSize: 12, color: "var(--grey)", marginTop: 4 }}>
          {isGerant ? t('tontine_intro_gerant') : t('tontine_intro_membre')}
        </div>
      </div>

      <div className="tab-strip">
        {["liste", "creer", "rejoindre", "etat"].filter(id => {
          if (id === 'liste') return isGerant;
          if (id === 'creer') return isGerant;
          if (id === 'rejoindre') return !isGerant;
          return true; // etat is always shown
        }).map(id => (
          <button key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>
            {id === 'liste' ? t('all_tontines') : id === 'creer' ? t('settings') : id === 'rejoindre' ? t('join') : t('evaluation')}
          </button>
        ))}
      </div>


      {tab === 'liste' && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, color: "var(--grey)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px" }}>
            {t('available_tontines') || "Tontines Disponibles"}
          </div>

          {loadingTontines ? (
            <div style={{ padding: 30, textAlign: "center", color: "#666" }}>
              <div style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: 24 }}>⟳</div>
            </div>
          ) : tontines.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "var(--grey)", fontSize: 14 }}>
              Aucune tontine créée
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tontines.map(tItem => {
                const itemStatus = tItem.progression >= 100 ? 'terminée' : (tItem.progression > 0 ? 'en cours' : 'en attente');
                const isCurrent = tontine && tontine.id === tItem.id;
                
                return (
                  <div 
                    key={tItem.id}
                    style={{
                      background: "var(--near-black)",
                      border: isCurrent ? "1px solid var(--primary)" : "1px solid var(--border)",
                      boxShadow: isCurrent ? "0 0 15px rgba(78, 205, 196, 0.15)" : "none",
                      borderRadius: 20,
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>💰</span>
                        <div style={{ fontWeight: 1000, fontSize: 16, color: "var(--white)" }}>{tItem.nom}</div>
                        {isCurrent && (
                          <span style={{
                            fontSize: 9,
                            fontWeight: 900,
                            padding: "3px 8px",
                            borderRadius: 999,
                            background: "rgba(78, 205, 196, 0.15)",
                            color: "var(--primary)",
                            border: "1px solid rgba(78, 205, 196, 0.3)"
                          }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                      
                      <span style={{
                        fontSize: 9,
                        fontWeight: 900,
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: itemStatus === 'en cours' ? "rgba(46,184,92,0.12)" : itemStatus === 'en attente' ? "rgba(255,121,0,0.12)" : "rgba(0,200,83,0.12)",
                        color: itemStatus === 'en cours' ? "var(--primary-2)" : itemStatus === 'en attente' ? "var(--warning)" : "var(--success)",
                        border: "1px solid var(--border)"
                      }}>
                        {itemStatus.toUpperCase()}
                      </span>
                    </div>

                    {tItem.description && (
                      <div style={{ fontSize: 12, color: "var(--mid)", lineHeight: 1.4 }}>
                        {tItem.description}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "10px 0", fontSize: 12, color: "var(--grey)" }}>
                      <div>💵 Cotisation: <strong>{tItem.cotisation_mensuelle?.toLocaleString('fr-FR')} F</strong> ({tItem.frequence})</div>
                      <div>👥 Places: <strong>{tItem.nombre_places} places</strong></div>
                      <div>📈 Progression: <strong>{tItem.progression ?? 0}%</strong></div>
                      <div>📅 Début: <strong>{tItem.date_debut || "—"}</strong></div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                      {/* Code d'invitation */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 11, color: "var(--mid)", fontWeight: 700 }}>INVITATION:</div>
                        <div style={{ 
                          fontSize: 16, 
                          fontWeight: 900, 
                          fontFamily: "monospace", 
                          letterSpacing: "1px", 
                          color: "var(--primary)",
                          background: "rgba(78, 205, 196, 0.08)",
                          padding: "4px 10px",
                          borderRadius: 8,
                          border: "1px solid rgba(78, 205, 196, 0.15)"
                        }}>
                          {tItem.code_invitation || "—"}
                        </div>
                        {tItem.code_invitation && (
                          <>
                            <button 
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(tItem.code_invitation);
                                  alert(t('copy_success') || "Code copié !");
                                } catch (e) {
                                  alert("Erreur de copie");
                                }
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--primary)",
                                cursor: "pointer",
                                padding: 4,
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                              title="Copier le code"
                            >
                              📋
                            </button>
                            <button 
                              onClick={async () => {
                                if (window.confirm('Êtes-vous sûr de vouloir générer un nouveau code d\'invitation ? L\'ancien code ne fonctionnera plus.')) {
                                  try {
                                    const result = await api.regenerateTontineCode(tItem.id);
                                    alert(`Nouveau code généré : ${result.code}`);
                                    fetchTontines(); // Rafraîchir la liste
                                  } catch (e) {
                                    alert('Erreur: ' + (e.message || 'Impossible de régénérer le code'));
                                  }
                                }
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: "rgba(255,193,7,0.8)",
                                cursor: "pointer",
                                padding: 4,
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                              title="Générer un nouveau code"
                            >
                              🔄
                            </button>
                          </>
                        )}
                      </div>

                      {/* Sélectionner cette tontine pour la gérer */}
                      {!isCurrent ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <button
                            onClick={() => handleSelectTontine(tItem.id)}
                            style={{
                              background: "var(--surface-hover)",
                              color: "var(--white)",
                              border: "1px solid var(--border)",
                              padding: "8px 14px",
                              borderRadius: 10,
                              fontWeight: 900,
                              cursor: "pointer",
                              fontSize: 11,
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "var(--primary)";
                              e.currentTarget.style.borderColor = "var(--primary)";
                              e.currentTarget.style.color = "#FFF";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "var(--surface-hover)";
                              e.currentTarget.style.borderColor = "var(--border)";
                              e.currentTarget.style.color = "var(--white)";
                            }}
                          >
                            Gérer cette tontine ⚙️
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Êtes-vous sûr de vouloir supprimer la tontine "${tItem.nom}" ? Cette action est irréversible.`)) {
                                try {
                                  await api.deleteTontine(tItem.id);
                                  alert('Tontine supprimée avec succès');
                                  fetchTontines();
                                } catch (e) {
                                  alert('Erreur: ' + (e.message || 'Impossible de supprimer la tontine'));
                                }
                              }
                            }}
                            style={{
                              background: "rgba(255,82,82,0.1)",
                              color: "var(--danger)",
                              border: "1px solid rgba(255,82,82,0.3)",
                              padding: "8px 14px",
                              borderRadius: 10,
                              fontWeight: 900,
                              cursor: "pointer",
                              fontSize: 11,
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "var(--danger)";
                              e.currentTarget.style.borderColor = "var(--danger)";
                              e.currentTarget.style.color = "#FFF";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255,82,82,0.1)";
                              e.currentTarget.style.borderColor = "rgba(255,82,82,0.3)";
                              e.currentTarget.style.color = "var(--danger)";
                            }}
                            title="Supprimer cette tontine"
                          >
                            Supprimer 🗑️
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--success)", fontWeight: 900 }}>
                          <span>✓ Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'creer' && (
        <>
          {isGerant && (
            <div style={{ background: "var(--near-black)", border: "1px solid var(--border)", borderRadius: 20, padding: 16 }}>
              <div style={{ fontSize: 12, color: "var(--grey)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px" }}>{t('invite_code')}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 1000, letterSpacing: "2px" }}>
                  {loadingCode ? "…" : (code || "—")}
                </div>
                <button onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(code || '');
                    alert(t('copy_success'));
                  } catch { }
                }} style={{ background: "var(--primary)", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 14, fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 10px var(--primary-glow)" }}>
                  {t('copy')}
                </button>
              </div>
              <div style={{ fontSize: 11, color: "var(--grey)", marginTop: 8 }}>
                {t('invite_code_sub') || "Partage ce code (6 caractères) pour inviter un membre."}
              </div>
            </div>
          )}

          {/* Réutilise la page existante (création / réglages) */}
          <SettingsPage tontine={tontine} onRefresh={onRefresh} />
        </>
      )}

      {tab === 'rejoindre' && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Liste des tontines disponibles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 13, color: "var(--grey)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              {t('available_tontines') || "Tontines Disponibles"}
            </div>
            
            {loadingTontines ? (
              <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
                <div style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: 18 }}>⟳</div>
              </div>
            ) : tontines.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--grey)", fontSize: 14 }}>
                Aucune tontine disponible
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tontines.map(tItem => {
                  const itemStatus = tItem.progression >= 100 ? 'terminée' : (tItem.progression > 0 ? 'en cours' : 'en attente');
                  return (
                    <div 
                      key={tItem.id}
                      style={{
                        background: "var(--near-black)",
                        border: "1px solid var(--border)",
                        borderRadius: 16,
                        padding: "14px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                    >
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>💰</span>
                          <div style={{ fontWeight: 900, color: "var(--white)" }}>{tItem.nom}</div>
                          <span style={{
                            fontSize: 9,
                            fontWeight: 900,
                            padding: "3px 6px",
                            borderRadius: 999,
                            background: itemStatus === 'en cours' ? "rgba(46,184,92,0.12)" : itemStatus === 'en attente' ? "rgba(255,121,0,0.12)" : "rgba(0,200,83,0.12)",
                            color: itemStatus === 'en cours' ? "var(--primary-2)" : itemStatus === 'en attente' ? "var(--warning)" : "var(--success)",
                            border: "1px solid var(--border)"
                          }}>
                            {itemStatus.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11, color: "var(--mid)" }}>
                          <div>💵 <strong>{tItem.cotisation_mensuelle?.toLocaleString('fr-FR')} F</strong> ({tItem.frequence})</div>
                          <div>👥 <strong>{tItem.nombre_places} places</strong></div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedTontineForCode(tItem);
                          setInputCode('');
                        }}
                        disabled={joining}
                        style={{
                          background: "var(--primary)",
                          color: "#FFF",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: 10,
                          fontWeight: 900,
                          cursor: "pointer",
                          fontSize: 11,
                          whiteSpace: "nowrap",
                          transition: "all 0.2s ease",
                          opacity: joining ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => !joining && (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      >
                        {joining ? t('loading') : t('join')}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, color: "var(--grey)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              {t('invite_code')} {t('tontine_6chars') || "Ou saisissez un code d'invitation"}
            </div>
            <input 
              value={joinCode} 
              onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))} 
              placeholder="ABC123" 
              className="fi3" 
              style={{ fontSize: 18, fontWeight: 900, letterSpacing: "2px", textAlign: "center" }} 
            />
            <button
              onClick={async () => {
                if (joinCode.length !== 6) return alert(t('tontine_code_invalid'));
                setJoining(true);
                try {
                  const res = await api.rejoindreTontine(joinCode);
                  await handleJoinSuccess(res);
                } catch (e) {
                  alert(e.message);
                } finally {
                  setJoining(false);
                }
              }}
              disabled={joining}
              className="btn-w"
              style={{ background: "var(--primary)", color: "#FFF" }}
            >
              {joining ? t('loading') : t('join')}
            </button>
          </div>
        </div>
      )}


      {tab === 'etat' && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "var(--near-black)", border: "1px solid var(--border)", borderRadius: 20, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 1000 }}>{tontine?.nom || "Tontine"}</div>
              <span style={{
                fontSize: 11,
                fontWeight: 900,
                padding: "5px 10px",
                borderRadius: 999,
                background: status === 'en cours' ? "rgba(46,184,92,0.12)" : status === 'en attente' ? "rgba(255,121,0,0.12)" : "rgba(0,200,83,0.12)",
                color: status === 'en cours' ? "var(--primary-2)" : status === 'en attente' ? "var(--warning)" : "var(--success)",
                border: "1px solid var(--border)"
              }}>
                {status.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--grey)", marginTop: 8 }}>
              {t('tontine_progression_label')}: {tontine?.progression ?? 0}% • {t('tontine_tour_label')} {tontine?.tour_actuel ?? 1}/{tontine?.tour_total ?? 12}
            </div>
          </div>
        </div>
      )}

      {/* Modal pour saisir le code d'invitation */}
      {selectedTontineForCode && (
        <Modal title={`Rejoindre: ${selectedTontineForCode.nom}`} onClose={() => setSelectedTontineForCode(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ color: "var(--grey)", fontSize: 13 }}>
              Entrez le code d'invitation (6 caractères) pour rejoindre cette tontine.
            </div>
            <input
              type="text"
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              className="fi3"
              style={{ 
                fontSize: 18, 
                fontWeight: 900, 
                letterSpacing: "2px", 
                textAlign: "center",
                background: "var(--near-black)",
                border: "1px solid var(--border)",
                color: "var(--white)"
              }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setSelectedTontineForCode(null)}
                style={{
                  flex: 1,
                  background: "var(--surface-hover)",
                  color: "var(--white)",
                  border: "1px solid var(--border)",
                  padding: "12px 16px",
                  borderRadius: 10,
                  fontWeight: 900,
                  cursor: "pointer"
                }}
              >
                {t('modal_cancel')}
              </button>
              <button
                onClick={async () => {
                  if (inputCode.length !== 6) return alert(t('tontine_code_invalid') || "Le code doit contenir 6 caractères");
                  if (inputCode !== selectedTontineForCode.code_invitation) {
                    return alert("Code incorrect. Vérifiez le code fourni par le gérant.");
                  }
                  setJoining(true);
                  try {
                    const res = await api.rejoindreTontine(inputCode);
                    setSelectedTontineForCode(null);
                    await handleJoinSuccess(res);
                  } catch (e) {
                    alert(e.message);
                  } finally {
                    setJoining(false);
                  }
                }}
                disabled={joining || inputCode.length !== 6}
                style={{
                  flex: 1,
                  background: "var(--primary)",
                  color: "#FFF",
                  border: "none",
                  padding: "12px 16px",
                  borderRadius: 10,
                  fontWeight: 900,
                  cursor: "pointer",
                  opacity: (joining || inputCode.length !== 6) ? 0.6 : 1
                }}
              >
                {joining ? t('loading') : t('join')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function NotificationsPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setItems(data || []);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const shown = filter === 'unread' ? items.filter(n => !n.read) : items;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "8px 0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div>
          <div className="sc-label" style={{ marginBottom: 4 }}>{t('notif_center')}</div>
          <div style={{ fontSize: 12, color: "var(--grey)" }}>{items.length} {t('notif_elements')}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setFilter(f => f === 'all' ? 'unread' : 'all')} className="btn-o" style={{ fontSize: 11, padding: "6px 12px" }}>
            {filter === 'all' ? t('notif_unread') : t('notif_all')}
          </button>
          <button onClick={async () => { await api.markAllNotificationsRead().catch(() => { }); load(); }} className="btn-w" style={{ fontSize: 11, padding: "6px 12px", background: "var(--primary)", color: "#fff", border: "none" }}>
            {t('notif_mark_all_read')}
          </button>
        </div>
      </div>


      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: "var(--grey)" }}>{t('notif_loading')}</div>
      ) : shown.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: "var(--grey)" }}>{t('notif_empty')}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shown.map(n => (
            <div key={n.id} className="tr" onClick={async () => {
              if (!n.read) await api.markNotificationRead(n.id).catch(() => { });
              load();
            }} style={{
              cursor: "pointer",
              opacity: n.read ? 0.6 : 1,
              borderLeft: n.read ? "none" : "3px solid var(--primary)"
            }}>
              <div style={{ fontSize: 20, marginRight: 12 }}>{n.icon || "🔔"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", color: "var(--grey)" }}>{n.type || "info"}</div>
                  <div style={{ fontSize: 11, color: "var(--mid)" }}>{new Date(n.created_at).toLocaleDateString('fr-FR')}</div>
                </div>
                <div style={{ marginTop: 4, fontSize: 14, color: "var(--white)", lineHeight: 1.4 }}>{n.texte}</div>
              </div>
            </div>
          ))}
        </div>

      )}
    </div>
  );
}

function RemindersPage({ membres }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState('all'); // all | some
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState(t('reminder_default_msg'));
  const [sending, setSending] = useState(false);
  const [type, setType] = useState('rappel'); // rappel | info

  const targetMembers = type === 'rappel' ? (membres || []).filter(m => !m.paid) : (membres || []);

  // Update default message when type changes
  useEffect(() => {
    if (type === 'rappel') {
      setMessage(t('reminder_default_msg') || 'Rappel : Votre cotisation mensuelle est en attente. Merci de régulariser dès que possible.');
    } else {
      setMessage('Information importante concernant la tontine : ...');
    }
    setSelected([]);
  }, [type, t]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "8px 0 16px" }}>
      <div>
        <div className="sc-label" style={{ marginBottom: 4 }}>Notifications Manuelles</div>
        <div style={{ fontSize: 12, color: "var(--grey)" }}>Envoyer des rappels ou des informations générales aux membres.</div>
      </div>

      <div className="tab-strip" style={{ marginBottom: 4 }}>
        <button onClick={() => setType('rappel')} className={`tab ${type === 'rappel' ? 'on' : ''}`} style={{ flex: 1 }}>Rappel de Cotisation</button>
        <button onClick={() => setType('info')} className={`tab ${type === 'info' ? 'on' : ''}`} style={{ flex: 1 }}>Information Générale</button>
      </div>

      <div className="tab-strip" style={{ marginBottom: 4, marginTop: 8 }}>
        <button onClick={() => setMode('all')} className={`tab ${mode === 'all' ? 'on' : ''}`} style={{ flex: 1 }}>{type === 'rappel' ? 'Tous les retards' : 'Tous les membres'}</button>
        <button onClick={() => setMode('some')} className={`tab ${mode === 'some' ? 'on' : ''}`} style={{ flex: 1 }}>{t('reminder_select')}</button>
      </div>

      {mode === 'some' && (
        <div className="card" style={{ padding: 14 }}>
          <div className="sc-label" style={{ marginBottom: 10, fontSize: 11 }}>
            Membres ({targetMembers.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
            {targetMembers.map(m => {
              const on = selected.includes(m.id);
              return (
                <div key={m.id} className="tr" onClick={() => setSelected(s => on ? s.filter(x => x !== m.id) : [...s, m.id])} style={{
                  cursor: "pointer",
                  border: on ? "1px solid var(--primary)" : "1px solid var(--border)",
                  background: on ? "var(--surface-hover)" : "transparent"
                }}>
                  <div className="mav">{m.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                  </div>
                  {on && <div style={{ color: "var(--primary)" }}>✓</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 14 }}>
        <div className="sc-label" style={{ marginBottom: 8, fontSize: 11 }}>{t('reminder_message_label')}</div>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="fi3" style={{ height: "auto", minHeight: 100, fontSize: 14, lineHeight: 1.5 }} />
      </div>

      <button onClick={async () => {
        setSending(true);
        try {
          const members = mode === 'all' ? 'all' : selected;
          if (mode === 'some' && members.length === 0) {
            alert('Veuillez sélectionner au moins un membre.');
            setSending(false);
            return;
          }
          const res = await api.sendManualNotification({ message, members, type });
          alert(res.message || "Envoyé.");
          setSelected([]);
        } catch (e) {
          alert(e.message);
        } finally {
          setSending(false);
        }
      }} disabled={sending} className="btn-w" style={{ background: "var(--primary)", color: "#fff", border: "none", marginTop: 8, boxShadow: "0 4px 14px var(--primary-glow)" }}>
        {sending ? t('reminder_sending') : t('reminder_send_btn')}
      </button>
    </div>

  );
}

// ─── MODALS ──────────────────────────────────────────────────────────────────

function EditMemberModal({ membre, onClose, onSuccess }) {
  const { t } = useLanguage();
  const nameParts = (membre.name || '').split(' ');
  const [nom, setNom] = useState(nameParts[0] || '');
  const [prenom, setPrenom] = useState(membre.prenom || nameParts.slice(1).join(' ') || '');
  const [email, setEmail] = useState(membre.email || '');
  const [telephone, setTelephone] = useState(membre.telephone || '');
  const [photo, setPhoto] = useState(undefined); // undefined = unchanged, '' = cleared, 'data:...' = new
  const [photoPreview, setPhotoPreview] = useState(membre.photo ? assetUrl(membre.photo) : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError(t('photo_too_large')); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setPhoto(reader.result); setPhotoPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError('');
    if (!nom || !email) { setError(t('mandatory_fields')); return; }
    setLoading(true);
    try {
      // photo === undefined means no change, pass current value
      const photoToSend = photo === undefined ? undefined : photo;
      await api.updateMember(membre.id, { nom, prenom, email, telephone, photo: photoToSend });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: '#1A1A1A', border: '1px solid #333',
    borderRadius: 14, padding: '13px 16px', fontSize: 14, color: 'white',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s'
  };
  const labelStyle = { fontSize: 11, color: '#888', marginBottom: 6, fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <Modal title={`${t('modal_edit_member_title')} — ${membre.name}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '65vh', overflowY: 'auto', paddingBottom: 4 }}>
        {error && (
          <div className="error-box" style={{ background: 'rgba(255,82,82,0.1)', color: 'var(--danger)', padding: 12, borderRadius: 12, fontSize: 13, border: '1px solid rgba(255,82,82,0.2)' }}>
            {error}
          </div>
        )}

        {/* Photo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface)', padding: 14, borderRadius: 20, border: '1px solid var(--border)' }}>
          <label htmlFor="edit-photo-upload" style={{ cursor: 'pointer', flexShrink: 0 }}>
            <div className="u-av" style={{ width: 64, height: 64, fontSize: 24, border: '1px dashed var(--border-light)' }}>
              {photoPreview
                ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : "📷"
              }
            </div>
          </label>
          <input id="edit-photo-upload" type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t('modal_photo_label')}</div>
            <div style={{ fontSize: 11, color: 'var(--grey)' }}>{t('modal_photo_hint')}</div>
            {photoPreview && (
              <button onClick={() => { setPhoto(''); setPhotoPreview(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 11, cursor: 'pointer', padding: 0, marginTop: 4, fontWeight: 700 }}>
                {t('modal_photo_remove')}
              </button>
            )}
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="ff">
            <label className="fl2">{t('modal_nom_label')}</label>
            <input value={nom} onChange={e => setNom(e.target.value)} placeholder={t('modal_nom_label')} className="fi3" />
          </div>
          <div className="ff">
            <label className="fl2">{t('modal_prenom_label')}</label>
            <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder={t('modal_prenom_label')} className="fi3" />
          </div>
        </div>

        <div className="ff">
          <label className="fl2">{t('modal_email_label')}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="fi3" />
        </div>

        <div className="ff">
          <label className="fl2">{t('modal_telephone_label')}</label>
          <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder={t('placeholder_phone')} className="fi3" />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-w"
          style={{ width: '100%', background: 'var(--white)', color: 'var(--black)', marginTop: 8 }}
        >
          {loading ? t('modal_saving') : t('modal_save_changes')}
        </button>
      </div>
    </Modal>
  );
}

function DeleteMemberModal({ membre, onClose, onSuccess }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteMember(membre.id);
      onSuccess();
      onClose();
    } catch (e) {
      alert('Erreur : ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={t('modal_confirm_title')} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '8px 0' }}>
        <div style={{ fontSize: 48 }}>🗑️</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{t('modal_delete_confirm')}</div>
          <div style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.6 }}>
            {t('modal_delete_msg')} <strong>{membre.name}</strong> {t('modal_delete_msg2')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={onClose} className="btn-o" style={{ flex: 1 }}>
            {t('modal_cancel')}
          </button>
          <button onClick={handleDelete} disabled={loading} className="btn-w" style={{ flex: 1, background: 'var(--danger)', color: '#FFF', border: 'none' }}>
            {loading ? t('modal_deleting') : t('modal_delete_btn')}
          </button>
        </div>
      </div>
    </Modal>

  );
}

function CreateMemberModal({ onClose, onSuccess }) {
  const { t } = useLanguage();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError(t('photo_too_large')); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setPhoto(reader.result); setPhotoPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!';
    setPassword(Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''));
  };

  const handleSubmit = async () => {
    setError('');
    if (!nom || !email || !password) { setError(t('mandatory_fields')); return; }
    setLoading(true);
    try {
      await api.createMember({ nom, prenom, email, telephone, password, photo });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: '#1A1A1A', border: '1px solid #333',
    borderRadius: 14, padding: '13px 16px', fontSize: 14, color: 'white',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s'
  };
  const labelStyle = { fontSize: 11, color: '#888', marginBottom: 6, fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <Modal title={t('new_member')} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '65vh', overflowY: 'auto', paddingBottom: 4 }}>
        {error && (
          <div className="error-box" style={{ background: 'rgba(255,82,82,0.1)', color: 'var(--danger)', padding: 12, borderRadius: 12, fontSize: 13, border: '1px solid rgba(255,82,82,0.2)' }}>
            {error}
          </div>
        )}

        {/* Photo Upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface)', padding: 14, borderRadius: 20, border: '1px solid var(--border)' }}>
          <label htmlFor="photo-upload" style={{ cursor: 'pointer', flexShrink: 0 }}>
            <div className="u-av" style={{ width: 64, height: 64, fontSize: 24, border: '1px dashed var(--border-light)' }}>
              {photoPreview
                ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : "📷"
              }
            </div>
          </label>
          <input id="photo-upload" type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t('modal_photo_label')}</div>
            <div style={{ fontSize: 11, color: 'var(--grey)' }}>{t('modal_photo_optional')}</div>
            {photoPreview && (
              <button onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 11, cursor: 'pointer', padding: 0, marginTop: 4, fontWeight: 700 }}>
                {t('modal_photo_remove_short')}
              </button>
            )}
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="ff">
            <label className="fl2">{t('modal_nom_required')}</label>
            <input value={nom} onChange={e => setNom(e.target.value)} placeholder={t('modal_nom_label')} className="fi3" />
          </div>
          <div className="ff">
            <label className="fl2">{t('modal_prenom_label')}</label>
            <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder={t('modal_prenom_label')} className="fi3" />
          </div>
        </div>

        <div className="ff">
          <label className="fl2">{t('modal_email_required')}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('email_placeholder')} className="fi3" />
        </div>

        <div className="ff">
          <label className="fl2">{t('modal_telephone_label')}</label>
          <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder={t('placeholder_phone')} className="fi3" />
        </div>

        <div className="ff">
          <label className="fl2">{t('modal_password_temp')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('modal_password_placeholder')}
              className="fi3"
              style={{ flex: 1, fontFamily: 'monospace' }}
            />
            <button onClick={generatePassword} title="Générer" className="btn-o" style={{ padding: '0 14px', borderRadius: 14 }}>🔀</button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-w"
          style={{ width: '100%', background: 'var(--white)', color: 'var(--black)', marginTop: 8 }}
        >
          {loading ? t('modal_creating') : t('modal_create_member_btn')}
        </button>
      </div>
    </Modal>

  );
}

function MessageModal({ onClose, membre }) {
  const { t } = useLanguage();
  const [sujet, setSujet] = useState("");
  const [contenu, setContenu] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!sujet || !contenu) return alert(t('fill_all_fields'));
    setLoading(true);
    try {
      const res = await api.sendMessage(membre.id, sujet, contenu);
      alert(res.message);
      onClose();
    } catch (e) {
      alert("Erreur: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`${t('send_email_to')} ${membre.name}`} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="ff">
          <label className="fl2">{t('email_subject')}</label>
          <input
            value={sujet} onChange={e => setSujet(e.target.value)}
            placeholder={t('placeholder_subject')}
            className="fi3"
          />
        </div>
        <div className="ff">
          <label className="fl2">{t('message')}</label>
          <textarea
            value={contenu} onChange={e => setContenu(e.target.value)}
            placeholder={t('placeholder_message')}
            rows={6}
            className="fi3"
            style={{ height: "auto", minHeight: 120 }}
          />
        </div>
        <button onClick={handleSend} disabled={loading} className="btn-w" style={{ background: "var(--white)", color: "var(--black)", marginTop: 4 }}>
          {loading ? t('processing') : t('send_now')}
        </button>
      </div>
    </Modal>

  );
}

function CotiserModal({ onClose, onSuccess, userName, membreId }) {
  const { t } = useLanguage();
  const [method, setMethod] = useState("wave");
  const [amount, setAmount] = useState("50000");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      await api.cotiser(amount, method, userName, membreId);
      setSent(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", background: "#222", border: "1px solid #333",
    borderRadius: 14, padding: "14px 16px", fontSize: 20, fontWeight: 700,
    color: "white", outline: "none", boxSizing: "border-box"
  };

  return (
    <Modal title={t('cotisation')} onClose={onClose}>
      {sent ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{t('payment_success_title') || 'Paiement validé !'}</div>
          <div style={{ color: "var(--grey)", fontSize: 14 }}>{t('payment_success_msg') || 'Votre cotisation a été enregistrée avec succès.'}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="ff">
            <label className="fl2">{t('amount_contributed')} (F CFA)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="fi3" style={{ fontSize: 22, fontWeight: 900 }} />
          </div>
          <div className="ff">
            <label className="fl2">{t('payment_method') || 'Méthode de paiement'}</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { id: "wave", label: "Wave", color: "#1DC0F1" },
                { id: "orange", label: "Orange Money", color: "#FF7900" },
              ].map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{
                  background: method === m.id ? m.color : "var(--surface)",
                  border: method === m.id ? `1px solid ${m.color}` : "1px solid var(--border)",
                  borderRadius: 14, padding: "12px 10px", color: method === m.id ? "#000" : "var(--white)",
                  fontWeight: 700, cursor: "pointer", fontSize: 13, transition: "all .2s"
                }}>{m.label}</button>
              ))}
            </div>
          </div>
          <button onClick={handlePay} disabled={loading} className="btn-w" style={{ background: "var(--white)", color: "var(--black)", marginTop: 8 }}>
            {loading ? t('modal_cotiser_processing') : t('modal_cotiser_confirm')}
          </button>
        </div>
      )}
    </Modal>

  );
}

function LoanModal({ onClose, onSuccess, membreId }) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("100000");
  const [motif, setMotif] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!motif) return alert(t('fill_all_fields'));
    setLoading(true);
    try {
      await api.requestLoan(amount, motif, membreId);
      setSent(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={t('modal_loan_title')} onClose={onClose}>
      {sent ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{t('loan_request_title')}</div>
          <div style={{ color: "var(--grey)", fontSize: 14 }}>{t('loan_request_msg')}</div>
          <button onClick={onClose} className="btn-w" style={{ marginTop: 24, background: "var(--white)", color: "var(--black)" }}>{t('close')}</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="ff">
            <label className="fl2">{t('modal_loan_amount_label')}</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="fi3" style={{ fontSize: 22, fontWeight: 900 }} />
          </div>
          <div className="ff">
            <label className="fl2">{t('modal_loan_reason_label')}</label>
            <textarea
              value={motif}
              onChange={e => setMotif(e.target.value)}
              placeholder={t('placeholder_loan_reason')}
              className="fi3"
              style={{ height: "auto", minHeight: 100, fontSize: 14 }}
            />
          </div>

          <div className="info-note" style={{ background: "rgba(255,121,0,0.05)", border: "1px solid rgba(255,121,0,0.1)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <span style={{ color: "var(--warning)" }}>{t('modal_loan_warning')}</span>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="btn-w" style={{ background: "var(--white)", color: "var(--black)", marginTop: 8 }}>
            {loading ? t('modal_loan_submitting') : t('modal_loan_submit_btn')}
          </button>
        </div>
      )}
    </Modal>

  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
const TirageIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" /></svg>
);

function Main() {
  const { user, loading, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t, language } = useLanguage();
  const [authPage, setAuthPage] = useState('landing');
  const [loginKey, setLoginKey] = useState(0);
  const [modal, setModal] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedMemberWithMessage, setSelectedMemberWithMessage] = useState(null);
  const [selectedMemberEdit, setSelectedMemberEdit] = useState(null);
  const [selectedMemberDelete, setSelectedMemberDelete] = useState(null);

  const [page, setPageBase] = useState("home");
  const [pageHistory, setPageHistory] = useState(['home']);

  const setPage = useCallback((newPage) => {
    if (newPage === page) return;
    setPageHistory(prev => [...prev, newPage]);
    setPageBase(newPage);
  }, [page]);

  const goBack = useCallback(() => {
    if (pageHistory.length <= 1) return;
    const newHistory = [...pageHistory];
    newHistory.pop();
    const prevPage = newHistory[newHistory.length - 1];
    setPageHistory(newHistory);
    setPageBase(prevPage);
  }, [pageHistory]);

  const [tontine, setTontine] = useState(null);
  const [membres, setMembres] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [prets, setPrets] = useState([]);
  const [tours, setTours] = useState([]);
  const [tirageData, setTirageData] = useState(null);
  const [financeStats, setFinanceStats] = useState(null);
  const [memberDashboard, setMemberDashboard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [joinedTontineId, setJoinedTontineId] = useState(null);
  const [memberStatus, setMemberStatus] = useState(null);

  const isSuperAdmin = user?.role === 'admin';
  const isGerant = user?.role === 'gerant' || isSuperAdmin;
  const isMembre = !isGerant && (
    !!memberStatus?.is_member ||
    !!joinedTontineId ||
    !!memberDashboard?.membre ||
    (membres || []).some(m => Number(m.user_id) === Number(user?.id))
  );

  const loadMemberContext = useCallback(async (preferredTontineId) => {
    if (!user || user.role === 'gerant' || user.role === 'admin') return null;

    if (preferredTontineId) {
      localStorage.setItem('selectedTontineId', String(preferredTontineId));
    }

    const statusRes = await api.getMemberStatus().catch(() => null);
    const status = statusRes?.data || null;
    setMemberStatus(status);

    if (status?.membership?.tontine_id) {
      localStorage.setItem('selectedTontineId', String(status.membership.tontine_id));
    } else if (!status?.is_member) {
      localStorage.removeItem('selectedTontineId');
    }

    const dashMember = await api.getMemberDashboard().catch(() => null);
    if (dashMember?.data) setMemberDashboard(dashMember.data);

    return status;
  }, [user]);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      if (user && user.role !== 'gerant' && user.role !== 'admin') {
        await loadMemberContext();
      }

      const [dashData, memData, transData, pretsData, toursData, tirageRes] = await Promise.all([
        api.getTontine().catch(() => null),
        api.getMembres().catch(() => null),
        api.getTransactions().catch(() => null),
        api.getLoans().catch(() => null),
        api.getTours().catch(() => null),
        api.getTirage().catch(() => null),
      ]);

      if (dashData?.data) setTontine(dashData.data);
      setMembres(memData?.data || []);
      setTransactions(transData?.data || []);
      setPrets(pretsData?.data || []);
      setTours(toursData?.data || []);
      setTirageData(tirageRes);
      setFinanceStats({
        ...(transData?.stats || {}),
        totalPrets: pretsData?.stats?.montantTotal || 0
      });
    } catch (e) {
      console.error("Erreur chargement données", e);
    } finally {
      setRefreshing(false);
    }
  }, [user, loadMemberContext]);

  const handleMemberJoinSuccess = useCallback(async (res) => {
    const tontineId = res.tontine_id;

    setMemberStatus({
      is_member: true,
      membership: {
        tontine_id: tontineId,
        tontine_nom: res.tontine_nom,
      },
    });
    if (tontineId) {
      localStorage.setItem('selectedTontineId', String(tontineId));
      setJoinedTontineId(tontineId);
    }

    setPageBase('home');
    setPageHistory(['home']);
    setRefreshing(true);

    try {
      await loadMemberContext(tontineId);

      const [dashData, memData, transData, pretsData, toursData, tirageRes] = await Promise.all([
        api.getTontine().catch(() => null),
        api.getMembres().catch(() => null),
        api.getTransactions().catch(() => null),
        api.getLoans().catch(() => null),
        api.getTours().catch(() => null),
        api.getTirage().catch(() => null),
      ]);

      if (dashData?.data) setTontine(dashData.data);
      setMembres(memData?.data || []);
      setTransactions(transData?.data || []);
      setPrets(pretsData?.data || []);
      setTours(toursData?.data || []);
      setTirageData(tirageRes);
      setFinanceStats({
        ...(transData?.stats || {}),
        totalPrets: pretsData?.stats?.montantTotal || 0
      });
    } catch (e) {
      console.error("Erreur chargement après adhésion", e);
    } finally {
      setRefreshing(false);
    }
  }, [loadMemberContext]);

  useEffect(() => {
    if (user) { setPageBase("home"); setPageHistory(['home']); refreshData(); }
    else { setAuthPage('landing'); setLoginKey(k => k + 1); }
  }, [user, refreshData]);

  useEffect(() => {
    if (joinedTontineId && memberStatus?.is_member) {
      setJoinedTontineId(null);
    }
  }, [memberStatus, joinedTontineId]);

  // Auto-refresh polling (30s) + Focus Refresh
  useEffect(() => {
    if (!user) return;

    // Rafraîchissement automatique toutes les 30 secondes
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, refreshData]);

  if (loading) return (
    <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--black)", color: "var(--white)", flexDirection: "column", gap: 12 }}>
      <div style={{ animation: "spin 1s linear infinite", fontSize: 28 }}>⟳</div>
      <div style={{ fontSize: 14, color: "var(--grey)" }}>Chargement...</div>
    </div>
  );

  if (!user) {
    if (authPage === 'landing') {
      return (
        <LandingPage
          onLogin={() => setAuthPage('login')}
          onRegister={() => setAuthPage('register')}
        />
      );
    }
    return authPage === 'login'
      ? <LoginPage key={loginKey} onRegister={() => setAuthPage('register')} onBack={() => setAuthPage('landing')} />
      : <RegisterPage key={loginKey} onLogin={() => setAuthPage('login')} onBack={() => setAuthPage('landing')} />;
  }

  const navItems = [
    { id: "home", label: t('nav_home'), Icon: PremiumHomeIcon, group: "Principal" },
    { id: "finances", label: t('nav_finances'), Icon: PremiumFinanceIcon, group: "Gestion" },
    ...(isGerant ? [{ id: "membres", label: t('nav_members'), Icon: PremiumMembersIcon, group: "Gestion" }] : []),
    { id: "tontines", label: t('nav_tontines'), Icon: PremiumTontineIcon, group: "Principal" },
    ...(isGerant ? [{ id: "tirage", label: t('nav_tirage'), Icon: PremiumTirageIcon, group: "Principal" }] : []),
    { id: "notifications", label: t('nav_notifications'), Icon: PremiumNotifIcon, group: "Principal" },
    ...(isGerant ? [{ id: "rappels", label: t('nav_rappels'), Icon: PremiumRappelIcon, group: "Principal" }] : []),
    { id: "parametres", label: t('nav_settings'), Icon: PremiumProfileIcon, group: "Gestion" },
  ];

  return (
    <ErrorBoundary>
      <style>{GLOBAL_CSS}</style>

      <div className="shell">
        {/* SIDEBAR */}
        <div className="sb">
          <div className="sb-head">
            <div className="sb-brand">
              <div className="sb-logomark" style={{ background: 'transparent', border: 'none', overflow: 'hidden', padding: 0 }}>
                <img src="/nattat.jpeg" alt="Nataal" width="34" height="34" style={{ display: 'block' }} />
              </div>
              <div>
                <div className="sb-name" style={{ color: 'var(--primary-light)', letterSpacing: '.06em' }}>NATAAL</div>
                <div className="sb-sub">{t('tontine_premium')}</div>
              </div>
            </div>
            <div className="sb-status">
              <div className="sb-pip"></div>
              {t('system_active')}
            </div>
          </div>

          <div className="sb-nav">
            <div className="sb-sep">{t('nav_group_main')}</div>
            {navItems.filter(i => i.group === "Principal").map(({ id, label, Icon }) => (
              <button key={id} className={`nb ${page === id ? 'on' : ''}`} onClick={() => setPage(id)}>
                <Icon />
                <span className="nl">{label}</span>
              </button>
            ))}

            <div className="sb-sep">{t('nav_group_manage')}</div>
            {navItems.filter(i => i.group === "Gestion").map(({ id, label, Icon }) => (
              <button key={id} className={`nb ${page === id ? 'on' : ''}`} onClick={() => setPage(id)}>
                <Icon />
                <span className="nl">{label}</span>
              </button>
            ))}
          </div>

          <div className="sb-foot">
            <div className="u-row" onClick={() => setPage('profil')}>
              <div className="u-av">{(user.initials || user.name?.charAt(0) || "?").substring(0, 2)}</div>
              <div>
                <div className="u-name">{user.name}</div>
                <div className="u-role">{isSuperAdmin ? '👑 Super Admin' : isGerant ? t('role_admin') : t('role_member')}</div>
              </div>
              <div className="u-dots"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg></div>
            </div>
            <div className="lo-row" onClick={() => setShowLogoutConfirm(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, background: 'rgba(255,82,82,0.08)', border: '1px solid rgba(255,82,82,0.15)', margin: '8px 12px 4px', transition: 'background .2s' }}>
              <LogoutIcon size={16} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)' }}>{t('logout')}</span>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          {/* TOPBAR */}
          <div className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {page !== 'home' && (
                <button onClick={() => setPage('home')} style={{
                  background: 'var(--surface-hover)', border: '1px solid var(--border)',
                  color: 'var(--white)', width: 32, height: 32, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                </button>
              )}
              <div>
                <div className="page-title">
                  {page === 'home' && t('page_home')}
                  {page === 'finances' && t('page_finances')}
                  {page === 'membres' && t('page_members')}
                  {page === 'tontines' && t('page_tontines')}
                  {page === 'notifications' && t('page_notifications')}
                  {page === 'rappels' && t('page_rappels')}
                  {page === 'parametres' && t('page_settings')}
                  {page === 'profil' && t('page_profile')}
                  {page === 'tirage' && t('page_tirage')}
                  {page === 'privacy' && t('page_privacy')}
                  {page === 'cgu' && t('page_cgu')}
                  {page === 'faq' && t('page_faq')}
                </div>
                <div className="page-sub">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {t('system_active')}
                </div>
              </div>
            </div>
            <div className="tb-right">
              <div className="icon-btn" onClick={() => setPage('notifications')} aria-label={t('nav_notifications')} title={t('nav_notifications')} role="button" tabIndex="0">
                <PremiumNotifIcon />
                <div className="dot-badge"></div>
              </div>
              <div className="icon-btn" aria-label={t('search')} title={t('search')} role="button" tabIndex="0">
                <SearchIcon />
              </div>
              <div className="av-topbar" onClick={() => setPage('profil')}>
                {(user.initials || user.name?.charAt(0) || "?").substring(0, 2)}
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="content">
            {page === "home" && <HomePage
              tontine={tontine}
              tours={tours}
              transactions={transactions}
              onCotiser={() => setModal("cotiser")}
              onLoan={() => setModal("loan")}
              loading={refreshing || (!!joinedTontineId && !tontine)}
              onRefresh={refreshData}
              refreshing={refreshing}
              isGerant={isGerant}
              userId={user.id}
              memberDashboard={memberDashboard}
              tirage={tirageData}
              isMembre={isMembre}
              onSetPage={setPage}
              stats={isGerant ? (financeStats || {}) : (memberDashboard?.stats || {})}
              cotisation={tontine?.cotisation_mensuelle || 0}
            />}
            {page === "finances" && <FinancesPage stats={financeStats} transactions={transactions} prets={prets} onCotiser={() => setModal("cotiser")} onLoan={() => setModal("loan")} isGerant={isGerant} onRefresh={refreshData} userId={user.id} memberId={memberDashboard?.membre?.id} />}
            {page === "membres" && isGerant && <MembresPage
              membres={membres} isGerant={isGerant} onRefresh={refreshData}
              onOpenMessage={(m) => { setSelectedMemberWithMessage(m); setModal("message"); }}
              onAddMember={() => setModal("createMember")}
              onEditMember={(m) => { setSelectedMemberEdit(m); setModal("editMember"); }}
              onDeleteMember={(m) => { setSelectedMemberDelete(m); setModal("deleteMember"); }}
            />}
            {page === "parametres" && <ParametresPage logout={logout} />}
            {page === "profil" && <ProfilPage user={user} onSetPage={setPage} />}
            {page === "privacy" && <PrivacyPage />}
            {page === "cgu" && <CGUPage />}
            {page === "faq" && <FAQPage />}
            {page === "tontines" && <TontinesPage tontine={tontine} onRefresh={refreshData} isGerant={isGerant} onJoinSuccess={handleMemberJoinSuccess} />}
            {page === "notifications" && <NotificationsPage />}
            {page === "rappels" && isGerant && <RemindersPage membres={membres} />}
            {page === "tirage" && isGerant && <TiragePage onRefresh={refreshData} membres={membres} tontine={tontine} />}
          </div>
        </div>
      </div>


      {modal === "cotiser" && <CotiserModal onClose={() => setModal(null)} onSuccess={refreshData} userName={user.name} membreId={membres.find(m => m.user_id === user.id)?.id} />}
      {modal === "loan" && <LoanModal onClose={() => setModal(null)} onSuccess={refreshData} membreId={membres.find(m => m.user_id === user.id)?.id} />}
      {modal === "message" && selectedMemberWithMessage && <MessageModal onClose={() => { setModal(null); setSelectedMemberWithMessage(null); }} membre={selectedMemberWithMessage} />}
      {modal === "createMember" && isGerant && <CreateMemberModal onClose={() => setModal(null)} onSuccess={() => { setModal(null); refreshData(); }} />}
      {modal === "editMember" && selectedMemberEdit && isGerant && (
        <EditMemberModal
          membre={selectedMemberEdit}
          onClose={() => { setModal(null); setSelectedMemberEdit(null); }}
          onSuccess={() => { setSelectedMemberEdit(null); refreshData(); }}
        />
      )}
      {modal === "deleteMember" && selectedMemberDelete && isGerant && (
        <DeleteMemberModal
          membre={selectedMemberDelete}
          onClose={() => { setModal(null); setSelectedMemberDelete(null); }}
          onSuccess={() => { setSelectedMemberDelete(null); refreshData(); }}
        />
      )}
      {modal === "tirage" && isGerant && (() => {
        const eligibles = membres.filter(m => m.paid && !m.a_recu_tirage);
        const moisCourant = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', { month: 'long', year: 'numeric' });
        const moisFormatted = moisCourant.charAt(0).toUpperCase() + moisCourant.slice(1);

        const handleSpinResult = async (winner) => {
          try {
            const montantTotal = tontine?.cotisation_mensuelle ? tontine.cotisation_mensuelle * eligibles.length : 0;
            await api.doTirage(winner.id, montantTotal, moisFormatted);
            await api.createNotification({
              user_id: winner.user_id || winner.user_actual_id,
              texte: t('tirage_congrats').replace('{name}', winner.name).replace('{month}', moisFormatted),
              icon: '🎉',
              type: 'tirage_gagnant',
              global: false,
            }).catch(() => { });
            refreshData();
          } catch (e) {
            alert(t('tirage_error') + e.message);
          }
        };

        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(8px)', zIndex: 100,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            animation: 'fadeIn .2s ease'
          }} onClick={() => setModal(null)}>
            <div style={{
              background: '#0A0A0A', borderRadius: '28px 28px 0 0',
              padding: '20px 16px env(safe-area-inset-bottom, 24px)',
              width: '100%', maxWidth: 520, maxHeight: '95dvh', overflowY: 'auto',
              animation: 'slideUp .3s ease'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{t('tirage_modal_title')}{moisFormatted}</span>
                <button onClick={() => setModal(null)} aria-label={t('close')} style={{ background: '#222', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('close')}><CloseIcon /></button>
              </div>
              {eligibles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>{t('tirage_no_eligible_title')}</div>
                  <div style={{ fontSize: 13 }}>{t('tirage_no_eligible_msg')}</div>
                </div>
              ) : (
                <SpinWheel
                  participants={eligibles}
                  montant={tontine?.cotisation_mensuelle ? tontine.cotisation_mensuelle * eligibles.length : 0}
                  mois={moisFormatted}
                  onResult={handleSpinResult}
                  onClose={() => setModal(null)}
                  dark={true}
                />
              )}
            </div>
          </div>
        );
      })()}

      {showLogoutConfirm && (
        <Modal title={t('logout_confirm_title')} onClose={() => setShowLogoutConfirm(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 48 }}>🚪</div>
            <div style={{ fontSize: 14, color: 'var(--grey)', lineHeight: 1.6 }}>{t('logout_confirm_msg')}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-o" style={{ flex: 1 }}>
                {t('logout_confirm_no')}
              </button>
              <button onClick={() => { setShowLogoutConfirm(false); logout(); }} className="btn-w" style={{ flex: 1, background: 'var(--danger)', color: '#FFF', border: 'none' }}>
                {t('logout_confirm_yes')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Bannière d'installation PWA ────────────────────────── */}
      <PWAInstallBanner />
    </ErrorBoundary>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
