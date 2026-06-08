(function initBuoyancyKit(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  const DEFAULT_LIQUIDS = Object.freeze({
    water: Object.freeze({ name: '清水', rho: 1000 }),
    salt: Object.freeze({ name: '盐水', rho: 1150 })
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function normalizeNegativeZero(value) {
    return Object.is(value, -0) ? 0 : value;
  }

  function createBuoyancyKit({
    airWeightN = 2.2,
    selectedVolumeMl = 20,
    selectedLiquidKey = 'water',
    liquids = DEFAULT_LIQUIDS,
    scaleX = 0,
    scaleY = 0,
    scaleWidth = 110,
    scaleHeight = 168,
    scaleMaxN = 8
  } = {}) {
    if (typeof components.createSpringScale !== 'function') {
      throw new Error('createBuoyancyKit requires components.createSpringScale');
    }

    const scale = components.createSpringScale({
      x: scaleX,
      y: scaleY,
      width: scaleWidth,
      height: scaleHeight,
      maxN: Math.max(scaleMaxN, airWeightN)
    });

    const state = {
      airWeightN: Number(airWeightN),
      selectedVolumeMl: Number(selectedVolumeMl),
      selectedLiquidKey,
      activeLiquid: null,
      liquids,
      immersionRatio: 0,
      displacedMl: 0,
      buoyancyN: 0,
      apparentN: Number(airWeightN),
      currentDepthCm: 0,
      inLiquid: false,
      fullySubmerged: false
    };

    function getLiquid(liquidKey = state.selectedLiquidKey) {
      const liquid = state.liquids[liquidKey];
      if (!liquid) {
        throw new Error(`Unknown buoyancy liquid: ${liquidKey}`);
      }
      return liquid;
    }

    function computeBuoyancy({
      ratio = state.immersionRatio,
      volumeMl = state.selectedVolumeMl,
      liquidKey = state.selectedLiquidKey,
      depthCm = state.currentDepthCm
    } = {}) {
      const clampedRatio = round(clamp(Number(ratio), 0, 1), 3);
      const displacedMl = round(volumeMl * clampedRatio, 1);
      const inLiquid = clampedRatio > 0.01;
      const fullySubmerged = clampedRatio >= 0.999;

      if (!inLiquid) {
        return {
          selectedLiquidKey: liquidKey,
          activeLiquid: null,
          liquidName: null,
          immersionRatio: clampedRatio,
          displacedMl: 0,
          buoyancyN: 0,
          apparentN: round(state.airWeightN, 3),
          currentDepthCm: 0,
          inLiquid: false,
          fullySubmerged: false,
          airDiffN: 0
        };
      }

      const liquid = getLiquid(liquidKey);
      const buoyancyN = round(liquid.rho * 9.8 * displacedMl * 1e-6, 3);
      const apparentN = round(clamp(state.airWeightN - buoyancyN, 0, state.airWeightN), 3);

      return {
        selectedLiquidKey: liquidKey,
        activeLiquid: liquidKey,
        liquidName: liquid.name,
        immersionRatio: clampedRatio,
        displacedMl,
        buoyancyN,
        apparentN: normalizeNegativeZero(apparentN),
        currentDepthCm: inLiquid ? Number(depthCm) : 0,
        inLiquid,
        fullySubmerged,
        airDiffN: round(state.airWeightN - apparentN, 3)
      };
    }

    function applyComputed(nextState) {
      state.selectedLiquidKey = nextState.selectedLiquidKey;
      state.activeLiquid = nextState.activeLiquid;
      state.immersionRatio = nextState.immersionRatio;
      state.displacedMl = nextState.displacedMl;
      state.buoyancyN = nextState.buoyancyN;
      state.apparentN = nextState.apparentN;
      state.currentDepthCm = nextState.currentDepthCm;
      state.inLiquid = nextState.inLiquid;
      state.fullySubmerged = nextState.fullySubmerged;
      scale.setForce(state.apparentN);
      return nextState;
    }

    scale.setForce(state.airWeightN);

    return {
      reset({
        selectedVolumeMl: nextVolume = state.selectedVolumeMl,
        selectedLiquidKey: nextLiquidKey = state.selectedLiquidKey
      } = {}) {
        state.selectedVolumeMl = Number(nextVolume);
        state.selectedLiquidKey = nextLiquidKey;
        return applyComputed(computeBuoyancy({
          ratio: 0,
          volumeMl: state.selectedVolumeMl,
          liquidKey: state.selectedLiquidKey,
          depthCm: 0
        }));
      },
      setLiquid(liquidKey) {
        getLiquid(liquidKey);
        state.selectedLiquidKey = liquidKey;
        return applyComputed(computeBuoyancy({
          ratio: state.immersionRatio,
          volumeMl: state.selectedVolumeMl,
          liquidKey,
          depthCm: state.currentDepthCm
        }));
      },
      setVolume(volumeMl) {
        state.selectedVolumeMl = Number(volumeMl);
        return applyComputed(computeBuoyancy({
          ratio: state.immersionRatio,
          volumeMl: state.selectedVolumeMl,
          liquidKey: state.selectedLiquidKey,
          depthCm: state.currentDepthCm
        }));
      },
      setImmersion({ ratio, liquidKey = state.selectedLiquidKey, depthCm = state.currentDepthCm } = {}) {
        state.selectedLiquidKey = liquidKey;
        return applyComputed(computeBuoyancy({
          ratio,
          volumeMl: state.selectedVolumeMl,
          liquidKey,
          depthCm
        }));
      },
      computeBuoyancy,
      readDisplacement() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.displacedMl,
          format: (value) => `${value.toFixed(1)} mL`
        });
      },
      readForce() {
        return scale.read();
      },
      readBuoyancy() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.buoyancyN,
          format: (value) => `${value.toFixed(3)} N`
        });
      },
      getScale() {
        return scale;
      },
      snapLoad(options) {
        return scale.snapLoad(options);
      },
      getVisualState() {
        return {
          airWeightN: state.airWeightN,
          selectedVolumeMl: state.selectedVolumeMl,
          selectedLiquidKey: state.selectedLiquidKey,
          activeLiquid: state.activeLiquid,
          immersionRatio: state.immersionRatio,
          displacedMl: state.displacedMl,
          buoyancyN: state.buoyancyN,
          apparentN: state.apparentN,
          currentDepthCm: state.currentDepthCm,
          inLiquid: state.inLiquid,
          fullySubmerged: state.fullySubmerged,
          force: this.readForce(),
          displacement: this.readDisplacement(),
          scale: scale.getVisualState()
        };
      },
      getState() {
        return {
          airWeightN: state.airWeightN,
          selectedVolumeMl: state.selectedVolumeMl,
          selectedLiquidKey: state.selectedLiquidKey,
          activeLiquid: state.activeLiquid,
          immersionRatio: state.immersionRatio,
          displacedMl: state.displacedMl,
          buoyancyN: state.buoyancyN,
          apparentN: state.apparentN,
          currentDepthCm: state.currentDepthCm,
          inLiquid: state.inLiquid,
          fullySubmerged: state.fullySubmerged
        };
      }
    };
  }

  components.createBuoyancyKit = createBuoyancyKit;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createBuoyancyKit };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
