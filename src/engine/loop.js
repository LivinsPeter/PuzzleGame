export function createLoop(onFrame, scheduler = { request: requestAnimationFrame, cancel: cancelAnimationFrame }) {
  let frame = null;
  let previous = null;
  function tick(now) {
    const dt = previous === null ? 0 : Math.min(50, now - previous);
    previous = now;
    onFrame(dt);
    frame = scheduler.request(tick);
  }
  return {
    start() { if (frame === null) frame = scheduler.request(tick); },
    stop() { if (frame !== null) scheduler.cancel(frame); frame = null; previous = null; },
    isRunning() { return frame !== null; }
  };
}
