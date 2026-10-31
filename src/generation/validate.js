import { DIRECTION_NAMES, DIRECTIONS } from '../core/constants.js';
import { hasWall, inBounds } from '../core/maze.js';
import { distanceMap, solveMaze } from './solver.js';

export function validateMaze(maze) {
  const errors = [];
  if (maze.cells.length !== maze.rows * maze.cols) errors.push('Cell count does not match dimensions');
  for (let r = 0; r < maze.rows; r += 1) for (let c = 0; c < maze.cols; c += 1) for (const name of DIRECTION_NAMES) checkSymmetry(maze,r,c,name,errors);
  const entrance = maze.entrance; const entranceValid=inBounds(maze, entrance.r, entrance.c) && isBoundary(maze,entrance) && DIRECTIONS[entrance.side] && !hasWall(maze,entrance.r,entrance.c,entrance.side);
  if (!entranceValid) errors.push('Entrance is invalid');
  const targetValid=inBounds(maze,maze.target.r,maze.target.c) && !same(maze.target,entrance);
  if (!targetValid) errors.push('Target is invalid');
  const distances = entranceValid ? distanceMap(maze) : [];
  if (entranceValid && targetValid && !solveMaze(maze)) errors.push('Maze has no solution');
  if (distances.length && [...distances].some(value => value === -1)) errors.push('Maze is disconnected');
  return { valid:errors.length === 0, errors };
}

function checkSymmetry(maze,r,c,name,errors) { const dir=DIRECTIONS[name]; const nr=r+dir.dr,nc=c+dir.dc; if (inBounds(maze,nr,nc) && hasWall(maze,r,c,name) !== hasWall(maze,nr,nc,oppositeName(name))) errors.push(`Asymmetric wall at ${r},${c}`); }
function oppositeName(name) { return ({UP:'DOWN',RIGHT:'LEFT',DOWN:'UP',LEFT:'RIGHT'})[name]; }
function isBoundary(maze,pos) { return pos.r === 0 || pos.c === 0 || pos.r === maze.rows - 1 || pos.c === maze.cols - 1; }
function same(a,b) { return a.r === b.r && a.c === b.c; }
