'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/primitives/icon';

// Dziś in center (index 2 of 5)
const TABS = [
  { href: '/daily',   icon: 'grid',  label: 'Przegląd' },
  { href: '/habits',  icon: 'list',  label: 'Nawyki'   },
  { href: '/today',   icon: 'home',  label: 'Dziś',  center: true },
  { href: '/journal', icon: 'book',  label: 'Dziennik' },
  { href: '/stats',   icon: 'chart', label: 'Stat'     },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="flex md:hidden"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 'calc(62px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'var(--lo-bg)',
        borderTop: '1px solid var(--lo-border)',
        alignItems: 'center', justifyContent: 'space-around',
        zIndex: 50,
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
                textDecoration: 'none',
                marginTop: -10,
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
    </nav>
  );
}
