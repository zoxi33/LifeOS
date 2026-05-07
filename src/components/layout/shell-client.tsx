'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { MobileTabBar } from './mobile-tab-bar';
import { useTweaks } from '@/hooks/use-tweaks';
import type { SidebarXP } from '@/app/(shell)/actions';

const CommandPalette = dynamic(
  () => import('./command-palette').then(m => ({ default: m.CommandPalette })),
  { ssr: false }
);

const TweaksPanel = dynamic(
  () => import('@/components/tweaks/tweaks-panel').then(m => ({ default: m.TweaksPanel })),
  { ssr: false }
);

export function ShellClient({ children, xp }: { children: React.ReactNode; xp: SidebarXP }) {
  const [cmd, setCmd] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const router = useRouter();
  const [tweaks] = useTweaks();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA';

      if (meta && e.key === 'k') { e.preventDefault(); setCmd(true); return; }
      if (e.key === 'Escape') { setCmd(false); setTweaksOpen(false); return; }

      if (meta && e.shiftKey && e.key === 'J') { e.preventDefault(); router.push('/journal'); return; }
      if (meta && e.key === 'd') { e.preventDefault(); router.push('/today'); return; }
      if (meta && e.key === 'w') { e.preventDefault(); router.push('/weight'); return; }
      if (meta && e.key === 'm') { e.preventDefault(); router.push('/today'); return; }
      if (meta && e.key === 'e') { e.preventDefault(); router.push('/finance'); return; }
      if (meta && e.key === ',') { e.preventDefault(); setTweaksOpen(v => !v); return; }

      if (!meta && !e.shiftKey && !typing) {
        const map: Record<string, string> = {
          '1': '/today', '2': '/daily', '3': '/habits', '4': '/journal', '5': '/stats',
        };
        if (map[e.key]) router.push(map[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  return (
    <div
      className={`density-${tweaks.density}`}
      style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--lo-bg)' }}
    >
      <div className="hidden md:flex" style={{ flexShrink: 0 }}>
        <Sidebar xp={xp} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar onCmd={() => setCmd(true)} onTweaks={() => setTweaksOpen(v => !v)} xp={xp} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <MobileTabBar />

      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
      {tweaksOpen && <TweaksPanel onClose={() => setTweaksOpen(false)} />}
    </div>
  );
}
