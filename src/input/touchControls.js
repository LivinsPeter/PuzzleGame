export function attachDpad(rootElement, onDirection) {
  const timers = new Map();
  const clear = button => { const timer = timers.get(button); if (timer) { clearTimeout(timer.timeout); clearInterval(timer.interval); } timers.delete(button); button.classList.remove('is-pressed'); };
  const down = event => {
    const button = event.target.closest('[data-dir]'); if (!button) return;
    const direction = button.dataset.dir; button.setPointerCapture?.(event.pointerId); clear(button); button.classList.add('is-pressed'); onDirection(direction);
    const timer = { timeout:setTimeout(() => { timer.interval = setInterval(() => onDirection(direction), 110); }, 220), interval:null }; timers.set(button, timer);
  };
  const end = event => { const button = event.target.closest('[data-dir]'); if (button) clear(button); };
  for (const button of rootElement.querySelectorAll('[data-dir]')) button.setAttribute('aria-label', `Move ${button.dataset.dir.toLowerCase()}`);
  rootElement.addEventListener('pointerdown', down); ['pointerup','pointercancel','pointerleave'].forEach(type => rootElement.addEventListener(type, end));
  return () => { for (const button of [...timers.keys()]) clear(button); rootElement.removeEventListener('pointerdown', down); ['pointerup','pointercancel','pointerleave'].forEach(type => rootElement.removeEventListener(type, end)); };
}
