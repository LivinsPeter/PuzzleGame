import { DIRECTION_NAMES, DIRECTIONS } from '../core/constants.js';
import { canMove } from '../core/rules.js';

export function distanceMap(maze, from = maze.entrance) {
  const distances = new Int32Array(maze.rows * maze.cols).fill(-1);
  const queue = [{ r:from.r, c:from.c }]; distances[from.r * maze.cols + from.c] = 0;
  for (let index = 0; index < queue.length; index += 1) {
    const pos = queue[index]; const distance = distances[pos.r * maze.cols + pos.c];
    for (const name of DIRECTION_NAMES) {
      if (!canMove(maze, pos, name)) continue;
      const dir = DIRECTIONS[name]; const next = { r:pos.r + dir.dr, c:pos.c + dir.dc }; const nextIndex = next.r * maze.cols + next.c;
      if (distances[nextIndex] !== -1) continue;
      distances[nextIndex] = distance + 1; queue.push(next);
    }
  }
  return distances;
}

export function solveMaze(maze, from = maze.entrance, to = maze.target) {
  const previous = new Int32Array(maze.rows * maze.cols).fill(-2); const start = from.r * maze.cols + from.c; const end = to.r * maze.cols + to.c;
  const queue = [{ r:from.r, c:from.c }]; previous[start] = -1;
  for (let index = 0; index < queue.length && previous[end] === -2; index += 1) {
    const pos = queue[index];
    for (const name of DIRECTION_NAMES) {
      if (!canMove(maze, pos, name)) continue;
      const dir = DIRECTIONS[name]; const next = { r:pos.r + dir.dr, c:pos.c + dir.dc }; const nextIndex = next.r * maze.cols + next.c;
      if (previous[nextIndex] !== -2) continue;
      previous[nextIndex] = pos.r * maze.cols + pos.c; queue.push(next);
    }
  }
  if (previous[end] === -2) return null;
  const path = []; for (let index = end; index !== -1; index = previous[index]) path.push({ r:Math.floor(index / maze.cols), c:index % maze.cols });
  return path.reverse();
}

export function countDeadEnds(maze) {
  let count = 0;
  for (let r = 0; r < maze.rows; r += 1) for (let c = 0; c < maze.cols; c += 1) {
    let walls = 0; for (const name of DIRECTION_NAMES) if (!canMove(maze, { r,c }, name)) walls += 1;
    if (walls === 3) count += 1;
  }
  return count;
}
