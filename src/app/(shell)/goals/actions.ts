'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Goal } from '@/types/lifeos';

type RawGoal = {
  id: string; name: string; category: string | null;
  goal_type: string | null; current: number | null; target: number | null;
  unit: string | null; current_text: string | null; target_text: string | null;
  due_date: string | null; start_date: string | null; note: string | null;
  goal_milestones?: { id: string; name: string; done: boolean; due_label: string | null }[];
};

export async function getGoals(): Promise<Goal[]> {
  const sb = await createClient();
  const { data: goals } = await sb
    .from('goals')
    .select('*, goal_milestones(*)')
    .eq('active', true)
    .order('id');

  return ((goals ?? []) as unknown as RawGoal[]).map(g => {
    const goalType = (g.goal_type === 'text' ? 'text' : 'numeric') as 'numeric' | 'text';
    const current = g.current ?? 0;
    const target  = goalType === 'text' ? 1 : (g.target ?? 1);
    const pct = Math.min(100, Math.round((current / target) * 100));
    return {
      id:          g.id,
      name:        g.name,
      category:    g.category ?? '',
      goalType,
      pct,
      current,
      target,
      unit:        g.unit ?? '',
      currentText: g.current_text ?? '',
      targetText:  g.target_text ?? '',
      due:         g.due_date ?? '',
      startDate:   g.start_date ?? '',
      note:        g.note ?? '',
      milestones: (g.goal_milestones ?? []).map(m => ({
        id:   m.id,
        name: m.name,
        done: m.done,
        date: m.due_label ?? '',
      })),
    };
  });
}

export async function createGoal(data: {
  name: string; category: string; goalType: 'numeric' | 'text';
  current: number; target: number; unit: string;
  currentText: string; targetText: string;
  due_date: string; note: string;
}): Promise<Goal> {
  const sb = await createClient();
  const isText = data.goalType === 'text';
  const payload = {
    name: data.name,
    category: data.category,
    goal_type: data.goalType,
    current: isText ? 0 : data.current,
    target: isText ? 1 : data.target,
    unit: isText ? null : (data.unit || null),
    current_text: isText ? (data.currentText || null) : null,
    target_text: isText ? (data.targetText || null) : null,
    due_date: data.due_date || null,
    note: data.note || null,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row, error } = await sb.from('goals').insert(payload as any).select().single();
  if (error || !row) throw new Error(error?.message ?? 'insert failed');
  revalidatePath('/goals');
  const r = row as unknown as RawGoal;
  const goalType = (r.goal_type === 'text' ? 'text' : 'numeric') as 'numeric' | 'text';
  const current = r.current ?? 0;
  const target = goalType === 'text' ? 1 : (r.target ?? 1);
  return {
    id: r.id,
    name: r.name,
    category: r.category ?? '',
    goalType,
    pct: Math.min(100, Math.round((current / target) * 100)),
    current,
    target,
    unit: r.unit ?? '',
    currentText: r.current_text ?? '',
    targetText: r.target_text ?? '',
    due: r.due_date ?? '',
    startDate: r.start_date ?? '',
    note: r.note ?? '',
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
