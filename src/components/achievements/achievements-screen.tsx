'use client';

import { useState } from 'react';
import { HabitRing } from '@/components/primitives/habit-ring';
import type { Achievement, AchievementCategory, AchievementsData } from '@/app/(shell)/achievements/config';
import { ACHIEVEMENT_CATEGORIES } from '@/app/(shell)/achievements/config';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Filter = 'all' | AchievementCategory;

function categoryColor(cat: AchievementCategory): string {
  const map: Record<AchievementCategory, string> = {
    'Nawyki':   'var(--lo-accent)',
    'Streak':   'oklch(0.78 0.16 25)',
    'Focus':    'oklch(0.78 0.13 145)',
    'Sen':      'var(--lo-info)',
    'Finanse':  'oklch(0.78 0.14 78)',
    'Dziennik': 'oklch(0.74 0.10 290)',
    'Wolność':  'oklch(0.78 0.10 200)',
  };
  return map[cat] ?? 'var(--lo-accent)';
}

// ─── AchievementCard ──────────────────────────────────────────────────────────

function AchievementCard({ a }: { a: Achievement }) {
  const [hover, setHover] = useState(false);
  const color = a.unlocked ? categoryColor(a.category) : 'var(--lo-border-strong)';
  const ringColor = a.unlocked ? color : 'var(--lo-accent)';

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: a.unlocked
          ? `color-mix(in oklch, ${color} 6%, var(--lo-surface))`
          : 'var(--lo-surface)',
        border: `1px solid ${a.unlocked
          ? `color-mix(in oklch, ${color} 28%, transparent)`
          : hover ? 'var(--lo-border-strong)' : 'var(--lo-border)'}`,
        borderRadius: 12,
        padding: '20px 16px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        opacity: a.unlocked ? 1 : 0.7,
        transition: 'border-color .12s ease, opacity .12s ease',
        cursor: 'default',
        position: 'relative',
      }}
    >
      {/* Ring with percent/emoji in center */}
      <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
        <HabitRing value={a.progress} total={100} size={80} stroke={6} color={ringColor} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 1,
        }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>{a.emoji}</span>
          {!a.unlocked && (
            <span style={{
              fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
              fontSize: 11, color: 'var(--lo-text-muted)', lineHeight: 1,
            }}>
              {a.progress}%
            </span>
          )}
        </div>
      </div>

      {/* Name + desc */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{
          fontSize: 13, fontWeight: 500,
          color: a.unlocked ? 'var(--lo-text)' : 'var(--lo-text-muted)',
          lineHeight: 1.3, marginBottom: 4,
        }}>
          {a.name}
        </div>
        <div style={{
          fontSize: 11, color: 'var(--lo-text-faint)',
          lineHeight: 1.4,
        }}>
          {a.desc}
        </div>
      </div>

      {/* XP badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        height: 22, padding: '0 8px',
        background: a.unlocked
          ? `color-mix(in oklch, ${color} 14%, transparent)`
          : 'var(--lo-surface-2)',
        border: `1px solid ${a.unlocked
          ? `color-mix(in oklch, ${color} 32%, transparent)`
          : 'var(--lo-border)'}`,
        borderRadius: 999,
        fontFamily: 'var(--font-geist-mono)', fontSize: 11,
        color: a.unlocked ? color : 'var(--lo-text-dim)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        +{a.xp} XP
      </div>

      {/* Unlocked checkmark */}
      {a.unlocked && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 18, height: 18, borderRadius: 999,
          background: `color-mix(in oklch, ${color} 16%, transparent)`,
          border: `1px solid ${color}`,
          display: 'grid', placeItems: 'center',
          color, fontSize: 9,
        }}>✓</div>
      )}

      {/* Progress text (locked only, shown on hover) */}
      {!a.unlocked && hover && (
        <div style={{
          position: 'absolute', bottom: 8,
          fontFamily: 'var(--font-geist-mono)', fontSize: 10,
          color: 'var(--lo-text-dim)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {a.current} / {a.threshold}
        </div>
      )}
    </div>
  );
}

// ─── LevelBar ─────────────────────────────────────────────────────────────────

function LevelBar({ level, xpInLevel, xpForNextLevel, totalXP }: {
  level: number; xpInLevel: number; xpForNextLevel: number; totalXP: number;
}) {
  const pct = Math.min(100, Math.round((xpInLevel / xpForNextLevel) * 100));
  return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 20,
    }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <HabitRing value={xpInLevel} total={xpForNextLevel} size={64} stroke={5} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)', lineHeight: 1 }}>L</span>
          <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 17, fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {level}
          </span>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Poziom {level}</span>
          <span style={{
            fontFamily: 'var(--font-geist-mono)', fontSize: 11,
            color: 'var(--lo-text-faint)', fontVariantNumeric: 'tabular-nums',
          }}>
            {xpInLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--lo-surface-2)', borderRadius: 999 }}>
          <div style={{
            height: '100%', background: 'var(--lo-accent)', borderRadius: 999,
            width: `${pct}%`, transition: 'width .4s ease',
          }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 6,
          fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: 'var(--lo-text-dim)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span>Łącznie: {totalXP.toLocaleString()} XP</span>
          <span>{pct}% do poziomu {level + 1}</span>
        </div>
      </div>
    </div>
  );
}

// ─── AchievementsScreen ───────────────────────────────────────────────────────

export function AchievementsScreen({ data }: { data: AchievementsData }) {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = filter === 'all'
    ? data.achievements
    : data.achievements.filter(a => a.category === filter);

  const unlocked = data.achievements.filter(a => a.unlocked).length;

  return (
    <div className="lo-screen" style={{
      padding: '20px 24px 40px',
      maxWidth: 1280, margin: '0 auto', width: '100%',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="label-eyebrow">Osiągnięcia</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
            {unlocked} / {data.totalCount} odblokowanych
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-geist-mono)', fontSize: 13,
          color: 'var(--lo-accent)', fontVariantNumeric: 'tabular-nums',
        }}>
          +{data.earnedXP.toLocaleString()} XP z osiągnięć
        </div>
      </div>

      {/* Level bar */}
      <LevelBar
        level={data.level.level}
        xpInLevel={data.level.xpInLevel}
        xpForNextLevel={data.level.xpForNextLevel}
        totalXP={data.level.totalXP}
      />

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(['all', ...ACHIEVEMENT_CATEGORIES] as (Filter)[]).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 30, padding: '0 12px',
              background: filter === cat ? 'var(--lo-surface-2)' : 'transparent',
              border: `1px solid ${filter === cat ? 'var(--lo-border-strong)' : 'transparent'}`,
              color: filter === cat ? 'var(--lo-text)' : 'var(--lo-text-muted)',
              borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all .1s',
            }}
          >
            {cat === 'all' ? 'Wszystkie' : cat}
            {cat !== 'all' && (
              <span style={{
                fontFamily: 'var(--font-geist-mono)', fontSize: 10,
                color: filter === cat ? 'var(--lo-text-faint)' : 'var(--lo-text-dim)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {data.achievements.filter(a => a.category === cat && a.unlocked).length}/
                {data.achievements.filter(a => a.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
      }}>
        {visible.map(a => (
          <AchievementCard key={a.id} a={a} />
        ))}
      </div>
    </div>
  );
}
