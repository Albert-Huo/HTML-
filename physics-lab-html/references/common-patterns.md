# Common Patterns from 4 Sample Files

## 0) Default middle-school template rule

For middle-school physics experiment pages, use `初中物理实验35.html` as the default UI shell before introducing any new layout language.

- Keep the `35` shell: animated spectrum bar, task card, dark stage, minimal HUD, inset canvas lab area, movable/collapsible control and data drawers, bottom toolbar, toast/checkmark/modal feedback, explanation block, and Web Audio hooks for audible phenomena.
- Replace only experiment-specific parts by default: apparatus drawing, direct manipulation rules, guided-task checks, data records, chart/readout content, sound synthesis, auto-demo script, and conclusion text.
- Treat special layouts as exceptions. If an experiment needs a layout like `初中物理实验30.html`, adapt within the same visual grammar instead of creating a separate visual system.
- For new labs after this rule, compare against `35` first during review; UI divergence needs a concrete apparatus or pedagogy reason.

## 1) Shared page skeleton

All four files reuse a near-identical frame:

1. Top animated spectrum bar (`#spectrum`)
2. Task card (`.task-card`) with:
   - Step label
   - Current task text
   - Hint text
   - Progress dots
3. Main interaction area (`#stage` or `#canvas`)
4. Bottom toolbar with core buttons:
   - Reset step/flow
   - Auto demo
   - Free mode toggle
5. Feedback layer:
   - `toast` for quick hints
   - `checkmark` for local success
   - `modal` for final completion
6. Explanation block under interaction area

## 2) Task progression model

The pages use a finite-state guided flow:

- `tasks[]` list with `text`, `hint`, `check()`.
- `currentTask` index to track progression.
- `setStepUI(index)` to render task card + dots.
- `tryPassStep()` checks current task and advances on success.
- `freeMode` weakens/turns off guided gating while preserving core mechanics.

This model is simple, deterministic, and easy to extend.

## 3) Interaction model

Typical interaction primitives:

- Drag objects (lights, caliper jaws, floating panels, points)
- Click/tap controls for mode and actions
- Optional auto-demo scripted sequence

Technical choices seen repeatedly:

- Pointer events as main path (`pointerdown/move/up/cancel`)
- Stage should keep page scrolling available on mobile: use `touch-action: pan-y pinch-zoom` by default.
- Canvas can use `touch-action: pan-y pinch-zoom` for mostly horizontal or tap-based pages; if a lab needs reliable vertical/two-axis apparatus dragging, Canvas may use `touch-action: none` but must add an empty-area page-pan fallback so students can still scroll from the experiment area.
- `touch-action: none` without a scroll fallback is reserved for small, dedicated drag handles that do not need to serve as page-scroll surfaces.
- `setPointerCapture` during drag
- Clamp movement to stage bounds

## 4) Visual feedback model

Three feedback layers are reused:

- Immediate error/guide: toast text
- Step success: temporary check animation
- Full completion: modal dialog

Plus small rewards:

- Active/done dots
- Task-card grayout in free mode
- Status tags and small HUD indicators

## 5) Mobile adaptation patterns

Shared practices:

- `meta viewport` with constrained scale
- Flexible width + capped max width
- `height: 60vh` + max-height for stable scene size
- Responsive controls with wrap
- Resize/orientation handlers for re-layout
- Multi-touch guard when necessary

## 6) Smoothness patterns

Observed strategies:

- `requestAnimationFrame` loop for animation flow
- Debounced `resize` re-layout (`setTimeout` + clear)
- `transform`-based movement for visual elements
- Lightweight CSS transitions instead of heavy effects

## 7) Robustness patterns

Observed safety controls:

- Guard flags: `isRunning`, `autoPlaying`, `freeMode`, `completed`
- Cooldown lock to prevent repeated success triggers
- Reset function that recenters scene and clears transient state
- `try/catch` in async auto-demo for graceful failure
- Cancel timers/RAF before new run

## 8) Suggested parameterization for new experiments

Keep the frame stable, vary these parameters:

1. `LAB_TITLE`
2. `tasks[]` content and `check()` logic
3. Draggable/interactive entities and constraints
4. Simulation equations or rule engine
5. Explanation section content

This keeps code reusable while preserving experiment-specific learning goals.

## 9) Progressive-disclosure UI pattern

When the experiment has multiple stages, keep non-essential blocks hidden by default and reveal them only when needed by the current step.

- Keep first screen minimal: core apparatus + essential controls only.
- Step-coupled reveal:
  - show conclusion/quiz blocks only at final reasoning step
  - keep advanced readouts in drawers or optional panels
- Keep visual continuity:
  - revealed blocks should reuse task-card style language
  - avoid introducing a second unrelated card style late in the flow
- Hide again on reset:
  - reset should return page to minimal first-screen state deterministically.

## 10) Single-stage minimal scene + mini board

When users ask for an ultra-clean interface, keep one main stage only and move secondary explanation into a small overlay board.

- Keep only one apparatus scene in the first screen; avoid dual-panel card layout.
- Remove decorative grid/box framing from the core stage area.
- Keep primary metrics to two chips (for example `v` and `Δv`).
- Put secondary readouts (energy split, trend hints) into a small corner board.
- Keep advanced tables in collapsed drawers, not in the main scene.
- Preserve course explanation formatting under the stage (`title + bullet list`) if teacher consistency is required.

## 11) Data drawer unseen-count notice pattern

When a page includes a data drawer, use this as the default behavior:

- Recording data must not auto-expand the drawer.
- If drawer is collapsed and a new record is added, show a prominent blinking red badge on the drawer title.
- Badge text shows unseen record count; cap display at `99+` if needed.
- Opening drawer clears unseen count immediately and hides badge.
- If drawer is collapsed again, new records must re-trigger badge and count.

Recommended implementation shape:

- DOM:
  - Drawer title includes badge node, for example: `数据面板 <span id="dataNotice">0</span>`
- State:
  - `dataCollapsed`
  - `unseenRecordCount`
- Functions:
  - `refreshDataNotice()`
  - `setDataCollapsed(on)` clears unseen count when expanded
  - `addRecord()` increments unseen count only when collapsed
  - `clearData()` resets unseen count

Behavior checks:

- After each record while collapsed: count increases, badge blinks.
- After expanding once: badge disappears and count resets to zero.
- After collapsing again + new record: badge appears again with fresh count.

## 12) Boiling-lab drawerized control pattern

For boiling/temperature-process experiments, use drawerized control as the default interaction layout:

- Keep apparatus-first stage visible; avoid fixed side dashboards that permanently occupy screen space.
- Control drawer:
  - host live process readouts (for example temperature, heating state, stable-boiling duration, sample count)
  - host temperature-time chart for in-place observation
  - host immediate operation controls (for example ignite/extinguish, confirm observation)
- Data drawer:
  - keep record/history rows only
  - do not duplicate live process readouts here
- Default state:
  - control/data drawers top-right and collapsed on first load
  - drawers should stay semi-transparent enough to reveal rough silhouettes of covered apparatus/other drawers underneath
  - preserve text readability with blur + border contrast; do not trade legibility away for transparency
  - auto demo may expand/reposition drawers to avoid blocking key instrument readouts
- Guided-flow alignment:
  - step card drives progression
  - out-of-order operations trigger warning-step (red) state until corrected

Recommended state fields:

- `panelCollapsed`
- `dataCollapsed`
- `records`
- `unseenRecordCount`
- `boilStableSec` (or experiment-equivalent process stability metric)

Recommended checks:

- First screen still shows meaningful apparatus even when drawers exist.
- Expanding one drawer on narrow screens does not force overlap with the other.
- Control/data drawers remain draggable during auto demo.

## 13) Auto-demo record-persistence assertion pattern

Use this pattern whenever auto demo is expected to produce step records:

- Per step:
  - snapshot `beforeLen = records.length`
  - execute scripted operation + confirm action
  - assert `records.length > beforeLen`
- On assertion failure:
  - throw explicit code (for example `AUTO_RECORD_NOT_PERSISTED`)
  - fail fast; do not continue to later steps
- Recovery contract:
  - wrap auto flow in `try/catch/finally`
  - in `finally`, always release UI lock and restore mode/button state
  - show targeted toast/log for record persistence failure vs generic interruption

Reference implementation shape:

```js
const beforeLen = state.records.length;
await demoClickElement(checkBtn, runId, async () => { tryPassCurrentStep(true); });
if (state.records.length <= beforeLen) {
  throw new Error('AUTO_RECORD_NOT_PERSISTED');
}
```

## 14) Hint-lamp layered guidance pattern

Use this pattern when a step has multi-part operations, precision-sensitive reading, or a non-obvious experiment strategy that would overfill the task-card hint.

- Purpose split:
  - task card keeps the short, step-local reminder
  - hint lamp provides deeper micro-guidance without making the first screen text-heavy
- Best use cases:
  - multi-step apparatus chains such as `先称量 -> 再倾倒 -> 再补液 -> 再回称`
  - precision reading tasks such as `视线齐平弯月面 / 对准刻度 / 扫描量程与分度值`
  - experiment-strategy reminders such as “本实验应先记录哪组量，再做计算”
- Suggested placement:
  - near the top-left HUD area but visually secondary to mode/status
  - collapsed by default; click/tap to expand
  - may flash when the learner reaches a precision-heavy step or triggers a step warning
- Visual consistency:
  - use a pure bulb icon (for example `💡`), not a bulb wrapped in a colored disk
  - flash the bulb itself; avoid flashing a separate circular background
  - when this pattern is reused in later labs, keep icon style, placement, and flash semantics consistent
- Recommended content layers:
  - `当前提示`: current step's detailed operation cue
  - `实验思路`: higher-level workflow or reasoning path across multiple steps
- Content boundary:
  - task-card hint: one short sentence only
  - hint lamp detail: operation nuances and sequencing
  - hint lamp thought: experiment-order strategy or formula path
- Reset behavior:
  - reset should close the popover deterministically
  - step transitions may update text content, but should not forcibly expand the lamp every time

Recommended implementation shape:

- DOM:
  - `hintLampWrap`
  - `hintLampBtn`
  - `hintPop`
  - `hintDetail`
  - `hintThought`
- State:
  - `hintOpen`
- Functions:
  - `flashHintLamp()`
  - `syncHintLamp()`
  - per-step hint updater that rewrites `hintDetail/hintThought`

Behavior checks:

- The first screen stays clean when the lamp is collapsed.
- Complex steps can expose more detail without replacing the task card.
- Step warnings may flash the lamp to draw attention, but the lamp remains user-controlled.
- When new records are written, pair the lamp pattern with the data-drawer red flash / unread badge pattern instead of duplicating record-success text inside the stage.
- On mobile, the popover must not cover the core apparatus by default; if needed, keep width constrained and anchor near the HUD.

## 14) Free-mode reset semantics

Use this mode rule across experiments with guided/free/auto:

- Enter/exit free mode must be controlled by the free-mode toggle button.
- In free mode, clicking `步骤重置` should reset apparatus states and step context only.
- `步骤重置` in free mode must not implicitly switch back to guided mode.
- After free-mode reset, mode/status labels should remain `模式：自由` and `状态：自由探索`.

Recommended implementation:

- Add reset option flag, for example `preserveFreeMode`.
- In reset flow, if `preserveFreeMode` is true:
  - keep `freeMode = true`
  - keep free-mode button text in exit state
  - keep task-card dimmed style
  - keep mode/status tag aligned to free mode

## 15) Free-mode exploration widening pattern

Use this pattern when guided mode must stay textbook-strict, but free mode should support broader exploratory play.

- Guided mode remains textbook-aligned:
  - keep textbook target positions / parameter values / record names / pass checks strict
  - auto demo should replay only this standard guided chain
- Free mode may broaden exploration:
  - allow more apparatus placements or parameter values than guided mode
  - allow custom record labels such as `自定义` instead of textbook-only labels
  - allow looser analysis entry conditions when the goal is open exploration (for example, at least 2 records)
- Guardrails:
  - free-mode custom records must not weaken guided-mode textbook record checks
  - free-mode custom records should not count as guided-mode textbook milestone records
  - exiting free mode should restore textbook default state/targets so guided progression can resume deterministically
- Recommended implementation shape:
  - keep separate textbook markers/targets for guided mode
  - in free mode, map drag/parameter input to a wider but still physically meaningful set
  - when recording in free mode, include explicit custom labels so data provenance is clear
  - analysis logic should branch by mode when guided and free learning goals differ

Reference use case:

- Experiment 18 inclined-plane cart speed lab:
  - guided mode only accepts textbook `s1/s2`
  - free mode allows multiple custom ruler positions
  - free-mode analysis succeeds with 2+ records
  - leaving free mode restores textbook `s1` default

## 16) Mass-volume graph analysis bench

For labs that teach the relationship between mass and volume, use this interaction pattern:

- Keep one apparatus side and one graph side in the same main stage:
  - apparatus side: sample block, material switch, volume slider, mass readout
  - graph side: `m-V` scatter plot with optional fit lines
- Make the measured mass derive directly from current apparatus state:
  - `mass = density * volume`
  - changing volume must simultaneously update sample size, mass readout, and current control-panel pills
- Record chain:
  - click measure -> append one table row
  - the same action must also add one plotted point
  - disallow duplicate `(material, volume)` rows unless the lesson explicitly needs repeated trials
- Analysis chain:
  - only allow fit/comparison conclusion after enough points exist
  - require at least two materials when the goal is slope comparison
- Drawer split:
  - control drawer keeps current material/volume/mass and analysis summary
  - data drawer keeps record history only
- Auto demo:
  - must drag the same volume slider users drag
  - must switch materials through the same visible controls

## 17) Ruler length-measurement drag bench

For ruler-based length labs, use direct apparatus manipulation as the default:

- Keep the ruler as the primary stage instrument.
- Drag the measured object itself to the zero mark; near the zero mark, use adsorption/snap-to-zero assistance.
- Use a draggable vertical reading guide/cursor to align with the far end of the object.
- Keep the object-geometry endpoints and the pass/readout calculations on the same coordinate model; do not let visual endpoints differ from logical endpoints.
- If the ruler unit is `cm`, the reported reading should usually be to `0.1 cm`; treat this as estimation precision, not as a finer drawn subdivision unless the source instrument truly has it.
- If a zoom window is present, render it as a local enlarged ruler segment with the same division semantics as the main ruler.
- Avoid low-value instructional text inside the zoom window; keep only local scale, cursor, endpoint cue, and final readout.
  - must assert record growth after each scripted measurement/confirmation step

## 18) Exact-scale checkpoint with snap assist

Use this pattern when a task requires learners to hit an exact physical scale value such as `20.0 cm`, a target angle, or a marked mass position:

- Keep the pass condition strict:
  - compare against the exact snapped target value
  - do not replace the target with a broad tolerance band like "around 20"
- Make precise landing easy on the stage itself:
  - snap the manipulable object to the nearest meaningful tick
  - allow clicking the ruler/rail/scale to jump directly to the snapped tick
  - keep the displayed value aligned to the snapped state so the learner sees the exact checkpoint immediately
- For fluid-pressure or gauge scenes:
  - if a manometer/U-tube differential is the core observable, amplify the visual differential enough to be legible
  - preserve monotonic trend; larger physical reading must still produce a visibly larger differential

Reference implementation shape:

```js
const SCALE_STEP = 1;
function normalizeScaleValue(v){
  return clamp(Math.round(v / SCALE_STEP) * SCALE_STEP, min, max);
}
function isExactTarget(v, target){
  return Math.abs(v - target) < 0.05;
}
```
