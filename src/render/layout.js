export function computeLayout(width, height, rows, cols, padding) {
  const cellSize = Math.floor(Math.min((width - 2 * padding) / cols, (height - 2 * padding) / rows));
  const mazeWidth = cellSize * cols;
  const mazeHeight = cellSize * rows;
  const wallThickness = Math.max(1.5, Math.min(cellSize * 0.2, Math.round(cellSize * 0.12)));
  return { cellSize, originX: (width - mazeWidth) / 2, originY: (height - mazeHeight) / 2, wallThickness };
}

export function cellToPixelCenter(layout, r, c) {
  return { x: layout.originX + (c + 0.5) * layout.cellSize, y: layout.originY + (r + 0.5) * layout.cellSize };
}

export function cellToPixelOrigin(layout, r, c) {
  return { x: layout.originX + c * layout.cellSize, y: layout.originY + r * layout.cellSize };
}
