(function initLiquidPressureManometer(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  const DEFAULT_LIQUIDS = Object.freeze({
    water: Object.freeze({ name: '清水', rho: 1000 }),
    salt: Object.freeze({ name: '盐水', rho: 1150 }),
    alcohol: Object.freeze({ name: '酒精', rho: 790 })
  });

  const DEFAULT_DIRECTIONS = Object.freeze({
    side: Object.freeze({ name: '侧向' }),
    down: Object.freeze({ name: '向下' }),
    up: Object.freeze({ name: '向上' })
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function createLiquidPressureManometer({
    liquids = DEFAULT_LIQUIDS,
    directions = DEFAULT_DIRECTIONS,
    currentLiquid = 'water',
    probeDirection = 'side',
    probeDepthCm = 0,
    minDepthCm = 0,
    maxDepthCm = 40,
    depthStepCm = 1,
    depthSnapTargets = [20, 35],
    depthSnapToleranceCm = 1.15,
    strictTargetDepthCm = 20,
    deepCompareMinDepthCm = 35,
    dhScaleCmPerKpa = 2.4
  } = {}) {
    const state = {
      liquids: { ...liquids },
      directions: { ...directions },
      currentLiquid,
      probeDirection,
      probeDepthCm: 0,
      minDepthCm: Number(minDepthCm),
      maxDepthCm: Number(maxDepthCm),
      depthStepCm: Number(depthStepCm),
      depthSnapTargets: [...depthSnapTargets],
      depthSnapToleranceCm: Number(depthSnapToleranceCm),
      strictTargetDepthCm: Number(strictTargetDepthCm),
      deepCompareMinDepthCm: Number(deepCompareMinDepthCm),
      dhScaleCmPerKpa: Number(dhScaleCmPerKpa),
      currentPressureKPa: 0,
      currentDhCm: 0,
      records: [],
      sameDepthCompared: false,
      depthCompared: false,
      densityCompared: false,
      analysisOk: false
    };

    function ensureLiquid(key = state.currentLiquid) {
      if (!state.liquids[key]) {
        throw new Error(`Unknown liquid-pressure liquid: ${key}`);
      }
      return key;
    }

    function ensureDirection(key = state.probeDirection) {
      if (!state.directions[key]) {
        throw new Error(`Unknown probe direction: ${key}`);
      }
      return key;
    }

    function isExactDepth(depthCm, targetCm) {
      return Math.abs(Number(depthCm) - Number(targetCm)) < 0.05;
    }

    function normalizeDepth(depthCm) {
      let next = clamp(Number(depthCm), state.minDepthCm, state.maxDepthCm);
      for (const target of state.depthSnapTargets) {
        if (Math.abs(next - target) <= state.depthSnapToleranceCm) {
          next = target;
          break;
        }
      }
      return clamp(
        Math.round(next / state.depthStepCm) * state.depthStepCm,
        state.minDepthCm,
        state.maxDepthCm
      );
    }

    function computePressure(depthCm = state.probeDepthCm, liquidKey = state.currentLiquid) {
      const liquid = state.liquids[ensureLiquid(liquidKey)];
      const h = Number(depthCm) / 100;
      return liquid.rho * 9.8 * h / 1000;
    }

    function updateReadouts() {
      state.currentPressureKPa = round(
        computePressure(state.probeDepthCm, state.currentLiquid),
        3
      );
      state.currentDhCm = round(state.currentPressureKPa * state.dhScaleCmPerKpa, 2);
    }

    function recordKey(liquidKey, directionKey, depthCm) {
      return `${liquidKey}:${directionKey}:${round(depthCm, 1)}`;
    }

    function findMeasure(liquidKey, directionKey, predicate) {
      return state.records.find((record) => (
        record.kind === 'measure'
        && record.liquid === liquidKey
        && record.direction === directionKey
        && predicate(record)
      ));
    }

    function updateComparisonFlags() {
      const w20Side = findMeasure('water', 'side', (record) => isExactDepth(record.depth, state.strictTargetDepthCm));
      const w20Down = findMeasure('water', 'down', (record) => isExactDepth(record.depth, state.strictTargetDepthCm));
      const w20Up = findMeasure('water', 'up', (record) => isExactDepth(record.depth, state.strictTargetDepthCm));
      const w35Side = findMeasure('water', 'side', (record) => record.depth >= state.deepCompareMinDepthCm);
      const a20Side = findMeasure('alcohol', 'side', (record) => isExactDepth(record.depth, state.strictTargetDepthCm));
      const s20Side = findMeasure('salt', 'side', (record) => isExactDepth(record.depth, state.strictTargetDepthCm));

      const directionSet = [w20Side, w20Down, w20Up].filter(Boolean);
      const directionRange = directionSet.length === 3
        ? Math.max(...directionSet.map((record) => record.pressure)) - Math.min(...directionSet.map((record) => record.pressure))
        : Number.POSITIVE_INFINITY;

      state.sameDepthCompared = !!(w20Side && w20Down && w20Up && directionRange <= 0.02);
      state.depthCompared = !!(w20Side && w35Side && w35Side.pressure > w20Side.pressure);
      state.densityCompared = !!(w20Side && a20Side && s20Side
        && s20Side.pressure > w20Side.pressure
        && w20Side.pressure > a20Side.pressure);
      state.analysisOk = state.sameDepthCompared && state.depthCompared && state.densityCompared;
    }

    function inferNote() {
      if (isExactDepth(state.probeDepthCm, state.strictTargetDepthCm) && state.currentLiquid === 'water') {
        return `同深度方向比较（${state.directions[state.probeDirection].name}）`;
      }
      if (state.currentLiquid === 'water' && state.probeDirection === 'side' && state.probeDepthCm >= state.deepCompareMinDepthCm) {
        return '同液体深度比较';
      }
      if (isExactDepth(state.probeDepthCm, state.strictTargetDepthCm) && state.probeDirection === 'side') {
        return '同深度液体比较';
      }
      return `${state.liquids[state.currentLiquid].name}测量点`;
    }

    function addRecord(row) {
      state.records.push(row);
      updateComparisonFlags();
      return row;
    }

    state.currentLiquid = ensureLiquid(currentLiquid);
    state.probeDirection = ensureDirection(probeDirection);
    state.probeDepthCm = normalizeDepth(probeDepthCm);
    updateReadouts();

    return {
      reset({
        currentLiquid: nextLiquid = 'water',
        probeDirection: nextDirection = 'side',
        probeDepthCm: nextDepth = 0
      } = {}) {
        state.currentLiquid = ensureLiquid(nextLiquid);
        state.probeDirection = ensureDirection(nextDirection);
        state.probeDepthCm = normalizeDepth(nextDepth);
        state.records = [];
        state.sameDepthCompared = false;
        state.depthCompared = false;
        state.densityCompared = false;
        state.analysisOk = false;
        updateReadouts();
        return this.getState();
      },
      normalizeDepth,
      setLiquid(liquidKey) {
        state.currentLiquid = ensureLiquid(liquidKey);
        updateReadouts();
        return this.getVisualState();
      },
      setDirection(directionKey) {
        state.probeDirection = ensureDirection(directionKey);
        updateReadouts();
        return this.getVisualState();
      },
      cycleDirection() {
        if (state.probeDirection === 'side') return this.setDirection('down');
        if (state.probeDirection === 'down') return this.setDirection('up');
        return this.setDirection('side');
      },
      setDepth(depthCm) {
        state.probeDepthCm = normalizeDepth(depthCm);
        updateReadouts();
        return this.getVisualState();
      },
      computePressure,
      measure({ record = true, allowDuplicate = false, note } = {}) {
        updateReadouts();
        const key = recordKey(state.currentLiquid, state.probeDirection, state.probeDepthCm);
        if (record && !allowDuplicate && state.records.some((entry) => entry.measureKey === key)) {
          return {
            accepted: false,
            reason: '该液体、方向和深度的数据已记录过',
            state: this.getVisualState()
          };
        }

        const row = {
          id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          kind: 'measure',
          liquid: state.currentLiquid,
          direction: state.probeDirection,
          depth: round(state.probeDepthCm, 1),
          pressure: round(state.currentPressureKPa, 3),
          dh: round(state.currentDhCm, 2),
          measureKey: key,
          note: note || inferNote()
        };

        if (record) {
          addRecord(row);
        }

        return {
          accepted: true,
          row,
          pressure: this.readPressure(),
          dh: this.readDh()
        };
      },
      analyzeComparisons() {
        updateComparisonFlags();
        const w20Side = findMeasure('water', 'side', (record) => isExactDepth(record.depth, state.strictTargetDepthCm));
        const w20Down = findMeasure('water', 'down', (record) => isExactDepth(record.depth, state.strictTargetDepthCm));
        const w20Up = findMeasure('water', 'up', (record) => isExactDepth(record.depth, state.strictTargetDepthCm));
        const w35Side = findMeasure('water', 'side', (record) => record.depth >= state.deepCompareMinDepthCm);
        const a20Side = findMeasure('alcohol', 'side', (record) => isExactDepth(record.depth, state.strictTargetDepthCm));
        const s20Side = findMeasure('salt', 'side', (record) => isExactDepth(record.depth, state.strictTargetDepthCm));

        if (!(w20Side && w20Down && w20Up && w35Side && a20Side && s20Side)) {
          return {
            accepted: false,
            reason: '关键测量数据不足',
            state: this.getVisualState()
          };
        }

        const directionRange = round(
          Math.max(w20Side.pressure, w20Down.pressure, w20Up.pressure)
            - Math.min(w20Side.pressure, w20Down.pressure, w20Up.pressure),
          3
        );

        return {
          accepted: state.analysisOk,
          sameDepthCompared: state.sameDepthCompared,
          depthCompared: state.depthCompared,
          densityCompared: state.densityCompared,
          directionRange,
          summary: `20.0 cm 清水侧/下/上：${w20Side.pressure.toFixed(2)} / ${w20Down.pressure.toFixed(2)} / ${w20Up.pressure.toFixed(2)} kPa；${w35Side.depth.toFixed(1)} cm 清水侧向：${w35Side.pressure.toFixed(2)} kPa；20.0 cm 侧向盐水/清水/酒精：${s20Side.pressure.toFixed(2)} / ${w20Side.pressure.toFixed(2)} / ${a20Side.pressure.toFixed(2)} kPa。`
        };
      },
      readPressure() {
        updateReadouts();
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.currentPressureKPa,
          format: (value) => `${value.toFixed(2)} kPa`
        });
      },
      readDh() {
        updateReadouts();
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.currentDhCm,
          format: (value) => `${value.toFixed(1)} cm`
        });
      },
      getVisualState() {
        return {
          currentLiquid: state.currentLiquid,
          probeDirection: state.probeDirection,
          probeDepthCm: state.probeDepthCm,
          currentPressureKPa: state.currentPressureKPa,
          currentDhCm: state.currentDhCm,
          recordCount: state.records.length,
          sameDepthCompared: state.sameDepthCompared,
          depthCompared: state.depthCompared,
          densityCompared: state.densityCompared,
          analysisOk: state.analysisOk
        };
      },
      getState() {
        return {
          currentLiquid: state.currentLiquid,
          probeDirection: state.probeDirection,
          probeDepthCm: state.probeDepthCm,
          currentPressureKPa: state.currentPressureKPa,
          currentDhCm: state.currentDhCm,
          records: [...state.records],
          sameDepthCompared: state.sameDepthCompared,
          depthCompared: state.depthCompared,
          densityCompared: state.densityCompared,
          analysisOk: state.analysisOk,
          strictTargetDepthCm: state.strictTargetDepthCm,
          deepCompareMinDepthCm: state.deepCompareMinDepthCm
        };
      }
    };
  }

  components.createLiquidPressureManometer = createLiquidPressureManometer;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createLiquidPressureManometer };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
