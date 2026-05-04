// Shared query helpers — used by server actions
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type DB = SupabaseClient<Database>;

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function weekStart(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // Mon
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function computeStreak(
  logs: { date: string; done: boolean }[],
  type: string,
  target: number
): number {
  if (!logs.length) return 0;
  // Sort desc by date
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const todayStr = today();
  let streak = 0;
  let cursor = new Date(todayStr);

  for (const log of sorted) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    cursor.setHours(0, 0, 0, 0);
    const diff = Math.round((cursor.getTime() - logDate.getTime()) / 86400000);

    if (diff > 1) break; // gap
    if (diff === 0 || diff === 1) {
      if (log.done) { streak++; cursor = logDate; }
      else if (diff === 0) { /* today not done yet — skip */ }
      else break;
    }
  }
  return streak;
}
