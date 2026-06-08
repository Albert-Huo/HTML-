(function initMotionStateBench(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const components = root.components = root.components || {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function createMotionStateBench() {
    const state = {
      beforeV: 0,
      afterV: 0,
      velocity: 0,
      cartX: 0.18,
      records: []
    };

    function cloneRecords() {
      return state.records.map((entry) => ({ ...entry }));
    }

    return {
      reset() {
        state.beforeV = 0;
        state.afterV = 0;
        state.velocity = 0;
        state.cartX = 0.18;
        state.records = [];
        return this.getState();
      },
      applyMotionForce({ dir = 'forward', mag = 1, duration = 1 } = {}) {
        const sign = dir === 'backward' ? -1 : 1;
        state.beforeV = round(state.velocity, 2);
        const dv = sign * Number(mag) * Number(duration) * 0.45;
        state.velocity = round(clamp(state.velocity + dv, -6, 6), 2);
        state.afterV = state.velocity;
        state.cartX = round(clamp(state.cartX + state.velocity * 0.012, 0.08, 0.92), 3);
        const record = {
          dir,
          mag: Number(mag),
          duration: Number(duration),
          beforeV: state.beforeV,
          afterV: state.afterV
        };
        state.records.push(record);
        return { accepted: true, record, state: this.getVisualState() };
      },
      getObservation() {
        return {
          beforeV: state.beforeV,
          afterV: state.afterV,
          velocity: state.velocity,
          cartX: state.cartX,
          records: cloneRecords()
        };
      },
      getVisualState() {
        return this.getObservation();
      },
      getState() {
        return {
          ...state,
          records: cloneRecords()
        };
      }
    };
  }

  components.createMotionStateBench = createMotionStateBench;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createMotionStateBench };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
