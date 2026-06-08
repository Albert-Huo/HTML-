(function initResistanceRunway(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const components = root.components = root.components || {};

  function round(value, digits = 1) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function createResistanceRunway({
    trackBase = Object.freeze({ low: 26, high: 14 }),
    trackGain = Object.freeze({ low: 4.4, high: 2.6 }),
    noiseOffsetFn
  } = {}) {
    const state = {
      running: false,
      progress: 0,
      launchTrack: 'low',
      launchPush: 0,
      lastDist: 0,
      lastTrack: 'low',
      lastPush: 0,
      lowObserved: false,
      highObserved: false,
      tests: []
    };

    function cloneTests() {
      return state.tests.map((entry) => ({ ...entry }));
    }

    function computeDistance(track, push) {
      if (!(track in trackBase) || !(track in trackGain)) {
        throw new RangeError(`Unsupported runway track: ${track}`);
      }
      const noise = typeof noiseOffsetFn === 'function'
        ? Number(noiseOffsetFn({
          track,
          push,
          tests: cloneTests()
        })) || 0
        : 0;
      return round(trackBase[track] + push * trackGain[track] + noise, 1);
    }

    return {
      reset() {
        state.running = false;
        state.progress = 0;
        state.launchTrack = 'low';
        state.launchPush = 0;
        state.lastDist = 0;
        state.lastTrack = 'low';
        state.lastPush = 0;
        state.lowObserved = false;
        state.highObserved = false;
        state.tests = [];
        return this.getState();
      },
      launchCar({ track, pushN }) {
        if (!(track in trackBase)) {
          throw new RangeError(`Unsupported runway track: ${track}`);
        }
        state.running = true;
        state.progress = 0;
        state.launchTrack = track;
        state.launchPush = Number(pushN);
        return {
          accepted: true,
          state: this.getVisualState()
        };
      },
      observeStop() {
        if (!state.running) {
          return {
            accepted: false,
            reason: '请先释放小车',
            state: this.getVisualState()
          };
        }
        const track = state.launchTrack;
        const push = state.launchPush;
        state.lastDist = computeDistance(track, push);
        state.lastTrack = track;
        state.lastPush = push;
        state.tests.push({
          track,
          push,
          dist: state.lastDist
        });
        if (track === 'low') state.lowObserved = true;
        if (track === 'high') state.highObserved = true;
        state.running = false;
        state.progress = 1;
        return {
          accepted: true,
          dist: state.lastDist,
          state: this.getVisualState()
        };
      },
      getObservation() {
        return {
          lastTrack: state.lastTrack,
          lastPush: state.lastPush,
          lastDist: state.lastDist,
          lowObserved: state.lowObserved,
          highObserved: state.highObserved,
          tests: cloneTests()
        };
      },
      getVisualState() {
        return {
          running: state.running,
          progress: state.progress,
          launchTrack: state.launchTrack,
          launchPush: state.launchPush,
          lastTrack: state.lastTrack,
          lastPush: state.lastPush,
          lastDist: state.lastDist,
          lowObserved: state.lowObserved,
          highObserved: state.highObserved,
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

  components.createResistanceRunway = createResistanceRunway;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createResistanceRunway };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
