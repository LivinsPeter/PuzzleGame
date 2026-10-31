export function formatLevelLabel(level) { return `${level.name} ${level.rows}x${level.cols}`; }
export function createLevelPicker(containerElement, levels, onSelect) {
  let current = 0;
  const render = () => { containerElement.replaceChildren(...levels.map((level,index) => { const button=document.createElement('button'); button.type='button'; button.textContent=formatLevelLabel(level); button.className=index===current?'current':''; button.addEventListener('click',()=>onSelect(index)); return button; })); };
  render(); return { setCurrent(index) { current=index; render(); } };
}
export function createToolbar(containerElement, levels, currentIndex, handlers) {
  const selector=document.createElement('select'); selector.className='level-select'; selector.setAttribute('aria-label','Choose level');
  selector.append(...levels.map((level,index)=>{const option=document.createElement('option');option.value=index;option.textContent=`Level: ${level.name}`;option.selected=index===currentIndex;return option;}));
  selector.addEventListener('change',()=>handlers.onLevelSelect(Number(selector.value)));
  const entries=[['New Maze','onNewMaze'],['Restart','onRestart'],['Hint (3)','onHint'],['Go back to Menu','onMenu']];
  const buttons=entries.map(([label,key]) => { const button=document.createElement('button'); button.type='button'; button.textContent=label; button.addEventListener('click',handlers[key]); return button; });
  containerElement.replaceChildren(selector,...buttons);
  const hintButton=buttons[2];
  return { setLevel(index) { selector.value=String(index); }, setHintsRemaining(count) { hintButton.textContent=`Hint (${count})`; hintButton.disabled=count===0; } };
}
