import { attachKeyboard } from './input/keyboard.js';
import { attachSwipe } from './input/swipe.js';
import { attachDpad } from './input/touchControls.js';
import { createLoop } from './engine/loop.js';
import { consumeEvent, createMovement, getVisualPosition, requestMove, updateMovement } from './engine/movement.js';
import { createRng } from './generation/rng.js';
import { getLevelConfig, LEVELS } from './generation/levels.js';
import { solveMaze } from './generation/solver.js';
import { cellToPixelCenter, computeLayout } from './render/layout.js';
import { setupCanvas, observeResize } from './render/canvasSetup.js';
import { drawBall, drawEntrance, drawTarget } from './render/entityRenderer.js';
import { createShake } from './render/effects.js';
import { drawMaze } from './render/mazeRenderer.js';
import { createBurst } from './render/particles.js';
import { readTheme } from './render/theme.js';
import { createTrail, drawHintPath } from './render/trailRenderer.js';
import { beginPlay, checkWin, createGame, nextLevel, registerStep, restartLevel, returnToMenu } from './state/gameState.js';
import { createStorage } from './state/storage.js';
import { formatTime, getElapsedMs, startTimer, stopTimer } from './state/timer.js';
import { createArrivePulse } from './ui/effects.js';
import { createHud } from './ui/hud.js';
import { createScreens } from './ui/screens.js';
import { createToolbar } from './ui/levelPicker.js';

function bootstrap() {
  const canvas=document.querySelector('#game-canvas'); const seedNode=document.querySelector('#seed'); const storage=createStorage(); const settings=storage.loadSettings();
  let canvasInfo=setupCanvas(canvas); let theme=readTheme(); let layout; let state=initialGame(); let movement=createMovement(state.maze.entrance); let hint=settings.hintsEnabled; let burst=null; let lastTimerPaint=0; let needsRender=true; let hiddenTimerRunning=false;
  const trail=createTrail(); const shake=createShake(); const pulse=createArrivePulse(); const hud=createHud(document.querySelector('#hud'));
  const screens=createScreens(document.querySelector('#screens'),{onPlay:startLevel,onReplay:replay,onNext:advance,onMenu:menu,onExit:exitGame});
  const toolbar=createToolbar(document.querySelector('#toolbar'),LEVELS,state.levelIndex,{onLevelSelect:startLevel,onNewMaze:newMaze,onRestart:replay,onToggleHint:toggleHint,onMenu:menu});
  const loop=createLoop(onFrame); attachKeyboard(window,handleDirection); attachDpad(document.querySelector('#dpad'),handleDirection); attachSwipe(canvas,handleDirection); observeResize(canvas,info=>{canvasInfo=info;needsRender=true;});
  document.addEventListener('visibilitychange',()=>{const now=performance.now();if(document.hidden&&state.phase==='playing'){hiddenTimerRunning=state.timer.running;state={...state,timer:stopTimer(state.timer,now)};}if(!document.hidden&&hiddenTimerRunning){state={...state,timer:startTimer(state.timer,now)};hiddenTimerRunning=false;}});
  showMenu(); loop.start();
  function initialGame(){const params=new URLSearchParams(location.search);const level=Math.max(0,Math.min(LEVELS.length-1,(Number(params.get('level'))||1)-1));return createGame(level,params.get('seed')??undefined);}
  function configure(){layout=computeLayout(canvasInfo.width,canvasInfo.height,state.maze.rows,state.maze.cols,16);theme=readTheme();seedNode.textContent=`Seed: ${state.seed}`;hud.setLevel(getLevelConfig(state.levelIndex,state.seed).name);hud.setMoves(state.moves);hud.setTime(formatTime(0));toolbar.setLevel(state.levelIndex);needsRender=true;}
  function showMenu(){configure();screens.showMenu(LEVELS,LEVELS.map((_,index)=>storage.loadBest(index)),state.levelIndex);}
  function startLevel(index=state.levelIndex){if(index!==state.levelIndex)state=createGame(index);state=beginPlay(state);movement=createMovement(state.maze.entrance);trail.clear();screens.hide();configure();}
  function replay(){state=restartLevel(state);movement=createMovement(state.maze.entrance);trail.clear();screens.hide();configure();}
  function advance(){state=nextLevel(state,true);movement=createMovement(state.maze.entrance);trail.clear();screens.hide();configure();}
  function menu(){state=returnToMenu(state);showMenu();}
  function exitGame(){screens.showExit();}
  function newMaze(){const wasPlaying=state.phase==='playing';state=createGame(state.levelIndex,String(Date.now()));if(wasPlaying)startLevel();else showMenu();}
  function toggleHint(){hint=!hint;storage.saveSettings({hintsEnabled:hint});needsRender=true;}
  function handleDirection(direction){if(state.phase!=='playing')return;movement=requestMove(movement,state.maze,direction);processEvent(performance.now());needsRender=true;}
  function processEvent(now){const consumed=consumeEvent(movement);movement=consumed.state;if(consumed.event==='step'){state=registerStep(state,now);trail.push(movement.to);hud.setMoves(state.moves);}if(consumed.event==='blocked')shake.trigger(now);}
  function onFrame(dt){const now=performance.now();if(state.phase==='playing'){movement=updateMovement(movement,state.maze,dt);processEvent(now);const next=checkWin(state,movement.pos,now,storage);if(next!==state){state=next;handleWin(now);}if(now-lastTimerPaint>100){hud.setTime(formatTime(getElapsedMs(state.timer,now)));lastTimerPaint=now;}needsRender=true;}if(needsRender||burst&&!burst.isDone()){render(now);needsRender=state.phase==='playing'&&movement.moving;}}
  function handleWin(now){const center=cellToPixelCenter(layout,state.maze.target.r,state.maze.target.c);burst=createBurst(center.x,center.y,{rng:createRng(state.seed),canvasSize:Math.min(canvasInfo.width,canvasInfo.height),colors:[theme.target,theme.ball],reducedMotion:settings.reducedMotion});pulse.trigger(now);setTimeout(()=>screens.showWin(state.result,state.levelIndex<LEVELS.length-1),settings.reducedMotion?0:700);}
  function render(now){const ctx=canvasInfo.ctx;drawMaze(ctx,state.maze,layout,theme);drawEntrance(ctx,state.maze,layout,theme);drawTarget(ctx,layout,state.maze.target,theme,now);if(hint)drawHintPath(ctx,layout,solveMaze(state.maze),theme,.4);const visual=getVisualPosition(movement);trail.draw(ctx,layout,visual,theme);const offset=shake.getOffset(now);ctx.save();ctx.translate(offset.dx,offset.dy);drawBall(ctx,layout,visual.x,visual.y,theme);ctx.restore();burst?.update(16);burst?.draw(ctx);}
}

bootstrap();
