'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Goal } from '@/types/lifeos';

export async function getGoals(): Promise<Goal[]> {
  const sb = await createClient();
  const { data: goals } = await sb
    .from('goals')
    .select('*, goal_milestones(*)')
    .eq('active', true)
    .order('id');

  return (goals ?? []).map(g => {
    const current = g.current ?? 0;
    const target  = g.target  ?? 1;
    const pct = Math.min(100, Math.round((current / target) * 100));
    return {
      id:         g.id,
      name:       g.name,
      category:   g.category ?? '',
      pct,
      current,
      target,
      unit:       g.unit ?? '',
      due:        g.due_date ?? '',
      startDate:  g.start_date ?? '',
      note:       g.note ?? '',
      milestones: ((g as { goal_milestones?: { id: string; name: string; done: boolean; due_label: string | null }[] }).goal_milestones ?? []).map(m => ({
        id:   m.id,
        name: m.name,
        done: m.done,
        date: m.due_label ?? '',
      })),
    };
  });
}

export async function createGoal(data: {
  name: string; category: string; current: number;
  target: number; unit: string; due_date: string; note: string;
}): Promise<Goal> {
  const sb = await createClient();
  const payload = { ...data, due_date: data.due_date || null };
  const { data: row, error } = await sb.from('goals').insert(payload).select('*, goal_milestones(*)').single();
  if (error || !row) throw new Error(error?.message ?? 'insert failed');
  revalidatePath('/goals');
  const current = row.current ?? 0;
  const target = row.target ?? 1;
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? '',
    pct: Math.min(100, Math.round((current / target) * 100)),
    current,
    target,
    unit: row.unit ?? '',
    due: row.due_date ?? '',
    startDate: row.start_date ?? '',
    note: row.note ?? '',
    milestones: [],
  };
}

export async function updateGoalProgress(id: string, current: number) {
  const sb = await createClient();
  await sb.from('goals').update({ current }).eq('id', id);
  revalidatePath('/goals');
}

export async function toggleMilestone(id: string, done: boolean) {
  const sb = await createClient();
  await sb.from('goal_milestones').update({ done }).eq('id', id);
  revalidatePath('/goals');
}

export async function deactivateGoal(id: string) {
  const sb = await createClient();
  await sb.from('goals').update({ active: false }).eq('id', id);
  revalidatePath('/goals');
}

export async function addMilestone(goalId: string, name: string, dueLabel?: string): Promise<{ id: string; name: string; done: boolean; date: string }> {
  const sb = await createClient();
  const { data, error } = await sb
    .from('goal_milestones')
    .insert({ goal_id: goalId, name, due_label: dueLabel ?? null })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'insert failed');
  revalidatePath('/goals');
  return { id: data.id, name: data.name, done: data.done ?? false, date: data.due_label ?? '' };
}

export async function deleteMilestone(id: string) {
  const sb = await createClient();
  await sb.from('goal_milestones').delete().eq('id', id);
  revalidatePath('/goals');
}
