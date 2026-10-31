import { hasWall } from '../core/maze.js';
import { cellToPixelCenter, cellToPixelOrigin } from './layout.js';

export function drawMaze(ctx, maze, layout, theme) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.lineWidth = layout.wallThickness;
  for (let r = 0; r < maze.rows; r += 1) for (let c = 0; c < maze.cols; c += 1) drawCellWalls(ctx, maze, layout, r, c);
  ctx.strokeStyle = theme.wall;
  ctx.stroke();
  const target = cellToPixelCenter(layout, maze.target.r, maze.target.c);
  ctx.fillStyle = theme.target;
  ctx.beginPath();
  ctx.arc(target.x, target.y, layout.cellSize * 0.275, 0, Math.PI * 2);
  ctx.fill();
}

function drawCellWalls(ctx, maze, layout, r, c) {
  const { x, y } = cellToPixelOrigin(layout, r, c);
  const size = layout.cellSize;
  if (hasWall(maze, r, c, 'UP')) line(ctx, x, y, x + size, y);
  if (hasWall(maze, r, c, 'LEFT')) line(ctx, x, y, x, y + size);
  if (r === maze.rows - 1 && hasWall(maze, r, c, 'DOWN')) line(ctx, x, y + size, x + size, y + size);
  if (c === maze.cols - 1 && hasWall(maze, r, c, 'RIGHT')) line(ctx, x + size, y, x + size, y + size);
}

function line(ctx, x1, y1, x2, y2) { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); }

export function createMazeCache(maze, layout, theme) {
  let valid = true;
  return { draw(ctx) { if (valid) drawMaze(ctx, maze, layout, theme); }, invalidate() { valid = false; } };
}
