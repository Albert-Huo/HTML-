(function initPressureTable(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const components = root.components = root.components || {};

  const AREA_MAP = Object.freeze({
    small: 8,
    large: 20
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function createPressureTable({
    defaultForceN = 15,
    defaultArea = 'large',
    depthScale = 6.5,
    minSinkDepth = 1.2,
    maxSinkDepth = 36,
    settleRate = 0.03,
    noiseOffsetFn
  } = {}) {
    const state = {
      forceN: Number(defaultForceN),
      area: defaultArea,
      pressed: false,
      sinkDepth: 0,
      targetSinkDepth: 0,
      lastP: 0,
      lastArea: AREA_MAP[defaultArea],
      lastForce: Number(defaultForceN),
      tests: []
    };

    function cloneTests() {
      return state.tests.map((entry) => ({ ...entry }));
    }

    function currentAreaCm2() {
      const area = AREA_MAP[state.area];
      if (!area) {
        throw new RangeError(`Unsupported pressure area: ${state.area}`);
      }
      return area;
    }

    function computePressure(forceN, areaCm2) {
      const noise = typeof noiseOffsetFn === 'function'
        ? Number(noiseOffsetFn({
          forceN,
          areaCm2,
          tests: cloneTests()
        })) || 0
        : 0;
      return Math.max(0, round((forceN / (areaCm2 * 1e-4)) / 1000 + noise, 2));
    }

    function isStable() {
      return Math.abs((state.sinkDepth || 0) - (state.targetSinkDepth || 0)) <= 0.45;
    }

    return {
      reset({
        forceN = defaultForceN,
        area = defaultArea
      } = {}) {
        state.forceN = Number(forceN);
        state.area = area;
        state.pressed = false;
        state.sinkDepth = 0;
        state.targetSinkDepth = 0;
        state.lastP = 0;
        state.lastArea = AREA_MAP[defaultArea];
        state.lastForce = Number(forceN);
        state.tests = [];
        return this.getState();
      },
      setForce(forceN) {
        state.forceN = Number(forceN);
        return this.getState();
      },
      setArea(area) {
        if (!(area in AREA_MAP)) {
          throw new RangeError(`Unsupported pressure area: ${area}`);
        }
        state.area = area;
        return this.getState();
      },
      applyPressure() {
        state.lastForce = state.forceN;
        state.lastArea = currentAreaCm2();
        state.pressed = true;
        state.targetSinkDepth = round(
          clamp((state.lastForce / state.lastArea) * depthScale, minSinkDepth, maxSinkDepth),
          1
        );
        if (state.sinkDepth <= 0) {
          state.sinkDepth = minSinkDepth;
        }
        return {
          accepted: true,
          targetSinkDepth: state.targetSinkDepth,
          state: this.getVisualState()
        };
      },
      tick(dtMs = 16) {
        if (!state.pressed) {
          return this.getVisualState();
        }
        const prev = state.sinkDepth;
        const ratio = Math.min(1, Math.max(0, Number(dtMs) * settleRate));
        state.sinkDepth = round(prev + (state.targetSinkDepth - prev) * ratio, 2);
        if (Math.abs(state.sinkDepth - state.targetSinkDepth) < 0.04) {
          state.sinkDepth = state.targetSinkDepth;
        }
        return this.getVisualState();
      },
      readPressure() {
        if (!state.pressed) {
          return {
            accepted: false,
            reason: '请先压放小桌',
            state: this.getVisualState()
          };
        }
        state.lastForce = state.forceN;
        state.lastArea = currentAreaCm2();
        state.lastP = computePressure(state.lastForce, state.lastArea);
        return {
          accepted: true,
          value: state.lastP,
          state: this.getVisualState()
        };
      },
      recordObservation(sceneLabel = '') {
        if (!isStable()) {
          return {
            accepted: false,
            reason: '请等待海绵形变稳定后再记录',
            state: this.getVisualState()
          };
        }
        const deform = round(state.targetSinkDepth, 1);
        if (deform <= 0.2) {
          return {
            accepted: false,
            reason: '请先摆放好小桌并等待海绵形变稳定',
            state: this.getVisualState()
          };
        }
        const record = {
          scene: sceneLabel,
          force: state.lastForce,
          area: state.lastArea,
          deform
        };
        state.tests.push(record);
        return {
          accepted: true,
          record,
          state: this.getVisualState()
        };
      },
      getObservation() {
        return {
          forceN: state.lastForce,
          areaCm2: state.lastArea,
          pressureKPa: state.lastP,
          sinkDepth: state.sinkDepth,
          targetSinkDepth: state.targetSinkDepth,
          stable: isStable(),
          tests: cloneTests()
        };
      },
      getVisualState() {
        return {
          forceN: state.forceN,
          area: state.area,
          pressed: state.pressed,
          sinkDepth: state.sinkDepth,
          targetSinkDepth: state.targetSinkDepth,
          lastP: state.lastP,
          lastArea: state.lastArea,
          lastForce: state.lastForce,
          stable: isStable(),
          tests: cloneTests()
        };
      },
      getState() {
        return {
          ...state,
          stable: isStable(),
          tests: cloneTests()
        };
      }
    };
  }

  components.createPressureTable = createPressureTable;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createPressureTable };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
