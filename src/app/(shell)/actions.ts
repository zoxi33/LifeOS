'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { xpForLevel, levelFromXP } from '@/lib/xp';

export async function signOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect('/login');
}

export interface SidebarXP {
  level: number;
  totalXP: number;
  xpInLevel: number;
  xpNeeded: number;
}

export async function getSidebarXP(): Promise<SidebarXP> {
  const sb = await createClient();
  const [habitCountRes, dailyLogsRes] = await Promise.all([
    sb.from('habit_logs').select('id', { count: 'exact', head: true }).eq('done', true),
    sb.from('daily_logs').select('focus_minutes, work_minutes'),
  ]);
  const habitXP = (habitCountRes.count ?? 0) * 10;
  const logXP = (dailyLogsRes.data ?? []).reduce((s, r) => {
    return s + Math.floor((r.focus_minutes ?? 0) / 30) * 8 + Math.floor((r.work_minutes ?? 0) / 60) * 5;
  }, 0);
  const totalXP = habitXP + logXP;
  const level = levelFromXP(totalXP);
  const xpInLevel = totalXP - xpForLevel(level);
  const xpNeeded = xpForLevel(level + 1) - xpForLevel(level);
  return { level, totalXP, xpInLevel, xpNeeded };
}
