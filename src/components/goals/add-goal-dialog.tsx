'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createGoal } from '@/app/(shell)/goals/actions';

const CATEGORIES = ['Zdrowie', 'Finanse', 'Nauka', 'Sport', 'Relacje', 'Biznes', 'Inne'];

type GoalType = 'numeric' | 'text' | 'abstinence';

export function AddGoalDialog({ open, onOpenChange, onAdded }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdded?: (goal: Awaited<ReturnType<typeof createGoal>>) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Inne');
  const [goalType, setGoalType] = useState<GoalType>('numeric');

  // numeric
  const [current, setCurrent] = useState('0');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');

  // text
  const [currentText, setCurrentText] = useState('');
  const [targetText, setTargetText] = useState('');

  // abstinence
  const [abstinenceBase, setAbstinenceBase] = useState('0');
  const [abstinenceTarget, setAbstinenceTarget] = useState('');

  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isValid = name.trim() && (
    goalType === 'abstinence' ? true :
    goalType === 'text' ? targetText.trim() :
    !isNaN(parseFloat(target.replace(',', '.')))
  );

  const reset = () => {
    setName(''); setCategory('Inne'); setGoalType('numeric');
    setCurrent('0'); setTarget(''); setUnit('');
    setCurrentText(''); setTargetText('');
    setAbstinenceBase('0'); setAbstinenceTarget('');
    setDueDate(''); setNote(''); setError(null);
  };

  const save = () => {
    if (!isValid) return;
    setError(null);
    start(async () => {
      try {
        const goal = await createGoal({
          name: name.trim(),
          category,
          goalType,
          current: parseFloat(current) || 0,
          target: parseFloat(target.replace(',', '.')) || 1,
          unit,
          currentText: currentText.trim(),
          targetText: targetText.trim(),
          abstinenceBase: parseInt(abstinenceBase) || 0,
          abstinenceTarget: parseInt(abstinenceTarget) || 0,
          due_date: dueDate,
          note,
        });
        onAdded?.(goal);
        reset();
        onOpenChange(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Nieznany błąd');
      }
    });
  };

  const chip = (active: boolean) => ({
    height: 28, padding: '0 12px',
    background: active ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
    color: active ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
    border: '1px solid ' + (active ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
    borderRadius: 999, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
  } as React.CSSProperties);

  const label = (text: string) => (
    <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>{text}</div>
  );

  const field = (style?: React.CSSProperties) => ({
    background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)',
    ...style,
  } as React.CSSProperties);

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 14, maxWidth: 500 }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: 18, fontWeight: 500 }}>Nowy cel</DialogTitle>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>

          {/* Typ */}
          <div>
            {label('Typ celu')}
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={chip(goalType === 'numeric')} onClick={() => setGoalType('numeric')}>Numeryczny</button>
              <button style={chip(goalType === 'text')} onClick={() => setGoalType('text')}>Tekstowy</button>
              <button style={chip(goalType === 'abstinence')} onClick={() => setGoalType('abstinence')}>Abstynencja</button>
            </div>
          </div>

          {/* Nazwa */}
          <div>
            {label('Nazwa celu')}
            <Input autoFocus
              placeholder={goalType === 'abstinence' ? 'np. Niepalenie, Bez alkoholu' : goalType === 'text' ? 'np. Założyć sp. z o.o.' : 'np. Schudnąć do 79 kg'}
              value={name} onChange={e => setName(e.target.value)}
              style={field()} />
          </div>

          {/* Kategoria */}
          <div>
            {label('Kategoria')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={chip(category === c)}>{c}</button>
              ))}
            </div>
          </div>

          {/* Pola zależne od typu */}
          {goalType === 'numeric' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 8 }}>
              <div>
                {label('Wartość obecna')}
                <Input value={current} onChange={e => setCurrent(e.target.value)}
                  style={field({ fontFamily: 'var(--font-geist-mono)' })} />
              </div>
              <div>
                {label('Cel docelowy')}
                <Input placeholder="np. 79" value={target} onChange={e => setTarget(e.target.value)}
                  style={field({ fontFamily: 'var(--font-geist-mono)' })} />
              </div>
              <div>
                {label('Jednostka')}
                <Input placeholder="kg" value={unit} onChange={e => setUnit(e.target.value)} style={field()} />
              </div>
            </div>
          )}

          {goalType === 'text' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                {label('Stan obecny')}
                <Input placeholder="np. brak" value={currentText} onChange={e => setCurrentText(e.target.value)} style={field()} />
              </div>
              <div>
                {label('Stan docelowy')}
                <Input placeholder="np. sp. z o.o." value={targetText} onChange={e => setTargetText(e.target.value)} style={field()} />
              </div>
            </div>
          )}

          {goalType === 'abstinence' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                {label('Bazowa wartość (dni)')}
                <Input
                  placeholder="0"
                  value={abstinenceBase}
                  onChange={e => setAbstinenceBase(e.target.value)}
                  style={field({ fontFamily: 'var(--font-geist-mono)' })} />
                <div style={{ fontSize: 11, color: 'var(--lo-text-faint)', marginTop: 4 }}>
                  Ile dni masz już za sobą?
                </div>
              </div>
              <div>
                {label('Cel (dni, opcjonalnie)')}
                <Input
                  placeholder="np. 30, 90, 365"
                  value={abstinenceTarget}
                  onChange={e => setAbstinenceTarget(e.target.value)}
                  style={field({ fontFamily: 'var(--font-geist-mono)' })} />
                <div style={{ fontSize: 11, color: 'var(--lo-text-faint)', marginTop: 4 }}>
                  Pozostaw puste jeśli bez limitu
                </div>
              </div>
            </div>
          )}

          {/* Termin + notatka */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              {label('Termin (opcjonalnie)')}
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                style={field({ fontFamily: 'var(--font-geist-mono)' })} />
            </div>
            <div>
              {label('Notatka (opcjonalnie)')}
              <Input placeholder="Dlaczego ten cel?" value={note} onChange={e => setNote(e.target.value)} style={field()} />
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--lo-danger)', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 8, padding: '8px 12px' }}>
              Błąd: {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => { reset(); onOpenChange(false); }} style={{ color: 'var(--lo-text-muted)' }}>Anuluj</Button>
            <Button disabled={!isValid || pending} onClick={save}
              style={{ background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)', border: '1px solid var(--lo-accent-line)' }}>
              {pending ? 'Zapisywanie…' : 'Dodaj cel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
