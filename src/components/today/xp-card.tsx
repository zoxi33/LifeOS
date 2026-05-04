import { HabitRing } from '@/components/primitives/habit-ring';

export function XPCard() {
  return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      {/* Ring with level */}
      <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
        <HabitRing value={68} total={100} size={56} stroke={4} />
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
          fontSize: 14, fontWeight: 500,
        }}>12</div>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <div className="label-eyebrow">Poziom</div>
        <div style={{ fontSize: 13 }}>4 820 / 7 100 XP</div>
        <div style={{
          fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)',
        }}>+180 dziś · +1 240 ten tydzień</div>
      </div>
    </div>
  );
}
