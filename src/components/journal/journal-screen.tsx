'use client';

import { useState, useTransition } from 'react';
import { Icon } from '@/components/primitives/icon';
import { DayEntryDialog } from './day-entry-dialog';
import { deleteJournalEntry } from '@/app/(shell)/journal/actions';
import type { JournalEntry } from '@/types/lifeos';

const MOOD_EMOJI: Record<number, string> = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };
const MOOD_COLOR: Record<number, string> = {
  1: 'var(--lo-danger)',
  2: 'var(--lo-warn)',
  3: 'var(--lo-text-faint)',
  4: 'var(--lo-accent)',
  5: 'var(--lo-accent)',
};

function formatDate(d: string) {
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: 'var(--font-geist-mono)', fontSize: 11, padding: '2px 6px',
      border: '1px solid var(--lo-border)', borderBottomWidth: 2,
      borderRadius: 4, color: 'var(--lo-text-muted)', background: 'var(--lo-bg-2)',
    }}>{children}</span>
  );
}

function EntryList({ entries, selectedId, onSelect }: {
  entries: JournalEntry[];
  selectedId: string | null;
  onSelect: (e: JournalEntry) => void;
}) {
  return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      {entries.map((j, i) => (
        <button
          key={j.id}
          onClick={() => onSelect(j)}
          style={{
            width: '100%', textAlign: 'left',
            padding: '14px 16px',
            background: selectedId === j.id ? 'var(--lo-surface-2)' : 'transparent',
            border: 'none',
            borderBottom: i < entries.length - 1 ? '1px solid var(--lo-border)' : 'none',
            borderLeft: '2px solid ' + (selectedId === j.id ? 'var(--lo-accent)' : 'transparent'),
            color: 'var(--lo-text)', fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: 'var(--lo-text-faint)' }}>
              {j.date}
            </span>
            <span title={`Nastrój ${j.mood}/5`} style={{ fontSize: 13 }}>{MOOD_EMOJI[j.mood]}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 450, lineHeight: 1.4 }}>
            {j.title && j.title !== j.date ? j.title : formatDate(j.date)}
          </div>
          {j.body && (
            <div style={{ fontSize: 11, color: 'var(--lo-text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {j.body}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function EntryDetail({ e, onEdit, onDelete }: {
  e: JournalEntry; onEdit: () => void; onDelete: () => void;
}) {
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, startDelete] = useTransition();
  const wordCount = e.body.trim() ? e.body.trim().split(/\s+/).length : 0;
  const readMin = Math.max(1, Math.round(wordCount / 200));

  return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 18,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)' }}>
            {formatDate(e.date)}
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.25 }}>
            {e.title && e.title !== e.date ? e.title : formatDate(e.date)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={onEdit}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 12px',
              background: 'transparent', color: 'var(--lo-text-muted)',
              border: '1px solid var(--lo-border)', borderRadius: 8,
              fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={ev => { (ev.currentTarget as HTMLButtonElement).style.background = 'var(--lo-surface-2)'; }}
            onMouseLeave={ev => { (ev.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <Icon name="edit" size={13} /> Edytuj
          </button>
          {!confirmDel ? (
            <button
              onClick={() => setConfirmDel(true)}
              title="Usuń wpis"
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'transparent', color: 'var(--lo-text-dim)',
                border: '1px solid var(--lo-border)', display: 'grid', placeItems: 'center',
                cursor: 'pointer',
              }}
              onMouseEnter={ev => { (ev.currentTarget as HTMLButtonElement).style.color = 'var(--lo-danger)'; }}
              onMouseLeave={ev => { (ev.currentTarget as HTMLButtonElement).style.color = 'var(--lo-text-dim)'; }}
            >
              <Icon name="trash" size={13} />
            </button>
          ) : (
            <>
              <span style={{ fontSize: 11, color: 'var(--lo-text-muted)', fontFamily: 'var(--font-geist-mono)' }}>Usuń?</span>
              <button
                disabled={deleting}
                onClick={() => startDelete(async () => { await deleteJournalEntry(e.id); onDelete(); })}
                style={{
                  height: 28, padding: '0 10px',
                  background: 'color-mix(in oklch, var(--lo-danger) 12%, transparent)',
                  color: 'var(--lo-danger)',
                  border: '1px solid color-mix(in oklch, var(--lo-danger) 30%, transparent)',
                  borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >{deleting ? '…' : 'Tak'}</button>
              <button
                onClick={() => setConfirmDel(false)}
                style={{
                  height: 28, padding: '0 10px',
                  background: 'var(--lo-surface-2)', color: 'var(--lo-text-muted)',
                  border: '1px solid var(--lo-border)', borderRadius: 6,
                  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >Nie</button>
            </>
          )}
        </div>
      </div>

      {/* Meta strip */}
      <div style={{
        display: 'flex', gap: 20, flexWrap: 'wrap',
        padding: '12px 0',
        borderTop: '1px solid var(--lo-border)',
        borderBottom: '1px solid var(--lo-border)',
        alignItems: 'center',
      }}>
        <div>
          <div className="label-eyebrow" style={{ marginBottom: 4 }}>Nastrój</div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 16 }}>
            <span style={{ marginRight: 6 }}>{MOOD_EMOJI[e.mood]}</span>
            <span style={{ color: MOOD_COLOR[e.mood] }}>{e.mood}/5</span>
          </div>
        </div>
        {e.sleep > 0 && (
          <div>
            <div className="label-eyebrow" style={{ marginBottom: 4 }}>Sen</div>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 16 }}>{e.sleep} h</div>
          </div>
        )}
        {e.weight > 0 && (
          <div>
            <div className="label-eyebrow" style={{ marginBottom: 4 }}>Waga</div>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 16 }}>{e.weight} kg</div>
          </div>
        )}
        {e.tags.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            {e.tags.map(t => (
              <span key={t} style={{
                display: 'inline-flex', alignItems: 'center',
                height: 22, padding: '0 8px',
                background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
                borderRadius: 999, fontSize: 11, color: 'var(--lo-text-muted)',
                fontFamily: 'var(--font-geist-mono)',
              }}>#{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--lo-text)', whiteSpace: 'pre-wrap' }}>
        {e.body || <span style={{ color: 'var(--lo-text-muted)', fontStyle: 'italic' }}>Brak treści. Kliknij „Edytuj" żeby dodać podsumowanie.</span>}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 'auto', paddingTop: 16,
        borderTop: '1px solid var(--lo-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-dim)' }}>
          {wordCount > 0 ? `${wordCount} słów · ${readMin} min czytania` : 'Pusty wpis'}
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>J</Kbd>
          <span style={{ fontSize: 11, color: 'var(--lo-text-faint)', marginLeft: 6 }}>dzisiejszy wpis</span>
        </div>
      </div>
    </div>
  );
}

export function JournalScreen({ initialEntries = [] }: { initialEntries?: JournalEntry[] }) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [selectedId, setSelectedId] = useState<string | null>(initialEntries[0]?.id ?? null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const todayStr = new Date().toISOString().slice(0, 10);

  const filtered = search.trim()
    ? entries.filter(e => {
        const q = search.toLowerCase();
        return e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q));
      })
    : entries;

  const selected = entries.find(e => e.id === selectedId) ?? filtered[0] ?? null;

  const openDialog = (date: string) => {
    setDialogDate(date);
    setDialogOpen(true);
  };

  const openToday = () => openDialog(todayStr);

  const openSelected = () => {
    if (selected) openDialog(selected.date);
  };

  const existingForDialog = entries.find(e => e.date === dialogDate) ?? null;

  const handleSaved = (saved: JournalEntry) => {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.date === saved.date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setSelectedId(saved.id);
  };

  const handleDelete = () => {
    if (!selected) return;
    const remaining = entries.filter(e => e.id !== selected.id);
    setEntries(remaining);
    setSelectedId(remaining[0]?.id ?? null);
  };

  if (filtered.length === 0 && !search) return (
    <>
      <DayEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={dialogDate}
        existing={existingForDialog}
        onSaved={handleSaved}
      />
      <div className="lo-screen" style={{ padding: '20px 24px 40px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="label-eyebrow">Dziennik</div>
          <button onClick={openToday} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 32, padding: '0 12px',
            background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
            border: '1px solid var(--lo-accent-line)', borderRadius: 8,
            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <Icon name="plus" size={13} /> Dziś
          </button>
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--lo-text-muted)' }}>
          Brak wpisów — zacznij od podsumowania dzisiejszego dnia.
        </div>
      </div>
    </>
  );

  return (
    <>
      <DayEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={dialogDate}
        existing={existingForDialog}
        onSaved={handleSaved}
      />
      <div className="lo-grid-sidebar lo-screen" style={{
        padding: '20px 24px 40px',
        maxWidth: 1280, margin: '0 auto', width: '100%',
      }}>
        {/* Sidebar */}
        <div className={mobileView === 'detail' ? 'lo-journal-list' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="label-eyebrow">Dziennik</div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
                {entries.length} {entries.length === 1 ? 'dzień' : 'dni'}
              </div>
            </div>
            <button
              onClick={openToday}
              title={entries.find(e => e.date === todayStr) ? 'Otwórz wpis z dziś' : 'Utwórz wpis na dziś'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 32, padding: '0 12px',
                background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
                border: '1px solid var(--lo-accent-line)', borderRadius: 8,
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Icon name="plus" size={13} />
              {entries.find(e => e.date === todayStr) ? 'Dziś ✓' : 'Dziś'}
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={13} style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--lo-text-faint)', pointerEvents: 'none',
            }} />
            <input
              placeholder="Szukaj…"
              value={search}
              onChange={e => { setSearch(e.target.value); }}
              style={{
                width: '100%', height: 32, paddingLeft: 30, paddingRight: 10,
                background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)',
                borderRadius: 8, color: 'var(--lo-text)', fontFamily: 'inherit', fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: 'var(--lo-text-dim)', cursor: 'pointer',
                  display: 'grid', placeItems: 'center',
                }}
              >
                <Icon name="x" size={12} />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--lo-text-muted)', padding: '8px 0' }}>
              Brak wyników dla „{search}".
            </div>
          ) : (
            <EntryList
              entries={filtered}
              selectedId={selected?.id ?? null}
              onSelect={e => { setSelectedId(e.id); setMobileView('detail'); openDialog(e.date); }}
            />
          )}
        </div>

        {/* Detail */}
        {selected && (
          <div className={mobileView === 'list' ? 'lo-journal-detail' : undefined}>
            {/* Mobile back button */}
            <button
              className="lo-journal-back"
              onClick={() => setMobileView('list')}
              style={{
                display: 'none',
                alignItems: 'center', gap: 6,
                marginBottom: 12,
                background: 'transparent', border: 'none',
                color: 'var(--lo-accent)', fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit', padding: 0,
              }}
            >
              ← Wróć do listy
            </button>
            <EntryDetail
              e={selected}
              onEdit={openSelected}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </>
  );
}
