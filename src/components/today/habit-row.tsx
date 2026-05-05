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
      gridTemplateColumns: '44px 1fr auto',
      alignItems: 'center', gap: 12,
      padding: '11px 4px',
      borderBottom: '1px solid var(--lo-border)',
    }}>
      {/* Checkbox with emoji */}
      <button
        onClick={() => onToggle(h.id)}
        aria-label={h.done ? 'Odznacz' : 'Odhacz'}
        style={{
          width: 44, height: 44, borderRadius: 10,
          border: '1px solid ' + (h.done ? 'var(--lo-accent-line)' : 'var(--lo-border-strong)'),
          background: h.done ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
          color: 'var(--lo-accent)',
          display: 'grid', placeItems: 'center',
          cursor: 'pointer', flexShrink: 0,
          fontSize: h.emoji ? 22 : 14,
          transition: 'all .15s ease',
          position: 'relative',
        }}
      >
        {h.emoji ? (
          <>
            <span>{h.emoji}</span>
            {h.done && (
              <span style={{
                position: 'absolute', bottom: -4, right: -4,
                width: 16, height: 16, borderRadius: 999,
                background: 'var(--lo-accent)', border: '2px solid var(--lo-surface)',
                display: 'grid', placeItems: 'center',
              }}>
                <Icon name="check" size={9} style={{ color: 'var(--lo-bg)' }} />
              </span>
            )}
          </>
        ) : (
          h.done ? <Icon name="check" size={16} /> : null
        )}
      </button>

      {/* Name + freq */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 450,
          color: h.done ? 'var(--lo-text-muted)' : 'var(--lo-text)',
          textDecoration: h.done ? 'line-through' : 'none',
          textDecorationColor: 'var(--lo-text-dim)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{h.name}</div>
        <div style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: 11, color: 'var(--lo-text-dim)', marginTop: 1,
        }}>{h.freq}</div>
      </div>

      {/* Right side: week dots (hidden mobile) + streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {/* Week mini-grid — hidden on mobile via CSS class */}
        <div className="lo-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {h.week.map((v, i) => (
            <div key={i} title={DAY_LABELS[i]} style={{
              width: 12, height: 12, borderRadius: 3,
              background: v ? 'var(--lo-accent)' : 'var(--lo-border)',
              opacity: v ? (i === 6 ? 0.4 : 0.85) : 1,
            }} />
          ))}
        </div>
        {/* Streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="flame" size={12} style={{ color: h.streak > 0 ? 'var(--lo-warn)' : 'var(--lo-text-dim)' }} />
          <span style={{
            fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
            fontSize: 13, minWidth: 16, textAlign: 'right',
            color: h.streak > 0 ? 'var(--lo-text)' : 'var(--lo-text-dim)',
          }}>{h.streak}</span>
        </div>
      </div>
    </div>
  );
}
