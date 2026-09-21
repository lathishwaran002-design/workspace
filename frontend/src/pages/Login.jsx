import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload  = isLogin ? { email, password } : { email, password, username };

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
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
              className="btn-accent w-full py-3.5 text-sm flex items-center justify-center gap-2">
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
          </form>

          <div className="px-6 pb-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            By continuing you agree to our Terms of Service
          </div>
        </div>
      </div>
    </div>
  );
}
