import { DIRECTIONS } from './constants.js';
import { hasWall, inBounds } from './maze.js';

export function canMove(maze, pos, dirName) {
  const direction = DIRECTIONS[dirName];
  if (!direction || hasWall(maze, pos.r, pos.c, dirName)) return false;
  return inBounds(maze, pos.r + direction.dr, pos.c + direction.dc);
}

export function resolveMove(maze, pos, dirName) {
  const direction = DIRECTIONS[dirName];
  if (!canMove(maze, pos, dirName)) return { pos: { r: pos.r, c: pos.c }, moved: false };
  return { pos: { r: pos.r + direction.dr, c: pos.c + direction.dc }, moved: true };
}

export function isAtTarget(maze, pos) {
  return pos.r === maze.target.r && pos.c === maze.target.c;
}
