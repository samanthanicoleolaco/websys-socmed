import React, { useMemo, useState } from 'react';
import '../../sass/login.scss';
import { jsonRequestHeaders, messageFromAxiosError } from '../httpHelpers';

const ResetPassword = () => {
    const params = useMemo(() => new URLSearchParams(window.location.search), []);
    const [email, setEmail] = useState(params.get('email') || '');
    const [token, setToken] = useState(params.get('token') || '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const { data } = await window.axios.post('/password/reset', {
                token,
                email: email.trim(),
                password,
                password_confirmation: passwordConfirmation,
            }, {
                headers: jsonRequestHeaders(),
                withCredentials: true,
            });

            if (data?.success) {
                setSuccessMsg('Password updated successfully. You can log in now.');
                window.location.href = '/login';
                return;
            }

            setError(data?.message || 'Unable to reset password.');
        } catch (err) {
            setError(messageFromAxiosError(err));
        } finally {
            setLoading(false);
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
                    <h1 className="quote">"Choose a new password"</h1>
                    <p className="description">
                        Use the secure link from your email to set a fresh password for your account.
                    </p>
                </div>
            </div>

            <div className="login-form-container">
                <div className="form-box">
                    <h2 className="welcome-text">Reset Password</h2>
                    <p style={{ marginBottom: '20px', color: '#666' }}>Enter your new password below.</p>

                    {successMsg && <div className="success-msg" style={{ color: '#28a745', background: '#d4edda', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{successMsg}</div>}
                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit} className="actual-form">
                        <div className="input-group">
                            <label>Email Address</label>
                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
                        </div>

                        <div className="input-group">
                            <label>Reset Token</label>
                            <input value={token} onChange={(e) => setToken(e.target.value)} required />
                        </div>

                        <div className="input-group">
                            <label>New Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required minLength={8} />
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
