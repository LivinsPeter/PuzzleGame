# Phase 1: Architecture and Base Mechanics

Goal: a static, hardcoded maze rendered crisply on a responsive canvas, with a tested rules engine that decides legal moves. No input yet.

Prerequisite: `00_overview.md` read and pasted into Codex.

---

## Setup (Both, 15 minutes, before splitting)

Create the repo skeleton exactly as in overview section 3 (empty files allowed). Create `package.json`:

```json
{
  "name": "show-the-way",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "node --test tests/",
    "serve": "python3 -m http.server 8080"
  }
}
```

---

# MEMBER A: Data Model and Rules

Folders: `src/core`, `tests/core`.

## Task A1.1: `src/core/constants.js`

Codex directive: Create `src/core/constants.js` exporting `WALL` and `DIRECTIONS` exactly as defined in overview section 4.1. Also export `DIRECTION_NAMES = ['UP','RIGHT','DOWN','LEFT']` and `ALL_WALLS = 15`. No comments.

## Task A1.2: `src/core/maze.js`

Codex directive: Implement and export the functions below. Import constants from `./constants.js`.

| Function | Input | Output | Behaviour |
|---|---|---|---|
| `createMaze(rows, cols)` | positive integers | Maze | `cells` filled with `ALL_WALLS`; `entrance = { r: 0, c: 0, side: 'UP' }`; `target = { r: rows-1, c: cols-1 }`. Throw `RangeError` if rows or cols < 2. |
| `inBounds(maze, r, c)` | ints | boolean | True when 0 <= r < rows and 0 <= c < cols. |
| `getCell(maze, r, c)` | ints | number | Bitmask. Throw `RangeError` if out of bounds. |
| `hasWall(maze, r, c, dirName)` | ints, name | boolean | Tests bit `DIRECTIONS[dirName].wall`. |
| `setWall(maze, r, c, dirName, present)` | ints, name, boolean | void | Sets or clears the bit on the cell AND the opposite bit on the neighbor if the neighbor is in bounds. Boundary walls without a neighbor only change on the cell itself. |

Edge cases: `hasWall` on an out-of-bounds cell throws `RangeError`.

## Task A1.3: `src/core/rules.js`

Codex directive: Implement and export:

| Function | Input | Output | Behaviour |
|---|---|---|---|
| `canMove(maze, pos, dirName)` | Maze, `{r,c}`, name | boolean | False if the wall in that direction exists, or the target cell is out of bounds. Exception: the entrance cell may leave the grid through its entrance `side` only if that wall is cleared; this returns FALSE anyway (the ball cannot exit through the entrance in v1). |
| `resolveMove(maze, pos, dirName)` | same | `{ pos, moved }` | Returns the new position and `moved: true` if legal, else the same `pos` object values and `moved: false`. Never mutates input. |
| `isAtTarget(maze, pos)` | Maze, pos | boolean | Equality with `maze.target`. |

## Task A1.4: `src/core/fixtures.js`

Codex directive: Export `createFixtureMaze()` returning a hand-authored 5x5 maze built with `createMaze` and `setWall`, solvable from entrance `{r:0,c:0,side:'UP'}` to target `{r:2,c:2}` (center). Carve a path of at least 8 steps containing at least 2 turns, and add at least 2 dead-end branches. Also export `FIXTURE_SOLUTION`, an array of direction names that solves it.

## Tests: `tests/core/maze.test.js` and `tests/core/rules.test.js`

Use `node:test` and `node:assert/strict`.

Required cases:

1. `createMaze(3,4)` has `cells.length === 12` and every cell equals 15.
2. `createMaze(1,5)` throws `RangeError`.
3. `setWall(maze,0,0,'RIGHT',false)` clears E on (0,0) and W on (0,1); other bits unchanged.
4. `setWall` on boundary (0,0,'UP',false) clears only (0,0) N; no throw.
5. `hasWall` throws `RangeError` for (-1,0) and (rows,0).
6. `canMove` is false into a wall, true through a carved wall, false beyond grid edges.
7. `resolveMove` returns `moved:false` and unchanged coordinates when blocked; does not mutate the input pos (assert with `Object.freeze`).
8. Walking `FIXTURE_SOLUTION` with `resolveMove` from the entrance ends at the target and every step has `moved: true`.
9. Walking every direction from every cell of the fixture never produces an out-of-bounds position (exhaustive loop).

Gate: `node --test tests/core` passes with 0 failures.

---

# MEMBER B: Canvas and Rendering

Folders: `src/render`, `styles`, `index.html`, `tests/render`.

## Task B1.1: `index.html` and `styles/main.css`

Codex directive:

- `index.html`: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, a `<main id="app">` containing `<canvas id="game-canvas">`, and `<script type="module" src="./src/main.js">`.
- CSS: `html, body { margin:0; height:100%; }`, `body` uses a CSS variable palette (`--bg`, `--wall`, `--ball`, `--target`, `--path`), flex centering, `touch-action: none` on the canvas, `user-select: none`. `#game-canvas` is `width: min(92vw, 70vh, 640px); aspect-ratio: 1;` and `display:block`. Dark mode via `prefers-color-scheme`.

## Task B1.2: `src/render/theme.js`

Codex directive: Export `readTheme()` which reads the CSS custom properties from `document.documentElement` via `getComputedStyle` and returns `{ bg, wall, ball, target, path }` strings. Export `DEFAULT_THEME` constant used as a fallback when a variable is empty.

## Task B1.3: `src/render/canvasSetup.js`

Codex directive: Export:

| Function | Input | Output | Behaviour |
|---|---|---|---|
| `setupCanvas(canvas)` | HTMLCanvasElement | `{ ctx, width, height, dpr }` | Reads the CSS size via `getBoundingClientRect`, sets `canvas.width/height` to CSS size x `devicePixelRatio` (cap dpr at 3), calls `ctx.setTransform(dpr,0,0,dpr,0,0)`. `width`/`height` returned in CSS pixels. |
| `observeResize(canvas, onResize)` | canvas, callback | `() => void` (disconnect) | Uses `ResizeObserver`, debounced with `requestAnimationFrame`; calls `onResize(setupCanvas(canvas))`. |

## Task B1.4: `src/render/layout.js` (pure, testable)

Codex directive: Export:

| Function | Input | Output |
|---|---|---|
| `computeLayout(width, height, rows, cols, padding)` | numbers | `{ cellSize, originX, originY, wallThickness }` |
| `cellToPixelCenter(layout, r, c)` | layout, ints | `{ x, y }` |
| `cellToPixelOrigin(layout, r, c)` | layout, ints | `{ x, y }` |

Rules: `cellSize = floor(min((width - 2*padding)/cols, (height - 2*padding)/rows))`; the maze is centered; `wallThickness = max(2, round(cellSize * 0.12))`. All returned coordinates are integers or `.5` values so lines render crisp (use half-pixel offsets for odd thickness).

## Task B1.5: `src/render/mazeRenderer.js`

Codex directive: Export `drawMaze(ctx, maze, layout, theme)`.

- Clear the canvas with `theme.bg`.
- Draw walls as a single batched path per frame: for each cell, stroke N and W walls if set; stroke S for the last row and E for the last column. Never double-draw shared walls.
- `ctx.lineCap = 'round'`, `ctx.lineWidth = layout.wallThickness`, `ctx.strokeStyle = theme.wall`.
- Skip drawing the wall on the entrance `side` of the entrance cell if it is cleared (the opening shows naturally because the bit is cleared).
- Draw the target cell as a filled circle at 55% of cell width in `theme.target`.

## Task B1.6: `src/render/entityRenderer.js`

Codex directive: Export `drawBall(ctx, layout, x, y, theme)` where `x`,`y` are fractional cell units; converts to pixels using `layout`, draws a filled circle of radius `cellSize * 0.3` in `theme.ball` with a subtle shadow (`shadowBlur = cellSize * 0.15`, reset after).

## Tests: `tests/render/layout.test.js`

Required cases:

1. `computeLayout(400,400,5,5,10)` returns `cellSize === 76`.
2. Non-square: `computeLayout(600,300,5,10,0)` picks the limiting axis (cellSize 30 from height? verify: min(60,60) = 60 -> assert 60) and centers `originX`/`originY` equally.
3. `cellToPixelCenter(layout,0,0)` equals origin plus `cellSize/2` on both axes.
4. `wallThickness` is never below 2 even for cellSize 10.
5. Layout shrinks monotonically as padding grows.

## Manual Visual Checklist (B signs off)

- [ ] Maze is sharp on a retina display and on a 1x display.
- [ ] Resizing the window re-renders without blur or stretching.
- [ ] 320px wide viewport: maze fully visible, no horizontal scroll.
- [ ] Dark mode swaps colors correctly.

---

# INTEGRATION (Both, after A and B merged)

## Task I1.1: `src/main.js`

Codex directive: Import `createFixtureMaze`, `setupCanvas`, `observeResize`, `computeLayout`, `readTheme`, `drawMaze`, `drawBall`. On load: create the fixture maze, set up the canvas, compute layout with padding 16, render the maze and draw the ball at the entrance cell center (`x = entrance.c`, `y = entrance.r` in cell units). On resize: recompute and redraw.

---

# EXIT CRITERIA (all must be true)

- [ ] `node --test tests/` passes (core + render).
- [ ] Opening `localhost:8080` shows the fixture maze, entrance opening, target circle and ball at the entrance.
- [ ] Resizing and rotating a phone/emulator keeps the maze centered and crisp.
- [ ] No file in `src/` contains comments.
- [ ] Contracts in overview section 4 are unchanged, or updated in `00_overview.md` and agreed by both.
