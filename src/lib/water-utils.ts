/** Format ml as "1.25 L" or "750 ml" */
export function fmtWater(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `${ml} ml`;
}

/** Format ml as short label e.g. "1.2 L" */
export function fmtWaterShort(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(1)} L`;
  return `${ml} ml`;
}
