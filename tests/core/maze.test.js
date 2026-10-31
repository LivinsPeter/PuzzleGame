import test from 'node:test';
import assert from 'node:assert/strict';
import { createMaze, getCell, hasWall, setWall } from '../../src/core/maze.js';
import { WALL } from '../../src/core/constants.js';

test('createMaze initializes every cell with all walls', () => {
  const maze = createMaze(3, 4);
  assert.equal(maze.cells.length, 12);
  assert.deepEqual([...maze.cells], Array(12).fill(15));
});

test('createMaze rejects dimensions below two', () => {
  assert.throws(() => createMaze(1, 5), RangeError);
});

test('setWall updates both sides of a shared wall and preserves other bits', () => {
  const maze = createMaze(2, 2);
  setWall(maze, 0, 0, 'RIGHT', false);
  assert.equal(getCell(maze, 0, 0), 13);
  assert.equal(getCell(maze, 0, 1), 7);
  assert.equal(hasWall(maze, 0, 0, 'RIGHT'), false);
  assert.equal(hasWall(maze, 0, 1, 'LEFT'), false);
  assert.equal(WALL.N, 1);
});

test('setWall clears a boundary wall without changing another cell', () => {
  const maze = createMaze(2, 2);
  setWall(maze, 0, 0, 'UP', false);
  assert.equal(getCell(maze, 0, 0), 14);
  assert.equal(getCell(maze, 0, 1), 15);
});

test('hasWall throws for out-of-bounds cells', () => {
  const maze = createMaze(3, 4);
  assert.throws(() => hasWall(maze, -1, 0, 'UP'), RangeError);
  assert.throws(() => hasWall(maze, maze.rows, 0, 'UP'), RangeError);
});
