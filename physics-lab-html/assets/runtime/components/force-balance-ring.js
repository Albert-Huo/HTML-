(function initForceBalanceRing(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const components = root.components = root.components || {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function createForceBalanceRing({
    threshold = 0.2,
    offsetScale = 9,
    maxOffset = 56
  } = {}) {
    const state = {
      leftApplied: false,
      rightApplied: false,
      leftN: 0,
      rightN: 0,
      ringOffset: 0,
      balanced: false,
      tests: []
    };

    function cloneTests() {
      return state.tests.map((entry) => ({ ...entry }));
    }

    return {
      reset() {
        state.leftApplied = false;
        state.rightApplied = false;
        state.leftN = 0;
        state.rightN = 0;
        state.ringOffset = 0;
        state.balanced = false;
        state.tests = [];
        return this.getState();
      },
      applyLeft(force) {
        state.leftApplied = true;
        state.leftN = Number(force);
        return {
          accepted: true,
          state: this.getVisualState()
        };
      },
      applyRight(force) {
        if (!state.leftApplied) {
          return {
            accepted: false,
            reason: '请先施加左拉力',
            state: this.getVisualState()
          };
        }
        state.rightApplied = true;
        state.rightN = Number(force);
        return {
          accepted: true,
          state: this.getVisualState()
        };
      },
      observeBalance() {
        if (!(state.leftApplied && state.rightApplied)) {
          return {
            accepted: false,
            reason: '请先施加两侧拉力',
            state: this.getVisualState()
          };
        }
        state.balanced = Math.abs(state.leftN - state.rightN) <= threshold;
        state.ringOffset = clamp((state.rightN - state.leftN) * offsetScale, -maxOffset, maxOffset);
        state.tests.push({
          l: round(state.leftN, 2),
          r: round(state.rightN, 2),
          balanced: state.balanced
        });
        return {
          accepted: true,
          balanced: state.balanced,
          ringOffset: state.ringOffset,
          state: this.getVisualState()
        };
      },
      getObservation() {
        return {
          leftN: state.leftN,
          rightN: state.rightN,
          diffN: round(Math.abs(state.leftN - state.rightN), 2),
          balanced: state.balanced,
          ringOffset: state.ringOffset,
          tests: cloneTests()
        };
      },
      getVisualState() {
        return {
          leftApplied: state.leftApplied,
          rightApplied: state.rightApplied,
          leftN: state.leftN,
          rightN: state.rightN,
          ringOffset: state.ringOffset,
          balanced: state.balanced,
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

  components.createForceBalanceRing = createForceBalanceRing;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createForceBalanceRing };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
