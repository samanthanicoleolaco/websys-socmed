import React, { useEffect, useMemo, useState } from 'react';
import '../../sass/login.scss';
import { jsonRequestHeaders, messageFromAxiosError } from '../httpHelpers';
import { useUser } from '../context/UserContext';

const EmailVerify = () => {
    const { user } = useUser();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fallbackEmail = window.__PETVERSE__?.pendingVerificationEmail || '';
    const email = user?.email || fallbackEmail;

    useEffect(() => {
        if (error) {
            setSuccessMsg('');
        }
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await window.axios.post('/email/verify', {
                verification_code: code.trim(),
            }, {
                headers: jsonRequestHeaders(),
                withCredentials: true,
            });

            if (data?.success) {
                window.location.href = data.redirect || '/pet-info';
                return;
            }

            setError(data?.message || 'Verification failed.');
        } catch (err) {
            setError(messageFromAxiosError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            const { data } = await window.axios.post('/email/resend', {}, {
                headers: jsonRequestHeaders(),
                withCredentials: true,
            });
            setSuccessMsg(data?.message || 'A new verification email was sent.');
        } catch (err) {
            setError(messageFromAxiosError(err));
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="pawtastic-login">
            <div className="login-sidebar">
                <div className="sidebar-image"></div>
                <div className="sidebar-content">
                    <div className="brand">
                        <img src="/petlogo.png" alt="Petverse Logo" className="brand-icon" /> Petverse
                    </div>
                    <h1 className="quote">"Every Paw Has a Story"</h1>
                    <p className="description">
                        We sent a 6-digit verification code to your email.
                        <br />
                        Enter it here to finish setup.
                    </p>
                </div>
            </div>

            <div className="login-form-container">
                <div className="form-box">
                    <h2 className="welcome-text">Verify Your Email</h2>
                    <p style={{ marginBottom: '20px', color: '#666' }}>
                        Code sent to <strong>{email || 'your email address'}</strong>
                    </p>

                    {successMsg && <div className="success-msg" style={{ color: '#28a745', background: '#d4edda', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{successMsg}</div>}
                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit} className="actual-form">
                        <div className="input-group">
                            <label>Verification Code</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength="6"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                required
                                autoFocus
                            />
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Account'}
                        </button>

                        <button
                            type="button"
                            className="login-btn"
                            style={{ background: 'transparent', border: '1px solid #ccc', color: '#555', marginTop: '10px' }}
                            onClick={handleResend}
                            disabled={resendLoading}
                        >
                            {resendLoading ? 'Resending...' : 'Resend Code'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmailVerify;
