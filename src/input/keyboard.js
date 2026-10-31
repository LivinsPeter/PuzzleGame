export function keyToDirection(key) {
  return ({ ArrowUp:'UP', w:'UP', W:'UP', ArrowRight:'RIGHT', d:'RIGHT', D:'RIGHT', ArrowDown:'DOWN', s:'DOWN', S:'DOWN', ArrowLeft:'LEFT', a:'LEFT', A:'LEFT' })[key] || null;
}

export function attachKeyboard(target, onDirection) {
  let timeout; let interval; let active = null;
  const clear = () => { clearTimeout(timeout); clearInterval(interval); active = null; };
  const down = event => {
    const direction = keyToDirection(event.key);
    if (!direction || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault(); clear(); active = event.key; onDirection(direction);
    timeout = setTimeout(() => { interval = setInterval(() => onDirection(direction), 110); }, 220);
  };
  const up = event => { if (event.key === active) clear(); };
  target.addEventListener('keydown', down); target.addEventListener('keyup', up); target.addEventListener('blur', clear);
  return () => { clear(); target.removeEventListener('keydown', down); target.removeEventListener('keyup', up); target.removeEventListener('blur', clear); };
}
