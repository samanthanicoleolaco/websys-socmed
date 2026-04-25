import React, { useState } from "react";
import "../../sass/login.scss";
import { jsonRequestHeaders, messageFromAxiosError } from "../httpHelpers";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    // Forgot Password states
    const [viewMode, setViewMode] = useState("login"); // login, forgot, reset
    const [resetEmail, setResetEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const payload = { email: email.trim(), password };
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
                window.location.href = data.redirect || "/dashboard";
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
            const { data } = await window.axios.post("/api/password/check-email", { email: resetEmail.trim() }, {
                headers: { Accept: "application/json" },
            });
            if (data?.success) {
                setViewMode("reset");
            }
        } catch (err) {
            setError(messageFromAxiosError(err) || "Email not found.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const { data } = await window.axios.post("/api/password/reset", {
                email: resetEmail.trim(),
                password: newPassword,
            }, {
                headers: { Accept: "application/json" },
            });
            if (data?.success) {
                setSuccessMsg("Password successfully reset! You may now log in.");
                setViewMode("login");
                setEmail(resetEmail);
                setPassword("");
            }
        } catch (err) {
            setError(messageFromAxiosError(err) || "Reset failed.");
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

                    {viewMode === "reset" && (
                        <>
                            <h2 className="welcome-text">Reset Password</h2>
                            <p style={{marginBottom: '20px', color: '#666'}}>Create a new password for {resetEmail}.</p>
                            <form onSubmit={handleResetPassword} className="actual-form">
                                {error && <div className="error-msg">{error}</div>}
                                
                                <div className="input-group">
                                    <label>New Password</label>
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength="8" autoFocus />
                                </div>

                                <div className="input-group">
                                    <label>Confirm Password</label>
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength="8" />
                                </div>

                                <button type="submit" className="login-btn" disabled={loading}>
                                    {loading ? "Updating..." : "Update Password"}
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