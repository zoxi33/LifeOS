'use client';

import React, { useState, useTransition, useOptimistic, useCallback, useRef } from 'react';
import { Icon } from '@/components/primitives/icon';
import {
  upsertFocus, upsertWork, toggleHabitForDate, toggleChecklistItem,
  addChecklistItem, deleteChecklistItem, toggleStreakFlag, getWeekData,
  reorderChecklistItems,
} from '@/app/(shell)/daily/actions';
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

function FocusInput({ date, minutes: init }: { date: string; minutes: number }) {
  const h = Math.floor(init / 60), m = init % 60;
  const [hours, setHours] = useState(h > 0 ? String(h) : '');
  const [mins, setMins] = useState(m > 0 ? String(m) : '');
  const [saved, setSaved] = useState(false);
  const [, start] = useTransition();

  const total = (parseInt(hours || '0') * 60) + parseInt(mins || '0');
  const hasValue = total > 0;

  const save = () => {
    const t = Math.max(0, total);
    start(async () => { await upsertFocus(date, t); setSaved(true); setTimeout(() => setSaved(false), 1500); });
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

function WorkInput({ date, minutes: init }: { date: string; minutes: number }) {
  const h = Math.floor(init / 60), m = init % 60;
  const [hours, setHours] = useState(h > 0 ? String(h) : '');
  const [mins, setMins] = useState(m > 0 ? String(m) : '');
  const [saved, setSaved] = useState(false);
  const [, start] = useTransition();

  const total = (parseInt(hours || '0') * 60) + parseInt(mins || '0');
  const hasValue = total > 0;

  const save = () => {
    const t = Math.max(0, total);
    start(async () => { await upsertWork(date, t); setSaved(true); setTimeout(() => setSaved(false), 1500); });
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

// ─── WeekDayDetail ────────────────────────────────────────────────────────────

function WeekDayDetail({ day, streakCounts }: { day: DayData; streakCounts: Record<string, number> }) {
  const doneDone = day.habits.filter(h => h.done).length;
  const streakItems  = day.checklist.filter(i => i.isStreak);
  const regularItems = day.checklist.filter(i => !i.isStreak);

  const cell = (bg: string, border: string): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    padding: '14px 12px', background: bg,
    border: '1px solid ' + border, borderRadius: 10,
  });

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10, padding: '2px 0 8px' }}>

        {/* Focus */}
        <div style={cell(
          day.focusMinutes > 0 ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
          day.focusMinutes > 0 ? 'var(--lo-accent-line)' : 'var(--lo-border)',
        )}>
          <div style={{ fontSize: 18 }}>🌲</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500, color: day.focusMinutes > 0 ? 'var(--lo-accent)' : 'var(--lo-text-dim)' }}>{fmtMinutes(day.focusMinutes)}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>focus</div>
        </div>

        {/* Work */}
        <div style={cell(
          day.workMinutes > 0 ? 'color-mix(in oklch, var(--lo-info) 10%, transparent)' : 'var(--lo-surface-2)',
          day.workMinutes > 0 ? 'color-mix(in oklch, var(--lo-info) 35%, transparent)' : 'var(--lo-border)',
        )}>
          <div style={{ fontSize: 18 }}>💼</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500, color: day.workMinutes > 0 ? 'var(--lo-info)' : 'var(--lo-text-dim)' }}>{fmtMinutes(day.workMinutes)}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>praca</div>
        </div>

        {/* Water */}
        <div style={cell(
          day.waterMl >= day.waterTargetMl ? 'color-mix(in oklch, var(--lo-info) 10%, transparent)' : 'var(--lo-surface-2)',
          day.waterMl >= day.waterTargetMl ? 'color-mix(in oklch, var(--lo-info) 35%, transparent)' : 'var(--lo-border)',
        )}>
          <div style={{ fontSize: 18 }}>💧</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500, color: day.waterMl >= day.waterTargetMl ? 'var(--lo-info)' : day.waterMl > 0 ? 'var(--lo-text-muted)' : 'var(--lo-text-dim)' }}>{fmtWaterShort(day.waterMl)}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>woda</div>
        </div>

        {/* Streak items */}
        {streakItems.map(item => (
          <div key={item.id} style={cell(
            item.done ? 'color-mix(in oklch, var(--lo-warn) 14%, transparent)' : streakCounts[item.id] > 0 ? 'color-mix(in oklch, var(--lo-warn) 6%, transparent)' : 'var(--lo-surface-2)',
            item.done ? 'var(--lo-warn)' : streakCounts[item.id] > 0 ? 'color-mix(in oklch, var(--lo-warn) 35%, transparent)' : 'var(--lo-border)',
          )}>
            <div style={{ fontSize: 16 }}>{item.done ? '🔥' : '○'}</div>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 18, fontWeight: 700, lineHeight: 1, color: item.done ? 'var(--lo-warn)' : 'var(--lo-text-dim)' }}>{streakCounts[item.id] ?? 0}</div>
            <div style={{ fontSize: 10, color: item.done ? 'var(--lo-warn)' : 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)', textAlign: 'center', lineHeight: 1.2 }}>{item.name}</div>
          </div>
        ))}

        {/* Habit cells */}
        {day.habits.map(h => (
          <div key={h.id} style={cell(
            h.done ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
            h.done ? 'var(--lo-accent-line)' : 'var(--lo-border)',
          )}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: h.done ? 'var(--lo-accent)' : 'transparent', border: '1px solid ' + (h.done ? 'var(--lo-accent)' : 'var(--lo-border-strong)'), display: 'grid', placeItems: 'center' }}>
              {h.done && <Icon name="check" size={13} style={{ color: 'var(--lo-bg)' }} />}
            </div>
            <div style={{ fontSize: 11, textAlign: 'center', color: h.done ? 'var(--lo-accent)' : 'var(--lo-text-muted)', lineHeight: 1.3 }}>{h.name}</div>
          </div>
        ))}

        {/* Regular checklist cells */}
        {regularItems.map(item => (
          <div key={item.id} style={cell(
            item.done ? 'color-mix(in oklch, var(--lo-info) 10%, transparent)' : 'var(--lo-surface-2)',
            item.done ? 'color-mix(in oklch, var(--lo-info) 35%, transparent)' : 'var(--lo-border)',
          )}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: item.done ? 'var(--lo-info)' : 'transparent', border: '1px solid ' + (item.done ? 'var(--lo-info)' : 'var(--lo-border-strong)'), display: 'grid', placeItems: 'center' }}>
              {item.done && <Icon name="check" size={13} style={{ color: 'var(--lo-bg)' }} />}
            </div>
            <div style={{ fontSize: 11, textAlign: 'center', color: item.done ? 'var(--lo-info)' : 'var(--lo-text-muted)', lineHeight: 1.3 }}>{item.name}</div>
          </div>
        ))}

        {/* Sleep */}
        <div style={cell('var(--lo-surface-2)', 'var(--lo-border)')}>
          <div style={{ fontSize: 18 }}>😴</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500, color: day.sleepHours != null && day.sleepHours >= 7 ? 'var(--lo-accent)' : 'var(--lo-text)' }}>{day.sleepHours != null ? `${day.sleepHours}h` : '—'}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>sen</div>
        </div>

        {/* Weight */}
        <div style={cell('var(--lo-surface-2)', 'var(--lo-border)')}>
          <div style={{ fontSize: 18 }}>⚖️</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500 }}>{day.weightKg != null ? `${day.weightKg}kg` : '—'}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>waga</div>
        </div>

        {/* Mood */}
        <div style={cell('var(--lo-surface-2)', 'var(--lo-border)')}>
          <div style={{ fontSize: 20 }}>{moodEmoji(day.mood)}</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500 }}>{day.mood != null ? `${day.mood}/5` : '—'}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>nastrój</div>
        </div>

        {/* Summary */}
        <div style={cell(
          doneDone === day.habits.length && day.habits.length > 0 ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
          doneDone === day.habits.length && day.habits.length > 0 ? 'var(--lo-accent-line)' : 'var(--lo-border)',
        )}>
          <div style={{ fontSize: 18 }}>✓</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500, color: doneDone === day.habits.length && day.habits.length > 0 ? 'var(--lo-accent)' : 'var(--lo-text)' }}>{doneDone}/{day.habits.length}</div>
          <div style={{ fontSize: 10, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>nawyki</div>
        </div>

      </div>
    </div>
  );
}

// ─── WeekSection ─────────────────────────────────────────────────────────────

function WeekSection({ week, weekOffset, streakCounts, onNavigate }: {
  week: DayData[];
  weekOffset: number;
  streakCounts: Record<string, number>;
  onNavigate: (delta: number) => void;
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
            <WeekDayDetail day={selectedDay} streakCounts={streakCounts} />
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

  const handleChecklistReorder = (newOrder: { id: string; name: string; done: boolean; isStreak: boolean }[]) => {
    const date = todayData?.date;
    if (!date) return;
    setWeek(prev => prev.map(d => d.date === date ? { ...d, checklist: newOrder } : d));
  };

  if (!todayData) return (
    <div style={{ padding: '40px 24px', color: 'var(--lo-text-muted)', fontSize: 13 }}>Ładowanie…</div>
  );

  return (
    <div className="lo-screen" style={{ padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1000, margin: '0 auto', width: '100%' }}>
      <TodaySection
        day={todayData}
        streakCounts={streakCounts}
        onChecklistDelete={handleChecklistDelete}
        onStreakToggle={handleStreakToggle}
        onChecklistReorder={handleChecklistReorder}
      />
      {initialTrackers.length > 0 && (
        <StreaksSection initialTrackers={initialTrackers} />
      )}
      <WeekSection
        week={week}
        weekOffset={offset}
        streakCounts={streakCounts}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
