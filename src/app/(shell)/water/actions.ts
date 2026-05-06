'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface WaterLog {
  ml: number;
  targetMl: number;
  date: string;
}

async function getDefaultTargetMl(sb: Awaited<ReturnType<typeof createClient>>): Promise<number> {
  const { data } = await sb
    .from('user_settings')
    .select('value')
    .eq('key', 'water_target_ml')
    .maybeSingle();
  return (data?.value as number) ?? 3000;
}

export async function getWaterToday(): Promise<WaterLog> {
  const sb = await createClient();
  const date = new Date().toISOString().slice(0, 10);
  const [{ data }, defaultTarget] = await Promise.all([
    sb.from('water_logs').select('ml, target_ml').eq('date', date).maybeSingle(),
    getDefaultTargetMl(sb),
  ]);
  return {
    ml: data?.ml ?? 0,
    targetMl: data?.target_ml ?? defaultTarget,
    date,
  };
}

export async function addWaterMl(amount: number, currentMl: number, targetMl: number) {
  const sb = await createClient();
  const date = new Date().toISOString().slice(0, 10);
  const next = Math.max(0, currentMl + amount);
  await sb.from('water_logs').upsert(
    { date, ml: next, target_ml: targetMl },
    { onConflict: 'date' }
  );
  revalidatePath('/today');
  revalidatePath('/daily');
  revalidatePath('/water');
}

export async function setWaterMl(ml: number, targetMl: number) {
  const sb = await createClient();
  const date = new Date().toISOString().slice(0, 10);
  await sb.from('water_logs').upsert(
    { date, ml: Math.max(0, ml), target_ml: targetMl },
    { onConflict: 'date' }
  );
  revalidatePath('/today');
  revalidatePath('/daily');
  revalidatePath('/water');
}

export async function setWaterTarget(targetMl: number) {
  const sb = await createClient();
  const date = new Date().toISOString().slice(0, 10);
  await Promise.all([
    sb.from('user_settings').upsert(
      { key: 'water_target_ml', value: targetMl },
      { onConflict: 'key' }
    ),
    sb.from('water_logs').upsert(
      { date, ml: 0, target_ml: targetMl },
      { onConflict: 'date' }
    ).then(async () => {
      const { data } = await sb.from('water_logs').select('ml').eq('date', date).maybeSingle();
      if (data !== null) {
        await sb.from('water_logs').update({ target_ml: targetMl }).eq('date', date);
      }
    }),
  ]);
  revalidatePath('/today');
  revalidatePath('/daily');
  revalidatePath('/water');
}
