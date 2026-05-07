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
    primitives/       ← Bar, SectionHeader
    <feature>/        ← komponenty per-feature
  lib/
    supabase/         ← client.ts, server.ts, queries.ts
    xp.ts             ← system XP
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
| `habits` | Katalog nawyków (name, emoji, freq, type, target) |
| `habit_logs` | Zaliczenie nawyku per dzień (habit_id, date, done) |
| `daily_logs` | Dzienne metryki (focus_min, work_min, notes, checklist JSON) |
| `checklist_items` | Konfiguracja checklisty (name, active, is_streak, sort_order) |
| `journal_entries` | Wpisy dziennika (mood 1-5, sleep, weight, title, body, tags) |
| `goals` | Długoterminowe cele (pct, current, target, milestones) |
| `transactions` | Finanse (date, name, amount, category, type) |
| `sleep_logs` | Sen (hours, bed_time, wake_time, quality) |
| `weight_logs` | Waga (measured_at, weight_kg) |
| `push_subscriptions` | PWA push (endpoint, p256dh, auth) |

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

**Customizacja (TweaksPanel + localStorage):**
- Hue akcentu: 0–360
- Chroma: 0.12–0.16
- Gęstość: compact / default / loose → klasa `.density-${value}` na shell

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

---

## Konwencje kodowania

- Każda strona: `page.tsx` (server) + `actions.ts` (server actions) + `loading.tsx`
- Komponenty ekranów: suffix `Screen` (np. `TodayScreen`) — client components
- `cn()` z `lib/utils.ts` do łączenia klas Tailwind
- `Promise.all()` do równoległego fetchowania danych server-side
- Język UI: **polski**
- Brak light mode — wymuszone dark przez zmienne CSS

---

## Komendy

```bash
npm run dev     # localhost:3000 z Turbopack
npm run build   # produkcja
npm run lint    # ESLint
```

---

## Co warto wiedzieć przed pracą

1. **Supabase RLS** — każda tabela ma Row Level Security; mutacje muszą być przez autentykowanego klienta.
2. **Server Actions** — preferowane nad API routes do mutacji; zawsze kończą się `revalidatePath()`.
3. **Tweaks hook** — `useTweaks()` zarządza CSS variables dynamicznie przez `document.documentElement.style.setProperty`.
4. **XP jest obliczane server-side** w `today/actions.ts` → `getSidebarXP()` dla sidebaru.
5. **Brak testów** — projekt bez test suite, brak Storybook.
6. **database.types.ts** — jest auto-generowany z Supabase CLI, nie edytować ręcznie.
