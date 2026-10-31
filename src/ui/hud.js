export function createHud(containerElement) {
  const fields={level:'Level',time:'Time',moves:'Moves'};const nodes={};
  for(const [key,label] of Object.entries(fields)){const node=document.createElement('span');node.className='hud-item';node.textContent=`${label}: --`;node.setAttribute('aria-live',key==='moves'?'polite':'off');containerElement.append(node);nodes[key]=node;}
  const set=(key,value)=>{const text=`${fields[key]}: ${value}`;if(nodes[key].textContent!==text)nodes[key].textContent=text;};
  return {setTime:value=>set('time',value),setMoves:value=>set('moves',value),setLevel:value=>set('level',value)};
}
