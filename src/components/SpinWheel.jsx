import { useRef, useState, useEffect, useCallback } from 'react';
import { assetUrl } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const WHEEL_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
  '#9966FF', '#FF9F40', '#C9CBCF', '#E7E9ED',
  '#1a7a2e', '#2eb85c', '#10b981', '#059669',
];

const CONFETTI_PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  left: Math.random() * 100,
  delay: Math.random() * 1.8,
  color: WHEEL_COLORS[i % WHEEL_COLORS.length],
  size: 6 + Math.random() * 9,
  duration: 2.2 + Math.random() * 2,
  shape: Math.random() > 0.5 ? 'circle' : 'rect',
}));

const fmt = (n) => n?.toLocaleString('fr-FR');
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// ─── WINNER OVERLAY ───────────────────────────────────────────────────────────
function WinnerOverlay({ winner, montant, mois, onConfirm, onClose, dark = true }) {
  const { t } = useLanguage();
  const smsText = t('spin_winner_congrats')
    .replace('{name}', winner.name)
    .replace('{month}', mois)
    .replace('{amount}', fmt(montant));
    
  const phone = (winner.telephone || winner.phone || '').replace(/\s/g, '');

  const handleSMS = () => {
    window.open(`sms:${phone}?body=${encodeURIComponent(smsText)}`, '_self');
  };

  return (
    <div className="mdl" style={{ zIndex: 2000 }}>
      <style>{`
      @keyframes fall {
        0%   { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(115vh) rotate(720deg); opacity: 0; }
      }
      @keyframes pop-in {
        0%   { transform: scale(0.9); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `}</style>
      {CONFETTI_PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'fixed', top: 0,
          left: `${p.left}%`,
          width: p.shape === 'circle' ? p.size : p.size * 1.4,
          height: p.size,
          borderRadius: p.shape === 'circle' ? '50%' : 3,
          background: p.color,
          animation: `fall ${p.duration}s ${p.delay}s ease-in infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <div className="mdl-c" style={{ textAlign: 'center', animation: 'pop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🏆</div>

        <div className="u-av" style={{ width: 80, height: 80, margin: '0 auto 16px', fontSize: 28, background: winner.color || 'var(--primary)', border: '2px solid var(--white)' }}>
          {winner.photo
            ? <img src={assetUrl(winner.photo)} alt={winner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (winner.initials || winner.name?.charAt(0))
          }
        </div>

        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--white)', marginBottom: 4 }}>{winner.name}</div>
        <div className="sc-label" style={{ marginBottom: 20 }}>{t('spin_winner_label')}</div>

        <div className="card" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-light)', padding: '18px', marginBottom: 24 }}>
          <div className="sc-label" style={{ color: 'var(--primary)', fontWeight: 800 }}>{t('spin_amount_month').replace('{month}', mois)}</div>
          <div className="sc-val" style={{ fontSize: 32 }}>{fmt(montant)} <span style={{ fontSize: 16, fontFamily: 'DM Sans' }}>FCFA</span></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {phone ? (
            <button onClick={handleSMS} className="btn-o" style={{ width: '100%', background: 'var(--primary)', border: 'none', color: '#fff' }}>
              {t('spin_send_sms')}
            </button>
          ) : (
            <div className="info-note" style={{ justifyContent: 'center' }}>
              <span>{t('spin_no_phone')}</span>
            </div>
          )}

          <button onClick={onConfirm} className="btn-w" style={{ width: '100%', background: 'var(--primary)', color: '#FFF' }}>
            {t('spin_close')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SPIN WHEEL ───────────────────────────────────────────────────────────────
export default function SpinWheel({ participants, montant, mois, onResult, onClose, dark = true, disabled = false }) {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [phase, setPhase] = useState('idle'); // idle | spinning | result
  const [winner, setWinner] = useState(null);
  const [resultText, setResultText] = useState('');

  const SIZE = 500;
  const n = participants.length;
  const sliceAngle = (2 * Math.PI) / n;

  // Draw wheel at given rotation angle
  const drawWheel = useCallback((angle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = SIZE, H = SIZE;
    const cx = W / 2, cy = H / 2;
    const r = W / 2 - 8;

    ctx.clearRect(0, 0, W, H);

    // Draw slices
    participants.forEach((p, i) => {
      const start = angle + i * sliceAngle;
      const end = start + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();

      // Separators
      ctx.strokeStyle = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Name text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      const fontSize = n > 10 ? 12 : n > 6 ? 14 : 18;
      ctx.font = `bold ${fontSize}px Arial, Inter, -apple-system, sans-serif`;
      const displayName = p.name.split(' ')[0];
      const maxLen = n > 8 ? 7 : 10;
      ctx.fillText(displayName.length > maxLen ? displayName.slice(0, maxLen) + '…' : displayName, r * 0.6, 5);
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle = dark ? '#111' : '#f0f0f0';
    ctx.fill();
    ctx.strokeStyle = '#1a7a2e';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center text "NT"
    ctx.fillStyle = dark ? '#fff' : '#333';
    ctx.font = 'bold 11px Inter, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nataal', cx, cy + 4);

    // Pointer arrow (top center, outside wheel)
    ctx.beginPath();
    ctx.moveTo(cx - 12, 2);
    ctx.lineTo(cx + 12, 2);
    ctx.lineTo(cx, 28);
    ctx.closePath();
    ctx.fillStyle = '#ff7900';
    ctx.shadowColor = 'rgba(255, 121, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [participants, sliceAngle, n, dark]);

  // Init draw
  useEffect(() => {
    drawWheel(-Math.PI / 2);
  }, [drawWheel]);

  const handleSpin = () => {
    if (phase !== 'idle' || n === 0 || disabled) return;
    setResultText('');

    // Choose winner BEFORE animation
    const winnerIdx = Math.floor(Math.random() * n);
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const winnerSliceCenter = winnerIdx * sliceAngle + sliceAngle / 2;
    const targetAngle = -winnerSliceCenter - Math.PI / 2 + extraSpins * 2 * Math.PI;
    const startAngle = -Math.PI / 2;
    const duration = 4000;
    const startTime = performance.now();

    setPhase('spinning');

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const angle = startAngle + (targetAngle - startAngle) * easeOut(progress);

      drawWheel(angle);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Animation done — normalize final angle and show winner
        drawWheel(targetAngle);
        const winMember = participants[winnerIdx];
        setWinner(winMember);
        setPhase('result');
        setResultText(`🎉 ${winMember.name} 🎉`);
        onResult(winMember);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const handleConfirm = async () => {
    // This now just closes the UI since onResult was already called automatically
    onClose();
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
      padding: '8px 0 16px',
    }}>
      <style>{`
        @keyframes pulse-arrow { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.15)} }
      `}</style>

      {/* Canvas */}
      <div style={{ position: 'relative', width: '100%', maxWidth: SIZE, aspectRatio: '1 / 1', margin: '0 auto' }}>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            display: 'block',
            border: '8px solid #333',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      {/* Spin button */}
      <button
        onClick={handleSpin}
        disabled={phase === 'spinning' || disabled || n === 0}
        style={{
          background: (phase === 'spinning' || disabled || n === 0)
            ? '#ccc'
            : '#e74c3c',
          color: '#FFF',
          border: 'none', padding: '15px 40px', borderRadius: 50,
          fontSize: 24, fontWeight: 800, cursor: (phase === 'spinning' || disabled || n === 0) ? 'not-allowed' : 'pointer',
          transition: 'all .3s', width: '100%', maxWidth: 320,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: (phase === 'spinning' || disabled || n === 0) ? 'none' : '0 4px 24px rgba(231,76,60,0.35)',
        }}
      >
        {phase === 'spinning' ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', fontSize: 18 }}>⟳</span>
            {t('spin_spinning')}
          </>
        ) : (
          <>{t('spin_launch')}</>
        )}
      </button>

      {resultText && (
        <div style={{ marginTop: 4, fontSize: 28, fontWeight: 'bold', minHeight: 40, color: 'var(--white)' }}>
          {resultText}
        </div>
      )}

      {/* Eligible participants list */}
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: 10 }}>
          {t('spin_eligible_count')
            .replace('{count}', n)
            .replace('{s}', n > 1 ? 's' : '')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {participants.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: '#1A1A1A', borderRadius: 20, padding: '6px 12px',
              border: `1px solid ${WHEEL_COLORS[i % WHEEL_COLORS.length]}44`,
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: WHEEL_COLORS[i % WHEEL_COLORS.length], flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#CCC' }}>{p.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Winner Overlay */}
      {phase === 'result' && winner && (
        <WinnerOverlay
          winner={winner}
          montant={montant}
          mois={mois}
          onConfirm={handleConfirm}
          onClose={onClose}
        />
      )}
    </div>
  );
}
