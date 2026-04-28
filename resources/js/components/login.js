import React, { useState } from "react";
import "../../sass/login.scss";
import { jsonRequestHeaders, messageFromAxiosError } from "../httpHelpers";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    // Forgot Password state
    const [viewMode, setViewMode] = useState("login"); // login, forgot
    const [resetEmail, setResetEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const payload = { email: email.trim(), password, remember };
            const { data } = await window.axios.post("/login", payload, {
                headers: jsonRequestHeaders(),
                withCredentials: true,
            });

            if (typeof data !== "object" || data === null) {
                setError(
                    "The server did not return JSON (often a redirect or cached old JS). Hard-refresh (Ctrl+Shift+R) or clear cookies for this site, then try again."
                );
                return;
            }

            if (data.success) {
                window.location.href = data.redirect || "/";
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError(messageFromAxiosError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleCheckEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const { data } = await window.axios.post("/password/email", { email: resetEmail.trim() }, {
                headers: jsonRequestHeaders(),
                withCredentials: true,
            });
            if (data?.success) {
                setSuccessMsg(data.message || "Password reset email sent.");
                setViewMode("login");
                setEmail(resetEmail.trim());
                setPassword("");
            }
        } catch (err) {
            setError(messageFromAxiosError(err) || "Unable to send reset email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pawtastic-login">
            {/* Left Side: Branding & Image */}
            <div className="login-sidebar">
                <div className="sidebar-image"></div>
                <div className="sidebar-content">
                    <div className="brand">
                        <img src="/petlogo.png" alt="Petverse Logo" className="brand-icon" /> Petverse
                    </div>
                    <h1 className="quote">"Every Paw Has a Story"</h1>
                    <p className="description">
                        Capture memories, connect with others, <br />
                        and give your pet the spotlight they deserve.
                    </p>
                </div>
            </div>

            {/* Right Side: Dynamic Form Container */}
            <div className="login-form-container">
                <div className="form-box">
                    {successMsg && <div className="success-msg" style={{color: '#28a745', background: '#d4edda', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>{successMsg}</div>}
                    
                    {viewMode === "login" && (
                        <>
                            <h2 className="welcome-text">Welcome Back!</h2>
                            <form onSubmit={handleSubmit} className="actual-form">
                                {error && <div className="error-msg">{error}</div>}
                                
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>

                                <div className="input-group">
                                    <label>Password</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', margin: '0 0 16px 0', flexWrap: 'wrap' }}>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '14px' }}>
                                        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                                        Remember Me
                                    </label>
                                    <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); setViewMode("forgot"); setError(""); setSuccessMsg(""); }}>Forgot Password?</a>
                                </div>

                                <button type="submit" className="login-btn" disabled={loading}>
                                    {loading ? "Logging in..." : "Log in"}
                                </button>
                            </form>
                            <p className="signup-text">
                                New to Petverse? <a href="/register">Create an account</a>
                            </p>
                        </>
                    )}

                    {viewMode === "forgot" && (
                        <>
                            <h2 className="welcome-text">Find Your Account</h2>
                            <p style={{marginBottom: '20px', color: '#666'}}>Enter the email address associated with your account to reset your password.</p>
                            <form onSubmit={handleCheckEmail} className="actual-form">
                                {error && <div className="error-msg">{error}</div>}
                                {successMsg && <div className="success-msg" style={{color: '#28a745', background: '#d4edda', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>{successMsg}</div>}
                                
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required autoFocus />
                                </div>

                                <button type="submit" className="login-btn" disabled={loading}>
                                    {loading ? "Checking..." : "Search"}
                                </button>
                                <button type="button" className="login-btn" style={{background: 'transparent', border: '1px solid #ccc', color: '#555', marginTop: '10px'}} onClick={() => { setViewMode("login"); setError(""); }} disabled={loading}>
                                    Cancel
                                </button>
                            </form>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Login;