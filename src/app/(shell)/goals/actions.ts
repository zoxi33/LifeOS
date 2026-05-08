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

function daysSince(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
}

function isoDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function mapGoal(g: RawGoal): Goal {
  const rawType = g.goal_type ?? 'numeric';
  const goalType = (['numeric', 'text', 'abstinence'].includes(rawType) ? rawType : 'numeric') as Goal['goalType'];

  let current: number;
  let target: number;
  let pct: number;

  if (goalType === 'abstinence') {
    current = g.start_date ? daysSince(g.start_date) : 0;
    target  = g.target ?? 0;
    pct     = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  } else if (goalType === 'text') {
    current = g.current ?? 0;
    target  = 1;
    pct     = current >= 1 ? 100 : 0;
  } else {
    current = g.current ?? 0;
    target  = g.target ?? 1;
    pct     = Math.min(100, Math.round((current / target) * 100));
  }

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
}

export async function getGoals(): Promise<Goal[]> {
  const sb = await createClient();
  const { data: goals } = await sb
    .from('goals')
    .select('*, goal_milestones(*)')
    .eq('active', true)
    .order('id');

  return ((goals ?? []) as unknown as RawGoal[]).map(mapGoal);
}

export async function createGoal(data: {
  name: string; category: string; goalType: 'numeric' | 'text' | 'abstinence';
  current: number; target: number; unit: string;
  currentText: string; targetText: string;
  abstinenceBase: number; abstinenceTarget: number;
  due_date: string; note: string;
}): Promise<Goal> {
  const sb = await createClient();

  let payload: Record<string, unknown>;

  if (data.goalType === 'abstinence') {
    payload = {
      name: data.name,
      category: data.category,
      goal_type: 'abstinence',
      current: 0,
      target: data.abstinenceTarget > 0 ? data.abstinenceTarget : 0,
      unit: null,
      current_text: null,
      target_text: null,
      start_date: isoDateOffset(data.abstinenceBase),
      due_date: data.due_date || null,
      note: data.note || null,
    };
  } else if (data.goalType === 'text') {
    payload = {
      name: data.name,
      category: data.category,
      goal_type: 'text',
      current: 0,
      target: 1,
      unit: null,
      current_text: data.currentText || null,
      target_text: data.targetText || null,
      due_date: data.due_date || null,
      note: data.note || null,
    };
  } else {
    payload = {
      name: data.name,
      category: data.category,
      goal_type: 'numeric',
      current: data.current,
      target: data.target,
      unit: data.unit || null,
      current_text: null,
      target_text: null,
      due_date: data.due_date || null,
      note: data.note || null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row, error } = await sb.from('goals').insert(payload as any).select().single();
  if (error || !row) throw new Error(error?.message ?? 'insert failed');
  revalidatePath('/goals');
  return mapGoal(row as unknown as RawGoal);
}

export async function updateGoalProgress(id: string, current: number) {
  const sb = await createClient();
  await sb.from('goals').update({ current }).eq('id', id);
  revalidatePath('/goals');
}

export async function resetAbstinence(id: string) {
  const sb = await createClient();
  const today = new Date().toISOString().split('T')[0];
  await sb.from('goals').update({ start_date: today, current: 0 }).eq('id', id);
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
