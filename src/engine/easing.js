export function clamp01(value) { return Math.min(1, Math.max(0, value)); }

export function easeOutCubic(value) { const t = clamp01(value) - 1; return t * t * t + 1; }

export function easeInOutQuad(value) {
  const t = clamp01(value);
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}
