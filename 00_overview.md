# Show the Way: Master Blueprint and Team Contract

Read this file first. Paste it at the top of every Codex session, followed by the current phase file.

## 1. Stack and Constraints

- Vanilla JavaScript (ES modules), HTML5 Canvas, plain CSS. No framework, no bundler.
- Tests: Node built-in runner (`node --test`). Logic modules must not touch `window`, `document` or `canvas`, so they stay testable in Node.
- Local server: `python3 -m http.server 8080` (ES modules need http, not file://).
- Target: latest Chrome, Safari (iOS), Firefox, Edge. Min viewport 320px wide.
- Code rule for Codex: write code with ZERO comments. Names must be self-explanatory. Every function under 40 lines. One responsibility per file.

## 2. Team Split (No Merge Conflicts)

| Member | Ownership | Rule |
|---|---|---|
| Member A | Pure logic: `src/core`, `src/engine`, `src/generation`, `src/state`, and `tests/` for those folders | Never imports from `src/render`, `src/input`, `src/ui`. No DOM access. |
| Member B | Presentation: `src/render`, `src/input`, `src/ui`, `styles/`, `index.html`, and `tests/` for those folders | May import from A's modules only through the contracts in section 4. |
| Both | `src/main.js`, `package.json` | Edit only during the "Integration" step of each phase, after both sides are merged. |

Branching: `main` is always runnable. Each member works on `phaseN-a` / `phaseN-b`. Merge A first, then B, then run the Integration step on `phaseN-integration`. Do not start phase N+1 until the exit criteria of phase N pass on `main`.

## 3. Final Directory Layout

```
show-the-way/
  index.html
  package.json
  styles/
    main.css
  src/
    main.js
    core/
      constants.js
      maze.js
      rules.js
      fixtures.js
    engine/
      easing.js
      movement.js
      loop.js
    generation/
      rng.js
      generator.js
      solver.js
      validate.js
      levels.js
    state/
      gameState.js
      timer.js
      stats.js
      storage.js
    render/
      canvasSetup.js
      layout.js
      theme.js
      mazeRenderer.js
      entityRenderer.js
      trailRenderer.js
      particles.js
    input/
      keyboard.js
      touchControls.js
      swipe.js
    ui/
      screens.js
      hud.js
      effects.js
  tests/
    core/
    engine/
    generation/
    state/
    render/
    input/
```

## 4. Shared Contracts (Frozen After Phase 1)

Changing anything below requires both members to agree and update this file.

### 4.1 Constants (`src/core/constants.js`)

```js
export const WALL = { N: 1, E: 2, S: 4, W: 8 };
export const DIRECTIONS = {
  UP:    { name: 'UP',    dr: -1, dc: 0,  wall: WALL.N, opposite: WALL.S },
  RIGHT: { name: 'RIGHT', dr: 0,  dc: 1,  wall: WALL.E, opposite: WALL.W },
  DOWN:  { name: 'DOWN',  dr: 1,  dc: 0,  wall: WALL.S, opposite: WALL.N },
  LEFT:  { name: 'LEFT',  dr: 0,  dc: -1, wall: WALL.W, opposite: WALL.E }
};
```

### 4.2 Maze Object

```js
{
  rows: number,
  cols: number,
  cells: Uint8Array,
  entrance: { r: number, c: number, side: 'UP' | 'RIGHT' | 'DOWN' | 'LEFT' },
  target: { r: number, c: number }
}
```

- `cells[r * cols + c]` is a bitmask. A set bit means that wall EXISTS.
- Walls are symmetric: if cell X has wall E cleared, its east neighbor has wall W cleared.
- The entrance cell sits on the outer boundary and its `side` wall is cleared to show the opening.

### 4.3 Position and Direction

- Position: `{ r, c }` integer grid coordinates.
- Direction: one of the four objects in `DIRECTIONS`, referenced by name string `'UP' | 'RIGHT' | 'DOWN' | 'LEFT'` across module boundaries.

### 4.4 Public API Summary

| Module | Export | Signature |
|---|---|---|
| core/maze.js | createMaze | `(rows, cols) -> Maze` (all walls present) |
| core/maze.js | getCell | `(maze, r, c) -> number` |
| core/maze.js | hasWall | `(maze, r, c, dirName) -> boolean` |
| core/maze.js | setWall | `(maze, r, c, dirName, present) -> void` (symmetric) |
| core/maze.js | inBounds | `(maze, r, c) -> boolean` |
| core/rules.js | canMove | `(maze, pos, dirName) -> boolean` |
| core/rules.js | resolveMove | `(maze, pos, dirName) -> { pos, moved }` |
| core/rules.js | isAtTarget | `(maze, pos) -> boolean` |
| engine/movement.js | createMovement | `(startPos, options?) -> MovementState` |
| engine/movement.js | requestMove | `(state, maze, dirName) -> MovementState` |
| engine/movement.js | updateMovement | `(state, maze, dtMs) -> MovementState` |
| engine/movement.js | getVisualPosition | `(state) -> { x, y }` in fractional cell units (x = column, y = row) |
| generation/generator.js | generateMaze | `({ rows, cols, seed }) -> Maze` |
| generation/solver.js | solveMaze | `(maze) -> Array<{r,c}> \| null` |
| state/gameState.js | createGame | `(levelConfig) -> GameState` |

## 5. Codex Session Protocol

For each task in a phase file:

1. Paste: this file (section 1 and 4 only), the phase file, and the single task block.
2. Tell Codex: "Implement only this task. Create only the listed files. Zero comments in code. Do not modify files outside the task."
3. Run the task's tests (`node --test tests/<folder>`). Paste failures back verbatim for fixing.
4. Commit with message `phaseN-a/b: task X.Y done`.

If Codex output exceeds one file, split the task by file. Never ask Codex to "build the whole game".

## 6. Global Definition of Done (Per Phase)

- All tests pass: `node --test tests/`.
- No console errors or warnings in browser.
- Zero comments in all new source files (check: `grep -rn "//\|/\*" src` returns nothing).
- Exit criteria in the phase file are ticked by both members.

## 7. Phase Index

| File | Goal |
|---|---|
| `phase1_core.md` | Grid, data model, rules, canvas rendering of a hardcoded maze |
| `phase2_controls.md` | Keyboard, d-pad, swipe, smooth movement |
| `phase3_generation.md` | Seeded solvable maze generation, solver, levels |
| `phase4_ui_polish.md` | Screens, HUD, timer, moves, trail, victory effects |
