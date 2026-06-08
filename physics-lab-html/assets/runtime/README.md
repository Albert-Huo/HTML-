# Runtime Bundle Notes

- Runtime primitives and components live under `assets/runtime/` and stay separate from `references/`.
- Browser-facing runtime files are bundled in the order declared by [manifest.js](/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html/assets/runtime/manifest.js).
- The first-phase shell template reserves a dedicated `physicsRuntimeBundle` slot for those inlined files.
- Components assume their required primitives appear earlier in the same bundle; the manifest is the source of truth for that order.
- Machine-readable apparatus-pattern to runtime-family aliases live in [runtime-family-map.json](/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html/assets/runtime/runtime-family-map.json); Markdown references stay human-oriented.
- Default assembly path for new lab pages:
  - `node "/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html/scripts/build_runtime_bundle.mjs" --html /abs/path/lab.html --group firstWave`
- Default scaffold path for a brand-new single-file lab:
  - `node "/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html/scripts/create_lab_scaffold.mjs" --out /abs/path/实验.html --title 实验标题 --group firstWave`
- Default spec-driven scaffold path when you already have a small structured spec:
  - `node "/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html/scripts/create_lab_from_spec.mjs" --spec /abs/path/spec.json --out /abs/path/实验.html`
- When a lab only needs known covered families, prefer explicit component selection so the bundle still comes from the manifest instead of hand-ordering files:
  - `node "/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html/scripts/build_runtime_bundle.mjs" --html /abs/path/lab.html --components adhesion-bench,boiling-curve-lab,conductivity-bridge,density-measurement-bench,elastic-plastic-bench,force-balance-ring,friction-bench,heat-conduction-race,inertia-brake-cart,lever-balance,magnetic-pole-bench,mass-volume-analysis,mixture-cylinder,motion-state-bench,paper-tape-analyzer,phase-change-bath,pressure-table,relativity-observer-bench,relativistic-runway,resistance-runway,side-hole-jet,liquid-pressure-manometer,scale-reading,thermometer-reading,thermal-observation-bench,stopwatch-timing,speed-measurement,overflow-cylinder,buoyancy-kit,balance-scale,spring-scale,spring-scale-basics,hammer-tuningfork-ball`
  - `node "/Users/lx100/Library/Mobile Documents/com~apple~TextEdit/Documents/physics-lab-html/scripts/create_lab_scaffold.mjs" --out /abs/path/实验.html --components adhesion-bench,boiling-curve-lab,conductivity-bridge,density-measurement-bench,elastic-plastic-bench,force-balance-ring,friction-bench,heat-conduction-race,inertia-brake-cart,lever-balance,magnetic-pole-bench,mass-volume-analysis,mixture-cylinder,motion-state-bench,paper-tape-analyzer,phase-change-bath,pressure-table,relativity-observer-bench,relativistic-runway,resistance-runway,side-hole-jet,liquid-pressure-manometer,scale-reading,thermometer-reading,thermal-observation-bench,stopwatch-timing,speed-measurement,overflow-cylinder,buoyancy-kit,balance-scale,spring-scale,spring-scale-basics,hammer-tuningfork-ball`
- Minimal spec shape for automatic family selection:
```json
{
  "labTitle": "实验10",
  "apparatusPatterns": ["Pattern C"]
}
```
