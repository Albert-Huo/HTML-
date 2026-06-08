# Visual Regression Workflow

Use this workflow after every new page creation or refactor.

## Goal

- Detect visual and interaction regressions early.
- Ensure mobile/desktop usability before delivery.
- Provide reproducible screenshot/report evidence.

## Required matrix

- Files: all changed experiment HTML files.
- Viewports:
  - Desktop: `1366x768`
  - Mobile: `390x844`
- Scenes (minimum):
  - `initial`: first screen after load
  - `data_open`: data drawer expanded
  - `auto_end`: auto-demo end state (final modal visible)

## Local preview service

Run from experiment workspace:

```bash
cd "/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents"
python3 -m http.server 8787
```

Use URLs like:

- `http://127.0.0.1:8787/初中物理实验14.html`

Stop service with `Ctrl + C`.

## Recommended automation

- Script: `scripts/visual_regression_capture.mjs`
- Output:
  - screenshots directory
  - `report.json` including:
    - per-file/per-viewport run status
    - auto-demo completion
    - drawer overlap metrics

Example command:

```bash
cd "/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html"
npm i playwright
node scripts/visual_regression_capture.mjs \
  --root "/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents" \
  --out "/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/回归截图-YYYYMMDD" \
  --files "初中物理实验14.html,初中物理实验15.html"
```

## Manual review checklist

- First-screen apparatus visibility:
  - main apparatus should be visible without opening drawers
  - no blank stage caused by drawer occlusion
- Drawer behavior:
  - control/data drawers can drag and collapse
  - on narrow screens, expanded drawers do not overlap each other
- Auto-demo:
  - runs to final step and final modal
  - no obvious rushed skipping
- Readability:
  - key labels/readouts not clipped
  - important controls tappable on mobile

## Severity and actions

- `P1` (blocking):
  - first-screen apparatus hidden/blank
  - auto-demo cannot finish
  - drawer overlap blocks interaction on mobile
- `P2` (major):
  - severe clipping/overflow
  - frequent occlusion of core apparatus area
- `P3` (minor):
  - style inconsistencies or minor spacing issues

Delivery rule:

- No delivery with unresolved `P1/P2`.
- Fix -> rerun visual regression -> confirm.

## Evidence to return

- Screenshot path
- Report path (`report.json`)
- Findings list with severity + file path
- Fix summary and rerun result
