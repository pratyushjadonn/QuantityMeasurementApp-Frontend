// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [alert, setAlert]       = useState({ msg: '', type: '' });
  const [loading, setLoading]   = useState(false);

  const showAlert = (msg, type) => setAlert({ msg, type });
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin = async () => {
    setAlert({ msg: '', type: '' });
    if (!email || !password) { showAlert('Please fill in all fields.', 'error'); return; }
    if (!isValidEmail(email)) { showAlert('Please enter a valid email address.', 'error'); return; }
    if (password.length < 6)  { showAlert('Password must be at least 6 characters.', 'error'); return; }

    setLoading(true);
    try {
      await login(email, password);
      showAlert('Login successful! Redirecting...', 'success');
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      showAlert(err.message || 'Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="brand">
          <div className="brand-icon">Q</div>
          <span className="brand-name">Quanment</span>
        </div>
        <h1 className="tagline">Measure everything<br /><span className="accent">effortlessly.</span></h1>
        <p className="sub">Convert, add, subtract, multiply and divide across length, volume and more — all in one place.</p>
        <div className="features">
          <div className="feature-pill">📏 Length</div>
          <div className="feature-pill">🌡️ Temperature</div>
          <div className="feature-pill">🧪 Volume</div>
          <div className="feature-pill">⚖️ Weight</div>
          <div className="feature-pill">➕ Arithmetic</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="card-title">Welcome back</h2>
          <p className="card-sub">Sign in to your account</p>

          {alert.msg && <div className={`alert ${alert.type}`}>{alert.msg}</div>}

          <div className="field-group">
            <label className="field-label">Email</label>
            <input className="field-input" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="password-wrap">
              <input className="field-input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
              <button className="toggle-pw" onClick={() => setShowPw(!showPw)} type="button">
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="remember-row">
            <label className="checkbox-label">
              <input type="checkbox" /> Remember me
            </label>
            <a className="forgot-link" href="#!">Forgot password?</a>
          </div>

          <button className="auth-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="divider"><span>or</span></div>

          <a className="google-btn" href={`${process.env.REACT_APP_AUTH_URL || 'http://localhost:8081'}/oauth2/authorization/google`}>
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <p className="switch-text">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}