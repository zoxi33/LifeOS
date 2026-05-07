'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { JournalEntry } from '@/types/lifeos';

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const sb = await createClient();
  const { data } = await sb
    .from('journal_entries')
    .select('*')
    .order('date', { ascending: false });

  return (data ?? []).map(e => ({
    id:     e.id,
    date:   e.date,
    mood:   e.mood   ?? 3,
    sleep:  e.sleep_hours ?? 0,
    weight: e.weight_kg  ?? 0,
    title:  e.title  ?? '',
    body:   e.body   ?? '',
    tags:   e.tags   ?? [],
  }));
}

export async function upsertJournalEntry(data: {
  date: string; title: string; body: string;
  mood: number | null; sleep_hours: number | null; weight_kg: number | null; tags: string[];
}): Promise<JournalEntry> {
  const sb = await createClient();
  const { data: row, error } = await sb
    .from('journal_entries')
    .upsert(data, { onConflict: 'date' })
    .select()
    .single();
  if (error || !row) throw new Error(error?.message ?? 'upsert failed');
  revalidatePath('/journal');
  return {
    id: row.id,
    date: row.date,
    mood: row.mood ?? 3,
    sleep: row.sleep_hours ?? 0,
    weight: row.weight_kg ?? 0,
    title: row.title ?? '',
    body: row.body ?? '',
    tags: row.tags ?? [],
  };
}

export async function updateJournalEntry(id: string, data: Partial<{
  title: string; body: string; mood: number;
  sleep_hours: number; weight_kg: number; tags: string[];
}>) {
  const sb = await createClient();
  await sb.from('journal_entries').update(data).eq('id', id);
  revalidatePath('/journal');
}

export async function deleteJournalEntry(id: string) {
  const sb = await createClient();
  await sb.from('journal_entries').delete().eq('id', id);
  revalidatePath('/journal');
}
