'use client';

import { useEffect, useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { logWeight, updateWeightLog, deleteWeightLog } from '@/app/(shell)/weight/actions';
import type { WeightEntry } from '@/types/lifeos';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editEntry?: WeightEntry | null;
  onDeleted?: (id: string) => void;
  onAdded?: (entry: WeightEntry) => void;
  onUpdated?: (entry: WeightEntry) => void;
}

export function LogWeightDialog({ open, onOpenChange, editEntry, onDeleted, onAdded, onUpdated }: Props) {
  const [value, setValue] = useState('');
  const [pending, start] = useTransition();
  const [deleting, startDelete] = useTransition();

  useEffect(() => {
    if (editEntry) {
      setValue(String(editEntry.w));
    } else {
      setValue('');
    }
  }, [editEntry, open]);

  const save = () => {
    const w = parseFloat(value.replace(',', '.'));
    if (isNaN(w)) return;
    start(async () => {
      if (editEntry) {
        await updateWeightLog(editEntry.id, w);
        onUpdated?.({ ...editEntry, w });
      } else {
        const entry = await logWeight(w);
        onAdded?.(entry);
      }
      setValue('');
      onOpenChange(false);
    });
  };

  const handleDelete = () => {
    if (!editEntry) return;
    startDelete(async () => {
      await deleteWeightLog(editEntry.id);
      onDeleted?.(editEntry.id);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 14, maxWidth: 320 }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: 18, fontWeight: 500 }}>
            {editEntry ? 'Edytuj pomiar' : 'Zaloguj wagę'}
          </DialogTitle>
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
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {editEntry && (
                <Button
                  variant="ghost"
                  disabled={deleting}
                  onClick={handleDelete}
                  style={{ color: 'var(--lo-danger)', paddingLeft: 0 }}
                >
                  {deleting ? '…' : 'Usuń'}
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
