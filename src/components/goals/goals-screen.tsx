'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { Icon } from '@/components/primitives/icon';
import { HabitRing } from '@/components/primitives/habit-ring';
import { Bar } from '@/components/primitives/bar';
import { AddGoalDialog } from './add-goal-dialog';
import { updateGoalProgress, toggleMilestone, deactivateGoal, addMilestone, deleteMilestone, resetAbstinence } from '@/app/(shell)/goals/actions';
import type { Goal, Milestone } from '@/types/lifeos';

function GoalDetail({ g, onProgressSaved, onReset, onDeactivated }: {
  g: Goal;
  onProgressSaved: (id: string, newCurrent: number) => void;
  onReset: (id: string) => void;
  onDeactivated: (id: string) => void;
}) {
  const [inputVal, setInputVal] = useState(String(g.current));
  const [saving, startSave] = useTransition();
  const [resetting, startReset] = useTransition();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [deactivating, startDeactivate] = useTransition();
  const [confirmDel, setConfirmDel] = useState(false);
  const [localMilestones, setLocalMilestones] = useState<Milestone[]>(g.milestones);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDue, setNewMilestoneDue] = useState('');
  const [addingMilestone, startAddMilestone] = useTransition();

  const [milestones, updateMilestone] = useOptimistic(
    localMilestones,
    (prev: Milestone[], { id, done }: { id: string; done: boolean }) =>
      prev.map(m => m.id === id ? { ...m, done } : m),
  );

  const handleProgressSave = () => {
    const v = parseFloat(inputVal.replace(',', '.'));
    if (isNaN(v)) return;
    startSave(async () => {
      await updateGoalProgress(g.id, v);
      onProgressSaved(g.id, v);
    });
  };

  const handleMilestoneToggle = async (m: Milestone) => {
    updateMilestone({ id: m.id, done: !m.done });
    setLocalMilestones(prev => prev.map(x => x.id === m.id ? { ...x, done: !x.done } : x));
    await toggleMilestone(m.id, !m.done);
  };

  const handleAddMilestone = () => {
    if (!newMilestoneName.trim()) return;
    startAddMilestone(async () => {
      const created = await addMilestone(g.id, newMilestoneName.trim(), newMilestoneDue || undefined);
      setLocalMilestones(prev => [...prev, created]);
      setNewMilestoneName('');
      setNewMilestoneDue('');
    });
  };

  const handleDeleteMilestone = (id: string) => {
    setLocalMilestones(prev => prev.filter(m => m.id !== id));
    deleteMilestone(id);
  };

  const isText = g.goalType === 'text';
  const isAbstinence = g.goalType === 'abstinence';
  const done = isText && g.current >= 1;
  const pct = isText ? (done ? 100 : 0)
    : isAbstinence ? (g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0)
    : Math.min(100, Math.round((parseFloat(inputVal) / (g.target || 1)) * 100));

  return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 18,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            height: 22, padding: '0 8px',
            background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
            borderRadius: 999, fontSize: 11, color: 'var(--lo-text-muted)',
            fontFamily: 'var(--font-geist-mono)',
          }}>{g.category}</span>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 10 }}>
            {g.name}
          </div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)', marginTop: 6 }}>
            termin · {g.due || '—'}
          </div>
        </div>
        <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
          <HabitRing value={pct} total={100} size={88} stroke={5} />
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            {isText ? (
              <Icon name={done ? 'check' : 'clock'} size={22} style={{ color: done ? 'var(--lo-accent)' : 'var(--lo-text-faint)' }} />
            ) : isAbstinence ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 20, fontWeight: 600, lineHeight: 1 }}>{g.current}</div>
                <div style={{ fontSize: 9, color: 'var(--lo-text-faint)', marginTop: 2 }}>dni</div>
              </div>
            ) : (
              <div style={{
                fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                fontSize: 22, fontWeight: 500,
              }}>
                {pct}<span style={{ fontSize: 11, color: 'var(--lo-text-faint)' }}>%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats + progress update */}
      <div style={{
        padding: '14px 0',
        borderTop: '1px solid var(--lo-border)',
        borderBottom: '1px solid var(--lo-border)',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {isAbstinence ? (
          /* Abstinence goal */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ padding: '12px 14px', background: 'var(--lo-surface-2)', borderRadius: 8, border: '1px solid var(--lo-border)' }}>
                <div className="label-eyebrow" style={{ marginBottom: 6 }}>Streak</div>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 22, fontWeight: 600, color: 'var(--lo-accent)' }}>
                  {g.current}<span style={{ fontSize: 11, color: 'var(--lo-text-faint)', marginLeft: 3 }}>dni</span>
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--lo-surface-2)', borderRadius: 8, border: '1px solid var(--lo-border)' }}>
                <div className="label-eyebrow" style={{ marginBottom: 6 }}>Cel</div>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 22, fontWeight: 600 }}>
                  {g.target > 0 ? <>{g.target}<span style={{ fontSize: 11, color: 'var(--lo-text-faint)', marginLeft: 3 }}>dni</span></> : <span style={{ fontSize: 14, color: 'var(--lo-text-faint)' }}>—</span>}
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--lo-surface-2)', borderRadius: 8, border: '1px solid var(--lo-border)' }}>
                <div className="label-eyebrow" style={{ marginBottom: 6 }}>Start</div>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 12, color: 'var(--lo-text-muted)', marginTop: 6 }}>
                  {g.startDate || '—'}
                </div>
              </div>
            </div>
            {g.note && <div style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>{g.note}</div>}
            {resetError && (
              <div style={{ fontSize: 12, color: 'var(--lo-danger)', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 8, padding: '8px 12px' }}>
                Błąd resetu: {resetError}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="label-eyebrow" style={{ flexShrink: 0 }}>Odliczanie</div>
              {!confirmReset ? (
                <button
                  onClick={() => { setResetError(null); setConfirmReset(true); }}
                  style={{
                    height: 32, padding: '0 14px',
                    background: 'var(--lo-surface-2)', color: 'var(--lo-text-muted)',
                    border: '1px solid var(--lo-border)', borderRadius: 8,
                    fontSize: 13, fontFamily: 'inherit',
                  }}
                >
                  Zresetuj odliczanie
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--lo-text-muted)', fontFamily: 'var(--font-geist-mono)' }}>Na pewno? Streak wróci do 0.</span>
                  <button
                    disabled={resetting}
                    onClick={() => {
                      setResetError(null);
                      startReset(async () => {
                        try {
                          await resetAbstinence(g.id);
                          onReset(g.id);
                          setConfirmReset(false);
                        } catch (e) {
                          setResetError(e instanceof Error ? e.message : 'Nieznany błąd');
                          setConfirmReset(false);
                        }
                      });
                    }}
                    style={{
                      height: 26, padding: '0 10px',
                      background: 'color-mix(in oklch, var(--lo-danger) 12%, transparent)',
                      color: 'var(--lo-danger)',
                      border: '1px solid color-mix(in oklch, var(--lo-danger) 30%, transparent)',
                      borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >{resetting ? '…' : 'Tak, resetuj'}</button>
                  <button onClick={() => setConfirmReset(false)} style={{
                    height: 26, padding: '0 10px', background: 'var(--lo-surface-2)',
                    color: 'var(--lo-text-muted)', border: '1px solid var(--lo-border)',
                    borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                  }}>Nie</button>
                </div>
              )}
            </div>
          </div>
        ) : isText ? (
          /* Text goal: show state arrow + done toggle */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                flex: 1, padding: '10px 14px',
                background: 'var(--lo-surface-2)', borderRadius: 8,
                border: '1px solid var(--lo-border)',
              }}>
                <div className="label-eyebrow" style={{ marginBottom: 4 }}>Obecnie</div>
                <div style={{ fontSize: 15, color: 'var(--lo-text-muted)' }}>{g.currentText || '—'}</div>
              </div>
              <Icon name="arrow-right" size={16} style={{ color: 'var(--lo-text-faint)', flexShrink: 0 }} />
              <div style={{
                flex: 1, padding: '10px 14px',
                background: done ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)', borderRadius: 8,
                border: '1px solid ' + (done ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
              }}>
                <div className="label-eyebrow" style={{ marginBottom: 4, color: done ? 'var(--lo-accent)' : undefined }}>Cel</div>
                <div style={{ fontSize: 15, color: done ? 'var(--lo-accent)' : 'var(--lo-text)' }}>{g.targetText || '—'}</div>
              </div>
            </div>
            {g.note && (
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>{g.note}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="label-eyebrow" style={{ flexShrink: 0 }}>Status</div>
              <button
                disabled={saving}
                onClick={() => startSave(async () => { await updateGoalProgress(g.id, done ? 0 : 1); onProgressSaved(g.id, done ? 0 : 1); })}
                style={{
                  height: 32, padding: '0 14px',
                  background: done ? 'var(--lo-surface-2)' : 'var(--lo-accent-soft)',
                  color: done ? 'var(--lo-text-muted)' : 'var(--lo-accent)',
                  border: '1px solid ' + (done ? 'var(--lo-border)' : 'var(--lo-accent-line)'),
                  borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
                  opacity: saving ? 0.5 : 1,
                }}
              >
                {saving ? '…' : done ? 'Oznacz jako w toku' : 'Oznacz jako osiągnięty'}
              </button>
            </div>
          </div>
        ) : (
          /* Numeric goal: existing stats + input */
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              <div>
                <div className="label-eyebrow" style={{ marginBottom: 4 }}>Obecnie</div>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 18, color: 'var(--lo-accent)' }}>
                  {parseFloat(inputVal) || g.current} <span style={{ fontSize: 11, color: 'var(--lo-text-faint)' }}>{g.unit}</span>
                </div>
              </div>
              <div>
                <div className="label-eyebrow" style={{ marginBottom: 4 }}>Cel</div>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 18 }}>
                  {g.target.toLocaleString('pl')} <span style={{ fontSize: 11, color: 'var(--lo-text-faint)' }}>{g.unit}</span>
                </div>
              </div>
              <div>
                <div className="label-eyebrow" style={{ marginBottom: 4 }}>Notatka</div>
                <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', lineHeight: 1.5 }}>{g.note || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="label-eyebrow" style={{ flexShrink: 0 }}>Aktualizuj postęp</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <input
                  type="number"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleProgressSave()}
                  style={{
                    width: 100, height: 32, padding: '0 10px',
                    background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)',
                    borderRadius: 8, color: 'var(--lo-text)',
                    fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                    fontSize: 14,
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>{g.unit}</span>
                <button
                  disabled={saving || inputVal === String(g.current)}
                  onClick={handleProgressSave}
                  style={{
                    height: 32, padding: '0 14px',
                    background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
                    border: '1px solid var(--lo-accent-line)', borderRadius: 8,
                    fontSize: 13, fontFamily: 'inherit',
                    opacity: (saving || inputVal === String(g.current)) ? 0.5 : 1,
                  }}
                >
                  {saving ? 'Zapisywanie…' : 'Zapisz'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Milestones */}
      <div>
        <div className="label-eyebrow" style={{ marginBottom: 14 }}>Kamienie milowe</div>
        {milestones.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--lo-text-muted)', marginBottom: 12 }}>Brak kamieni milowych.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 12 }}>
            {milestones.map((m, i) => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderBottom: i < milestones.length - 1 ? '1px solid var(--lo-border)' : 'none',
              }}>
                <button
                  onClick={() => handleMilestoneToggle(m)}
                  style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    border: '1px solid ' + (m.done ? 'var(--lo-accent-line)' : 'var(--lo-border-strong)'),
                    background: m.done ? 'var(--lo-accent-soft)' : 'transparent',
                    display: 'grid', placeItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {m.done && <Icon name="check" size={12} style={{ color: 'var(--lo-accent)' }} />}
                </button>
                <div style={{
                  flex: 1, fontSize: 13,
                  color: m.done ? 'var(--lo-text-muted)' : 'var(--lo-text)',
                  textDecoration: m.done ? 'line-through' : 'none',
                  textDecorationColor: 'var(--lo-text-dim)',
                }}>{m.name}</div>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)', flexShrink: 0 }}>
                  {m.date}
                </div>
                <button
                  onClick={() => handleDeleteMilestone(m.id)}
                  style={{
                    display: 'grid', placeItems: 'center',
                    width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                    background: 'transparent', border: 'none',
                    color: 'var(--lo-text-dim)', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-danger)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--lo-surface-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-text-dim)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <Icon name="trash" size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add milestone form */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <input
              placeholder="Nowy kamień milowy…"
              value={newMilestoneName}
              onChange={e => setNewMilestoneName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
              style={{
                width: '100%', height: 32, padding: '0 10px',
                background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)',
                borderRadius: 8, color: 'var(--lo-text)', fontFamily: 'inherit', fontSize: 13,
              }}
            />
          </div>
          <div>
            <input
              type="date"
              value={newMilestoneDue}
              onChange={e => setNewMilestoneDue(e.target.value)}
              style={{
                height: 32, padding: '0 8px',
                background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)',
                borderRadius: 8, color: newMilestoneDue ? 'var(--lo-text)' : 'var(--lo-text-faint)',
                fontFamily: 'var(--font-geist-mono)', fontSize: 12,
              }}
            />
          </div>
          <button
            onClick={handleAddMilestone}
            disabled={!newMilestoneName.trim() || addingMilestone}
            style={{
              height: 32, padding: '0 14px', flexShrink: 0,
              background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
              border: '1px solid var(--lo-accent-line)', borderRadius: 8,
              fontSize: 13, fontFamily: 'inherit',
              opacity: (!newMilestoneName.trim() || addingMilestone) ? 0.5 : 1,
            }}
          >
            {addingMilestone ? '…' : 'Dodaj'}
          </button>
        </div>
      </div>

      {/* Deactivate */}
      <div style={{ paddingTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
        {!confirmDel ? (
          <button
            onClick={() => setConfirmDel(true)}
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
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-text-dim)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
            }}
          >
            <Icon name="trash" size={12} /> Dezaktywuj cel
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--lo-text-muted)', fontFamily: 'var(--font-geist-mono)' }}>Na pewno?</span>
            <button
              disabled={deactivating}
              onClick={() => startDeactivate(async () => { await deactivateGoal(g.id); onDeactivated(g.id); })}
              style={{
                height: 26, padding: '0 10px',
                background: 'color-mix(in oklch, var(--lo-danger) 12%, transparent)',
                color: 'var(--lo-danger)',
                border: '1px solid color-mix(in oklch, var(--lo-danger) 30%, transparent)',
                borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >{deactivating ? '…' : 'Tak'}</button>
            <button
              onClick={() => setConfirmDel(false)}
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

export function GoalsScreen({ initialGoals = [] }: { initialGoals?: Goal[] }) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [sel, setSel] = useState(initialGoals[0]?.id ?? '');
  const [addOpen, setAddOpen] = useState(false);

  const handleProgressSaved = (id: string, newCurrent: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g;
      const pct = g.goalType === 'text'
        ? (newCurrent >= 1 ? 100 : 0)
        : Math.min(100, Math.round((newCurrent / (g.target || 1)) * 100));
      return { ...g, current: newCurrent, pct };
    }));
  };

  const handleReset = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, current: 0, pct: 0, startDate: today } : g
    ));
  };

  const handleDeactivated = (id: string) => {
    const remaining = goals.filter(g => g.id !== id);
    setGoals(remaining);
    setSel(remaining[0]?.id ?? '');
  };

  const handleAdded = (goal: Goal) => {
    setGoals(prev => [...prev, goal]);
    setSel(goal.id);
  };

  const g = goals.find(x => x.id === sel) ?? goals[0];

  if (!g) return (
    <>
      <AddGoalDialog open={addOpen} onOpenChange={setAddOpen} onAdded={handleAdded} />
      <div className="lo-screen" style={{ padding: '20px 24px 40px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="label-eyebrow">Cele</div>
          <button onClick={() => setAddOpen(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 32, padding: '0 12px',
            background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
            border: '1px solid var(--lo-accent-line)', borderRadius: 8,
            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}><Icon name="plus" size={13} /> Nowy cel</button>
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--lo-text-muted)' }}>Brak celów — dodaj pierwszy cel.</div>
      </div>
    </>
  );

  return (
    <>
      <AddGoalDialog open={addOpen} onOpenChange={setAddOpen} onAdded={handleAdded} />
      <div className="lo-grid-sidebar lo-screen" style={{
        padding: '20px 24px 40px',
        maxWidth: 1280, margin: '0 auto', width: '100%',
      }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="label-eyebrow">Cele</div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
                {goals.length} aktywnych
              </div>
            </div>
            <button onClick={() => setAddOpen(true)} style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32,
              background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
              border: '1px solid var(--lo-accent-line)', borderRadius: 8,
              cursor: 'pointer',
            }}>
              <Icon name="plus" size={14} />
            </button>
          </div>

          <div style={{
            background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            {goals.map((x, i) => (
              <button
                key={x.id}
                onClick={() => setSel(x.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '14px 16px',
                  background: sel === x.id ? 'var(--lo-surface-2)' : 'transparent',
                  border: 'none',
                  borderBottom: i < goals.length - 1 ? '1px solid var(--lo-border)' : 'none',
                  borderLeft: '2px solid ' + (sel === x.id ? 'var(--lo-accent)' : 'transparent'),
                  color: 'var(--lo-text)', fontFamily: 'inherit', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: 'var(--font-geist-mono)', fontSize: 10,
                    color: 'var(--lo-text-faint)', letterSpacing: '.06em', textTransform: 'uppercase',
                  }}>{x.category}</span>
                  {x.goalType === 'text' ? (
                    <span style={{
                      fontFamily: 'var(--font-geist-mono)', fontSize: 10,
                      color: x.current >= 1 ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
                      letterSpacing: '.04em',
                    }}>{x.current >= 1 ? 'osiągnięty' : 'w toku'}</span>
                  ) : x.goalType === 'abstinence' ? (
                    <span style={{
                      fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                      fontSize: 11, color: 'var(--lo-accent)',
                    }}>{x.current} dni</span>
                  ) : (
                    <span style={{
                      fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                      fontSize: 11, color: 'var(--lo-text-muted)',
                    }}>{x.pct}%</span>
                  )}
                </div>
                <div style={{ fontSize: 13, fontWeight: 450 }}>{x.name}</div>
                {x.goalType === 'text' ? (
                  <div style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>
                    {x.currentText || '—'} → {x.targetText || '—'}
                  </div>
                ) : x.goalType === 'abstinence' ? (
                  <Bar value={x.target > 0 ? x.pct : Math.min(100, x.current)} h={3} />
                ) : (
                  <Bar value={x.pct} h={3} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <GoalDetail key={g.id} g={g} onProgressSaved={handleProgressSaved} onReset={handleReset} onDeactivated={handleDeactivated} />
      </div>
    </>
  );
}
