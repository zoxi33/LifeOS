# LifeOS Web — Podsumowanie projektu

## Czym jest LifeOS?

Prywatna aplikacja webowa do zarządzania własnym życiem (personal OS). Monolityczny dashboard łączący śledzenie nawyków, dziennik, finanse, sen, wagę, wodę, cele i system osiągnięć — z grywalizacją przez XP i poziomy.

---

## Stack techniczny

| Warstwa | Technologia |
|---|---|
| Framework | Next.js 16.2.4 (App Router, SSR) |
| UI Library | React 19.2.4 + TypeScript 5 |
| Baza danych | Supabase (PostgreSQL + Auth + RLS) |
| Styling | Tailwind CSS v4 + shadcn/ui (Base Nova) |
| Ikony | Lucide React |
| Fonty | Geist / Geist Mono (next/font) |
| PWA | @ducanh2912/next-pwa + web-push |
| Command palette | cmdk |

---

## Architektura

```
src/
  app/
    (shell)/          ← chronione layoutem, auth required
      today/          ← dashboard dnia
      habits/
      daily/
      journal/
      goals/
      finance/
      stats/
      sleep/
      weight/
      water/
      streaks/
      achievements/
    login/            ← publiczne
    api/push/         ← PWA push notifications
  components/
    layout/           ← ShellClient, Sidebar, TopBar, MobileTabBar, CommandPalette
    ui/               ← shadcn prymitywy
    primitives/       ← Bar, SectionHeader, Heatmap, Sparkline, RangePicker
    <feature>/        ← komponenty per-feature
  lib/
    supabase/         ← client.ts, server.ts, queries.ts
    xp.ts             ← system XP
    streak-utils.ts   ← streak penalty/milestone helpers
    water-utils.ts    ← formatowanie ml/L
    utils.ts          ← cn()
  types/
    lifeos.ts         ← domain types
    database.types.ts ← auto-generated z Supabase
  hooks/
    use-tweaks.ts     ← motyw (kolor, gęstość) → localStorage
```

**Wzorzec per-strony:**
```
today/
  page.tsx       ← Server Component, pobiera dane
  actions.ts     ← Server Actions ('use server'), mutacje + revalidatePath()
  loading.tsx    ← Suspense skeleton
```

Klient ← props → Screen component (client) ← server actions ← mutacje

---

## Tabele Supabase

| Tabela | Opis |
|---|---|
| `habits` | Katalog nawyków (name, emoji, freq, type, target, **unit**) |
| `habit_logs` | Zaliczenie nawyku per dzień (habit_id, date, done, **value_numeric**) |
| `daily_logs` | Dzienne metryki (focus_min, work_min, notes, checklist JSON) |
| `checklist_items` | Konfiguracja checklisty (name, active, is_streak, sort_order) |
| `journal_entries` | Wpisy dziennika (mood 1-5, sleep, weight, title, body, tags) |
| `goals` | Długoterminowe cele (pct, current, target, milestones) |
| `transactions` | Finanse (date, name, amount, category, type) |
| `sleep_logs` | Sen (hours, bed_time, wake_time, quality) |
| `weight_logs` | Waga (measured_at, weight_kg) |
| `water_logs` | Nawodnienie (date, ml, target_ml) |
| `push_subscriptions` | PWA push (endpoint, p256dh, auth) |

**Uwaga:** Kolumny `unit` i `value_numeric` nie są jeszcze w auto-generowanych typach (`database.types.ts`). Wszędzie gdzie są używane, stosujemy rzutowanie `as unknown as CustomType[]` lub `as any`. Po dodaniu kolumn SQL należy uruchomić `npx supabase gen types typescript` żeby zaktualizować typy.

**Wymagana migracja SQL** (jednorazowa, przez Supabase Dashboard → SQL Editor):
```sql
ALTER TABLE habits ADD COLUMN IF NOT EXISTS unit text DEFAULT NULL;
ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS value_numeric float DEFAULT NULL;
```

---

## System XP i poziomy

```
xpForLevel(n) = 50 * n * (n - 1)
→ Level 1: 0 XP
→ Level 2: 100 XP
→ Level 3: 300 XP
→ Level 5: 1 000 XP
→ Level 10: 4 500 XP
```

**Źródła XP:**
- Nawyk ukończony: +10 XP
- Focus time: 30 min = +8 XP
- Work time: 60 min = +5 XP
- Streak items: 5 / 10 / 20 XP (wg długości streak)
- Milestone streak (7d / 30d / 100d): +100 / +300 / +1000 XP
- Zerwanie streaka: -min(streak × 5, 500) XP

---

## Design system

**Schemat kolorów (zawsze dark, OKLch):**
- Tło: `oklch(0.16 0.005 240)` (ciemny, chłodny neutral)
- Akcent: terminal green `oklch(0.78 0.14 145)` (konfigurowalny przez TweaksPanel)
- Tekst: 4 poziomy gęstości: `--lo-text`, `--lo-text-muted`, `--lo-text-faint`, `--lo-text-dim`
- Semantic: warn (żółty), danger (czerwony), info (niebieski), success (zielony)

**Layout:**
- Desktop: fixed sidebar 320px + main content
- Mobile: hidden sidebar + bottom tab bar (82px + safe area)
- Siatka: `.lo-grid-4col / 3col / 2col` → 1-col na mobile

**Mobile CSS utilities (`globals.css`):**
- `.lo-habits-row` — kolumny tabeli nawyków, na mobile: 1fr + 24px
- `.lo-habit-detail` — grid szczegółów nawyku, na mobile: 1-col
- `.lo-today-xp-card` — karta XP, ukryta na mobile (XP widoczne w top barze)
- `.lo-journal-list / .lo-journal-detail` — master/detail dziennika na mobile (toggle przez React state)
- `.lo-journal-back` — przycisk powrotu w dzienniku, tylko mobile

**Customizacja (TweaksPanel + localStorage):**
- Hue akcentu: 0–360
- Chroma: 0.12–0.16
- Gęstość: compact / default / loose → klasa `.density-${value}` na shell

---

## Funkcje per-ekran

### `/today`
- Przegląd dnia: nawyki, XP, streak, quicklog
- XP karta ukryta na mobile (jest w top barze)
- Optymistyczne togglowanie nawyków z rollbackiem przy błędzie

### `/habits`
- Lista nawyków z filtrowaniem (all / daily / weekly / custom) i zakresem dat
- **Dodawanie nawyku**: `AddHabitDialog` — tryby `count` (X razy/tydzień) i `days` (konkretne dni), emoji picker, jednostka (unit)
- **Edycja nawyku**: ten sam dialog w trybie edit — pre-fill z istniejącego nawyku, wywołuje `updateHabit`
- **Logowanie wartości**: `HabitValueLogger` — 7-dniowe chipy dat + natywny date input (logowanie wstecz), h+min dla jednostek czasowych, liczba dla pozostałych
- Hover na nawyku na desktopie: checkmark (done/undone) widoczny tylko gdy `todayDone === true`

### `/daily`
- Tygodniowy przegląd z nawigacją (← tydzień →)
- Kafelki w `WeekDayDetail`: focus, praca, woda, streaki, **nawyki**, checklist — wszystkie klikalne
- Nawyki z jednostką: kliknięcie otwiera inline editor wartości (h+min lub liczba)
- Nawyki bez jednostki: kliknięcie toggleuje done/undone
- `WaterInlineEditor`: +250/+500/+750ml, -250ml
- `FocusInput` / `WorkInput`: format h+min, zapisuje przez `upsertFocus`/`upsertWork`
- Dodawanie checklisty, reordering (tylko dzisiaj), oznaczanie jako streak

### `/journal`
- Master/detail: lista wpisów po lewej, treść po prawej
- Mobile: przełączanie widoku przez state + CSS klasy (`.lo-journal-list`, `.lo-journal-detail`, `.lo-journal-back`)

### `/stats`
- Filtr okresu: 7d / 30d / 90d / rok
- Mapa nawyków (heatmap), scatter sen↔nastrój, trend wagi, focus time
- **Sekcja "Wartości nawyków"**: dla nawyków z `unit` — łącznie, średnia/sesję, max, mini bar chart
- Bar chart tooltip: własny styled tooltip śledzący kursor (nie natywny `title`)

### `/water`
- `WaterWidget`: optymistyczne dodawanie ml, quickadd (200/250/330/500ml), custom, cel
- `WaterHistoryScreen`: statystyki (Cel osiągnięty, Średnia, **Dziś**) aktualizują się na bieżąco — widget propaguje zmiany przez `onMlChange` callback

### `/sleep`
- Logowanie/edycja: h, zasnięcie, wstanie, jakość 1-5
- Optymistyczna aktualizacja listy: `logSleep` zwraca `SleepDay`, `updateSleepLog` wywołuje `onUpdated` callback

### `/weight`
- Logowanie/edycja pomiaru
- Optymistyczna aktualizacja: `logWeight` zwraca `WeightEntry` → aktualizuje listę i sparkline bez odświeżania

### `/finance`
- Transakcje: dodawanie, edycja, usuwanie
- Optymistyczna aktualizacja: `addTransaction` zwraca `Transaction` → pojawia się na liście od razu
- Kategorie i wykres miesięczny liczą się z lokalnego `txs` state

---

## Optymistyczne aktualizacje

Wzorzec stosowany we wszystkich mutacjach — UI aktualizuje się przed odpowiedzią serwera lub natychmiast po niej (bez page reload). `revalidatePath()` nadal jest wywoływane server-side dla spójności cache.

| Ekran | Operacja | Mechanizm |
|---|---|---|
| Water | add/undo | `setMl(next)` przed `startAdd()` + `onMlChange` callback do parent |
| Sleep | create | `logSleep` zwraca `SleepDay` → `onAdded(entry)` |
| Sleep | update | `onUpdated(entry)` callback z danymi z form state |
| Sleep | delete | `onDeleted(id)` → `filter` |
| Weight | create | `logWeight` zwraca `WeightEntry` → `onAdded(entry)` |
| Weight | update | `onUpdated(entry)` callback |
| Weight | delete | `onDeleted(id)` → `filter` |
| Finance | create | `addTransaction` zwraca `Transaction` → prepend do `txs` |
| Finance | update | `onUpdated(tx)` → `map` |
| Finance | delete | `setTxs(filter)` przed `deleteTransaction()` |
| Habits | toggle today | `useOptimistic` z rollbackiem |
| Daily checklist | toggle | lokalny `setChecklist` + server action |
| Daily habits | toggle / value | lokalny `setHabits` / `setHabitValues` + server action |

---

## Kluczowe Server Actions

### `habits/actions.ts`
- `getHabitsForToday()` — nawyki + logi tygodniowe dla `/today`
- `getHabitsList()` / `getHabitsRange(days)` — pełne dane z `completionRate`, `streak`, `best`, `todayValue`, `logs[]`
- `toggleHabitLog(habitId, date, done)` — upsert log done/undone
- `logHabitValue(habitId, date, value)` — upsert `value_numeric` + `done: true`
- `createHabit(data)` — insert + zwraca `HabitFull`
- `updateHabit(id, data)` — update nawyku
- `deleteHabit(id)` — soft delete (`active: false`)

### `daily/actions.ts`
- `getWeekData(weekOffset)` — zwraca `DayData[]` z `habits[].unit` i `habits[].value`, checklistę, streaki
- `toggleHabitForDate(habitId, date, done)` — upsert log
- `toggleChecklistItem(date, itemId, done)` — upsert checklist JSON
- `upsertFocus(date, minutes)` / `upsertWork(date, minutes)`
- `setWaterForDate(date, ml, targetMl)` — upsert water_logs

### `stats/actions.ts`
- `getStatsData()` — zwraca `StatsData` z `habitValueStats: HabitValueStat[]` (nawyki z `unit` + ich logi wartości z ostatnich 365 dni)

---

## Konwencje kodowania

- Każda strona: `page.tsx` (server) + `actions.ts` (server actions) + `loading.tsx`
- Komponenty ekranów: suffix `Screen` (np. `TodayScreen`) — client components
- Dialogi: suffix `Dialog` — zawierają własny `useTransition`
- `cn()` z `lib/utils.ts` do łączenia klas Tailwind
- `Promise.all()` do równoległego fetchowania danych server-side
- Język UI: **polski**
- Brak light mode — wymuszone dark przez zmienne CSS
- Kolumny poza generowanymi typami: `as unknown as CustomType[]` lub `as any` z lokalnym `type` dla czytelności
- Jednostki czasu (`unit === 'min' | 'h' | ...`): wykrywane przez `isTimeUnit()`, przechowywane jako minuty w `value_numeric`, wyświetlane jako `Xh Ymin`

---

## Nawigacja i UX

**Skróty klawiszowe (globalnie):**
| Skrót | Akcja |
|---|---|
| `Cmd/Ctrl + K` | Command palette |
| `Cmd/Ctrl + D` | Today |
| `Cmd/Ctrl + W` | Weight |
| `Cmd/Ctrl + E` | Finance |
| `Cmd/Ctrl + Shift + J` | Journal |
| `Cmd/Ctrl + ,` | Tweaks panel |
| `1–5` | Szybka nawigacja (Today/Daily/Habits/Journal/Stats) |

**Uwierzytelnianie:**
- Supabase SSR + middleware — cookie session, auto-refresh tokenów
- Redirect do `/login` gdy brak sesji
- Przekierowanie z `/` → `/today`

**PWA:**
- next-pwa z Turbopack (wyłączone w dev)
- Service worker dla offline i push notifications
- API routes: `/api/push/morning`, `/api/push/evening`, `/api/push/subscribe`
- Przycisk push w TopBar: ikona dzwonka 🔔/🔕 (32×32), bez tekstu

---

## Co warto wiedzieć przed pracą

1. **Supabase RLS** — każda tabela ma Row Level Security; mutacje muszą być przez autentykowanego klienta.
2. **Server Actions** — preferowane nad API routes do mutacji; zawsze kończą się `revalidatePath()`.
3. **Tweaks hook** — `useTweaks()` zarządza CSS variables dynamicznie przez `document.documentElement.style.setProperty`.
4. **XP jest obliczane server-side** w `today/actions.ts` → `getSidebarXP()` dla sidebaru.
5. **Brak testów** — projekt bez test suite, brak Storybook.
6. **database.types.ts** — jest auto-generowany z Supabase CLI, nie edytować ręcznie. Kolumny `unit` i `value_numeric` nie są w typach — używać rzutowań.
7. **Optymistyczne aktualizacje** — wszystkie mutacje zwracają pełne obiekty (`HabitFull`, `SleepDay`, `WeightEntry`, `Transaction`) żeby UI mogło zaktualizować state bez odświeżania.
8. **`isTimeUnit(unit)`** — helper dostępny zarówno w `habits-screen.tsx`, `daily-screen.tsx` jak i `stats-screen.tsx`; wartości czasowe przechowywane jako minuty (całość), wyświetlane jako `Xh Ymin`.

---

## Komendy

```bash
npm run dev     # localhost:3000 z Turbopack
npm run build   # produkcja
npm run lint    # ESLint
npx supabase gen types typescript --project-id <ID> > src/types/database.types.ts  # regeneracja typów
```
