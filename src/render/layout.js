export function computeLayout(width, height, rows, cols, padding) {
  const cellSize = Math.floor(Math.min((width - 2 * padding) / cols, (height - 2 * padding) / rows));
  const mazeWidth = cellSize * cols;
  const mazeHeight = cellSize * rows;
  const originX = snapHalf((width - mazeWidth) / 2);
  const originY = snapHalf((height - mazeHeight) / 2);
  return { cellSize, originX, originY, wallThickness: Math.max(2, Math.round(cellSize * 0.12)) };
}

export function cellToPixelCenter(layout, r, c) {
  return {
    x: snapHalf(layout.originX + (c + 0.5) * layout.cellSize),
    y: snapHalf(layout.originY + (r + 0.5) * layout.cellSize)
  };
}

export function cellToPixelOrigin(layout, r, c) {
  return {
    x: snapHalf(layout.originX + c * layout.cellSize),
    y: snapHalf(layout.originY + r * layout.cellSize)
  };
}

function snapHalf(value) {
  return Math.round(value * 2) / 2;
}
