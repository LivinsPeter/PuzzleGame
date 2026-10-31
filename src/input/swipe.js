export function classifySwipe(dx, dy, minDistance) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < minDistance) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'RIGHT' : 'LEFT';
  return dy >= 0 ? 'DOWN' : 'UP';
}

export function attachSwipe(target, onDirection) {
  let origin = null;
  const down = event => { if (event.pointerType === 'touch' || event.pointerType === 'pen') origin = { x:event.clientX, y:event.clientY }; };
  const move = event => {
    if (!origin) return;
    const direction = classifySwipe(event.clientX - origin.x, event.clientY - origin.y, 24);
    if (!direction) return;
    onDirection(direction); origin = { x:event.clientX, y:event.clientY };
  };
  const end = () => { origin = null; };
  target.addEventListener('pointerdown', down); target.addEventListener('pointermove', move); target.addEventListener('pointerup', end); target.addEventListener('pointercancel', end);
  return () => { target.removeEventListener('pointerdown', down); target.removeEventListener('pointermove', move); target.removeEventListener('pointerup', end); target.removeEventListener('pointercancel', end); };
}
