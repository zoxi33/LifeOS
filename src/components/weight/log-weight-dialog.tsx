'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { logWeight } from '@/app/(shell)/weight/actions';

export function LogWeightDialog({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [value, setValue] = useState('');
  const [pending, start] = useTransition();

  const save = () => {
    const w = parseFloat(value.replace(',', '.'));
    if (isNaN(w)) return;
    start(async () => {
      await logWeight(w);
      setValue('');
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 14, maxWidth: 320 }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: 18, fontWeight: 500 }}>Zaloguj wagę</DialogTitle>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Waga (kg)</div>
            <Input
              autoFocus
              placeholder="np. 80.5"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              style={{
                background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)',
                color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)',
                fontSize: 20, textAlign: 'center',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => onOpenChange(false)} style={{ color: 'var(--lo-text-muted)' }}>Anuluj</Button>
            <Button
              disabled={!value || pending}
              onClick={save}
              style={{ background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)', border: '1px solid var(--lo-accent-line)' }}
            >
              {pending ? 'Zapisywanie…' : 'Zapisz'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
