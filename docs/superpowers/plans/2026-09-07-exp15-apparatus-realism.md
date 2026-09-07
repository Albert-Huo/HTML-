# Experiment 15 Apparatus Realism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make experiment 15's spring scale, clamp and scraper physically credible, responsive and visually concise without changing its conclusion or four-stage lesson structure.

**Architecture:** Keep the standalone Canvas page and existing state machine. Split the experiment-15 drawing into local helpers, add a stored press-quality/release state, and keep all readings derived from the existing apparatus state.

**Tech Stack:** Standalone HTML, Canvas 2D, vanilla JavaScript, Node.js assertion probe, Playwright CLI.

---

### Task 1: Add a focused failing regression probe

**Files:**
- Create: `../HTML-sources-private/reports/agent-audits/2026-09-07-exp15-apparatus/exp15-apparatus-regression.mjs`
- Test: `physics-middle/初中物理实验15.html`

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const target = resolve(process.argv[2] || 'HTML-/physics-middle/初中物理实验15.html');
const html = readFileSync(target, 'utf8');
assert.match(html, /function drawLab15SpringScale\(/);
assert.match(html, /function drawLab15Clamp\(/);
assert.match(html, /function drawLab15Scraper\(/);
assert.match(html, /pressQuality:/);
assert.match(html, /clampReleased:/);
assert.doesNotMatch(html, /金属块 A\/B · 测量器具：弹簧测力计/);
assert.doesNotMatch(html, /ctx\.fillText\(`打磨进度:/);
assert.doesNotMatch(html, /ctx\.fillText\(`压紧度:/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node HTML-sources-private/reports/agent-audits/2026-09-07-exp15-apparatus/exp15-apparatus-regression.mjs /Users/lx100/.config/superpowers/worktrees/HTML-/exp15-apparatus-realism/physics-middle/初中物理实验15.html`

Expected: FAIL because the drawing helpers and release state do not exist.

### Task 2: Correct the apparatus state and physical operation chain

**Files:**
- Modify: `physics-middle/初中物理实验15.html:1450-1480`
- Modify: `physics-middle/初中物理实验15.html:1845-1890`
- Modify: `physics-middle/初中物理实验15.html:2125-2210`
- Modify: `physics-middle/初中物理实验15.html:2485-2520`
- Modify: `physics-middle/初中物理实验15.html:3125-3210`
- Modify: `physics-middle/初中物理实验15.html:3570-3635`

- [ ] **Step 1: Store press quality independently from the live clamp position**

```js
pressQuality: 0,
clampReleased: false,
```

- [ ] **Step 2: Make clamp release preserve adhesion**

```js
if (ap.clampDone && ap.adhered && ap.clampLevel <= 0.18) {
  ap.pressed = false;
  ap.clampReleased = true;
}
```

- [ ] **Step 3: Require release before pull and compute threshold from stored quality**

```js
if (!ap.clampReleased) {
  showToast('请先向右拖动手柄回松夹具，再进行测力');
  return false;
}
const clampQuality = clamp(ap.pressQuality, 0, 1);
```

- [ ] **Step 4: Make automatic demonstration replay the reverse handle drag**

```js
const start = scenePointToStage(g.clampTrackX + 4, g.clampHandleY);
const end = scenePointToStage(g.clampTrackX + g.clampTrackW - 2, g.clampHandleY);
await dragDemoCursorPath([start, end], 720, pt => applyLab15ClampAtStagePoint(pt.x, pt.y));
```

- [ ] **Step 5: Run the regression probe**

Run: `node HTML-sources-private/reports/agent-audits/2026-09-07-exp15-apparatus/exp15-apparatus-regression.mjs /Users/lx100/.config/superpowers/worktrees/HTML-/exp15-apparatus-realism/physics-middle/初中物理实验15.html`

Expected: Still FAIL until the drawing task is complete.

### Task 3: Redraw and reposition apparatus

**Files:**
- Modify: `physics-middle/初中物理实验15.html:2715-2910`

- [ ] **Step 1: Recalculate a single responsive geometry model**

Define horizontal scale bounds, coaxial hook/cord anchors, clamp jaws/spindle/handle and scraper bounds in `getLab15Layout()` for desktop, 390 px and 320 px widths.

- [ ] **Step 2: Add the local drawing helpers**

```js
function drawLab15Clamp(ctx, g, level) {
  ctx.fillStyle = '#73808c';
  ctx.fillRect(g.clampFrameX, g.clampBaseY, g.clampFrameW, g.clampBaseH);
  ctx.fillRect(g.spindleX, g.axisY - 2, g.spindleW, 4);
  return { x:g.clampHandleX, y:g.clampHandleY };
}

function drawLab15SpringScale(ctx, g, value) {
  const ratio = clamp(value / 10, 0, 1);
  ctx.fillStyle = '#20ad6a';
  ctx.fillRect(g.meterX, g.meterY, g.meterW, g.meterH);
  return { hookX:g.meterHookX, hookY:g.axisY, ratio };
}

function drawLab15Scraper(ctx, g) {
  ctx.fillStyle = '#9b6332';
  ctx.fillRect(state.apparatus.toolX, state.apparatus.toolY, g.toolW, g.toolH * 0.52);
  ctx.fillStyle = '#cbd5dc';
  ctx.fillRect(state.apparatus.toolX - 4, state.apparatus.toolY + g.toolH * 0.5, g.toolW + 8, g.toolH * 0.5);
}
```

- [ ] **Step 3: Remove duplicate bottom labels**

Keep A/B marks on the blocks and concise affordances near the handle only. Do not render progress or apparatus-list text below the clamp.

- [ ] **Step 4: Run the regression probe to verify it passes**

Run: `node HTML-sources-private/reports/agent-audits/2026-09-07-exp15-apparatus/exp15-apparatus-regression.mjs /Users/lx100/.config/superpowers/worktrees/HTML-/exp15-apparatus-realism/physics-middle/初中物理实验15.html`

Expected: PASS.

### Task 4: Validate behavior and responsive presentation

**Files:**
- Test: `physics-middle/初中物理实验15.html`
- Create: `../HTML-sources-private/reports/agent-audits/2026-09-07-exp15-apparatus/`

- [ ] **Step 1: Run static validators**

Run: `node HTML-sources-private/physics-lab-html/scripts/check_lab_html.mjs --target HTML-/physics-middle/初中物理实验15.html`

Run: `node HTML-sources-private/physics-lab-html/scripts/validate_ui_shell.mjs HTML-/physics-middle/初中物理实验15.html`

Expected: both exit 0.

- [ ] **Step 2: Run browser scenarios**

At 1366×768, 390×844 and 320×568 verify original reproduction, drag-to-polish, clamp/release, 3 N and 7 N pulls, reset/repeat, automatic demonstration, safe bounds and console output.

- [ ] **Step 3: Obtain independent post-reviews**

Request physics-fidelity verification and mobile visual QA. Close all P0/P1 findings before delivery.
