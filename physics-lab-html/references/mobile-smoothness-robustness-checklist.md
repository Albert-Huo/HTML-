# Mobile, Smoothness, Robustness Checklist

Use this checklist before delivering any new lab HTML.

## Mobile usability

- [ ] Include viewport meta: `width=device-width, initial-scale=1, maximum-scale=1`.
- [ ] Stage width is responsive and does not overflow horizontally.
- [ ] Touch targets are comfortably tappable (prefer >= 36px).
- [ ] Stage allows vertical page scrolling on mobile, typically `touch-action: pan-y pinch-zoom`.
- [ ] Canvas either allows vertical page scrolling (`touch-action: pan-y pinch-zoom`) or, if vertical/two-axis apparatus dragging requires `touch-action: none`, provides an empty-area page-pan fallback.
- [ ] Set `touch-action: none` without fallback only on small dedicated gesture handles where page scrolling is not expected.
- [ ] Drag interaction works by finger on mobile and mouse on desktop.
- [ ] Handle `resize` and `orientationchange` with debounced re-layout.
- [ ] Prevent accidental multi-touch/gesture conflict where needed.

## Apparatus realism

- [ ] Experiment id-name matches official directory mapping.
- [ ] Textbook page for this experiment is identified and cited in build notes.
- [ ] Required apparatus for this experiment are present and visible on first screen.
- [ ] Readings are produced by apparatus state/action, not detached random data.
- [ ] Guided tasks require real apparatus operations, not slider-only interaction.
- [ ] Auto demo replays the same apparatus operation chain that users perform.
- [ ] If force measurement exists, spring scale reuses verified component chain (`lcd-screen/spring-coil/hook-assembly`).
- [ ] For liquid-displacement labs, beaker state is near-full or overflow-ready (not half-filled static display).
- [ ] Liquid-to-cylinder mapping is conservation-based (`ΔV排 -> ΔV量筒`), not detached animation.

## Reuse-first and accumulation

- [ ] Reuse mapping is completed with source files/patterns before coding.
- [ ] Existing apparatus/object patterns are reused when behavior overlap is high.
- [ ] New apparatus/object is created only when reuse is insufficient for correct physics workflow.
- [ ] Any new apparatus/object pattern is backfilled to `references/apparatus-patterns.md`.
- [ ] If reusable family coverage changes, `references/template-catalog.md` is updated before delivery.
- [ ] When spring scale is needed, `牛顿第三定律演示.html` is checked before inventing a new scale widget.

## Drawer panels and occlusion

- [ ] Control/data/result panels are drawers (draggable + collapsible).
- [ ] Drawer drag supports mouse and touch pointer.
- [ ] Drawer has edge snap behavior and predictable z-order.
- [ ] Main apparatus interaction zone is not permanently occluded by drawers.
- [ ] On narrow screens, drawer layout switches to a non-occluding fallback.
- [ ] Apparatus layout includes overlap checks (especially beaker/cylinder/measurement tools).

## Smoothness

- [ ] Use a single animation loop per simulation (`requestAnimationFrame`).
- [ ] Cancel old RAF before starting a new run.
- [ ] Avoid layout thrashing in move handlers.
- [ ] Prefer `transform` updates for visual motion.
- [ ] Keep per-frame computation O(n) and small for object count used.
- [ ] Debounce non-critical expensive updates on resize.

## Robustness

- [ ] Keep explicit state flags (`autoPlaying`, `freeMode`, `completed`, etc.).
- [ ] Guard all action buttons when auto demo is active.
- [ ] Internal auto-demo actions are not blocked by the same UI guards (e.g., `autoPlaying` should block user input, not internal run/pass calls).
- [ ] Ensure reset path clears timers, RAF, temporary CSS classes, and locks.
- [ ] Wrap async auto-demo in `try/catch/finally`.
- [ ] Never swallow errors silently; at minimum log context and unlock UI.
- [ ] Step progression uses deterministic checks, not visual guesswork only.
- [ ] Auto-demo path does not depend on manual-only gesture states (or provides deterministic internal equivalents).
- [ ] Repeated toggles (`free mode` on/off, reset, auto demo) remain stable.
- [ ] Auto demo includes per-step observation pauses (recommended >= 700ms key pause), not continuous rushed motion.
- [ ] Auto demo reaches final guided step and conclusion every run (no mid-flow stall).

## Regression sanity run

- [ ] Guided mode completes all steps in order.
- [ ] Free mode bypasses step gating but keeps simulation valid.
- [ ] Auto demo can run from fresh reset and does not deadlock.
- [ ] Final modal can open and close repeatedly.
- [ ] No console exceptions in normal interaction flow.

## Visual regression required

- [ ] Run desktop + mobile visual regression with:
  - initial first-screen screenshot
  - data drawer expanded screenshot
  - auto-demo end-state screenshot
- [ ] First screen has visible apparatus objects (not blank and not fully covered by drawers).
- [ ] On narrow screens, expanded control/data drawers do not overlap each other.
- [ ] Auto-demo reaches final modal in both desktop and mobile.
- [ ] Save screenshot/report paths in delivery notes.

## Self-correction follow-up

- [ ] If a new failure type appears, update `references/self-correction-mechanism.md` taxonomy.
- [ ] If failure indicates new reusable apparatus/layout pattern, backfill `references/apparatus-patterns.md`.
- [ ] Re-run visual regression after fixes and confirm no remaining P1/P2 issue.
