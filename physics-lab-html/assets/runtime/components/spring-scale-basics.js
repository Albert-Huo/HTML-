(function initSpringScaleBasics(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const components = root.components = root.components || {};

  function round(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createSpringScaleBasics({
    x = 0,
    y = 0,
    width = 110,
    height = 168,
    maxN = 12,
    gravity = 9.8,
    defaultMass = 0.3,
    minMass = 0,
    maxMass = 1.5,
    noiseOffsetFn
  } = {}) {
    const state = {
      x,
      y,
      width,
      height,
      maxN,
      gravity,
      minMass,
      maxMass,
      mass: clamp(Number(defaultMass), minMass, maxMass),
      zeroed: false,
      hung: false,
      lastN: 0,
      lastMass: 0,
      hangMass: 0,
      needRehang: false,
      tests: []
    };

    function requireScale() {
      if (typeof components.createSpringScale !== 'function') {
        throw new Error('spring-scale-basics requires components.createSpringScale');
      }
      return components.createSpringScale({
        x,
        y,
        width,
        height,
        maxN
      });
    }

    const scale = requireScale();

    function cloneTests() {
      return state.tests.map((entry) => ({ ...entry }));
    }

    function syncScale(force = 0) {
      scale.setForce(force);
    }

    function readForceValue(mass) {
      const noise = typeof noiseOffsetFn === 'function'
        ? Number(noiseOffsetFn({
          mass,
          tests: cloneTests()
        })) || 0
        : 0;
      return round(Math.max(0, mass * state.gravity + noise), 2);
    }

    return {
      reset({ mass = defaultMass } = {}) {
        state.mass = clamp(Number(mass), state.minMass, state.maxMass);
        state.zeroed = false;
        state.hung = false;
        state.lastN = 0;
        state.lastMass = 0;
        state.hangMass = 0;
        state.needRehang = false;
        state.tests = [];
        syncScale(0);
        return this.getState();
      },
      setMass(value) {
        const nextMass = clamp(Number(value), state.minMass, state.maxMass);
        const changed = Math.abs(nextMass - state.mass) > 0.0001;
        state.mass = nextMass;
        if (changed && state.hung) {
          state.needRehang = true;
          state.hung = false;
          state.lastN = 0;
          syncScale(0);
        }
        return this.getState();
      },
      zeroScale() {
        state.zeroed = true;
        state.hung = false;
        state.lastN = 0;
        state.needRehang = false;
        syncScale(0);
        return {
          accepted: true,
          state: this.getVisualState()
        };
      },
      hangWeight() {
        if (!state.zeroed) {
          return {
            accepted: false,
            reason: '请先调零',
            state: this.getVisualState()
          };
        }
        state.hung = true;
        state.lastMass = state.mass;
        state.hangMass = state.mass;
        state.needRehang = false;
        state.lastN = 0;
        syncScale(0);
        return {
          accepted: true,
          mass: state.mass,
          state: this.getVisualState()
        };
      },
      readForce() {
        if (state.needRehang) {
          return {
            accepted: false,
            reason: '质量已改变，请重新挂重物后再读数',
            state: this.getVisualState()
          };
        }
        if (!state.hung) {
          return {
            accepted: false,
            reason: state.zeroed ? '请先挂重物' : '请先调零',
            state: this.getVisualState()
          };
        }
        if (Math.abs(state.mass - state.hangMass) > 0.0001) {
          state.needRehang = true;
          state.hung = false;
          state.lastN = 0;
          syncScale(0);
          return {
            accepted: false,
            reason: '质量已改变，请重新挂重物后再读数',
            state: this.getVisualState()
          };
        }

        state.lastMass = state.mass;
        state.lastN = readForceValue(state.lastMass);
        state.tests.push({
          m: state.lastMass,
          n: state.lastN
        });
        syncScale(state.lastN);

        return {
          accepted: true,
          value: state.lastN,
          reading: scale.read(),
          state: this.getVisualState()
        };
      },
      read() {
        return scale.read();
      },
      getVisualState() {
        return {
          mass: state.mass,
          zeroed: state.zeroed,
          hung: state.hung,
          hangMass: state.hangMass,
          lastMass: state.lastMass,
          lastN: state.lastN,
          needRehang: state.needRehang,
          tests: cloneTests(),
          scale: scale.getVisualState()
        };
      },
      getState() {
        return {
          ...state,
          tests: cloneTests()
        };
      }
    };
  }

  components.createSpringScaleBasics = createSpringScaleBasics;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createSpringScaleBasics };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
