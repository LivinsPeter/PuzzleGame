import test from 'node:test';
import assert from 'node:assert/strict';
import { cellToPixelCenter, computeLayout } from '../../src/render/layout.js';

test('computes a square layout', () => assert.equal(computeLayout(400, 400, 5, 5, 10).cellSize, 76));
test('uses the limiting axis and centers the maze', () => {
  const layout = computeLayout(600, 300, 5, 10, 0);
  assert.equal(layout.cellSize, 60);
  assert.equal(layout.originX, 0);
  assert.equal(layout.originY, 0);
});
test('converts a cell to its center', () => {
  const layout = computeLayout(400, 400, 5, 5, 10);
  assert.deepEqual(cellToPixelCenter(layout, 0, 0), { x: layout.originX + 38, y: layout.originY + 38 });
});
test('keeps walls visible and layout monotonic', () => {
  assert.ok(computeLayout(100, 100, 10, 10, 0).wallThickness >= 1.5);
  assert.ok(computeLayout(400, 400, 5, 5, 20).cellSize < computeLayout(400, 400, 5, 5, 10).cellSize);
});
