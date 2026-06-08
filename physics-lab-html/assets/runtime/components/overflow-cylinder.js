(function initOverflowCylinder(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function createOverflowCylinder({
    defaultLiquidKey = 'water',
    objectVolumeMl = 40,
    cylinderStartMl = 0,
    liquids = {
      water: { name: '清水' }
    }
  } = {}) {
    const state = {
      defaultLiquidKey,
      activeLiquid: defaultLiquidKey,
      objectVolumeMl: Number(objectVolumeMl),
      immersionRatio: 0,
      displacedMl: 0,
      peakDisplacedMl: 0,
      overflowDeltaMl: 0,
      cylinderMl: Number(cylinderStartMl),
      spillMl: Object.fromEntries(
        Object.keys(liquids).map((key) => [key, 0])
      ),
      liquids
    };

    function ensureLiquid(liquidKey = state.defaultLiquidKey) {
      if (!state.liquids[liquidKey]) {
        throw new Error(`Unknown overflow liquid: ${liquidKey}`);
      }
      if (state.spillMl[liquidKey] == null) {
        state.spillMl[liquidKey] = 0;
      }
      return liquidKey;
    }

    function computeDisplacement({
      ratio = state.immersionRatio,
      volumeMl = state.objectVolumeMl
    } = {}) {
      const immersionRatio = round(clamp(Number(ratio), 0, 1), 3);
      const displacedMl = round(Number(volumeMl) * immersionRatio, 1);
      const overflowDeltaMl = round(
        Math.max(0, displacedMl - state.peakDisplacedMl),
        1
      );

      return {
        immersionRatio,
        displacedMl,
        overflowDeltaMl
      };
    }

    function applyDisplacement({
      ratio = state.immersionRatio,
      volumeMl = state.objectVolumeMl,
      liquidKey = state.activeLiquid
    } = {}) {
      const resolvedLiquidKey = ensureLiquid(liquidKey);
      const next = computeDisplacement({ ratio, volumeMl });
      state.activeLiquid = resolvedLiquidKey;
      state.objectVolumeMl = Number(volumeMl);
      state.immersionRatio = next.immersionRatio;
      state.displacedMl = next.displacedMl;
      state.overflowDeltaMl = next.overflowDeltaMl;

      if (next.overflowDeltaMl > 0) {
        state.cylinderMl = round(state.cylinderMl + next.overflowDeltaMl, 1);
        state.spillMl[resolvedLiquidKey] = round(
          (state.spillMl[resolvedLiquidKey] || 0) + next.overflowDeltaMl,
          1
        );
      }

      state.peakDisplacedMl = Math.max(state.peakDisplacedMl, next.displacedMl);

      return {
        activeLiquid: state.activeLiquid,
        immersionRatio: state.immersionRatio,
        displacedMl: state.displacedMl,
        overflowDeltaMl: state.overflowDeltaMl,
        cylinderMl: state.cylinderMl,
        peakDisplacedMl: state.peakDisplacedMl,
        spillMl: { ...state.spillMl }
      };
    }

    return {
      reset({
        cylinderStartMl: nextCylinderStart = 0,
        objectVolumeMl: nextVolume = state.objectVolumeMl,
        liquidKey = state.defaultLiquidKey
      } = {}) {
        ensureLiquid(liquidKey);
        state.activeLiquid = liquidKey;
        state.objectVolumeMl = Number(nextVolume);
        state.immersionRatio = 0;
        state.displacedMl = 0;
        state.peakDisplacedMl = 0;
        state.overflowDeltaMl = 0;
        state.cylinderMl = Number(nextCylinderStart);
        for (const key of Object.keys(state.spillMl)) {
          state.spillMl[key] = 0;
        }
        return this.getState();
      },
      setImmersion({ ratio, volumeMl = state.objectVolumeMl, liquidKey = state.activeLiquid } = {}) {
        return applyDisplacement({ ratio, volumeMl, liquidKey });
      },
      setObjectVolume(volumeMl) {
        state.objectVolumeMl = Number(volumeMl);
        return applyDisplacement({
          ratio: state.immersionRatio,
          volumeMl: state.objectVolumeMl,
          liquidKey: state.activeLiquid
        });
      },
      refill({ liquidKey = state.activeLiquid } = {}) {
        ensureLiquid(liquidKey);
        state.activeLiquid = liquidKey;
        state.immersionRatio = 0;
        state.displacedMl = 0;
        state.peakDisplacedMl = 0;
        state.overflowDeltaMl = 0;
        return this.getState();
      },
      readCylinder() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.cylinderMl,
          format: (value) => `${value.toFixed(1)} mL`
        });
      },
      readDisplacement() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.displacedMl,
          format: (value) => `${value.toFixed(1)} mL`
        });
      },
      readOverflowDelta() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.overflowDeltaMl,
          format: (value) => `${value.toFixed(1)} mL`
        });
      },
      getVisualState() {
        return {
          activeLiquid: state.activeLiquid,
          liquidName: state.liquids[state.activeLiquid]?.name || null,
          immersionRatio: state.immersionRatio,
          displacedMl: state.displacedMl,
          peakDisplacedMl: state.peakDisplacedMl,
          overflowDeltaMl: state.overflowDeltaMl,
          cylinderMl: state.cylinderMl,
          spillMl: { ...state.spillMl },
          cylinder: this.readCylinder(),
          displacement: this.readDisplacement()
        };
      },
      getState() {
        return {
          activeLiquid: state.activeLiquid,
          objectVolumeMl: state.objectVolumeMl,
          immersionRatio: state.immersionRatio,
          displacedMl: state.displacedMl,
          peakDisplacedMl: state.peakDisplacedMl,
          overflowDeltaMl: state.overflowDeltaMl,
          cylinderMl: state.cylinderMl,
          spillMl: { ...state.spillMl }
        };
      }
    };
  }

  components.createOverflowCylinder = createOverflowCylinder;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createOverflowCylinder };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
