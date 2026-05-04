'use client';

import { Icon } from '@/components/primitives/icon';
import type { TodayHabit } from '@/types/lifeos';

const DAY_LABELS = ['P', 'W', 'Ś', 'C', 'P', 'S', 'N'];

interface HabitRowProps {
  h: TodayHabit;
  onToggle: (id: string) => void;
}

export function HabitRow({ h, onToggle }: HabitRowProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '28px 1fr auto auto',
      alignItems: 'center', gap: 14,
      padding: '12px 4px',
      borderBottom: '1px solid var(--lo-border)',
    }}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(h.id)}
        aria-label={h.done ? 'Odznacz' : 'Odhacz'}
        style={{
          width: 22, height: 22, borderRadius: 6,
          border: '1px solid ' + (h.done ? 'var(--lo-accent-line)' : 'var(--lo-border-strong)'),
          background: h.done ? 'var(--lo-accent-soft)' : 'transparent',
          color: 'var(--lo-accent)',
          display: 'grid', placeItems: 'center',
          cursor: 'pointer', flexShrink: 0,
          transition: 'all .15s ease',
        }}
      >
        {h.done && <Icon name="check" size={13} />}
      </button>

      {/* Name + freq */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 450,
          color: h.done ? 'var(--lo-text-muted)' : 'var(--lo-text)',
          textDecoration: h.done ? 'line-through' : 'none',
          textDecorationColor: 'var(--lo-text-dim)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{h.name}</div>
        <div style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: 11, color: 'var(--lo-text-dim)', marginTop: 2,
        }}>{h.freq}</div>
      </div>

      {/* Week mini-grid */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {h.week.map((v, i) => (
          <div key={i} title={DAY_LABELS[i]} style={{
            width: 14, height: 14, borderRadius: 3,
            background: v ? 'var(--lo-accent)' : 'var(--lo-border)',
            opacity: v ? (i === 6 ? 0.4 : 0.85) : 1,
          }} />
        ))}
      </div>

      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 60, justifyContent: 'flex-end' }}>
        <Icon name="flame" size={12} style={{ color: h.streak > 0 ? 'var(--lo-accent)' : 'var(--lo-text-dim)' }} />
        <span style={{
          fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
          fontSize: 12,
          color: h.streak > 0 ? 'var(--lo-text)' : 'var(--lo-text-dim)',
        }}>{h.streak}</span>
      </div>
    </div>
  );
}
