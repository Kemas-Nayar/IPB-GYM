import React, { useState } from 'react';
import { supabase } from '../supabase';
import iwhLogo from '../assets/logo_iwh.png';
import '../styles/AuthPage.css';

const SignupPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirm) {
      setError('Mohon isi semua field');
      return;
    }
    if (password !== confirm) {
      setError('Password tidak sama');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setIsLoading(false);

    if (error) {
      setError('Email sudah terdaftar atau tidak valid');
    } else {
      // App.jsx onAuthStateChange akan otomatis redirect ke biodata
      onNavigate('biodata');
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin, // redirect balik ke app setelah login Google
      }
    });
    if (error) {
      setError('Login Google gagal');
      setIsLoading(false);
    }
    // Tidak perlu onNavigate di sini karena
    // setelah redirect balik, App.jsx yang handle lewat onAuthStateChange
  };

  return (
    <div className="auth-page">
      <div className="auth-logos">
        <img src={iwhLogo} alt="IPB Wellness Hub" className="auth-logo-iwh" />
      </div>

      <div className="auth-body">
        <h1 className="auth-title">Create an Account</h1>
        <p className="auth-subtitle">
          Create your account. It take less than a minute.
          Enter your email address and password
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
        <input
          className="auth-input"
          type="password"
          placeholder="Confirmation Password"
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setError(''); }}
          disabled={isLoading}
        />

        <button
          className="btn-yellow-full"
          onClick={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? 'Memproses...' : 'Create an Account'}
        </button>

        <div className="auth-divider"><span>or</span></div>

        <button
          className="btn-google"
          onClick={handleGoogle}
          disabled={isLoading}
        >
          <div className="google-icon">G</div>
          Continue with Google
        </button>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <span className="auth-link" onClick={() => onNavigate('login')}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;