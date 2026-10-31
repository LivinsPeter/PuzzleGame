export const LEVELS = [
  { id:1, name:'Warm Up', rows:7, cols:7, targetMode:'center', braid:0 },
  { id:2, name:'Wander', rows:11, cols:11, targetMode:'center', braid:0 },
  { id:3, name:'Detour', rows:15, cols:15, targetMode:'farthest', braid:.1 },
  { id:4, name:'Labyrinth', rows:21, cols:21, targetMode:'farthest', braid:.15 },
  { id:5, name:'Expert', rows:31, cols:31, targetMode:'farthest', braid:.2 }
];

export function getLevelConfig(index, seedOverride, dateString = new Date().toISOString().slice(0,10)) {
  const safeIndex = Math.max(0, Math.min(LEVELS.length - 1, Number.isInteger(index) ? index : 0));
  const level = LEVELS[safeIndex];
  return { ...level, seed: seedOverride ?? `${level.id}-${dateString}` };
}
