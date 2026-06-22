import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const INVITE_CODE = import.meta.env.VITE_INVITE_CODE;

export default function RequestAccess() {
  const navigate = useNavigate();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== INVITE_CODE) {
      setError('Incorrect password. Contact Soumya to get access.');
      return;
    }

    setLoading(true);

    // Create user via Flask (admin API = auto-confirmed, no email verification)
    try {
      await api.post('/auth/signup', {
        email:    email.trim().toLowerCase(),
        password,
        name:     name.trim(),
      });
    } catch (err) {
      const msg = err.response?.data?.error || '';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) {
        // Account exists — just try signing in directly
      } else {
        setError(msg || 'Signup failed. Try again.');
        setLoading(false);
        return;
      }
    }

    // Now sign in
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email:    email.trim().toLowerCase(),
      password,
    });

    if (signInErr) {
      setError('Account created. Please log in.');
      setLoading(false);
      navigate('/login');
      return;
    }

    navigate('/onboarding');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Job Search <span>Sucks</span></div>
        <h1 className="auth-title">Enter your name and email for first time login.</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <input
              className="auth-input"
              type="text"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <input
                className="auth-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter the password Soumya gave you"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="auth-show-pwd" onClick={() => setShowPwd(s => !s)}>
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <><span className="spinner dark" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-muted" style={{ marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login" className="auth-link">Log in</Link>
        </p>
      </div>
    </div>
  );
}
