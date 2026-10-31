export function formatLevelLabel(level) { return `${level.name} ${level.rows}x${level.cols}`; }
export function createLevelPicker(containerElement, levels, onSelect) {
  let current = 0;
  const render = () => { containerElement.replaceChildren(...levels.map((level,index) => { const button=document.createElement('button'); button.type='button'; button.textContent=formatLevelLabel(level); button.className=index===current?'current':''; button.addEventListener('click',()=>onSelect(index)); return button; })); };
  render(); return { setCurrent(index) { current=index; render(); } };
}
export function createToolbar(containerElement, handlers) {
  const entries=[['New Maze','onNewMaze'],['Restart','onRestart'],['Hint','onToggleHint']];
  containerElement.replaceChildren(...entries.map(([label,key]) => { const button=document.createElement('button'); button.type='button'; button.textContent=label; button.addEventListener('click',handlers[key]); return button; }));
}
