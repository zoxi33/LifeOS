'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/primitives/icon';

const TABS = [
  { href: '/today',   icon: 'home',  label: 'Dziś'     },
  { href: '/daily',   icon: 'grid',  label: 'Przegląd' },
  { href: '/habits',  icon: 'list',  label: 'Nawyki'   },
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
        height: 78, paddingBottom: 22,
        background: 'var(--lo-bg)',
        borderTop: '1px solid var(--lo-border)',
        alignItems: 'center', justifyContent: 'space-around',
        zIndex: 50,
      }}
    >
      {TABS.map(tab => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '6px 16px',
              color: isActive ? 'var(--lo-accent)' : 'var(--lo-text-faint)',
              textDecoration: 'none',
              transition: 'color .12s ease',
            }}
          >
            <Icon name={tab.icon} size={20} />
            <span style={{
              fontFamily: 'var(--font-geist-mono)', fontSize: 10,
              letterSpacing: '0.04em',
            }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
