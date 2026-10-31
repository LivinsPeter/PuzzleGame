import { ALL_WALLS, DIRECTIONS } from './constants.js';

export function createMaze(rows, cols) {
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 2 || cols < 2) {
    throw new RangeError('Maze dimensions must be integers greater than one');
  }

  return {
    rows,
    cols,
    cells: new Uint8Array(rows * cols).fill(ALL_WALLS),
    entrance: { r: 0, c: 0, side: 'UP' },
    target: { r: rows - 1, c: cols - 1 }
  };
}

export function inBounds(maze, r, c) {
  return Number.isInteger(r) && Number.isInteger(c) && r >= 0 && r < maze.rows && c >= 0 && c < maze.cols;
}

export function getCell(maze, r, c) {
  if (!inBounds(maze, r, c)) throw new RangeError('Cell is outside the maze');
  return maze.cells[r * maze.cols + c];
}

export function hasWall(maze, r, c, dirName) {
  const direction = DIRECTIONS[dirName];
  if (!direction) throw new RangeError('Unknown direction');
  return (getCell(maze, r, c) & direction.wall) !== 0;
}

export function setWall(maze, r, c, dirName, present) {
  const direction = DIRECTIONS[dirName];
  if (!direction) throw new RangeError('Unknown direction');
  const index = r * maze.cols + c;
  const cell = getCell(maze, r, c);
  maze.cells[index] = present ? cell | direction.wall : cell & ~direction.wall;

  const neighborR = r + direction.dr;
  const neighborC = c + direction.dc;
  if (!inBounds(maze, neighborR, neighborC)) return;

  const neighborIndex = neighborR * maze.cols + neighborC;
  const neighbor = maze.cells[neighborIndex];
  maze.cells[neighborIndex] = present ? neighbor | direction.opposite : neighbor & ~direction.opposite;
}
