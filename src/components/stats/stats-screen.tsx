'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { Heatmap } from '@/components/primitives/heatmap';
import { Sparkline } from '@/components/primitives/sparkline';
import { SectionHeader } from '@/components/primitives/section-header';
import type { StatsData } from '@/app/(shell)/stats/actions';

// ─── value helpers ───────────────────────────────────────────────────────────

function isTimeUnit(unit: string): boolean {
  return /^(min|minut[ay]?|godzin[ay]?|h|hr)$/i.test(unit.trim());
}

function fmtTotalValue(total: number, unit: string): string {
  if (isTimeUnit(unit)) {
    const h = Math.floor(total / 60), m = total % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  }
  return `${total % 1 === 0 ? total : total.toFixed(1)} ${unit}`;
}

function fmtAvgValue(avg: number, unit: string): string {
  if (isTimeUnit(unit)) {
    const rounded = Math.round(avg);
    const h = Math.floor(rounded / 60), m = rounded % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  }
  return `${avg % 1 === 0 ? avg : avg.toFixed(1)} ${unit}`;
}

// ─── BarTooltip ──────────────────────────────────────────────────────────────

function BarTooltip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      pointerEvents: 'none',
      background: 'var(--lo-surface)',
      border: '1px solid var(--lo-border-strong)',
      borderRadius: 8,
      padding: '7px 11px',
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      whiteSpace: 'nowrap',
    }}>
      <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: 'var(--lo-text-faint)', letterSpacing: '.04em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 14, fontWeight: 600, color: 'var(--lo-accent)' }}>
        {value}
      </div>
    </div>
  );
}

function useMouseTooltip() {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const show = (e: React.MouseEvent, label: string, value: string) => {
    setTooltip({ x: e.clientX, y: e.clientY, label, value });
  };
  const move = (e: React.MouseEvent) => {
    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
  };
  const hide = () => setTooltip(null);

  const portal = tooltip ? (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: tooltip.x + 14,
        top: tooltip.y - 10,
        zIndex: 9999,
        transform: 'translateY(-50%)',
      }}
    >
      <BarTooltip label={tooltip.label} value={tooltip.value} />
    </div>
  ) : null;

  return { show, move, hide, portal };
}

// ─── helpers ────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '90d' | 'rok';
const PERIODS: Period[] = ['7d', '30d', '90d', 'rok'];
const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 90, 'rok': 365 };

function dateFrom(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function fmt(n: number, decimals = 1) {
  return n.toFixed(decimals).replace('.', ',');
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, unit, sub, accent = false }: {
  label: string; value: string; unit?: string; sub?: string; accent?: boolean;
}) {
  return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div className="label-eyebrow">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <div style={{
          fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
          fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em',
          color: accent ? 'var(--lo-accent)' : 'var(--lo-text)',
        }}>{value}</div>
        {unit && <div style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>{unit}</div>}
      </div>
      {sub && (
        <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{
      padding: '32px 0', textAlign: 'center',
      fontSize: 13, color: 'var(--lo-text-muted)',
    }}>{text}</div>
  );
}

// ─── HabitValueSection ───────────────────────────────────────────────────────

function HabitValueSection({ statsInPeriod, days }: {
  statsInPeriod: { id: string; name: string; unit: string; logs: { date: string; value: number }[] }[];
  days: number;
}) {
  const { show, move, hide, portal } = useMouseTooltip();

  const fmtDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      {portal}
      <div style={{
        background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
        borderRadius: 12, padding: '18px 20px',
      }}>
        <SectionHeader eyebrow={`Wartości nawyków · ${days}d`} title="Sumy i średnie" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 4 }}>
          {statsInPeriod.map(h => {
            const total = h.logs.reduce((s, l) => s + l.value, 0);
            const avg = total / h.logs.length;
            const maxVal = Math.max(...h.logs.map(l => l.value));
            const isTime = isTimeUnit(h.unit);
            const fmtVal = (v: number) => isTime ? fmtTotalValue(v, h.unit) : `${v % 1 === 0 ? v : v.toFixed(1)} ${h.unit}`;

            return (
              <div key={h.id}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--lo-text)' }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>{h.unit}</div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 20, fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 12, flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--lo-text-muted)' }}>
                      łącznie <span style={{ color: 'var(--lo-accent)', fontWeight: 600 }}>{fmtTotalValue(total, h.unit)}</span>
                    </span>
                    <span style={{ color: 'var(--lo-text-muted)' }}>
                      śr. <span style={{ color: 'var(--lo-text)' }}>{fmtAvgValue(avg, h.unit)}</span> / sesję
                    </span>
                    <span style={{ color: 'var(--lo-text-muted)' }}>
                      max <span style={{ color: 'var(--lo-text)' }}>{fmtAvgValue(maxVal, h.unit)}</span>
                    </span>
                    <span style={{ color: 'var(--lo-text-dim)' }}>{h.logs.length}×</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 52 }}>
                  {h.logs.slice(-Math.min(h.logs.length, days)).map((l, i) => (
                    <div
                      key={i}
                      onMouseEnter={e => {
                        show(e, fmtDate(l.date), fmtVal(l.value));
                        (e.currentTarget as HTMLDivElement).style.background = 'var(--lo-accent)';
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--lo-accent)';
                      }}
                      onMouseMove={move}
                      onMouseLeave={e => {
                        hide();
                        (e.currentTarget as HTMLDivElement).style.background = 'var(--lo-accent-soft)';
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--lo-accent-line)';
                      }}
                      style={{
                        flex: 1, minWidth: 3,
                        height: Math.max(3, (l.value / maxVal) * 48),
                        background: 'var(--lo-accent-soft)',
                        border: '1px solid var(--lo-accent-line)',
                        borderRadius: '2px 2px 0 0',
                        cursor: 'default',
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── main ────────────────────────────────────────────────────────────────────

export function StatsScreen({ data }: { data: StatsData }) {
  const [period, setPeriod] = useState<Period>('30d');
  const days = PERIOD_DAYS[period];
  const since = dateFrom(days);

  // ── derived stats for selected period ───────────────────────────────────
  const { consistencyPct, longestStreak, longestStreakHabit, filteredScatter, filteredWeight } = useMemo(() => {
    // Habit consistency: done logs / (habits × days)
    const totalExpected = data.activeHabits * days;
    const doneLogs = data.habitLogs.reduce((sum, h) => {
      return sum + h.doneDates.filter(d => d >= since).length;
    }, 0);
    const consistencyPct = totalExpected > 0
      ? Math.round((doneLogs / totalExpected) * 100)
      : null;

    // Longest streak in period
    let longestStreak = 0;
    let longestStreakHabit = '';
    for (const h of data.habitLogs) {
      const filtered = h.doneDates.filter(d => d >= since).map(d => ({ date: d, done: true }));
      // simple streak from filtered logs
      const sortedDates = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
      let s = 0;
      let prev = new Date();
      for (const log of sortedDates) {
        const cur = new Date(log.date);
        const diff = Math.round((prev.getTime() - cur.getTime()) / 86400000);
        if (diff <= 1) { s++; prev = cur; } else break;
      }
      if (s > longestStreak) { longestStreak = s; longestStreakHabit = h.name; }
    }

    const filteredScatter = data.scatterPoints.filter(p => p.date >= since);
    const filteredWeight  = data.weightPoints.filter(p => p.date >= since).map(p => p.weight);

    return { consistencyPct, longestStreak, longestStreakHabit, filteredScatter, filteredWeight };
  }, [data, days, since]);

  // ── scatter correlation ──────────────────────────────────────────────────
  const correlation = useMemo(() => {
    if (filteredScatter.length < 3) return null;
    const n = filteredScatter.length;
    const mx = filteredScatter.reduce((s, p) => s + p.sleep, 0) / n;
    const my = filteredScatter.reduce((s, p) => s + p.mood, 0) / n;
    const num = filteredScatter.reduce((s, p) => s + (p.sleep - mx) * (p.mood - my), 0);
    const den = Math.sqrt(
      filteredScatter.reduce((s, p) => s + (p.sleep - mx) ** 2, 0) *
      filteredScatter.reduce((s, p) => s + (p.mood - my) ** 2, 0)
    );
    return den === 0 ? 0 : Math.round((num / den) * 100) / 100;
  }, [filteredScatter]);

  // ── weight stats ────────────────────────────────────────────────────────
  const weightFirst = filteredWeight[0] ?? null;
  const weightLast  = filteredWeight[filteredWeight.length - 1] ?? null;
  const weightDelta = weightFirst != null && weightLast != null
    ? weightLast - weightFirst : null;

  return (
    <div className="lo-screen" style={{
      padding: '20px 24px 40px',
      display: 'flex', flexDirection: 'column', gap: 16,
      maxWidth: 1280, margin: '0 auto', width: '100%',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="label-eyebrow">Statystyki</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>Twoje wzorce</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              height: 32, padding: '0 12px',
              background: p === period ? 'var(--lo-surface-2)' : 'transparent',
              border: '1px solid ' + (p === period ? 'var(--lo-border-strong)' : 'transparent'),
              color: p === period ? 'var(--lo-text)' : 'var(--lo-text-muted)',
              borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* ── Big 4 ── */}
      <div className="lo-grid-4col">
        <StatCard
          label="Konsekwencja"
          value={consistencyPct != null ? String(consistencyPct) : '—'}
          unit="%"
          sub={`nawyki · ${days}d`}
          accent={consistencyPct != null && consistencyPct >= 70}
        />
        <StatCard
          label="Streak"
          value={longestStreak > 0 ? String(longestStreak) : '—'}
          unit={longestStreak > 0 ? 'dni' : ''}
          sub={longestStreakHabit || 'brak danych'}
          accent={longestStreak > 0}
        />
        <StatCard
          label="Wpisy dziennika"
          value={String(data.journalCount)}
          sub={`${data.scatterPoints.filter(p => p.date >= since).length} w tym okresie`}
        />
        <StatCard
          label="Aktywnych nawyków"
          value={String(data.activeHabits)}
          sub={data.activeHabits > 0 ? 'śledzone' : 'dodaj pierwszy nawyk'}
        />
      </div>

      {/* ── Consistency heatmap ── */}
      <div style={{
        background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
        borderRadius: 12, padding: '18px 20px',
      }}>
        <SectionHeader
          eyebrow={`Konsekwencja nawyków · ${days}d`}
          title="Mapa nawyków"
          action={
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontFamily: 'var(--font-geist-mono)', fontSize: 11 }}>
              {[
                { bg: 'var(--lo-border)', label: 'brak' },
                { bg: 'var(--lo-accent)', label: 'wykonane', opacity: 0.85 },
              ].map(leg => (
                <span key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--lo-text-faint)' }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: 2, display: 'inline-block',
                    background: leg.bg, opacity: leg.opacity ?? 1,
                  }} />
                  {leg.label}
                </span>
              ))}
            </div>
          }
        />

        {data.habitLogs.length === 0 ? (
          <EmptyState text="Brak nawyków — dodaj nawyki żeby zobaczyć mapę." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.habitLogs.map(h => {
              const doneSet = new Set(h.doneDates.filter(d => d >= since));
              const doneCount = doneSet.size;
              const pct = days > 0 ? Math.round((doneCount / days) * 100) : 0;
              return (
                <div key={h.id} style={{
                  display: 'grid', gridTemplateColumns: '160px 1fr 50px',
                  alignItems: 'center', gap: 16,
                }}>
                  <div style={{
                    fontSize: 12, color: 'var(--lo-text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }} title={h.name}>{h.name}</div>
                  <Heatmap
                    days={Math.min(days, 90)}
                    cell={9} gap={2}
                    getValue={(date) => {
                      const ds = date.toISOString().slice(0, 10);
                      return doneSet.has(ds) ? 3 : 0;
                    }}
                  />
                  <div style={{
                    fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                    fontSize: 11, color: pct >= 70 ? 'var(--lo-accent)' : 'var(--lo-text-faint)',
                    textAlign: 'right',
                  }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Wartości nawyków ── */}
      {data.habitValueStats.length > 0 && (() => {
        const statsInPeriod = data.habitValueStats.map(h => ({
          ...h,
          logs: h.logs.filter(l => l.date >= since),
        })).filter(h => h.logs.length > 0);

        if (statsInPeriod.length === 0) return null;

        return <HabitValueSection statsInPeriod={statsInPeriod} days={days} />;
      })()}

      {/* ── Scatter + Weight ── */}
      <div className="lo-grid-2col">

        {/* Sen vs Nastrój */}
        <div style={{
          background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
          borderRadius: 12, padding: '18px 20px',
        }}>
          <SectionHeader
            eyebrow={`Sen vs Nastrój · ${days}d`}
            title="Korelacja"
          />

          {filteredScatter.length < 3 ? (
            <EmptyState text={`Potrzebujesz ≥3 wpisów z danymi snu i nastroju.\nTeraz: ${filteredScatter.length}.`} />
          ) : (
            <>
              <div style={{
                position: 'relative', height: 180,
                background: 'var(--lo-bg-2)', borderRadius: 8,
                border: '1px solid var(--lo-border)',
              }}>
                {filteredScatter.map((p, i) => {
                  const sleepMin = Math.min(...filteredScatter.map(x => x.sleep));
                  const sleepMax = Math.max(...filteredScatter.map(x => x.sleep));
                  const range = sleepMax - sleepMin || 1;
                  const xPct = 8 + ((p.sleep - sleepMin) / range) * 84;
                  const yPct = 8 + ((p.mood - 1) / 4) * 84;
                  return (
                    <div key={i} title={`Sen: ${fmt(p.sleep)}h · Nastrój: ${p.mood}/5`} style={{
                      position: 'absolute',
                      left: `${xPct}%`,
                      bottom: `${yPct}%`,
                      width: 7, height: 7, borderRadius: 999,
                      background: 'var(--lo-accent)', opacity: 0.65,
                      transform: 'translate(-50%, 50%)',
                    }} />
                  );
                })}
                {/* Axis labels */}
                <div style={{ position: 'absolute', left: 10, bottom: 6, fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: 'var(--lo-text-dim)' }}>
                  {fmt(Math.min(...filteredScatter.map(p => p.sleep)))}h sen →
                </div>
                <div style={{ position: 'absolute', right: 10, bottom: 6, fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: 'var(--lo-text-dim)' }}>
                  {fmt(Math.max(...filteredScatter.map(p => p.sleep)))}h
                </div>
                <div style={{ position: 'absolute', left: 10, top: 8, fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: 'var(--lo-text-dim)' }}>
                  ↑ nastrój 5
                </div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 16, fontFamily: 'var(--font-geist-mono)', fontSize: 12 }}>
                {correlation != null && (
                  <span style={{ color: 'var(--lo-text-muted)' }}>
                    r = <span style={{
                      color: Math.abs(correlation) >= 0.5 ? 'var(--lo-accent)' : 'var(--lo-text-faint)',
                    }}>{correlation > 0 ? '+' : ''}{correlation.toFixed(2)}</span>
                    {' · '}
                    {Math.abs(correlation) >= 0.6 ? 'silna' : Math.abs(correlation) >= 0.3 ? 'umiarkowana' : 'słaba'} korelacja {correlation >= 0 ? 'dodatnia' : 'ujemna'}
                  </span>
                )}
                <span style={{ marginLeft: 'auto', color: 'var(--lo-text-dim)' }}>{filteredScatter.length} pkt</span>
              </div>
            </>
          )}
        </div>

        {/* Waga */}
        <div style={{
          background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
          borderRadius: 12, padding: '18px 20px',
        }}>
          <SectionHeader eyebrow={`Waga · ${days}d`} title="Trend" />

          {filteredWeight.length < 2 ? (
            <EmptyState text={`Brak danych wagi w tym okresie.\nLoguj wagę regularnie w zakładce Waga.`} />
          ) : (
            <>
              <div style={{ height: 140, position: 'relative' }}>
                <Sparkline w={500} h={140} fill data={filteredWeight} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums' }}>
                {[
                  { label: 'start',   value: weightFirst != null ? `${fmt(weightFirst)} kg` : '—', accent: false },
                  { label: 'obecnie', value: weightLast  != null ? `${fmt(weightLast)} kg`  : '—', accent: true  },
                  { label: 'zmiana',  value: weightDelta != null
                    ? `${weightDelta > 0 ? '+' : ''}${fmt(weightDelta)} kg`
                    : '—',
                    accent: weightDelta != null && weightDelta < 0,
                  },
                  { label: 'pomiarów', value: String(filteredWeight.length), accent: false },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 10, color: 'var(--lo-text-faint)' }}>{s.label}</div>
                    <div style={{ fontSize: 13, color: s.accent ? 'var(--lo-accent)' : 'var(--lo-text)' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Dziennik — nastrój w czasie ── */}
      {filteredScatter.length >= 2 && (
        <div style={{
          background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
          borderRadius: 12, padding: '18px 20px',
        }}>
          <SectionHeader eyebrow={`Nastrój · ${days}d`} title="Trend" />
          <div style={{ height: 80, position: 'relative' }}>
            <Sparkline w={1100} h={80} fill data={filteredScatter.map(p => p.mood)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-geist-mono)' }}>
            <span style={{ fontSize: 10, color: 'var(--lo-text-dim)' }}>{filteredScatter[0]?.date}</span>
            <span style={{ fontSize: 10, color: 'var(--lo-text-dim)' }}>
              śr. {fmt(filteredScatter.reduce((s, p) => s + p.mood, 0) / filteredScatter.length)}/5
            </span>
            <span style={{ fontSize: 10, color: 'var(--lo-text-dim)' }}>{filteredScatter[filteredScatter.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* ── Focus time ── */}
      {(() => {
        const filteredFocus = data.focusPoints.filter(p => p.date >= since);
        if (filteredFocus.length === 0) return null;
        const totalMin = filteredFocus.reduce((s, p) => s + p.minutes, 0);
        const avgMin = Math.round(totalMin / filteredFocus.length);
        const maxMin = Math.max(...filteredFocus.map(p => p.minutes));
        const fmtMin = (m: number) => m >= 60 ? `${Math.floor(m/60)}h ${m%60 ? (m%60)+'min' : ''}`.trim() : `${m}min`;
        return (
          <div style={{
            background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
            borderRadius: 12, padding: '18px 20px',
          }}>
            <SectionHeader eyebrow={`Focus · ${days}d`} title="Czas skupienia" />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 100, padding: '8px 0 0', marginBottom: 8 }}>
              {filteredFocus.map((p, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    title={`${p.date}: ${fmtMin(p.minutes)}`}
                    style={{
                      width: '100%', maxWidth: 20,
                      height: Math.max(2, (p.minutes / maxMin) * 90),
                      background: 'var(--lo-accent-soft)',
                      border: '1px solid var(--lo-accent-line)',
                      borderRadius: '3px 3px 0 0',
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
              <span style={{ color: 'var(--lo-text-faint)' }}>łącznie <span style={{ color: 'var(--lo-accent)' }}>{fmtMin(totalMin)}</span></span>
              <span style={{ color: 'var(--lo-text-faint)' }}>śr. {fmtMin(avgMin)} / sesję</span>
              <span style={{ color: 'var(--lo-text-faint)' }}>max {fmtMin(maxMin)}</span>
              <span style={{ color: 'var(--lo-text-faint)' }}>{filteredFocus.length} dni</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
