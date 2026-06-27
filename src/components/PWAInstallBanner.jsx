import React, { useState, useEffect } from "react";

// ─── Détection de la plateforme ────────────────────────────────────────────
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

// ─── Hook d'installation PWA ───────────────────────────────────────────────
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Déjà installée ?
    if (isInStandaloneMode()) {
      setIsInstalled(true);
      return;
    }

    // iOS — pas d'événement beforeinstallprompt
    if (isIOS()) {
      setIsIOSDevice(true);
      setIsInstallable(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      setIsInstallable(false);
      return true;
    }
    return false;
  };

  return { isInstallable, isIOSDevice, isInstalled, install };
}

// ─── Icônes ────────────────────────────────────────────────────────────────
const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ShareIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

// ─── Bannière d'installation principale ────────────────────────────────────
export default function PWAInstallBanner() {
  const { isInstallable, isIOSDevice, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Vérifier si déjà ignoré dans cette session
    const wasDismissed = sessionStorage.getItem("pwa-banner-dismissed");
    if (wasDismissed) setDismissed(true);

    // Animation d'entrée
    const timer = setTimeout(() => setMounted(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  const handleInstall = async () => {
    if (isIOSDevice) {
      setShowIOSGuide(true);
      return;
    }
    setInstalling(true);
    await install();
    setInstalling(false);
  };

  // Conditions d'affichage
  if (!isInstallable || isInstalled || dismissed) return null;

  return (
    <>
      {/* ── Bannière principale ─────────────────────────────────── */}
      <div
        id="pwa-install-banner"
        style={{
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)",
          left: "50%",
          transform: `translateX(-50%) translateY(${mounted ? "0" : "120px"})`,
          width: "calc(100% - 32px)",
          maxWidth: 420,
          zIndex: 9999,
          transition: "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
          opacity: mounted ? 1 : 0,
        }}
      >
        <div style={{
          background: "linear-gradient(135deg, rgba(26, 122, 46, 0.95) 0%, rgba(10, 80, 30, 0.98) 100%)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderRadius: 24,
          padding: "16px 18px",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(26,122,46,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}>
          {/* Icône app */}
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}>
            <img
              src="/nattat.jpeg"
              alt="Nataal"
              width="52"
              height="52"
              style={{ display: "block", objectFit: "cover" }}
              onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = '<span style="font-size:26px">🏦</span>'; }}
            />
          </div>

          {/* Texte */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.01em",
              marginBottom: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              Installer Nataal Tontine
            </div>
            <div style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.4,
            }}>
              {isIOSDevice
                ? "Ajoutez l'app à votre écran d'accueil"
                : "Accédez hors ligne, comme une vraie app"}
            </div>
          </div>

          {/* Bouton installer */}
          <button
            id="pwa-install-btn"
            onClick={handleInstall}
            disabled={installing}
            style={{
              background: "rgba(255,255,255,0.95)",
              color: "#0d4a1a",
              border: "none",
              borderRadius: 12,
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexShrink: 0,
              transition: "all 0.2s ease",
              opacity: installing ? 0.7 : 1,
              transform: installing ? "scale(0.96)" : "scale(1)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.background = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "rgba(255,255,255,0.95)"; }}
          >
            {installing ? (
              <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
            ) : isIOSDevice ? (
              <ShareIcon />
            ) : (
              <DownloadIcon />
            )}
            {installing ? "..." : "Installer"}
          </button>

          {/* Bouton fermer */}
          <button
            id="pwa-dismiss-btn"
            onClick={handleDismiss}
            aria-label="Fermer"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.8)",
              flexShrink: 0,
              transition: "background 0.2s",
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
          >
            <XIcon />
          </button>
        </div>
      </div>

      {/* ── Guide iOS ──────────────────────────────────────────────── */}
      {showIOSGuide && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            style={{
              background: "#0F1A12",
              borderRadius: "28px 28px 0 0",
              padding: "24px 20px calc(env(safe-area-inset-bottom, 20px) + 20px)",
              width: "100%",
              maxWidth: 520,
              border: "1px solid rgba(26,122,46,0.3)",
              borderBottom: "none",
              animation: "slideUp 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{
              width: 40, height: 4, background: "rgba(255,255,255,0.15)",
              borderRadius: 2, margin: "0 auto 20px",
            }} />

            {/* Titre */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)",
                flexShrink: 0,
              }}>
                <img src="/nattat.jpeg" alt="Nataal" width="46" height="46" style={{ display: "block" }} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#FFF", marginBottom: 2 }}>
                  Installer Nataal Tontine
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  sur votre écran d'accueil
                </div>
              </div>
            </div>

            {/* Étapes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                {
                  step: "1",
                  icon: "📤",
                  title: "Appuyez sur le bouton Partager",
                  desc: 'Cherchez l\'icône "Partager" (carré avec flèche) dans Safari',
                },
                {
                  step: "2",
                  icon: "➕",
                  title: 'Sélectionnez "Sur l\'écran d\'accueil"',
                  desc: 'Faites défiler et appuyez sur "Ajouter à l\'écran d\'accueil"',
                },
                {
                  step: "3",
                  icon: "✅",
                  title: "Confirmez l'installation",
                  desc: 'Appuyez sur "Ajouter" en haut à droite pour finaliser',
                },
              ].map(({ step, icon, title, desc }) => (
                <div
                  key={step}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 16,
                    padding: "14px 16px",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: "linear-gradient(135deg, #1a7a2e, #0d4a1a)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(26,122,46,0.3)",
                  }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#FFF", marginBottom: 3 }}>
                      {title}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fermer */}
            <button
              onClick={() => { setShowIOSGuide(false); handleDismiss(); }}
              style={{
                marginTop: 20,
                width: "100%",
                padding: "14px",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Compris 👍
            </button>
          </div>
        </div>
      )}
    </>
  );
}
