import { DIRECTION_NAMES, DIRECTIONS } from '../core/constants.js';
import { createMaze, inBounds, setWall } from '../core/maze.js';
import { createRng } from './rng.js';
import { countDeadEnds, distanceMap, solveMaze } from './solver.js';

export function generateMaze(config) {
  validateSize(config.rows, config.cols);
  const maze = createMaze(config.rows, config.cols); const rng = createRng(config.seed);
  carvePassages(maze, rng); placeEntrance(maze, rng); placeTarget(maze, config.targetMode); braidMaze(maze, rng, config.braid ?? 0);
  if (!solveMaze(maze)) throw new Error('Generated maze is unsolvable');
  return maze;
}

export function carvePassages(maze, rng) {
  const start = { r:rng.nextInt(maze.rows), c:rng.nextInt(maze.cols) }; const visited = new Uint8Array(maze.cells.length); const stack = [start]; visited[start.r * maze.cols + start.c] = 1;
  while (stack.length) {
    const current = stack[stack.length - 1]; const options = rng.shuffle(DIRECTION_NAMES).map(name => ({ name, dir:DIRECTIONS[name] })).filter(({ dir }) => inBounds(maze, current.r + dir.dr, current.c + dir.dc) && !visited[(current.r + dir.dr) * maze.cols + current.c + dir.dc]);
    if (!options.length) { stack.pop(); continue; }
    const { name, dir } = options[0]; const next = { r:current.r + dir.dr, c:current.c + dir.dc };
    setWall(maze, current.r, current.c, name, false); visited[next.r * maze.cols + next.c] = 1; stack.push(next);
  }
  return maze;
}

export function placeEntrance(maze, rng) {
  const choices = [];
  for (let c = 0; c < maze.cols; c += 1) { choices.push({r:0,c,side:'UP'},{r:maze.rows-1,c,side:'DOWN'}); }
  for (let r = 1; r < maze.rows - 1; r += 1) { choices.push({r,c:0,side:'LEFT'},{r,c:maze.cols-1,side:'RIGHT'}); }
  const entrance = rng.pick(choices); maze.entrance = { ...entrance }; setWall(maze, entrance.r, entrance.c, entrance.side, false); return maze;
}

export function placeTarget(maze, mode = 'center') {
  if (mode === 'center') maze.target = { r:Math.floor(maze.rows / 2), c:Math.floor(maze.cols / 2) };
  else {
    const distances = distanceMap(maze); let best = 0;
    for (let index = 1; index < distances.length; index += 1) if (distances[index] > distances[best]) best = index;
    maze.target = { r:Math.floor(best / maze.cols), c:best % maze.cols };
  }
  if (maze.target.r === maze.entrance.r && maze.target.c === maze.entrance.c) maze.target = { r:0, c:0 };
  return maze;
}

export function braidMaze(maze, rng, fraction) {
  const ends = []; for (let r = 0; r < maze.rows; r += 1) for (let c = 0; c < maze.cols; c += 1) if (isDeadEnd(maze, r, c)) ends.push({r,c});
  const chosen = rng.shuffle(ends).slice(0, Math.floor(ends.length * Math.max(0, Math.min(1, fraction))));
  for (const pos of chosen) {
    const walls = rng.shuffle(DIRECTION_NAMES).filter(name => { const dir = DIRECTIONS[name]; return inBounds(maze, pos.r + dir.dr, pos.c + dir.dc) && (maze.cells[pos.r * maze.cols + pos.c] & dir.wall); });
    if (walls.length) setWall(maze, pos.r, pos.c, walls[0], false);
  }
  return maze;
}

function isDeadEnd(maze, r, c) { let open = 0; for (const name of DIRECTION_NAMES) { const dir = DIRECTIONS[name]; if (inBounds(maze,r+dir.dr,c+dir.dc) && !(maze.cells[r*maze.cols+c] & dir.wall)) open += 1; } return open === 1; }
function validateSize(rows, cols) { if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 4 || cols < 4 || rows > 41 || cols > 41) throw new RangeError('Maze dimensions must be between 4 and 41'); }
