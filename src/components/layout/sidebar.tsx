'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Icon } from '@/components/primitives/icon';
import { signOut } from '@/app/(shell)/actions';

interface NavItem {
  href: string;
  icon: string;
  label: string;
  kbd?: string;
}

const primaryItems: NavItem[] = [
  { href: '/today',   icon: 'home',   label: 'Dziś',       kbd: '1' },
  { href: '/daily',   icon: 'grid',   label: 'Przegląd',   kbd: '2' },
  { href: '/habits',  icon: 'list',   label: 'Nawyki',     kbd: '3' },
  { href: '/journal', icon: 'book',   label: 'Dziennik',   kbd: '4' },
  { href: '/stats',   icon: 'chart',  label: 'Statystyki', kbd: '5' },
];

const subItems: NavItem[] = [
  { href: '/streaks',      icon: 'flame',   label: 'Streaki' },
  { href: '/water',        icon: 'droplet', label: 'Woda' },
  { href: '/goals',        icon: 'goal',    label: 'Cele' },
  { href: '/finance',      icon: 'wallet',  label: 'Finanse' },
  { href: '/sleep',        icon: 'moon',    label: 'Sen' },
  { href: '/weight',       icon: 'weight',  label: 'Waga' },
  { href: '/achievements', icon: 'trophy',  label: 'Osiągnięcia' },
];

function SidebarItem({ item, primary = false }: { item: NavItem; primary?: boolean }) {
  const pathname = usePathname();
  const [hover, setHover] = useState(false);
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

  const bg = isActive ? 'var(--lo-surface-2)' : hover ? 'var(--lo-bg-2)' : 'transparent';
  const color = isActive || hover ? 'var(--lo-text)' : 'var(--lo-text-muted)';

  return (
    <Link
      href={item.href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 10px',
        height: primary ? 32 : 30,
        background: bg,
        borderRadius: 8,
        color,
        fontSize: 13,
        fontWeight: primary ? 450 : 400,
        textDecoration: 'none',
        transition: 'color .12s ease',
        flexShrink: 0,
      }}
    >
      <Icon name={item.icon} size={primary ? 15 : 14} />
      <span>{item.label}</span>
      {item.kbd && (
        <span
          className="mono"
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-geist-mono)',
            fontSize: 11,
            padding: '2px 6px',
            border: '1px solid var(--lo-border)',
            borderBottomWidth: 2,
            borderRadius: 4,
            color: 'var(--lo-text-muted)',
            background: 'var(--lo-bg-2)',
            opacity: 0.7,
          }}
        >
          {item.kbd}
        </span>
      )}
    </Link>
  );
}

function UserFooter() {
  const [pending, start] = useTransition();
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{
        marginTop: 'auto',
        padding: '12px 8px 4px',
        borderTop: '1px solid var(--lo-border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
    >
      <div
        style={{
          width: 26, height: 26, borderRadius: 999,
          background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
          display: 'grid', placeItems: 'center',
          fontSize: 11, color: 'var(--lo-text-muted)', fontWeight: 500,
        }}
      >M</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, lineHeight: 1.2 }}>
        <span style={{ fontSize: 12 }}>Michał</span>
        <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: 'var(--lo-text-dim)' }}>
          Level 12 · 4,820 XP
        </span>
      </div>
      <button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        disabled={pending}
        onClick={() => start(() => signOut())}
        title="Wyloguj"
        style={{
          marginLeft: 'auto',
          width: 28, height: 28, borderRadius: 6,
          background: hover ? 'var(--lo-surface-2)' : 'transparent',
          border: '1px solid ' + (hover ? 'var(--lo-border)' : 'transparent'),
          color: hover ? 'var(--lo-text-muted)' : 'var(--lo-text-dim)',
          display: 'grid', placeItems: 'center',
          transition: 'background .1s, color .1s',
          cursor: 'pointer',
        }}
      >
        <Icon name="logout" size={14} />
      </button>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: '1px solid var(--lo-border)',
        padding: '20px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        background: 'var(--lo-bg)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 18px' }}>
        <div
          style={{
            width: 22, height: 22, borderRadius: 6,
            background: 'var(--lo-accent-soft)',
            border: '1px solid var(--lo-accent-line)',
            display: 'grid', placeItems: 'center',
            color: 'var(--lo-accent)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '-.02em' }}>L</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em' }}>LifeOS</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--lo-text-dim)', fontFamily: 'var(--font-geist-mono)' }}>v0.4</span>
      </div>

      {/* Primary nav */}
      {primaryItems.map(it => <SidebarItem key={it.href} item={it} primary />)}

      {/* Section label */}
      <div className="label-eyebrow" style={{ padding: '20px 10px 8px' }}>Moduły</div>

      {/* Sub nav */}
      {subItems.map(it => <SidebarItem key={it.href} item={it} />)}

      {/* User footer */}
      <UserFooter />
    </aside>
  );
}
