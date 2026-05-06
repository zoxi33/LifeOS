'use client';

import { WaterWidget } from './water-widget';
import { fmtWater, fmtWaterShort } from '@/lib/water-utils';
import type { WaterLog } from '@/app/(shell)/water/actions';

interface DayRow { date: string; ml: number; target_ml: number; }

function Bar28({ history }: { history: DayRow[] }) {
  const map = Object.fromEntries(history.map(r => [r.date, r]));
  const days: string[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 56 }}>
      {days.map(date => {
        const row = map[date];
        const pct = row ? Math.min(1, row.ml / (row.target_ml || 3000)) : 0;
        const isToday = date === new Date().toISOString().slice(0, 10);
        return (
          <div
            key={date}
            title={`${date}: ${fmtWater(row?.ml ?? 0)} / ${fmtWater(row?.target_ml ?? 3000)}`}
            style={{
              flex: 1, minWidth: 6,
              height: `${Math.max(4, Math.round(pct * 52))}px`,
              background: pct >= 1 ? 'var(--lo-info)'
                : pct > 0 ? 'oklch(0.74 0.10 235 / 0.55)'
                : 'var(--lo-border)',
              borderRadius: 3,
              outline: isToday ? '1px solid var(--lo-info)' : 'none',
              outlineOffset: 1,
              transition: 'height .2s ease',
            }}
          />
        );
      })}
    </div>
  );
}

export function WaterHistoryScreen({ history, todayLog }: { history: DayRow[]; todayLog: WaterLog }) {
  const totalDays = history.length;
  const metGoal = history.filter(r => r.ml >= r.target_ml).length;
  const avgMl = totalDays
    ? Math.round(history.reduce((s, r) => s + r.ml, 0) / totalDays)
    : 0;

  return (
    <div className="lo-screen" style={{ padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div>
        <div className="label-eyebrow">Nawodnienie</div>
        <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
          Historia 28 dni
        </div>
      </div>

      {/* Stats row */}
      <div className="lo-grid-3col">
        {[
          { label: 'Cel osiągnięty', value: `${metGoal}/${totalDays}`, unit: 'dni' },
          { label: 'Średnia', value: fmtWaterShort(avgMl), unit: '/ dzień' },
          { label: 'Dziś', value: fmtWaterShort(todayLog.ml), unit: `/ ${todayLog.targetMl / 1000} L` },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
            borderRadius: 12, padding: '16px 18px',
          }}>
            <div className="label-eyebrow" style={{ marginBottom: 6 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{
                fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                fontSize: 26, fontWeight: 500, color: 'var(--lo-info)',
              }}>{s.value}</span>
              <span style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 28-day bar chart */}
      <div style={{
        background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
        borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div className="label-eyebrow">Ostatnie 28 dni</div>
        <Bar28 history={history} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--lo-text-dim)', fontFamily: 'var(--font-geist-mono)' }}>
          <span>28 dni temu</span><span>dziś</span>
        </div>
      </div>

      {/* Today widget */}
      <WaterWidget initial={todayLog} />
    </div>
  );
}
