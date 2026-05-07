'use client';

import { useState, useTransition } from 'react';
import { WaterWidget } from './water-widget';
import { RangePicker, type DateRange } from '@/components/primitives/range-picker';
import { fmtWater, fmtWaterShort } from '@/lib/water-utils';
import { getWaterHistory } from '@/app/(shell)/water/actions';
import type { WaterLog } from '@/app/(shell)/water/actions';

interface DayRow { date: string; ml: number; target_ml: number; }

function BarChart({ history }: { history: DayRow[] }) {
  if (!history.length) return null;
  const todayStr = new Date().toISOString().slice(0, 10);
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 56, overflow: 'hidden' }}>
      {[...history].reverse().map(row => {
        const pct = Math.min(1, row.ml / (row.target_ml || 3000));
        const isToday = row.date === todayStr;
        return (
          <div
            key={row.date}
            title={`${row.date}: ${fmtWater(row.ml)} / ${fmtWater(row.target_ml ?? 3000)}`}
            style={{
              flex: 1, minWidth: 4,
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

export function WaterHistoryScreen({ history: initialHistory, todayLog }: {
  history: DayRow[];
  todayLog: WaterLog;
}) {
  const [history, setHistory] = useState<DayRow[]>(initialHistory);
  const [range, setRange] = useState<DateRange>(30);
  const [loading, startRange] = useTransition();

  const handleRangeChange = (r: DateRange) => {
    setRange(r);
    startRange(async () => {
      const data = await getWaterHistory(r);
      setHistory(data);
    });
  };

  const totalDays = history.length;
  const metGoal = history.filter(r => r.ml >= r.target_ml).length;
  const avgMl = totalDays ? Math.round(history.reduce((s, r) => s + r.ml, 0) / totalDays) : 0;
  const oldest = [...history].sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <div className="lo-screen" style={{ padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div className="label-eyebrow">Nawodnienie</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
            Historia · {totalDays} {totalDays === 1 ? 'dzień' : 'dni'}
          </div>
        </div>
        <RangePicker value={range} onChange={handleRangeChange} loading={loading} />
      </div>

      {/* Stats row */}
      <div className="lo-grid-3col">
        {[
          { label: 'Cel osiągnięty', value: `${metGoal}/${totalDays}`, unit: 'dni' },
          { label: 'Średnia',        value: fmtWaterShort(avgMl),       unit: '/ dzień' },
          { label: 'Dziś',           value: fmtWaterShort(todayLog.ml), unit: `/ ${todayLog.targetMl / 1000} L` },
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

      {/* Bar chart */}
      <div style={{
        background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
        borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12,
        opacity: loading ? 0.5 : 1, transition: 'opacity .15s',
      }}>
        <div className="label-eyebrow">{range === null ? 'Cała historia' : `Ostatnie ${range} dni`}</div>
        {history.length === 0
          ? <div style={{ fontSize: 13, color: 'var(--lo-text-muted)' }}>Brak danych w tym zakresie.</div>
          : <BarChart history={history} />
        }
        {history.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--lo-text-dim)', fontFamily: 'var(--font-geist-mono)' }}>
            <span>{oldest?.date ?? ''}</span>
            <span>dziś</span>
          </div>
        )}
      </div>

      {/* Today widget */}
      <WaterWidget initial={todayLog} />
    </div>
  );
}
