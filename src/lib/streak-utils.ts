export const STREAK_MILESTONES = [7, 30, 100, 365] as const;

export function streakBreakPenalty(currentStreak: number): number {
  return Math.min(currentStreak * 5, 500);
}

export function nextStreakMilestone(currentStreak: number): { days: number; bonus: number } | null {
  const milestones: [number, number][] = [[7, 100], [30, 300], [100, 1000], [365, 5000]];
  const next = milestones.find(([d]) => d > currentStreak);
  if (!next) return null;
  return { days: next[0], bonus: next[1] };
}
