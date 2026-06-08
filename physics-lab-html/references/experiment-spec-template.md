# Experiment Spec Template

Use this input template before generating a new lab page.

## Basic

- Lab title:
- Target grade:
- Physics concept:
- Core learning outcome:
- Textbook source (book + page):
- Catalog source (id + name from directory):

## Textbook index constraints (required for middle-school labs)

- Matched index entry (`references/textbook-experiment-index.json` id + title):
- Match basis (explicit id / exact title / near title / topic):
- Confidence status (direct textbook extraction / provisional `需核对` / no match):
- Indexed apparatus to preserve:
- Indexed formulas to preserve:
- Indexed steps to preserve:
- Indexed observations/conclusions to preserve:
- `raw_text` evidence summary:
- Items that require user/textbook verification before claiming textbook certainty:

## PDF fallback evidence (required when index is missing or mismatched)

- Trigger reason (no JSON match / JSON-catalog mismatch / provisional index / insufficient evidence):
- Catalog experiment requested (id + name from `references/初中物理实验目录-2023版摘录.md`):
- Textbook PDF searched:
- Search method (text search / page inspection / OCR / not available):
- PDF page(s) or location checked:
- Evidence found:
- How PDF evidence changes or confirms the JSON constraints:
- Unresolved items that must stay marked `需核对`:

## Apparatus first (required)

- Real teaching workflow for this experiment:
- Required apparatus (must-have):
- Optional apparatus (nice-to-have):
- Why each required apparatus is necessary:
- Chosen apparatus pattern(s) from `references/apparatus-patterns.md`:
- Differences from textbook apparatus/steps (if any, must justify):

## Reuse-first mapping (required)

- Reused apparatus/object sources (file path + pattern):
- Reused force-measurement source (if applicable, e.g. spring scale from `牛顿第三定律演示.html`):
- Reused UI interaction sources (drag/drop/drawer/chart):
- What is newly created (only if unavoidable):
- Why existing patterns are insufficient for each new item:
- Accumulation backfill plan:
  - Add/update section in `references/apparatus-patterns.md`:
  - Add/update family note in `references/template-catalog.md`:

## Step tasks (guided mode)

1. Step 1 text:
   - Hint:
   - Pass condition (`check()`):
2. Step 2 text:
   - Hint:
   - Pass condition (`check()`):
3. Step 3 text:
   - Hint:
   - Pass condition (`check()`):

## Operation chain and state mapping

- Step-by-step operation chain (prepare -> operate -> read -> record -> conclude):
- Apparatus state variables:
- Which user actions change which apparatus states:
- Which apparatus states produce which readings:
- Error tolerance / measurement noise model:

## Entities and interactions

- Interactive objects:
- Drag/click/slider controls:
- Bounds and constraints:
- Simulation equations or logical rules:

## Panels and layout (drawer requirement)

- Control panel drawer:
  - Default position:
  - Draggable:
  - Collapsible:
  - Edge snap:
- Data panel drawer:
  - Default position:
  - Draggable:
  - Collapsible:
  - Edge snap:
- Result panel drawer:
  - Default position:
  - Draggable:
  - Collapsible:
  - Edge snap:
- Occlusion avoidance strategy:
- Apparatus overlap safety plan (beaker/cylinder/measurement tools):

## Modes and feedback

- Free mode behavior:
- Auto demo script:
- Auto demo step pacing (per-step pause/observation duration):
- Error toast style:
- Completion modal text:

## Mobile and performance constraints

- Minimum supported screen width:
- Max object count:
- Target interaction smoothness:
- Any special orientation handling:
- If liquid displacement exists: conservation mapping (`ΔV排 -> ΔV量筒`) and near-full/overflow-ready beaker setup:
