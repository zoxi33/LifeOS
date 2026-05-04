'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createJournalEntry } from '@/app/(shell)/journal/actions';

function MoodPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const labels = ['', '😞', '😕', '😐', '🙂', '😄'];
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(m => (
        <button key={m} onClick={() => onChange(m)} title={`Nastrój ${m}`} style={{
          width: 40, height: 40, borderRadius: 8,
          border: '1px solid ' + (value === m ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
          background: value === m ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
          cursor: 'pointer', fontSize: 18,
        }}>{labels[m]}</button>
      ))}
    </div>
  );
}

export function AddEntryDialog({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState(3);
  const [sleep, setSleep] = useState('');
  const [weight, setWeight] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [pending, start] = useTransition();

  const save = () => {
    start(async () => {
      const tags = tagInput.split(/[\s,]+/).map(t => t.replace(/^#/, '').trim()).filter(Boolean);
      await createJournalEntry({
        date,
        title: title.trim() || date,
        body: body.trim(),
        mood,
        sleep_hours: parseFloat(sleep) || 0,
        weight_kg: parseFloat(weight.replace(',', '.')) || 0,
        tags,
      });
      setTitle(''); setBody(''); setMood(3); setSleep(''); setWeight(''); setTagInput(''); setDate(today);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 14, maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: 18, fontWeight: 500 }}>Nowy wpis</DialogTitle>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Data</div>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Tytuł (opcjonalnie)</div>
              <Input autoFocus placeholder="Co dziś?" value={title} onChange={e => setTitle(e.target.value)}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)' }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Wpis</div>
            <textarea
              placeholder="Co się wydarzyło? Co myślisz?"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              style={{
                width: '100%', resize: 'vertical',
                background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)',
                borderRadius: 8, padding: '8px 12px',
                color: 'var(--lo-text)', fontSize: 14, lineHeight: 1.6,
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 8 }}>Nastrój</div>
            <MoodPicker value={mood} onChange={setMood} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Sen (h)</div>
              <Input placeholder="np. 7.5" value={sleep} onChange={e => setSleep(e.target.value)}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Waga (kg)</div>
              <Input placeholder="np. 80.1" value={weight} onChange={e => setWeight(e.target.value)}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)' }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Tagi (oddziel spacją lub przecinkiem)</div>
            <Input placeholder="trening sen produktywność" value={tagInput} onChange={e => setTagInput(e.target.value)}
              style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)' }} />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => onOpenChange(false)} style={{ color: 'var(--lo-text-muted)' }}>Anuluj</Button>
            <Button disabled={pending} onClick={save}
              style={{ background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)', border: '1px solid var(--lo-accent-line)' }}>
              {pending ? 'Zapisywanie…' : 'Zapisz wpis'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
