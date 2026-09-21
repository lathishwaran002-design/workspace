import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const response = await fetch(`/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
          photo_url: user.photoURL,
          id_token: await user.getIdToken()
        }),
      });

      if (response.ok) {
        navigate('/home');
      } else {
        const error = await response.json();
        alert(error.detail || 'An error occurred during Google Sign In');
      }
    } catch (error) {
      console.error(error);
      alert('Google Sign In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload  = isLogin ? { email, password } : { email, password, username };

    try {
      const response = await fetch(`${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (!isLogin) {
          setIsLogin(true);
        } else {
          navigate('/home');
        }
      } else {
        const error = await response.json();
        alert(error.detail || 'An error occurred');
      }
    } catch {
      alert('Could not connect to server. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="fade-up w-full max-w-md relative z-10">
        {/* Logo card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glow-orange"
               style={{ background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)' }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            PredictiveEats
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Food ready exactly when you arrive — powered by AI
          </p>
        </div>

        {/* Form card */}
        <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {/* Tab switcher */}
          <div className="grid grid-cols-2" style={{ borderBottom: '1px solid var(--border)' }}>
            {['Sign In', 'Sign Up'].map((label, i) => {
              const active = isLogin === (i === 0);
              return (
                <button key={label} onClick={() => setIsLogin(i === 0)}
                  className="py-3.5 text-sm font-bold transition-all"
                  style={{
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    background: active ? 'var(--accent-deep)' : 'transparent',
                    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                  }}>
                  {label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {isLogin ? 'Welcome back 👋' : 'Create your account'}
            </h2>

            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input id="username" type="text" placeholder="Username" value={username} required
                  onChange={e => setUsername(e.target.value)}
                  className="input-dark w-full pl-10 pr-4 py-3 text-sm" />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input id="email" type="email" placeholder="Email address" value={email} required
                onChange={e => setEmail(e.target.value)}
                className="input-dark w-full pl-10 pr-4 py-3 text-sm" />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input id="password" type="password" placeholder="Password" value={password} required
                onChange={e => setPassword(e.target.value)}
                className="input-dark w-full pl-10 pr-4 py-3 text-sm" />
            </div>

            <button id="submit-btn" type="submit" disabled={loading}
              className="btn-accent w-full py-3.5 text-sm flex items-center justify-center gap-2 mb-4">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/10 w-full"></div>
              <span className="px-4 text-xs z-10 rounded-full" style={{ position: 'absolute', background: 'var(--bg)', color: 'var(--text-muted)' }}>OR</span>
            </div>

            <button type="button" onClick={handleGoogleSignIn} disabled={loading}
              className="w-full py-3.5 text-sm flex items-center justify-center gap-2 rounded-xl transition-all font-bold"
              style={{ background: 'white', color: '#000', border: '1px solid #e5e7eb' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.7 17.57V20.34H19.27C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.27 20.34L15.7 17.57C14.72 18.23 13.46 18.63 12 18.63C9.17 18.63 6.78 16.72 5.92 14.18H2.23V17.03C4.03 20.61 7.72 23 12 23Z" fill="#34A853"/>
                <path d="M5.92 14.18C5.7 13.52 5.57 12.78 5.57 12C5.57 11.22 5.7 10.48 5.92 9.82V6.97H2.23C1.49 8.44 1.06 10.15 1.06 12C1.06 13.85 1.49 15.56 2.23 17.03L5.92 14.18Z" fill="#FBBC05"/>
                <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.34 3.88C17.45 2.12 14.97 1.06 12 1.06C7.72 1.06 4.03 3.39 2.23 6.97L5.92 9.82C6.78 7.28 9.17 5.38 12 5.38Z" fill="#EA4335"/>
              </svg>
              Sign In with Google
            </button>
          </form>

          <div className="px-6 pb-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            By continuing you agree to our Terms of Service
          </div>
        </div>
      </div>
    </div>
  );
}
