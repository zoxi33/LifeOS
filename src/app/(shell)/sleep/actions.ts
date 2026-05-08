'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { today } from '@/lib/supabase/queries';
import type { SleepDay } from '@/types/lifeos';

export async function getSleepLogs(): Promise<SleepDay[]> {
  return getSleepRange(30);
}

export async function getSleepRange(days: number | null): Promise<SleepDay[]> {
  const sb = await createClient();
  let q = sb.from('sleep_logs').select('*').order('date', { ascending: false });
  if (days !== null) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    q = q.gte('date', since.toISOString().slice(0, 10)) as typeof q;
  }
  const { data } = await q;
  return (data ?? []).reverse().map((e, i) => ({
    id:      e.id,
    date:    i,
    dateStr: e.date as string,
    hours:   e.hours    ?? 0,
    bed:     e.bed_time ?? 22.5,
    wake:    e.wake_time ?? 6.5,
    quality: e.quality  ?? 3,
  }));
}

export async function logSleep(data: {
  hours: number; bed_time: number; wake_time: number; quality: number;
}): Promise<SleepDay> {
  const sb = await createClient();
  const { data: row, error } = await sb
    .from('sleep_logs')
    .upsert({ ...data, date: today() }, { onConflict: 'date' })
    .select()
    .single();
  if (error || !row) throw new Error(error?.message ?? 'insert failed');
  revalidatePath('/sleep');
  revalidatePath('/today');
  return {
    id: row.id, date: 0, dateStr: row.date as string,
    hours: row.hours ?? 0, bed: row.bed_time ?? 22.5,
    wake: row.wake_time ?? 6.5, quality: row.quality ?? 3,
  };
}

export async function updateSleepLog(id: string, data: {
  hours: number; bed_time: number; wake_time: number; quality: number;
}) {
  const sb = await createClient();
  await sb.from('sleep_logs').update(data).eq('id', id);
  revalidatePath('/sleep');
  revalidatePath('/today');
}

export async function deleteSleepLog(id: string) {
  const sb = await createClient();
  await sb.from('sleep_logs').delete().eq('id', id);
  revalidatePath('/sleep');
  revalidatePath('/today');
}
