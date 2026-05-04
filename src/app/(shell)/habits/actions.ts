'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { today, weekStart, daysAgo, computeStreak } from '@/lib/supabase/queries';
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
      freq: h.freq,
      done: todayLog?.done ?? false,
      streak: computeStreak(hLogs, h.type, h.target),
      week,
    };
  });
}

export async function getHabitsList(): Promise<HabitFull[]> {
  const sb = await createClient();
  const since = daysAgo(90);
  const ws = weekStart();
  const t = today();

  const { data: habits } = await sb
    .from('habits')
    .select('*')
    .eq('active', true)
    .order('created_at');

  if (!habits?.length) return [];

  const ids = habits.map(h => h.id);

  const { data: logs90 } = await sb
    .from('habit_logs')
    .select('habit_id, date, done')
    .in('habit_id', ids)
    .gte('date', since);

  const { data: weekLogs } = await sb
    .from('habit_logs')
    .select('habit_id, date, done')
    .in('habit_id', ids)
    .gte('date', ws)
    .lte('date', t);

  return habits.map(h => {
    const all = (logs90 ?? []).filter(l => l.habit_id === h.id);
    const wk  = (weekLogs ?? []).filter(l => l.habit_id === h.id);
    const done = all.filter(l => l.done).length;
    const completionRate = all.length ? done / all.length : 0;
    const weekDone = wk.filter(l => l.done).length;
    const streak = computeStreak(all, h.type, h.target);

    return {
      id: h.id,
      name: h.name,
      freq: h.freq,
      type: h.type as HabitFull['type'],
      streak,
      best: streak,
      completionRate,
      target: h.target,
      week: weekDone,
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

export async function createHabit(data: {
  name: string; freq: string; type: string; target: number;
}) {
  const sb = await createClient();
  const { error } = await sb.from('habits').insert(data);
  if (error) throw new Error(error.message);
  revalidatePath('/today');
  revalidatePath('/habits');
}

export async function deleteHabit(id: string) {
  const sb = await createClient();
  await sb.from('habits').update({ active: false }).eq('id', id);
  revalidatePath('/today');
  revalidatePath('/habits');
}
