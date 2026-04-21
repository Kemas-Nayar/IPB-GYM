import React, { useState } from 'react';
import { supabase } from '../supabase';
import iwhLogo from '../assets/logo_iwh.png';
import '../styles/AuthPage.css';

const LoginPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Mohon isi email dan password');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error) {
      setError('Email atau password salah');
    }
    // Tidak perlu onNavigate di sini karena
    // App.jsx onAuthStateChange yang handle redirect ke home atau biodata
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) {
      setError('Login Google gagal');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logos">
        <img src={iwhLogo} alt="IPB Wellness Hub" className="auth-logo-iwh" />
      </div>

      <div className="auth-body">
        <h1 className="auth-title">Welcome back,</h1>
        <p className="auth-subtitle">
          We happy to see you here again. Please enter your
          email address and password
        </p>

        {error && <p className="auth-error">{error}</p>}

        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          disabled={isLoading}
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          disabled={isLoading}
        />

        <button
          className="btn-yellow-full"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Memproses...' : 'Log In'}
        </button>

        <p className="auth-forgot" onClick={() => onNavigate('forgot')}>
          Forgot Password?
        </p>

        <div className="auth-divider"><span>or</span></div>

        <button
          className="btn-red-full"
          onClick={() => onNavigate('signup')}
          disabled={isLoading}
        >
          Create an Account
        </button>
      </div>
    </div>
  );
};

export default LoginPage;