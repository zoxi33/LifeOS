import { HabitRing } from '@/components/primitives/habit-ring';
import type { XPData } from '@/app/(shell)/today/actions';

function fmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function XPCard({ xp }: { xp: XPData }) {
  const pct = xp.xpForNextLevel > 0 ? Math.round((xp.xpInLevel / xp.xpForNextLevel) * 100) : 0;
  const hasStreakBonus = xp.streakBonus !== 0;

  return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
    }}>
      {/* Ring with level */}
      <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
        <HabitRing value={pct} total={100} size={48} stroke={4} />
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
          fontSize: 13, fontWeight: 500,
        }}>{xp.level}</div>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
        <div className="label-eyebrow">Poziom {xp.level}</div>
        <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
          {fmt(xp.xpInLevel)} / {fmt(xp.xpForNextLevel)} XP
        </div>
        <div style={{
          fontFamily: 'var(--font-geist-mono)', fontSize: 10,
          color: 'var(--lo-text-faint)',
          display: 'flex', flexWrap: 'wrap', gap: '2px 8px',
        }}>
          <span>+{xp.todayXP} dziś</span>
          <span>+{xp.weekXP} tydz.</span>
          <span>{fmt(xp.totalXP)} łącznie</span>
        </div>
        {hasStreakBonus && (
          <div style={{
            fontFamily: 'var(--font-geist-mono)', fontSize: 10,
            color: xp.streakBonus > 0 ? 'var(--lo-warn)' : 'var(--lo-danger)',
          }}>
            🔥 {xp.streakBonus > 0 ? '+' : ''}{xp.streakBonus} XP streaki
          </div>
        )}
      </div>
    </div>
  );
}
