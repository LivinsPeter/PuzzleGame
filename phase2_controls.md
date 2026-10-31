# Phase 2: Input Handling and Movement Engine

Goal: the ball moves cell by cell with smooth interpolation, driven by keyboard, on-screen d-pad and swipe. Walls block movement.

Prerequisite: Phase 1 exit criteria passed on `main`.

---

## Movement Design Decisions (fixed, do not renegotiate)

- One input = one cell step. Holding a key repeats at a fixed rate (handled by B).
- Step duration: 120 ms, easing `easeOutCubic`.
- Input buffering: if a move is requested while one is animating, store ONE pending direction (latest wins). It executes the instant the current step finishes.
- Blocked move: no position change; B receives a `bump` signal for a small shake effect.
- Movement state is immutable-style: every function returns a new state object.

---

# MEMBER A: Movement Engine

Folders: `src/engine`, `tests/engine`.

## Task A2.1: `src/engine/easing.js`

Codex directive: Export `easeOutCubic(t)`, `easeInOutQuad(t)`, `clamp01(t)`. Inputs outside [0,1] are clamped first. `easeOutCubic(0) === 0`, `easeOutCubic(1) === 1`.

## Task A2.2: `src/engine/movement.js`

Codex directive: Implement the state shape and functions below. Import `resolveMove` from `../core/rules.js` and easing from `./easing.js`.

State shape:

```js
{
  pos: { r, c },
  from: { r, c },
  to: { r, c },
  progress: number,
  durationMs: number,
  moving: boolean,
  pending: string | null,
  lastEvent: 'none' | 'step' | 'blocked' | 'arrived'
}
```

| Function | Input | Output | Behaviour |
|---|---|---|---|
| `createMovement(startPos, options)` | pos, `{ durationMs = 120 }` | state | `moving:false`, `pending:null`, `lastEvent:'none'`, `from = to = pos`. |
| `requestMove(state, maze, dirName)` | state, Maze, name | state | If `moving`: set `pending = dirName`, `lastEvent:'none'`. Else call `resolveMove`; if moved: set `from=pos`, `to=newPos`, `progress=0`, `moving:true`, `lastEvent:'step'`; if not: `lastEvent:'blocked'`. |
| `updateMovement(state, maze, dtMs)` | state, Maze, ms | state | If not moving return state. Add `dtMs/durationMs` to progress. On reaching 1: set `pos = to`, `moving:false`, `lastEvent:'arrived'`; then if `pending` exists, clear it and apply `requestMove` with it (carry over leftover dt is not required). |
| `getVisualPosition(state)` | state | `{ x, y }` | `x = from.c + (to.c - from.c) * easeOutCubic(progress)`; same for `y` with rows. When not moving returns `pos.c`, `pos.r`. |
| `consumeEvent(state)` | state | `{ state, event }` | Returns the event and resets `lastEvent` to `'none'` in the returned state. |

NOTE: the signature of `updateMovement` takes `maze` as the second argument (needed for pending moves). Update the API table in `00_overview.md` section 4.4 accordingly.

## Task A2.3: `src/engine/loop.js`

Codex directive: Export `createLoop(onFrame)` returning `{ start(), stop(), isRunning() }`. Uses `requestAnimationFrame` injected via an optional second parameter `scheduler = { request: requestAnimationFrame, cancel: cancelAnimationFrame }` so tests can pass a fake. `onFrame` receives `dtMs`, clamped to a maximum of 50 to survive tab switching. First frame dt is 0.

## Tests: `tests/engine/movement.test.js`, `easing.test.js`, `loop.test.js`

Use the fixture maze from `src/core/fixtures.js`.

Required cases:

1. Easing endpoints: 0 -> 0, 1 -> 1, monotonic across 100 samples, out-of-range clamps.
2. `requestMove` into a wall: `moving:false`, `lastEvent:'blocked'`, `pos` unchanged.
3. `requestMove` along a legal direction: `moving:true`, `to` equals expected, `from` equals start.
4. `updateMovement` with dt 60 on a 120 ms step: progress 0.5, still moving. With dt 60 again: arrived, `pos === to`, `lastEvent:'arrived'`.
5. Visual position at progress 0 equals `from`, at 1 equals `to`, at 0.5 is strictly between.
6. Buffering: request RIGHT then DOWN mid-step; after completion the DOWN is executed (or blocked event emitted if illegal); pending is cleared. Request three directions mid-step: only the LAST is kept.
7. Replaying `FIXTURE_SOLUTION` through request/update loops (dt 120 each) ends at the target with no `blocked` events.
8. `consumeEvent` returns the event once and then `'none'`.
9. States are not mutated: freeze the input state and assert no throw (strict mode).
10. Loop: with a fake scheduler, `start()` schedules once, frames call `onFrame` with clamped dt (feed 500 -> 50), `stop()` cancels.

Gate: `node --test tests/engine` passes with 0 failures.

---

# MEMBER B: Input Layers and Controls UI

Folders: `src/input`, `src/ui` (controls only), `styles`, `tests/input`.

## Shared Input Contract

All input modules expose the same signature and emit direction NAMES (`'UP' | 'RIGHT' | 'DOWN' | 'LEFT'`):

```js
attachX(target, onDirection) -> detach()
```

## Task B2.1: `src/input/keyboard.js`

Codex directive: Export `attachKeyboard(target, onDirection)` and the pure function `keyToDirection(key)`.

- Mapping: `ArrowUp/w/W -> UP`, `ArrowRight/d/D -> RIGHT`, `ArrowDown/s/S -> DOWN`, `ArrowLeft/a/A -> LEFT`. Everything else returns `null`.
- Call `event.preventDefault()` only for mapped keys (stops page scroll).
- Ignore `event.repeat` events; implement own hold-repeat: first repeat after 220 ms, then every 110 ms, using `setTimeout`/`setInterval`, cleared on `keyup` of that key, on `blur`, and on `detach`.
- Ignore events when modifier keys (ctrl/meta/alt) are pressed.

## Task B2.2: `src/input/touchControls.js` (on-screen d-pad)

Codex directive: Export `attachDpad(rootElement, onDirection)`.

- `rootElement` contains four `<button data-dir="UP|RIGHT|DOWN|LEFT">` elements.
- Use Pointer Events (`pointerdown`, `pointerup`, `pointercancel`, `pointerleave`). Fire on `pointerdown` (no 300ms delay). Hold-repeat identical to the keyboard (220 ms then 110 ms).
- Call `setPointerCapture` on press. Add/remove a `.is-pressed` class for visual feedback.
- Add `aria-label` text ("Move up", etc.).

## Task B2.3: `src/input/swipe.js`

Codex directive: Export `attachSwipe(target, onDirection)` and the pure function `classifySwipe(dx, dy, minDistance)`.

- `classifySwipe` returns a direction name if `max(|dx|,|dy|) >= minDistance` using the dominant axis, otherwise `null`. Ties favor the horizontal axis.
- `attachSwipe` tracks `pointerdown` -> `pointermove`; as soon as the threshold (24 px) is crossed it emits one direction and resets the origin to the current point, so one continuous drag can chain multiple steps.
- Only active for `pointerType === 'touch'` or `'pen'`.

## Task B2.4: Controls markup and CSS

Codex directive:

- Add to `index.html` below the canvas: `<div id="dpad" class="dpad" role="group" aria-label="Directional controls">` with a 3x3 CSS grid layout (up top center, left/right middle, down bottom center), four buttons.
- Buttons minimum 64x64 px, rounded, large arrow glyphs via CSS (no images), `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation`.
- Show the d-pad only when `@media (hover: none) and (pointer: coarse)`; hidden on desktop. Add a body class `.show-dpad` that forces it visible for testing.
- Respect `env(safe-area-inset-bottom)` padding.

## Task B2.5: Bump feedback

Codex directive: Create `src/render/effects.js` exporting `createShake()` with `trigger()` and `getOffset(nowMs)` returning `{ dx, dy }`, a 150 ms decaying sinusoidal offset of at most 3 px. Used when a `blocked` event occurs.

## Tests: `tests/input/*.test.js`

Required cases (pure functions only; DOM behavior via manual checklist):

1. `keyToDirection` covers all 8 mapped keys plus uppercase variants; returns `null` for `'Enter'`, `' '`, `'q'`.
2. `classifySwipe(30,5,24) === 'RIGHT'`, `(-30,5,24) === 'LEFT'`, `(5,40,24) === 'DOWN'`, `(5,-40,24) === 'UP'`, `(10,10,24) === null`, `(24,24,24) === 'RIGHT'` (tie).
3. `getOffset` returns 0 at `trigger + 150` and later, and its magnitude never exceeds 3.

## Manual Checklist (B signs off)

- [ ] Arrow keys and WASD emit events; page does not scroll.
- [ ] Holding a key repeats; releasing stops instantly; switching tabs mid-hold stops repeat.
- [ ] D-pad buttons fire on touch with no delay; press state visible.
- [ ] Swipe works anywhere on the canvas and chains steps.
- [ ] D-pad is visible on a phone emulator and hidden on desktop.

---

# INTEGRATION (Both)

## Task I2.1: Wire `src/main.js`

Codex directive: Extend `main.js`:

1. Create `movement = createMovement(entrancePos)` and hold it in a module-level `let`.
2. Create a single `handleDirection(dirName)` that sets `movement = requestMove(movement, maze, dirName)`.
3. Attach keyboard (on `window`), d-pad (on `#dpad`), swipe (on the canvas) all to `handleDirection`.
4. Start `createLoop`: each frame run `movement = updateMovement(movement, maze, dt)`, read and consume the event (if `'blocked'`, trigger shake), then redraw: `drawMaze`, then `drawBall` at `getVisualPosition(movement)` plus the shake offset.
5. Redraw only while moving, shaking, or after a resize (a `needsRender` flag) to save battery.

---

# EXIT CRITERIA

- [ ] `node --test tests/` passes.
- [ ] Ball traverses the fixture maze from entrance to target using each of: keyboard, d-pad, swipe.
- [ ] Ball cannot pass through any wall; blocked moves shake and do not move.
- [ ] Rapid input never desyncs the ball from the grid (mash arrow keys for 10 seconds; ball always rests on a cell center).
- [ ] 60 fps on a mid-range phone emulator; idle CPU near zero when nothing moves.
- [ ] No comments in source.
