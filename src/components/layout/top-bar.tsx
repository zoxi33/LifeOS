'use client';

import dynamic from 'next/dynamic';
import { Icon } from '@/components/primitives/icon';
import type { SidebarXP } from '@/app/(shell)/actions';

const PushButton = dynamic(
  () => import('@/components/pwa/push-button').then(m => ({ default: m.PushButton })),
  { ssr: false }
);

interface TopBarProps {
  onCmd: () => void;
  onTweaks: () => void;
  xp: SidebarXP;
}

export function TopBar({ onCmd, onTweaks, xp }: TopBarProps) {
  const pct = Math.min(100, Math.round((xp.xpInLevel / xp.xpNeeded) * 100));

  return (
    <header
      style={{
        borderBottom: '1px solid var(--lo-border)',
        background: 'var(--lo-bg)',
        flexShrink: 0,
      }}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px' }}>

        {/* Mobile: app logo (hidden on desktop) */}
        <div className="lo-mobile-only" style={{ display: 'none', alignItems: 'center', gap: 8, marginRight: 4 }}>
          <div
            style={{
              width: 24, height: 24, borderRadius: 7,
              background: 'var(--lo-accent-soft)',
              border: '1px solid var(--lo-accent-line)',
              display: 'grid', placeItems: 'center',
              color: 'var(--lo-accent)',
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '-.02em' }}>L</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>LifeOS</span>
        </div>

        {/* Desktop: greeting (hidden on mobile) */}
        <div className="lo-desktop-only" style={{ minWidth: 0, overflow: 'hidden' }}>
          <div className="label-eyebrow" style={{ whiteSpace: 'nowrap' }}>Niedziela · 3 maja 2026</div>
          <div style={{
            fontSize: 18, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            Dzień dobry, Michał
          </div>
        </div>

        {/* Desktop: search bar */}
        <button
          onClick={onCmd}
          className="lo-topbar-search"
          style={{
            marginLeft: 'auto',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 32, padding: '0 12px',
            width: 280, justifyContent: 'flex-start',
            background: 'var(--lo-surface-2)',
            color: 'var(--lo-text-faint)',
            border: '1px solid var(--lo-border)',
            borderRadius: 8,
            fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
            transition: 'background .12s ease, border-color .12s ease',
            fontFamily: 'inherit',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.27 0.005 240)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--lo-border-strong)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--lo-surface-2)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--lo-border)';
          }}
        >
          <Icon name="search" size={14} />
          <span style={{ fontSize: 12 }}>Szukaj, uruchom akcję…</span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>

        {/* Mobile: search icon + spacer */}
        <button
          className="lo-mobile-only"
          onClick={onCmd}
          aria-label="Szukaj"
          style={{
            display: 'none',
            marginLeft: 'auto',
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--lo-surface-2)',
            color: 'var(--lo-text-muted)',
            border: '1px solid var(--lo-border)',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Icon name="search" size={15} />
        </button>

        <PushButton />

        <button
          aria-label="Ustawienia"
          onClick={onTweaks}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, flexShrink: 0,
            background: 'var(--lo-surface-2)',
            color: 'var(--lo-text)',
            border: '1px solid var(--lo-border)',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'background .12s ease',
          }}
        >
          <Icon name="settings" size={15} />
        </button>
      </div>

      {/* Mobile-only XP bar */}
      <div className="lo-mobile-only lo-topbar-xp" style={{ display: 'none', padding: '0 20px 12px', gap: 6, flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-geist-mono)', fontSize: 9,
            color: 'var(--lo-text-dim)', letterSpacing: '.04em', textTransform: 'uppercase',
          }}>
            Lvl {xp.level} · do {xp.level + 1}
          </span>
          <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 9, color: 'var(--lo-text-dim)' }}>
            {xp.xpInLevel}/{xp.xpNeeded} XP
          </span>
        </div>
        <div style={{ height: 3, borderRadius: 99, background: 'var(--lo-surface-2)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 99,
            background: 'var(--lo-accent)', transition: 'width .4s ease',
          }} />
        </div>
      </div>
    </header>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-geist-mono)',
        fontSize: 11, padding: '2px 6px',
        border: '1px solid var(--lo-border)', borderBottomWidth: 2,
        borderRadius: 4, color: 'var(--lo-text-muted)', background: 'var(--lo-bg-2)',
      }}
    >
      {children}
    </span>
  );
}
