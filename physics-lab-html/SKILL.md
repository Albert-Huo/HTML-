---
name: "physics-lab-html"
description: "Design and implement standalone middle/high-school interactive physics experiment HTML pages with real apparatus interaction plus data simulation (task card, step progression, stage/canvas interaction, free mode, auto demo, toast/checkmark/modal feedback). Use when asked to create or refactor educational lab-style HTML interactions, especially when mobile adaptation, smooth interaction, robustness, and realistic instrument workflow are required."
---

# Physics Lab HTML Skill

Build one-file interactive experiment pages that match the style of:
- `高中物理实验1.html`
- `高中物理实验2.html`
- `蝙蝠穿越铃铛交互版.html`
- `三原色光交互版-模板.html`

For middle-school physics experiment pages in the bound workspace, use the workspace-local
`初中物理实验35.html` as the default UI and interaction template. Known compatible paths:
- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验35.html`
- `/Users/Huo/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验35.html`

Prefer the path that belongs to the active workspace. Keep its shell stable (spectrum bar, task card,
dark canvas stage, minimal HUD, movable/collapsible control and data drawers, guided/free
mode, auto demo, record chart/table, toast/checkmark/modal feedback, explanation block, and
Web Audio hooks when relevant) and replace only the experiment apparatus, logic, data schema,
sound synthesis, auto-demo script, and conclusion text unless the apparatus requires a
specific layout exception.

## Workspace Binding

This skill is currently bound to these compatible experiment workspaces:

- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents`
- `/Users/Huo/Library/Mobile Documents/com~apple~TextEdit/Documents`

Known compatible local support roots:

- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html`
- `/Users/Huo/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html`

Before creating or refactoring physics lab HTML:

1. Confirm the current working directory is inside one of the compatible workspaces above. If not, stop and ask the user to switch back to a compatible workspace.
2. Select the active workspace root from the current working directory. If both roots exist, prefer the one that contains the current working directory.
3. Resolve every `references/`, `assets/`, and `scripts/` path in this skill against the active workspace's local support root (`<active workspace>/physics-lab-html`).
4. Keep generated experiment HTML files and visual regression outputs in the active workspace root unless the user explicitly requests another output path.
5. Treat `/Users/lx100/.codex/skills/physics-lab-html/SKILL.md` and a workspace-local `physics-lab-html/SKILL.md` copy as valid discovery entrypoints only. When the active local support root exists, do not read or update the global `references/`, `assets/`, or `scripts/` folders for this workflow.
6. If a reference file contains historical source paths under `/Users/lx100/...`, keep those paths as provenance. When reading a referenced experiment file in the `/Users/Huo/...` workspace, first try the same workspace-relative path under `/Users/Huo/...` before reporting it missing.
7. If the active local support root is missing or incomplete, report the missing path instead of falling back silently to another support bundle.

## Workflow

1. Translate the request into a compact experiment spec:
   - Learning objective (what concept to experience)
   - Necessary apparatus (based on real teaching workflow)
   - Entities (what can move / change)
   - Step tasks (`3-5` guided tasks)
   - Success checks per step
   - Free mode behavior
   - Auto demo behavior
2. Read `references/experiment-spec-template.md` and complete all fields.
3. Read `references/教材与目录来源索引.md` and lock textbook + catalog evidence first.
4. For middle-school physics labs, query `references/textbook-experiment-index.json` before drafting apparatus or interaction flow:
   - Match by explicit `id`, exact/near `title`, or `topic`. If several entries are plausible, use the closest textbook title and record the selected match in delivery notes.
   - Cross-check the matched experiment against the catalog mapping in `references/初中物理实验目录-2023版摘录.md`. If the indexed experiment does not match the catalog experiment the user requested, do not force-fit it.
   - Inject `apparatus`, `key_formulas`, `steps`, and `observations` into the experiment spec as hard physics constraints.
   - Treat non-empty `raw_text` as the highest-priority textbook evidence; when it conflicts with structured fields, follow `raw_text`.
   - If `note` contains `需核对`, `raw_text` is empty, or `page` is null, mark the entry as provisional in the spec and delivery notes; do not claim it is directly extracted textbook text.
   - If no index entry matches, or the matched entry conflicts with the catalog experiment, search the relevant textbook PDF listed in `references/教材与目录来源索引.md` for the related experiment before drafting apparatus/steps.
5. Read `references/初中物理实验目录-2023版摘录.md` to confirm experiment id-name mapping and detect JSON/catalog mismatch.
6. Read `references/教材关键页摘录-初中物理.md` for additional textbook-aligned experiment flow when the JSON index is missing, mismatched, provisional, or insufficient.
7. When PDF fallback is triggered, inspect the relevant textbook PDF before coding:
   - Use 八上/八下 text-searchable PDFs first when the grade/book is known.
   - For 九年级 image-only PDF, use visual page inspection or OCR if available; if the experiment still cannot be confirmed, mark the PDF lookup as unresolved and keep the content provisional.
   - Record PDF path, page/evidence found, and whether it overrides or supplements the JSON entry in the experiment spec and delivery notes.
8. Read `references/apparatus-patterns.md` and choose apparatus patterns before coding.
9. Follow `references/reuse-and-accumulation-workflow.md`:
   - Search existing apparatus/object patterns first
   - Reuse before creating new elements
   - If new elements are required, record them in delivery notes first
   - If an existing apparatus/object pattern is optimized or behavior-tuned, record the optimization scope in delivery notes first
   - Ask user whether to backfill them into skill references; only backfill after explicit user confirmation
   - For force gauges, check spring-scale pattern from `牛顿第三定律演示.html` first
   - For liquid displacement labs, enforce overflow-to-cylinder conservation mapping
10. Read `references/common-patterns.md` and copy the shared page skeleton.
11. Start from `assets/physics-lab-template.html` and fill placeholders.
   - If you already have a small structured spec JSON, prefer `scripts/create_lab_from_spec.mjs` so apparatus-pattern coverage can auto-select runtime components before scaffold generation.
   - For a brand-new page, prefer `scripts/create_lab_scaffold.mjs` so title replacement and runtime inlining happen in one step.
   - Inline runtime families through `scripts/build_runtime_bundle.mjs` or `scripts/create_lab_scaffold.mjs`, not by hand-ordering runtime files in the template.
   - Default to `--group firstWave` until a narrower covered family set is known.
   - When the apparatus family is already covered, prefer `--components ...` so bundle contents still come from `assets/runtime/manifest.js`.
12. Implement movable drawer panels:
   - Control + Data drawers are required
   - Result drawer is optional (only when pedagogically necessary)
   - Default dock policy: control/data start at top-right and collapsed unless user requests otherwise
   - Keep draggable + collapsible + edge-snap behavior
13. Keep progressive-disclosure UI:
   - Keep the first screen visually simple
   - Show advanced/readout/quiz blocks only when needed by the current step or explicit user action
   - Avoid always-on secondary cards when they are not required for the current task
   - For complex, precision-sensitive, or multi-part operations, keep the task-card hint short and add a collapsible hint-lamp layer for deeper micro-guidance; see `references/common-patterns.md`
14. Implement interaction with pointer-first input and mobile-safe behavior.
15. Run the checklist in `references/mobile-smoothness-robustness-checklist.md`.
16. Run visual regression in `references/visual-regression-workflow.md`:
   - Use local preview service
   - Capture desktop + mobile snapshots
   - Verify first-screen apparatus visibility, drawer behavior, and auto-demo completion
17. If visual regression has P1/P2 issues, fix and rerun until passing.
18. Run self-correction loop in `references/self-correction-mechanism.md`:
   - If issue type is new, add it to issue taxonomy and checklist
   - If new apparatus/object is created, prepare candidate pattern text but do not backfill yet
   - If an existing apparatus/object is optimized/refined, prepare candidate update text but do not backfill yet
   - Compare the current revision against the previous revision's apparatus/object set; if anything changed, summarize the changes and explicitly ask the user whether to backfill into the apparatus library/references
19. Deliver:
   - Final HTML file
   - Short note of selected apparatus pattern(s)
   - Reuse/newly-created apparatus summary
   - Explicit question: whether to add any newly-created or optimized apparatus/object pattern into skill references
   - Checklist pass/fail notes
   - Visual regression summary (screenshots/report path + pass/fail)
   - Self-correction updates (if any)

## Hard Requirements

- Keep it as a single standalone `.html` file unless user asks otherwise.
- If the page uses runtime primitives/components from `assets/runtime/`, inline them through `scripts/build_runtime_bundle.mjs` so ordering comes from `assets/runtime/manifest.js` rather than manual copy order.
- Keep existing style language: dark stage, top spectrum bar, task card, guided steps.
- Keep guided mode + free mode + auto demo.
- When a step includes complex apparatus sequencing, precision reading, or non-obvious strategy, prefer a top-left hint-lamp popover for detailed guidance instead of overloading the task-card hint.
- Once a hint-lamp pattern is validated within a lab family, keep its visual semantics consistent across later labs: use a pure bulb icon, the same collapsed-by-default placement under mode/status, the same short flash cue for warnings, and the same data-drawer red-flash/unread-badge pairing after records are added.
- Free mode exit must be explicit: in free mode, `步骤重置` should reset the scene/step data without implicitly leaving free mode; only the free-mode toggle should exit free mode.
- Free mode should broaden exploration space when pedagogically useful: allow more apparatus positions, parameter values, and custom record labels than guided mode, as long as the core apparatus interaction stays physically coherent.
- Free-mode custom records/analysis must not weaken or pollute guided-mode textbook record checks; exiting free mode should restore the textbook default state/targets needed for guided progression and auto demo.
- Keep feedback triad: `toast`, `checkmark`, final `modal`.
- Keep realism first: choose apparatus based on actual experiment workflow, not fixed item counts.
- For middle-school labs, textbook experiment page is the primary source of truth; catalog id-name mapping is mandatory.
- For middle-school labs, `references/textbook-experiment-index.json` must be checked before coding, and the selected entry must be recorded in the experiment spec.
- If the JSON index is missing the requested experiment, or the matched JSON entry conflicts with the experiment name/id in `references/初中物理实验目录-2023版摘录.md`, the relevant textbook PDF must be searched before apparatus/steps are drafted.
- Do not invent textbook original text, page numbers, or required apparatus. Use the JSON index and cited reference files only.
- For 八上/八下 entries with non-empty `raw_text`, keep apparatus, steps, and conclusions faithful to the indexed textbook extraction unless the user explicitly asks for an enhanced variant.
- For 九年级 entries marked `需核对` or entries with empty `raw_text`, use the index as a provisional physics constraint only; mark the uncertainty in delivery notes and avoid claiming textbook-level certainty.
- Do not output data-only pages with no meaningful apparatus interaction.
- If textbook gives explicit apparatus and steps, do not add non-essential apparatus or extra process.
- Reuse apparatus/object elements from existing references first; do not invent new apparatus when a reusable pattern exists.
- If new apparatus/object elements are created, do not append to references before asking user.
- After each revision round, ask user whether to add newly-created or optimized apparatus/object patterns to skill references.
- Ensure each step `check()` includes at least one apparatus state/action condition.
- Ensure control/data drawers are drawers and can be moved to avoid occlusion.
- Keep control/data drawers semi-transparent by default so overlapped apparatus or another drawer remains roughly perceivable beneath them; do not make them so opaque that they fully hide covered objects, and do not make them so transparent that text becomes hard to read.
- For data drawers, default to "record without auto-expand": new records must not auto-open the drawer.
- For data drawers, when collapsed and new records arrive, show a prominent blinking red badge with unseen record count.
- For data drawers, opening the drawer must clear the unseen-count badge immediately; if collapsed again, new records must re-trigger the badge.
- Data drawer should focus on record/history content; move live process readouts to control drawer or the related apparatus readout area for in-place observation.
- For boiling/temperature-process labs, keep live process readouts and temperature-time chart in the control drawer (or near instrument readout), and keep the data drawer as record/history-only.
- Result drawer is optional and should be omitted when it does not improve learning flow.
- Default drawer layout policy: place control/data at top-right and collapsed on first load (unless user requests otherwise).
- Keep UI minimal and step-scoped: only reveal secondary cards/panels/quiz blocks at the step where they are needed.
- Visual simplicity does not allow realism downgrades: apparatus geometry, scale marks, connectors, and operation checkpoints must stay close to real classroom setups.
- Ensure apparatus layout runs overlap checks (especially beaker/cylinder/measurement tools).
- For force measurement scenes, reuse verified spring-scale component chain before creating a new gauge.
- For displacement/liquid scenes, use near-full/overflow-ready beaker and conservation-based cylinder update (`ΔV排 -> ΔV量筒`).
- For labs with key target scale values (for example depth `20.0 cm`, angle, or mass marks), keep pass conditions strict to the target mark instead of loose intervals, and add stage-side precision assistance such as snap-to-tick, clickable ruler/rail placement, or target-mark adsorption so learners can land on the exact value reliably.
- For ruler/length-measurement labs, prefer direct stage interaction over button-only measurement: drag the object to zero-mark alignment, then drag a reading guide/cursor to the far end; do not reduce the core workflow to control-panel clicks alone.
- For ruler/length-measurement labs whose displayed unit is `cm`, keep reading/result precision aligned to `0.1 cm` by default unless the textbook explicitly requires a finer division.
- If a page includes a local zoom/readout window for a ruler, the zoomed scale divisions must match the outer ruler's division semantics; do not render a finer physical subdivision in the zoom window than exists on the main ruler.
- Zoom/readout windows should only keep high-value content (local scale, cursor, endpoint, final readout). Avoid low-value helper text inside the zoom window when it reduces legibility.
- For U-tube/manometer style readouts, keep the column difference visually obvious enough to compare key conditions at a glance; preserve monotonic physical trend, but do not let the differential become too subtle to read.
- Keep explicit state flags; do not hide implicit state in DOM only.
- Use `try/catch/finally` around async auto-demo flows and always release UI lock.
- Auto demo must replay guided tasks step-by-step with visible pauses (not rushed), and reach final step/analysis deterministically.
- Auto demo must synchronize the task card step indicator with the currently demonstrated step in real time (for example, call `setStepUI(stepIndex)` at step boundaries), not only after demo completion.
- When challenge/pass conditions are met, the final step indicator dot must switch to completed state (`done`/green) immediately; it must not remain active (`yellow`) after pass.
- During auto demo, the top-left mode label must explicitly show `自动演示`; after demo ends/cancels, restore it to guided/free mode label according to current mode state.
- Auto demo should show a visible cursor path and click feedback; drag gestures in demo must drive the same apparatus state transitions as real pointer drag handlers (not cursor-only animation).
- The auto-demo control button must be a start/exit toggle: show `自动演示` when idle, switch to `退出自动演示` while running, and allow users to click to safely stop the demo and restore interactive UI state.
- Auto demo must validate that each scripted record action is actually persisted to the data table/drawer before proceeding; do not mark completion if required records are missing.
- Auto demo record validation should use per-step pre/post record-length assertions with an explicit failure code (for example, `AUTO_RECORD_NOT_PERSISTED`) and fail-fast recovery.
- During auto demo, keep the control drawer expanded when actions are demonstrated, and reposition drawers to avoid covering key instrument readouts (for example, spring-scale numeric display).
- During auto demo, users must still be able to drag both control/data drawers; do not lock drawer drag handlers or let one drawer block the other's drag hit area.
- In guided mode, enforce step-gated actions: block out-of-order operation/data-recording attempts before prerequisite step completion.
- In guided mode, when an out-of-order action is blocked, switch the current step indicator light from active (yellow) to warning (red) until the learner returns to and passes that step (or resets).
- For apparatus with real pair interaction (for example magnetic poles), keep the physical response active in both guided mode and free mode; guided mode may gate step completion, but must not disable the real attraction/repulsion behavior itself.
- For apparatus pairs that can enter a stable attached state (for example opposite magnetic poles snapping together), implement an explicit snap-lock/attached-state flag so the joined state does not jitter under continuous physics refresh; release the lock only when spacing/orientation conditions are clearly broken.
- For manipulable apparatus (for example, scraper polishing and clamp-handle tightening), core experiment progression must come from direct stage interaction (drag/rotate/slide) instead of control-panel button clicks alone; buttons can provide hints or confirmation, but must not replace the physical operation chain.
- The explanation section title under the stage should use the format: `实验名：<experiment name>`.
- The explanatory block under the experiment title should follow this content order: key operation and observable phenomenon first, then the principle/conclusion as the final point.
- Keep the top spectrum bar and task card on the same width constraint so their visual lengths stay aligned; if either length is adjusted, update both together.
- Keep the top-left HUD minimal by default: show only mode and status tags; do not add a separate experiment-id tag unless the user explicitly requests it.
- Top-left HUD labels should use explicit text prefixes: `模式：...` and `状态：...`.
- Cleanup timers/RAF when resetting or leaving a run.
- After each revision round, run an explicit apparatus-change check; if apparatus/object changed, ask the user whether to add/update the apparatus library entry before backfilling.
- If any apparatus/object was optimized (even without creating a new object), explicitly ask the user whether to sync that optimization into `references/apparatus-patterns.md` and `references/template-catalog.md` before backfilling.
- Use resize/orientation debounced re-layout, not per-event heavy recomputation.
- Visual regression is mandatory before delivery (desktop + mobile, at least initial/data-open/auto-end scenes).
- First screen must show meaningful apparatus objects (not blank/covered by drawers).
- On narrow screens, expanded control/data drawers must not overlap each other.
- Any P1/P2 visual regression issue must be fixed and re-verified before delivery.
- If a new issue type appears, update self-correction references/checklist in the same turn.

## Interaction Rules

- Prefer `pointerdown/pointermove/pointerup/pointercancel`.
- Set `touch-action: none` on stage and draggable elements.
- Use `setPointerCapture` during drag.
- Call `preventDefault()` only when needed to avoid scroll/gesture conflict.
- Keep drag movement in stage bounds (`clamp`).

## State Shape

Use this baseline model:

```js
const state = {
  currentTask: 0,
  completed: false,
  freeMode: false,
  autoPlaying: false,
  draggingId: null,
  rafId: 0,
  timers: new Set(),
  successCooldown: false
};
```

Add experiment-specific fields explicitly.

## Output Quality Bar

- Mobile first: usable on narrow screens without horizontal scroll.
- Smooth drag and animation: no obvious frame drops on normal laptop/phone.
- Robust reset: repeated reset / auto-demo / free-mode toggles should not break state.
- Every task must have a deterministic `check()` condition.
- Panels should not continuously occlude key apparatus or graph areas.

## Reference Map

- Shared structure and reusable conventions: `references/common-patterns.md`
- Textbook/catalog source priority and paths: `references/教材与目录来源索引.md`
- Structured 28-entry middle-school textbook experiment index: `references/textbook-experiment-index.json`
- Middle-school physics id-name mapping index: `references/初中物理实验目录-2023版摘录.md`
- Textbook key-page snippets for quick lookup: `references/教材关键页摘录-初中物理.md`
- Real apparatus and interaction patterns: `references/apparatus-patterns.md`
- Full reusable template catalog: `references/template-catalog.md`
- Reuse-first and accumulation workflow: `references/reuse-and-accumulation-workflow.md`
- Robustness and performance checklist: `references/mobile-smoothness-robustness-checklist.md`
- Visual regression procedure and pass bar: `references/visual-regression-workflow.md`
- Self-correction and continuous improvement loop: `references/self-correction-mechanism.md`
- Experiment input form: `references/experiment-spec-template.md`
- Starting scaffold: `assets/physics-lab-template.html`
- Visual regression helper script: `scripts/visual_regression_capture.mjs`
