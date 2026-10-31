export function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value)) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}

export function createRng(seed) {
  let state = hashSeed(seed);
  const next = () => { state = (state + 0x6D2B79F5) >>> 0; let value = state; value = Math.imul(value ^ value >>> 15, value | 1); value ^= value + Math.imul(value ^ value >>> 7, value | 61); return ((value ^ value >>> 14) >>> 0) / 4294967296; };
  return { next, nextInt(maxExclusive) { return Math.floor(next() * maxExclusive); }, pick(array) { return array[this.nextInt(array.length)]; }, shuffle(array) { const copy = [...array]; for (let i = copy.length - 1; i > 0; i -= 1) { const j = this.nextInt(i + 1); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; } };
}
