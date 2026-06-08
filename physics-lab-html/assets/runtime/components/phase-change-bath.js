(function initPhaseChangeBath(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function createPhaseChangeBath({
    minC = 20,
    maxC = 100,
    meltingPointC = 48,
    initialTemperatureC = 24,
    initialMode = 'heat',
    initialPhase = 'solid',
    initialPower = 0.6
  } = {}) {
    const state = {
      minC: Number(minC),
      maxC: Number(maxC),
      meltingPointC: Number(meltingPointC),
      temperatureC: Number(initialTemperatureC),
      timeSec: 0,
      running: false,
      mode: initialMode === 'cool' ? 'cool' : 'heat',
      power: clamp(Number(initialPower), 0, 1),
      meltFrac: initialPhase === 'liquid' ? 1 : 0,
      freezeFrac: 0,
      phase: initialPhase,
      data: [],
      records: []
    };

    function pushDataPoint() {
      state.data.push({
        t: round(state.timeSec, 3),
        T: round(state.temperatureC, 3)
      });
      if (state.data.length > 5000) {
        state.data.shift();
      }
    }

    function phaseText() {
      if (state.phase === 'solid') return '固体';
      if (state.phase === 'melting') return '熔化中';
      if (state.phase === 'liquid') return '液体';
      if (state.phase === 'freezing') return '凝固中';
      return state.phase;
    }

    function stepSim(dt) {
      const p = state.power;
      const heatRate = 18 * (0.35 + 0.65 * p);
      const coolRate = 14 * (0.4 + (1 - p) * 0.6);
      const latentRate = 0.18 + 0.25 * p;
      const MP = state.meltingPointC;

      if (state.mode === 'heat') {
        if (state.phase === 'solid') {
          state.temperatureC += heatRate * dt;
          if (state.temperatureC >= MP) {
            state.temperatureC = MP;
            state.phase = 'melting';
          }
        } else if (state.phase === 'melting') {
          state.temperatureC = MP;
          state.meltFrac += latentRate * dt;
          if (state.meltFrac >= 1) {
            state.meltFrac = 1;
            state.phase = 'liquid';
          }
        } else if (state.phase === 'liquid') {
          state.temperatureC += heatRate * 0.55 * dt;
          if (state.temperatureC >= state.maxC) {
            state.temperatureC = state.maxC;
          }
        } else if (state.phase === 'freezing') {
          state.phase = 'melting';
          state.freezeFrac = 0;
        }
      } else if (state.phase === 'liquid') {
        state.temperatureC -= coolRate * dt;
        if (state.temperatureC <= MP) {
          state.temperatureC = MP;
          state.phase = 'freezing';
        }
      } else if (state.phase === 'freezing') {
        state.temperatureC = MP;
        state.freezeFrac += latentRate * dt;
        if (state.freezeFrac >= 1) {
          state.freezeFrac = 1;
          state.phase = 'solid';
          state.meltFrac = 0;
        }
      } else if (state.phase === 'solid') {
        state.temperatureC -= coolRate * 0.65 * dt;
        if (state.temperatureC <= state.minC) {
          state.temperatureC = state.minC;
        }
      } else if (state.phase === 'melting') {
        state.phase = 'freezing';
        state.meltFrac = 1 - state.freezeFrac;
      }

      state.temperatureC = round(state.temperatureC, 3);
      state.timeSec = round(state.timeSec + dt, 3);
      pushDataPoint();
    }

    pushDataPoint();

    return {
      reset({
        temperatureC = initialTemperatureC,
        mode = initialMode,
        phase = initialPhase,
        power = initialPower
      } = {}) {
        state.temperatureC = Number(temperatureC);
        state.timeSec = 0;
        state.running = false;
        state.mode = mode === 'cool' ? 'cool' : 'heat';
        state.power = clamp(Number(power), 0, 1);
        state.phase = phase;
        state.meltFrac = phase === 'liquid' ? 1 : 0;
        state.freezeFrac = 0;
        state.data = [];
        state.records = [];
        pushDataPoint();
        return this.getState();
      },
      setMode(mode) {
        state.mode = mode === 'cool' ? 'cool' : 'heat';
        return this.getVisualState();
      },
      setPower(power) {
        state.power = clamp(Number(power), 0, 1);
        return this.getVisualState();
      },
      setRunning(on) {
        state.running = !!on;
        return this.getVisualState();
      },
      tick(dt) {
        const elapsed = Math.max(0, Number(dt) || 0);
        if (!state.running || elapsed <= 0) {
          return this.getVisualState();
        }
        stepSim(elapsed);
        return this.getVisualState();
      },
      record(step = '步骤', note = '') {
        const entry = {
          step: note ? `${step}(${note})` : step,
          temp: round(state.temperatureC, 1),
          t: Math.round(state.timeSec)
        };
        state.records.push(entry);
        if (state.records.length > 80) {
          state.records.shift();
        }
        return entry;
      },
      readTemperature() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => round(source.temperatureC, 1),
          format: (value) => `${value.toFixed(1)} ℃`
        });
      },
      readTime() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => round(source.timeSec, 1),
          format: (value) => `${value.toFixed(1)} s`
        });
      },
      getGraphWindow(windowSec = 180) {
        const latestTime = state.data.length ? state.data[state.data.length - 1].t : 0;
        const fromTimeSec = Math.max(0, latestTime - Number(windowSec));
        return state.data.filter((point) => point.t >= fromTimeSec);
      },
      evaluatePlateauSegment({
        fromTimeSec = 0,
        toTimeSec = state.timeSec,
        toleranceC = 2
      } = {}) {
        const start = Math.min(Number(fromTimeSec), Number(toTimeSec));
        const end = Math.max(Number(fromTimeSec), Number(toTimeSec));
        const segment = state.data.filter((point) => point.t >= start && point.t <= end);
        if (segment.length < 3) {
          return { ok: false, validPointCount: 0, timeSpan: 0, plateauPoints: [] };
        }
        const plateauPoints = segment.filter(
          (point) => Math.abs(point.T - state.meltingPointC) <= Number(toleranceC)
        );
        const timeSpan = plateauPoints.length > 2
          ? round(plateauPoints[plateauPoints.length - 1].t - plateauPoints[0].t, 3)
          : 0;
        return {
          ok: true,
          validPointCount: plateauPoints.length,
          timeSpan,
          plateauPoints
        };
      },
      getVisualState() {
        return {
          temperatureC: state.temperatureC,
          timeSec: state.timeSec,
          running: state.running,
          mode: state.mode,
          power: state.power,
          meltFrac: state.meltFrac,
          freezeFrac: state.freezeFrac,
          phase: state.phase,
          phaseText: phaseText(),
          recordCount: state.records.length,
          dataCount: state.data.length
        };
      },
      getState() {
        return {
          minC: state.minC,
          maxC: state.maxC,
          meltingPointC: state.meltingPointC,
          temperatureC: state.temperatureC,
          timeSec: state.timeSec,
          running: state.running,
          mode: state.mode,
          power: state.power,
          meltFrac: state.meltFrac,
          freezeFrac: state.freezeFrac,
          phase: state.phase,
          data: [...state.data],
          records: [...state.records]
        };
      }
    };
  }

  components.createPhaseChangeBath = createPhaseChangeBath;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createPhaseChangeBath };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
