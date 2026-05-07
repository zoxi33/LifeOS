'use client';

import { Icon } from '@/components/primitives/icon';
import type { TweakStreakProminence } from '@/types/lifeos';

interface StreakCardProps {
  days: number;
  label: string;
  since: string;
  best?: number;
  prominence?: TweakStreakProminence;
  onReset?: () => void;
}

export function StreakCard({ days, label, since, best, prominence = 'medium', onReset }: StreakCardProps) {
  const big = prominence === 'high';
  return (
    <div
      style={{
        background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
        borderRadius: 12, padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: 10,
        gridColumn: big ? '1 / -1' : 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div className="label-eyebrow">{label}</div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 22, padding: '0 8px',
          background: 'var(--lo-accent-soft)', border: '1px solid var(--lo-accent-line)',
          borderRadius: 999, fontSize: 11, color: 'var(--lo-accent)',
          fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.02em',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--lo-accent)' }} />
          aktywny
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <div style={{
          fontFamily: 'var(--font-geist-mono)',
          fontVariantNumeric: 'tabular-nums',
          fontSize: big ? 64 : 44,
          fontWeight: 500,
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}>{days}</div>
        <div style={{ color: 'var(--lo-text-muted)', fontSize: 13 }}>dni</div>
        {best !== undefined && best > 0 && (
          <div style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--lo-text-faint)', fontSize: 11,
            fontFamily: 'var(--font-geist-mono)',
          }}>
            <Icon name="arrow-up" size={11} /> rekord {best}
          </div>
        )}
      </div>

      {since && <div style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>od {since}</div>}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={onReset}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 28, padding: '0 12px',
            background: 'transparent', color: 'var(--lo-text-muted)',
            border: '1px solid transparent', borderRadius: 8,
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background .12s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--lo-surface-2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-text)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-text-muted)'; }}
        >
          <Icon name="reset" size={12} /> Zresetuj
        </button>
        <button style={{
          marginLeft: 'auto',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: 28, padding: '0 12px',
          background: 'transparent', color: 'var(--lo-text-muted)',
          border: '1px solid transparent', borderRadius: 8,
          fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Notatka
        </button>
      </div>
    </div>
  );
}
