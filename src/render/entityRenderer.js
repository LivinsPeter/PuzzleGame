import { cellToPixelCenter, cellToPixelOrigin } from './layout.js';

export function drawBall(ctx, layout, x, y, theme) {
  const center = cellToPixelCenter(layout, y, x);
  ctx.fillStyle = theme.ball;
  ctx.shadowColor = '#0006';
  ctx.shadowBlur = layout.cellSize * 0.15;
  ctx.beginPath();
  ctx.arc(center.x, center.y, layout.cellSize * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

export function drawEntrance(ctx, maze, layout, theme) {
  const { r, c, side } = maze.entrance;
  const point = cellToPixelOrigin(layout, r, c);
  const size = layout.cellSize;
  const offset = { UP:[size / 2, -size * .14], DOWN:[size / 2, size * 1.14], LEFT:[-size * .14, size / 2], RIGHT:[size * 1.14, size / 2] }[side];
  ctx.fillStyle = theme.path;
  ctx.beginPath();
  ctx.arc(point.x + offset[0], point.y + offset[1], Math.max(2, size * .08), 0, Math.PI * 2);
  ctx.fill();
}

export function drawTarget(ctx, layout, target, theme, timeMs) {
  const center = cellToPixelCenter(layout, target.r, target.c);
  const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const pulse = reduced ? 0 : Math.sin(timeMs / 1000 * Math.PI) * layout.cellSize * .08;
  ctx.strokeStyle = theme.target;
  ctx.lineWidth = Math.max(1.5, layout.cellSize * .04);
  ctx.beginPath();
  ctx.arc(center.x, center.y, layout.cellSize * .3 + pulse, 0, Math.PI * 2);
  ctx.stroke();
}
