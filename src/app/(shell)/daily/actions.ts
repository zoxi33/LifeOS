'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface DayData {
  date: string;             // YYYY-MM-DD
  focusMinutes: number;
  habits: { id: string; name: string; done: boolean }[];
  sleepHours: number | null;
  weightKg: number | null;
  mood: number | null;
}

function isoWeekDates(weekOffset: number): string[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export async function getWeekData(weekOffset: number): Promise<DayData[]> {
  const sb = await createClient();
  const dates = isoWeekDates(weekOffset);
  const start = dates[0];
  const end = dates[6];

  const [habitsRes, logsRes, focusRes, sleepRes, weightRes, journalRes] = await Promise.all([
    sb.from('habits').select('id, name').eq('active', true).order('created_at'),
    sb.from('habit_logs').select('habit_id, date, done').gte('date', start).lte('date', end),
    sb.from('daily_logs').select('date, focus_minutes').gte('date', start).lte('date', end),
    sb.from('sleep_logs').select('date, hours').gte('date', start).lte('date', end),
    sb.from('weight_logs').select('measured_at, weight_kg').gte('measured_at', start).lte('measured_at', end + 'T23:59:59'),
    sb.from('journal_entries').select('date, mood').gte('date', start).lte('date', end),
  ]);

  const habits = habitsRes.data ?? [];
  const logs = logsRes.data ?? [];
  const focusMap = Object.fromEntries((focusRes.data ?? []).map(r => [r.date, r.focus_minutes]));
  const sleepMap = Object.fromEntries((sleepRes.data ?? []).map(r => [String(r.date), r.hours]));
  const weightMap: Record<string, number> = {};
  for (const r of (weightRes.data ?? [])) {
    const d = r.measured_at.slice(0, 10);
    if (!weightMap[d]) weightMap[d] = r.weight_kg ?? 0;
  }
  const moodMap = Object.fromEntries((journalRes.data ?? []).map(r => [String(r.date), r.mood]));

  return dates.map(date => {
    const dayLogs = logs.filter(l => String(l.date) === date);
    const doneSet = new Set(dayLogs.filter(l => l.done).map(l => l.habit_id));
    return {
      date,
      focusMinutes: focusMap[date] ?? 0,
      habits: habits.map(h => ({ id: h.id, name: h.name, done: doneSet.has(h.id) })),
      sleepHours: sleepMap[date] ?? null,
      weightKg: weightMap[date] ?? null,
      mood: moodMap[date] ?? null,
    };
  });
}

export async function upsertFocus(date: string, focus_minutes: number) {
  const sb = await createClient();
  await sb.from('daily_logs').upsert({ date, focus_minutes }, { onConflict: 'date' });
  revalidatePath('/daily');
  revalidatePath('/stats');
}

export async function toggleHabitForDate(habitId: string, date: string, done: boolean) {
  const sb = await createClient();
  await sb.from('habit_logs').upsert({ habit_id: habitId, date, done }, { onConflict: 'habit_id,date' });
  revalidatePath('/daily');
  revalidatePath('/today');
  revalidatePath('/habits');
}

export async function getFocusSeries(): Promise<{ date: string; minutes: number }[]> {
  const sb = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data } = await sb
    .from('daily_logs')
    .select('date, focus_minutes')
    .gte('date', since.toISOString().slice(0, 10))
    .order('date');
  return (data ?? []).map(r => ({ date: r.date, minutes: r.focus_minutes }));
}
