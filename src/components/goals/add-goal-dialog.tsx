'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createGoal } from '@/app/(shell)/goals/actions';

const CATEGORIES = ['Zdrowie', 'Finanse', 'Nauka', 'Sport', 'Relacje', 'Inne'];

export function AddGoalDialog({ open, onOpenChange, onAdded }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdded?: (goal: Awaited<ReturnType<typeof createGoal>>) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Inne');
  const [current, setCurrent] = useState('0');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const cur = parseFloat(current) || 0;
    const tgt = parseFloat(target.replace(',', '.'));
    if (!name.trim() || isNaN(tgt)) return;
    setError(null);
    start(async () => {
      try {
        const goal = await createGoal({ name: name.trim(), category, current: cur, target: tgt, unit, due_date: dueDate, note });
        onAdded?.(goal);
        setName(''); setCategory('Inne'); setCurrent('0'); setTarget('');
        setUnit(''); setDueDate(''); setNote('');
        onOpenChange(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Nieznany błąd');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 14, maxWidth: 480 }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: 18, fontWeight: 500 }}>Nowy cel</DialogTitle>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>

          <div>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Nazwa celu</div>
            <Input autoFocus placeholder="np. Schudnąć do 79 kg" value={name}
              onChange={e => setName(e.target.value)}
              style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)' }} />
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 8 }}>Kategoria</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{
                  height: 28, padding: '0 12px',
                  background: category === c ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
                  color: category === c ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
                  border: '1px solid ' + (category === c ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
                  borderRadius: 999, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                }}>{c}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Wartość obecna</div>
              <Input value={current} onChange={e => setCurrent(e.target.value)}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Cel docelowy</div>
              <Input placeholder="np. 79" value={target} onChange={e => setTarget(e.target.value)}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Jednostka</div>
              <Input placeholder="kg" value={unit} onChange={e => setUnit(e.target.value)}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Termin (opcjonalnie)</div>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Notatka (opcjonalnie)</div>
              <Input placeholder="Dlaczego ten cel?" value={note} onChange={e => setNote(e.target.value)}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)' }} />
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--lo-danger)', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 8, padding: '8px 12px' }}>
              Błąd: {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => onOpenChange(false)} style={{ color: 'var(--lo-text-muted)' }}>Anuluj</Button>
            <Button disabled={!name.trim() || !target || pending} onClick={save}
              style={{ background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)', border: '1px solid var(--lo-accent-line)' }}>
              {pending ? 'Zapisywanie…' : 'Dodaj cel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
