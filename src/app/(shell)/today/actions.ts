'use server';

import { createClient } from '@/lib/supabase/server';
import { daysAgo, weekStart, today as todayStr } from '@/lib/supabase/queries';

// ─── XP helpers ───────────────────────────────────────────────────────────────
// Level n requires xpForLevel(n) total XP.
// Formula: 50 * n * (n-1)  →  L1=0, L2=100, L3=300, L4=600, L5=1000 …
function xpForLevel(n: number): number { return 50 * n * (n - 1); }
function levelFromXP(xp: number): number {
  return Math.max(1, Math.floor((1 + Math.sqrt(1 + 8 * xp / 100)) / 2));
}

function daysDiff(a: string, b: string): number {
  return Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000);
}

// Streak item XP rates per day:  0–6d → +5,  7–29d → +10,  30+d → +20
// Milestone bonuses (one-time):  7d → +100,  30d → +300,  100d → +1000
// Break penalty: -min(streak * 5, 500)
function computeStreakItemXP(
  logs: { date: string; checklist: Record<string, boolean> }[],
  itemId: string
): number {
  let xp = 0;
  let streak = 0;
  let prevDate: string | null = null;

  for (const log of logs) {
    const done = log.checklist[itemId] === true;
    const isConsec = prevDate ? daysDiff(prevDate, log.date) === 1 : true;

    if (done) {
      if (!isConsec) streak = 0;
      streak++;
      xp += streak >= 30 ? 20 : streak >= 7 ? 10 : 5;
      if (streak === 7)   xp += 100;
      if (streak === 30)  xp += 300;
      if (streak === 100) xp += 1000;
      prevDate = log.date;
    } else {
      // Explicit break (log exists, item not checked, consecutive day after streak)
      if (streak > 0 && isConsec) {
        xp -= Math.min(streak * 5, 500);
      }
      streak = 0;
      prevDate = log.date;
    }
  }
  return xp;
}


export interface XPData {
  totalXP: number;
  todayXP: number;
  weekXP: number;
  streakBonus: number;   // XP contribution from streak items (net: bonuses - penalties)
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
}

export interface TodayStats {
  weightCurrent: number | null;
  weightDelta: number | null;
  weightSeries: number[];
  sleepAvg: number | null;
  sleepSeries: number[];
  moodAvg: number | null;
  moodSeries: number[];
}

export interface TodayFinance {
  totalSpent: number;
  monthLabel: string;
  categories: { name: string; amount: number; pct: number }[];
}

export async function getTodayStats(): Promise<TodayStats> {
  const sb = await createClient();
  const since14 = daysAgo(14);
  const since30 = daysAgo(30);

  const [{ data: wRecent }, { data: wOld }, { data: sLogs }, { data: jEntries }] = await Promise.all([
    sb.from('weight_logs').select('weight_kg').gte('measured_at', since14).order('measured_at'),
    sb.from('weight_logs').select('weight_kg').lt('measured_at', since14).gte('measured_at', since30).order('measured_at').limit(1),
    sb.from('sleep_logs').select('hours').gte('date', since14).order('date'),
    sb.from('journal_entries').select('mood').gte('date', since14).order('date'),
  ]);

  const wData = (wRecent ?? []).map(w => w.weight_kg).filter((v): v is number => v !== null);
  const weightCurrent = wData.length ? wData[wData.length - 1] : null;
  const weightOld = wOld?.[0]?.weight_kg ?? null;
  const weightDelta = weightCurrent != null && weightOld != null
    ? +(weightCurrent - weightOld).toFixed(1)
    : null;

  const sData = (sLogs ?? []).map(s => s.hours).filter((v): v is number => v !== null);
  const sleepAvg = sData.length
    ? +(sData.reduce((a, b) => a + b, 0) / sData.length).toFixed(1)
    : null;

  const mData = (jEntries ?? []).map(j => j.mood).filter((v): v is number => v !== null);
  const moodAvg = mData.length
    ? +(mData.reduce((a, b) => a + b, 0) / mData.length).toFixed(1)
    : null;

  return { weightCurrent, weightDelta, weightSeries: wData, sleepAvg, sleepSeries: sData, moodAvg, moodSeries: mData };
}

export async function getTodayFinance(): Promise<TodayFinance> {
  const sb = await createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  const ms = monthStart.toISOString().slice(0, 10);

  const { data: txs } = await sb
    .from('transactions')
    .select('amount, category, type')
    .gte('date', ms)
    .eq('type', 'expense');

  const month = new Date().toLocaleString('pl', { month: 'long', year: 'numeric' });
  if (!txs?.length) return { totalSpent: 0, monthLabel: month, categories: [] };

  const totalSpent = txs.reduce((s, t) => s + (t.amount ?? 0), 0);
  const byCat: Record<string, number> = {};
  txs.forEach(t => {
    const cat = t.category ?? 'Inne';
    byCat[cat] = (byCat[cat] ?? 0) + (t.amount ?? 0);
  });

  const categories = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, amount]) => ({
      name,
      amount: Math.round(amount),
      pct: Math.round((amount / totalSpent) * 100),
    }));

  return { totalSpent: Math.round(totalSpent), monthLabel: month, categories };
}

export async function getXPData(): Promise<XPData> {
  const sb = await createClient();
  const today = todayStr();
  const ws    = weekStart();

  const [allLogsRes, dailyAllRes, weekLogsRes, dailyTodayRes, dailyWeekRes, streakItemsRes, streakLogsRes] = await Promise.all([
    sb.from('habit_logs').select('id', { count: 'exact', head: true }).eq('done', true),
    sb.from('daily_logs').select('focus_minutes, work_minutes'),
    sb.from('habit_logs').select('id', { count: 'exact', head: true }).eq('done', true).gte('date', ws).lte('date', today),
    sb.from('daily_logs').select('focus_minutes, work_minutes').eq('date', today).maybeSingle(),
    sb.from('daily_logs').select('focus_minutes, work_minutes').gte('date', ws).lte('date', today),
    sb.from('checklist_items').select('id').eq('is_streak', true).eq('active', true),
    sb.from('daily_logs').select('date, checklist').order('date', { ascending: true }),
  ]);

  function logXP(focusMin: number, workMin: number) {
    return Math.floor(focusMin / 30) * 8 + Math.floor(workMin / 60) * 5;
  }

  const habitXPRate   = 10;
  const totalHabitXP  = (allLogsRes.count ?? 0) * habitXPRate;
  const totalLogXP    = (dailyAllRes.data ?? []).reduce((s, r) => s + logXP(r.focus_minutes ?? 0, r.work_minutes ?? 0), 0);

  // Streak item XP (bonuses + penalties)
  const streakItemIds = (streakItemsRes.data ?? []).map(r => r.id);
  const streakLogs = (streakLogsRes.data ?? []).map(r => ({
    date: String(r.date),
    checklist: (r.checklist ?? {}) as Record<string, boolean>,
  }));
  let streakBonus = 0;
  for (const itemId of streakItemIds) {
    streakBonus += computeStreakItemXP(streakLogs, itemId);
  }

  const totalXP = totalHabitXP + totalLogXP + Math.max(streakBonus, 0);

  const weekHabitXP  = (weekLogsRes.count ?? 0) * habitXPRate;
  const weekLogXP    = (dailyWeekRes.data ?? []).reduce((s, r) => s + logXP(r.focus_minutes ?? 0, r.work_minutes ?? 0), 0);
  const weekXP       = weekHabitXP + weekLogXP;

  const todayRow   = dailyTodayRes.data;
  const todayXP    = todayRow ? logXP(todayRow.focus_minutes ?? 0, todayRow.work_minutes ?? 0) : 0;

  const level          = levelFromXP(totalXP);
  const xpInLevel      = totalXP - xpForLevel(level);
  const xpForNextLevel = xpForLevel(level + 1) - xpForLevel(level);

  return { totalXP, todayXP, weekXP, streakBonus, level, xpInLevel, xpForNextLevel };
}
