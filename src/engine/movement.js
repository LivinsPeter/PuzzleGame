import { resolveMove } from '../core/rules.js';
import { easeOutCubic } from './easing.js';

export function createMovement(startPos, options = {}) {
  const pos = { r: startPos.r, c: startPos.c };
  return { pos, from: { ...pos }, to: { ...pos }, progress: 0, durationMs: options.durationMs ?? 120, moving: false, pending: null, lastEvent: 'none' };
}

export function requestMove(state, maze, dirName) {
  if (state.moving) return { ...state, pending: dirName, lastEvent: 'none' };
  const result = resolveMove(maze, state.pos, dirName);
  if (!result.moved) return { ...state, lastEvent: 'blocked' };
  return { ...state, from: { ...state.pos }, to: result.pos, progress: 0, moving: true, lastEvent: 'step' };
}

export function updateMovement(state, maze, dtMs) {
  if (!state.moving) return state;
  const progress = state.progress + dtMs / state.durationMs;
  if (progress < 1) return { ...state, progress };
  const arrived = { ...state, pos: { ...state.to }, progress: 1, moving: false, lastEvent: 'arrived' };
  if (!arrived.pending) return arrived;
  return requestMove({ ...arrived, pending: null }, maze, arrived.pending);
}

export function getVisualPosition(state) {
  if (!state.moving) return { x: state.pos.c, y: state.pos.r };
  const t = easeOutCubic(state.progress);
  return { x: state.from.c + (state.to.c - state.from.c) * t, y: state.from.r + (state.to.r - state.from.r) * t };
}

export function consumeEvent(state) { return { state: { ...state, lastEvent: 'none' }, event: state.lastEvent }; }
