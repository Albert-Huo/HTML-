(function initThermometerReading(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  const DEFAULT_TEMPERATURES = Object.freeze({
    cold: 10,
    room: 25,
    hot: 60
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function createThermometerReading({
    ambientC = 25,
    initialC = ambientC,
    minC = 0,
    maxC = 100,
    temperatures = DEFAULT_TEMPERATURES,
    responseTauSec = 1.4,
    stableThresholdC = 0.35,
    stableHoldSec = 0.9,
    immersedNoiseC = 0.03,
    ambientNoiseC = 0.015,
    randomFn = Math.random
  } = {}) {
    const state = {
      ambientC: Number(ambientC),
      currentC: Number(initialC),
      targetC: Number(initialC),
      minC: Number(minC),
      maxC: Number(maxC),
      temperatures: {
        ...DEFAULT_TEMPERATURES,
        ...temperatures
      },
      responseTauSec: Number(responseTauSec),
      stableThresholdC: Number(stableThresholdC),
      stableHoldSec: Number(stableHoldSec),
      immersedNoiseC: Number(immersedNoiseC),
      ambientNoiseC: Number(ambientNoiseC),
      randomFn,
      immersedKind: null,
      stableTimeSec: 0,
      stable: false,
      lastReadC: null,
      lastNoiseC: 0,
      lastDeltaC: 0,
      readCount: 0,
      stableReadCount: 0
    };

    function resolveTarget(kind = state.immersedKind) {
      if (!kind) {
        return state.ambientC;
      }
      if (state.temperatures[kind] == null) {
        throw new Error(`Unknown thermometer immersion kind: ${kind}`);
      }
      return Number(state.temperatures[kind]);
    }

    function resetStableState() {
      state.stableTimeSec = 0;
      state.stable = false;
    }

    function updateStability(dt) {
      const deltaAbs = Math.abs(state.targetC - state.currentC);
      state.lastDeltaC = round(deltaAbs, 3);
      if (state.immersedKind && deltaAbs <= state.stableThresholdC) {
        state.stableTimeSec = round(state.stableTimeSec + Number(dt), 3);
        state.stable = state.stableTimeSec >= state.stableHoldSec;
        return;
      }
      resetStableState();
    }

    function sampleNoise(explicitNoise) {
      if (typeof explicitNoise === 'number') {
        return explicitNoise;
      }
      const amplitude = state.immersedKind ? state.immersedNoiseC : state.ambientNoiseC;
      return (state.randomFn() - 0.5) * amplitude * 2;
    }

    state.currentC = clamp(state.currentC, state.minC, state.maxC);
    state.targetC = resolveTarget();

    return {
      reset({
        ambientC: nextAmbientC = state.ambientC,
        initialC: nextInitialC = nextAmbientC,
        temperatures: nextTemperatures = state.temperatures
      } = {}) {
        state.ambientC = Number(nextAmbientC);
        state.temperatures = {
          ...DEFAULT_TEMPERATURES,
          ...nextTemperatures
        };
        state.currentC = clamp(Number(nextInitialC), state.minC, state.maxC);
        state.targetC = state.ambientC;
        state.immersedKind = null;
        state.lastReadC = null;
        state.lastNoiseC = 0;
        state.readCount = 0;
        state.stableReadCount = 0;
        resetStableState();
        return this.getState();
      },
      setAmbient(ambientValue) {
        state.ambientC = Number(ambientValue);
        if (!state.immersedKind) {
          state.targetC = state.ambientC;
        }
        resetStableState();
        return this.getVisualState();
      },
      setTargets(nextTemperatures = {}) {
        state.temperatures = {
          ...state.temperatures,
          ...nextTemperatures
        };
        state.targetC = resolveTarget();
        resetStableState();
        return this.getVisualState();
      },
      setResponseTau(responseTauValue) {
        state.responseTauSec = Math.max(0.05, Number(responseTauValue));
        return this.getVisualState();
      },
      setImmersion(kind = null) {
        if (kind != null) {
          resolveTarget(kind);
        }
        state.immersedKind = kind;
        state.targetC = resolveTarget(kind);
        resetStableState();
        return this.getVisualState();
      },
      tick(dt, { noise } = {}) {
        const elapsedSec = Math.max(0, Number(dt) || 0);
        const tauSec = Math.max(0.05, state.responseTauSec);
        const k = elapsedSec <= 0 ? 0 : 1 - Math.exp(-elapsedSec / tauSec);
        const sampledNoise = sampleNoise(noise);
        state.targetC = resolveTarget();
        state.currentC = clamp(
          state.currentC + (state.targetC - state.currentC) * k + sampledNoise,
          state.minC,
          state.maxC
        );
        state.currentC = round(state.currentC, 3);
        state.lastNoiseC = round(sampledNoise, 4);
        updateStability(elapsedSec);
        return this.getVisualState();
      },
      isStable() {
        return state.stable;
      },
      read({ requireStable = true } = {}) {
        if (!state.immersedKind) {
          return {
            accepted: false,
            reason: '请先将温度计浸入液体',
            state: this.getVisualState()
          };
        }
        if (requireStable && !state.stable) {
          return {
            accepted: false,
            reason: '请等待示数稳定后再读数',
            state: this.getVisualState()
          };
        }

        const measuredC = round(state.currentC, 1);
        state.lastReadC = measuredC;
        state.readCount += 1;
        if (state.stable) {
          state.stableReadCount += 1;
        }

        const reading = primitives.measureBinding({
          sourceState: {
            ...state,
            measuredC
          },
          compute: (source) => source.measuredC,
          format: (value) => `${value.toFixed(1)} ℃`
        });

        return {
          accepted: true,
          reading,
          immersedKind: state.immersedKind,
          targetC: round(state.targetC, 1),
          errorC: round(measuredC - state.targetC, 1),
          stable: state.stable
        };
      },
      getVisualState() {
        return {
          ambientC: state.ambientC,
          currentC: state.currentC,
          targetC: state.targetC,
          immersedKind: state.immersedKind,
          stable: state.stable,
          stableTimeSec: state.stableTimeSec,
          lastReadC: state.lastReadC,
          lastNoiseC: state.lastNoiseC,
          lastDeltaC: state.lastDeltaC,
          readCount: state.readCount,
          stableReadCount: state.stableReadCount
        };
      },
      getState() {
        return {
          ambientC: state.ambientC,
          currentC: state.currentC,
          targetC: state.targetC,
          temperatures: { ...state.temperatures },
          responseTauSec: state.responseTauSec,
          stableThresholdC: state.stableThresholdC,
          stableHoldSec: state.stableHoldSec,
          immersedKind: state.immersedKind,
          stableTimeSec: state.stableTimeSec,
          stable: state.stable,
          lastReadC: state.lastReadC,
          lastNoiseC: state.lastNoiseC,
          lastDeltaC: state.lastDeltaC,
          readCount: state.readCount,
          stableReadCount: state.stableReadCount
        };
      }
    };
  }

  components.createThermometerReading = createThermometerReading;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createThermometerReading };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
