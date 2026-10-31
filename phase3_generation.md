# Phase 3: Maze Level and Logic Generation

Goal: replace the fixture with seeded, procedurally generated mazes that are guaranteed solvable, with a level/difficulty system and a verified solver.

Prerequisite: Phase 2 exit criteria passed on `main`.

---

## Algorithm Decisions (fixed)

- Generator: iterative randomized depth-first search (recursive backtracker) over the grid. Iterative (explicit stack) to avoid call-stack overflow on large grids. Produces a perfect maze (spanning tree): exactly one path between any two cells, so solvability is guaranteed by construction.
- Randomness: `mulberry32` seeded PRNG so the same seed always gives the same maze.
- Entrance: a random boundary cell; the outer wall on its side is cleared.
- Target: `center` mode (cell closest to the middle) or `farthest` mode (cell with the longest BFS distance from the entrance). Level config chooses.
- Optional braiding (remove a percentage of dead-end walls) for higher levels creates multiple routes, still solvable.
- Every generated maze is verified by the solver before being returned.

---

# MEMBER A: Generation, Solver, Levels

Folders: `src/generation`, `tests/generation`.

## Task A3.1: `src/generation/rng.js`

Codex directive: Export:

| Function | Input | Output |
|---|---|---|
| `createRng(seed)` | integer or string | `{ next(), nextInt(maxExclusive), pick(array), shuffle(array) }` |
| `hashSeed(value)` | string or number | unsigned 32-bit integer |

`next()` returns float in [0,1). Implement `mulberry32`; string seeds go through a simple FNV-1a hash. `shuffle` is Fisher-Yates and returns a new array (does not mutate input). Same seed always gives the identical sequence.

## Task A3.2: `src/generation/solver.js`

Codex directive: Export:

| Function | Input | Output |
|---|---|---|
| `solveMaze(maze, from?, to?)` | Maze, optional pos each (default entrance to target) | Array of `{r,c}` from start to end inclusive, or `null` |
| `distanceMap(maze, from)` | Maze, pos | `Int32Array` of length rows*cols, `-1` for unreachable |
| `countDeadEnds(maze)` | Maze | number of cells with exactly three walls |

Use breadth-first search with `canMove` from `core/rules.js`. Shortest path guaranteed. Pure function, no mutation.

## Task A3.3: `src/generation/generator.js`

Codex directive: Export `generateMaze(config)`.

Config:

```js
{
  rows: number,
  cols: number,
  seed: number | string,
  targetMode: 'center' | 'farthest',
  braid: number
}
```

Steps inside (split into small helper functions in the same file, each exported for testing):

1. `createMaze(rows, cols)`.
2. `carvePassages(maze, rng)`: iterative DFS from a random start, stack of cells, visit a shuffled list of unvisited neighbors, call `setWall(..., false)` to carve.
3. `placeEntrance(maze, rng)`: pick a random boundary cell and a side that faces outside; clear that wall; set `maze.entrance`.
4. `placeTarget(maze, mode)`: `center` -> `{ r: floor(rows/2), c: floor(cols/2) }`; `farthest` -> max value of `distanceMap` from the entrance (ties broken by first in row-major order).
5. `braidMaze(maze, rng, fraction)`: for a `fraction` (0..1) of dead-end cells, remove one interior wall leading to a neighbor that keeps the maze valid.
6. Verify with `solveMaze`; if `null` (must never happen), throw `Error('Generated maze is unsolvable')`.

Constraints: `rows` and `cols` between 4 and 41; throw `RangeError` otherwise. Generation of 41x41 must complete in under 50 ms in Node.

## Task A3.4: `src/generation/validate.js`

Codex directive: Export `validateMaze(maze)` returning `{ valid: boolean, errors: string[] }`. Checks: dimensions match `cells.length`; wall symmetry between every pair of adjacent cells; entrance is on the boundary and its `side` wall is cleared; target in bounds and not equal to entrance; a solution exists; every cell is reachable from the entrance (perfect or braided mazes are fully connected).

## Task A3.5: `src/generation/levels.js`

Codex directive: Export `LEVELS` (array of config objects) and `getLevelConfig(index, seedOverride?)`.

```js
{ id: 1, name: 'Warm Up',   rows: 7,  cols: 7,  targetMode: 'center',   braid: 0 }
{ id: 2, name: 'Wander',    rows: 11, cols: 11, targetMode: 'center',   braid: 0 }
{ id: 3, name: 'Detour',    rows: 15, cols: 15, targetMode: 'farthest', braid: 0.1 }
{ id: 4, name: 'Labyrinth', rows: 21, cols: 21, targetMode: 'farthest', braid: 0.15 }
{ id: 5, name: 'Expert',    rows: 31, cols: 31, targetMode: 'farthest', braid: 0.2 }
```

`getLevelConfig` returns a copy with `seed` filled: the override if given, else a deterministic daily seed string derived from the level id plus the current date `YYYY-MM-DD` (date injected as a parameter for testability: `getLevelConfig(index, seedOverride, dateString)`). Clamp index to the valid range.

## Tests: `tests/generation/*.test.js`

Required cases:

1. RNG: same seed gives the same 20 values; different seeds differ; `nextInt(5)` always in [0,4] over 1000 samples; `shuffle` is a permutation and does not mutate input.
2. Solver on the fixture maze returns a path whose first element is the entrance and last is the target; consecutive steps are adjacent and legal.
3. Solver returns `null` for a maze where the target is fully walled in.
4. `distanceMap` has value 0 at the origin and `-1` for unreachable cells.
5. Property test: for seeds 1..200 and each LEVELS config, `generateMaze` returns a maze where `validateMaze` is valid, `solveMaze` is not null, and the entrance is on the boundary.
6. Determinism: `generateMaze` twice with the same config gives byte-equal `cells`; different seeds give different `cells` (for 11x11).
7. Perfect-maze check (braid 0): number of open passages equals `rows*cols - 1`.
8. Braid > 0 yields strictly fewer dead ends than the same seed with braid 0.
9. `farthest` target distance equals the maximum of `distanceMap`.
10. Range checks: `rows: 3` and `rows: 42` throw `RangeError`.
11. Performance: 41x41 generation under 50 ms (log, assert under 200 ms to avoid CI flakiness).
12. `validateMaze` reports an error for a manually broken asymmetric wall.
13. `getLevelConfig(2, undefined, '2026-10-31')` is stable across calls; index 99 clamps to the last level.

Gate: `node --test tests/generation` passes with 0 failures.

---

# MEMBER B: Rendering Upgrades and Level Controls

Folders: `src/render`, `src/ui`, `styles`, `tests/render`.

## Task B3.1: Adaptive rendering

Codex directive: Update `layout.js` and `mazeRenderer.js` for dense mazes (up to 41x41):

- `wallThickness = max(1.5, round(cellSize * 0.12))`, never above `cellSize * 0.2`.
- Cache the static maze drawing in an offscreen canvas (`OffscreenCanvas` if available, else a hidden `<canvas>`). Export `createMazeCache(maze, layout, theme)` returning `{ draw(ctx), invalidate() }`. Per-frame rendering becomes: blit cache, then draw entities.
- Rebuild the cache only on resize, theme change, or new maze.

## Task B3.2: Entrance and target visuals

Codex directive: In `entityRenderer.js` export `drawEntrance(ctx, maze, layout, theme)` (small arrow or notch in `theme.path` color outside the entrance gap, pointing inward) and `drawTarget(ctx, layout, target, theme, timeMs)` (circle with a slow pulsing ring, 2 s cycle, amplitude 8% of cell size). Respect `prefers-reduced-motion` by skipping the pulse.

## Task B3.3: Level controls UI

Codex directive: Create `src/ui/levelPicker.js` exporting `createLevelPicker(containerElement, levels, onSelect)` that renders level buttons (name and size, e.g. "Wander 11x11"), highlights the current level, exposes `setCurrent(index)`, and calls `onSelect(index)`. Also export `createToolbar(containerElement, handlers)` with buttons: `New Maze` (calls `handlers.onNewMaze`), `Restart` (`handlers.onRestart`), `Hint` (`handlers.onToggleHint`). All buttons are real `<button>` elements, keyboard focusable, min 44x44 touch size.

## Task B3.4: Hint path renderer

Codex directive: In `src/render/trailRenderer.js` export `drawHintPath(ctx, layout, pathCells, theme, alpha)` drawing the solution as a dashed polyline through cell centers in `theme.path` at the given alpha. Toggle is controlled from `main.js`.

## Tests: `tests/render/*.test.js`

Required cases:

1. `computeLayout` for 41x41 at 320x320 gives `cellSize >= 7` and a wall thickness that is at least 1.5 and at most `cellSize * 0.2`.
2. Level picker pure helper `formatLevelLabel(level)` returns `"Wander 11x11"`.
3. A pure helper `pathToPoints(layout, pathCells)` in `trailRenderer.js` returns centers in order with length equal to the path length.

## Manual Checklist (B signs off)

- [ ] 31x31 maze at 320px width is legible; walls not blurry.
- [ ] Switching levels is instant (no visible lag).
- [ ] Entrance arrow and target pulse are visible but subtle.
- [ ] Hint path toggles on and off.

---

# INTEGRATION (Both)

## Task I3.1: Wire generation into `main.js`

Codex directive:

1. Remove the fixture usage from `main.js` (keep `fixtures.js` for tests).
2. Maintain `currentLevelIndex` and `currentSeed`. `loadLevel(index, seed)` calls `getLevelConfig`, `generateMaze`, `createMovement(entrancePos)`, rebuilds the maze cache and layout, and requests a redraw.
3. `New Maze` loads the same level with a fresh seed (`Date.now()` string). `Restart` resets movement on the same maze. Level picker loads by index.
4. Show the seed in a small text element under the canvas.
5. Support `?seed=abc&level=3` URL parameters on startup.

---

# EXIT CRITERIA

- [ ] `node --test tests/` passes, including the 200-seed property test.
- [ ] All 5 levels are playable end to end by a human via solving from entrance to target.
- [ ] Reloading with the same `?seed=` and `level=` yields the identical maze.
- [ ] 31x31 renders at 60 fps during movement on a phone emulator.
- [ ] Hint path matches the actual solution and ends at the target.
- [ ] No comments in source.
