import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';


export default function Login() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email:    email.trim().toLowerCase(),
      password,
    });

    if (signInErr) {
      setError('Wrong email or password.');
      setLoading(false);
      return;
    }

    navigate('/');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Job Search <span>Sucks</span></div>
        <h1 className="auth-title">Welcome.</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <input
                className="auth-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="Your password"
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
            {loading ? <><span className="spinner dark" /> Logging in...</> : 'Log In'}
          </button>
        </form>

        <p className="auth-muted" style={{ marginTop: '1.5rem' }}>
          First time here? <Link to="/request-access" className="auth-link">Create account</Link>
        </p>
      </div>
    </div>
  );
}
