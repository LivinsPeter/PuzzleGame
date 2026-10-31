import test from 'node:test';
import assert from 'node:assert/strict';
import { canMove, isAtTarget, resolveMove } from '../../src/core/rules.js';
import { createMaze, setWall } from '../../src/core/maze.js';
import { createFixtureMaze, FIXTURE_SOLUTION } from '../../src/core/fixtures.js';
import { DIRECTION_NAMES } from '../../src/core/constants.js';

test('canMove distinguishes walls, open passages, and grid boundaries', () => {
  const maze = createMaze(3, 3);
  const pos = { r: 1, c: 1 };
  assert.equal(canMove(maze, pos, 'RIGHT'), false);
  setWall(maze, 1, 1, 'RIGHT', false);
  assert.equal(canMove(maze, pos, 'RIGHT'), true);
  assert.equal(canMove(maze, { r: 0, c: 0 }, 'UP'), false);
});

test('resolveMove leaves blocked positions unchanged and does not mutate inputs', () => {
  const maze = createMaze(3, 3);
  const pos = Object.freeze({ r: 1, c: 1 });
  assert.deepEqual(resolveMove(maze, pos, 'RIGHT'), { pos: { r: 1, c: 1 }, moved: false });
  assert.deepEqual(pos, { r: 1, c: 1 });
});

test('fixture solution reaches its target through legal moves', () => {
  const maze = createFixtureMaze();
  let pos = { r: maze.entrance.r, c: maze.entrance.c };
  for (const direction of FIXTURE_SOLUTION) {
    const result = resolveMove(maze, pos, direction);
    assert.equal(result.moved, true);
    pos = result.pos;
  }
  assert.equal(isAtTarget(maze, pos), true);
});

test('all attempted fixture moves remain in bounds', () => {
  const maze = createFixtureMaze();
  for (let r = 0; r < maze.rows; r += 1) {
    for (let c = 0; c < maze.cols; c += 1) {
      for (const direction of DIRECTION_NAMES) {
        const { pos } = resolveMove(maze, { r, c }, direction);
        assert.ok(pos.r >= 0 && pos.r < maze.rows);
        assert.ok(pos.c >= 0 && pos.c < maze.cols);
      }
    }
  }
});
