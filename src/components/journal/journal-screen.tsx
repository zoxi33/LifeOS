'use client';

'use client';

import { useState, useTransition } from 'react';
import { Icon } from '@/components/primitives/icon';
import { AddEntryDialog } from './add-entry-dialog';
import { EditEntryDialog } from './edit-entry-dialog';
import { deleteJournalEntry } from '@/app/(shell)/journal/actions';
import type { JournalEntry } from '@/types/lifeos';

function moodDotColor(m: number): string {
  const colors: Record<number, string> = {
    1: 'var(--lo-danger)',
    2: 'var(--lo-warn)',
    3: 'var(--lo-text-faint)',
    4: 'var(--lo-accent)',
    5: 'var(--lo-accent)',
  };
  return colors[m] ?? 'var(--lo-text-faint)';
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

function EntryList({ entries, selected, onSelect }: {
  entries: JournalEntry[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      {entries.map((j, i) => (
        <button
          key={j.id}
          onClick={() => onSelect(i)}
          style={{
            width: '100%', textAlign: 'left',
            padding: '14px 16px',
            background: selected === i ? 'var(--lo-surface-2)' : 'transparent',
            border: 'none',
            borderBottom: i < entries.length - 1 ? '1px solid var(--lo-border)' : 'none',
            borderLeft: '2px solid ' + (selected === i ? 'var(--lo-accent)' : 'transparent'),
            color: 'var(--lo-text)', fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)' }}>
              {j.date}
            </span>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: moodDotColor(j.mood), display: 'inline-block' }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 450, lineHeight: 1.4 }}>{j.title || j.date}</div>
          <div style={{ fontSize: 11, color: 'var(--lo-text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {j.body}
          </div>
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
      borderRadius: 12, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 18,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)' }}>
            {e.date}
          </div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.25 }}>
            {e.title || e.date}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
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

      <div style={{
        display: 'flex', gap: 24, flexWrap: 'wrap',
        padding: '12px 0',
        borderTop: '1px solid var(--lo-border)',
        borderBottom: '1px solid var(--lo-border)',
      }}>
        {[
          { label: 'Nastrój', value: `${e.mood}/5` },
          { label: 'Sen',     value: e.sleep ? `${e.sleep} h` : '—' },
          { label: 'Waga',    value: e.weight ? `${e.weight} kg` : '—' },
        ].map(s => (
          <div key={s.label}>
            <div className="label-eyebrow" style={{ marginBottom: 4 }}>{s.label}</div>
            <div style={{
              fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 16,
            }}>{s.value}</div>
          </div>
        ))}
        {e.tags.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'flex-end', flexWrap: 'wrap' }}>
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

      <div style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--lo-text)', maxWidth: '60ch', whiteSpace: 'pre-wrap' }}>
        {e.body || <span style={{ color: 'var(--lo-text-muted)', fontStyle: 'italic' }}>Brak treści.</span>}
      </div>

      <div style={{
        marginTop: 'auto', paddingTop: 18,
        borderTop: '1px solid var(--lo-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-dim)' }}>
          {wordCount} słów · {readMin} min czytania
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>J</Kbd>
          <span style={{ fontSize: 11, color: 'var(--lo-text-faint)', marginLeft: 6 }}>nowy wpis</span>
        </div>
      </div>
    </div>
  );
}

export function JournalScreen({ initialEntries = [] }: { initialEntries?: JournalEntry[] }) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [selected, setSelected] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredEntries = search.trim()
    ? entries.filter(e => {
        const q = search.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.body.toLowerCase().includes(q) ||
          e.tags.some(t => t.toLowerCase().includes(q))
        );
      })
    : entries;

  const e = filteredEntries[selected] ?? filteredEntries[0];

  const handleEditSaved = (updated: JournalEntry) => {
    setEntries(prev => prev.map((x, i) => i === selected ? updated : x));
  };

  const handleDelete = () => {
    const remaining = entries.filter((_, i) => i !== selected);
    setEntries(remaining);
    setSelected(Math.min(selected, Math.max(0, remaining.length - 1)));
  };

  if (!e) return (
    <>
      <AddEntryDialog open={addOpen} onOpenChange={setAddOpen} />
      <div className="lo-screen" style={{ padding: '20px 24px 40px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="label-eyebrow">Dziennik</div>
          <button onClick={() => setAddOpen(true)} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32,
            background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
            border: '1px solid var(--lo-accent-line)', borderRadius: 8, cursor: 'pointer',
          }}>+</button>
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--lo-text-muted)' }}>Brak wpisów — napisz pierwszy.</div>
      </div>
    </>
  );

  return (
    <>
      <AddEntryDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditEntryDialog
        entry={e}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={handleEditSaved}
      />
      <div className="lo-grid-sidebar lo-screen" style={{
        padding: '20px 24px 40px',
        maxWidth: 1280, margin: '0 auto', width: '100%',
      }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="label-eyebrow">Dziennik</div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
                {entries.length} wpisów
              </div>
            </div>
            <button onClick={() => setAddOpen(true)} style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32,
              background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
              border: '1px solid var(--lo-accent-line)', borderRadius: 8,
              cursor: 'pointer',
            }}>
              <Icon name="plus" size={14} />
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
              onChange={e => { setSearch(e.target.value); setSelected(0); }}
              style={{
                width: '100%', height: 32, paddingLeft: 30, paddingRight: 10,
                background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)',
                borderRadius: 8, color: 'var(--lo-text)', fontFamily: 'inherit', fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setSelected(0); }}
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

          {filteredEntries.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--lo-text-muted)', padding: '8px 0' }}>
              Brak wyników dla „{search}".
            </div>
          ) : (
            <EntryList entries={filteredEntries} selected={filteredEntries.indexOf(e ?? filteredEntries[0])} onSelect={i => setSelected(i)} />
          )}
        </div>

        {/* Detail */}
        <EntryDetail e={e} onEdit={() => setEditOpen(true)} onDelete={handleDelete} />
      </div>
    </>
  );
}
