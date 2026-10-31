import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimer,formatTime,getElapsedMs,startTimer,stopTimer } from '../../src/state/timer.js';
import { computeStars } from '../../src/state/stats.js';
import { createStorage } from '../../src/state/storage.js';
test('timer accumulates and formats',()=>{let timer=startTimer(createTimer(),1000);timer=stopTimer(timer,4500);assert.equal(timer.elapsedMs,3500);timer=startTimer(timer,5000);assert.equal(getElapsedMs(timer,5500),4000);assert.equal(formatTime(65300),'1:05.3');});
test('stars follow move efficiency',()=>{assert.equal(computeStars(10,10),3);assert.equal(computeStars(10,15),2);assert.equal(computeStars(10,40),1);assert.throws(()=>computeStars(0,5),RangeError);});
test('storage round trips records',()=>{const data=new Map();const storage=createStorage({getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)});storage.saveBest(1,{timeMs:100,moves:2});assert.deepEqual(storage.loadBest(1),{timeMs:100,moves:2});assert.equal(storage.loadBest(2),null);});
