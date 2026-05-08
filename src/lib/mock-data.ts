import type {
  TodayHabit,
  HabitFull,
  JournalEntry,
  Goal,
  Transaction,
  FinanceCategory,
  SleepDay,
  WeightEntry,
} from '@/types/lifeos';

// ── Nawyki — Today ────────────────────────────────────────────────────────────
export const todayHabits: TodayHabit[] = [
  { id: 'workout',  name: 'Trening siłowy',     freq: 'Pn · Śr · Pt',  done: true,  streak: 14, week: [1,0,1,0,1,0,0], emoji: '🏋️' },
  { id: 'read',     name: 'Czytanie 30 min',    freq: 'codziennie',    done: true,  streak: 47, week: [1,1,1,1,1,1,0], emoji: '📚' },
  { id: 'meditate', name: 'Medytacja',          freq: 'codziennie',    done: false, streak: 12, week: [1,1,1,1,1,0,0], emoji: '🧘' },
  { id: 'cold',     name: 'Zimny prysznic',     freq: 'codziennie',    done: false, streak: 6,  week: [1,1,1,1,1,1,0], emoji: '🚿' },
  { id: 'lang',     name: 'Hiszpański (Anki)',  freq: 'codziennie',    done: true,  streak: 89, week: [1,1,1,1,1,1,0], emoji: '🌐' },
  { id: 'walk',     name: 'Spacer 8000 kroków', freq: '5×/tydz',       done: false, streak: 3,  week: [1,1,0,1,1,0,0], emoji: '🚶' },
];

// ── Nawyki — lista pełna ──────────────────────────────────────────────────────
export const habitsList: HabitFull[] = [
  { id: 'workout',  name: 'Trening siłowy',     freq: 'Pn · Śr · Pt · Sb', type: 'custom',  streak: 14,  best: 28,  completionRate: 0.86, target: 4, week: 3, emoji: '🏋️', todayDone: false, unit: '',       todayValue: null, logs: [] },
  { id: 'read',     name: 'Czytanie 30 min',    freq: 'codziennie',         type: 'daily',   streak: 47,  best: 89,  completionRate: 0.94, target: 7, week: 6, emoji: '📚', todayDone: true,  unit: 'str.',   todayValue: null, logs: [] },
  { id: 'meditate', name: 'Medytacja 10 min',   freq: 'codziennie',         type: 'daily',   streak: 12,  best: 34,  completionRate: 0.71, target: 7, week: 5, emoji: '🧘', todayDone: false, unit: 'min',    todayValue: null, logs: [] },
  { id: 'cold',     name: 'Zimny prysznic',     freq: 'codziennie',         type: 'daily',   streak: 6,   best: 21,  completionRate: 0.62, target: 7, week: 6, emoji: '🚿', todayDone: true,  unit: '',       todayValue: null, logs: [] },
  { id: 'lang',     name: 'Hiszpański (Anki)',  freq: 'codziennie',         type: 'daily',   streak: 89,  best: 89,  completionRate: 0.98, target: 7, week: 7, emoji: '🌐', todayDone: true,  unit: 'min',    todayValue: null, logs: [] },
  { id: 'walk',     name: 'Spacer 8000 kroków', freq: '5×/tydzień',         type: 'weekly',  streak: 3,   best: 12,  completionRate: 0.75, target: 5, week: 4, emoji: '🚶', todayDone: false, unit: 'kroków', todayValue: null, logs: [] },
  { id: 'creatine', name: 'Kreatyna',           freq: 'codziennie',         type: 'daily',   streak: 132, best: 132, completionRate: 0.99, target: 7, week: 7, emoji: '💊', todayDone: true,  unit: '',       todayValue: null, logs: [] },
  { id: 'noscroll', name: 'Bez social mediów',  freq: 'Pn—Pt',              type: 'custom',  streak: 9,   best: 21,  completionRate: 0.81, target: 5, week: 4, emoji: '📵', todayDone: false, unit: '',       todayValue: null, logs: [] },
];

// ── Sparkline series ──────────────────────────────────────────────────────────
export const weightSeries: number[] = [82.4, 82.1, 82.0, 81.7, 81.8, 81.4, 81.2, 81.0, 80.9, 80.7, 80.5, 80.6, 80.3, 80.1];
export const sleepSeries: number[]  = [6.2, 7.1, 6.8, 7.4, 7.0, 6.5, 7.8, 7.5, 7.2, 6.9, 7.6, 7.3, 7.0, 7.5];
export const moodSeries: number[]   = [3, 4, 3, 4, 4, 3, 5, 4, 4, 3, 4, 4, 4, 4];

// ── Dziennik ─────────────────────────────────────────────────────────────────
export const journalEntries: JournalEntry[] = [
  {
    id: 'j1', date: '2026-05-02', mood: 4, sleep: 7.5, weight: 80.1,
    title: 'Dobry trening, mglista głowa wieczorem',
    body: 'Rano świetnie — przysiad 120kg na 5. Wieczorem spadek energii, prawdopodobnie późny obiad. Jutro spróbuję jeść główny posiłek wcześniej. Czytanie szło wolno, ale 35 stron i tak.',
    tags: ['trening', 'energia'],
  },
  {
    id: 'j2', date: '2026-05-01', mood: 5, sleep: 8.2, weight: 80.5,
    title: 'Pierwszy maja — reset',
    body: 'Długi spacer, zero ekranu do południa. Czuję spokój którego brakowało w kwietniu. Plan na ten miesiąc: skupienie na śnie 7.5h+, 4 treningi/tydz, finanse pod kontrolą.',
    tags: ['plan', 'spokój'],
  },
  {
    id: 'j3', date: '2026-04-30', mood: 3, sleep: 6.8, weight: 80.4,
    title: 'Krótka noc, długi dzień',
    body: 'Pracowałem do późna nad projektem. Spadek koncentracji popołudniu. Decyzja: o 22:30 telefon w drugim pokoju, koniec dyskusji.',
    tags: ['sen'],
  },
  {
    id: 'j4', date: '2026-04-29', mood: 4, sleep: 7.2, weight: 80.7,
    title: 'Stabilny rytm',
    body: 'Wszystkie nawyki ✓. Hiszpański przekroczył 87 dni. Czuję jak rutyna zaczyna grać sama.',
    tags: ['streak'],
  },
];

// ── Cele ─────────────────────────────────────────────────────────────────────
export const goalsData: Goal[] = [
  {
    id: 'weight', name: '79 kg do końca lipca', category: 'Zdrowie',
    pct: 62, current: 80.1, target: 79.0, unit: 'kg', start: 82.4,
    due: '31 lip 2026', startDate: '01 sty 2026',
    milestones: [
      { id: 'mw1', name: '82 → 81 kg', done: true,  date: '14 lut' },
      { id: 'mw2', name: '81 → 80 kg', done: true,  date: '08 kwi' },
      { id: 'mw3', name: '80 → 79 kg', done: false, date: 'lip' },
    ],
    note: 'Tempo −0.18 kg/tydz, projekcja: 12 czerwca',
  },
  {
    id: 'books', name: 'Przeczytać 24 książki', category: 'Rozwój',
    pct: 41, current: 10, target: 24, unit: 'książek',
    due: '31 gru 2026', startDate: '01 sty 2026',
    milestones: [
      { id: 'mb1', name: '6 książek (Q1)',  done: true,  date: 'mar' },
      { id: 'mb2', name: '12 książek (Q2)', done: false, date: 'cze' },
      { id: 'mb3', name: '18 książek (Q3)', done: false, date: 'wrz' },
      { id: 'mb4', name: '24 książki (Q4)', done: false, date: 'gru' },
    ],
    note: 'Tempo: 2.5 / mies. — wymagane 2.0',
  },
  {
    id: 'savings', name: 'Wpłaty: 50 000 zł', category: 'Finanse',
    pct: 78, current: 38900, target: 50000, unit: 'zł',
    due: '31 gru 2026', startDate: '01 sty 2026',
    milestones: [
      { id: 'ms1', name: '12 500 zł', done: true,  date: 'mar' },
      { id: 'ms2', name: '25 000 zł', done: true,  date: 'cze' },
      { id: 'ms3', name: '37 500 zł', done: true,  date: 'wrz' },
      { id: 'ms4', name: '50 000 zł', done: false, date: 'gru' },
    ],
    note: 'Wyprzedzenie planu o 6 800 zł',
  },
];

// ── Finanse ───────────────────────────────────────────────────────────────────
export const txData: Transaction[] = [
  { id: '1', date: '2026-05-02', d: '02 maja', cat: 'Jedzenie',   name: 'Lidl',               amount: 184.20, type: 'expense' },
  { id: '2', date: '2026-05-02', d: '02 maja', cat: 'Inwestycje', name: 'IKE — wpłata',       amount: 1500,   type: 'invest'  },
  { id: '3', date: '2026-05-01', d: '01 maja', cat: 'Jedzenie',   name: 'Restauracja Kuchnia',amount: 87.00,  type: 'expense' },
  { id: '4', date: '2026-04-30', d: '30 kwi',  cat: 'Subskrypcje',name: 'Spotify',            amount: 23.99,  type: 'expense' },
  { id: '5', date: '2026-04-30', d: '30 kwi',  cat: 'Transport',  name: 'BP Paliwo',          amount: 240.50, type: 'expense' },
  { id: '6', date: '2026-04-29', d: '29 kwi',  cat: 'Przychód',   name: 'Faktura · Klient X', amount: 8400,   type: 'income'  },
  { id: '7', date: '2026-04-28', d: '28 kwi',  cat: 'Subskrypcje',name: 'Notion',             amount: 48.00,  type: 'expense' },
  { id: '8', date: '2026-04-27', d: '27 kwi',  cat: 'Jedzenie',   name: 'Biedronka',          amount: 126.40, type: 'expense' },
];

export const financeCategories: FinanceCategory[] = [
  { name: 'Jedzenie',    amount: 980,  budget: 1800, color: 'var(--lo-accent)' },
  { name: 'Transport',   amount: 240,  budget: 600,  color: 'var(--lo-accent)' },
  { name: 'Inwestycje',  amount: 1500, budget: 1500, color: 'var(--lo-info)'   },
  { name: 'Subskrypcje', amount: 187,  budget: 600,  color: 'var(--lo-accent)' },
  { name: 'Inne',        amount: 0,    budget: 1300, color: 'var(--lo-accent)' },
];

// ── Sen ───────────────────────────────────────────────────────────────────────
export const sleepDays: SleepDay[] = Array.from({ length: 30 }, (_, i) => ({
  id:      `mock-sleep-${i}`,
  date:    i,
  dateStr: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
  hours:   5.5 + Math.sin(i * 0.5) * 1.2 + (((i * 7 + 3) % 11) / 11) * 1.4,
  bed:     22.5 + (((i * 13 + 5) % 9) / 9) * 1.5,
  wake:    6.0  + (((i * 11 + 7) % 9) / 9) * 1.5,
  quality: 2 + Math.floor((((i * 17 + 3) % 5))),
}));

// ── Waga ─────────────────────────────────────────────────────────────────────
export const weightLog: number[] = Array.from({ length: 90 }, (_, i) =>
  82.4 - (i * 0.025) + Math.sin(i * 0.5) * 0.3
);

export const weightEntries: WeightEntry[] = [
  { id: 'mock-w1', d: '02 maja, 07:12', w: 80.1, delta: -0.2 },
  { id: 'mock-w2', d: '01 maja, 07:05', w: 80.3, delta: -0.1 },
  { id: 'mock-w3', d: '30 kwi, 07:30',  w: 80.4, delta: +0.1 },
  { id: 'mock-w4', d: '29 kwi, 06:58',  w: 80.3, delta: -0.4 },
  { id: 'mock-w5', d: '28 kwi, 07:22',  w: 80.7, delta:  0.0 },
];
