# Physics Lab HTML Workspace Bundle

This directory is the local support bundle for creating standalone physics experiment HTML files from compatible workspace roots:

- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents`
- `/Users/Huo/Library/Mobile Documents/com~apple~TextEdit/Documents`

The legacy global skill entrypoint remains:

`/Users/lx100/.codex/skills/physics-lab-html/SKILL.md`

The workspace-local copy is also valid:

`/Users/Huo/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html/SKILL.md`

When that skill runs in either compatible workspace, all `references/`, `assets/`, and `scripts/` paths should resolve to that workspace's `physics-lab-html` directory. Historical `/Users/lx100/...` source paths in references should be kept as provenance; when working from `/Users/Huo/...`, try the same workspace-relative file under `/Users/Huo/...` first.

## Local Authoring Rule

For new or revised middle-school physics experiment HTML files, default to the UI shell of:

- `/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验35.html`
- `/Users/Huo/Library/Mobile Documents/com~apple~TextEdit/Documents/初中物理实验35.html`

Use it as the visual and interaction baseline: animated spectrum bar, task card, dark stage, minimal HUD, canvas lab area, movable/collapsible control and data drawers, guided mode, free mode, auto demo with visible cursor, record table/chart area, toast, checkmark, completion modal, explanation block, and Web Audio sound support when the experiment has audible phenomena. Keep the shell stable and replace only the apparatus, experiment logic, data schema, chart/readout content, sound synthesis, auto-demo script, and conclusion text unless the experiment truly needs a special layout.

## Contents

- `references/`: textbook indexes, apparatus patterns, checklists, and workflow notes.
- `assets/`: HTML scaffold template and reusable runtime primitives/components.
- `scripts/`: scaffold, runtime bundling, and visual regression helpers.
- `package.json`: local dependency manifest for visual regression tooling.

## Common Commands

Create a scaffold:

```bash
node "physics-lab-html/scripts/create_lab_scaffold.mjs" --out "/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/实验标题.html" --title "实验标题" --group firstWave
```

Run visual regression after installing Playwright locally:

```bash
cd "/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html"
npm i playwright
node scripts/visual_regression_capture.mjs \
  --root "/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents" \
  --out "/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/回归截图-YYYYMMDD" \
  --files "实验标题.html"
```
