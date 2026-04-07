// src/pages/GoogleCallback.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Google se login ho raha hai...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const name  = params.get('name');
    const email = params.get('email');

    if (token && name && email) {
      localStorage.setItem('quanment_token', token);
      localStorage.setItem('quanment_name',  name);
      localStorage.setItem('quanment_email', email);
      setStatus('Login successful! Dashboard pe ja rahe hain...');
      setTimeout(() => navigate('/dashboard'), 500);
    } else {
      fetch(`${BASE_URL}/login-success${window.location.search}`, {
        credentials: 'include',
      })
        .then(r => r.json())
        .then(data => {
          if (data.token) {
            localStorage.setItem('quanment_token', data.token);
            localStorage.setItem('quanment_name',  data.name  || '');
            localStorage.setItem('quanment_email', data.email || '');
            setStatus('Login successful!');
            setTimeout(() => navigate('/dashboard'), 500);
          } else {
            setStatus('Login fail ho gaya. Wapas jao.');
            setTimeout(() => navigate('/'), 2000);
          }
        })
        .catch(() => {
          setStatus('Kuch error aaya. Wapas jao.');
          setTimeout(() => navigate('/'), 2000);
        });
    }
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif', background: '#f0f4f8', gap: '16px',
    }}>
      <div style={{
        width: 48, height: 48, border: '4px solid #e0e8f0',
        borderTop: '4px solid #4A6CF7', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#8a9bae', fontSize: '1rem' }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}