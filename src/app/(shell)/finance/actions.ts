'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Transaction, FinanceData, MonthSummary } from '@/types/lifeos';

const MONTH_LABELS = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

function nMonthsAgo(n: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

function currentMonthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export async function getFinanceData(): Promise<FinanceData> {
  const sb = await createClient();
  const since = nMonthsAgo(6);

  const { data: rows } = await sb
    .from('transactions')
    .select('*')
    .gte('date', since)
    .order('date', { ascending: false });

  const all = rows ?? [];

  // ── Map to Transaction ──────────────────────────────────────────────────
  const transactions: Transaction[] = all.map(t => ({
    id:     t.id,
    d:      new Date(t.date).toLocaleDateString('pl', { day: '2-digit', month: 'short' }),
    date:   t.date,
    cat:    t.category ?? '',
    name:   t.name,
    amount: t.amount ?? 0,
    type:   (t.type ?? 'expense') as Transaction['type'],
  }));

  // ── Current month summary ───────────────────────────────────────────────
  const ms = currentMonthStart();
  const now = new Date();
  const monthRows = all.filter(t => t.date >= ms);

  const totalExpenses = monthRows.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount ?? 0), 0);
  const totalIncome   = monthRows.filter(t => t.type === 'income').reduce((s, t)  => s + (t.amount ?? 0), 0);
  const totalInvest   = monthRows.filter(t => t.type === 'invest').reduce((s, t)  => s + (t.amount ?? 0), 0);
  const daysPassed    = now.getDate();
  const dailyAvg      = daysPassed > 0 ? totalExpenses / daysPassed : 0;

  const currentMonth = {
    label:         MONTH_LABELS[now.getMonth()] + ' ' + now.getFullYear(),
    yearMonth:     ms.slice(0, 7),
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalIncome:   Math.round(totalIncome  * 100) / 100,
    totalInvest:   Math.round(totalInvest  * 100) / 100,
    dailyAvg:      Math.round(dailyAvg    * 100) / 100,
    daysPassed,
  };

  // ── Monthly summaries (last 6 months) ──────────────────────────────────
  const summaryMap: Record<string, MonthSummary> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    summaryMap[ym] = { label: MONTH_LABELS[d.getMonth()], yearMonth: ym, expenses: 0, income: 0, invest: 0 };
  }

  for (const t of all) {
    const ym = t.date.slice(0, 7);
    if (!summaryMap[ym]) continue;
    const amt = t.amount ?? 0;
    if (t.type === 'expense') summaryMap[ym].expenses += amt;
    else if (t.type === 'income') summaryMap[ym].income += amt;
    else if (t.type === 'invest') summaryMap[ym].invest += amt;
  }

  const monthlySummaries = Object.values(summaryMap).map(s => ({
    ...s,
    expenses: Math.round(s.expenses),
    income:   Math.round(s.income),
    invest:   Math.round(s.invest),
  }));

  return { transactions, currentMonth, monthlySummaries };
}

export async function addTransaction(data: {
  date: string; name: string; category: string;
  amount: number; type: 'expense' | 'income' | 'invest';
}) {
  const sb = await createClient();
  const { error } = await sb.from('transactions').insert(data);
  if (error) throw new Error(error.message);
  revalidatePath('/finance');
  revalidatePath('/today');
}

export async function deleteTransaction(id: string) {
  const sb = await createClient();
  await sb.from('transactions').delete().eq('id', id);
  revalidatePath('/finance');
  revalidatePath('/today');
}
