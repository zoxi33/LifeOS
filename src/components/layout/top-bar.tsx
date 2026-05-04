'use client';

import { Icon } from '@/components/primitives/icon';

interface TopBarProps {
  onCmd: () => void;
  onTweaks: () => void;
}

export function TopBar({ onCmd, onTweaks }: TopBarProps) {
  return (
    <header
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 24px',
        borderBottom: '1px solid var(--lo-border)',
        background: 'var(--lo-bg)',
        flexShrink: 0,
      }}
    >
      <div>
        <div className="label-eyebrow">Niedziela · 3 maja 2026</div>
        <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 2 }}>
          Dzień dobry, Michał
        </div>
      </div>

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

      <button
        aria-label="Ustawienia"
        onClick={onTweaks}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32,
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
