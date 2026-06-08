(function initRelativityObserverBench(globalScope) {
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

  function createRelativityObserverBench({
    mode = 'simultaneity',
    vRatio = 0,
    Lpx = 120,
    cPx = 100,
    hPx = 120,
    properTick = 1
  } = {}) {
    const state = {
      mode,
      vRatio,
      Lpx,
      cPx,
      hPx,
      properTick,
      currentRun: null,
      records: []
    };

    function cloneRecords() {
      return state.records.map((entry) => ({ ...entry }));
    }

    return {
      reset({ mode: nextMode = mode } = {}) {
        state.mode = nextMode;
        state.vRatio = vRatio;
        state.Lpx = Lpx;
        state.cPx = cPx;
        state.hPx = hPx;
        state.properTick = properTick;
        state.currentRun = null;
        state.records = [];
        return this.getState();
      },
      setVelocity(nextRatio) {
        state.vRatio = Math.max(0, Math.min(0.99, Number(nextRatio)));
        return this.getVisualState();
      },
      setLength(nextLength) {
        state.Lpx = Number(nextLength);
        return this.getVisualState();
      },
      setMirrorGap(nextGap) {
        state.hPx = Number(nextGap);
        return this.getVisualState();
      },
      runOnce() {
        const gamma = round(gammaOf(state.vRatio), 4);
        if (state.mode === 'simultaneity') {
          const half = state.Lpx * 0.5;
          const tPlatform = round(half / state.cPx, 4);
          const tTrainBack = round(half / (state.cPx - state.vRatio * state.cPx), 4);
          const tTrainFront = round(half / (state.cPx + state.vRatio * state.cPx), 4);
          state.currentRun = {
            mode: state.mode,
            gamma,
            arrival: {
              platformBack: tPlatform,
              platformFront: tPlatform,
              trainBack: tTrainBack,
              trainFront: tTrainFront
            },
            dtPlatform: 0,
            dtTrain: round(tTrainBack - tTrainFront, 4),
            dtPrime: round((state.vRatio * state.Lpx) / (state.cPx * state.cPx), 4)
          };
        } else {
          const tShip = round((2 * state.hPx / state.cPx) * state.properTick, 4);
          const tEarth = round(gamma * tShip, 4);
          state.currentRun = {
            mode: state.mode,
            gamma,
            tShip,
            tEarth,
            delta: round(tEarth - tShip, 4)
          };
        }
        state.records.push({ ...state.currentRun });
        return { accepted: true, run: { ...state.currentRun }, state: this.getVisualState() };
      },
      getObservation() {
        return {
          mode: state.mode,
          vRatio: state.vRatio,
          currentRun: state.currentRun ? { ...state.currentRun } : null,
          records: cloneRecords()
        };
      },
      getVisualState() {
        return {
          mode: state.mode,
          vRatio: state.vRatio,
          Lpx: state.Lpx,
          hPx: state.hPx,
          currentRun: state.currentRun ? { ...state.currentRun } : null,
          records: cloneRecords()
        };
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

  components.createRelativityObserverBench = createRelativityObserverBench;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createRelativityObserverBench };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
