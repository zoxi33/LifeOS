'use client';

import { useState } from 'react';
import { Icon } from '@/components/primitives/icon';
import { StreakTrackerCard } from './streak-tracker-card';
import { addStreakTracker } from '@/app/(shell)/streaks/actions';
import type { StreakTracker } from '@/app/(shell)/streaks/actions';

export function StreaksSection({ initialTrackers }: { initialTrackers: StreakTracker[] }) {
  const [trackers, setTrackers] = useState(initialTrackers);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [baseDays, setBaseDays] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    setError(null);
    try {
      const created = await addStreakTracker(name, parseInt(baseDays) || 0);
      setTrackers(prev => [...prev, created]);
      setNewName('');
      setBaseDays('0');
      setAdding(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nieznany błąd');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleted = (id: string) => {
    setTrackers(prev => prev.filter(t => t.id !== id));
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
          onClick={() => { setAdding(v => !v); setError(null); }}
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
          display: 'flex', flexDirection: 'column', gap: 10,
          padding: '12px 14px',
          background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
          borderRadius: 10,
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--lo-text-muted)' }}>
                Ile dni masz już za sobą?
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  min="0"
                  value={baseDays}
                  onChange={e => setBaseDays(e.target.value)}
                  style={{
                    width: 80, height: 32, padding: '0 10px',
                    background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)',
                    borderRadius: 7, color: 'var(--lo-text)',
                    fontFamily: 'var(--font-geist-mono)', fontSize: 13,
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>dni</span>
              </div>
            </div>

            <button
              disabled={saving || !newName.trim()}
              onClick={handleAdd}
              style={{
                height: 32, padding: '0 16px', alignSelf: 'flex-end',
                background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
                border: '1px solid var(--lo-accent-line)', borderRadius: 7,
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                opacity: (!newName.trim() || saving) ? 0.5 : 1,
              }}
            >{saving ? '…' : 'Dodaj'}</button>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--lo-danger)', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 7, padding: '6px 10px' }}>
              {error}
            </div>
          )}
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
            <StreakTrackerCard key={t.id} tracker={t} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
