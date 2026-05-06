const GLASSES_PER_LITRE = 4; // 250 ml per glass

export function litresToGlasses(l: number): number {
  return Math.round(l * GLASSES_PER_LITRE);
}

export function glassesToLitres(g: number): number {
  return +(g / GLASSES_PER_LITRE).toFixed(2);
}
