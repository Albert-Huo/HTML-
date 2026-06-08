(function initPaperTapeAnalyzer(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const components = root.components = root.components || {};

  function round(value, digits = 3) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function cloneRecords(records) {
    return records.map((entry) => ({ ...entry }));
  }

  function createPaperTapeAnalyzer({
    mode = 'caliper-speed',
    deltaT = 0.02,
    defaultPoints = [0, 0.8, 1.7, 2.7, 3.8, 5.0, 6.3]
  } = {}) {
    const state = {
      mode,
      deltaT,
      points: defaultPoints.slice(),
      leftIndex: 0,
      rightIndex: 4,
      selectedIndices: [],
      deltaX: 0,
      speedAtP: 0,
      fit: null,
      runProgress: 0,
      history: []
    };

    function resetMode(nextMode = mode) {
      state.mode = nextMode;
      state.points = defaultPoints.slice();
      state.leftIndex = 0;
      state.rightIndex = 4;
      state.selectedIndices = [];
      state.deltaX = 0;
      state.speedAtP = 0;
      state.fit = null;
      state.runProgress = 0;
      state.history = [];
    }

    function linearFit(xs, ys) {
      const n = xs.length;
      const sumX = xs.reduce((acc, value) => acc + value, 0);
      const sumY = ys.reduce((acc, value) => acc + value, 0);
      const sumXY = xs.reduce((acc, value, index) => acc + value * ys[index], 0);
      const sumXX = xs.reduce((acc, value) => acc + value * value, 0);
      const denom = n * sumXX - sumX * sumX;
      const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
      const intercept = n === 0 ? 0 : (sumY - slope * sumX) / n;
      return {
        slope: round(slope, 3),
        intercept: round(intercept, 3)
      };
    }

    resetMode(mode);

    return {
      reset({ mode: nextMode = state.mode } = {}) {
        resetMode(nextMode);
        return this.getState();
      },
      selectCalipers(leftIndex, rightIndex) {
        state.leftIndex = Number(leftIndex);
        state.rightIndex = Number(rightIndex);
        return this.getVisualState();
      },
      computeCaliperSpeed() {
        if (state.mode !== 'caliper-speed') {
          return { accepted: false, reason: '当前模式不是卡尺测速', state: this.getVisualState() };
        }
        if (state.rightIndex - state.leftIndex !== 4) {
          return { accepted: false, reason: '请选择相隔 4 个时间间隔的点', state: this.getVisualState() };
        }
        state.deltaX = round(state.points[state.rightIndex] - state.points[state.leftIndex], 3);
        state.speedAtP = round(state.deltaX / (4 * state.deltaT), 3);
        state.history.push({
          kind: 'caliper-speed',
          leftIndex: state.leftIndex,
          rightIndex: state.rightIndex,
          deltaX: state.deltaX,
          speedAtP: state.speedAtP
        });
        return { accepted: true, speedAtP: state.speedAtP, state: this.getVisualState() };
      },
      startTickerRun({ v0 = 0.5, a = 1.2, N = 6, deltaT: nextDeltaT = 0.1 } = {}) {
        state.mode = 'ticker-fit';
        state.deltaT = Number(nextDeltaT);
        state.points = [];
        for (let index = 0; index <= N; index += 1) {
          const t = index * state.deltaT;
          state.points.push(round(v0 * t + 0.5 * a * t * t, 3));
        }
        state.selectedIndices = [];
        state.fit = null;
        state.runProgress = 1;
        return this.getVisualState();
      },
      selectPoints(indices) {
        state.selectedIndices = [...indices];
        return this.getVisualState();
      },
      fitTickerData() {
        if (state.mode !== 'ticker-fit') {
          return { accepted: false, reason: '当前模式不是打点拟合', state: this.getVisualState() };
        }
        const indices = state.selectedIndices.length > 0
          ? state.selectedIndices
          : state.points.map((_, index) => index);
        if (indices.length < 3) {
          return { accepted: false, reason: '至少选择 3 个点用于拟合', state: this.getVisualState() };
        }
        const times = [];
        const velocities = [];
        for (let i = 1; i < indices.length; i += 1) {
          const left = indices[i - 1];
          const right = indices[i];
          const dt = (right - left) * state.deltaT;
          const dx = state.points[right] - state.points[left];
          times.push(round((left + right) * state.deltaT * 0.5, 3));
          velocities.push(round(dx / dt, 3));
        }
        state.fit = {
          times,
          velocities,
          ...linearFit(times, velocities)
        };
        state.history.push({
          kind: 'ticker-fit',
          fit: { ...state.fit }
        });
        return { accepted: true, fit: state.fit, state: this.getVisualState() };
      },
      getObservation() {
        return {
          mode: state.mode,
          deltaT: state.deltaT,
          deltaX: state.deltaX,
          speedAtP: state.speedAtP,
          fit: state.fit ? { ...state.fit, times: state.fit.times.slice(), velocities: state.fit.velocities.slice() } : null,
          history: cloneRecords(state.history)
        };
      },
      getVisualState() {
        return {
          mode: state.mode,
          points: state.points.slice(),
          leftIndex: state.leftIndex,
          rightIndex: state.rightIndex,
          selectedIndices: state.selectedIndices.slice(),
          deltaX: state.deltaX,
          speedAtP: state.speedAtP,
          fit: state.fit ? { ...state.fit, times: state.fit.times.slice(), velocities: state.fit.velocities.slice() } : null,
          history: cloneRecords(state.history)
        };
      },
      getState() {
        return {
          ...state,
          points: state.points.slice(),
          selectedIndices: state.selectedIndices.slice(),
          fit: state.fit ? { ...state.fit, times: state.fit.times.slice(), velocities: state.fit.velocities.slice() } : null,
          history: cloneRecords(state.history)
        };
      }
    };
  }

  components.createPaperTapeAnalyzer = createPaperTapeAnalyzer;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createPaperTapeAnalyzer };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
