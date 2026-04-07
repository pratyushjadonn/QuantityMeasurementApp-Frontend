// src/pages/Signup.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function checkStrength(pw) {
  let score = 0;
  if (pw.length >= 6)            score++;
  if (pw.length >= 10)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  return score;
}

const LEVELS = [
  { pct: '0%',   color: '',        label: '' },
  { pct: '20%',  color: '#ff5c5c', label: 'Weak' },
  { pct: '40%',  color: '#ffa94d', label: 'Fair' },
  { pct: '65%',  color: '#f0c330', label: 'Good' },
  { pct: '85%',  color: '#69db7c', label: 'Strong' },
  { pct: '100%', color: '#2bbfa0', label: 'Very Strong' },
];

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [agreed,    setAgreed]    = useState(false);
  const [showPw,    setShowPw]    = useState(false);
  const [showCf,    setShowCf]    = useState(false);
  const [alert,     setAlert]     = useState({ msg: '', type: '' });
  const [loading,   setLoading]   = useState(false);

  const strength = checkStrength(password);
  const level    = LEVELS[Math.min(strength, 5)];
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSignup = async () => {
    setAlert({ msg: '', type: '' });
    if (!firstName || !lastName || !email || !password || !confirm) {
      setAlert({ msg: 'Please fill in all fields.', type: 'error' }); return;
    }
    if (!isValidEmail(email)) {
      setAlert({ msg: 'Please enter a valid email address.', type: 'error' }); return;
    }
    if (password.length < 6) {
      setAlert({ msg: 'Password must be at least 6 characters.', type: 'error' }); return;
    }
    if (password !== confirm) {
      setAlert({ msg: 'Passwords do not match.', type: 'error' }); return;
    }
    if (!agreed) {
      setAlert({ msg: 'Please agree to the Terms & Conditions.', type: 'error' }); return;
    }

    setLoading(true);
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`;
      await register(name, email, password);
      setAlert({ msg: 'Account created! Redirecting…', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      setAlert({ msg: err.message || 'Registration failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSignup(); };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="brand">
          <div className="brand-icon">Q</div>
          <span className="brand-name">Quanment</span>
        </div>
        <h1 className="tagline">Start converting<br /><span className="accent">instantly.</span></h1>
        <p className="sub">Create a free account and access all measurement tools in seconds.</p>
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
          <h2 className="card-title">Create account</h2>
          <p className="card-sub">Join Quanment for free</p>

          {alert.msg && <div className={`alert ${alert.type}`}>{alert.msg}</div>}

          <div className="field-row">
            <div className="field-group">
              <label className="field-label">First Name</label>
              <input className="field-input" type="text" placeholder="John"
                value={firstName} onChange={(e) => setFirstName(e.target.value)} onKeyDown={handleKeyDown} />
            </div>
            <div className="field-group">
              <label className="field-label">Last Name</label>
              <input className="field-input" type="text" placeholder="Doe"
                value={lastName} onChange={(e) => setLastName(e.target.value)} onKeyDown={handleKeyDown} />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Email</label>
            <input className="field-input" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="password-wrap">
              <input className="field-input" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
              <button className="toggle-pw" type="button" onClick={() => setShowPw(!showPw)}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            {password && (
              <>
                <div className="strength-bar">
                  <div className="strength-fill" style={{ width: level.pct, background: level.color }} />
                </div>
                <div className="strength-text" style={{ color: level.color }}>{level.label}</div>
              </>
            )}
          </div>

          <div className="field-group">
            <label className="field-label">Confirm Password</label>
            <div className="password-wrap">
              <input className="field-input" type={showCf ? 'text' : 'password'} placeholder="Repeat password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={handleKeyDown} />
              <button className="toggle-pw" type="button" onClick={() => setShowCf(!showCf)}>
                {showCf ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="terms-row">
            <label className="checkbox-label">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              I agree to the <a href="#!">Terms &amp; Conditions</a>
            </label>
          </div>

          <button className="auth-btn" onClick={handleSignup} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <div className="divider"><span>or</span></div>

          <a className="google-btn" href="http://localhost:8080/oauth2/authorization/google">
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <p className="switch-text">
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}