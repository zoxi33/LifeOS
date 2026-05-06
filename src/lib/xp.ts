export function xpForLevel(n: number): number { return 50 * n * (n - 1); }
export function levelFromXP(xp: number): number {
  return Math.max(1, Math.floor((1 + Math.sqrt(1 + 8 * xp / 100)) / 2));
}
