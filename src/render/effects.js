export function createShake() {
  let start = -Infinity;
  return { trigger(now = performance.now()) { start = now; }, getOffset(now = performance.now()) { const age = now - start; if (age < 0 || age >= 150) return { dx:0, dy:0 }; const amount = 3 * (1 - age / 150) * Math.sin(age * .2); return { dx:amount, dy:0 }; } };
}
