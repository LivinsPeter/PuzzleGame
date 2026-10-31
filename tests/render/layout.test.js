import test from 'node:test';
import assert from 'node:assert/strict';
import { cellToPixelCenter, cellToPixelOrigin, computeLayout } from '../../src/render/layout.js';

test('computes a padded square layout', () => {
  assert.equal(computeLayout(400, 400, 5, 5, 10).cellSize, 76);
});

test('uses the limiting axis and centers a non-square maze', () => {
  const layout = computeLayout(600, 300, 5, 10, 0);
  assert.equal(layout.cellSize, 60);
  assert.equal(layout.originX, 0);
  assert.equal(layout.originY, 0);
});

test('converts cell coordinates to pixel centers and origins', () => {
  const layout = computeLayout(400, 400, 5, 5, 10);
  assert.deepEqual(cellToPixelCenter(layout, 0, 0), {
    x: layout.originX + layout.cellSize / 2,
    y: layout.originY + layout.cellSize / 2
  });
  assert.deepEqual(cellToPixelOrigin(layout, 0, 0), { x: layout.originX, y: layout.originY });
});

test('keeps wall thickness at least two pixels', () => {
  assert.equal(computeLayout(50, 50, 5, 5, 0).wallThickness, 2);
});

test('shrinks monotonically as padding grows', () => {
  const sizes = [0, 10, 20, 30].map((padding) => computeLayout(400, 400, 5, 5, padding).cellSize);
  assert.deepEqual(sizes, [80, 76, 72, 68]);
});
