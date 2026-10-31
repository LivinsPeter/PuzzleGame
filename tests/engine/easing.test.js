import test from 'node:test';
import assert from 'node:assert/strict';
import { easeOutCubic } from '../../src/engine/easing.js';
test('easing clamps and remains monotonic', () => { assert.equal(easeOutCubic(-1), 0); assert.equal(easeOutCubic(1), 1); for (let i = 1; i <= 100; i += 1) assert.ok(easeOutCubic(i / 100) >= easeOutCubic((i - 1) / 100)); });
