# Self-Correction Mechanism

Use this loop to continuously improve the skill after each generation task.

## Trigger

Run when any of these happen:

- visual regression shows new failure pattern
- user feedback identifies missing realism/interaction issues
- repeated fixes appear across multiple files

## Loop

1. Detect
   - Collect failure evidence (screenshot + report + user note).
2. Classify
   - Map to one category:
     - layout/occlusion
     - apparatus realism
     - interaction/gesture
     - auto-demo stability
     - state/reset robustness
3. Decide
   - Is this already covered by existing checklist/pattern?
   - If not covered, mark as `new issue type`.
4. Patch
   - Apply minimal fix in target HTML.
5. Verify
   - Rerun visual regression.
6. Accumulate
   - If `new issue type`:
     - update `references/mobile-smoothness-robustness-checklist.md`
     - update this file's issue taxonomy section
   - If new apparatus/object created:
     - backfill `references/apparatus-patterns.md`
     - update `references/template-catalog.md` if family-level coverage changed

## Issue taxonomy (seed)

- `L1` First-screen apparatus not visible due to drawer occlusion.
- `L2` Mobile control/data drawers overlap when expanded.
- `L3` Desktop drawer default position blocks core apparatus path.
- `A1` Auto-demo ends before final analysis/modal.
- `A2` Auto-demo too fast to observe step semantics.
- `A3` Auto-demo internal flow blocked by self-guard (e.g., `autoPlaying` also blocks internal `runSimulation`/`tryPassStep`).
- `A4` Step check over-coupled to manual gesture state, causing auto-demo to stall despite correct physics outcome.
- `R1` Reset does not clear transient state/timers/locks.

When a new type appears, append with:

- id
- symptom
- likely root cause
- preferred fix pattern
- verification steps

## Preferred fix priority

1. Layout defaults and drawer policy (before changing physics logic).
2. Step check and auto-demo orchestration fixes.
3. Rendering/performance tuning.
4. Apparatus redesign only if behavior remains incorrect.

## Output requirements

When self-correction is triggered, return:

- new issue type(s) added (if any)
- references updated
- rerun verification status
