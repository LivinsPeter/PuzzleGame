import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTrailStep } from '../../src/render/trailRenderer.js';
test('trail appends, skips duplicates, and backtracks',()=>{let trail=applyTrailStep([],{r:0,c:0});trail=applyTrailStep(trail,{r:0,c:0});assert.equal(trail.length,1);trail=applyTrailStep(trail,{r:0,c:1});assert.equal(trail.length,2);trail=applyTrailStep(trail,{r:0,c:0});assert.equal(trail.length,1);});
