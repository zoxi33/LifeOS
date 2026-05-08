// ── Nawyki ──────────────────────────────────────────────────────────────────
export interface TodayHabit {
  id: string;
  name: string;
  emoji: string;
  freq: string;
  done: boolean;
  streak: number;
  week: number[];
}

export interface HabitFull {
  id: string;
  name: string;
  emoji: string;
  freq: string;
  type: 'daily' | 'weekly' | 'custom';
  streak: number;
  best: number;
  completionRate: number;
  target: number;
  week: number;
  todayDone: boolean;
  unit: string;
  todayValue: number | null;
  logs: { date: string; done: boolean; value?: number | null }[];
}

// ── Dziennik ─────────────────────────────────────────────────────────────────
export interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  sleep: number;
  weight: number;
  title: string;
  body: string;
  tags: string[];
}

// ── Cele ─────────────────────────────────────────────────────────────────────
export interface Milestone {
  id: string;
  name: string;
  done: boolean;
  date: string;
}

export interface Goal {
  id: string;
  name: string;
  category: string;
  pct: number;
  current: number;
  target: number;
  unit: string;
  start?: number;
  due: string;
  startDate: string;
  milestones: Milestone[];
  note: string;
}

// ── Finanse ───────────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  d: string;          // formatted display date
  date: string;       // ISO date YYYY-MM-DD
  cat: string;
  name: string;
  amount: number;
  type: 'expense' | 'income' | 'invest';
}

export interface MonthSummary {
  label: string;      // 'Sty', 'Lut', ...
  yearMonth: string;  // '2026-01'
  expenses: number;
  income: number;
  invest: number;
}

export interface FinanceData {
  transactions: Transaction[];
  currentMonth: {
    label: string;
    yearMonth: string;
    totalExpenses: number;
    totalIncome: number;
    totalInvest: number;
    dailyAvg: number;
    daysPassed: number;
  };
  monthlySummaries: MonthSummary[];
}

export interface FinanceCategory {
  name: string;
  amount: number;
  budget: number;
  color: string;
}

// ── Sen ───────────────────────────────────────────────────────────────────────
export interface SleepDay {
  id: string;
  date: number;
  dateStr: string;
  hours: number;
  bed: number;
  wake: number;
  quality: number;
}

// ── Waga ─────────────────────────────────────────────────────────────────────
export interface WeightEntry {
  id: string;
  d: string;
  w: number;
  delta: number;
}

// ── Tweaks ────────────────────────────────────────────────────────────────────
export type TweakDensity = 'compact' | 'default' | 'loose';
export type TweakStreakProminence = 'subtle' | 'medium' | 'high';

export interface TweakValues {
  accentHue: number;
  accentChroma: number;
  density: TweakDensity;
  streakProminence: TweakStreakProminence;
  showXP: boolean;
}

export type SetTweak = (key: keyof TweakValues, value: TweakValues[keyof TweakValues]) => void;
