'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/primitives/icon';

const TABS = [
  { href: '/daily',   icon: 'grid', label: 'Przegląd' },
  { href: '/habits',  icon: 'list', label: 'Nawyki'   },
  { href: '/today',   icon: 'home', label: 'Dziś', center: true },
  { href: '/journal', icon: 'book', label: 'Dziennik' },
];

const MORE_ITEMS = [
  { href: '/stats',        icon: 'chart',   label: 'Statystyki' },
  { href: '/water',        icon: 'droplet', label: 'Woda' },
  { href: '/sleep',        icon: 'moon',    label: 'Sen' },
  { href: '/weight',       icon: 'weight',  label: 'Waga' },
  { href: '/streaks',      icon: 'flame',   label: 'Streaki' },
  { href: '/goals',        icon: 'goal',    label: 'Cele' },
  { href: '/finance',      icon: 'wallet',  label: 'Finanse' },
  { href: '/achievements', icon: 'trophy',  label: 'Osiągnięcia' },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = MORE_ITEMS.some(i => pathname === i.href || pathname.startsWith(i.href + '/'));

  return (
    <>
      {/* Bottom sheet overlay */}
      {moreOpen && (
        <div
          onClick={() => setMoreOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 49,
            background: 'oklch(0 0 0 / 0.55)',
          }}
        />
      )}

      {/* More bottom sheet */}
      <div
        className="flex md:hidden"
        style={{
          position: 'fixed', bottom: 'calc(62px + env(safe-area-inset-bottom, 0px))',
          left: 0, right: 0, zIndex: 50,
          background: 'var(--lo-bg)',
          borderTop: '1px solid var(--lo-border)',
          borderRadius: '16px 16px 0 0',
          padding: '20px 16px 8px',
          transform: moreOpen ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform .28s cubic-bezier(.32,.72,0,1)',
          display: moreOpen ? 'block' : undefined,
        }}
      >
        <div style={{
          width: 36, height: 4, borderRadius: 999,
          background: 'var(--lo-border-strong)',
          margin: '0 auto 20px',
        }} />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
        }}>
          {MORE_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '14px 8px', borderRadius: 12,
                  background: isActive ? 'var(--lo-accent-soft)' : 'var(--lo-surface)',
                  border: '1px solid ' + (isActive ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
                  color: isActive ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
                  textDecoration: 'none', transition: 'background .12s',
                }}
              >
                <Icon name={item.icon} size={20} />
                <span style={{
                  fontFamily: 'var(--font-geist-mono)', fontSize: 10,
                  letterSpacing: '0.03em', textAlign: 'center',
                  fontWeight: isActive ? 600 : 400,
                }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div style={{ height: 8 }} />
      </div>

      {/* Tab bar */}
      <nav
        className="flex md:hidden"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 'calc(62px + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: 'var(--lo-bg)',
          borderTop: '1px solid var(--lo-border)',
          alignItems: 'center', justifyContent: 'space-around',
          zIndex: 51,
        }}
      >
        {TABS.map(tab => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          const isCenter = tab.center;

          if (isCenter) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  textDecoration: 'none', marginTop: -10,
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: isActive ? 'var(--lo-accent)' : 'var(--lo-surface-2)',
                  border: '1px solid ' + (isActive ? 'var(--lo-accent)' : 'var(--lo-border-strong)'),
                  display: 'grid', placeItems: 'center',
                  boxShadow: isActive ? '0 4px 16px oklch(0.78 0.14 145 / 0.35)' : '0 2px 8px oklch(0 0 0 / 0.3)',
                  transition: 'background .15s, box-shadow .15s',
                }}>
                  <Icon name={tab.icon} size={22} style={{ color: isActive ? 'var(--lo-bg)' : 'var(--lo-text-muted)' }} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-geist-mono)', fontSize: 9,
                  letterSpacing: '0.04em',
                  color: isActive ? 'var(--lo-accent)' : 'var(--lo-text-faint)',
                  fontWeight: isActive ? 600 : 400,
                }}>{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '6px 12px',
                color: isActive ? 'var(--lo-accent)' : 'var(--lo-text-faint)',
                textDecoration: 'none',
                transition: 'color .12s ease',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: isActive ? 'var(--lo-accent-soft)' : 'transparent',
                display: 'grid', placeItems: 'center',
                transition: 'background .12s',
              }}>
                <Icon name={tab.icon} size={18} />
              </div>
              <span style={{
                fontFamily: 'var(--font-geist-mono)', fontSize: 9,
                letterSpacing: '0.04em',
                fontWeight: isActive ? 600 : 400,
              }}>{tab.label}</span>
            </Link>
          );
        })}

        {/* Więcej button */}
        <button
          onClick={() => setMoreOpen(v => !v)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '6px 12px', background: 'transparent', border: 'none',
            color: isMoreActive || moreOpen ? 'var(--lo-accent)' : 'var(--lo-text-faint)',
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'color .12s ease',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: isMoreActive || moreOpen ? 'var(--lo-accent-soft)' : 'transparent',
            display: 'grid', placeItems: 'center',
            transition: 'background .12s',
          }}>
            <Icon name="grid" size={18} />
          </div>
          <span style={{
            fontFamily: 'var(--font-geist-mono)', fontSize: 9,
            letterSpacing: '0.04em',
            fontWeight: isMoreActive || moreOpen ? 600 : 400,
          }}>Więcej</span>
        </button>
      </nav>
    </>
  );
}
