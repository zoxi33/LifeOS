'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { today, weekStart, daysAgo, computeStreak, computeBestStreak } from '@/lib/supabase/queries';
import type { TodayHabit, HabitFull } from '@/types/lifeos';

export async function getHabitsForToday(): Promise<TodayHabit[]> {
  const sb = await createClient();
  const t = today();
  const ws = weekStart();

  const { data: habits } = await sb
    .from('habits')
    .select('*')
    .eq('active', true)
    .order('created_at');

  if (!habits?.length) return [];

  const ids = habits.map(h => h.id);

  const { data: logs } = await sb
    .from('habit_logs')
    .select('habit_id, date, done')
    .in('habit_id', ids)
    .gte('date', ws)
    .lte('date', t);

  return habits.map(h => {
    const hLogs = (logs ?? []).filter(l => l.habit_id === h.id);
    const todayLog = hLogs.find(l => l.date === t);
    const week = [0, 1, 2, 3, 4, 5, 6].map(offset => {
      const d = new Date(ws);
      d.setDate(d.getDate() + offset);
      const ds = d.toISOString().slice(0, 10);
      return hLogs.find(l => l.date === ds)?.done ? 1 : 0;
    });
    return {
      id: h.id,
      name: h.name,
      emoji: h.emoji ?? '',
      freq: h.freq,
      done: todayLog?.done ?? false,
      streak: computeStreak(hLogs, h.type, h.target),
      week,
    };
  });
}

export async function getHabitsList(): Promise<HabitFull[]> {
  return getHabitsRange(90);
}

export async function getHabitsRange(days: number | null): Promise<HabitFull[]> {
  const sb = await createClient();
  const since = days ? daysAgo(days) : null;
  const ws = weekStart();
  const t = today();

  const { data: habits } = await sb
    .from('habits')
    .select('*')
    .eq('active', true)
    .order('created_at');

  if (!habits?.length) return [];

  const ids = habits.map(h => h.id);

  type HabitLog = { habit_id: string; date: string; done: boolean; value_numeric: number | null };

  let baseQuery = sb
    .from('habit_logs')
    .select('habit_id, date, done, value_numeric')
    .in('habit_id', ids);
  if (since) baseQuery = baseQuery.gte('date', since) as typeof baseQuery;

  const [allResult, weekResult] = await Promise.all([
    baseQuery,
    sb.from('habit_logs').select('habit_id, date, done, value_numeric').in('habit_id', ids).gte('date', ws).lte('date', t),
  ]);

  const allLogs = (allResult.data ?? []) as unknown as HabitLog[];
  const weekLogs = (weekResult.data ?? []) as unknown as HabitLog[];

  return habits.map(h => {
    const all = allLogs.filter(l => l.habit_id === h.id);
    const wk  = weekLogs.filter(l => l.habit_id === h.id);
    const done = all.filter(l => l.done).length;
    const createdAt = h.created_at ? new Date(h.created_at) : new Date();
    const daysSinceCreated = Math.max(1, Math.round((Date.now() - createdAt.getTime()) / 86400000));
    const activeDays = days ? Math.min(days, daysSinceCreated) : daysSinceCreated;
    const completionRate = done / activeDays;
    const weekDone = wk.filter(l => l.done).length;
    const streak = computeStreak(all, h.type, h.target);
    const todayDone = wk.find(l => l.date === t)?.done ?? false;
    const todayLog = wk.find(l => l.date === t);

    return {
      id: h.id,
      name: h.name,
      emoji: h.emoji ?? '',
      freq: h.freq,
      type: h.type as HabitFull['type'],
      streak,
      best: computeBestStreak(all),
      completionRate,
      target: h.target,
      week: weekDone,
      todayDone,
      unit: (h as Record<string, unknown>).unit as string ?? '',
      todayValue: todayLog?.value_numeric ?? null,
      logs: all.map(l => ({ date: l.date, done: l.done, value: l.value_numeric })),
    };
  });
}

export async function toggleHabitLog(habitId: string, date: string, done: boolean) {
  const sb = await createClient();
  await sb
    .from('habit_logs')
    .upsert({ habit_id: habitId, date, done }, { onConflict: 'habit_id,date' });
  revalidatePath('/today');
  revalidatePath('/habits');
}

export async function logHabitValue(habitId: string, date: string, value: number | null) {
  const sb = await createClient();
  const { error } = await sb
    .from('habit_logs')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(
      { habit_id: habitId, date, done: true, value_numeric: value } as any,
      { onConflict: 'habit_id,date' }
    );
  if (error) throw new Error(error.message);
  revalidatePath('/today');
  revalidatePath('/habits');
}

export async function createHabit(data: {
  name: string; emoji?: string; freq: string; type: string; target: number; unit?: string;
}): Promise<HabitFull> {
  const sb = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row, error } = await sb.from('habits').insert(data as any).select().single();
  if (error || !row) throw new Error(error?.message ?? 'insert failed');
  revalidatePath('/today');
  revalidatePath('/habits');
  revalidatePath('/daily');
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji ?? '',
    freq: row.freq,
    type: row.type as HabitFull['type'],
    streak: 0,
    best: 0,
    completionRate: 0,
    target: row.target,
    week: 0,
    todayDone: false,
    unit: data.unit ?? '',
    todayValue: null,
    logs: [],
  };
}

export async function updateHabit(id: string, data: {
  name: string; emoji?: string; freq: string; type: string; target: number; unit?: string;
}): Promise<void> {
  const sb = await createClient();
  await sb.from('habits').update(data as any).eq('id', id);
  revalidatePath('/today');
  revalidatePath('/habits');
  revalidatePath('/daily');
}

export async function deleteHabit(id: string) {
  const sb = await createClient();
  await sb.from('habits').update({ active: false }).eq('id', id);
  revalidatePath('/today');
  revalidatePath('/habits');
}
