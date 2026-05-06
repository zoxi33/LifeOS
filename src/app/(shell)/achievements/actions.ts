'use server';

import { createClient } from '@/lib/supabase/server';
import { xpForLevel, levelFromXP } from '@/lib/xp';

// ─── Achievement definitions ──────────────────────────────────────────────────

export type AchievementCategory =
  | 'Nawyki' | 'Streak' | 'Focus' | 'Sen' | 'Finanse' | 'Dziennik' | 'Wolność';

export interface AchievementDef {
  id: string;
  category: AchievementCategory;
  emoji: string;
  name: string;
  desc: string;
  xp: number;
  threshold: number;
}

export interface Achievement extends AchievementDef {
  current: number;
  progress: number;   // 0–100
  unlocked: boolean;
}

const DEFS: AchievementDef[] = [
  // ── Nawyki ────────────────────────────────────────────────────────────────
  { id: 'habits_1',    category: 'Nawyki',   emoji: '✅', name: 'Pierwsze kroki',      desc: 'Ukończ 1 nawyk',                  xp: 50,   threshold: 1    },
  { id: 'habits_50',   category: 'Nawyki',   emoji: '💪', name: 'W rytmie',            desc: 'Ukończ 50 nawyków',               xp: 100,  threshold: 50   },
  { id: 'habits_100',  category: 'Nawyki',   emoji: '🔵', name: 'Regularność',         desc: 'Ukończ 100 nawyków',              xp: 200,  threshold: 100  },
  { id: 'habits_500',  category: 'Nawyki',   emoji: '⚡', name: 'Konsekwentny',        desc: 'Ukończ 500 nawyków',              xp: 500,  threshold: 500  },
  { id: 'habits_1000', category: 'Nawyki',   emoji: '🏆', name: 'Mistrz nawyków',      desc: 'Ukończ 1 000 nawyków',            xp: 1000, threshold: 1000 },
  { id: 'habits_5000', category: 'Nawyki',   emoji: '👑', name: 'Legenda',             desc: 'Ukończ 5 000 nawyków',            xp: 5000, threshold: 5000 },

  // ── Streak ────────────────────────────────────────────────────────────────
  { id: 'streak_3',    category: 'Streak',   emoji: '🔥', name: 'Rozpęd',             desc: '3-dniowy streak nawyku',          xp: 30,   threshold: 3    },
  { id: 'streak_7',    category: 'Streak',   emoji: '🔥', name: 'Tydzień z rzędu',    desc: '7-dniowy streak nawyku',          xp: 100,  threshold: 7    },
  { id: 'streak_30',   category: 'Streak',   emoji: '🔥', name: 'Miesiąc z rzędu',    desc: '30-dniowy streak nawyku',         xp: 300,  threshold: 30   },
  { id: 'streak_100',  category: 'Streak',   emoji: '🔥', name: 'Setka',              desc: '100 dni z rzędu',                 xp: 1000, threshold: 100  },
  { id: 'streak_365',  category: 'Streak',   emoji: '🔥', name: 'Rok z rzędu',        desc: '365 dni z rzędu bez przerwy',     xp: 5000, threshold: 365  },

  // ── Focus ─────────────────────────────────────────────────────────────────
  { id: 'focus_60',    category: 'Focus',    emoji: '🌲', name: 'Skupiony',           desc: '1h łącznego czasu skupienia',     xp: 50,   threshold: 60   },
  { id: 'focus_600',   category: 'Focus',    emoji: '🌲', name: 'Produktywny',        desc: '10h czasu skupienia',             xp: 200,  threshold: 600  },
  { id: 'focus_3000',  category: 'Focus',    emoji: '🌲', name: 'Maratończyk',        desc: '50h czasu skupienia',             xp: 500,  threshold: 3000 },
  { id: 'focus_12000', category: 'Focus',    emoji: '🌲', name: 'Titan',              desc: '200h czasu skupienia',            xp: 2000, threshold: 12000},

  // ── Sen ───────────────────────────────────────────────────────────────────
  { id: 'sleep_1',     category: 'Sen',      emoji: '😴', name: 'Dobra noc',          desc: 'Pierwsza noc z 7+ h snu',         xp: 50,   threshold: 1    },
  { id: 'sleep_7s',    category: 'Sen',      emoji: '😴', name: 'Zdrowy tydzień',     desc: '7 nocy z rzędu z ≥7 h snu',      xp: 300,  threshold: 7    },
  { id: 'sleep_30',    category: 'Sen',      emoji: '😴', name: 'Regularny rytm',     desc: 'Zaloguj sen 30 razy',             xp: 200,  threshold: 30   },
  { id: 'sleep_90',    category: 'Sen',      emoji: '😴', name: 'Mistrz snu',         desc: 'Zaloguj sen 90 razy',             xp: 500,  threshold: 90   },

  // ── Finanse ───────────────────────────────────────────────────────────────
  { id: 'finance_1',   category: 'Finanse',  emoji: '💰', name: 'Pierwsza transakcja', desc: 'Dodaj pierwszą transakcję',      xp: 50,   threshold: 1    },
  { id: 'finance_50',  category: 'Finanse',  emoji: '💰', name: 'Buchalterysta',      desc: 'Dodaj 50 transakcji',             xp: 200,  threshold: 50   },
  { id: 'finance_200', category: 'Finanse',  emoji: '💰', name: 'Analityk',           desc: 'Dodaj 200 transakcji',            xp: 500,  threshold: 200  },
  { id: 'finance_inv', category: 'Finanse',  emoji: '📈', name: 'Inwestor',           desc: 'Dodaj pierwszą inwestycję',       xp: 100,  threshold: 1    },

  // ── Dziennik ──────────────────────────────────────────────────────────────
  { id: 'journal_1',   category: 'Dziennik', emoji: '📖', name: 'Pierwsze słowa',     desc: 'Napisz pierwszy wpis',            xp: 50,   threshold: 1    },
  { id: 'journal_10',  category: 'Dziennik', emoji: '📖', name: 'Regularny pisarz',   desc: 'Napisz 10 wpisów',                xp: 100,  threshold: 10   },
  { id: 'journal_30',  category: 'Dziennik', emoji: '📖', name: 'Refleksja',          desc: 'Napisz 30 wpisów',                xp: 300,  threshold: 30   },
  { id: 'journal_100', category: 'Dziennik', emoji: '📖', name: 'Kronikarz',          desc: 'Napisz 100 wpisów',               xp: 1000, threshold: 100  },
  { id: 'journal_365', category: 'Dziennik', emoji: '📖', name: 'Pisarz roku',        desc: 'Napisz 365 wpisów',               xp: 5000, threshold: 365  },

  // ── Wolność (streak trackers – No Fap / No Porn) ──────────────────────────
  { id: 'freedom_3',   category: 'Wolność',  emoji: '🧠', name: 'Świadomy',           desc: '3 dni wolności',                  xp: 30,   threshold: 3    },
  { id: 'freedom_7',   category: 'Wolność',  emoji: '🧠', name: 'Tydzień',            desc: '7 dni wolności',                  xp: 100,  threshold: 7    },
  { id: 'freedom_30',  category: 'Wolność',  emoji: '🧠', name: 'Miesiąc',            desc: '30 dni wolności',                 xp: 300,  threshold: 30   },
  { id: 'freedom_90',  category: 'Wolność',  emoji: '🧠', name: 'Kwartał',            desc: '90 dni wolności',                 xp: 1000, threshold: 90   },
  { id: 'freedom_180', category: 'Wolność',  emoji: '🧠', name: 'Pół roku',           desc: '180 dni wolności',                xp: 2000, threshold: 180  },
  { id: 'freedom_365', category: 'Wolność',  emoji: '🧠', name: 'Rok wolności',       desc: '365 dni wolności',                xp: 5000, threshold: 365  },
];

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  'Nawyki', 'Streak', 'Focus', 'Sen', 'Finanse', 'Dziennik', 'Wolność',
];

// ─── XP data (same as today/actions) ─────────────────────────────────────────

export interface LevelData {
  totalXP: number;
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  todayXP: number;
  weekXP: number;
}

// ─── Main query ───────────────────────────────────────────────────────────────

export interface AchievementsData {
  achievements: Achievement[];
  earnedXP: number;
  unlockedCount: number;
  totalCount: number;
  level: LevelData;
  totalXPSystem: number; // XP from habits/focus/streaks
}

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
    // All habit logs (for streak computation and count)
    sb.from('habit_logs').select('habit_id, date, done').eq('done', true).order('date'),
    // Daily logs (for focus)
    sb.from('daily_logs').select('date, focus_minutes, work_minutes, checklist').order('date'),
    // Sleep logs (for sleep achievements)
    sb.from('sleep_logs').select('date, hours').order('date'),
    // Journal entry count
    sb.from('journal_entries').select('id', { count: 'exact', head: true }),
    // Transaction count
    sb.from('transactions').select('id', { count: 'exact', head: true }),
    // Investment count
    sb.from('transactions').select('id', { count: 'exact', head: true }).eq('type', 'invest'),
    // Streak trackers
    sb.from('streak_trackers').select('started_at').eq('active', true),
    // Total habit done count
    sb.from('habit_logs').select('id', { count: 'exact', head: true }).eq('done', true),
    // This week habit done
    sb.from('habit_logs').select('id', { count: 'exact', head: true }).eq('done', true)
      .gte('date', new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)),
    // Streak items
    sb.from('checklist_items').select('id').eq('is_streak', true).eq('active', true),
    // Full daily logs for streak XP
    sb.from('daily_logs').select('date, checklist, focus_minutes, work_minutes').order('date'),
    // Today log
    sb.from('daily_logs').select('focus_minutes, work_minutes')
      .eq('date', new Date().toISOString().slice(0, 10)).maybeSingle(),
    // Week logs
    sb.from('daily_logs').select('focus_minutes, work_minutes')
      .gte('date', (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); })()),
  ]);

  // ── Compute max habit streak ──────────────────────────────────────────────
  const habitLogs = habitLogsRes.data ?? [];
  const byHabit: Record<string, string[]> = {};
  for (const l of habitLogs) {
    if (!byHabit[l.habit_id]) byHabit[l.habit_id] = [];
    byHabit[l.habit_id].push(l.date);
  }

  let maxHabitStreak = 0;
  for (const dates of Object.values(byHabit)) {
    const sorted = [...dates].sort();
    let run = 0, best = 0;
    let prev: string | null = null;
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

  // Max consecutive good sleep nights
  let maxSleepStreak = 0;
  {
    const sorted = [...sleepLogs].sort((a, b) => a.date < b.date ? -1 : 1);
    let run = 0;
    let prev: string | null = null;
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

  // ── Streak trackers (Wolność) ─────────────────────────────────────────────
  const streakTrackers = streakTrackersRes.data ?? [];
  let maxFreedomDays = 0;
  const nowMs = Date.now();
  for (const t of streakTrackers) {
    if (!t.started_at) continue;
    const days = Math.floor((nowMs - new Date(t.started_at as string).getTime()) / 86400000);
    if (days > maxFreedomDays) maxFreedomDays = days;
  }

  // ── XP system values ──────────────────────────────────────────────────────
  function logXP(fm: number, wm: number) {
    return Math.floor(fm / 30) * 8 + Math.floor(wm / 60) * 5;
  }

  function computeStreakItemXP(logs: { date: string; checklist: Record<string, boolean> }[], itemId: string): number {
    let xp = 0, streak = 0;
    let prevDate: string | null = null;
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

  const totalHabitXP   = (allLogsCountRes.count ?? 0) * 10;
  const totalLogXP     = (streakHistRes.data ?? []).reduce((s, r) => s + logXP(r.focus_minutes ?? 0, r.work_minutes ?? 0), 0);
  const streakItemIds  = (streakItemsRes.data ?? []).map(r => r.id);
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

  // ── Compute achievements ──────────────────────────────────────────────────
  const totalHabitsDone = allLogsCountRes.count ?? 0;
  const journalCount    = journalRes.count ?? 0;
  const txCount         = txRes.count ?? 0;
  const investCount     = investRes.count ?? 0;

  function makeAch(def: AchievementDef, current: number): Achievement {
    const clamped  = Math.min(current, def.threshold);
    const progress = Math.round((clamped / def.threshold) * 100);
    return { ...def, current: clamped, progress, unlocked: current >= def.threshold };
  }

  const achievements: Achievement[] = [
    // Nawyki
    makeAch(DEFS.find(d => d.id === 'habits_1')!,    totalHabitsDone),
    makeAch(DEFS.find(d => d.id === 'habits_50')!,   totalHabitsDone),
    makeAch(DEFS.find(d => d.id === 'habits_100')!,  totalHabitsDone),
    makeAch(DEFS.find(d => d.id === 'habits_500')!,  totalHabitsDone),
    makeAch(DEFS.find(d => d.id === 'habits_1000')!, totalHabitsDone),
    makeAch(DEFS.find(d => d.id === 'habits_5000')!, totalHabitsDone),
    // Streak
    makeAch(DEFS.find(d => d.id === 'streak_3')!,   maxHabitStreak),
    makeAch(DEFS.find(d => d.id === 'streak_7')!,   maxHabitStreak),
    makeAch(DEFS.find(d => d.id === 'streak_30')!,  maxHabitStreak),
    makeAch(DEFS.find(d => d.id === 'streak_100')!, maxHabitStreak),
    makeAch(DEFS.find(d => d.id === 'streak_365')!, maxHabitStreak),
    // Focus
    makeAch(DEFS.find(d => d.id === 'focus_60')!,    totalFocusMin),
    makeAch(DEFS.find(d => d.id === 'focus_600')!,   totalFocusMin),
    makeAch(DEFS.find(d => d.id === 'focus_3000')!,  totalFocusMin),
    makeAch(DEFS.find(d => d.id === 'focus_12000')!, totalFocusMin),
    // Sen
    makeAch(DEFS.find(d => d.id === 'sleep_1')!,  goodSleepCount),
    makeAch(DEFS.find(d => d.id === 'sleep_7s')!, maxSleepStreak),
    makeAch(DEFS.find(d => d.id === 'sleep_30')!, sleepCount),
    makeAch(DEFS.find(d => d.id === 'sleep_90')!, sleepCount),
    // Finanse
    makeAch(DEFS.find(d => d.id === 'finance_1')!,   txCount),
    makeAch(DEFS.find(d => d.id === 'finance_50')!,  txCount),
    makeAch(DEFS.find(d => d.id === 'finance_200')!, txCount),
    makeAch(DEFS.find(d => d.id === 'finance_inv')!, investCount),
    // Dziennik
    makeAch(DEFS.find(d => d.id === 'journal_1')!,   journalCount),
    makeAch(DEFS.find(d => d.id === 'journal_10')!,  journalCount),
    makeAch(DEFS.find(d => d.id === 'journal_30')!,  journalCount),
    makeAch(DEFS.find(d => d.id === 'journal_100')!, journalCount),
    makeAch(DEFS.find(d => d.id === 'journal_365')!, journalCount),
    // Wolność
    makeAch(DEFS.find(d => d.id === 'freedom_3')!,   maxFreedomDays),
    makeAch(DEFS.find(d => d.id === 'freedom_7')!,   maxFreedomDays),
    makeAch(DEFS.find(d => d.id === 'freedom_30')!,  maxFreedomDays),
    makeAch(DEFS.find(d => d.id === 'freedom_90')!,  maxFreedomDays),
    makeAch(DEFS.find(d => d.id === 'freedom_180')!, maxFreedomDays),
    makeAch(DEFS.find(d => d.id === 'freedom_365')!, maxFreedomDays),
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const earnedXP = achievements.filter(a => a.unlocked).reduce((s, a) => s + a.xp, 0);

  return {
    achievements,
    earnedXP,
    unlockedCount,
    totalCount: achievements.length,
    totalXPSystem,
    level: { totalXP: totalXPSystem, level, xpInLevel, xpForNextLevel, todayXP, weekXP },
  };
}
