'use client';

import { useState, useTransition, useOptimistic, useCallback } from 'react';
import { Icon } from '@/components/primitives/icon';
import { upsertFocus, toggleHabitForDate } from '@/app/(shell)/daily/actions';
import type { DayData } from '@/app/(shell)/daily/actions';

// ─── helpers ────────────────────────────────────────────────────────────────

const PL_DAYS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];
const PL_MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

function formatDay(iso: string): { short: string; day: string; isToday: boolean } {
  const d = new Date(iso + 'T00:00:00');
  const today = new Date().toISOString().slice(0, 10);
  const dow = d.getDay();
  const dayIdx = (dow + 6) % 7;
  return {
    short: PL_DAYS[dayIdx],
    day: `${d.getDate()} ${PL_MONTHS[d.getMonth()]}`,
    isToday: iso === today,
  };
}

function fmtMinutes(m: number): string {
  if (m <= 0) return '—';
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}min`;
}

function moodColor(m: number | null): string {
  if (!m) return 'var(--lo-text-dim)';
  return m >= 4 ? 'var(--lo-accent)' : m === 3 ? 'var(--lo-text-faint)' : 'var(--lo-warn)';
}

// ─── FocusCell ───────────────────────────────────────────────────────────────

function FocusCell({ date, minutes }: { date: string; minutes: number }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(minutes || ''));
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useState(minutes);

  const save = () => {
    const parsed = parseInt(val, 10);
    const m = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setOptimistic(m);
    setEditing(false);
    start(() => upsertFocus(date, m));
  };

  if (editing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <input
          autoFocus
          type="number"
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          style={{
            width: 60, height: 28, textAlign: 'center',
            background: 'var(--lo-bg-2)', border: '1px solid var(--lo-accent-line)',
            borderRadius: 6, color: 'var(--lo-text)',
            fontFamily: 'var(--font-geist-mono)', fontSize: 12,
          }}
        />
        <span style={{ fontSize: 9, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>min</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setVal(optimistic > 0 ? String(optimistic) : ''); setEditing(true); }}
      title="Kliknij żeby edytować (minuty)"
      style={{
        width: '100%', height: 36,
        background: optimistic > 0 ? 'var(--lo-accent-soft)' : 'transparent',
        border: '1px solid ' + (optimistic > 0 ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
        borderRadius: 8,
        color: optimistic > 0 ? 'var(--lo-accent)' : 'var(--lo-text-dim)',
        fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
        fontSize: pending ? 10 : optimistic > 0 ? 11 : 12,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {pending ? '…' : fmtMinutes(optimistic)}
    </button>
  );
}

// ─── HabitCell ───────────────────────────────────────────────────────────────

function HabitCell({ habitId, date, done: initialDone }: { habitId: string; date: string; done: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(initialDone);
  const [, start] = useTransition();

  const toggle = () => {
    const next = !optimistic;
    start(async () => {
      setOptimistic(next);
      await toggleHabitForDate(habitId, date, next);
    });
  };

  return (
    <button
      onClick={toggle}
      style={{
        width: 32, height: 32, borderRadius: 8,
        border: '1px solid ' + (optimistic ? 'var(--lo-accent-line)' : 'var(--lo-border-strong)'),
        background: optimistic ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
        display: 'grid', placeItems: 'center',
        cursor: 'pointer', margin: '0 auto',
        transition: 'background .1s, border-color .1s',
      }}
    >
      {optimistic && <Icon name="check" size={13} style={{ color: 'var(--lo-accent)' }} />}
    </button>
  );
}

// ─── MetaCell ────────────────────────────────────────────────────────────────

function MetaCell({ value, unit, color }: { value: number | null; unit?: string; color?: string }) {
  if (value == null) return (
    <div style={{ textAlign: 'center', color: 'var(--lo-text-dim)', fontSize: 12 }}>—</div>
  );
  return (
    <div style={{ textAlign: 'center', fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 12, color: color ?? 'var(--lo-text-muted)' }}>
      {value}
      {unit && <span style={{ fontSize: 10, color: 'var(--lo-text-faint)', marginLeft: 2 }}>{unit}</span>}
    </div>
  );
}

// ─── WeekSummaryBar ───────────────────────────────────────────────────────────

function WeekSummaryBar({ week }: { week: DayData[] }) {
  const totalFocus = week.reduce((s, d) => s + d.focusMinutes, 0);
  const totalHabitSlots = week.reduce((s, d) => s + d.habits.length, 0);
  const totalHabitDone = week.reduce((s, d) => s + d.habits.filter(h => h.done).length, 0);
  const pct = totalHabitSlots > 0 ? Math.round((totalHabitDone / totalHabitSlots) * 100) : 0;
  const avgFocus = week.filter(d => d.focusMinutes > 0).length;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
    }}>
      {[
        { label: 'Focus łącznie', value: fmtMinutes(totalFocus), accent: totalFocus > 0 },
        { label: 'Focus dni', value: `${avgFocus}/7`, accent: false },
        { label: 'Nawyki %', value: `${pct}%`, accent: pct >= 70 },
        { label: 'Wykonane', value: `${totalHabitDone}/${totalHabitSlots}`, accent: false },
      ].map(s => (
        <div key={s.label} style={{
          background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
          borderRadius: 12, padding: '14px 18px',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div className="label-eyebrow">{s.label}</div>
          <div style={{
            fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
            fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em',
            color: s.accent ? 'var(--lo-accent)' : 'var(--lo-text)',
          }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── DailyScreen ─────────────────────────────────────────────────────────────

export function DailyScreen({
  initialWeek,
  weekOffset: initialOffset,
}: {
  initialWeek: DayData[];
  weekOffset: number;
}) {
  const [week, setWeek] = useState<DayData[]>(initialWeek);
  const [offset, setOffset] = useState(initialOffset);
  const [loading, startNav] = useTransition();

  const navigate = useCallback((delta: number) => {
    startNav(async () => {
      const { getWeekData } = await import('@/app/(shell)/daily/actions');
      const newOffset = offset + delta;
      const data = await getWeekData(newOffset);
      setWeek(data);
      setOffset(newOffset);
    });
  }, [offset]);

  const habits = week[0]?.habits.map(h => h.name) ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const weekLabel = (() => {
    const start = week[0]?.date;
    const end = week[6]?.date;
    if (!start || !end) return '';
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    return `${s.getDate()} ${PL_MONTHS[s.getMonth()]} — ${e.getDate()} ${PL_MONTHS[e.getMonth()]} ${e.getFullYear()}`;
  })();

  const COL_W = 100;
  const ROW_LABEL_W = 160;

  const cellStyle = (isToday: boolean): React.CSSProperties => ({
    width: COL_W, flexShrink: 0,
    padding: '0 8px',
    background: isToday ? 'color-mix(in oklch, var(--lo-accent) 4%, transparent)' : 'transparent',
    borderRight: '1px solid var(--lo-border)',
  });

  return (
    <div className="lo-screen" style={{
      padding: '20px 24px 40px',
      display: 'flex', flexDirection: 'column', gap: 16,
      maxWidth: 1280, margin: '0 auto', width: '100%',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="label-eyebrow">Przegląd tygodnia</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
            {weekLabel}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => navigate(-1)}
            disabled={loading}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
              color: 'var(--lo-text-muted)', display: 'grid', placeItems: 'center', cursor: 'pointer',
            }}
          >
            <Icon name="arrow-right" size={14} style={{ transform: 'rotate(180deg)' }} />
          </button>
          {offset !== 0 && (
            <button
              onClick={() => navigate(-offset)}
              disabled={loading}
              style={{
                height: 34, padding: '0 12px', borderRadius: 8,
                background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
                color: 'var(--lo-text-muted)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
              }}
            >Dziś</button>
          )}
          <button
            onClick={() => navigate(1)}
            disabled={loading || offset >= 0}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
              color: offset >= 0 ? 'var(--lo-text-dim)' : 'var(--lo-text-muted)',
              display: 'grid', placeItems: 'center', cursor: offset >= 0 ? 'default' : 'pointer',
              opacity: offset >= 0 ? 0.4 : 1,
            }}
          >
            <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <WeekSummaryBar week={week} />

      {/* Main table */}
      <div style={{
        background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
        borderRadius: 12, overflow: 'hidden',
      }}>

        {/* Column headers */}
        <div style={{
          display: 'flex', borderBottom: '1px solid var(--lo-border)',
          background: 'var(--lo-bg-2)',
        }}>
          {/* Label column */}
          <div style={{
            width: ROW_LABEL_W, flexShrink: 0,
            padding: '10px 16px',
            borderRight: '1px solid var(--lo-border)',
          }} className="label-eyebrow">
            Aktywność
          </div>
          {week.map(d => {
            const { short, day, isToday } = formatDay(d.date);
            return (
              <div key={d.date} style={{
                ...cellStyle(isToday),
                padding: '10px 8px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-geist-mono)', fontSize: 11,
                  fontWeight: isToday ? 600 : 400,
                  color: isToday ? 'var(--lo-accent)' : 'var(--lo-text-faint)',
                  letterSpacing: '.04em', textTransform: 'uppercase',
                }}>{short}</div>
                <div style={{
                  fontFamily: 'var(--font-geist-mono)', fontSize: 10,
                  color: isToday ? 'var(--lo-accent)' : 'var(--lo-text-dim)',
                  marginTop: 2,
                }}>{day}</div>
              </div>
            );
          })}
        </div>

        {/* Focus row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          borderBottom: '1px solid var(--lo-border)',
          background: 'var(--lo-surface)',
        }}>
          <div style={{
            width: ROW_LABEL_W, flexShrink: 0,
            padding: '10px 16px',
            borderRight: '1px solid var(--lo-border)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 450 }}>
              🌲 Focus
            </div>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: 'var(--lo-text-faint)', marginTop: 2 }}>
              minuty (np. z Forest)
            </div>
          </div>
          {week.map(d => {
            const { isToday } = formatDay(d.date);
            return (
              <div key={d.date} style={{ ...cellStyle(isToday), display: 'flex', alignItems: 'center', padding: '6px 8px' }}>
                <FocusCell date={d.date} minutes={d.focusMinutes} />
              </div>
            );
          })}
        </div>

        {/* Habit rows */}
        {habits.map((habitName, hi) => (
          <div key={habitName} style={{
            display: 'flex', alignItems: 'center',
            borderBottom: hi < habits.length - 1 ? '1px solid var(--lo-border)' : '1px solid var(--lo-border)',
            background: hi % 2 === 0 ? 'var(--lo-surface)' : 'var(--lo-bg)',
          }}>
            <div style={{
              width: ROW_LABEL_W, flexShrink: 0,
              padding: '10px 16px',
              borderRight: '1px solid var(--lo-border)',
              fontSize: 13,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {habitName}
            </div>
            {week.map(d => {
              const { isToday } = formatDay(d.date);
              const habit = d.habits[hi];
              if (!habit) return <div key={d.date} style={cellStyle(isToday)} />;
              return (
                <div key={d.date} style={{ ...cellStyle(isToday), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                  <HabitCell habitId={habit.id} date={d.date} done={habit.done} />
                </div>
              );
            })}
          </div>
        ))}

        {/* Separator */}
        <div style={{ borderBottom: '2px solid var(--lo-border)' }} />

        {/* Sleep row */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--lo-border)', background: 'var(--lo-bg)' }}>
          <div style={{
            width: ROW_LABEL_W, flexShrink: 0, padding: '10px 16px',
            borderRight: '1px solid var(--lo-border)',
            fontSize: 13, color: 'var(--lo-text-muted)',
          }}>Sen</div>
          {week.map(d => {
            const { isToday } = formatDay(d.date);
            return (
              <div key={d.date} style={{ ...cellStyle(isToday), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 8px' }}>
                <MetaCell value={d.sleepHours} unit="h" color={d.sleepHours && d.sleepHours >= 7 ? 'var(--lo-accent)' : undefined} />
              </div>
            );
          })}
        </div>

        {/* Weight row */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--lo-border)', background: 'var(--lo-bg)' }}>
          <div style={{
            width: ROW_LABEL_W, flexShrink: 0, padding: '10px 16px',
            borderRight: '1px solid var(--lo-border)',
            fontSize: 13, color: 'var(--lo-text-muted)',
          }}>Waga</div>
          {week.map(d => {
            const { isToday } = formatDay(d.date);
            return (
              <div key={d.date} style={{ ...cellStyle(isToday), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 8px' }}>
                <MetaCell value={d.weightKg} unit="kg" />
              </div>
            );
          })}
        </div>

        {/* Mood row */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--lo-bg)' }}>
          <div style={{
            width: ROW_LABEL_W, flexShrink: 0, padding: '10px 16px',
            borderRight: '1px solid var(--lo-border)',
            fontSize: 13, color: 'var(--lo-text-muted)',
          }}>Nastrój</div>
          {week.map(d => {
            const { isToday } = formatDay(d.date);
            return (
              <div key={d.date} style={{ ...cellStyle(isToday), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 8px' }}>
                {d.mood != null ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: moodColor(d.mood), display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 12, color: moodColor(d.mood) }}>{d.mood}/5</span>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--lo-text-dim)', fontSize: 12 }}>—</div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, padding: '4px 0' }}>
        <span style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>
          Focus — kliknij komórkę, wpisz minuty (Enter lub klik poza)
        </span>
        <span style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>
          Sen/Waga/Nastrój — pobierane z dziennika i logów
        </span>
      </div>
    </div>
  );
}
