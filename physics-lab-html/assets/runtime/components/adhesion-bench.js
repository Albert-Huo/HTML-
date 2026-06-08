(function initAdhesionBench(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const components = root.components = root.components || {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function createAdhesionBench({
    scrapeThreshold = 88,
    clampThreshold = 0.82,
    x = 0,
    y = 0,
    width = 110,
    height = 168,
    maxN = 8
  } = {}) {
    if (typeof components.createSpringScale !== 'function') {
      throw new Error('adhesion-bench requires components.createSpringScale');
    }

    const scale = components.createSpringScale({
      x,
      y,
      width,
      height,
      maxN
    });

    const state = {
      leftPolish: 0,
      rightPolish: 0,
      scrapeProgress: 0,
      scraped: false,
      clampLevel: 0,
      pressed: false,
      pullN: 0,
      adhered: false,
      separated: false,
      lastThreshold: 0,
      tests: []
    };

    function cloneTests() {
      return state.tests.map((entry) => ({ ...entry }));
    }

    function polishRatio() {
      return (clamp(state.leftPolish, 0, 100) + clamp(state.rightPolish, 0, 100)) / 200;
    }

    function refreshPreparationState() {
      state.scrapeProgress = round((clamp(state.leftPolish, 0, 100) + clamp(state.rightPolish, 0, 100)) * 0.5, 1);
      if (!state.scraped && state.leftPolish >= scrapeThreshold && state.rightPolish >= scrapeThreshold) {
        state.scraped = true;
      }
      const ready = state.scraped && state.clampLevel >= clampThreshold;
      if (ready) {
        state.pressed = true;
        if (!state.separated) {
          state.adhered = true;
        }
      } else if (!state.separated) {
        state.pressed = false;
        state.adhered = false;
      }
    }

    function computeThreshold() {
      return round(
        2.0 + 2.2 * polishRatio() + 2.0 * clamp(state.clampLevel, 0, 1) + (state.pressed ? 0.6 : 0),
        1
      );
    }

    return {
      reset() {
        state.leftPolish = 0;
        state.rightPolish = 0;
        state.scrapeProgress = 0;
        state.scraped = false;
        state.clampLevel = 0;
        state.pressed = false;
        state.pullN = 0;
        state.adhered = false;
        state.separated = false;
        state.lastThreshold = 0;
        state.tests = [];
        scale.setForce(0);
        return this.getState();
      },
      polishFace(side, delta = 50) {
        if (side !== 'left' && side !== 'right') {
          throw new RangeError(`Unsupported adhesion side: ${side}`);
        }
        const key = side === 'left' ? 'leftPolish' : 'rightPolish';
        state[key] = clamp(state[key] + Number(delta), 0, 100);
        refreshPreparationState();
        return this.getVisualState();
      },
      setClampLevel(level) {
        state.clampLevel = clamp(Number(level), 0, 1);
        if (state.separated && state.clampLevel < clampThreshold) {
          state.pressed = false;
        }
        refreshPreparationState();
        return this.getVisualState();
      },
      pullTest(forceN) {
        if (!state.scraped || !state.pressed) {
          return {
            accepted: false,
            reason: '请先完成打磨并压紧样件',
            state: this.getVisualState()
          };
        }

        state.pullN = Number(forceN);
        state.lastThreshold = computeThreshold();
        scale.setForce(state.pullN);

        if (state.pullN >= state.lastThreshold) {
          state.separated = true;
          state.adhered = false;
          state.pressed = false;
          state.clampLevel = 0;
        } else {
          state.separated = false;
          state.adhered = state.scraped && state.pressed;
        }

        state.tests.push({
          pullN: state.pullN,
          threshold: state.lastThreshold,
          separated: state.separated
        });

        return {
          accepted: true,
          separated: state.separated,
          threshold: state.lastThreshold,
          reading: scale.read(),
          state: this.getVisualState()
        };
      },
      readForce() {
        return scale.read();
      },
      getObservation() {
        return {
          scrapeProgress: state.scrapeProgress,
          clampLevel: state.clampLevel,
          pullN: state.pullN,
          adhered: state.adhered,
          separated: state.separated,
          threshold: state.lastThreshold,
          tests: cloneTests()
        };
      },
      getVisualState() {
        return {
          leftPolish: state.leftPolish,
          rightPolish: state.rightPolish,
          scrapeProgress: state.scrapeProgress,
          clampLevel: state.clampLevel,
          scraped: state.scraped,
          pressed: state.pressed,
          pullN: state.pullN,
          adhered: state.adhered,
          separated: state.separated,
          threshold: state.lastThreshold,
          scale: scale.getVisualState(),
          tests: cloneTests()
        };
      },
      getState() {
        return {
          ...state,
          tests: cloneTests()
        };
      }
    };
  }

  components.createAdhesionBench = createAdhesionBench;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createAdhesionBench };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
