import { formatTime } from '../state/timer.js';
import { formatLevelLabel } from './levelPicker.js';
export function formatBestLabel(bestRecord) { return bestRecord ? `${formatTime(bestRecord.timeMs)} / ${bestRecord.moves} moves` : '--'; }
export function renderStars(count) { return [0,1,2].map(index=>index<count); }
export function createScreens(rootElement,handlers) {
  const show=(content,focusSelector)=>{rootElement.replaceChildren(content);const button=content.querySelector(focusSelector);queueMicrotask(()=>button?.focus());};
  return {
    showMenu(levels,bestByLevel){const {screen,card}=dialog('Show the Way');const intro=document.createElement('p');intro.textContent='Find the target through every maze.';const list=document.createElement('div');list.className='level-list';levels.forEach((level,index)=>{const button=document.createElement('button');button.type='button';button.textContent=`${formatLevelLabel(level)} · ${formatBestLabel(bestByLevel[index])}`;button.addEventListener('click',()=>handlers.onPlay(index));list.append(button);});const help=document.createElement('p');help.className='how-to';help.textContent='Use arrow keys, WASD, swipe, or the directional pad.';card.append(intro,list,help);show(screen,'button');},
    showWin(result,hasNextLevel){const {screen,card}=dialog('You found the way');const stats=document.createElement('p');stats.textContent=`${formatTime(result.timeMs)} · ${result.moves} moves`;const stars=document.createElement('div');stars.className='stars';stars.textContent=renderStars(result.stars).map(star=>star?'★':'☆').join('');const badge=document.createElement('p');badge.textContent=result.newBest.time||result.newBest.moves?'New best!':'';card.append(stats,stars,badge);if(hasNextLevel)card.append(button('Next Level',handlers.onNext));card.append(button('Replay',handlers.onReplay),button('Menu',handlers.onMenu));screen.addEventListener('keydown',event=>{if(event.key==='Escape')handlers.onReplay();});show(screen,'button');},
    hide(){rootElement.replaceChildren();}
  };
}
function dialog(title){const screen=document.createElement('section');screen.className='screen';screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');const card=document.createElement('div');card.className='dialog';const heading=document.createElement('h1');heading.textContent=title;card.append(heading);screen.append(card);return {screen,card};}
function button(text,handler){const node=document.createElement('button');node.type='button';node.textContent=text;node.addEventListener('click',handler);return node;}
