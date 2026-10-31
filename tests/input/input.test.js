import test from 'node:test';
import assert from 'node:assert/strict';
import { keyToDirection } from '../../src/input/keyboard.js';
import { classifySwipe } from '../../src/input/swipe.js';
test('maps keyboard directions', () => { assert.equal(keyToDirection('W'),'UP'); assert.equal(keyToDirection('ArrowLeft'),'LEFT'); assert.equal(keyToDirection('q'),null); });
test('classifies swipes', () => { assert.equal(classifySwipe(30,5,24),'RIGHT'); assert.equal(classifySwipe(-30,5,24),'LEFT'); assert.equal(classifySwipe(5,40,24),'DOWN'); assert.equal(classifySwipe(5,-40,24),'UP'); assert.equal(classifySwipe(10,10,24),null); assert.equal(classifySwipe(24,24,24),'RIGHT'); });
