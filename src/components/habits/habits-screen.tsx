'use client';

import { useState, useTransition } from 'react';
import { Icon } from '@/components/primitives/icon';
import { Bar } from '@/components/primitives/bar';
import { Heatmap } from '@/components/primitives/heatmap';
import { RangePicker, type DateRange } from '@/components/primitives/range-picker';
import { AddHabitDialog } from './add-habit-dialog';
import { deleteHabit, toggleHabitLog, getHabitsRange, logHabitValue } from '@/app/(shell)/habits/actions';
import type { HabitFull } from '@/types/lifeos';

function isTimeUnit(unit: string): boolean {
  return /^(min|minut[ay]?|godzin[ay]?|h|hr)$/i.test(unit.trim());
}

function fmtValue(value: number, unit: string): string {
  if (isTimeUnit(unit) && (unit.toLowerCase().startsWith('min') || unit === 'min')) {
    const h = Math.floor(value / 60);
    const m = value % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  }
  if (isTimeUnit(unit) && (unit === 'h' || unit === 'hr')) {
    return `${value}h`;
  }
  return `${value} ${unit}`;
}

type FilterType = 'all' | 'daily' | 'weekly' | 'custom';

/* ─── HabitValueLogger ─────────────────────────────────────────────────────── */
function HabitValueLogger({ h, onValueLogged }: {
  h: HabitFull;
  onValueLogged?: (id: string, value: number | null) => void;
}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [logDate, setLogDate] = useState(todayStr);
  const [valuePending, startValue] = useTransition();

  const isTime = isTimeUnit(h.unit);
  // Derive existing value for selected date from logs
  const existingLog = h.logs.find(l => l.date === logDate);
  const existingValue = existingLog?.value ?? null;

  // h/min state for time units
  const initH = existingValue !== null && isTime ? Math.floor(existingValue / 60) : 0;
  const initM = existingValue !== null && isTime ? existingValue % 60 : (existingValue ?? 0);
  const [hours, setHours] = useState(initH > 0 ? String(initH) : '');
  const [mins, setMins] = useState(!isTime ? (existingValue !== null ? String(existingValue) : '') : (initM > 0 ? String(initM) : ''));
  const [numVal, setNumVal] = useState(existingValue !== null && !isTime ? String(existingValue) : '');
  const [saved, setSaved] = useState(false);

  // Sync inputs when date changes
  const handleDateChange = (d: string) => {
    setLogDate(d);
    const log = h.logs.find(l => l.date === d);
    const v = log?.value ?? null;
    if (isTime) {
      const h2 = v !== null ? Math.floor(v / 60) : 0;
      const m2 = v !== null ? v % 60 : 0;
      setHours(h2 > 0 ? String(h2) : '');
      setMins(m2 > 0 ? String(m2) : '');
    } else {
      setNumVal(v !== null ? String(v) : '');
    }
    setSaved(false);
  };

  const save = () => {
    let v: number | null;
    if (isTime) {
      const total = (parseInt(hours || '0') * 60) + parseInt(mins || '0');
      v = total > 0 ? total : null;
    } else {
      v = numVal.trim() === '' ? null : parseFloat(numVal);
      if (v !== null && isNaN(v)) return;
    }
    if (logDate === todayStr) onValueLogged?.(h.id, v);
    startValue(async () => {
      await logHabitValue(h.id, logDate, v);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  };

  const inp = (style?: React.CSSProperties): React.CSSProperties => ({
    height: 32, borderRadius: 6, padding: '0 8px', textAlign: 'center',
    background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
    color: 'var(--lo-text)', fontSize: 14, fontFamily: 'var(--font-geist-mono)',
    ...style,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Date selector */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--lo-text-faint)' }}>Data:</div>
        {[0,1,2,3,4,5,6].map(offset => {
          const d = new Date(); d.setDate(d.getDate() - offset);
          const ds = d.toISOString().slice(0, 10);
          const label = offset === 0 ? 'Dziś' : offset === 1 ? 'Wczoraj' : d.toLocaleDateString('pl', { weekday: 'short', day: 'numeric' });
          const hasLog = h.logs.some(l => l.date === ds && (l.done || l.value));
          return (
            <button key={ds} onClick={() => handleDateChange(ds)} style={{
              height: 26, padding: '0 8px', borderRadius: 6, fontSize: 11,
              fontFamily: 'var(--font-geist-mono)',
              background: logDate === ds ? 'var(--lo-accent-soft)' : hasLog ? 'var(--lo-surface-2)' : 'transparent',
              border: '1px solid ' + (logDate === ds ? 'var(--lo-accent-line)' : hasLog ? 'var(--lo-border-strong)' : 'var(--lo-border)'),
              color: logDate === ds ? 'var(--lo-accent)' : hasLog ? 'var(--lo-text-muted)' : 'var(--lo-text-dim)',
              cursor: 'pointer',
            }}>{label}{hasLog && logDate !== ds ? ' ✓' : ''}</button>
          );
        })}
        <input type="date" value={logDate} onChange={e => handleDateChange(e.target.value)}
          max={todayStr}
          style={{ height: 26, borderRadius: 6, padding: '0 6px', fontSize: 11, background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text-muted)', cursor: 'pointer' }}
        />
      </div>

      {/* Value input */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {isTime ? (
          <>
            <input type="number" min={0} max={23} placeholder="0" value={hours}
              onChange={e => { setHours(e.target.value); setSaved(false); }}
              onKeyDown={e => e.key === 'Enter' && save()}
              style={inp({ width: 52 })} />
            <span style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>h</span>
            <input type="number" min={0} max={59} placeholder="0" value={mins}
              onChange={e => { setMins(e.target.value); setSaved(false); }}
              onKeyDown={e => e.key === 'Enter' && save()}
              style={inp({ width: 52 })} />
            <span style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>min</span>
            {(parseInt(hours||'0')*60+parseInt(mins||'0')) > 0 && (
              <span style={{ fontSize: 12, color: 'var(--lo-accent)', fontFamily: 'var(--font-geist-mono)' }}>
                = {fmtValue(parseInt(hours||'0')*60+parseInt(mins||'0'), 'min')}
              </span>
            )}
          </>
        ) : (
          <>
            <input type="number" min={0} step="any" placeholder="0" value={numVal}
              onChange={e => { setNumVal(e.target.value); setSaved(false); }}
              onKeyDown={e => e.key === 'Enter' && save()}
              style={inp({ width: 80 })} />
            <span style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>{h.unit}</span>
          </>
        )}
        <button onClick={save} disabled={valuePending} style={{
          height: 32, padding: '0 12px', borderRadius: 6,
          background: saved ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
          color: saved ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
          border: '1px solid ' + (saved ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
          fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
        }}>{valuePending ? '…' : saved ? '✓ Zapisano' : 'Zapisz'}</button>
      </div>

      {/* Existing value display */}
      {existingValue !== null && (
        <div style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>
          Zapisane: {fmtValue(existingValue, h.unit)}
        </div>
      )}
    </div>
  );
}

/* ─── HabitDetail ──────────────────────────────────────────────────────────── */
function HabitDetail({ h, range, onDelete, onValueLogged, onEdit }: {
  h: HabitFull; range: DateRange;
  onDelete: (id: string) => void;
  onValueLogged?: (id: string, value: number | null) => void;
  onEdit: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();

  const heatmapDays = range === null ? Math.max(84, h.logs.length) : range;
  const logMap = new Map(h.logs.map(l => [l.date, l.done]));
  const getValue = (date: Date, _idx: number): number => {
    const ds = date.toISOString().slice(0, 10);
    return logMap.get(ds) ? 2 : 0;
  };

  return (
    <div className="lo-habit-detail" style={{
      padding: '14px 16px',
      borderTop: '1px solid var(--lo-border)',
      background: 'var(--lo-bg-2)',
      display: 'grid', gridTemplateColumns: h.unit ? 'auto 1fr auto auto' : 'auto 1fr auto', gap: 24, alignItems: 'start',
    }}>
      <div style={{ overflow: 'hidden' }}>
        <div className="label-eyebrow" style={{ marginBottom: 6 }}>ostatnie {heatmapDays} dni</div>
        <Heatmap days={heatmapDays} getValue={getValue} cell={9} gap={2} />
      </div>
      <div className="lo-habit-detail-stats" style={{
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
      {h.unit && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--lo-text-faint)' }}>
            Loguj ({h.unit})
          </div>
          <HabitValueLogger h={h} onValueLogged={onValueLogged} />
        </div>
      )}
      <div className="lo-habit-detail-actions" style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        {/* Edit button */}
        <button
          onClick={onEdit}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 28, padding: '0 10px',
            background: 'transparent', color: 'var(--lo-text-dim)',
            border: '1px solid transparent', borderRadius: 6,
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--lo-surface)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--lo-border)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
          }}
        >
          <Icon name="edit" size={12} /> Edytuj
        </button>
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
function HabitListRow({ h, isOpen, range, onToggle, onDelete, onTodayToggle, onValueLogged, onEdit }: {
  h: HabitFull; isOpen: boolean; range: DateRange; onToggle: () => void; onDelete: (id: string) => void;
  onTodayToggle: (id: string, done: boolean) => void;
  onValueLogged: (id: string, value: number | null) => void;
  onEdit: (h: HabitFull) => void;
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
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)', marginTop: 2, display: 'flex', gap: 8 }}>
              <span>{h.freq}</span>
              {h.unit && h.todayValue !== null && (
                <span style={{ color: 'var(--lo-accent)' }}>{fmtValue(h.todayValue, h.unit)}</span>
              )}
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
      {isOpen && <HabitDetail h={h} range={range} onDelete={onDelete} onValueLogged={onValueLogged} onEdit={() => onEdit(h)} />}
    </div>
  );
}

/* ─── HabitsScreen ─────────────────────────────────────────────────────────── */
export function HabitsScreen({ initialHabits = [] }: { initialHabits?: HabitFull[] }) {
  const [habits, setHabits] = useState<HabitFull[]>(initialHabits);
  const [open, setOpen] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<HabitFull | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [range, setRange] = useState<DateRange>(90);
  const [loadingRange, startRange] = useTransition();

  const handleRangeChange = (r: DateRange) => {
    setRange(r);
    setOpen(null);
    startRange(async () => {
      const data = await getHabitsRange(r);
      setHabits(data);
    });
  };

  const filtered = filter === 'all' ? habits : habits.filter(h => h.type === filter);

  const handleDelete = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setOpen(null);
  };

  const handleTodayToggle = (id: string, done: boolean) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, todayDone: done } : h));
  };

  const handleValueLogged = (id: string, value: number | null) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, todayValue: value, todayDone: true } : h));
  };

  const handleUpdated = (updated: HabitFull) => {
    setHabits(prev => prev.map(h => h.id === updated.id ? { ...h, ...updated } : h));
    setEditHabit(null);
  };

  return (
    <>
      <AddHabitDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={habit => setHabits(prev => [...prev, habit])}
      />
      <AddHabitDialog
        open={!!editHabit}
        onOpenChange={v => { if (!v) setEditHabit(null); }}
        existing={editHabit ?? undefined}
        onUpdated={handleUpdated}
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
          <div className="lo-habits-filters" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <RangePicker value={range} onChange={handleRangeChange} loading={loadingRange} />
            <div style={{ width: 1, height: 20, background: 'var(--lo-border)', margin: '0 2px' }} />
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
              range={range}
              onToggle={() => setOpen(open === h.id ? null : h.id)}
              onDelete={handleDelete}
              onTodayToggle={handleTodayToggle}
              onValueLogged={handleValueLogged}
              onEdit={h => setEditHabit(h)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
