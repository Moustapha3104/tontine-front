import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage({ onRegister, onBack }) {
    const { login } = useAuth();
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <style>{`
                .login-page-wrapper {
                    font-family: "DM Sans", sans-serif;
                    background: var(--black);
                    color: var(--white);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    position: relative;
                }
                .login-page-wrapper::after {
                    content: "";
                    position: absolute; top: 0; left: 0; right: 0; height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                }
                .login-card {
                    width: 100%;
                    max-width: 400px;
                    animation: fadeIn 0.6s ease;
                }
                .l-head { text-align: center; margin-bottom: 40px; }
                .l-logo {
                    width: 120px; height: auto;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 20px;
                }
                .l-title { font-family: "Playfair Display", serif; font-size: 32px; font-weight: 700; margin-bottom: 8px; }
                .l-sub { color: var(--grey); font-size: 14px; }
                
                .back-link {
                    position: absolute; top: 32px; left: 32px;
                    color: var(--grey); font-size: 13px; font-weight: 700;
                    cursor: pointer; display: flex; align-items: center; gap: 8px;
                    transition: color 0.2s;
                }
                .back-link:hover { color: var(--white); }
            `}</style>

            <div className="back-link" onClick={onBack}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                {t('back')}
            </div>

            <div className="login-card">
                <div className="l-head">
                    <div className="l-logo">
                        <img src="/nattat.jpeg" alt="Nataal Tontine" style={{ width: '100%', height: 'auto' }} />
                    </div>
                    <h1 className="l-title">{t('login_title')}</h1>
                    <p className="l-sub">{t('login_subtitle')}</p>
                </div>

                <div className="card" style={{ padding: '32px 24px' }}>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="error-box" style={{ background: 'rgba(255,82,82,0.1)', color: 'var(--danger)', padding: 12, borderRadius: 12, fontSize: 13, marginBottom: 20, textAlign: 'center', border: '1px solid rgba(255,82,82,0.2)' }}>
                                {error}
                            </div>
                        )}

                        <div className="ff">
                            <label className="fl2" htmlFor="login-email">{t('login_email_label')}</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder={t('email_placeholder')}
                                className="fi3"
                                aria-label={t('login_email_label')}
                            />
                        </div>

                        <div className="ff" style={{ marginTop: 20 }}>
                            <label className="fl2" htmlFor="login-password">{t('login_pass_label')}</label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="fi3"
                                aria-label={t('login_pass_label')}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-w"
                            style={{ width: '100%', marginTop: 24, background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary-dark)' }}
                        >
                            {loading ? t('login_loading') : t('login_btn')}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--grey)' }}>
                        {t('login_no_account')}{' '}
                        <span onClick={onRegister} style={{ color: 'var(--white)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                            {t('login_create_account')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
