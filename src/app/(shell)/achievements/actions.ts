'use server';

import { createClient } from '@/lib/supabase/server';
import { xpForLevel, levelFromXP } from '@/lib/xp';
import type { Achievement, AchievementDef, AchievementsData, FreedomTracker } from './config';
import { ACHIEVEMENT_DEFS } from './config';

export async function getAchievementsData(): Promise<AchievementsData> {
  const sb = await createClient();

  const [
    habitLogsRes,
    dailyLogsRes,
    sleepLogsRes,
    journalRes,
    txRes,
    investRes,
    streakTrackersRes,
    allLogsCountRes,
    weekLogsCountRes,
    streakItemsRes,
    streakHistRes,
    todayLogRes,
    weekLogRes,
  ] = await Promise.all([
    sb.from('habit_logs').select('habit_id, date, done').eq('done', true).order('date'),
    sb.from('daily_logs').select('date, focus_minutes, work_minutes, checklist').order('date'),
    sb.from('sleep_logs').select('date, hours').order('date'),
    sb.from('journal_entries').select('id', { count: 'exact', head: true }),
    sb.from('transactions').select('id', { count: 'exact', head: true }),
    sb.from('transactions').select('id', { count: 'exact', head: true }).eq('type', 'invest'),
    sb.from('streak_trackers').select('id, name, started_at').eq('active', true).order('created_at'),
    sb.from('habit_logs').select('id', { count: 'exact', head: true }).eq('done', true),
    sb.from('habit_logs').select('id', { count: 'exact', head: true }).eq('done', true)
      .gte('date', new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)),
    sb.from('checklist_items').select('id').eq('is_streak', true).eq('active', true),
    sb.from('daily_logs').select('date, checklist, focus_minutes, work_minutes').order('date'),
    sb.from('daily_logs').select('focus_minutes, work_minutes')
      .eq('date', new Date().toISOString().slice(0, 10)).maybeSingle(),
    sb.from('daily_logs').select('focus_minutes, work_minutes')
      .gte('date', (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); })()),
  ]);

  // ── Max habit streak ──────────────────────────────────────────────────────
  const habitLogs = habitLogsRes.data ?? [];
  const byHabit: Record<string, string[]> = {};
  for (const l of habitLogs) {
    if (!byHabit[l.habit_id]) byHabit[l.habit_id] = [];
    byHabit[l.habit_id].push(l.date);
  }
  let maxHabitStreak = 0;
  for (const dates of Object.values(byHabit)) {
    const sorted = [...dates].sort();
    let run = 0, best = 0, prev: string | null = null;
    for (const d of sorted) {
      if (prev) {
        const diff = Math.round((new Date(d + 'T00:00:00').getTime() - new Date(prev + 'T00:00:00').getTime()) / 86400000);
        run = diff === 1 ? run + 1 : 1;
      } else { run = 1; }
      if (run > best) best = run;
      prev = d;
    }
    if (best > maxHabitStreak) maxHabitStreak = best;
  }

  // ── Total focus minutes ───────────────────────────────────────────────────
  const dailyLogs = dailyLogsRes.data ?? [];
  const totalFocusMin = dailyLogs.reduce((s, r) => s + (r.focus_minutes ?? 0), 0);

  // ── Sleep achievements ────────────────────────────────────────────────────
  const sleepLogs = sleepLogsRes.data ?? [];
  const sleepCount = sleepLogs.length;
  const goodSleepCount = sleepLogs.filter(s => (s.hours ?? 0) >= 7).length;
  let maxSleepStreak = 0;
  {
    const sorted = [...sleepLogs].sort((a, b) => a.date < b.date ? -1 : 1);
    let run = 0, prev: string | null = null;
    for (const s of sorted) {
      if ((s.hours ?? 0) >= 7) {
        if (prev) {
          const diff = Math.round((new Date(s.date + 'T00:00:00').getTime() - new Date(prev + 'T00:00:00').getTime()) / 86400000);
          run = diff === 1 ? run + 1 : 1;
        } else { run = 1; }
        if (run > maxSleepStreak) maxSleepStreak = run;
        prev = s.date as string;
      } else {
        run = 0;
        prev = s.date as string;
      }
    }
  }

  // ── Wolność ───────────────────────────────────────────────────────────────
  const streakTrackers = streakTrackersRes.data ?? [];
  let maxFreedomDays = 0;
  const nowMs = Date.now();
  const freedomTrackers: FreedomTracker[] = [];
  for (const t of streakTrackers) {
    if (!t.started_at) continue;
    const days = Math.floor((nowMs - new Date(t.started_at as string).getTime()) / 86400000);
    if (days > maxFreedomDays) maxFreedomDays = days;
    freedomTrackers.push({ id: t.id as string, name: t.name as string, days });
  }

  // ── XP computation ────────────────────────────────────────────────────────
  function logXP(fm: number, wm: number) {
    return Math.floor(fm / 30) * 8 + Math.floor(wm / 60) * 5;
  }
  function computeStreakItemXP(logs: { date: string; checklist: Record<string, boolean> }[], itemId: string): number {
    let xp = 0, streak = 0, prevDate: string | null = null;
    for (const log of logs) {
      const done = log.checklist[itemId] === true;
      const diff = prevDate ? Math.round((new Date(log.date + 'T00:00:00').getTime() - new Date(prevDate + 'T00:00:00').getTime()) / 86400000) : null;
      const isConsec = diff === null || diff === 1;
      if (done) {
        if (!isConsec) streak = 0;
        streak++;
        xp += streak >= 30 ? 20 : streak >= 7 ? 10 : 5;
        if (streak === 7)   xp += 100;
        if (streak === 30)  xp += 300;
        if (streak === 100) xp += 1000;
        prevDate = log.date;
      } else {
        if (streak > 0 && isConsec) xp -= Math.min(streak * 5, 500);
        streak = 0;
        prevDate = log.date;
      }
    }
    return xp;
  }

  const totalHabitXP = (allLogsCountRes.count ?? 0) * 10;
  const totalLogXP   = (streakHistRes.data ?? []).reduce((s, r) => s + logXP(r.focus_minutes ?? 0, r.work_minutes ?? 0), 0);
  const streakItemIds = (streakItemsRes.data ?? []).map(r => r.id);
  const streakLogsMapped = (streakHistRes.data ?? []).map(r => ({
    date: String(r.date),
    checklist: (r.checklist ?? {}) as Record<string, boolean>,
  }));
  let streakBonus = 0;
  for (const id of streakItemIds) streakBonus += computeStreakItemXP(streakLogsMapped, id);
  const totalXPSystem = totalHabitXP + totalLogXP + Math.max(streakBonus, 0);

  const weekHabitXP = (weekLogsCountRes.count ?? 0) * 10;
  const weekLogXP   = (weekLogRes.data ?? []).reduce((s, r) => s + logXP(r.focus_minutes ?? 0, r.work_minutes ?? 0), 0);
  const weekXP      = weekHabitXP + weekLogXP;
  const todayRow    = todayLogRes.data;
  const todayXP     = todayRow ? logXP(todayRow.focus_minutes ?? 0, todayRow.work_minutes ?? 0) : 0;

  const level          = levelFromXP(totalXPSystem);
  const xpInLevel      = totalXPSystem - xpForLevel(level);
  const xpForNextLevel = xpForLevel(level + 1) - xpForLevel(level);

  // ── Build achievement list ────────────────────────────────────────────────
  const totalHabitsDone = allLogsCountRes.count ?? 0;
  const journalCount    = journalRes.count ?? 0;
  const txCount         = txRes.count ?? 0;
  const investCount     = investRes.count ?? 0;

  function def(id: string): AchievementDef {
    return ACHIEVEMENT_DEFS.find(d => d.id === id)!;
  }
  function makeAch(d: AchievementDef, current: number): Achievement {
    const clamped  = Math.min(current, d.threshold);
    const progress = Math.round((clamped / d.threshold) * 100);
    return { ...d, current: clamped, progress, unlocked: current >= d.threshold };
  }

  const achievements: Achievement[] = [
    makeAch(def('habits_1'),    totalHabitsDone),
    makeAch(def('habits_50'),   totalHabitsDone),
    makeAch(def('habits_100'),  totalHabitsDone),
    makeAch(def('habits_500'),  totalHabitsDone),
    makeAch(def('habits_1000'), totalHabitsDone),
    makeAch(def('habits_5000'), totalHabitsDone),
    makeAch(def('streak_3'),    maxHabitStreak),
    makeAch(def('streak_7'),    maxHabitStreak),
    makeAch(def('streak_30'),   maxHabitStreak),
    makeAch(def('streak_100'),  maxHabitStreak),
    makeAch(def('streak_365'),  maxHabitStreak),
    makeAch(def('focus_60'),    totalFocusMin),
    makeAch(def('focus_600'),   totalFocusMin),
    makeAch(def('focus_3000'),  totalFocusMin),
    makeAch(def('focus_12000'), totalFocusMin),
    makeAch(def('sleep_1'),     goodSleepCount),
    makeAch(def('sleep_7s'),    maxSleepStreak),
    makeAch(def('sleep_30'),    sleepCount),
    makeAch(def('sleep_90'),    sleepCount),
    makeAch(def('finance_1'),   txCount),
    makeAch(def('finance_50'),  txCount),
    makeAch(def('finance_200'), txCount),
    makeAch(def('finance_inv'), investCount),
    makeAch(def('journal_1'),   journalCount),
    makeAch(def('journal_10'),  journalCount),
    makeAch(def('journal_30'),  journalCount),
    makeAch(def('journal_100'), journalCount),
    makeAch(def('journal_365'), journalCount),
    makeAch(def('freedom_3'),   maxFreedomDays),
    makeAch(def('freedom_7'),   maxFreedomDays),
    makeAch(def('freedom_30'),  maxFreedomDays),
    makeAch(def('freedom_90'),  maxFreedomDays),
    makeAch(def('freedom_180'), maxFreedomDays),
    makeAch(def('freedom_365'), maxFreedomDays),
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const earnedXP = achievements.filter(a => a.unlocked).reduce((s, a) => s + a.xp, 0);

  return {
    achievements,
    earnedXP,
    unlockedCount,
    totalCount: achievements.length,
    totalXPSystem,
    freedomTrackers,
    level: { totalXP: totalXPSystem, level, xpInLevel, xpForNextLevel, todayXP, weekXP },
  };
}
