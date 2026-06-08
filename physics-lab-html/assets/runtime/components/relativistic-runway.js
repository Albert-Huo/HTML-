(function initRelativisticRunway(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const components = root.components = root.components || {};

  function round(value, digits = 4) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function gammaOf(vRatio) {
    const beta2 = Math.min(0.999999, vRatio * vRatio);
    return 1 / Math.sqrt(1 - beta2);
  }

  function createRelativisticRunway({
    vRatio = 0.2,
    pulseLevel = 2
  } = {}) {
    const state = {
      vRatio,
      pulseLevel,
      currentRun: null,
      speedShare: 0,
      records: []
    };

    function cloneRecords() {
      return state.records.map((entry) => ({ ...entry }));
    }

    return {
      reset() {
        state.vRatio = vRatio;
        state.pulseLevel = pulseLevel;
        state.currentRun = null;
        state.speedShare = 0;
        state.records = [];
        return this.getState();
      },
      setVelocity(nextRatio) {
        state.vRatio = Math.max(0, Math.min(0.99, Number(nextRatio)));
        return this.getVisualState();
      },
      setPulseLevel(level) {
        state.pulseLevel = Math.max(1, Number(level));
        return this.getVisualState();
      },
      launchPulse() {
        state.speedShare = round(Math.max(0.02, 1 - state.vRatio * state.vRatio), 4);
        const dv = round(0.08 * state.pulseLevel * state.speedShare, 4);
        const vStart = state.vRatio;
        state.vRatio = Math.min(0.999, round(state.vRatio + dv, 4));
        state.currentRun = {
          vStart: round(vStart, 4),
          vEnd: state.vRatio,
          dv,
          pulseLevel: state.pulseLevel,
          speedShare: state.speedShare,
          energyEnd: round(gammaOf(state.vRatio), 4)
        };
        state.records.push({ ...state.currentRun });
        return { accepted: true, run: { ...state.currentRun }, state: this.getVisualState() };
      },
      getObservation() {
        return {
          vRatio: state.vRatio,
          pulseLevel: state.pulseLevel,
          speedShare: state.speedShare,
          currentRun: state.currentRun ? { ...state.currentRun } : null,
          records: cloneRecords()
        };
      },
      getVisualState() {
        return this.getObservation();
      },
      getState() {
        return {
          ...state,
          currentRun: state.currentRun ? { ...state.currentRun } : null,
          records: cloneRecords()
        };
      }
    };
  }

  components.createRelativisticRunway = createRelativisticRunway;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createRelativisticRunway };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
