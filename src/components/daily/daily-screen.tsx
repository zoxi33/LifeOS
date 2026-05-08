'use client';

import React, { useState, useTransition, useOptimistic, useCallback, useRef, useEffect } from 'react';
import { Icon } from '@/components/primitives/icon';
import {
  upsertFocus, upsertWork, toggleHabitForDate, toggleChecklistItem,
  addChecklistItem, deleteChecklistItem, toggleStreakFlag, getWeekData,
  reorderChecklistItems, setWaterForDate,
} from '@/app/(shell)/daily/actions';
import { logHabitValue } from '@/app/(shell)/habits/actions';
import { streakBreakPenalty, nextStreakMilestone } from '@/lib/streak-utils';
import { StreaksSection } from '@/components/streaks/streaks-section';
import { fmtWaterShort } from '@/lib/water-utils';
import type { DayData, ChecklistItemDef } from '@/app/(shell)/daily/actions';
import type { StreakTracker } from '@/app/(shell)/streaks/actions';

// ─── constants & helpers ─────────────────────────────────────────────────────

const PL_DAYS_LONG  = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
const PL_DAYS_SHORT = ['Nd', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
const PL_MONTHS       = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
const PL_MONTHS_SHORT = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];

function todayIso(): string { return new Date().toISOString().slice(0, 10); }

function parseDateLocal(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return { d, dow: d.getDay(), day: d.getDate(), month: d.getMonth() };
}

function fmtMinutes(m: number): string {
  if (!m) return '—';
  const h = Math.floor(m / 60), min = m % 60;
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}min`;
}

function moodEmoji(m: number | null) {
  if (!m) return '—';
  return ['', '😞', '😕', '😐', '🙂', '😄'][m] ?? '—';
}

function isTimeUnit(unit: string): boolean {
  return /^(min|minut[ay]?|godzin[ay]?|h|hr)$/i.test(unit.trim());
}

function fmtHabitValue(value: number, unit: string): string {
  if (isTimeUnit(unit)) {
    const h = Math.floor(value / 60), m = value % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  }
  return `${value} ${unit}`;
}

// ─── HabitChip ───────────────────────────────────────────────────────────────

function HabitChip({ habitId, date, name, done: init }: {
  habitId: string; date: string; name: string; done: boolean;
}) {
  const [done, setDone] = useOptimistic(init);
  const [, start] = useTransition();
  const toggle = () => start(async () => { setDone(!done); await toggleHabitForDate(habitId, date, !done); });
  return (
    <button onClick={toggle} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      height: 38, padding: '0 14px',
      background: done ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
      border: '1px solid ' + (done ? 'var(--lo-accent-line)' : 'var(--lo-border-strong)'),
      borderRadius: 999, color: done ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
      fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
      transition: 'background .1s, color .1s, border-color .1s',
    }}>
      {done && <Icon name="check" size={12} style={{ color: 'var(--lo-accent)', flexShrink: 0 }} />}
      <span style={{ fontWeight: done ? 500 : 400 }}>{name}</span>
    </button>
  );
}

// ─── StreakCard ───────────────────────────────────────────────────────────────

function StreakCard({ itemId, date, name, done: init, streakCount, onUnmark }: {
  itemId: string; date: string; name: string; done: boolean;
  streakCount: number; onUnmark: () => void;
}) {
  const [done, setDone] = useOptimistic(init);
  const [, start] = useTransition();
  const toggle = () => start(async () => { setDone(!done); await toggleChecklistItem(date, itemId, !done); });

  const displayStreak = done ? Math.max(streakCount, 1) : streakCount;
  const penalty       = streakBreakPenalty(displayStreak);
  const milestone     = nextStreakMilestone(displayStreak);
  const daysToMilestone = milestone ? milestone.days - displayStreak : null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      padding: '16px 18px', minWidth: 175, maxWidth: 215,
      background: done
        ? 'color-mix(in oklch, var(--lo-warn) 12%, transparent)'
        : displayStreak > 0
          ? 'color-mix(in oklch, var(--lo-warn) 6%, transparent)'
          : 'var(--lo-surface-2)',
      border: '1px solid ' + (done
        ? 'var(--lo-warn)'
        : displayStreak > 0
          ? 'color-mix(in oklch, var(--lo-warn) 40%, transparent)'
          : 'var(--lo-border-strong)'),
      borderRadius: 12,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: done ? 'var(--lo-warn)' : 'var(--lo-text-muted)', lineHeight: 1.2 }}>
          {name}
        </span>
        <button onClick={onUnmark} title="Usuń z sekcji streakow" style={{
          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
          background: 'transparent', border: '1px solid transparent',
          color: 'var(--lo-text-dim)', display: 'grid', placeItems: 'center', cursor: 'pointer',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--lo-border)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--lo-surface)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        ><Icon name="x" size={10} /></button>
      </div>

      {/* Streak counter */}
      <div style={{ textAlign: 'center', padding: '2px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
          {displayStreak > 0 && <span style={{ fontSize: 16 }}>🔥</span>}
          <span style={{
            fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
            fontSize: 52, fontWeight: 700, lineHeight: 1,
            color: displayStreak > 0 ? 'var(--lo-warn)' : 'var(--lo-text-dim)',
          }}>{displayStreak}</span>
        </div>
        <div style={{
          fontFamily: 'var(--font-geist-mono)', fontSize: 10,
          color: 'var(--lo-text-faint)', letterSpacing: '.06em',
          textTransform: 'uppercase', marginTop: 4,
        }}>
          {displayStreak === 1 ? 'dzień z rzędu' : 'dni z rzędu'}
        </div>
      </div>

      {/* Penalty + milestone row */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 4,
        padding: '8px 10px',
        background: 'color-mix(in oklch, var(--lo-bg) 60%, transparent)',
        borderRadius: 8, border: '1px solid color-mix(in oklch, var(--lo-border) 60%, transparent)',
      }}>
        {displayStreak > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>Kara za reset</span>
            <span style={{
              fontSize: 12, fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
              fontWeight: 600, color: 'var(--lo-danger)',
            }}>−{penalty} XP</span>
          </div>
        )}
        {milestone && daysToMilestone !== null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>
              Za {daysToMilestone}d milestone
            </span>
            <span style={{
              fontSize: 12, fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
              fontWeight: 600, color: 'var(--lo-accent)',
            }}>+{milestone.bonus} XP</span>
          </div>
        )}
        {!milestone && (
          <div style={{ fontSize: 11, color: 'var(--lo-warn)', fontFamily: 'var(--font-geist-mono)', textAlign: 'center' }}>
            🏆 Legendarny streak!
          </div>
        )}
      </div>

      {/* Toggle today */}
      <button onClick={toggle} style={{
        height: 34,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        background: done ? 'color-mix(in oklch, var(--lo-warn) 18%, transparent)' : 'var(--lo-bg-2)',
        color: done ? 'var(--lo-warn)' : 'var(--lo-text-muted)',
        border: '1px solid ' + (done ? 'var(--lo-warn)' : 'var(--lo-border)'),
        borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', fontWeight: done ? 500 : 400,
      }}>
        {done ? <><Icon name="check" size={12} /> Dziś ✓</> : 'Oznacz dziś'}
      </button>
    </div>
  );
}

// ─── ChecklistChip ────────────────────────────────────────────────────────────

function ChecklistChip({ itemId, date, name, done: init, onDelete, onMarkStreak }: {
  itemId: string; date: string; name: string; done: boolean;
  onDelete?: () => void; onMarkStreak?: () => void;
}) {
  const [done, setDone] = useOptimistic(init);
  const [hover, setHover] = useState(false);
  const [, start] = useTransition();
  const toggle = () => start(async () => { setDone(!done); await toggleChecklistItem(date, itemId, !done); });

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button onClick={toggle} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        height: 38, padding: '0 14px',
        paddingRight: hover && (onDelete || onMarkStreak) ? 62 : 14,
        background: done ? 'color-mix(in oklch, var(--lo-info) 10%, transparent)' : 'var(--lo-surface-2)',
        border: '1px solid ' + (done ? 'color-mix(in oklch, var(--lo-info) 35%, transparent)' : 'var(--lo-border-strong)'),
        borderRadius: 999, color: done ? 'var(--lo-info)' : 'var(--lo-text-muted)',
        fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
        transition: 'background .1s, color .1s',
      }}>
        {done && <Icon name="check" size={12} style={{ color: 'var(--lo-info)', flexShrink: 0 }} />}
        <span style={{ fontWeight: done ? 500 : 400 }}>{name}</span>
      </button>

      {/* Hover actions */}
      {hover && (
        <div style={{
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
          display: 'flex', gap: 3,
        }}>
          {onMarkStreak && (
            <button
              onClick={onMarkStreak}
              title="Dodaj jako streak"
              style={{
                width: 22, height: 22, borderRadius: 6,
                background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
                color: 'var(--lo-warn)', display: 'grid', placeItems: 'center', cursor: 'pointer',
                fontSize: 12,
              }}
            >🔥</button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              style={{
                width: 22, height: 22, borderRadius: 6,
                background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
                color: 'var(--lo-text-dim)', display: 'grid', placeItems: 'center', cursor: 'pointer',
              }}
            >
              <Icon name="x" size={10} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FocusInput ───────────────────────────────────────────────────────────────

function FocusInput({ date, minutes: init, onSaved }: { date: string; minutes: number; onSaved?: (m: number) => void }) {
  const h = Math.floor(init / 60), m = init % 60;
  const [hours, setHours] = useState(h > 0 ? String(h) : '');
  const [mins, setMins] = useState(m > 0 ? String(m) : '');
  const [saved, setSaved] = useState(false);
  const [, start] = useTransition();

  const total = (parseInt(hours || '0') * 60) + parseInt(mins || '0');
  const hasValue = total > 0;

  const save = () => {
    const t = Math.max(0, total);
    start(async () => { await upsertFocus(date, t); setSaved(true); onSaved?.(t); setTimeout(() => setSaved(false), 1500); });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="number" min={0} max={23} placeholder="0" value={hours}
          onChange={e => { setHours(e.target.value); setSaved(false); }}
          onKeyDown={e => e.key === 'Enter' && save()}
          style={{ width: 52, height: 36, textAlign: 'center', background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', borderRadius: 8, color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 14 }} />
        <span style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>h</span>
        <input type="number" min={0} max={59} placeholder="0" value={mins}
          onChange={e => { setMins(e.target.value); setSaved(false); }}
          onKeyDown={e => e.key === 'Enter' && save()}
          style={{ width: 52, height: 36, textAlign: 'center', background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', borderRadius: 8, color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 14 }} />
        <span style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>min</span>
      </div>
      {hasValue && <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 12, color: 'var(--lo-accent)' }}>= {fmtMinutes(total)}</span>}
      <button onClick={save} disabled={!hasValue && init === 0} style={{
        height: 34, padding: '0 14px',
        background: saved ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
        color: saved ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
        border: '1px solid ' + (saved ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
        borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
      }}>{saved ? '✓ Zapisano' : 'Zapisz'}</button>
    </div>
  );
}

// ─── WorkInput ────────────────────────────────────────────────────────────────

function WorkInput({ date, minutes: init, onSaved }: { date: string; minutes: number; onSaved?: (m: number) => void }) {
  const h = Math.floor(init / 60), m = init % 60;
  const [hours, setHours] = useState(h > 0 ? String(h) : '');
  const [mins, setMins] = useState(m > 0 ? String(m) : '');
  const [saved, setSaved] = useState(false);
  const [, start] = useTransition();

  const total = (parseInt(hours || '0') * 60) + parseInt(mins || '0');
  const hasValue = total > 0;

  const save = () => {
    const t = Math.max(0, total);
    start(async () => { await upsertWork(date, t); setSaved(true); onSaved?.(t); setTimeout(() => setSaved(false), 1500); });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="number" min={0} max={23} placeholder="0" value={hours}
          onChange={e => { setHours(e.target.value); setSaved(false); }}
          onKeyDown={e => e.key === 'Enter' && save()}
          style={{ width: 52, height: 36, textAlign: 'center', background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', borderRadius: 8, color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 14 }} />
        <span style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>h</span>
        <input type="number" min={0} max={59} placeholder="0" value={mins}
          onChange={e => { setMins(e.target.value); setSaved(false); }}
          onKeyDown={e => e.key === 'Enter' && save()}
          style={{ width: 52, height: 36, textAlign: 'center', background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', borderRadius: 8, color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 14 }} />
        <span style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>min</span>
      </div>
      {hasValue && <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 12, color: 'var(--lo-info)' }}>= {fmtMinutes(total)}</span>}
      <button onClick={save} disabled={!hasValue && init === 0} style={{
        height: 34, padding: '0 14px',
        background: saved ? 'color-mix(in oklch, var(--lo-info) 10%, transparent)' : 'var(--lo-surface-2)',
        color: saved ? 'var(--lo-info)' : 'var(--lo-text-muted)',
        border: '1px solid ' + (saved ? 'color-mix(in oklch, var(--lo-info) 35%, transparent)' : 'var(--lo-border)'),
        borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
      }}>{saved ? '✓ Zapisano' : 'Zapisz'}</button>
    </div>
  );
}

// ─── AddChecklistForm ─────────────────────────────────────────────────────────

function AddChecklistForm({ onAdded }: { onAdded: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState('');
  const [, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const name = val.trim();
    if (!name) return;
    start(async () => { await addChecklistItem(name); onAdded(name); });
    setVal(''); setOpen(false);
  };

  if (!open) return (
    <button onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 38, padding: '0 14px',
      background: 'transparent', color: 'var(--lo-text-dim)',
      border: '1px dashed var(--lo-border)', borderRadius: 999,
      fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
    }}>
      <Icon name="plus" size={12} /> Dodaj element
    </button>
  );

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <input ref={inputRef} value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setOpen(false); setVal(''); } }}
        placeholder="Nazwa elementu…"
        style={{ height: 36, padding: '0 12px', width: 200, background: 'var(--lo-bg-2)', border: '1px solid var(--lo-accent-line)', borderRadius: 8, color: 'var(--lo-text)', fontSize: 13, fontFamily: 'inherit' }}
      />
      <button onClick={submit} style={{ height: 36, padding: '0 12px', background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)', border: '1px solid var(--lo-accent-line)', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}>Dodaj</button>
      <button onClick={() => { setOpen(false); setVal(''); }} style={{ height: 36, padding: '0 10px', background: 'transparent', color: 'var(--lo-text-dim)', border: '1px solid transparent', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}>✕</button>
    </div>
  );
}

// ─── TodaySection ─────────────────────────────────────────────────────────────

function TodaySection({
  day, streakCounts, onChecklistDelete, onStreakToggle, onChecklistReorder,
}: {
  day: DayData;
  streakCounts: Record<string, number>;
  onChecklistDelete: (id: string) => void;
  onStreakToggle: (id: string, isStreak: boolean) => void;
  onChecklistReorder: (newOrder: { id: string; name: string; done: boolean; isStreak: boolean }[]) => void;
}) {
  const { dow, day: dayNum, month } = parseDateLocal(day.date);
  const [, start] = useTransition();
  const [manageMode, setManageMode] = useState(false);

  const streakItems  = day.checklist.filter(i => i.isStreak);
  const regularItems = day.checklist.filter(i => !i.isStreak);

  const handleDeleteChecklist = (id: string) => {
    start(async () => { await deleteChecklistItem(id); onChecklistDelete(id); });
  };

  const handleMarkStreak = (id: string) => {
    start(async () => { await toggleStreakFlag(id, true); onStreakToggle(id, true); });
  };

  const handleUnmarkStreak = (id: string) => {
    start(async () => { await toggleStreakFlag(id, false); onStreakToggle(id, false); });
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const newItems = [...regularItems];
    const target = idx + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    const fullChecklist = [...streakItems, ...newItems];
    onChecklistReorder(fullChecklist);
    start(async () => { await reorderChecklistItems(fullChecklist.map(i => i.id)); });
  };

  return (
    <div style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 14, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 14px', borderBottom: '1px solid var(--lo-border)',
        background: 'var(--lo-bg-2)', display: 'flex', alignItems: 'baseline', gap: 10,
      }}>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>{PL_DAYS_LONG[dow]}</div>
        <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 12, color: 'var(--lo-text-faint)' }}>
          {dayNum} {PL_MONTHS[month]}
        </div>
        <div style={{
          marginLeft: 'auto', display: 'inline-flex', alignItems: 'center',
          height: 22, padding: '0 8px',
          background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
          border: '1px solid var(--lo-accent-line)', borderRadius: 999,
          fontFamily: 'var(--font-geist-mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '.04em', textTransform: 'uppercase',
        }}>Dziś</div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Streaki */}
        {streakItems.length > 0 && (
          <div>
            <div className="label-eyebrow" style={{ marginBottom: 12 }}>
              🔥 Streaki
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {streakItems.map(item => (
                <StreakCard
                  key={item.id}
                  itemId={item.id}
                  date={day.date}
                  name={item.name}
                  done={item.done}
                  streakCount={streakCounts[item.id] ?? 0}
                  onUnmark={() => handleUnmarkStreak(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Nawyki */}
        <div>
          <div className="label-eyebrow" style={{ marginBottom: 10 }}>Nawyki</div>
          {day.habits.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--lo-text-muted)' }}>Brak nawyków — dodaj w zakładce Nawyki.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {day.habits.map(h => (
                <HabitChip key={h.id} habitId={h.id} date={day.date} name={h.name} done={h.done} />
              ))}
            </div>
          )}
        </div>

        {/* Focus */}
        <div>
          <div className="label-eyebrow" style={{ marginBottom: 10 }}>🌲 Focus (np. Forest)</div>
          <FocusInput date={day.date} minutes={day.focusMinutes} />
        </div>

        {/* Work */}
        <div>
          <div className="label-eyebrow" style={{ marginBottom: 10 }}>💼 Godziny pracy</div>
          <WorkInput date={day.date} minutes={day.workMinutes} />
        </div>

        {/* Śledzenie */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="label-eyebrow">Śledzenie</div>
            {regularItems.length > 1 && (
              <button
                onClick={() => setManageMode(m => !m)}
                style={{
                  height: 22, padding: '0 8px',
                  background: manageMode ? 'var(--lo-accent-soft)' : 'transparent',
                  color: manageMode ? 'var(--lo-accent)' : 'var(--lo-text-dim)',
                  border: '1px solid ' + (manageMode ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
                  borderRadius: 5, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
                }}
              >
                {manageMode ? 'Gotowe' : 'Kolejność'}
              </button>
            )}
          </div>
          {manageMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {regularItems.map((item, idx) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px',
                  background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
                  borderRadius: 8,
                }}>
                  <div style={{ flex: 1, fontSize: 13 }}>{item.name}</div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    <button
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, -1)}
                      style={{
                        display: 'grid', placeItems: 'center',
                        width: 26, height: 26, borderRadius: 5,
                        background: 'transparent', border: 'none',
                        color: idx === 0 ? 'var(--lo-text-dim)' : 'var(--lo-text-muted)',
                        cursor: idx === 0 ? 'default' : 'pointer',
                      }}
                    >
                      <Icon name="arrow-up" size={12} />
                    </button>
                    <button
                      disabled={idx === regularItems.length - 1}
                      onClick={() => moveItem(idx, 1)}
                      style={{
                        display: 'grid', placeItems: 'center',
                        width: 26, height: 26, borderRadius: 5,
                        background: 'transparent', border: 'none',
                        color: idx === regularItems.length - 1 ? 'var(--lo-text-dim)' : 'var(--lo-text-muted)',
                        cursor: idx === regularItems.length - 1 ? 'default' : 'pointer',
                      }}
                    >
                      <Icon name="arrow-down" size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteChecklist(item.id)}
                      style={{
                        display: 'grid', placeItems: 'center',
                        width: 26, height: 26, borderRadius: 5,
                        background: 'transparent', border: 'none',
                        color: 'var(--lo-text-dim)', cursor: 'pointer',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-danger)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-text-dim)'; }}
                    >
                      <Icon name="trash" size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {regularItems.map(item => (
                <ChecklistChip
                  key={item.id}
                  itemId={item.id}
                  date={day.date}
                  name={item.name}
                  done={item.done}
                  onDelete={() => handleDeleteChecklist(item.id)}
                  onMarkStreak={() => handleMarkStreak(item.id)}
                />
              ))}
              <AddChecklistForm onAdded={() => {}} />
            </div>
          )}
          {regularItems.length === 0 && !manageMode && (
            <div style={{ fontSize: 12, color: 'var(--lo-text-dim)', marginTop: 6 }}>
              Dodaj własne elementy do śledzenia. Kliknij 🔥 na chipie aby oznaczyć jako streak.
            </div>
          )}
        </div>

        {/* Meta row */}
        <div style={{
          display: 'flex', gap: 24, paddingTop: 14,
          borderTop: '1px solid var(--lo-border)',
          fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
        }}>
          {[
            { label: 'Sen',    value: day.sleepHours != null ? `${day.sleepHours}h` : '—', accent: day.sleepHours != null && day.sleepHours >= 7 },
            { label: 'Waga',   value: day.weightKg  != null ? `${day.weightKg}kg`  : '—', accent: false },
            { label: 'Nastrój',value: `${moodEmoji(day.mood)}${day.mood != null ? ` ${day.mood}/5` : ''}`, accent: false },
            { label: 'Nawyki', value: `${day.habits.filter(h => h.done).length}/${day.habits.length}`, accent: day.habits.length > 0 && day.habits.every(h => h.done) },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 14, color: s.accent ? 'var(--lo-accent)' : 'var(--lo-text)' }}>{s.value || '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HabitValueEditor ────────────────────────────────────────────────────────

function HabitValueEditor({ habitId, date, unit, value: initValue, onSaved }: {
  habitId: string; date: string; unit: string; value: number | null;
  onSaved: (v: number | null) => void;
}) {
  const isTime = isTimeUnit(unit);
  const initH = isTime && initValue ? Math.floor(initValue / 60) : 0;
  const initM = isTime && initValue ? initValue % 60 : 0;
  const [hours, setHours] = useState(initH > 0 ? String(initH) : '');
  const [mins, setMins] = useState(initM > 0 ? String(initM) : '');
  const [numVal, setNumVal] = useState(!isTime && initValue != null ? String(initValue) : '');
  const [saved, setSaved] = useState(false);
  const [, start] = useTransition();

  const total = isTime
    ? (parseInt(hours || '0') * 60) + parseInt(mins || '0')
    : parseFloat(numVal || '0') || 0;

  const save = () => {
    const v = total > 0 ? total : null;
    start(async () => {
      await logHabitValue(habitId, date, v);
      setSaved(true);
      onSaved(v);
      setTimeout(() => setSaved(false), 1500);
    });
  };

  const btnStyle: React.CSSProperties = {
    height: 34, padding: '0 14px',
    background: saved ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
    color: saved ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
    border: '1px solid ' + (saved ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
    borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
  };

  const inputStyle: React.CSSProperties = {
    height: 36, textAlign: 'center', background: 'var(--lo-bg-2)',
    border: '1px solid var(--lo-border)', borderRadius: 8, color: 'var(--lo-text)',
    fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 14,
  };

  if (isTime) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="number" min={0} max={23} placeholder="0" value={hours}
            onChange={e => setHours(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()}
            style={{ ...inputStyle, width: 52 }} />
          <span style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>h</span>
          <input type="number" min={0} max={59} placeholder="0" value={mins}
            onChange={e => setMins(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()}
            style={{ ...inputStyle, width: 52 }} />
          <span style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>min</span>
        </div>
        {total > 0 && <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 12, color: 'var(--lo-accent)' }}>= {fmtMinutes(total)}</span>}
        <button onClick={save} style={btnStyle}>{saved ? '✓ Zapisano' : 'Zapisz'}</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input type="number" min={0} placeholder="0" value={numVal}
        onChange={e => setNumVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()}
        style={{ ...inputStyle, width: 80 }} />
      <span style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>{unit}</span>
      <button onClick={save} style={btnStyle}>{saved ? '✓ Zapisano' : 'Zapisz'}</button>
    </div>
  );
}

// ─── WaterInlineEditor ───────────────────────────────────────────────────────

function WaterInlineEditor({ date, ml, targetMl, onChange }: {
  date: string; ml: number; targetMl: number; onChange: (ml: number) => void;
}) {
  const [, start] = useTransition();
  const adjust = (amount: number) => {
    const next = Math.max(0, ml + amount);
    onChange(next);
    start(async () => { await setWaterForDate(date, next, targetMl); });
  };
  const pct = Math.min(100, Math.round((ml / targetMl) * 100));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 14, fontWeight: 500 }}>
          {fmtWaterShort(ml)} <span style={{ color: 'var(--lo-text-faint)', fontWeight: 400 }}>/ {fmtWaterShort(targetMl)}</span>
        </span>
        <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 12, color: pct >= 100 ? 'var(--lo-info)' : 'var(--lo-text-muted)' }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: 'var(--lo-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--lo-info)', borderRadius: 99, transition: 'width .2s' }} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[250, 500, 750].map(amt => (
          <button key={amt} onClick={() => adjust(amt)} style={{
            height: 32, padding: '0 12px', borderRadius: 8,
            background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
            color: 'var(--lo-info)', fontFamily: 'var(--font-geist-mono)', fontSize: 12, cursor: 'pointer',
          }}>+{amt}ml</button>
        ))}
        {ml > 0 && (
          <button onClick={() => adjust(-250)} style={{
            height: 32, padding: '0 12px', borderRadius: 8,
            background: 'transparent', border: '1px solid var(--lo-border)',
            color: 'var(--lo-text-dim)', fontFamily: 'var(--font-geist-mono)', fontSize: 12, cursor: 'pointer',
          }}>−250ml</button>
        )}
      </div>
    </div>
  );
}

// ─── WeekDayDetail ────────────────────────────────────────────────────────────

function WeekDayDetail({ day: initialDay, streakCounts, onChecklistDelete, onStreakToggle }: {
  day: DayData;
  streakCounts: Record<string, number>;
  onChecklistDelete: (id: string) => void;
  onStreakToggle: (id: string, isStreak: boolean) => void;
}) {
  const [habits, setHabits] = useState(initialDay.habits);
  const [checklist, setChecklist] = useState(initialDay.checklist);
  const [focusMin, setFocusMin] = useState(initialDay.focusMinutes);
  const [workMin, setWorkMin] = useState(initialDay.workMinutes);
  const [waterMl, setWaterMl] = useState(initialDay.waterMl);
  const [habitValues, setHabitValues] = useState<Record<string, number | null>>(
    Object.fromEntries(initialDay.habits.map(h => [h.id, h.value ?? null]))
  );
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [manageMode, setManageMode] = useState(false);
  const [, start] = useTransition();
  const today = todayIso();
  const isToday = initialDay.date === today;

  useEffect(() => {
    setHabits(initialDay.habits);
    setChecklist(initialDay.checklist);
    setFocusMin(initialDay.focusMinutes);
    setWorkMin(initialDay.workMinutes);
    setWaterMl(initialDay.waterMl);
    setHabitValues(Object.fromEntries(initialDay.habits.map(h => [h.id, h.value ?? null])));
    setActiveCell(null);
    setManageMode(false);
  }, [initialDay.date]);

  const toggleHabit = (habitId: string) => {
    const h = habits.find(h => h.id === habitId);
    if (!h) return;
    const next = !h.done;
    setHabits(prev => prev.map(x => x.id === habitId ? { ...x, done: next } : x));
    start(async () => { await toggleHabitForDate(habitId, initialDay.date, next); });
  };

  const toggleCl = (itemId: string) => {
    const item = checklist.find(i => i.id === itemId);
    if (!item) return;
    const next = !item.done;
    setChecklist(prev => prev.map(i => i.id === itemId ? { ...i, done: next } : i));
    start(async () => { await toggleChecklistItem(initialDay.date, itemId, next); });
  };

  const deleteCl = (id: string) => {
    setChecklist(prev => prev.filter(i => i.id !== id));
    start(async () => { await deleteChecklistItem(id); onChecklistDelete(id); });
  };

  const markStreak = (id: string) => {
    setChecklist(prev => prev.map(i => i.id === id ? { ...i, isStreak: true } : i));
    start(async () => { await toggleStreakFlag(id, true); onStreakToggle(id, true); });
  };

  const unmarkStreak = (id: string) => {
    setChecklist(prev => prev.map(i => i.id === id ? { ...i, isStreak: false } : i));
    start(async () => { await toggleStreakFlag(id, false); onStreakToggle(id, false); });
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const regular = checklist.filter(i => !i.isStreak);
    const newRegular = [...regular];
    const target = idx + dir;
    if (target < 0 || target >= newRegular.length) return;
    [newRegular[idx], newRegular[target]] = [newRegular[target], newRegular[idx]];
    const streakItems = checklist.filter(i => i.isStreak);
    const full = [...streakItems, ...newRegular];
    setChecklist(full);
    start(async () => { await reorderChecklistItems(full.map(i => i.id)); });
  };

  const streakItems  = checklist.filter(i => i.isStreak);
  const regularItems = checklist.filter(i => !i.isStreak);
  const doneDone = habits.filter(h => h.done).length;

  const btnCell = (bg: string, border: string, active?: boolean): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    padding: '14px 12px', background: active ? 'color-mix(in oklch, ' + bg + ' 80%, var(--lo-bg))' : bg,
    border: '2px solid ' + (active ? 'var(--lo-accent)' : border),
    borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
    transition: 'opacity .1s, border-color .1s',
  });

  const staticCell = (bg: string, border: string): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    padding: '14px 12px', background: bg,
    border: '1px solid ' + border, borderRadius: 10,
  });

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10, padding: '2px 0 8px' }}>

        {/* Focus — clickable */}
        <button onClick={() => setActiveCell(activeCell === 'focus' ? null : 'focus')} style={btnCell(
          focusMin > 0 ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
          focusMin > 0 ? 'var(--lo-accent-line)' : 'var(--lo-border)',
          activeCell === 'focus',
        )}>
          <div style={{ fontSize: 18 }}>🌲</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500, color: focusMin > 0 ? 'var(--lo-accent)' : 'var(--lo-text-dim)' }}>{fmtMinutes(focusMin)}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>focus</div>
        </button>

        {/* Work — clickable */}
        <button onClick={() => setActiveCell(activeCell === 'work' ? null : 'work')} style={btnCell(
          workMin > 0 ? 'color-mix(in oklch, var(--lo-info) 10%, transparent)' : 'var(--lo-surface-2)',
          workMin > 0 ? 'color-mix(in oklch, var(--lo-info) 35%, transparent)' : 'var(--lo-border)',
          activeCell === 'work',
        )}>
          <div style={{ fontSize: 18 }}>💼</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500, color: workMin > 0 ? 'var(--lo-info)' : 'var(--lo-text-dim)' }}>{fmtMinutes(workMin)}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>praca</div>
        </button>

        {/* Water — clickable */}
        <button onClick={() => setActiveCell(activeCell === 'water' ? null : 'water')} style={btnCell(
          waterMl >= initialDay.waterTargetMl ? 'color-mix(in oklch, var(--lo-info) 10%, transparent)' : 'var(--lo-surface-2)',
          waterMl >= initialDay.waterTargetMl ? 'color-mix(in oklch, var(--lo-info) 35%, transparent)' : 'var(--lo-border)',
          activeCell === 'water',
        )}>
          <div style={{ fontSize: 18 }}>💧</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500, color: waterMl >= initialDay.waterTargetMl ? 'var(--lo-info)' : waterMl > 0 ? 'var(--lo-text-muted)' : 'var(--lo-text-dim)' }}>{fmtWaterShort(waterMl)}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>woda</div>
        </button>

        {/* Streak items — toggleable */}
        {streakItems.map(item => (
          <button key={item.id} onClick={() => toggleCl(item.id)} style={btnCell(
            item.done ? 'color-mix(in oklch, var(--lo-warn) 14%, transparent)' : streakCounts[item.id] > 0 ? 'color-mix(in oklch, var(--lo-warn) 6%, transparent)' : 'var(--lo-surface-2)',
            item.done ? 'var(--lo-warn)' : streakCounts[item.id] > 0 ? 'color-mix(in oklch, var(--lo-warn) 35%, transparent)' : 'var(--lo-border)',
          )}>
            <div style={{ fontSize: 16 }}>{item.done ? '🔥' : '○'}</div>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 18, fontWeight: 700, lineHeight: 1, color: item.done ? 'var(--lo-warn)' : 'var(--lo-text-dim)' }}>{streakCounts[item.id] ?? 0}</div>
            <div style={{ fontSize: 10, color: item.done ? 'var(--lo-warn)' : 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)', textAlign: 'center', lineHeight: 1.2 }}>{item.name}</div>
            {isToday && (
              <button onClick={e => { e.stopPropagation(); unmarkStreak(item.id); }} title="Usuń ze streakow" style={{ marginTop: 2, fontSize: 9, color: 'var(--lo-text-dim)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>✕ streak</button>
            )}
          </button>
        ))}

        {/* Habit cells */}
        {habits.map(h => {
          const hasUnit = !!h.unit;
          const val = habitValues[h.id] ?? null;
          const isOpen = activeCell === h.id;
          const handleClick = () => {
            if (hasUnit) setActiveCell(isOpen ? null : h.id);
            else toggleHabit(h.id);
          };
          return (
            <button key={h.id} onClick={handleClick} style={btnCell(
              h.done ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
              h.done ? 'var(--lo-accent-line)' : 'var(--lo-border)',
              isOpen,
            )}>
              {hasUnit ? (
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500, color: val != null ? 'var(--lo-accent)' : 'var(--lo-text-dim)', minHeight: 20, display: 'flex', alignItems: 'center' }}>
                  {val != null ? fmtHabitValue(val, h.unit!) : '—'}
                </div>
              ) : (
                <div style={{ width: 28, height: 28, borderRadius: 7, background: h.done ? 'var(--lo-accent)' : 'transparent', border: '1px solid ' + (h.done ? 'var(--lo-accent)' : 'var(--lo-border-strong)'), display: 'grid', placeItems: 'center' }}>
                  {h.done && <Icon name="check" size={13} style={{ color: 'var(--lo-bg)' }} />}
                </div>
              )}
              <div style={{ fontSize: 11, textAlign: 'center', color: h.done ? 'var(--lo-accent)' : 'var(--lo-text-muted)', lineHeight: 1.3 }}>{h.name}</div>
              {hasUnit && h.unit && (
                <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>{h.unit}</div>
              )}
            </button>
          );
        })}

        {/* Regular checklist cells — toggleable */}
        {!manageMode && regularItems.map(item => (
          <div key={item.id} style={{ position: 'relative' }}>
            <button onClick={() => toggleCl(item.id)} style={btnCell(
              item.done ? 'color-mix(in oklch, var(--lo-info) 10%, transparent)' : 'var(--lo-surface-2)',
              item.done ? 'color-mix(in oklch, var(--lo-info) 35%, transparent)' : 'var(--lo-border)',
            )}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: item.done ? 'var(--lo-info)' : 'transparent', border: '1px solid ' + (item.done ? 'var(--lo-info)' : 'var(--lo-border-strong)'), display: 'grid', placeItems: 'center' }}>
                {item.done && <Icon name="check" size={13} style={{ color: 'var(--lo-bg)' }} />}
              </div>
              <div style={{ fontSize: 11, textAlign: 'center', color: item.done ? 'var(--lo-info)' : 'var(--lo-text-muted)', lineHeight: 1.3 }}>{item.name}</div>
              {isToday && (
                <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                  <button onClick={e => { e.stopPropagation(); markStreak(item.id); }} title="Oznacz jako streak" style={{ fontSize: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--lo-warn)', padding: 0 }}>🔥</button>
                  <button onClick={e => { e.stopPropagation(); deleteCl(item.id); }} title="Usuń" style={{ fontSize: 9, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--lo-text-dim)', padding: 0 }}>✕</button>
                </div>
              )}
            </button>
          </div>
        ))}

        {/* Sleep — static */}
        <div style={staticCell('var(--lo-surface-2)', 'var(--lo-border)')}>
          <div style={{ fontSize: 18 }}>😴</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500, color: initialDay.sleepHours != null && initialDay.sleepHours >= 7 ? 'var(--lo-accent)' : 'var(--lo-text)' }}>{initialDay.sleepHours != null ? `${initialDay.sleepHours}h` : '—'}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>sen</div>
        </div>

        {/* Weight — static */}
        <div style={staticCell('var(--lo-surface-2)', 'var(--lo-border)')}>
          <div style={{ fontSize: 18 }}>⚖️</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500 }}>{initialDay.weightKg != null ? `${initialDay.weightKg}kg` : '—'}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>waga</div>
        </div>

        {/* Mood — static */}
        <div style={staticCell('var(--lo-surface-2)', 'var(--lo-border)')}>
          <div style={{ fontSize: 20 }}>{moodEmoji(initialDay.mood)}</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500 }}>{initialDay.mood != null ? `${initialDay.mood}/5` : '—'}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>nastrój</div>
        </div>

        {/* Summary */}
        <div style={staticCell(
          doneDone === habits.length && habits.length > 0 ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
          doneDone === habits.length && habits.length > 0 ? 'var(--lo-accent-line)' : 'var(--lo-border)',
        )}>
          <div style={{ fontSize: 18 }}>✓</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500, color: doneDone === habits.length && habits.length > 0 ? 'var(--lo-accent)' : 'var(--lo-text)' }}>{doneDone}/{habits.length}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>nawyki</div>
        </div>

      </div>

      {/* Inline editors — habit value */}
      {habits.filter(h => h.unit && activeCell === h.id).map(h => (
        <div key={h.id} style={{ marginTop: 10, padding: '14px 16px', background: 'var(--lo-bg-2)', borderRadius: 10, border: '1px solid var(--lo-accent-line)' }}>
          <div style={{ fontSize: 11, color: 'var(--lo-text-muted)', marginBottom: 10 }}>{h.name} — {h.unit}</div>
          <HabitValueEditor
            habitId={h.id}
            date={initialDay.date}
            unit={h.unit!}
            value={habitValues[h.id] ?? null}
            onSaved={v => {
              setHabitValues(prev => ({ ...prev, [h.id]: v }));
              setHabits(prev => prev.map(x => x.id === h.id ? { ...x, done: v != null && v > 0 } : x));
              setActiveCell(null);
            }}
          />
        </div>
      ))}

      {/* Inline editors */}
      {activeCell === 'focus' && (
        <div style={{ marginTop: 10, padding: '14px 16px', background: 'var(--lo-bg-2)', borderRadius: 10, border: '1px solid var(--lo-accent-line)' }}>
          <div style={{ fontSize: 11, color: 'var(--lo-text-muted)', marginBottom: 10 }}>🌲 Czas focus</div>
          <FocusInput date={initialDay.date} minutes={focusMin} onSaved={m => { setFocusMin(m); setActiveCell(null); }} />
        </div>
      )}
      {activeCell === 'work' && (
        <div style={{ marginTop: 10, padding: '14px 16px', background: 'var(--lo-bg-2)', borderRadius: 10, border: '1px solid color-mix(in oklch, var(--lo-info) 35%, transparent)' }}>
          <div style={{ fontSize: 11, color: 'var(--lo-text-muted)', marginBottom: 10 }}>💼 Godziny pracy</div>
          <WorkInput date={initialDay.date} minutes={workMin} onSaved={m => { setWorkMin(m); setActiveCell(null); }} />
        </div>
      )}
      {activeCell === 'water' && (
        <div style={{ marginTop: 10, padding: '14px 16px', background: 'var(--lo-bg-2)', borderRadius: 10, border: '1px solid color-mix(in oklch, var(--lo-info) 35%, transparent)' }}>
          <div style={{ fontSize: 11, color: 'var(--lo-text-muted)', marginBottom: 10 }}>💧 Nawodnienie</div>
          <WaterInlineEditor date={initialDay.date} ml={waterMl} targetMl={initialDay.waterTargetMl} onChange={setWaterMl} />
        </div>
      )}

      {/* Manage mode — reorder */}
      {manageMode && isToday && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {regularItems.map((item, idx) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)', borderRadius: 8 }}>
              <div style={{ flex: 1, fontSize: 13 }}>{item.name}</div>
              <div style={{ display: 'flex', gap: 2 }}>
                <button disabled={idx === 0} onClick={() => moveItem(idx, -1)} style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 5, background: 'transparent', border: 'none', color: idx === 0 ? 'var(--lo-text-dim)' : 'var(--lo-text-muted)', cursor: idx === 0 ? 'default' : 'pointer' }}><Icon name="arrow-up" size={12} /></button>
                <button disabled={idx === regularItems.length - 1} onClick={() => moveItem(idx, 1)} style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 5, background: 'transparent', border: 'none', color: idx === regularItems.length - 1 ? 'var(--lo-text-dim)' : 'var(--lo-text-muted)', cursor: idx === regularItems.length - 1 ? 'default' : 'pointer' }}><Icon name="arrow-down" size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom toolbar — add item + manage (today only) */}
      {isToday && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <AddChecklistForm onAdded={name => {
            setChecklist(prev => [...prev, { id: `tmp-${Date.now()}`, name, done: false, isStreak: false }]);
          }} />
          {regularItems.length > 1 && (
            <button onClick={() => setManageMode(m => !m)} style={{
              height: 38, padding: '0 12px', borderRadius: 999,
              background: manageMode ? 'var(--lo-accent-soft)' : 'transparent',
              color: manageMode ? 'var(--lo-accent)' : 'var(--lo-text-dim)',
              border: '1px solid ' + (manageMode ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
              fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
            }}>{manageMode ? 'Gotowe' : 'Kolejność'}</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── WeekSection ─────────────────────────────────────────────────────────────

function WeekSection({ week, weekOffset, streakCounts, onNavigate, onChecklistDelete, onStreakToggle }: {
  week: DayData[];
  weekOffset: number;
  streakCounts: Record<string, number>;
  onNavigate: (delta: number) => void;
  onChecklistDelete: (id: string) => void;
  onStreakToggle: (id: string, isStreak: boolean) => void;
}) {
  const today = todayIso();
  const defaultSel = week.find(d => d.date === today)?.date ?? week[0]?.date ?? '';
  const [sel, setSel] = useState(defaultSel);
  const [loading, start] = useTransition();

  const selectedDay = week.find(d => d.date === sel) ?? week[0];

  const weekLabel = (() => {
    const s = week[0]?.date, e = week[6]?.date;
    if (!s || !e) return '';
    const sd = parseDateLocal(s), ed = parseDateLocal(e);
    return `${sd.day} ${PL_MONTHS_SHORT[sd.month]} — ${ed.day} ${PL_MONTHS_SHORT[ed.month]}`;
  })();

  return (
    <div style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 14, overflow: 'hidden' }}>
      {/* Week header */}
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid var(--lo-border)',
        background: 'var(--lo-bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span className="label-eyebrow">Przegląd tygodnia</span>
          <span style={{ marginLeft: 10, fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)' }}>{weekLabel}</span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={() => { start(() => onNavigate(-1)); }} disabled={loading} style={{ width: 28, height: 28, borderRadius: 7, background: 'transparent', border: '1px solid var(--lo-border)', color: 'var(--lo-text-muted)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Icon name="arrow-right" size={12} style={{ transform: 'rotate(180deg)' }} />
          </button>
          {weekOffset !== 0 && (
            <button onClick={() => { start(() => onNavigate(-weekOffset)); }} disabled={loading} style={{ height: 28, padding: '0 10px', borderRadius: 7, background: 'transparent', border: '1px solid var(--lo-border)', color: 'var(--lo-text-muted)', fontSize: 11, fontFamily: 'inherit', cursor: 'pointer' }}>Dziś</button>
          )}
          <button onClick={() => { start(() => onNavigate(1)); }} disabled={loading || weekOffset >= 0} style={{ width: 28, height: 28, borderRadius: 7, background: 'transparent', border: '1px solid var(--lo-border)', color: weekOffset >= 0 ? 'var(--lo-text-dim)' : 'var(--lo-text-muted)', display: 'grid', placeItems: 'center', cursor: weekOffset >= 0 ? 'default' : 'pointer', opacity: weekOffset >= 0 ? 0.35 : 1 }}>
            <Icon name="arrow-right" size={12} />
          </button>
        </div>
      </div>

      {/* Day tabs */}
      <div style={{ display: 'flex', padding: '12px 20px 0', gap: 6, borderBottom: '1px solid var(--lo-border)', background: 'var(--lo-surface)', overflowX: 'auto' }}>
        {week.map(d => {
          const { dow, day: dayNum } = parseDateLocal(d.date);
          const isToday = d.date === today;
          const isSel   = d.date === sel;
          const habitsDone  = d.habits.filter(h => h.done).length;
          const habitsTotal = d.habits.length;
          const allDone = habitsTotal > 0 && habitsDone === habitsTotal;

          return (
            <button key={d.date} onClick={() => setSel(d.date)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '8px 10px 10px', background: 'transparent', border: 'none',
              borderBottom: '2px solid ' + (isSel ? 'var(--lo-accent)' : 'transparent'),
              color: isSel ? 'var(--lo-text)' : 'var(--lo-text-muted)',
              cursor: 'pointer', minWidth: 52, flexShrink: 0, transition: 'color .1s',
            }}>
              <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10, letterSpacing: '.05em', textTransform: 'uppercase', color: isToday ? 'var(--lo-accent)' : isSel ? 'var(--lo-text)' : 'var(--lo-text-faint)', fontWeight: isToday ? 700 : 400 }}>{PL_DAYS_SHORT[dow]}</div>
              <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 14, fontWeight: 500, color: isToday ? 'var(--lo-accent)' : isSel ? 'var(--lo-text)' : 'var(--lo-text-muted)' }}>{dayNum}</div>
              <div style={{ width: 6, height: 6, borderRadius: 999, background: allDone ? 'var(--lo-accent)' : habitsTotal > 0 && habitsDone > 0 ? 'var(--lo-border-strong)' : 'transparent' }} />
            </button>
          );
        })}
      </div>

      {/* Selected day horizontal view */}
      <div style={{ padding: '16px 20px' }}>
        {selectedDay && (
          <>
            <div style={{ fontSize: 12, color: 'var(--lo-text-faint)', marginBottom: 12, fontFamily: 'var(--font-geist-mono)' }}>
              {PL_DAYS_LONG[parseDateLocal(selectedDay.date).dow]} · {parseDateLocal(selectedDay.date).day} {PL_MONTHS[parseDateLocal(selectedDay.date).month]}
            </div>
            <WeekDayDetail
              key={selectedDay.date}
              day={selectedDay}
              streakCounts={streakCounts}
              onChecklistDelete={onChecklistDelete}
              onStreakToggle={onStreakToggle}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ─── DailyScreen (root) ───────────────────────────────────────────────────────

export function DailyScreen({
  initialWeek,
  initialChecklistDefs,
  initialStreakCounts,
  weekOffset: initOffset,
  initialTrackers = [],
}: {
  initialWeek: DayData[];
  initialChecklistDefs: ChecklistItemDef[];
  initialStreakCounts: Record<string, number>;
  weekOffset: number;
  initialTrackers?: StreakTracker[];
}) {
  const [week, setWeek] = useState<DayData[]>(initialWeek);
  const [, setChecklistDefs] = useState<ChecklistItemDef[]>(initialChecklistDefs);
  const [streakCounts, setStreakCounts] = useState<Record<string, number>>(initialStreakCounts);
  const [offset, setOffset] = useState(initOffset);

  const today = todayIso();
  const todayData = week.find(d => d.date === today) ?? week[0];

  const handleNavigate = useCallback(async (delta: number) => {
    const newOffset = offset + delta;
    const { week: newWeek, streakCounts: newCounts } = await getWeekData(newOffset);
    setWeek(newWeek);
    setStreakCounts(newCounts);
    setOffset(newOffset);
  }, [offset]);

  const handleChecklistDelete = (id: string) => {
    setWeek(prev => prev.map(d => ({ ...d, checklist: d.checklist.filter(item => item.id !== id) })));
    setChecklistDefs(prev => prev.filter(x => x.id !== id));
  };

  const handleStreakToggle = (id: string, isStreak: boolean) => {
    setWeek(prev => prev.map(d => ({
      ...d,
      checklist: d.checklist.map(item => item.id === id ? { ...item, isStreak } : item),
    })));
    setChecklistDefs(prev => prev.map(x => x.id === id ? { ...x, isStreak } : x));
    if (!isStreak) {
      setStreakCounts(prev => { const next = { ...prev }; delete next[id]; return next; });
    }
  };

  if (!todayData) return (
    <div style={{ padding: '40px 24px', color: 'var(--lo-text-muted)', fontSize: 13 }}>Ładowanie…</div>
  );

  return (
    <div className="lo-screen" style={{ padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1000, margin: '0 auto', width: '100%' }}>
      {initialTrackers.length > 0 && (
        <StreaksSection initialTrackers={initialTrackers} />
      )}
      <WeekSection
        week={week}
        weekOffset={offset}
        streakCounts={streakCounts}
        onNavigate={handleNavigate}
        onChecklistDelete={handleChecklistDelete}
        onStreakToggle={handleStreakToggle}
      />
    </div>
  );
}
