'use client';

import { useState, useTransition } from 'react';
import { Icon } from '@/components/primitives/icon';
import { StreakTrackerCard } from './streak-tracker-card';
import { addStreakTracker } from '@/app/(shell)/streaks/actions';
import type { StreakTracker } from '@/app/(shell)/streaks/actions';

export function StreaksSection({ initialTrackers }: { initialTrackers: StreakTracker[] }) {
  const [trackers, setTrackers] = useState(initialTrackers);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, startSave] = useTransition();

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    startSave(async () => {
      const created = await addStreakTracker(name);
      setTrackers(prev => [...prev, created]);
      setNewName('');
      setAdding(false);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="label-eyebrow">Streaki</div>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 3 }}>
            Śledzenie abstynencji
          </div>
        </div>
        <button
          onClick={() => setAdding(v => !v)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 30, padding: '0 12px',
            background: adding ? 'var(--lo-surface-2)' : 'var(--lo-accent-soft)',
            color: adding ? 'var(--lo-text-muted)' : 'var(--lo-accent)',
            border: '1px solid ' + (adding ? 'var(--lo-border)' : 'var(--lo-accent-line)'),
            borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Icon name={adding ? 'x' : 'plus'} size={12} />
          {adding ? 'Anuluj' : 'Nowy'}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          padding: '10px 14px',
          background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
          borderRadius: 10,
        }}>
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="np. No Fap, No Alkohol…"
            style={{
              flex: 1, height: 32, padding: '0 10px',
              background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)',
              borderRadius: 7, color: 'var(--lo-text)', fontSize: 13, fontFamily: 'inherit',
            }}
          />
          <button
            disabled={saving || !newName.trim()}
            onClick={handleAdd}
            style={{
              height: 32, padding: '0 14px',
              background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
              border: '1px solid var(--lo-accent-line)', borderRadius: 7,
              fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              opacity: (!newName.trim() || saving) ? 0.5 : 1,
            }}
          >{saving ? '…' : 'Dodaj'}</button>
        </div>
      )}

      {/* Cards grid */}
      {trackers.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--lo-text-muted)', padding: '8px 0' }}>
          Brak streaków — dodaj pierwszy.
        </div>
      ) : (
        <div className="lo-grid-2col">
          {trackers.map(t => (
            <StreakTrackerCard key={t.id} tracker={t} />
          ))}
        </div>
      )}
    </div>
  );
}
