import { cellToPixelCenter } from './layout.js';

export function drawBall(ctx, layout, x, y, theme) {
  const center = cellToPixelCenter(layout, y, x);
  ctx.beginPath();
  ctx.fillStyle = theme.ball;
  ctx.shadowColor = theme.ball;
  ctx.shadowBlur = layout.cellSize * 0.15;
  ctx.arc(center.x, center.y, layout.cellSize * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}
