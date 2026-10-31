export function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 3);
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height, dpr };
}

export function observeResize(canvas, onResize) {
  if (!globalThis.ResizeObserver) {
    const resize = () => onResize(setupCanvas(canvas));
    globalThis.addEventListener('resize', resize);
    return () => globalThis.removeEventListener('resize', resize);
  }
  let frame = 0;
  const request = globalThis.requestAnimationFrame?.bind(globalThis) ?? (callback => setTimeout(callback, 16));
  const cancel = globalThis.cancelAnimationFrame?.bind(globalThis) ?? clearTimeout;
  const observer = new ResizeObserver(() => {
    cancel(frame);
    frame = request(() => onResize(setupCanvas(canvas)));
  });
  observer.observe(canvas);
  return () => { cancel(frame); observer.disconnect(); };
}
