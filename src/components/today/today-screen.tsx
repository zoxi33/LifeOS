'use client';

import { useState } from 'react';
import { Bar } from '@/components/primitives/bar';
import { SectionHeader } from '@/components/primitives/section-header';
import { StreakCard } from './streak-card';
import { HabitRow } from './habit-row';
import { QuickLog } from './quick-log';
import { GoalsStrip } from './goals-strip';
import { StatTile } from './stat-tile';
import { FinanceMini } from './finance-mini';
import { AddHabitDialog } from '@/components/habits/add-habit-dialog';
import { useTweaks } from '@/hooks/use-tweaks';
import { toggleHabitLog } from '@/app/(shell)/habits/actions';
import type { TodayHabit, Goal } from '@/types/lifeos';
import type { TodayStats, TodayFinance } from '@/app/(shell)/today/actions';

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: 'var(--font-geist-mono)', fontSize: 11, padding: '2px 6px',
      border: '1px solid var(--lo-border)', borderBottomWidth: 2,
      borderRadius: 4, color: 'var(--lo-text-muted)', background: 'var(--lo-bg-2)',
    }}>{children}</span>
  );
}

interface TodayScreenProps {
  initialHabits?: TodayHabit[];
  stats?: TodayStats;
  finance?: TodayFinance;
  goals?: Goal[];
}

export function TodayScreen({ initialHabits = [], stats, finance, goals = [] }: TodayScreenProps) {
  const [habits, setHabits] = useState<TodayHabit[]>(initialHabits);
  const [addHabit, setAddHabit] = useState(false);
  const [tweaks] = useTweaks();

  const toggle = async (id: string) => {
    const h = habits.find(x => x.id === id);
    if (!h) return;
    const newDone = !h.done;
    setHabits(hs => hs.map(x => x.id === id
      ? { ...x, done: newDone, streak: newDone ? x.streak + 1 : Math.max(0, x.streak - 1) }
      : x
    ));
    try {
      await toggleHabitLog(id, new Date().toISOString().slice(0, 10), newDone);
    } catch {
      setHabits(hs => hs.map(x => x.id === id ? { ...x, done: h.done, streak: h.streak } : x));
    }
  };

  const done = habits.filter(h => h.done).length;
  const total = habits.length;
  const streakProm = tweaks.streakProminence;

  // Best streak among all habits
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const bestStreakHabit = habits.find(h => h.streak === bestStreak);

  // Stat tile values
  const weightVal = stats?.weightCurrent != null ? stats.weightCurrent.toFixed(1) : '—';
  const weightDelta = stats?.weightDelta != null
    ? (stats.weightDelta > 0 ? `+${stats.weightDelta}` : `${stats.weightDelta}`) + ' kg'
    : '—';
  const sleepVal = stats?.sleepAvg != null ? stats.sleepAvg.toFixed(1) : '—';
  const moodVal = stats?.moodAvg != null ? stats.moodAvg.toFixed(1) : '—';

  const defaultFinance: TodayFinance = { totalSpent: 0, monthLabel: '', categories: [] };

  return (
    <>
      <AddHabitDialog open={addHabit} onOpenChange={setAddHabit} />

      <div className="lo-screen" style={{
        padding: '20px 24px 40px',
        display: 'flex', flexDirection: 'column', gap: 20,
        maxWidth: 1280, margin: '0 auto', width: '100%',
      }}>

        {/* ── Top row ──────────────────────────────────────────────── */}
        <div className="lo-mobile-1col" style={{
          display: 'grid',
          gridTemplateColumns: streakProm === 'high' ? '1fr' : '1.2fr 1fr 1fr',
          gap: 16,
        }}>
          {streakProm === 'high' ? (
            <StreakCard days={bestStreak} label={bestStreakHabit?.name ?? 'Streak'} since="" prominence="high" />
          ) : (
            <>
              {/* Day progress */}
              <div style={{
                background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
                borderRadius: 12, padding: '18px 20px',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="label-eyebrow">Postęp dnia</div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 22, padding: '0 8px',
                    background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
                    borderRadius: 999, fontSize: 11, color: 'var(--lo-text-muted)',
                    fontFamily: 'var(--font-geist-mono)',
                  }}>tydz. {getWeekNumber()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{
                    fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                    fontSize: 36, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1,
                  }}>
                    {total === 0 ? '—' : done}
                    {total > 0 && <span style={{ color: 'var(--lo-text-faint)' }}>/{total}</span>}
                  </div>
                  {total > 0 && <div style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>nawyków</div>}
                </div>
                {total > 0 && <Bar value={done} max={total} h={6} />}
                {total === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>Dodaj nawyki poniżej</div>
                )}
              </div>

              {bestStreak > 0 ? (
                <StreakCard days={bestStreak} label={bestStreakHabit?.name ?? 'Streak'} since="" prominence={streakProm} />
              ) : (
                <div style={{
                  background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
                  borderRadius: 12, padding: '18px 20px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8,
                }}>
                  <div className="label-eyebrow">Streak</div>
                  <div style={{ fontSize: 13, color: 'var(--lo-text-muted)' }}>Brak aktywnych streków</div>
                </div>
              )}

              {tweaks.showXP ? (
                <div style={{
                  background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
                  borderRadius: 12, padding: '18px 20px',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <div className="label-eyebrow">XP</div>
                  <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 28, fontWeight: 500 }}>0</div>
                  <div style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>Level 1</div>
                </div>
              ) : (
                <div style={{
                  background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
                  borderRadius: 12, padding: '18px 20px',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <div className="label-eyebrow">Dziś</div>
                  <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 13, color: 'var(--lo-text-muted)' }}>
                    {new Date().toLocaleDateString('pl', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Main 2-col: habits + quick log ──────────────────────── */}
        <div className="lo-mobile-1col" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16 }}>
          {/* Habits card */}
          <div style={{
            background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
            borderRadius: 12, padding: '18px 20px',
          }}>
            <SectionHeader
              eyebrow={total > 0 ? `${done} z ${total} ukończone` : 'Nawyki'}
              title="Dzisiejsze nawyki"
              action={
                <button
                  onClick={() => setAddHabit(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    height: 32, padding: '0 12px',
                    background: 'transparent', color: 'var(--lo-text-muted)',
                    border: '1px solid transparent', borderRadius: 8,
                    fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  + Dodaj
                </button>
              }
            />
            {habits.length === 0 ? (
              <div style={{ padding: '20px 0', fontSize: 13, color: 'var(--lo-text-muted)' }}>
                Brak nawyków — kliknij &quot;Dodaj&quot; żeby zacząć.
              </div>
            ) : (
              <div style={{ marginTop: -4 }}>
                {habits.map(h => <HabitRow key={h.id} h={h} onToggle={toggle} />)}
              </div>
            )}
          </div>

          <QuickLog />
        </div>

        {/* ── Goals ───────────────────────────────────────────────── */}
        <GoalsStrip goals={goals} />

        {/* ── Stats 3-col ─────────────────────────────────────────── */}
        <div className="lo-grid-3col" style={{ gap: 16 }}>
          <StatTile icon="weight" label="Waga" value={weightVal} unit="kg"
            delta={stats?.weightDelta != null ? weightDelta : undefined}
            deltaTone={stats?.weightDelta != null ? (stats.weightDelta < 0 ? 'good' : 'bad') : 'neutral'}
            series={stats?.weightSeries?.length ? stats.weightSeries : undefined} />
          <StatTile icon="moon" label="Sen (śr. 14d)" value={sleepVal} unit="h"
            deltaTone="neutral"
            series={stats?.sleepSeries?.length ? stats.sleepSeries : undefined} />
          <StatTile icon="mood" label="Nastrój (śr. 14d)" value={moodVal} unit="/5"
            deltaTone="neutral"
            series={stats?.moodSeries?.length ? stats.moodSeries : undefined} />
        </div>

        {/* ── Finance + Journal 2-col ──────────────────────────────── */}
        <div className="lo-grid-2col" style={{ gap: 16 }}>
          <FinanceMini finance={finance ?? defaultFinance} />

          {/* Journal preview */}
          <div style={{
            background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
            borderRadius: 12, padding: '18px 20px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <SectionHeader
              eyebrow="Dziennik"
              title="Dzisiaj nie napisałeś jeszcze"
              action={
                <a href="/journal" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  height: 28, padding: '0 12px',
                  background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
                  border: '1px solid var(--lo-accent-line)', borderRadius: 8,
                  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                  textDecoration: 'none',
                }}>Otwórz</a>
              }
            />
            <div style={{
              border: '1px dashed var(--lo-border-strong)',
              borderRadius: 8, padding: 18,
              color: 'var(--lo-text-faint)', fontSize: 13, lineHeight: 1.55,
              minHeight: 110, fontStyle: 'italic',
            }}>
              Co dziś poszło dobrze? Co cię zaskoczyło? Co możesz zrobić jutro lepiej?
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-dim)' }}>
                szybki log dzienniczy → QuickLog po lewej
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>J</Kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function getWeekNumber() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
