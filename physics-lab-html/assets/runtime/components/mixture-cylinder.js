(function initMixtureCylinder(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function createMixtureCylinder({
    initialWaterMl = 50,
    initialAlcoholMl = 50,
    maxMixMl = 110,
    defaultShakeLevel = 3
  } = {}) {
    const state = {
      waterMl: Number(initialWaterMl),
      alcoholMl: Number(initialAlcoholMl),
      mixMl: 0,
      mixWaterMl: 0,
      mixAlcoholMl: 0,
      pouredWater: false,
      pouredAlcohol: false,
      shaken: false,
      mixRead: null,
      maxMixMl: Number(maxMixMl),
      shakeLevel: Number(defaultShakeLevel),
      records: []
    };

    function theoreticalMixMl() {
      return round(state.mixWaterMl + state.mixAlcoholMl, 1);
    }

    function updateMixFlags() {
      state.pouredWater = state.waterMl <= 0.05;
      state.pouredAlcohol = state.alcoholMl <= 0.05;
      if (state.pouredWater) state.waterMl = 0;
      if (state.pouredAlcohol) state.alcoholMl = 0;
      state.mixMl = theoreticalMixMl();
      state.shaken = false;
      state.mixRead = null;
    }

    function pour(kind, amountMl = null) {
      if (kind !== 'water' && kind !== 'alcohol') {
        throw new Error(`Unsupported mixture source: ${kind}`);
      }
      const sourceKey = kind === 'water' ? 'waterMl' : 'alcoholMl';
      const mixKey = kind === 'water' ? 'mixWaterMl' : 'mixAlcoholMl';
      const remaining = state[sourceKey];
      if (remaining <= 0.05) {
        return {
          accepted: false,
          reason: kind === 'water' ? '清水量筒已空。' : '酒精量筒已空。',
          state: this.getVisualState()
        };
      }
      const pourMl = amountMl == null ? remaining : clamp(Number(amountMl) || 0, 0.1, remaining);
      state[sourceKey] = round(Math.max(0, state[sourceKey] - pourMl), 1);
      state[mixKey] = round(Math.min(state.maxMixMl, state[mixKey] + pourMl), 1);
      updateMixFlags();
      return {
        accepted: true,
        amountMl: round(pourMl, 1),
        state: this.getVisualState()
      };
    }

    return {
      reset({
        waterMl = initialWaterMl,
        alcoholMl = initialAlcoholMl
      } = {}) {
        state.waterMl = Number(waterMl);
        state.alcoholMl = Number(alcoholMl);
        state.mixMl = 0;
        state.mixWaterMl = 0;
        state.mixAlcoholMl = 0;
        state.pouredWater = false;
        state.pouredAlcohol = false;
        state.shaken = false;
        state.mixRead = null;
        state.shakeLevel = Number(defaultShakeLevel);
        state.records = [];
        return this.getState();
      },
      setShakeLevel(level) {
        state.shakeLevel = clamp(Number(level) || Number(defaultShakeLevel), 1, 5);
        return this.getVisualState();
      },
      pourWater(amountMl = null) {
        return pour.call(this, 'water', amountMl);
      },
      pourAlcohol(amountMl = null) {
        return pour.call(this, 'alcohol', amountMl);
      },
      shakeAndRead({ shakeLevel = state.shakeLevel } = {}) {
        const hasBoth = state.mixWaterMl > 0.1 && state.mixAlcoholMl > 0.1;
        if (!hasBoth) {
          return {
            accepted: false,
            reason: '需先把清水和酒精都倒入混合量筒。',
            state: this.getVisualState()
          };
        }
        state.shakeLevel = clamp(Number(shakeLevel) || state.shakeLevel, 1, 5);
        state.shaken = true;
        const total = theoreticalMixMl();
        const shrink = round((3 + (5 - state.shakeLevel) * 0.5) * (total / 100), 1);
        state.mixRead = round(total - shrink, 1);
        state.mixMl = state.mixRead;
        return {
          accepted: true,
          mixRead: state.mixRead,
          shrinkMl: round(total - state.mixRead, 1),
          state: this.getVisualState()
        };
      },
      record(step = '步骤') {
        if (state.mixRead === null) {
          return {
            accepted: false,
            reason: '请先摇匀并读数。',
            state: this.getVisualState()
          };
        }
        const theoretical = theoreticalMixMl();
        const row = {
          step,
          waterAlcohol: `水${state.mixWaterMl.toFixed(1)}+酒精${state.mixAlcoholMl.toFixed(1)}`,
          theoreticalMl: theoretical,
          observedMl: state.mixRead,
          conclusion: state.mixRead < theoretical ? '体积缩小' : '无明显变化'
        };
        state.records.push(row);
        if (state.records.length > 80) {
          state.records.shift();
        }
        return {
          accepted: true,
          row
        };
      },
      theoreticalMixMl,
      readSource(kind) {
        const sourceKey = kind === 'water' ? 'waterMl' : 'alcoholMl';
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => round(source[sourceKey], 1),
          format: (value) => `${value.toFixed(1)} mL`
        });
      },
      readMixVolume() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => round(source.mixMl, 1),
          format: (value) => `${value.toFixed(1)} mL`
        });
      },
      readMixRead() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.mixRead == null ? null : round(source.mixRead, 1),
          format: (value) => value == null ? '--' : `${value.toFixed(1)} mL`
        });
      },
      getVisualState() {
        return {
          waterMl: state.waterMl,
          alcoholMl: state.alcoholMl,
          mixMl: state.mixMl,
          mixWaterMl: state.mixWaterMl,
          mixAlcoholMl: state.mixAlcoholMl,
          pouredWater: state.pouredWater,
          pouredAlcohol: state.pouredAlcohol,
          shaken: state.shaken,
          mixRead: state.mixRead,
          theoreticalMl: theoreticalMixMl(),
          shrinkMl: state.mixRead == null ? 0 : round(theoreticalMixMl() - state.mixRead, 1)
        };
      },
      getState() {
        return {
          waterMl: state.waterMl,
          alcoholMl: state.alcoholMl,
          mixMl: state.mixMl,
          mixWaterMl: state.mixWaterMl,
          mixAlcoholMl: state.mixAlcoholMl,
          pouredWater: state.pouredWater,
          pouredAlcohol: state.pouredAlcohol,
          shaken: state.shaken,
          mixRead: state.mixRead,
          maxMixMl: state.maxMixMl,
          shakeLevel: state.shakeLevel,
          records: [...state.records]
        };
      }
    };
  }

  components.createMixtureCylinder = createMixtureCylinder;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createMixtureCylinder };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
