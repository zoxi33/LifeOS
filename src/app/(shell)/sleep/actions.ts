'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { today } from '@/lib/supabase/queries';
import type { SleepDay } from '@/types/lifeos';

export async function getSleepLogs(): Promise<SleepDay[]> {
  const sb = await createClient();
  const { data } = await sb
    .from('sleep_logs')
    .select('*')
    .order('date', { ascending: false })
    .limit(30);

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
}) {
  const sb = await createClient();
  const { error } = await sb
    .from('sleep_logs')
    .upsert({ ...data, date: today() }, { onConflict: 'date' });
  if (error) throw new Error(error.message);
  revalidatePath('/sleep');
  revalidatePath('/today');
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
