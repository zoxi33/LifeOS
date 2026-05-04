'use client';

import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command';
import { Icon } from '@/components/primitives/icon';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { href: '/today',   icon: 'home',   label: 'Dziś',       kbd: '1' },
  { href: '/habits',  icon: 'list',   label: 'Nawyki',     kbd: '2' },
  { href: '/journal', icon: 'book',   label: 'Dziennik',   kbd: '3' },
  { href: '/stats',   icon: 'chart',  label: 'Statystyki', kbd: '4' },
  { href: '/goals',   icon: 'goal',   label: 'Cele',       kbd: ''  },
  { href: '/finance', icon: 'wallet', label: 'Finanse',    kbd: ''  },
  { href: '/sleep',   icon: 'moon',   label: 'Sen',        kbd: ''  },
  { href: '/weight',  icon: 'weight', label: 'Waga',       kbd: ''  },
];

const ACTION_ITEMS = [
  { icon: 'check',    label: 'Odhacz nawyk dziś',      kbd: '⌘D',   href: '/today'   },
  { icon: 'book',     label: 'Nowy wpis dziennika',    kbd: '⌘⇧J',  href: '/journal' },
  { icon: 'weight',   label: 'Zaloguj wagę',           kbd: '⌘W',   href: '/weight'  },
  { icon: 'mood',     label: 'Zaloguj nastrój',        kbd: '⌘M',   href: '/today'   },
  { icon: 'wallet',   label: 'Dodaj wydatek',          kbd: '⌘E',   href: '/finance' },
  { icon: 'goal',     label: 'Nowy cel',               kbd: '',     href: '/goals'   },
  { icon: 'settings', label: 'Ustawienia / Tweaks',   kbd: '⌘,',   href: '/today'   },
];

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();

  const run = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={v => { if (!v) onClose(); }}
      title="Szybkie akcje"
      description="Wyszukaj lub uruchom akcję"
      className="max-w-[560px] border-border-strong bg-surface shadow-[0_30px_80px_oklch(0_0_0/0.6)]"
    >
      <Command className="rounded-xl! bg-surface text-text [&_[cmdk-group-heading]]:text-text-faint">
        <CommandInput
          placeholder="Szukaj akcji, nawiguj…"
          className="text-text placeholder:text-text-faint"
        />
        <CommandList className="max-h-[360px] p-1">
          <CommandEmpty className="text-text-faint">
            Brak wyników.
          </CommandEmpty>

          <CommandGroup heading="Nawigacja">
            {NAV_ITEMS.map(it => (
              <CommandItem
                key={it.href}
                value={it.label}
                onSelect={() => run(it.href)}
                className="gap-3 rounded-lg cursor-pointer"
              >
                <Icon name={it.icon} size={14} style={{ color: 'var(--lo-text-muted)', flexShrink: 0 }} />
                <span style={{ fontSize: 13 }}>{it.label}</span>
                {it.kbd && (
                  <CommandShortcut>
                    <Kbd>{it.kbd}</Kbd>
                  </CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Akcje">
            {ACTION_ITEMS.map(it => (
              <CommandItem
                key={it.label}
                value={it.label}
                onSelect={() => run(it.href)}
                className="gap-3 rounded-lg cursor-pointer"
              >
                <Icon name={it.icon} size={14} style={{ color: 'var(--lo-text-muted)', flexShrink: 0 }} />
                <span style={{ fontSize: 13 }}>{it.label}</span>
                {it.kbd && (
                  <CommandShortcut>
                    <Kbd>{it.kbd}</Kbd>
                  </CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: 'var(--font-geist-mono)',
      fontSize: 11, padding: '1px 5px',
      border: '1px solid var(--lo-border)', borderBottomWidth: 2,
      borderRadius: 4, color: 'var(--lo-text-muted)', background: 'var(--lo-bg-2)',
    }}>
      {children}
    </span>
  );
}
