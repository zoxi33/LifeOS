// Types and static data — no 'use server' here

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
  progress: number;
  unlocked: boolean;
}

export interface LevelData {
  totalXP: number;
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  todayXP: number;
  weekXP: number;
}

export interface FreedomTracker {
  id: string;
  name: string;
  days: number;
}

export interface AchievementsData {
  achievements: Achievement[];
  earnedXP: number;
  unlockedCount: number;
  totalCount: number;
  level: LevelData;
  totalXPSystem: number;
  freedomTrackers: FreedomTracker[];
}

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  'Nawyki', 'Streak', 'Focus', 'Sen', 'Finanse', 'Dziennik', 'Wolność',
];

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
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
  // ── Wolność ───────────────────────────────────────────────────────────────
  { id: 'freedom_3',   category: 'Wolność',  emoji: '🧠', name: 'Świadomy',           desc: '3 dni wolności',                  xp: 30,   threshold: 3    },
  { id: 'freedom_7',   category: 'Wolność',  emoji: '🧠', name: 'Tydzień',            desc: '7 dni wolności',                  xp: 100,  threshold: 7    },
  { id: 'freedom_30',  category: 'Wolność',  emoji: '🧠', name: 'Miesiąc',            desc: '30 dni wolności',                 xp: 300,  threshold: 30   },
  { id: 'freedom_90',  category: 'Wolność',  emoji: '🧠', name: 'Kwartał',            desc: '90 dni wolności',                 xp: 1000, threshold: 90   },
  { id: 'freedom_180', category: 'Wolność',  emoji: '🧠', name: 'Pół roku',           desc: '180 dni wolności',                xp: 2000, threshold: 180  },
  { id: 'freedom_365', category: 'Wolność',  emoji: '🧠', name: 'Rok wolności',       desc: '365 dni wolności',                xp: 5000, threshold: 365  },
];
