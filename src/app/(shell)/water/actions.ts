'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { litresToGlasses } from '@/lib/water-utils';

export interface WaterLog {
  glasses: number;
  target: number;
  date: string;
}

async function getDefaultTarget(sb: Awaited<ReturnType<typeof createClient>>): Promise<number> {
  const { data } = await sb
    .from('user_settings')
    .select('value')
    .eq('key', 'water_target_glasses')
    .maybeSingle();
  return (data?.value as number) ?? 8;
}

export async function getWaterToday(): Promise<WaterLog> {
  const sb = await createClient();
  const date = new Date().toISOString().slice(0, 10);
  const [{ data }, defaultTarget] = await Promise.all([
    sb.from('water_logs').select('glasses, target').eq('date', date).maybeSingle(),
    getDefaultTarget(sb),
  ]);
  return {
    glasses: data?.glasses ?? 0,
    target: data?.target ?? defaultTarget,
    date,
  };
}

export async function setWaterGlasses(glasses: number, target: number) {
  const sb = await createClient();
  const date = new Date().toISOString().slice(0, 10);
  await sb
    .from('water_logs')
    .upsert({ date, glasses: Math.max(0, glasses), target }, { onConflict: 'date' });
  revalidatePath('/today');
  revalidatePath('/daily');
  revalidatePath('/water');
}

export async function setWaterTarget(glasses: number) {
  const sb = await createClient();
  const date = new Date().toISOString().slice(0, 10);
  await Promise.all([
    // persist as default
    sb.from('user_settings')
      .upsert({ key: 'water_target_glasses', value: glasses }, { onConflict: 'key' }),
    // update today's log target
    sb.from('water_logs')
      .upsert({ date, glasses: 0, target: glasses }, { onConflict: 'date' })
      .then(async () => {
        // keep existing glasses count, just update target
        const { data } = await sb.from('water_logs').select('glasses').eq('date', date).maybeSingle();
        if (data) {
          await sb.from('water_logs').update({ target: glasses }).eq('date', date);
        }
      }),
  ]);
  revalidatePath('/today');
  revalidatePath('/daily');
  revalidatePath('/water');
}
