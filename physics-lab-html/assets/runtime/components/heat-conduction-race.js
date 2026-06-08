(function initHeatConductionRace(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  const DEFAULT_RODS = Object.freeze([
    Object.freeze({ key: 'copper', label: '铜棒', speed: 2.6, threshold: 80 }),
    Object.freeze({ key: 'iron', label: '铁棒', speed: 1.25, threshold: 80 }),
    Object.freeze({ key: 'glass', label: '玻璃棒', speed: 0.22, threshold: 80 })
  ]);

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function cloneRods(rods) {
    return rods.map((rod) => ({ ...rod }));
  }

  function createHeatConductionRace({
    rods = DEFAULT_RODS,
    progressRateScale = 22.8
  } = {}) {
    const rodList = cloneRods(rods);
    const state = {
      rods: rodList,
      heating: false,
      elapsedSec: 0,
      progress: Object.fromEntries(rodList.map((rod) => [rod.key, 0])),
      dropped: Object.fromEntries(rodList.map((rod) => [rod.key, false])),
      dropOrder: [],
      dropTimeSec: Object.fromEntries(rodList.map((rod) => [rod.key, null])),
      progressRateScale: Number(progressRateScale)
    };

    function rodByKey(rodKey) {
      const rod = state.rods.find((entry) => entry.key === rodKey);
      if (!rod) {
        throw new Error(`Unknown conduction rod: ${rodKey}`);
      }
      return rod;
    }

    return {
      reset() {
        state.heating = false;
        state.elapsedSec = 0;
        state.dropOrder = [];
        for (const rod of state.rods) {
          state.progress[rod.key] = 0;
          state.dropped[rod.key] = false;
          state.dropTimeSec[rod.key] = null;
        }
        return this.getState();
      },
      setHeating(on) {
        state.heating = !!on;
        return this.getVisualState();
      },
      tick(dt) {
        const elapsed = Math.max(0, Number(dt) || 0);
        if (!state.heating || elapsed <= 0) {
          return this.getVisualState();
        }

        state.elapsedSec = round(state.elapsedSec + elapsed, 3);
        for (const rod of state.rods) {
          if (state.progress[rod.key] < 100) {
            state.progress[rod.key] = Math.min(
              100,
              round(state.progress[rod.key] + rod.speed * state.progressRateScale * elapsed, 3)
            );
          }
          if (!state.dropped[rod.key] && state.progress[rod.key] >= rod.threshold) {
            state.dropped[rod.key] = true;
            state.dropOrder.push(rod.key);
            state.dropTimeSec[rod.key] = state.elapsedSec;
          }
        }
        return this.getVisualState();
      },
      readDropTime(rodKey) {
        rodByKey(rodKey);
        if (state.dropTimeSec[rodKey] == null) {
          return {
            accepted: false,
            reason: '该材料尚未达到掉落阈值',
            state: this.getVisualState()
          };
        }
        return {
          accepted: true,
          reading: primitives.measureBinding({
            sourceState: state,
            compute: (source) => source.dropTimeSec[rodKey],
            format: (value) => `${value.toFixed(3)} s`
          })
        };
      },
      getDropOrder() {
        return [...state.dropOrder];
      },
      getFastestRod() {
        return state.dropOrder[0] || null;
      },
      getVisualState() {
        return {
          heating: state.heating,
          elapsedSec: state.elapsedSec,
          dropOrder: [...state.dropOrder],
          fastestRod: state.dropOrder[0] || null,
          rods: state.rods.map((rod) => ({
            key: rod.key,
            label: rod.label,
            progress: state.progress[rod.key],
            dropped: state.dropped[rod.key],
            dropTimeSec: state.dropTimeSec[rod.key]
          }))
        };
      },
      getState() {
        return {
          heating: state.heating,
          elapsedSec: state.elapsedSec,
          progress: { ...state.progress },
          dropped: { ...state.dropped },
          dropOrder: [...state.dropOrder],
          dropTimeSec: { ...state.dropTimeSec },
          rods: cloneRods(state.rods),
          progressRateScale: state.progressRateScale
        };
      }
    };
  }

  components.createHeatConductionRace = createHeatConductionRace;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createHeatConductionRace };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
