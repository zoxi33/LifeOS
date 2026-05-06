'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { WeightEntry } from '@/types/lifeos';

export async function getWeightLogs(): Promise<{
  entries: WeightEntry[];
  rawPoints: { date: string; weight: number }[];
}> {
  const sb = await createClient();
  const { data } = await sb
    .from('weight_logs')
    .select('*')
    .order('measured_at', { ascending: false })
    .limit(365);

  const entries: WeightEntry[] = (data ?? []).slice(0, 10).map((e, i, arr) => {
    const prev = arr[i + 1];
    const delta = prev ? (e.weight_kg ?? 0) - (prev.weight_kg ?? 0) : 0;
    const d = new Date(e.measured_at);
    return {
      id: e.id,
      d: d.toLocaleDateString('pl', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
      w: e.weight_kg ?? 0,
      delta: Math.round(delta * 10) / 10,
    };
  });

  const rawPoints = [...(data ?? [])].reverse().map(e => ({
    date: e.measured_at,
    weight: e.weight_kg ?? 0,
  }));

  return { entries, rawPoints };
}

export async function logWeight(weight_kg: number) {
  const sb = await createClient();
  const { error } = await sb.from('weight_logs').insert({
    measured_at: new Date().toISOString(),
    weight_kg,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/weight');
  revalidatePath('/today');
}

export async function updateWeightLog(id: string, weight_kg: number) {
  const sb = await createClient();
  await sb.from('weight_logs').update({ weight_kg }).eq('id', id);
  revalidatePath('/weight');
  revalidatePath('/today');
}

export async function deleteWeightLog(id: string) {
  const sb = await createClient();
  await sb.from('weight_logs').delete().eq('id', id);
  revalidatePath('/weight');
  revalidatePath('/today');
}
