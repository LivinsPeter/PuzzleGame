# Phase 4: Game State, UI, and Polish

Goal: a complete game loop with start screen, in-game HUD (timer, moves), win detection, win screen with stats and best times, trail tracking, victory animation and final accessibility and responsive QA.

Prerequisite: Phase 3 exit criteria passed on `main`.

---

## Design Decisions (fixed)

- Game state machine: `menu -> playing -> won`, with `won -> playing` (next level or replay) and `playing -> menu`.
- The timer starts on the FIRST successful move, not on level load. It stops on win.
- A move counts only when a step actually happens (blocked bumps do not count).
- Stars: computed from move efficiency = `optimalMoves / playerMoves`. 3 stars if >= 0.9, 2 stars if >= 0.6, else 1 star.
- Best times and best moves are stored per `levelId` in `localStorage` under the key `show-the-way:v1`.
- Visuals respect `prefers-reduced-motion`: replace particles and pulses with a static highlight.

---

# MEMBER A: State, Timer, Stats, Storage

Folders: `src/state`, `tests/state`.

## Task A4.1: `src/state/timer.js`

Codex directive: Export `createTimer()` returning an immutable-style state `{ running, startedAt, elapsedMs }` and pure functions:

| Function | Input | Output |
|---|---|---|
| `startTimer(timer, nowMs)` | state, ms | state running from `nowMs` (no-op if already running) |
| `stopTimer(timer, nowMs)` | state, ms | state stopped with `elapsedMs` accumulated |
| `resetTimer()` | none | fresh state |
| `getElapsedMs(timer, nowMs)` | state, ms | elapsed including the running segment |
| `formatTime(ms)` | ms | `"M:SS.d"` e.g. `"1:05.3"`; under one minute `"0:07.9"` |

`nowMs` is always injected; never call `Date.now()` inside these functions.

## Task A4.2: `src/state/stats.js`

Codex directive: Export:

| Function | Input | Output |
|---|---|---|
| `computeStars(optimalMoves, playerMoves)` | ints | 1, 2 or 3 per the rule above; throws `RangeError` if either is below 1 |
| `isNewBest(previousBest, result)` | `{ timeMs, moves }` or `null`, `{ timeMs, moves }` | `{ time: boolean, moves: boolean }` |
| `mergeBest(previousBest, result)` | same | the new best record `{ timeMs, moves }` (each field is the minimum) |

## Task A4.3: `src/state/storage.js`

Codex directive: Export `createStorage(backend)` where `backend` has `getItem/setItem` (defaults to `localStorage` only if `globalThis.localStorage` exists, otherwise an in-memory map). Methods:

- `loadBest(levelId) -> { timeMs, moves } | null`
- `saveBest(levelId, record) -> void`
- `loadSettings() -> { hintsEnabled: boolean, reducedMotion: boolean | null }`
- `saveSettings(settings) -> void`

All reads wrapped so corrupt JSON returns defaults rather than throwing. Writes catch quota errors silently. Storage key: `show-the-way:v1`.

## Task A4.4: `src/state/gameState.js`

Codex directive: Export a state machine with pure transition functions. State shape:

```js
{
  phase: 'menu' | 'playing' | 'won',
  levelIndex: number,
  seed: string,
  maze: Maze,
  optimalMoves: number,
  moves: number,
  timer: TimerState,
  result: { timeMs, moves, stars, newBest } | null
}
```

| Function | Input | Output | Behaviour |
|---|---|---|---|
| `createGame(levelIndex, seed)` | int, string | state in `menu` | Generates the maze via `generateMaze`; `optimalMoves = solveMaze(maze).length - 1`. |
| `beginPlay(state)` | state | state | `phase:'playing'`, `moves:0`, timer reset. |
| `registerStep(state, nowMs)` | state, ms | state | Only in `playing`. Increments `moves`; starts the timer if not running. |
| `checkWin(state, pos, nowMs, storage)` | state, pos, ms, storage | state | If `isAtTarget`: stop timer, compute stars and new-best flags, persist best via storage, `phase:'won'`, fill `result`. Otherwise returns state unchanged. |
| `restartLevel(state)` | state | state | Same maze, `phase:'playing'`, counters reset. |
| `nextLevel(state)` | state | state | Increments `levelIndex` (clamped), fresh seed derived from `state.seed`, phase `menu` or `playing` per option. |
| `returnToMenu(state)` | state | state | `phase:'menu'`. |

Invalid transitions (for example `registerStep` while `won`) return the state unchanged.

## Tests: `tests/state/*.test.js`

Required cases:

1. Timer: start at 1000, stop at 4500 -> elapsed 3500; start twice does not reset; `getElapsedMs` while running equals now - startedAt plus accumulated; resume after stop accumulates.
2. `formatTime(0) === '0:00.0'`, `formatTime(65300) === '1:05.3'`, `formatTime(599999) === '9:59.9'`.
3. `computeStars(10,10) === 3`, `(10,11) === 3`, `(10,15) === 2`, `(10,40) === 1`; `computeStars(0,5)` throws `RangeError`.
4. `isNewBest` with `null` previous is true for both; faster time but more moves flags only `time`.
5. Storage: round-trips a best record using a fake backend; returns `null` for unknown levels; corrupt JSON in the backend returns defaults without throwing; throwing `setItem` is swallowed.
6. Game flow: `createGame` -> `beginPlay` -> N `registerStep` calls (using the solver path) -> `checkWin` at the target yields `phase:'won'`, `moves === optimalMoves`, `stars === 3`, `newBest.time === true`, and storage contains the record.
7. `checkWin` not at target leaves state identical (same reference).
8. `registerStep` in `menu` or `won` is a no-op.
9. Timer starts only at the first step: after `beginPlay`, `getElapsedMs` stays 0 until `registerStep`.
10. A second win with a worse time does not overwrite the stored best.
11. `restartLevel` keeps `seed` and `maze` reference, resets `moves` and timer.

Gate: `node --test tests/state` passes with 0 failures.

---

# MEMBER B: Screens, HUD, Trail, Victory Effects

Folders: `src/ui`, `src/render`, `styles`, `tests/render`, `tests/ui`.

## Task B4.1: Screens

Codex directive: Create `src/ui/screens.js` exporting `createScreens(rootElement, handlers)` returning `{ showMenu(levels, bestByLevel), showWin(result, hasNextLevel), hide() }`.

- Menu overlay: title "Show the Way", tagline, level list (via the existing level picker; show each level's best time and stars if present), `Play` button, a small "How to play" line stating arrow keys / WASD / swipe / d-pad.
- Win overlay: "You found the way", time, moves, star row (1 to 3, filled or outline via CSS), "New best" badges, buttons `Next Level` (hidden if none), `Replay`, `Menu`.
- Overlays use `<dialog>`-style semantics: `role="dialog"`, `aria-modal="true"`, focus moved to the primary button on open, focus trap, `Escape` on the win screen triggers Replay.
- Handlers: `onPlay(levelIndex)`, `onReplay()`, `onNext()`, `onMenu()`.

## Task B4.2: HUD

Codex directive: Create `src/ui/hud.js` exporting `createHud(containerElement)` returning `{ setTime(text), setMoves(n), setLevel(name) }`. Markup: three compact items in a top bar (Level, Time, Moves). Use `font-variant-numeric: tabular-nums` so digits do not jitter. Update the DOM only if the text changed (compare with the last value). Add `aria-live="off"` for the timer and `aria-live="polite"` for moves.

## Task B4.3: Path trail

Codex directive: Extend `trailRenderer.js` with `createTrail()` returning `{ push(pos), clear(), draw(ctx, layout, currentVisualPos, theme) }`.

- `push` records a cell only when it differs from the last one. If the player steps back onto the previous trail cell, pop instead of push (shows backtracking as erasing).
- `draw` renders a rounded polyline through cell centers up to `currentVisualPos`, width `cellSize * 0.18`, `theme.path`, with alpha fading from 0.15 at the oldest segment to 0.6 at the newest (draw in at most 4 alpha bands for performance).
- Export the pure helper `applyTrailStep(trailCells, pos)` returning the new array, for testing.

## Task B4.4: Victory animation

Codex directive: Create `src/render/particles.js` exporting `createBurst(originX, originY, options)` returning `{ update(dtMs), draw(ctx), isDone() }`.

- 40 particles (count scales down to 20 for canvases under 400px), radial velocities, gravity, fading alpha, life 900 to 1400 ms, colors from `theme.target` and `theme.ball`.
- Particle randomness comes from an injected `rng` parameter (use the `createRng` from `generation/rng.js` passed in by `main.js`, so B does not import generation code directly).
- If `prefers-reduced-motion` is set, `createBurst` returns an instantly finished burst and the win overlay shows a static glow instead.
- Add a ball "arrive" effect in `ui/effects.js`: `createArrivePulse()` expanding ring from the target over 500 ms.

## Task B4.5: Polish pass (CSS and layout)

Codex directive:

- Layout at all breakpoints: top bar HUD, canvas, d-pad (touch only), toolbar. On landscape phones place the d-pad to the right side of the canvas using a media query on `orientation: landscape` and `max-height: 500px`.
- Smooth fade (150 ms) for overlays; disable under reduced motion.
- Focus-visible outlines on all buttons (2 px, high contrast).
- Verify color contrast of text and walls meets WCAG AA against the background in both light and dark themes (document the ratios you computed in the pull request description, not in code).
- Add `<meta name="theme-color">` for both color schemes and a minimal inline SVG favicon (data URI).

## Tests: `tests/render/trail.test.js`, `tests/ui/*.test.js`

Required cases:

1. `applyTrailStep([], {r:0,c:0})` -> length 1; same pos again -> unchanged; new pos -> length 2; stepping back to the previous cell pops back to length 1.
2. Trail never contains consecutive duplicates after 1000 random steps (seeded).
3. Particle burst: with a fake rng, `update` for a total of 1500 ms makes `isDone()` true; positions change after the first update; count under the size threshold is 20.
4. `formatBestLabel(bestRecord)` helper in `screens.js` returns `"--"` for `null` and `"0:42.1 / 31 moves"` for `{ timeMs: 42100, moves: 31 }` (uses `formatTime` from state passed in as a parameter or imported only via `main.js` injection, never imported directly by B).
5. `renderStars(count)` pure helper returns an array of three booleans.

## Manual Checklist (B signs off)

- [ ] Menu, win screen, HUD look correct at 320, 390, 768 and 1280 px widths, portrait and landscape.
- [ ] Tab key order is logical; focus visible; `Escape` replays on the win screen.
- [ ] Screen reader announces the win dialog and its stats.
- [ ] Reduced motion setting disables particles and pulses.
- [ ] Trail shows and erases on backtracking.

---

# INTEGRATION (Both)

## Task I4.1: Final `main.js` wiring

Codex directive: Restructure `main.js` into small functions (`bootstrap`, `startLevel`, `handleDirection`, `onFrame`, `handleWin`, `render`) and wire:

1. On load: create storage, load settings, create game state, show the menu with best records per level.
2. `Play` -> `beginPlay`, `loadLevel`, clear the trail, hide overlays, reset HUD.
3. `handleDirection` is ignored unless `phase === 'playing'`. After `requestMove`, if the event is `'step'` call `registerStep(state, performance.now())` and `trail.push`; if `'blocked'` trigger shake only.
4. In `onFrame`: update movement; on `'arrived'` call `checkWin`. HUD timer updates at most 10 times per second using `getElapsedMs`.
5. On win: stop accepting input, start the particle burst and arrive pulse at the target, wait 700 ms (or 0 under reduced motion), then `screens.showWin`.
6. Handlers: `onReplay` -> `restartLevel`; `onNext` -> `nextLevel`; `onMenu` -> `returnToMenu`.
7. Persist the hint toggle through `saveSettings`.
8. Pause the loop and timer when `document.hidden` is true and resume on visibility (timer accounting must not count hidden time).

## Task I4.2: Regression and release

- Run `node --test tests/` (all suites).
- Play every level once on desktop (keyboard) and once on a phone or emulator (d-pad and swipe).
- Play level 1 with the same `?seed=` twice and confirm best-time tracking updates only when beaten.
- Confirm no `console` output in a full play session.
- Tag the release `v1.0.0`.

---

# EXIT CRITERIA (Project Complete)

- [ ] `node --test tests/` passes with 0 failures across all folders.
- [ ] Complete loop works: menu -> play -> win -> next level / replay / menu.
- [ ] Timer starts on the first move, stops on win, ignores hidden-tab time.
- [ ] Moves count only legal steps; stars and best records persist across reloads.
- [ ] Trail and victory animation work and respect reduced motion.
- [ ] Layout verified at 320 px, tablet and desktop widths, portrait and landscape.
- [ ] Keyboard-only and screen-reader pass done.
- [ ] No comments in `src/`; no file exceeds roughly 200 lines; no function exceeds 40 lines.
