import React, { useState } from "react";
import { api, assetUrl } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

export function LoanItem({ l, isGerant, onRefresh, userId }) {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(false);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(false);

    // Inline confirmation states — avoids native window.confirm()
    const [confirmAction, setConfirmAction] = useState(null); // null | 'approve' | 'reject' | 'pay'
    const [pendingPayId, setPendingPayId] = useState(null);
    const [pendingPayAmt, setPendingPayAmt] = useState(null);
    const [acting, setActing] = useState(false);

    const STATUS_CONFIG = {
        'En attente': { color: '#FF7900', bg: 'rgba(255,121,0,0.12)', label: t('loan_status_pending'), icon: '⏳' },
        'Approuvé': { color: '#2eb85c', bg: 'rgba(46,184,92,0.12)', label: t('loan_status_approved'), icon: '✅' },
        'En cours': { color: '#2eb85c', bg: 'rgba(46,184,92,0.12)', label: t('loan_status_current'), icon: '✅' },
        'Remboursé': { color: '#00C853', bg: 'rgba(0,200,83,0.12)', label: t('loan_status_repaid'), icon: '💚' },
        'Rejeté': { color: '#FF5252', bg: 'rgba(255,82,82,0.12)', label: t('loan_status_rejected'), icon: '❌' },
    };

    const approbations = JSON.parse(l.approbations || "[]");
    const hasApproved = approbations.includes(userId);
    const statusCfg = STATUS_CONFIG[l.status] || { color: '#888', bg: '#1A1A1A', label: l.status, icon: '•' };

    const paidInstallments = schedule ? schedule.filter(s => s.statut === 'payé').length : 0;
    const progressPct = schedule && schedule.length > 0 ? Math.round((paidInstallments / schedule.length) * 100) : 0;
    const paidAmount = schedule ? schedule.filter(s => s.statut === 'payé').reduce((a, s) => a + s.montant_verse, 0) : 0;
    const totalAmount = schedule ? schedule.reduce((a, s) => a + s.montant_verse, 0) : Math.round(l.montant * 1.10);

    const isPending = l.status === 'En attente';
    const isApproved = l.status === 'Approuvé' || l.status === 'En cours';

    // ─── Toggle expand (load schedule for approved loans) ──────────────────
    const toggleExpand = async () => {
        if (!expanded && !schedule && (isApproved || l.status === 'Remboursé')) {
            setLoading(true);
            try {
                const data = await api.getLoanSchedule(l.id);
                setSchedule(data);
            } catch (e) {
                console.error("Erreur chargement échéancier", e);
            } finally {
                setLoading(false);
            }
        }
        setExpanded(v => !v);
        setConfirmAction(null);
    };

    // ─── Confirm actions ───────────────────────────────────────────────────
    const executeApprove = async () => {
        setActing(true);
        try {
            await api.approveLoan(l.id);
            setConfirmAction(null);
            onRefresh();
        } catch (err) {
            alert(err.message);
        } finally {
            setActing(false);
        }
    };

    const executeReject = async () => {
        setActing(true);
        try {
            await api.rejectLoan(l.id);
            setConfirmAction(null);
            onRefresh();
        } catch (err) {
            alert(err.message);
        } finally {
            setActing(false);
        }
    };

    const executePay = async () => {
        setActing(true);
        try {
            await api.payInstallment(pendingPayId);
            const data = await api.getLoanSchedule(l.id);
            setSchedule(data);
            setConfirmAction(null);
            setPendingPayId(null);
            onRefresh();
        } catch (err) {
            alert(err.message);
        } finally {
            setActing(false);
        }
    };

    const formattedDate = l.created_at
        ? new Date(l.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        : null;

    // ─── Inline confirmation bar ───────────────────────────────────────────
    const ConfirmBar = ({ action, label, onConfirm, onCancel }) => (
        <div style={{
            background: action === 'reject' ? 'rgba(255,82,82,0.08)' : action === 'pay' ? 'rgba(255,255,255,0.05)' : 'rgba(0,200,83,0.08)',
            border: `1px solid ${action === 'reject' ? 'rgba(255,82,82,0.25)' : action === 'pay' ? '#333' : 'rgba(0,200,83,0.25)'}`,
            borderRadius: 16, padding: "14px 16px", margin: "0 0 2px"
        }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#CCC', marginBottom: 12, lineHeight: 1.4 }}>
                {label}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    onClick={onCancel}
                    style={{
                        flex: 1, background: '#222', color: '#888', border: '1px solid #333',
                        borderRadius: 12, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                    }}
                >
                    {t('loan_cancel')}
                </button>
                <button
                    onClick={onConfirm}
                    disabled={acting}
                    style={{
                        flex: 2,
                        background: action === 'reject' ? '#FF5252' : action === 'pay' ? '#FFF' : '#00C853',
                        color: action === 'pay' ? '#000' : '#FFF',
                        border: 'none', borderRadius: 12, padding: '10px',
                        fontSize: 13, fontWeight: 800, cursor: 'pointer',
                        opacity: acting ? 0.6 : 1
                    }}
                >
                    {acting ? `⟳ ${t('loan_processing')}` : action === 'reject' ? t('loan_confirm_reject') : action === 'pay' ? t('loan_collect_amount').replace('{amount}', pendingPayAmt?.toLocaleString('fr-FR')) : t('loan_confirm_signature')}
                </button>
            </div>
        </div>
    );

    return (
        <div style={{
            background: "#1A1A1A", borderRadius: 20, overflow: "hidden",
            border: `1px solid ${(expanded || confirmAction) ? '#2A2A2A' : 'transparent'}`,
            transition: "border-color .2s"
        }}>
            {/* ─── HEADER ─────────────────────────────────────────── */}
            <div
                onClick={toggleExpand}
                data-testid="loan-header"
                style={{
                    padding: "14px 16px", display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 12, cursor: "pointer"
                }}
            >
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {l.membre_name || t('loan_member')}
                    </div>
                    <div style={{ fontSize: 12, color: "#777", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {l.motif || t('loan_no_motif')}
                    </div>
                    {formattedDate && (
                        <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>🗓 {formattedDate}</div>
                    )}
                </div>

                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#FFF", letterSpacing: -0.5 }}>
                        {(l.montant || 0).toLocaleString('fr-FR')} F
                    </div>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: statusCfg.bg, padding: "3px 10px",
                        borderRadius: 20, border: `1px solid ${statusCfg.color}22`
                    }}>
                        <span style={{ fontSize: 10 }}>{statusCfg.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: statusCfg.color }}>
                            {statusCfg.label}
                        </span>
                        {isPending && (
                            <span style={{ fontSize: 10, color: approbations.length > 0 ? "#00C853" : "#555", fontWeight: 700, marginLeft: 2 }}>
                                {approbations.length}/2
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── INLINE ACTION BUTTONS for pending loans (gérant only) ── */}
            {isPending && isGerant && confirmAction === null && (
                <div style={{ padding: "0 14px 14px", display: "flex", gap: 8 }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setConfirmAction('approve'); }}
                        disabled={hasApproved}
                        style={{
                            flex: 2,
                            background: hasApproved ? "#1A1A1A" : "#00C853",
                            color: hasApproved ? "#444" : "#FFF",
                            border: hasApproved ? "1px solid #2A2A2A" : "none",
                            borderRadius: 14, padding: "11px 12px",
                            fontSize: 13, fontWeight: 800,
                            cursor: hasApproved ? "default" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            transition: "all .15s"
                        }}
                    >
                        {hasApproved
                            ? t('loan_already_signed')
                            : approbations.length === 0
                                ? t('loan_sign_step1')
                                : t('loan_sign_step2')
                        }
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setConfirmAction('reject'); }}
                        style={{
                            flex: 1,
                            background: "transparent",
                            color: "#FF5252",
                            border: "1px solid rgba(255,82,82,0.3)",
                            borderRadius: 14, padding: "11px 12px",
                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                            transition: "all .15s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,82,82,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {t('loan_reject_btn')}
                    </button>
                </div>
            )}

            {/* ─── INLINE CONFIRMATION BAR ──────────────────────────── */}
            {confirmAction === 'approve' && (
                <div style={{ padding: "0 14px 14px" }}>
                    <ConfirmBar
                        action="approve"
                        label={
                            approbations.length === 0
                                ? t('loan_sign_step1_msg') || `Enregistrer votre signature (1/2) pour ce prêt de ${(l.montant || 0).toLocaleString('fr-FR')} F ?`
                                : t('loan_sign_step2_msg') || `Signature finale (2/2) — décaisser ${(l.montant || 0).toLocaleString('fr-FR')} F vers ${l.membre_name || 'le membre'} ?`
                        }
                        onConfirm={executeApprove}
                        onCancel={() => setConfirmAction(null)}
                    />
                </div>
            )}

            {confirmAction === 'reject' && (
                <div style={{ padding: "0 14px 14px" }}>
                    <ConfirmBar
                        action="reject"
                        label={t('loan_confirm_reject_msg') || `Rejeter définitivement la demande de ${(l.montant || 0).toLocaleString('fr-FR')} F de ${l.membre_name || 'ce membre'} ?`}
                        onConfirm={executeReject}
                        onCancel={() => setConfirmAction(null)}
                    />
                </div>
            )}

            {confirmAction === 'pay' && (
                <div style={{ padding: "0 14px 14px" }}>
                    <ConfirmBar
                        action="pay"
                        label={t('loan_confirm_collect').replace('{amount}', pendingPayAmt?.toLocaleString('fr-FR'))}
                        onConfirm={executePay}
                        onCancel={() => { setConfirmAction(null); setPendingPayId(null); setPendingPayAmt(null); }}
                    />
                </div>
            )}

            {/* ─── REPAYMENT PROGRESS BAR (approved) ───────────────── */}
            {(isApproved || l.status === 'Remboursé') && schedule && schedule.length > 0 && (
                <div style={{ padding: "0 16px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#555", marginBottom: 5 }}>
                        <span>{t('loan_status_repaid')} : <strong style={{ color: "#00C853" }}>{paidAmount.toLocaleString('fr-FR')} F</strong></span>
                        <span><strong style={{ color: "#FFF" }}>{progressPct}%</strong> ({paidInstallments}/{schedule.length})</span>
                    </div>
                    <div style={{ height: 5, background: "#333", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                            width: `${progressPct}%`, height: "100%", borderRadius: 3,
                            background: progressPct === 100 ? "#00C853" : "var(--primary)",
                            transition: "width .5s ease"
                        }} />
                    </div>
                </div>
            )}

            {/* ─── EXPANDED PANEL ──────────────────────────────────── */}
            {expanded && (
                <div style={{ background: "#111", padding: "14px 16px 16px", borderTop: "1px solid #222" }}>

                    {/* Detail summary */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                        <div style={{ background: "#1A1A1A", borderRadius: 12, padding: "10px 12px" }}>
                            <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{t('loan_capital')}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#FFF" }}>{(l.montant || 0).toLocaleString('fr-FR')} F</div>
                        </div>
                        {(isApproved || l.status === 'Remboursé') && (
                            <div style={{ background: "#1A1A1A", borderRadius: 12, padding: "10px 12px" }}>
                                <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{t('loan_total_interests')}</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "#FF7900" }}>{totalAmount.toLocaleString('fr-FR')} F</div>
                            </div>
                        )}
                    </div>

                    {/* Rejected state */}
                    {l.status === 'Rejeté' && (
                        <div style={{
                            background: "rgba(255,82,82,0.06)", border: "1px solid rgba(255,82,82,0.15)",
                            borderRadius: 14, padding: "14px", textAlign: "center"
                        }}>
                            <div style={{ fontSize: 22, marginBottom: 6 }}>❌</div>
                            <div style={{ fontSize: 13, color: "#FF5252", fontWeight: 700 }}>{t('loan_rejected_title')}</div>
                            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{t('loan_rejected_msg')}</div>
                        </div>
                    )}

                    {/* Pending state (member view) */}
                    {isPending && !isGerant && (
                        <div style={{
                            background: "rgba(255,121,0,0.06)", border: "1px solid rgba(255,121,0,0.15)",
                            borderRadius: 14, padding: "14px", textAlign: "center"
                        }}>
                            <div style={{ fontSize: 22, marginBottom: 6 }}>⏳</div>
                            <div style={{ fontSize: 13, color: "#FF7900", fontWeight: 700 }}>{t('loan_pending_title')}</div>
                            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{t('loan_pending_msg').replace('{count}', approbations.length)}</div>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div style={{ fontSize: 12, color: "#666", textAlign: "center", padding: 12 }}>
                            {t('loan_loading_schedule')}
                        </div>
                    )}

                    {/* Repayment schedule */}
                    {!loading && schedule && schedule.length > 0 && (
                        <div>
                            <div style={{ fontSize: 10, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
                                {t('loan_schedule_title')}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {schedule.map((s, idx) => {
                                    const isPaid = s.statut === 'payé';
                                    const dueDate = s.date_versement
                                        ? new Date(s.date_versement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                                        : '—';
                                    const isThisBeingPaid = confirmAction === 'pay' && pendingPayId === s.id;
                                    return (
                                        <div key={s.id} style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            background: isPaid ? "rgba(0,200,83,0.06)" : "#1A1A1A",
                                            border: `1px solid ${isPaid ? 'rgba(0,200,83,0.2)' : isThisBeingPaid ? '#555' : '#2A2A2A'}`,
                                            padding: "10px 14px", borderRadius: 14
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: "50%",
                                                    background: isPaid ? "rgba(0,200,83,0.15)" : "#222",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 11, fontWeight: 700,
                                                    color: isPaid ? "#00C853" : "#555"
                                                }}>
                                                    {isPaid ? "✓" : idx + 1}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: isPaid ? "#00C853" : "#FFF" }}>
                                                        {s.montant_verse.toLocaleString('fr-FR')} F
                                                    </div>
                                                    <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{dueDate}</div>
                                                </div>
                                            </div>
                                            {isPaid ? (
                                                <span style={{ fontSize: 10, color: "#00C853", fontWeight: 700, background: "rgba(0,200,83,0.1)", padding: "3px 10px", borderRadius: 20 }}>
                                                    {t('loan_paid')}
                                                </span>
                                            ) : isGerant ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPendingPayId(s.id);
                                                        setPendingPayAmt(s.montant_verse);
                                                        setConfirmAction('pay');
                                                    }}
                                                    style={{
                                                        background: "#FFF", color: "#000", border: "none",
                                                        padding: "7px 14px", borderRadius: 10,
                                                        fontSize: 11, fontWeight: 700, cursor: "pointer"
                                                    }}
                                                >
                                                    {t('loan_collect_btn')}
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: 10, color: "#FF7900", fontWeight: 700, background: "rgba(255,121,0,0.1)", padding: "3px 10px", borderRadius: 20 }}>
                                                    {t('loan_to_pay')}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Solde restant */}
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, padding: "10px 14px", background: "#1A1A1A", borderRadius: 14 }}>
                                <span style={{ fontSize: 12, color: "#666" }}>{t('loan_balance_due')}</span>
                                <span style={{ fontSize: 13, fontWeight: 800, color: schedule.every(s => s.statut === 'payé') ? "#00C853" : "#FFF" }}>
                                    {schedule.every(s => s.statut === 'payé')
                                        ? "0 F — " + t('loan_status_repaid') + " ✓"
                                        : `${schedule.filter(s => s.statut !== 'payé').reduce((a, s) => a + s.montant_verse, 0).toLocaleString('fr-FR')} F`
                                    }
                                </span>
                            </div>
                        </div>
                    )}

                    {!loading && !schedule && (isApproved) && (
                        <div style={{ textAlign: "center", fontSize: 12, color: "#555", padding: 12 }}>
                            {t('no_schedule_available') || 'Aucun échéancier disponible'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
