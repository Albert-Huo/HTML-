(function initDensityMeasurementBench(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const components = root.components = root.components || {};

  function round(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function cloneRecords(records) {
    return records.map((entry) => ({ ...entry }));
  }

  function createDensityMeasurementBench({
    mode = 'liquid-difference',
    liquidDensity = 1.12,
    emptyCupMass = 80,
    initialSourceLiquidMl = 80,
    targetVolumeMl = 50,
    solidMass = 54,
    baselineMl = 40,
    solidVolumeMl = 20
  } = {}) {
    const state = {
      mode,
      eyeAligned: false,
      analysisOk: false,
      records: [],
      readings: {
        m1: null,
        m2: null,
        m: null,
        V: null,
        V1: null,
        V2: null,
        Vobj: null,
        rho: null
      },
      primaryPlacement: 'home',
      primaryOnScale: false,
      primaryInCylinder: false,
      cylinderMl: 0,
      sourceLiquidMl: initialSourceLiquidMl,
      dropperLoadedMl: 0,
      beakerDocked: false,
      liquidDensity,
      emptyCupMass,
      targetVolumeMl,
      solidMass,
      baselineMl,
      solidVolumeMl
    };

    function resetReadings() {
      state.readings = {
        m1: null,
        m2: null,
        m: null,
        V: null,
        V1: null,
        V2: null,
        Vobj: null,
        rho: null
      };
    }

    function currentLiquidMass() {
      return round(state.emptyCupMass + state.sourceLiquidMl * state.liquidDensity, 2);
    }

    function updateCylinderFromPlacement() {
      if (state.mode === 'solid-displacement') {
        state.cylinderMl = state.primaryInCylinder
          ? round(state.baselineMl + state.solidVolumeMl, 2)
          : state.baselineMl;
      }
    }

    function resetMode(nextMode = mode) {
      state.mode = nextMode;
      state.eyeAligned = false;
      state.analysisOk = false;
      state.records = [];
      state.primaryPlacement = 'home';
      state.primaryOnScale = false;
      state.primaryInCylinder = false;
      state.beakerDocked = false;
      state.dropperLoadedMl = 0;
      state.sourceLiquidMl = state.mode === 'liquid-difference' ? initialSourceLiquidMl : 0;
      state.cylinderMl = state.mode === 'liquid-difference' ? 0 : state.baselineMl;
      resetReadings();
    }

    resetMode(mode);

    return {
      reset({ mode: nextMode = state.mode } = {}) {
        resetMode(nextMode);
        return this.getState();
      },
      setEyeAligned(aligned = true) {
        state.eyeAligned = Boolean(aligned);
        return this.getVisualState();
      },
      placePrimary(target) {
        if (!['home', 'scale', 'cylinder'].includes(target)) {
          throw new RangeError(`Unsupported density target: ${target}`);
        }
        state.primaryPlacement = target;
        state.primaryOnScale = target === 'scale';
        state.primaryInCylinder = state.mode === 'solid-displacement' && target === 'cylinder';
        state.beakerDocked = state.mode === 'liquid-difference' && target === 'cylinder';
        updateCylinderFromPlacement();
        return this.getVisualState();
      },
      pourTo(targetMl) {
        if (state.mode !== 'liquid-difference') {
          return { accepted: false, reason: '当前模式不支持倒液', state: this.getVisualState() };
        }
        if (!state.beakerDocked) {
          return { accepted: false, reason: '请先将烧杯贴到量筒口', state: this.getVisualState() };
        }
        const target = Math.max(state.cylinderMl, Number(targetMl));
        const delta = Math.min(state.sourceLiquidMl, round(target - state.cylinderMl, 2));
        state.sourceLiquidMl = round(state.sourceLiquidMl - delta, 2);
        state.cylinderMl = round(state.cylinderMl + delta, 2);
        return { accepted: true, state: this.getVisualState() };
      },
      loadDropper(amountMl = 1) {
        if (state.mode !== 'liquid-difference') {
          return { accepted: false, reason: '当前模式不支持滴管', state: this.getVisualState() };
        }
        const amount = Math.max(0, Number(amountMl));
        const delta = Math.min(state.sourceLiquidMl, amount);
        state.sourceLiquidMl = round(state.sourceLiquidMl - delta, 2);
        state.dropperLoadedMl = round(state.dropperLoadedMl + delta, 2);
        return { accepted: true, state: this.getVisualState() };
      },
      dispenseDropper() {
        if (state.mode !== 'liquid-difference') {
          return { accepted: false, reason: '当前模式不支持滴管', state: this.getVisualState() };
        }
        if (state.dropperLoadedMl <= 0) {
          return { accepted: false, reason: '滴管中没有液体', state: this.getVisualState() };
        }
        state.cylinderMl = round(state.cylinderMl + state.dropperLoadedMl, 2);
        state.dropperLoadedMl = 0;
        return { accepted: true, state: this.getVisualState() };
      },
      record(kind) {
        if (state.mode === 'liquid-difference') {
          if (kind === 'm1' || kind === 'm2') {
            if (!state.primaryOnScale) {
              return { accepted: false, reason: '请先将烧杯放到天平上', state: this.getVisualState() };
            }
            state.readings[kind] = currentLiquidMass();
          } else if (kind === 'V') {
            if (!state.eyeAligned) {
              return { accepted: false, reason: '请先视线齐平再读数', state: this.getVisualState() };
            }
            state.readings.V = round(state.cylinderMl, 2);
          } else {
            return { accepted: false, reason: `不支持的记录项: ${kind}`, state: this.getVisualState() };
          }
        } else {
          if (kind === 'm') {
            if (!state.primaryOnScale) {
              return { accepted: false, reason: '请先将固体放到天平上', state: this.getVisualState() };
            }
            state.readings.m = state.solidMass;
          } else if (kind === 'V1') {
            if (!state.eyeAligned) {
              return { accepted: false, reason: '请先视线齐平再读数', state: this.getVisualState() };
            }
            state.readings.V1 = round(state.baselineMl, 2);
          } else if (kind === 'V2') {
            if (!state.primaryInCylinder) {
              return { accepted: false, reason: '请先将固体完全浸没', state: this.getVisualState() };
            }
            if (!state.eyeAligned) {
              return { accepted: false, reason: '请先视线齐平再读数', state: this.getVisualState() };
            }
            state.readings.V2 = round(state.cylinderMl, 2);
          } else {
            return { accepted: false, reason: `不支持的记录项: ${kind}`, state: this.getVisualState() };
          }
        }

        const record = { kind, value: state.readings[kind] };
        state.records.push(record);
        return {
          accepted: true,
          record,
          state: this.getVisualState()
        };
      },
      analyze() {
        if (state.mode === 'liquid-difference') {
          const { m1, m2, V } = state.readings;
          if (!(m1 != null && m2 != null && V > 0)) {
            return { accepted: false, reason: '请先完成 m1、V、m2 记录', state: this.getVisualState() };
          }
          state.readings.m = round(m1 - m2, 2);
          state.readings.rho = round(state.readings.m / V, 3);
        } else {
          const { m, V1, V2 } = state.readings;
          if (!(m != null && V1 != null && V2 != null && V2 > V1)) {
            return { accepted: false, reason: '请先完成 V1、m、V2 记录', state: this.getVisualState() };
          }
          state.readings.Vobj = round(V2 - V1, 2);
          state.readings.rho = round(m / state.readings.Vobj, 3);
        }
        state.analysisOk = true;
        return {
          accepted: true,
          rho: state.readings.rho,
          state: this.getVisualState()
        };
      },
      getReadouts() {
        return {
          massOnScale: state.mode === 'liquid-difference'
            ? (state.primaryOnScale ? currentLiquidMass() : null)
            : (state.primaryOnScale ? state.solidMass : null),
          cylinderMl: state.cylinderMl,
          dropperLoadedMl: state.dropperLoadedMl,
          readings: { ...state.readings }
        };
      },
      getVisualState() {
        return {
          mode: state.mode,
          eyeAligned: state.eyeAligned,
          analysisOk: state.analysisOk,
          primaryPlacement: state.primaryPlacement,
          primaryOnScale: state.primaryOnScale,
          primaryInCylinder: state.primaryInCylinder,
          beakerDocked: state.beakerDocked,
          sourceLiquidMl: state.sourceLiquidMl,
          cylinderMl: state.cylinderMl,
          dropperLoadedMl: state.dropperLoadedMl,
          readings: { ...state.readings },
          records: cloneRecords(state.records)
        };
      },
      getState() {
        return {
          ...state,
          readings: { ...state.readings },
          records: cloneRecords(state.records)
        };
      }
    };
  }

  components.createDensityMeasurementBench = createDensityMeasurementBench;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createDensityMeasurementBench };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
