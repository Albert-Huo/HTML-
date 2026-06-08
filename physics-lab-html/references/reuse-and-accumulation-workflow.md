# Reuse-First and Accumulation Workflow

Use this workflow for every new experiment page.

## Step 1: Define required apparatus

- Lock textbook page and catalog mapping first:
  - textbook experiment page (book + page)
  - directory id-name mapping
- List required apparatus from the real teaching workflow.
- Mark each item as `must-have` or `optional`.

## Step 2: Search reusable patterns first

- Search in:
  - `references/apparatus-patterns.md`
  - `references/template-catalog.md`
  - Existing HTML files in the workspace
- Build a reuse table:
  - apparatus/object
  - chosen source file
  - reusable elements (DOM/CSS/logic/state)
  - adaptation notes
- If the page includes a data drawer, default to reusing the unseen-count notice pattern from `references/common-patterns.md`:
  - record does not auto-expand drawer
  - collapsed drawer shows blinking red unseen-count badge
  - expanding drawer clears badge/count
- If the experiment is a boiling/temperature-process lab, default to reusing the drawerized boiling control pattern from `references/common-patterns.md`:
  - control drawer owns live process readouts + temperature-time chart
  - data drawer keeps record/history rows only
  - auto demo keeps drawers draggable and may reposition them to avoid hiding instrument readouts

## Step 3: Reuse or create decision

- Reuse if a similar pattern covers >= 70% of behavior.
- Create new only when:
  - no existing pattern matches the required workflow, or
  - existing patterns would cause incorrect physics behavior.

## Step 4: Implement with traceability

- For each apparatus/object in code, keep traceability notes:
  - `source: reused from <file/pattern>` or
  - `source: new`
- Keep operation-to-reading mapping explicit:
  - user action -> apparatus state -> measurement -> conclusion.
- For auto-demo flows that include record persistence, keep assertion traceability:
  - per-step pre/post record-length snapshot
  - explicit assertion error code on failure (for example, `AUTO_RECORD_NOT_PERSISTED`)
  - `try/catch/finally` recovery notes (unlock UI + restore mode/status)
- Add layout traceability for key apparatus:
  - overlap-safe placement rule
  - resize/orientation re-layout behavior

## Step 5: Confirmation-gated accumulation when new elements are created

If any new apparatus/object pattern is created:

1. Prepare a candidate backfill section in delivery notes:
   - pattern name
   - apparatus objects
   - state variables
   - operation chain
   - reading chain
   - key functions
   - source file path
2. Ask user explicitly whether to add this new pattern to skill references.
3. Only after user confirms, append section in `references/apparatus-patterns.md`.
4. Only after user confirms, update `references/template-catalog.md` if family coverage changes.

Delivery can complete without backfill if user has not confirmed yet. In that case, keep the candidate pattern note in the response.

## Step 6: Visual-regression-driven accumulation

After implementation:

- Run `references/visual-regression-workflow.md`.
- If regression reveals a new issue type:
  - update `references/self-correction-mechanism.md` taxonomy
  - update `references/mobile-smoothness-robustness-checklist.md` with a concrete check item
- If fix introduces a reusable layout/apparatus pattern:
  - propose backfill candidate in response
  - perform backfill only after explicit user confirmation

## Minimal backfill record template

Use this template in accumulation updates:

```md
## Pattern X: <name>
- Source file: </absolute/path/to/file.html>
- Reuse baseline: <which old pattern was insufficient>
- New apparatus objects:
  - ...
- State variables:
  - ...
- Operation chain:
  1. ...
  2. ...
- Reading chain:
  - ...
- Reuse recommendation:
  - Use when ...
```
