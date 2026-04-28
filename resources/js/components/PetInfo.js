import React, { useEffect, useMemo, useState } from 'react';
import '../../sass/login.scss';
import { jsonRequestHeaders, messageFromAxiosError } from '../httpHelpers';
import { useUser } from '../context/UserContext';

const PetInfo = () => {
    const { user } = useUser();
    const [form, setForm] = useState({
        petName: '',
        username: '',
        age: '',
        gender: 'male',
        birthday: '',
        species: '',
        breed: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const baseName = user?.email ? user.email.split('@')[0] : '';
        setForm((prev) => ({
            ...prev,
            username: prev.username || baseName,
        }));
    }, [user]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await window.axios.post('/api/pet-info', {
                ...form,
                age: Number(form.age),
                birthday: form.birthday || null,
            }, {
                headers: jsonRequestHeaders(),
                withCredentials: true,
            });

            if (data?.user) {
                window.location.href = '/homefeed';
                return;
            }

            setError(data?.message || 'Unable to save pet info.');
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
                    <h1 className="quote">"Tell us about your pet"</h1>
                    <p className="description">
                        Add your pet details and claim a unique username before exploring the home feed.
                    </p>
                </div>
            </div>

            <div className="login-form-container">
                <div className="form-box">
                    <h2 className="welcome-text">Pet Info</h2>
                    <p style={{ marginBottom: '20px', color: '#666' }}>Fill out your pet profile to continue.</p>

                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit} className="actual-form">
                        <div className="input-group">
                            <label>Pet Name</label>
                            <input value={form.petName} onChange={(e) => handleChange('petName', e.target.value)} required maxLength={255} />
                        </div>

                        <div className="input-group">
                            <label>Username</label>
                            <input value={form.username} onChange={(e) => handleChange('username', e.target.value)} required maxLength={32} pattern="[A-Za-z0-9_]+" />
                        </div>

                        <div className="input-group">
                            <label>Age</label>
                            <input type="number" min="0" max="50" value={form.age} onChange={(e) => handleChange('age', e.target.value)} required />
                        </div>

                        <div className="input-group">
                            <label>Gender</label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {[
                                    { value: 'male', label: 'Male' },
                                    { value: 'female', label: 'Female' },
                                    { value: 'other', label: 'Other' },
                                ].map((option) => (
                                    <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={option.value}
                                            checked={form.gender === option.value}
                                            onChange={() => handleChange('gender', option.value)}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Birthday</label>
                            <input type="date" value={form.birthday} onChange={(e) => handleChange('birthday', e.target.value)} />
                        </div>

                        <div className="input-group">
                            <label>Species</label>
                            <input value={form.species} onChange={(e) => handleChange('species', e.target.value)} required maxLength={64} />
                        </div>

                        <div className="input-group">
                            <label>Breed</label>
                            <input value={form.breed} onChange={(e) => handleChange('breed', e.target.value)} required maxLength={255} />
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Continue'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PetInfo;
