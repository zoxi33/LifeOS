# LifeOS — Handoff do Claude Code (Next.js + Tailwind + shadcn/ui)

Ten dokument pozwala odtworzyć prototyp LifeOS 1:1 jako produkcyjny projekt Next.js z TypeScriptem, Tailwind v4 i shadcn/ui. Czytaj sekcje po kolei — to jest skrypt do wklejenia do Claude Code w VS Code.

---

## 0. Pliki źródłowe (referencja)

W projekcie HTML masz wszystko czego potrzebujesz:

| Plik | Co zawiera |
|---|---|
| `tokens.css` | **Wszystkie tokeny designu** — kolory (oklch), typografia, radii, spacing, shadow. To jest źródło prawdy. |
| `components.jsx` | Atomy: `Icon`, `HabitRing`, `Sparkline`, `Heatmap`, `Bar`, `SectionHeader` |
| `today.jsx` | Today screen + `Sidebar`, `TopBar`, `StreakCard`, `HabitRow`, `MoodLogger`, `QuickLog`, `GoalsStrip`, `StatTile`, `FinanceMini`, `XPCard` |
| `screens.jsx` | `HabitsScreen` (z `HabitListRow`, `HabitDetail`), `JournalScreen`, `StatsScreen` |
| `modules.jsx` | `GoalsScreen`, `FinanceScreen`, `SleepScreen`, `WeightScreen` |
| `mobile.jsx` | `MobileToday`, `CommandPalette` |
| `app.jsx` | `AppShell` — routing, keyboard shortcuts, tweaki |
| `LifeOS.html` | Punkt wejścia — pokazuje jak wszystko się składa |

---

## 1. Setup projektu

```bash
npx create-next-app@latest lifeos --typescript --tailwind --app --src-dir --import-alias "@/*"
cd lifeos
npx shadcn@latest init
# wybierz: New York style, Neutral base color, CSS variables YES

# Komponenty z shadcn:
npx shadcn@latest add button card input dialog command separator progress slider tabs badge dropdown-menu

# Czcionki Geist (są u Vercela):
npm i geist
```

W `app/layout.tsx`:
```tsx
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

export default function RootLayout({ children }) {
  return (
    <html lang="pl" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

---

## 2. Tokens — przepisanie do Tailwind

Otwórz `tokens.css` z prototypu i przenieś wartości do `app/globals.css`. Skopiuj je dokładnie — to jest źródło prawdy:

```css
@import "tailwindcss";

@theme {
  --color-bg:           oklch(0.16 0.005 240);
  --color-bg-2:         oklch(0.185 0.005 240);
  --color-surface:      oklch(0.205 0.005 240);
  --color-surface-2:    oklch(0.235 0.005 240);
  --color-border:       oklch(0.275 0.006 240);
  --color-border-strong:oklch(0.34 0.007 240);
  --color-text:         oklch(0.965 0.004 240);
  --color-text-muted:   oklch(0.68 0.005 240);
  --color-text-faint:   oklch(0.50 0.005 240);
  --color-text-dim:     oklch(0.38 0.005 240);
  --color-accent:       oklch(0.78 0.14 145);
  --color-accent-soft:  oklch(0.78 0.14 145 / 0.14);
  --color-accent-line:  oklch(0.78 0.14 145 / 0.32);
  --color-warn:         oklch(0.78 0.13 78);
  --color-danger:       oklch(0.68 0.16 25);

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

Mapping na klasy Tailwind: `bg-bg`, `bg-surface`, `text-text-muted`, `border-border`, `text-accent` itd.

W `tailwind.config.ts` upewnij się że `darkMode: 'class'` (lub od razu w html className).

---

## 3. Struktura katalogów

```
src/
  app/
    layout.tsx
    page.tsx                  → redirect na /today
    today/page.tsx
    habits/page.tsx
    journal/page.tsx
    stats/page.tsx
    goals/page.tsx
    finance/page.tsx
    sleep/page.tsx
    weight/page.tsx
    (shell)/layout.tsx        → Sidebar + TopBar
  components/
    ui/                       ← shadcn (auto)
    primitives/
      icon.tsx                ← z components.jsx
      habit-ring.tsx
      sparkline.tsx
      heatmap.tsx
      bar.tsx
      section-header.tsx
    layout/
      sidebar.tsx
      top-bar.tsx
      command-palette.tsx
    today/
      streak-card.tsx
      habit-row.tsx
      quick-log.tsx
      goals-strip.tsx
      stat-tile.tsx
      finance-mini.tsx
      xp-card.tsx
    habits/
      habit-list-row.tsx
      habit-detail.tsx
    journal/
      entry-list.tsx
      entry-detail.tsx
    stats/
      consistency-grid.tsx
      sleep-mood-scatter.tsx
    goals/
      goal-detail.tsx
    finance/
      categories.tsx
      transactions.tsx
      monthly-bars.tsx
    sleep/
      hours-chart.tsx
      quality-distribution.tsx
    weight/
      trend-chart.tsx
      log-table.tsx
  lib/
    mock-data.ts              ← wszystkie dane z prototypu
    utils.ts
  hooks/
    use-tweaks.ts
```

---

## 4. Konwersja inline style → Tailwind

Każdy komponent w prototypie używa `style={{...}}`. Reguła konwersji:

```jsx
// prototype
<div style={{ display:'flex', gap:8, padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>

// Next.js + Tailwind
<div className="flex gap-2 px-[18px] py-[14px] border-b border-border">
```

Tabele konwersji (najczęstsze):

| Inline | Tailwind |
|---|---|
| `display:'flex'` | `flex` |
| `gap:8` | `gap-2` (8/4) |
| `padding:'14px 18px'` | `px-[18px] py-[14px]` lub `px-4.5 py-3.5` |
| `border:'1px solid var(--border)'` | `border border-border` |
| `borderRadius:'var(--r-md)'` | `rounded-md` |
| `fontFamily:'var(--font-mono)'` | `font-mono` |
| `font-feature-settings:"tnum"` | dodaj util `.tnum { font-variant-numeric: tabular-nums; }` |
| `color:'var(--text-muted)'` | `text-text-muted` |

Klasy custom które warto dodać do globals.css:
```css
.tnum { font-variant-numeric: tabular-nums; }
.label-eyebrow { @apply font-mono text-[11px] uppercase tracking-[0.08em] text-text-faint; }
```

---

## 5. Mapowanie do shadcn/ui

| Prototype | shadcn |
|---|---|
| `.card`, `.card-pad` | `<Card>` + `<CardContent>` |
| `.btn`, `.btn-accent`, `.btn-ghost` | `<Button variant="default|secondary|ghost|outline">` — tweakuj theme tak żeby kolory pasowały |
| `.chip` | `<Badge variant="secondary">` |
| `CommandPalette` | `<Command>` + `<CommandDialog>` (cmdk wbudowany w shadcn) |
| `MoodLogger` (1-5) | `<ToggleGroup type="single">` |
| range slider | `<Slider>` |
| Heatmap, Sparkline, HabitRing, Bar | **NIE używaj shadcn** — to są custom SVG komponenty z prototypu, skopiuj 1:1 |
| Tabs (filter Habits) | `<Tabs>` |

---

## 6. Routing i state

- Sidebar nawigacja → `<Link>` z `next/link`, aktywny stan przez `usePathname()`
- Tweaks panel → `useTweaks` hook → zapisuj do `localStorage` (kluczowe: w prototypie używaliśmy postMessage do hosta, w Next.js po prostu `localStorage`)
- Command palette → globalny shortcut `⌘K` przez `useEffect` w `(shell)/layout.tsx`
- Skróty `1/2/3/4` → ten sam pattern, w shell layout
- Mock data → `lib/mock-data.ts`, eksportuj wszystkie tablice z `today.jsx`, `screens.jsx`, `modules.jsx`

---

## 7. Animacje i UX

W prototypie:
- transitions: `.12s ease` (hover), `.35s ease` (progress bars, rings)
- focus ring: `outline: 2px solid var(--accent); outline-offset: 2px`
- `prefers-reduced-motion` respect — zostaw

W Next.js:
- `transition-all duration-150` dla hover
- `motion-reduce:transition-none` na każdym komponencie z animacją
- Focus ring → użyj shadcn defaults (już mają to w `globals.css`)

---

## 8. Jak najefektywniej pracować z Claude Code

**Cel: 1:1 z prototypem.** Nie improwizuj — kopiuj wartości dokładnie.

### Workflow:

1. **Zacznij od ekstrakcji projektu z chatu**:
   Pobierz cały folder projektu (ikona download w UI). Otwórz w VS Code obok `lifeos/` (nowy projekt Next).

2. **Otwórz Claude Code w VS Code** (`/code` z Claude.ai dot. tego projektu, lub osobne CLI).

3. **Pierwszy prompt do Claude Code** — wklej to dosłownie:

   > Skonwertuj prototyp z folderu `../lifeos-prototype/` (gdzie są pliki `tokens.css`, `components.jsx`, `today.jsx`, `screens.jsx`, `modules.jsx`, `mobile.jsx`, `app.jsx`, `LifeOS.html`) na Next.js App Router z TypeScriptem, Tailwind v4 i shadcn/ui. Wymagania:
   >
   > 1. Najpierw przeczytaj `tokens.css` i wstaw wszystkie tokeny do `src/app/globals.css` w bloku `@theme`. Każdy token z prototypu musi się znaleźć — to jest źródło prawdy dla kolorów.
   > 2. Następnie przeczytaj `components.jsx` i przepisz `Icon`, `HabitRing`, `Sparkline`, `Heatmap`, `Bar`, `SectionHeader` jako TypeScript komponenty w `src/components/primitives/`. Te są custom SVG, NIE wymieniaj na shadcn.
   > 3. Stwórz layout `(shell)/layout.tsx` z Sidebar i TopBar według wzoru z `today.jsx` (komponenty `Sidebar` i `TopBar`). Sidebar używa `usePathname()` zamiast `active` propa. NIE mutuj DOM bezpośrednio — hover state przez React `useState` (jak w `SidebarItem` w prototypie).
   > 4. Stwórz strony `/today`, `/habits`, `/journal`, `/stats`, `/goals`, `/finance`, `/sleep`, `/weight` — każda odpowiada komponentowi z prototypu (`TodayScreen` → `app/today/page.tsx` itd.).
   > 5. Wszystkie inline `style={{...}}` z prototypu konwertuj na klasy Tailwind. Jeśli wartość nie ma odpowiednika w skali Tailwind — użyj arbitrary value `[Npx]`. Nie zmieniaj wartości — tylko składnię.
   > 6. `Card`, `Button`, `Badge`, `Slider`, `Command`, `Tabs`, `Dialog` z shadcn — reszta custom.
   > 7. Dane testowe (tablice `todayHabits`, `habitsList`, `journalEntries`, `goalsData`, `txData`, `sleepDays`, `weightLog` itd.) wyciągnij do `src/lib/mock-data.ts`.
   > 8. Tweaks panel (akcent hue/chroma, density, streak prominence) — `useTweaks` hook → localStorage, applyaccent przez CSS custom properties na `<html>`.
   > 9. Skróty klawiszowe ⌘K (palette), 1/2/3/4 (nav) — w shell layout przez `useEffect`.
   >
   > Zacznij od kroku 1. Po każdym kroku zatrzymaj się i pokaż mi diff.

4. **Po każdym kroku** Claude Code pokaże diff. **NIE łącz wszystkiego naraz** — krok 1 (tokens) → odpal `npm run dev`, sprawdź czy ciemny motyw działa → krok 2 (atomy) → sprawdź renderowanie → itd.

5. **Druga faza — strony**. Dla każdej strony:
   ```
   Skonwertuj `today.jsx` (komponent `TodayScreen` + jego sub-komponenty: 
   `StreakCard`, `HabitRow`, `MoodLogger`, `QuickLog`, `GoalsStrip`, 
   `StatTile`, `FinanceMini`, `XPCard`) na `src/app/today/page.tsx` i 
   `src/components/today/*.tsx`. Zachowaj IDENTYCZNY layout, identyczne 
   wartości spacingu, identyczne dane mock. Każdy `style={{...}}` → Tailwind.
   ```

6. **Weryfikacja** — porównuj side-by-side:
   - Otwórz prototyp HTML w jednym oknie przeglądarki
   - Otwórz `localhost:3000/today` w drugim
   - Skacz między widokami: Today, Habits, Journal, Stats, Goals, Finance, Sleep, Weight
   - Każda różnica > 4px = wracasz do Claude Code: "na ekranie X karta Y ma odstęp 14px w prototypie, w Next masz 12, popraw"

### Wskazówki dla 1:1 fidelity

- **Liczby z prototypu są celowe.** Jeśli widzisz `padding: '14px 18px'` to NIE jest `p-4` (16px) — to jest `px-[18px] py-[14px]`. Trzymaj się tego.
- **Kolory tylko z tokenów.** Żaden hex w komponentach. Tylko `bg-bg`, `text-text`, `border-border`, `text-accent`.
- **Mono dla liczb.** Każda liczba (streak, kg, zł, godziny, %) musi być w `font-mono tnum`. To kręgosłup wizualny systemu.
- **Tabular-nums.** Bez tego liczby będą skakać przy zmianie. Dodaj `.tnum` util globalnie.
- **Akcent OSZCZĘDNIE.** Zielony tylko: aktywny streak, ukończony nawyk, sukces (delta na plus), CTA `Zapisz`. Reszta — szarości.
- **Bez gradientów. Bez emoji. Bez glassmorphism.** To jest w briefie — anti-references.

### Performance

- `next/font` dla Geista (już w setupie) → zero CLS na fontach
- `dynamic(() => import(...))` dla `CommandPalette` (renderuj tylko po `⌘K`)
- Heatmapy / wykresy — pure SVG, bez biblioteki, mało DOM
- `prefers-reduced-motion` respect (zostawione w tokens.css)

---

## 9. Co zostawiamy na później

Te rzeczy są w prototypie ale **w prawdziwym Next.js** wymagają decyzji architektonicznych:

- **Persystencja** — Postgres + Drizzle ORM albo SQLite + Prisma. Single-user, więc lokalna DB wystarczy.
- **Auth** — single-user, więc wystarczy hasło w `.env` + middleware sprawdzający cookie. NextAuth overkill.
- **Powiadomienia / przypomnienia** — Service Worker + Notifications API.
- **Sync mobile ↔ desktop** — jeśli single-user i lokalna baza, to PWA + IndexedDB; jeśli serwer, to API routes Next.js.
- **Eksport danych** — JSON dump endpoint.

Ale to są decyzje na **po** odtworzeniu UI 1:1. Najpierw piksele, potem dane.

---

## 10. Kolejność wykonania (TL;DR)

1. `create-next-app` + shadcn init
2. Skopiuj tokeny z `tokens.css` → `globals.css`
3. Skonwertuj atomy (`Icon`, `Bar`, `Sparkline`, `Heatmap`, `HabitRing`, `SectionHeader`)
4. Layout (Sidebar + TopBar) + routing
5. Today (najgęstszy ekran, jak działa to reszta jest łatwa)
6. Habits, Journal, Stats
7. Goals, Finance, Sleep, Weight
8. Mobile breakpointy (`md:`, `lg:`) — testuj na 390px i 1440px
9. CommandPalette + skróty klawiszowe
10. Tweaks panel + localStorage
11. Audyt: side-by-side z prototypem, ekran po ekranie

Czas: ~6-10h pracy z Claude Code dla doświadczonego użytkownika.

---

## 11. Co eksportujesz teraz

W chacie tego projektu możesz pobrać cały folder z plikami źródłowymi (`tokens.css`, wszystkie `.jsx`, `LifeOS.html`, ten plik). Wrzuć go obok nowego projektu Next.js — Claude Code w VS Code czyta sąsiednie foldery bez problemu, więc będzie miał pełny kontekst do konwersji.
