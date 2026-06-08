(function initSideHoleJet(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function createSideHoleJet({
    depthCm = 12,
    minDepthCm = 5,
    maxDepthCm = 35,
    depthStepCm = 1,
    jetBaseCm = 8,
    jetPerDepthCm = 1.35
  } = {}) {
    const state = {
      minDepthCm: Number(minDepthCm),
      maxDepthCm: Number(maxDepthCm),
      depthStepCm: Number(depthStepCm),
      currentDepthCm: 0,
      holeOpened: false,
      openDepthCm: null,
      lastDepthCm: 0,
      lastJetCm: 0,
      lastPressureKPa: 0,
      observations: [],
      jetBaseCm: Number(jetBaseCm),
      jetPerDepthCm: Number(jetPerDepthCm)
    };

    function normalizeDepth(value) {
      return clamp(
        Math.round(Number(value) / state.depthStepCm) * state.depthStepCm,
        state.minDepthCm,
        state.maxDepthCm
      );
    }

    function computePressure(depthValueCm = state.currentDepthCm) {
      return Number(depthValueCm) * 0.098;
    }

    function computeJetDistance(depthValueCm = state.currentDepthCm) {
      return state.jetBaseCm + Number(depthValueCm) * state.jetPerDepthCm;
    }

    state.currentDepthCm = normalizeDepth(depthCm);
    state.lastDepthCm = state.currentDepthCm;

    return {
      reset({ depthCm: nextDepth = depthCm } = {}) {
        state.currentDepthCm = normalizeDepth(nextDepth);
        state.holeOpened = false;
        state.openDepthCm = null;
        state.lastDepthCm = state.currentDepthCm;
        state.lastJetCm = 0;
        state.lastPressureKPa = 0;
        state.observations = [];
        return this.getState();
      },
      setDepth(depthValueCm) {
        state.currentDepthCm = normalizeDepth(depthValueCm);
        return this.getVisualState();
      },
      openHole(depthValueCm = state.currentDepthCm) {
        state.currentDepthCm = normalizeDepth(depthValueCm);
        state.holeOpened = true;
        state.openDepthCm = state.currentDepthCm;
        state.lastDepthCm = state.currentDepthCm;
        return this.getVisualState();
      },
      observeJet({ record = true } = {}) {
        if (!state.holeOpened) {
          return {
            accepted: false,
            reason: '请先打开对应深度的侧孔',
            state: this.getVisualState()
          };
        }
        if (state.openDepthCm == null || Math.abs(state.currentDepthCm - state.openDepthCm) > 0.1) {
          state.holeOpened = false;
          return {
            accepted: false,
            reason: '孔深已变化，请重新打开对应侧孔',
            state: this.getVisualState()
          };
        }

        state.lastDepthCm = state.openDepthCm;
        state.lastJetCm = round(computeJetDistance(state.openDepthCm), 1);
        state.lastPressureKPa = round(computePressure(state.openDepthCm), 2);

        const row = {
          id: `jet_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          depthCm: state.lastDepthCm,
          jetDistanceCm: state.lastJetCm,
          pressureKPa: state.lastPressureKPa
        };

        if (record) {
          state.observations.push(row);
        }

        return {
          accepted: true,
          row,
          jet: this.readJetDistance(),
          pressure: this.readPressure()
        };
      },
      readJetDistance() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.lastJetCm,
          format: (value) => `${value.toFixed(1)} cm`
        });
      },
      readPressure() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.lastPressureKPa,
          format: (value) => `${value.toFixed(2)} kPa`
        });
      },
      getVisualState() {
        return {
          currentDepthCm: state.currentDepthCm,
          holeOpened: state.holeOpened,
          openDepthCm: state.openDepthCm,
          lastDepthCm: state.lastDepthCm,
          lastJetCm: state.lastJetCm,
          lastPressureKPa: state.lastPressureKPa,
          observationCount: state.observations.length
        };
      },
      getState() {
        return {
          currentDepthCm: state.currentDepthCm,
          holeOpened: state.holeOpened,
          openDepthCm: state.openDepthCm,
          lastDepthCm: state.lastDepthCm,
          lastJetCm: state.lastJetCm,
          lastPressureKPa: state.lastPressureKPa,
          observations: [...state.observations]
        };
      }
    };
  }

  components.createSideHoleJet = createSideHoleJet;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createSideHoleJet };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
