'use server';

import { createClient } from '@/lib/supabase/server';
import { daysAgo } from '@/lib/supabase/queries';

export interface TodayStats {
  weightCurrent: number | null;
  weightDelta: number | null;
  weightSeries: number[];
  sleepAvg: number | null;
  sleepSeries: number[];
  moodAvg: number | null;
  moodSeries: number[];
}

export interface TodayFinance {
  totalSpent: number;
  monthLabel: string;
  categories: { name: string; amount: number; pct: number }[];
}

export async function getTodayStats(): Promise<TodayStats> {
  const sb = await createClient();
  const since14 = daysAgo(14);
  const since30 = daysAgo(30);

  const [{ data: wRecent }, { data: wOld }, { data: sLogs }, { data: jEntries }] = await Promise.all([
    sb.from('weight_logs').select('weight_kg').gte('measured_at', since14).order('measured_at'),
    sb.from('weight_logs').select('weight_kg').lt('measured_at', since14).gte('measured_at', since30).order('measured_at').limit(1),
    sb.from('sleep_logs').select('hours').gte('date', since14).order('date'),
    sb.from('journal_entries').select('mood').gte('date', since14).order('date'),
  ]);

  const wData = (wRecent ?? []).map(w => w.weight_kg).filter((v): v is number => v !== null);
  const weightCurrent = wData.length ? wData[wData.length - 1] : null;
  const weightOld = wOld?.[0]?.weight_kg ?? null;
  const weightDelta = weightCurrent != null && weightOld != null
    ? +(weightCurrent - weightOld).toFixed(1)
    : null;

  const sData = (sLogs ?? []).map(s => s.hours).filter((v): v is number => v !== null);
  const sleepAvg = sData.length
    ? +(sData.reduce((a, b) => a + b, 0) / sData.length).toFixed(1)
    : null;

  const mData = (jEntries ?? []).map(j => j.mood).filter((v): v is number => v !== null);
  const moodAvg = mData.length
    ? +(mData.reduce((a, b) => a + b, 0) / mData.length).toFixed(1)
    : null;

  return { weightCurrent, weightDelta, weightSeries: wData, sleepAvg, sleepSeries: sData, moodAvg, moodSeries: mData };
}

export async function getTodayFinance(): Promise<TodayFinance> {
  const sb = await createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  const ms = monthStart.toISOString().slice(0, 10);

  const { data: txs } = await sb
    .from('transactions')
    .select('amount, category, type')
    .gte('date', ms)
    .eq('type', 'expense');

  const month = new Date().toLocaleString('pl', { month: 'long', year: 'numeric' });
  if (!txs?.length) return { totalSpent: 0, monthLabel: month, categories: [] };

  const totalSpent = txs.reduce((s, t) => s + (t.amount ?? 0), 0);
  const byCat: Record<string, number> = {};
  txs.forEach(t => {
    const cat = t.category ?? 'Inne';
    byCat[cat] = (byCat[cat] ?? 0) + (t.amount ?? 0);
  });

  const categories = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, amount]) => ({
      name,
      amount: Math.round(amount),
      pct: Math.round((amount / totalSpent) * 100),
    }));

  return { totalSpent: Math.round(totalSpent), monthLabel: month, categories };
}
