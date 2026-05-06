'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface StreakTracker {
  id: string;
  name: string;
  startedAt: string; // YYYY-MM-DD
  days: number;
}

function calcDays(startedAt: string): number {
  const start = new Date(startedAt + 'T00:00:00');
  const now   = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((now.getTime() - start.getTime()) / 86400000));
}

export async function getStreakTrackers(): Promise<StreakTracker[]> {
  const sb = await createClient();
  const { data } = await sb
    .from('streak_trackers')
    .select('id, name, started_at')
    .eq('active', true)
    .order('created_at');

  return (data ?? []).map(r => ({
    id: r.id,
    name: r.name,
    startedAt: String(r.started_at),
    days: calcDays(String(r.started_at)),
  }));
}

export async function resetStreak(id: string) {
  const sb = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  await sb.from('streak_trackers').update({ started_at: today }).eq('id', id);
  revalidatePath('/today');
  revalidatePath('/streaks');
}

export async function addStreakTracker(name: string): Promise<StreakTracker> {
  const sb = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await sb
    .from('streak_trackers')
    .insert({ name, started_at: today })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'insert failed');
  revalidatePath('/today');
  revalidatePath('/streaks');
  return { id: data.id, name: data.name, startedAt: today, days: 0 };
}

export async function deleteStreakTracker(id: string) {
  const sb = await createClient();
  await sb.from('streak_trackers').update({ active: false }).eq('id', id);
  revalidatePath('/today');
  revalidatePath('/streaks');
}
