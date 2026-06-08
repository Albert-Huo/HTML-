(function initInertiaBrakeCart(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const components = root.components = root.components || {};

  function round(value, digits = 1) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function createInertiaBrakeCart({
    quickFactor = 4.4,
    slowFactor = 1.8,
    quickBrakeProgress = 1,
    slowBrakeProgress = 0.56,
    noiseOffsetFn
  } = {}) {
    const state = {
      moving: false,
      cartX: 0.18,
      launchSpeed: 0,
      blockSlip: 0,
      brakeProgress: 0,
      lastSpeedLevel: 0,
      lastMode: 'slow',
      slowObserved: false,
      quickObserved: false,
      tests: []
    };

    function cloneTests() {
      return state.tests.map((entry) => ({ ...entry }));
    }

    function computeSlip(mode, speed) {
      const base = (mode === 'quick' ? quickFactor : slowFactor) * speed;
      const noise = typeof noiseOffsetFn === 'function'
        ? Number(noiseOffsetFn({
          mode,
          speed,
          tests: cloneTests()
        })) || 0
        : 0;
      return Math.max(0, round(base + noise, 1));
    }

    return {
      reset() {
        state.moving = false;
        state.cartX = 0.18;
        state.launchSpeed = 0;
        state.blockSlip = 0;
        state.brakeProgress = 0;
        state.lastSpeedLevel = 0;
        state.lastMode = 'slow';
        state.slowObserved = false;
        state.quickObserved = false;
        state.tests = [];
        return this.getState();
      },
      launchCart(speedLevel) {
        state.moving = true;
        state.cartX = 0.14;
        state.launchSpeed = Number(speedLevel);
        state.brakeProgress = 0;
        return {
          accepted: true,
          state: this.getVisualState()
        };
      },
      testInertia(stopMode) {
        if (!state.moving) {
          return {
            accepted: false,
            reason: '请先发车',
            state: this.getVisualState()
          };
        }
        const speed = Number(state.launchSpeed);
        const mode = stopMode === 'quick' ? 'quick' : 'slow';
        state.blockSlip = computeSlip(mode, speed);
        state.lastMode = mode;
        state.lastSpeedLevel = speed;
        state.brakeProgress = mode === 'quick' ? quickBrakeProgress : slowBrakeProgress;
        state.tests.push({
          mode,
          speed,
          slip: state.blockSlip
        });
        if (mode === 'slow') state.slowObserved = true;
        if (mode === 'quick') state.quickObserved = true;
        state.moving = false;
        state.cartX = 0.82;
        return {
          accepted: true,
          slip: state.blockSlip,
          state: this.getVisualState()
        };
      },
      getObservation() {
        return {
          lastMode: state.lastMode,
          lastSpeedLevel: state.lastSpeedLevel,
          blockSlip: state.blockSlip,
          slowObserved: state.slowObserved,
          quickObserved: state.quickObserved,
          tests: cloneTests()
        };
      },
      getVisualState() {
        return {
          moving: state.moving,
          cartX: state.cartX,
          brakeProgress: state.brakeProgress,
          blockSlip: state.blockSlip,
          lastMode: state.lastMode,
          lastSpeedLevel: state.lastSpeedLevel,
          slowObserved: state.slowObserved,
          quickObserved: state.quickObserved,
          tests: cloneTests()
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

  components.createInertiaBrakeCart = createInertiaBrakeCart;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createInertiaBrakeCart };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
