const primitives = Object.freeze([
  'primitives/snap.js',
  'primitives/contact.js',
  'primitives/bounce.js',
  'primitives/direction.js',
  'primitives/attach-lock.js',
  'primitives/measure.js',
  'primitives/drag.js',
  'primitives/guided-fsm.js',
  'primitives/auto-demo.js'
]);

const components = Object.freeze([
  'components/adhesion-bench.js',
  'components/boiling-curve-lab.js',
  'components/conductivity-bridge.js',
  'components/density-measurement-bench.js',
  'components/elastic-plastic-bench.js',
  'components/force-balance-ring.js',
  'components/friction-bench.js',
  'components/heat-conduction-race.js',
  'components/inertia-brake-cart.js',
  'components/lever-balance.js',
  'components/liquid-pressure-manometer.js',
  'components/mass-volume-analysis.js',
  'components/magnetic-pole-bench.js',
  'components/mixture-cylinder.js',
  'components/motion-state-bench.js',
  'components/paper-tape-analyzer.js',
  'components/phase-change-bath.js',
  'components/pressure-table.js',
  'components/relativity-observer-bench.js',
  'components/relativistic-runway.js',
  'components/resistance-runway.js',
  'components/scale-reading.js',
  'components/side-hole-jet.js',
  'components/thermometer-reading.js',
  'components/thermal-observation-bench.js',
  'components/stopwatch-timing.js',
  'components/speed-measurement.js',
  'components/spring-scale.js',
  'components/spring-scale-basics.js',
  'components/buoyancy-kit.js',
  'components/overflow-cylinder.js',
  'components/balance-scale.js',
  'components/hammer-tuningfork-ball.js'
]);

const componentDeps = Object.freeze({
  'components/adhesion-bench.js': Object.freeze([
    'components/spring-scale.js'
  ]),
  'components/boiling-curve-lab.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/conductivity-bridge.js': Object.freeze([
    'primitives/snap.js'
  ]),
  'components/density-measurement-bench.js': Object.freeze([]),
  'components/elastic-plastic-bench.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/force-balance-ring.js': Object.freeze([]),
  'components/friction-bench.js': Object.freeze([
    'components/spring-scale.js'
  ]),
  'components/heat-conduction-race.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/inertia-brake-cart.js': Object.freeze([]),
  'components/lever-balance.js': Object.freeze([]),
  'components/liquid-pressure-manometer.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/mass-volume-analysis.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/magnetic-pole-bench.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/mixture-cylinder.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/motion-state-bench.js': Object.freeze([]),
  'components/paper-tape-analyzer.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/phase-change-bath.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/pressure-table.js': Object.freeze([]),
  'components/relativity-observer-bench.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/relativistic-runway.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/resistance-runway.js': Object.freeze([]),
  'components/scale-reading.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/side-hole-jet.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/thermometer-reading.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/thermal-observation-bench.js': Object.freeze([]),
  'components/stopwatch-timing.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/speed-measurement.js': Object.freeze([
    'primitives/measure.js',
    'components/stopwatch-timing.js'
  ]),
  'components/spring-scale.js': Object.freeze([
    'primitives/snap.js',
    'primitives/measure.js'
  ]),
  'components/spring-scale-basics.js': Object.freeze([
    'components/spring-scale.js'
  ]),
  'components/buoyancy-kit.js': Object.freeze([
    'primitives/snap.js',
    'primitives/measure.js',
    'components/spring-scale.js'
  ]),
  'components/overflow-cylinder.js': Object.freeze([
    'primitives/measure.js'
  ]),
  'components/balance-scale.js': Object.freeze([
    'primitives/snap.js',
    'primitives/measure.js'
  ]),
  'components/hammer-tuningfork-ball.js': Object.freeze([
    'primitives/snap.js',
    'primitives/contact.js',
    'primitives/bounce.js',
    'primitives/direction.js',
    'primitives/attach-lock.js',
    'primitives/measure.js',
    'primitives/drag.js'
  ])
});

const loadOrder = Object.freeze([
  ...new Set([...primitives, ...components])
]);

const firstWave = Object.freeze([
  'primitives/snap.js',
  'components/adhesion-bench.js',
  'components/boiling-curve-lab.js',
  'components/conductivity-bridge.js',
  'components/density-measurement-bench.js',
  'components/elastic-plastic-bench.js',
  'components/force-balance-ring.js',
  'components/friction-bench.js',
  'primitives/contact.js',
  'primitives/bounce.js',
  'primitives/direction.js',
  'primitives/attach-lock.js',
  'primitives/measure.js',
  'components/heat-conduction-race.js',
  'components/inertia-brake-cart.js',
  'components/lever-balance.js',
  'components/liquid-pressure-manometer.js',
  'components/mass-volume-analysis.js',
  'components/magnetic-pole-bench.js',
  'components/mixture-cylinder.js',
  'components/motion-state-bench.js',
  'components/paper-tape-analyzer.js',
  'components/phase-change-bath.js',
  'components/pressure-table.js',
  'components/relativity-observer-bench.js',
  'components/relativistic-runway.js',
  'components/resistance-runway.js',
  'components/scale-reading.js',
  'components/side-hole-jet.js',
  'components/thermometer-reading.js',
  'components/thermal-observation-bench.js',
  'components/stopwatch-timing.js',
  'components/speed-measurement.js',
  'components/spring-scale.js',
  'components/spring-scale-basics.js',
  'components/buoyancy-kit.js',
  'components/overflow-cylinder.js',
  'components/balance-scale.js',
  'primitives/drag.js',
  'primitives/guided-fsm.js',
  'primitives/auto-demo.js',
  'components/hammer-tuningfork-ball.js'
]);

module.exports = Object.freeze({
  primitives,
  components,
  componentDeps,
  loadOrder,
  firstWave
});
