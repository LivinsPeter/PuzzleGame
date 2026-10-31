import { hasWall } from '../core/maze.js';
import { cellToPixelCenter } from './layout.js';

export function drawMaze(ctx, maze, layout, theme) {
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.lineWidth = layout.wallThickness;
  ctx.strokeStyle = theme.wall;
  const offset = layout.wallThickness % 2 ? 0.5 : 0;

  for (let r = 0; r < maze.rows; r += 1) {
    for (let c = 0; c < maze.cols; c += 1) {
      if (hasWall(maze, r, c, 'UP')) addHorizontalWall(ctx, layout, r, c, offset);
      if (hasWall(maze, r, c, 'LEFT')) addVerticalWall(ctx, layout, r, c, offset);
      if (r === maze.rows - 1 && hasWall(maze, r, c, 'DOWN')) addHorizontalWall(ctx, layout, r + 1, c, offset);
      if (c === maze.cols - 1 && hasWall(maze, r, c, 'RIGHT')) addVerticalWall(ctx, layout, r, c + 1, offset);
    }
  }

  ctx.stroke();
  const target = cellToPixelCenter(layout, maze.target.r, maze.target.c);
  ctx.beginPath();
  ctx.fillStyle = theme.target;
  ctx.arc(target.x, target.y, layout.cellSize * 0.275, 0, Math.PI * 2);
  ctx.fill();
}

function addHorizontalWall(ctx, layout, gridRow, col, offset) {
  const x = layout.originX + col * layout.cellSize + offset;
  const y = layout.originY + gridRow * layout.cellSize + offset;
  ctx.moveTo(x, y);
  ctx.lineTo(x + layout.cellSize, y);
}

function addVerticalWall(ctx, layout, row, gridCol, offset) {
  const x = layout.originX + gridCol * layout.cellSize + offset;
  const y = layout.originY + row * layout.cellSize + offset;
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + layout.cellSize);
}
