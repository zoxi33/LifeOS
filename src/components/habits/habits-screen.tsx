'use client';

import { useState, useTransition } from 'react';
import { Icon } from '@/components/primitives/icon';
import { Bar } from '@/components/primitives/bar';
import { Heatmap } from '@/components/primitives/heatmap';
import { AddHabitDialog } from './add-habit-dialog';
import { deleteHabit, toggleHabitLog } from '@/app/(shell)/habits/actions';
import type { HabitFull } from '@/types/lifeos';

type FilterType = 'all' | 'daily' | 'weekly' | 'custom';

/* ─── HabitDetail ──────────────────────────────────────────────────────────── */
function HabitDetail({ h, onDelete }: { h: HabitFull; onDelete: (id: string) => void }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();

  const seed = h.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const getValue = (_date: Date, idx: number): number => {
    const x = Math.sin(seed * 9.7 + idx * 1.3) * 0.5 + 0.5;
    if (h.type === 'weekly') return idx % 7 < h.target && x > 0.4 ? Math.min(2, Math.floor(x * 2.5)) : 0;
    return x > (1 - h.completionRate) ? Math.min(2, Math.floor(x * 2.5)) : 0;
  };

  return (
    <div style={{
      padding: '14px 16px',
      borderTop: '1px solid var(--lo-border)',
      background: 'var(--lo-bg-2)',
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center',
    }}>
      <div>
        <div className="label-eyebrow" style={{ marginBottom: 6 }}>ostatnie 84 dni</div>
        <Heatmap days={84} getValue={getValue} cell={9} gap={2} />
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 8,
        paddingLeft: 16, borderLeft: '1px solid var(--lo-border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>Ten tydzień</span>
          <span style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
            {h.week} / {h.target}
          </span>
        </div>
        <Bar value={h.week} max={h.target} />
        <div style={{ display: 'flex', gap: 18, marginTop: 6, fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums' }}>
          {[
            { label: 'średnia', val: `${Math.round(h.completionRate * 100)}%` },
            { label: 'rekord',  val: String(h.best) },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 11, color: 'var(--lo-text-faint)' }}>{s.label}</div>
              <div style={{ fontSize: 13 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 28, padding: '0 10px',
              background: 'transparent', color: 'var(--lo-text-dim)',
              border: '1px solid transparent', borderRadius: 6,
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-danger)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--lo-border)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--lo-surface)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-text-dim)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <Icon name="trash" size={12} /> Usuń
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--lo-text-muted)', fontFamily: 'var(--font-geist-mono)' }}>Na pewno?</span>
            <button
              disabled={pending}
              onClick={() => start(async () => { await deleteHabit(h.id); onDelete(h.id); })}
              style={{
                height: 26, padding: '0 10px',
                background: 'color-mix(in oklch, var(--lo-danger) 12%, transparent)',
                color: 'var(--lo-danger)',
                border: '1px solid color-mix(in oklch, var(--lo-danger) 30%, transparent)',
                borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >{pending ? '…' : 'Tak'}</button>
            <button
              onClick={() => setConfirm(false)}
              style={{
                height: 26, padding: '0 10px',
                background: 'var(--lo-surface-2)', color: 'var(--lo-text-muted)',
                border: '1px solid var(--lo-border)', borderRadius: 6,
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >Nie</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── HabitListRow ─────────────────────────────────────────────────────────── */
function HabitListRow({ h, isOpen, onToggle, onDelete, onTodayToggle }: {
  h: HabitFull; isOpen: boolean; onToggle: () => void; onDelete: (id: string) => void;
  onTodayToggle: (id: string, done: boolean) => void;
}) {
  const [hover, setHover] = useState(false);
  const [toggling, startToggle] = useTransition();
  const bg = isOpen ? 'var(--lo-surface-2)' : hover ? 'var(--lo-bg-2)' : 'transparent';
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onToggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: '100%', textAlign: 'left',
          display: 'grid', gridTemplateColumns: '1fr 220px 80px 100px 24px',
          alignItems: 'center', padding: '14px 18px',
          background: bg, border: 'none',
          borderBottom: '1px solid var(--lo-border)',
          color: 'var(--lo-text)', fontFamily: 'inherit',
          cursor: 'pointer', transition: 'background .12s ease',
        }}
        className="lo-habits-row"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {h.emoji && <span style={{ fontSize: 18, flexShrink: 0 }}>{h.emoji}</span>}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ fontSize: 13.5 }}>{h.name}</div>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)', marginTop: 2 }}>
              {h.freq}
            </div>
          </div>
        </div>
        <div className="lo-habits-col-week" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}><Bar value={h.week} max={h.target} h={4} /></div>
          <span style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 11, color: 'var(--lo-text-muted)', minWidth: 30 }}>
            {h.week}/{h.target}
          </span>
        </div>
        <div className="lo-habits-col-pct" style={{
          textAlign: 'right', fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
          fontSize: 12, color: h.completionRate > 0.85 ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
        }}>
          {Math.round(h.completionRate * 100)}%
        </div>
        <div className="lo-habits-col-streak" style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
          <Icon name="flame" size={11} style={{ color: 'var(--lo-accent)' }} />
          <span style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{h.streak}</span>
        </div>
        <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size={14} style={{ color: 'var(--lo-text-faint)' }} />
      </button>
      {/* Today toggle — sits outside the expand button to prevent toggling expand */}
      <button
        onClick={e => {
          e.stopPropagation();
          const today = new Date().toISOString().slice(0, 10);
          const newDone = !h.todayDone;
          onTodayToggle(h.id, newDone);
          startToggle(async () => { await toggleHabitLog(h.id, today, newDone); });
        }}
        disabled={toggling}
        title={h.todayDone ? 'Oznacz jako niewykonany dziś' : 'Oznacz jako wykonany dziś'}
        style={{
          position: 'absolute', right: 46,
          width: 28, height: 28, borderRadius: 6,
          border: '1px solid ' + (h.todayDone ? 'var(--lo-accent-line)' : 'var(--lo-border-strong)'),
          background: h.todayDone ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
          color: h.todayDone ? 'var(--lo-accent)' : 'var(--lo-text-dim)',
          display: hover || h.todayDone ? 'grid' : 'none',
          placeItems: 'center', cursor: 'pointer',
          transition: 'all 0.1s',
        }}
      >
        <Icon name="check" size={13} />
      </button>
      {isOpen && <HabitDetail h={h} onDelete={onDelete} />}
    </div>
  );
}

/* ─── HabitsScreen ─────────────────────────────────────────────────────────── */
export function HabitsScreen({ initialHabits = [] }: { initialHabits?: HabitFull[] }) {
  const [habits, setHabits] = useState<HabitFull[]>(initialHabits);
  const [open, setOpen] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = filter === 'all' ? habits : habits.filter(h => h.type === filter);

  const handleDelete = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setOpen(null);
  };

  const handleTodayToggle = (id: string, done: boolean) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, todayDone: done } : h));
  };

  return (
    <>
      <AddHabitDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={habit => setHabits(prev => [...prev, habit])}
      />
      <div className="lo-screen" style={{ padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div className="lo-habits-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div className="label-eyebrow">Nawyki</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
              {habits.length} aktywnych
            </div>
          </div>
          <div className="lo-habits-filters" style={{ display: 'flex', gap: 6 }}>
            {([['all','Wszystkie'],['daily','Codzienne'],['weekly','Tygodniowe'],['custom','Niestandardowe']] as [FilterType, string][]).map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 32, padding: '0 12px',
                background: filter === k ? 'var(--lo-surface-2)' : 'transparent',
                border: '1px solid ' + (filter === k ? 'var(--lo-border-strong)' : 'transparent'),
                color: filter === k ? 'var(--lo-text)' : 'var(--lo-text-muted)',
                borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}>{l}</button>
            ))}
            <button onClick={() => setAddOpen(true)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 32, padding: '0 12px',
              background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
              border: '1px solid var(--lo-accent-line)', borderRadius: 8,
              fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <Icon name="plus" size={13} /> Nowy nawyk
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 220px 80px 100px 24px',
            padding: '12px 18px', borderBottom: '1px solid var(--lo-border)',
            background: 'var(--lo-bg-2)',
          }} className="label-eyebrow lo-habits-row">
            <div>Nawyk</div>
            <div className="lo-habits-col-week">Tydzień</div>
            <div className="lo-habits-col-pct" style={{ textAlign: 'right' }}>%</div>
            <div className="lo-habits-col-streak" style={{ textAlign: 'right' }}>Streak</div>
            <div />
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px 18px', fontSize: 13, color: 'var(--lo-text-muted)' }}>
              {habits.length === 0
                ? 'Brak nawyków — kliknij „Nowy nawyk" żeby zacząć.'
                : 'Brak nawyków w tej kategorii.'}
            </div>
          ) : filtered.map(h => (
            <HabitListRow
              key={h.id} h={h}
              isOpen={open === h.id}
              onToggle={() => setOpen(open === h.id ? null : h.id)}
              onDelete={handleDelete}
              onTodayToggle={handleTodayToggle}
            />
          ))}
        </div>
      </div>
    </>
  );
}
