'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface ChecklistItemDef {
  id: string;
  name: string;
  isStreak: boolean;
}

export interface DayData {
  date: string;
  focusMinutes: number;
  workMinutes: number;
  waterMl: number;
  waterTargetMl: number;
  habits: { id: string; name: string; done: boolean }[];
  sleepHours: number | null;
  weightKg: number | null;
  mood: number | null;
  checklist: { id: string; name: string; done: boolean; isStreak: boolean }[];
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

function computeItemStreak(
  logMap: Record<string, Record<string, boolean>>,
  itemId: string
): number {
  const today = new Date().toISOString().slice(0, 10);
  const todayDone = logMap[today]?.[itemId] === true;
  const startDaysBack = todayDone ? 0 : 1;
  let streak = 0;
  const base = new Date();
  for (let i = startDaysBack; i < 366; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    if (logMap[dateStr]?.[itemId] === true) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function getWeekData(weekOffset: number): Promise<{
  week: DayData[];
  checklistDefs: ChecklistItemDef[];
  streakCounts: Record<string, number>;
}> {
  const sb = await createClient();
  const dates = isoWeekDates(weekOffset);
  const start = dates[0];
  const end = dates[6];

  const since365 = new Date();
  since365.setDate(since365.getDate() - 365);
  const since365Str = since365.toISOString().slice(0, 10);

  const [habitsRes, logsRes, focusRes, sleepRes, weightRes, journalRes, checklistDefsRes, historyRes, waterRes] = await Promise.all([
    sb.from('habits').select('id, name').eq('active', true).order('created_at'),
    sb.from('habit_logs').select('habit_id, date, done').gte('date', start).lte('date', end),
    sb.from('daily_logs').select('date, focus_minutes, work_minutes, checklist').gte('date', start).lte('date', end),
    sb.from('sleep_logs').select('date, hours').gte('date', start).lte('date', end),
    sb.from('weight_logs').select('measured_at, weight_kg').gte('measured_at', start).lte('measured_at', end + 'T23:59:59'),
    sb.from('journal_entries').select('date, mood').gte('date', start).lte('date', end),
    sb.from('checklist_items').select('id, name, is_streak').eq('active', true).order('sort_order').order('created_at'),
    sb.from('daily_logs').select('date, checklist').gte('date', since365Str).order('date', { ascending: false }),
    sb.from('water_logs').select('date, ml, target_ml').gte('date', start).lte('date', end),
  ]);

  const habits = habitsRes.data ?? [];
  const logs = logsRes.data ?? [];
  const focusMap = Object.fromEntries((focusRes.data ?? []).map(r => [String(r.date), {
    minutes: r.focus_minutes,
    workMinutes: r.work_minutes ?? 0,
    checklist: (r.checklist ?? {}) as Record<string, boolean>,
  }]));
  const sleepMap = Object.fromEntries((sleepRes.data ?? []).map(r => [String(r.date), r.hours]));
  const weightMap: Record<string, number> = {};
  for (const r of (weightRes.data ?? [])) {
    const d = r.measured_at.slice(0, 10);
    if (!weightMap[d]) weightMap[d] = r.weight_kg ?? 0;
  }
  const moodMap = Object.fromEntries((journalRes.data ?? []).map(r => [String(r.date), r.mood]));
  const waterMap = Object.fromEntries((waterRes.data ?? []).map(r => [String(r.date), { ml: r.ml, targetMl: r.target_ml }]));
  const checklistDefs: ChecklistItemDef[] = (checklistDefsRes.data ?? []).map(r => ({
    id: r.id,
    name: r.name,
    isStreak: r.is_streak ?? false,
  }));

  // Build historical log map for streak computation
  const historyLogMap: Record<string, Record<string, boolean>> = {};
  for (const r of (historyRes.data ?? [])) {
    historyLogMap[String(r.date)] = (r.checklist ?? {}) as Record<string, boolean>;
  }

  const streakItems = checklistDefs.filter(d => d.isStreak);
  const streakCounts: Record<string, number> = {};
  for (const item of streakItems) {
    streakCounts[item.id] = computeItemStreak(historyLogMap, item.id);
  }

  const week = dates.map(date => {
    const dayLogs = logs.filter(l => String(l.date) === date);
    const doneSet = new Set(dayLogs.filter(l => l.done).map(l => l.habit_id));
    const focusEntry = focusMap[date];
    const checklistDone = focusEntry?.checklist ?? {};
    return {
      date,
      focusMinutes: focusEntry?.minutes ?? 0,
      workMinutes: focusEntry?.workMinutes ?? 0,
      waterMl: waterMap[date]?.ml ?? 0,
      waterTargetMl: waterMap[date]?.targetMl ?? 3000,
      habits: habits.map(h => ({ id: h.id, name: h.name, done: doneSet.has(h.id) })),
      sleepHours: sleepMap[date] ?? null,
      weightKg: weightMap[date] ?? null,
      mood: moodMap[date] ?? null,
      checklist: checklistDefs.map(item => ({
        id: item.id,
        name: item.name,
        done: checklistDone[item.id] ?? false,
        isStreak: item.isStreak,
      })),
    };
  });

  return { week, checklistDefs, streakCounts };
}

export async function upsertFocus(date: string, focus_minutes: number) {
  const sb = await createClient();
  await sb.from('daily_logs').upsert({ date, focus_minutes }, { onConflict: 'date' });
  revalidatePath('/daily');
  revalidatePath('/stats');
}

export async function upsertWork(date: string, work_minutes: number) {
  const sb = await createClient();
  await sb.from('daily_logs').upsert({ date, work_minutes }, { onConflict: 'date' });
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

export async function toggleChecklistItem(date: string, itemId: string, done: boolean) {
  const sb = await createClient();
  const { data } = await sb.from('daily_logs').select('checklist').eq('date', date).maybeSingle();
  const current = (data?.checklist ?? {}) as Record<string, boolean>;
  current[itemId] = done;
  await sb.from('daily_logs').upsert({ date, checklist: current }, { onConflict: 'date' });
  revalidatePath('/daily');
}

export async function addChecklistItem(name: string) {
  const sb = await createClient();
  await sb.from('checklist_items').insert({ name });
  revalidatePath('/daily');
}

export async function deleteChecklistItem(id: string) {
  const sb = await createClient();
  await sb.from('checklist_items').update({ active: false }).eq('id', id);
  revalidatePath('/daily');
}

export async function toggleStreakFlag(id: string, isStreak: boolean) {
  const sb = await createClient();
  await sb.from('checklist_items').update({ is_streak: isStreak }).eq('id', id);
  revalidatePath('/daily');
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
  return (data ?? []).map(r => ({ date: String(r.date), minutes: r.focus_minutes }));
}
