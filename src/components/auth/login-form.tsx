'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [debug, setDebug] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebug(null);
    setLoading(true);
    const supabase = createClient();
    setDebug(`Próba logowania: ${email}`);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setDebug(`Błąd: ${err.message} (${err.status})`);
      setError(err.message);
      return;
    }
    setDebug(`Zalogowano jako: ${data.user?.email} | UID: ${data.user?.id}`);
    // nie przekierowuj od razu — pokaż debug przez 3 sekundy
    setTimeout(() => { router.push('/today'); router.refresh(); }, 3000);
  };

  return (
    <div style={{
      width: 360,
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 14, padding: '32px 28px',
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--lo-accent-soft)', border: '1px solid var(--lo-accent-line)',
          display: 'grid', placeItems: 'center', color: 'var(--lo-accent)',
        }}>
          <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 13, fontWeight: 600 }}>L</span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>LifeOS</span>
      </div>

      <div>
        <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em' }}>Zaloguj się</div>
        <div style={{ fontSize: 13, color: 'var(--lo-text-muted)', marginTop: 4 }}>
          Twój osobisty system życia
        </div>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>Email</label>
          <input
            type="email" required autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)}
            style={{
              height: 36, padding: '0 12px',
              background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)',
              borderRadius: 8, color: 'var(--lo-text)', fontSize: 13,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>Hasło</label>
          <input
            type="password" required autoComplete="current-password"
            value={password} onChange={e => setPassword(e.target.value)}
            style={{
              height: 36, padding: '0 12px',
              background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)',
              borderRadius: 8, color: 'var(--lo-text)', fontSize: 13,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>

        {debug && (
          <div style={{ fontSize: 11, color: 'var(--lo-text-muted)', padding: '8px 12px', background: 'var(--lo-surface-2)', borderRadius: 6, fontFamily: 'var(--font-geist-mono)', wordBreak: 'break-all' }}>
            {debug}
          </div>
        )}

        {error && (
          <div style={{ fontSize: 12, color: 'var(--lo-danger)', padding: '8px 12px', background: 'oklch(0.68 0.16 25 / 0.1)', borderRadius: 6 }}>
            {error}
          </div>
        )}

        <button
          type="submit" disabled={loading}
          style={{
            marginTop: 4, height: 36,
            background: 'var(--lo-accent)', color: 'var(--lo-bg)',
            border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 500, cursor: loading ? 'wait' : 'pointer',
            fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
            transition: 'opacity .15s',
          }}
        >
          {loading ? 'Logowanie…' : 'Zaloguj się'}
        </button>
      </form>
    </div>
  );
}
