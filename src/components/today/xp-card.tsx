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
      borderRadius: 12, padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      {/* Ring with level */}
      <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
        <HabitRing value={pct} total={100} size={56} stroke={4} />
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
          fontSize: 14, fontWeight: 500,
        }}>{xp.level}</div>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
        <div className="label-eyebrow">Poziom {xp.level}</div>
        <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
          {fmt(xp.xpInLevel)} / {fmt(xp.xpForNextLevel)} XP
        </div>
        <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)' }}>
          +{xp.todayXP} dziś · +{xp.weekXP} tydzień · {fmt(xp.totalXP)} łącznie
        </div>
        {hasStreakBonus && (
          <div style={{
            fontFamily: 'var(--font-geist-mono)', fontSize: 11,
            color: xp.streakBonus > 0 ? 'var(--lo-warn)' : 'var(--lo-danger)',
          }}>
            🔥 streaki: {xp.streakBonus > 0 ? '+' : ''}{xp.streakBonus} XP
          </div>
        )}
      </div>
    </div>
  );
}
