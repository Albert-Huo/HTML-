(function initFrictionBench(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const components = root.components = root.components || {};

  const DEFAULT_FRICTION = Object.freeze({
    smooth: 0.29,
    rough: 0.56
  });

  function round(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createFrictionBench({
    x = 0,
    y = 0,
    width = 110,
    height = 168,
    maxN = 12,
    defaultSurface = 'smooth',
    defaultNormalN = 3,
    frictionCoefficients = DEFAULT_FRICTION,
    noiseOffsetFn
  } = {}) {
    if (typeof components.createSpringScale !== 'function') {
      throw new Error('friction-bench requires components.createSpringScale');
    }

    const scale = components.createSpringScale({
      x,
      y,
      width,
      height,
      maxN
    });

    const state = {
      surface: defaultSurface,
      normalN: Number(defaultNormalN),
      placed: false,
      pulling: false,
      pullTrace: 0,
      ropeTension: 0,
      lastF: 0,
      lastSurface: defaultSurface,
      lastNormal: Number(defaultNormalN),
      tests: [],
      sameSurfaceCompared: false,
      crossSurfaceCompared: false,
      lastMeasuredKey: ''
    };

    function cloneTests() {
      return state.tests.map((entry) => ({ ...entry }));
    }

    function updateComparisonFlags() {
      const grouped = new Map();
      for (const test of state.tests) {
        const list = grouped.get(test.surface) || [];
        list.push(test);
        grouped.set(test.surface, list);
      }
      state.sameSurfaceCompared = [...grouped.values()].some(
        (list) => new Set(list.map((entry) => entry.normal)).size >= 2
      );
      state.crossSurfaceCompared = new Set(state.tests.map((entry) => entry.surface)).size >= 2;
    }

    function getMeasureKey() {
      return `${state.surface}|${state.normalN}`;
    }

    function computeForce() {
      const mu = frictionCoefficients[state.surface];
      if (typeof mu !== 'number') {
        throw new RangeError(`Unsupported friction surface: ${state.surface}`);
      }
      const noise = typeof noiseOffsetFn === 'function'
        ? Number(noiseOffsetFn({
          surface: state.surface,
          normalN: state.normalN,
          tests: cloneTests()
        })) || 0
        : 0;
      return round(Math.max(0, mu * state.normalN + noise), 2);
    }

    function resetScaleReading() {
      scale.setForce(0);
      state.pulling = false;
      state.pullTrace = 0;
      state.ropeTension = 0;
      state.lastF = 0;
    }

    return {
      reset({
        surface = defaultSurface,
        normalN = defaultNormalN,
        placed = false
      } = {}) {
        state.surface = surface;
        state.normalN = Math.max(0, Number(normalN));
        state.placed = Boolean(placed);
        state.lastSurface = state.surface;
        state.lastNormal = state.normalN;
        state.tests = [];
        state.sameSurfaceCompared = false;
        state.crossSurfaceCompared = false;
        state.lastMeasuredKey = '';
        resetScaleReading();
        return this.getState();
      },
      placeBlock() {
        state.placed = true;
        return {
          accepted: true,
          state: this.getVisualState()
        };
      },
      setSurface(surface) {
        if (!(surface in frictionCoefficients)) {
          throw new RangeError(`Unsupported friction surface: ${surface}`);
        }
        state.surface = surface;
        resetScaleReading();
        return this.getState();
      },
      setNormalForce(value) {
        state.normalN = Math.max(0, Number(value));
        resetScaleReading();
        return this.getState();
      },
      pullRead({ trace = 0.72, mode = 'guided' } = {}) {
        if (!state.placed) {
          return {
            accepted: false,
            reason: '请先放置木块',
            state: this.getVisualState()
          };
        }

        const force = computeForce();
        state.pulling = false;
        state.pullTrace = clamp(Number(trace), 0, 1);
        state.ropeTension = force;
        state.lastF = force;
        state.lastSurface = state.surface;
        state.lastNormal = state.normalN;
        scale.setForce(force);

        const key = getMeasureKey();
        if (key !== state.lastMeasuredKey) {
          state.tests.push({
            surface: state.surface,
            normal: state.normalN,
            f: force,
            mode
          });
          state.lastMeasuredKey = key;
          updateComparisonFlags();
        }

        return {
          accepted: true,
          value: force,
          reading: scale.read(),
          observation: this.getObservation(),
          state: this.getVisualState()
        };
      },
      readForce() {
        return scale.read();
      },
      getObservation() {
        return {
          surface: state.lastSurface,
          normalN: state.lastNormal,
          lastF: state.lastF,
          sameSurfaceCompared: state.sameSurfaceCompared,
          crossSurfaceCompared: state.crossSurfaceCompared,
          tests: cloneTests()
        };
      },
      getVisualState() {
        return {
          placed: state.placed,
          surface: state.surface,
          normalN: state.normalN,
          pullTrace: state.pullTrace,
          ropeTension: state.ropeTension,
          lastF: state.lastF,
          sameSurfaceCompared: state.sameSurfaceCompared,
          crossSurfaceCompared: state.crossSurfaceCompared,
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

  components.createFrictionBench = createFrictionBench;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createFrictionBench };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
