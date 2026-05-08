'use client';

import { useState, useTransition, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addTransaction, updateTransaction } from '@/app/(shell)/finance/actions';
import type { Transaction } from '@/types/lifeos';

const CATEGORIES = ['Jedzenie', 'Transport', 'Rozrywka', 'Zdrowie', 'Ubrania', 'Subskrypcje', 'Dom', 'Inwestycje', 'Inne'];
type TxType = 'expense' | 'income' | 'invest';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editTx?: Transaction | null;
  onAdded?: (tx: Transaction) => void;
  onUpdated?: (tx: Transaction) => void;
}

export function AddTransactionDialog({ open, onOpenChange, editTx, onAdded, onUpdated }: Props) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayStr);
  const [category, setCategory] = useState('Inne');
  const [type, setType] = useState<TxType>('expense');
  const [pending, start] = useTransition();

  useEffect(() => {
    if (editTx) {
      setName(editTx.name);
      setAmount(String(editTx.amount));
      setDate(editTx.date);
      setCategory(editTx.cat || 'Inne');
      setType(editTx.type);
    } else {
      setName(''); setAmount(''); setDate(todayStr); setCategory('Inne'); setType('expense');
    }
  }, [editTx, open]);

  const save = () => {
    const amt = parseFloat(amount.replace(',', '.'));
    if (!name.trim() || isNaN(amt)) return;
    const payload = { name: name.trim(), amount: amt, date, category, type };
    start(async () => {
      if (editTx) {
        await updateTransaction(editTx.id, payload);
        onUpdated?.({ ...editTx, ...payload, amount: amt });
      } else {
        const tx = await addTransaction(payload);
        onAdded?.(tx);
      }
      onOpenChange(false);
    });
  };

  const typeOpts: { v: TxType; l: string }[] = [
    { v: 'expense', l: 'Wydatek' },
    { v: 'income',  l: 'Przychód' },
    { v: 'invest',  l: 'Inwestycja' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 14, maxWidth: 440 }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: 18, fontWeight: 500 }}>
            {editTx ? 'Edytuj transakcję' : 'Nowa transakcja'}
          </DialogTitle>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>

          {/* Typ */}
          <div style={{ display: 'flex', gap: 6 }}>
            {typeOpts.map(t => (
              <button key={t.v} onClick={() => setType(t.v)} style={{
                flex: 1, height: 34,
                background: type === t.v ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
                color: type === t.v ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
                border: '1px solid ' + (type === t.v ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
                borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}>{t.l}</button>
            ))}
          </div>

          {/* Nazwa + kwota */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Opis</div>
              <Input autoFocus placeholder="np. Biedronka" value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && save()}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Kwota (zł)</div>
              <Input placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && save()}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)' }} />
            </div>
          </div>

          {/* Data */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Data</div>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)' }} />
          </div>

          {/* Kategoria */}
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

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => onOpenChange(false)} style={{ color: 'var(--lo-text-muted)' }}>
              Anuluj
            </Button>
            <Button disabled={!name.trim() || !amount || pending} onClick={save}
              style={{ background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)', border: '1px solid var(--lo-accent-line)' }}>
              {pending ? 'Zapisywanie…' : 'Zapisz'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
