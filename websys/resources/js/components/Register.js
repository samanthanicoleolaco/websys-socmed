import React, { useState } from "react";
import "../../sass/login.scss";
import { jsonRequestHeaders, messageFromAxiosError } from "../httpHelpers";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const payload = {
                name: name.trim(),
                email: email.trim(),
                password,
                password_confirmation: passwordConfirmation,
            };

            const { data } = await window.axios.post("/register", payload, {
                headers: jsonRequestHeaders(),
                withCredentials: true,
            });

            if (data?.success) {
                window.location.href = data.redirect || "/dashboard";
            } else {
                setError(data?.message || "Registration failed");
            }
        } catch (err) {
            setError(messageFromAxiosError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pawtastic-login">
            {/* Left Side: Branding & Image */}
            <div className="login-sidebar" style={{ backgroundImage: 'url(/images/register-bg.jpg)' }}>
                <div className="sidebar-image"></div>
                <div className="sidebar-content">
                    <div className="brand">
                        <img src="/pet-logo.png" alt="Pawtastic Logo" className="brand-icon" /> Pawtastic
                    </div>
                    <h1 className="quote">"Join our Pawtastic family!"</h1>
                    <p className="description">
                        Create an account to start sharing your pet's <br />
                        beautiful journey with our community.
                    </p>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="login-form-container">
                <div className="form-box" style={{ marginTop: '20px' }}>
                    <h2 className="welcome-text">Create an Account</h2>
                    <p style={{ color: '#888', marginBottom: '25px', fontSize: '14px' }}>Sign up to be part of the largest pet network.</p>
                    
                    <form onSubmit={handleSubmit} className="actual-form">
                        {error && <div className="error-msg">{error}</div>}
                        
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: '10px' }}>
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>
                    </form>

                    <p className="signup-text">
                        Already have an account? <a href="/login">Log in here</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
