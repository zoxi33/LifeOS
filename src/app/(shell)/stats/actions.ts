'use server';

import { createClient } from '@/lib/supabase/server';
import { daysAgo } from '@/lib/supabase/queries';
import { computeStreak } from '@/lib/supabase/queries';

export interface HabitLogData {
  id: string;
  name: string;
  streak: number;
  doneDates: string[];   // ISO date strings where done=true
}

export interface HabitValueStat {
  id: string;
  name: string;
  unit: string;
  logs: { date: string; value: number }[];
}

export interface StatsData {
  activeHabits: number;
  journalCount: number;
  habitLogs: HabitLogData[];
  habitValueStats: HabitValueStat[];
  scatterPoints: { date: string; sleep: number; mood: number }[];
  weightPoints: { date: string; weight: number }[];
  focusPoints: { date: string; minutes: number }[];
}

export async function getStatsData(): Promise<StatsData> {
  const sb = await createClient();
  const since = daysAgo(365);

  type RawValueLog = { habit_id: string; date: string; value_numeric: number };

  const [
    { data: habits },
    { data: allLogs },
    { data: journal },
    { data: weights },
    { count: journalCount },
    { data: focusRaw },
    { data: habitsWithUnit },
    { data: valueLogs },
  ] = await Promise.all([
    sb.from('habits').select('id, name').eq('active', true),
    sb.from('habit_logs').select('habit_id, date, done').gte('date', since),
    sb.from('journal_entries')
      .select('date, sleep_hours, mood')
      .gte('date', since)
      .not('sleep_hours', 'is', null)
      .not('mood', 'is', null)
      .order('date'),
    sb.from('weight_logs')
      .select('measured_at, weight_kg')
      .gte('measured_at', since)
      .order('measured_at'),
    sb.from('journal_entries').select('*', { count: 'exact', head: true }),
    sb.from('daily_logs').select('date, focus_minutes').gte('date', since).order('date'),
    sb.from('habits').select('id, name, unit').eq('active', true).not('unit', 'is', null),
    sb.from('habit_logs').select('habit_id, date, value_numeric').gte('date', since).not('value_numeric', 'is', null),
  ]);

  const habitLogs: HabitLogData[] = (habits ?? []).map(h => {
    const logs = (allLogs ?? []).filter(l => l.habit_id === h.id);
    return {
      id: h.id,
      name: h.name,
      streak: computeStreak(logs, 'daily', 1),
      doneDates: logs.filter(l => l.done).map(l => l.date),
    };
  });

  const scatterPoints = (journal ?? [])
    .filter(e => e.sleep_hours != null && e.mood != null)
    .map(e => ({ date: e.date, sleep: e.sleep_hours!, mood: e.mood! }));

  const weightPoints = (weights ?? [])
    .filter(w => w.weight_kg != null)
    .map(w => ({
      date: w.measured_at.slice(0, 10),
      weight: w.weight_kg!,
    }));

  const focusPoints = (focusRaw ?? [])
    .filter(r => r.focus_minutes > 0)
    .map(r => ({ date: String(r.date), minutes: r.focus_minutes }));

  const rawValueLogs = (valueLogs ?? []) as unknown as RawValueLog[];
  const habitValueStats: HabitValueStat[] = ((habitsWithUnit ?? []) as unknown as { id: string; name: string; unit: string }[])
    .filter(h => h.unit)
    .map(h => ({
      id: h.id,
      name: h.name,
      unit: h.unit,
      logs: rawValueLogs
        .filter(l => l.habit_id === h.id)
        .map(l => ({ date: String(l.date), value: l.value_numeric })),
    }));

  return {
    activeHabits: habits?.length ?? 0,
    journalCount: journalCount ?? 0,
    habitLogs,
    habitValueStats,
    scatterPoints,
    weightPoints,
    focusPoints,
  };
}
