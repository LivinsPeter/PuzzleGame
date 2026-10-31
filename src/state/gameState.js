import { isAtTarget } from '../core/rules.js';
import { generateMaze } from '../generation/generator.js';
import { getLevelConfig, LEVELS } from '../generation/levels.js';
import { solveMaze } from '../generation/solver.js';
import { computeStars, isNewBest, mergeBest } from './stats.js';
import { createTimer, resetTimer, startTimer, stopTimer } from './timer.js';

export function createGame(levelIndex = 0, seed = undefined) {
  const config=getLevelConfig(levelIndex,seed);const maze=generateMaze(config);const optimalMoves=solveMaze(maze).length-1;
  return { phase:'menu',levelIndex:clamp(levelIndex),seed:String(config.seed),maze,optimalMoves,moves:0,timer:createTimer(),result:null };
}
export function beginPlay(state) { return { ...state,phase:'playing',moves:0,timer:resetTimer(),result:null }; }
export function registerStep(state,nowMs) { return state.phase==='playing'?{...state,moves:state.moves+1,timer:startTimer(state.timer,nowMs)}:state; }
export function checkWin(state,pos,nowMs,storage) {
  if(state.phase!=='playing'||!isAtTarget(state.maze,pos))return state;
  const timer=stopTimer(state.timer,nowMs);const record={timeMs:timer.elapsedMs,moves:state.moves};const previous=storage.loadBest(state.levelIndex);const newBest=isNewBest(previous,record);storage.saveBest(state.levelIndex,mergeBest(previous,record));
  return {...state,phase:'won',timer,result:{...record,stars:computeStars(state.optimalMoves,state.moves),newBest}};
}
export function restartLevel(state) { return {...state,phase:'playing',moves:0,timer:resetTimer(),result:null}; }
export function nextLevel(state, play = false) { const index=clamp(state.levelIndex+1);const next=createGame(index,`${state.seed}-${index}`);return play?beginPlay(next):next; }
export function returnToMenu(state) { return {...state,phase:'menu'}; }
function clamp(index){return Math.max(0,Math.min(LEVELS.length-1,index));}
