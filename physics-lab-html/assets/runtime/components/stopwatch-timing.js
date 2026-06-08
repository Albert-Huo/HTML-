(function initStopwatchTiming(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function clampTargetCycles(value) {
    return Math.max(1, Math.round(Number(value) || 1));
  }

  function createStopwatchTiming({
    targetCycles = 10,
    periodSec = 0.8
  } = {}) {
    const state = {
      targetCycles: clampTargetCycles(targetCycles),
      periodSec: Math.max(0.05, Number(periodSec) || 0.8),
      running: false,
      waitingReference: false,
      referenceReached: false,
      measured: false,
      overrun: false,
      elapsedSec: 0,
      cyclesDone: 0,
      lastSinglePeriodSec: null,
      measureStartMs: null,
      measureStartPhase: null,
      startNowMs: null,
      stopNowMs: null,
      runCount: 0,
      mode: 'manual'
    };

    function omegaForPeriod(periodValueSec = state.periodSec) {
      return (Math.PI * 2) / (periodValueSec * 1000);
    }

    function clearRunState() {
      state.elapsedSec = 0;
      state.cyclesDone = 0;
      state.lastSinglePeriodSec = null;
      state.measured = false;
      state.overrun = false;
      state.stopNowMs = null;
    }

    function advance(nowMs) {
      if (!state.running || state.measureStartMs == null) {
        return state.elapsedSec;
      }

      if (state.waitingReference) {
        if (nowMs < state.measureStartMs) {
          state.elapsedSec = 0;
          state.cyclesDone = 0;
          return state.elapsedSec;
        }
        state.waitingReference = false;
        state.referenceReached = true;
      }

      const elapsedSec = Math.max(0, (nowMs - state.measureStartMs) / 1000);
      state.elapsedSec = round(elapsedSec, 3);
      state.cyclesDone = Math.max(0, Math.floor(elapsedSec / state.periodSec));
      state.overrun = state.cyclesDone > state.targetCycles;
      return state.elapsedSec;
    }

    return {
      reset({
        targetCycles: nextTargetCycles = state.targetCycles,
        periodSec: nextPeriodSec = state.periodSec
      } = {}) {
        state.targetCycles = clampTargetCycles(nextTargetCycles);
        state.periodSec = Math.max(0.05, Number(nextPeriodSec) || state.periodSec);
        state.running = false;
        state.waitingReference = false;
        state.referenceReached = false;
        state.measureStartMs = null;
        state.measureStartPhase = null;
        state.startNowMs = null;
        clearRunState();
        return this.getState();
      },
      setCycleTarget(nextTargetCycles) {
        state.targetCycles = clampTargetCycles(nextTargetCycles);
        return this.getVisualState();
      },
      setPeriod(nextPeriodSec) {
        state.periodSec = Math.max(0.05, Number(nextPeriodSec) || state.periodSec);
        return this.getVisualState();
      },
      startTimer({ nowMs = 0, targetCycles: nextTargetCycles = state.targetCycles } = {}) {
        state.targetCycles = clampTargetCycles(nextTargetCycles);
        state.running = true;
        state.waitingReference = false;
        state.referenceReached = true;
        state.measureStartMs = Number(nowMs);
        state.measureStartPhase = null;
        state.startNowMs = Number(nowMs);
        state.mode = 'manual';
        clearRunState();
        return this.getVisualState();
      },
      startReferenceTiming({
        nowMs = 0,
        periodSec: nextPeriodSec = state.periodSec,
        currentPhaseRad = 0,
        targetCycles: nextTargetCycles = state.targetCycles
      } = {}) {
        state.periodSec = Math.max(0.05, Number(nextPeriodSec) || state.periodSec);
        state.targetCycles = clampTargetCycles(nextTargetCycles);
        const omega = omegaForPeriod(state.periodSec);
        const phase = Number(currentPhaseRad) || 0;
        const deltaPhase = ((Math.PI / 2) - phase) % (Math.PI * 2);
        const normalizedDelta = deltaPhase < 0 ? deltaPhase + Math.PI * 2 : deltaPhase;
        const waitMs = normalizedDelta / omega;

        state.running = true;
        state.waitingReference = true;
        state.referenceReached = false;
        state.measureStartPhase = phase + normalizedDelta;
        state.measureStartMs = round(Number(nowMs) + waitMs, 6);
        state.startNowMs = Number(nowMs);
        state.mode = 'reference';
        clearRunState();
        return this.getVisualState();
      },
      tick({ nowMs = 0 } = {}) {
        advance(Number(nowMs));
        return this.getVisualState();
      },
      stopTiming({ nowMs = 0 } = {}) {
        if (!state.running) {
          return {
            accepted: false,
            reason: '秒表尚未开始',
            state: this.getVisualState()
          };
        }

        advance(Number(nowMs));
        state.running = false;
        state.stopNowMs = Number(nowMs);
        state.measured = state.cyclesDone > 0;
        state.lastSinglePeriodSec = state.measured
          ? round(state.elapsedSec / state.cyclesDone, 3)
          : null;
        if (state.measured) {
          state.runCount += 1;
        }

        return {
          accepted: state.measured,
          elapsedSec: state.elapsedSec,
          cyclesDone: state.cyclesDone,
          targetCycles: state.targetCycles,
          waitingReference: state.waitingReference,
          overrun: state.overrun,
          withinTarget: state.cyclesDone === state.targetCycles,
          singlePeriodSec: state.lastSinglePeriodSec
        };
      },
      readElapsed() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.elapsedSec,
          format: (value) => `${value.toFixed(3)} s`
        });
      },
      readSinglePeriod() {
        if (!state.measured || state.cyclesDone <= 0 || state.lastSinglePeriodSec == null) {
          return {
            accepted: false,
            reason: '请先完成一次有效计时',
            state: this.getVisualState()
          };
        }

        return {
          accepted: true,
          reading: primitives.measureBinding({
            sourceState: state,
            compute: (source) => source.lastSinglePeriodSec,
            format: (value) => `${value.toFixed(3)} s`
          }),
          cyclesDone: state.cyclesDone
        };
      },
      getVisualState() {
        return {
          targetCycles: state.targetCycles,
          periodSec: state.periodSec,
          running: state.running,
          waitingReference: state.waitingReference,
          referenceReached: state.referenceReached,
          measured: state.measured,
          overrun: state.overrun,
          elapsedSec: state.elapsedSec,
          cyclesDone: state.cyclesDone,
          lastSinglePeriodSec: state.lastSinglePeriodSec,
          mode: state.mode
        };
      },
      getState() {
        return {
          targetCycles: state.targetCycles,
          periodSec: state.periodSec,
          running: state.running,
          waitingReference: state.waitingReference,
          referenceReached: state.referenceReached,
          measured: state.measured,
          overrun: state.overrun,
          elapsedSec: state.elapsedSec,
          cyclesDone: state.cyclesDone,
          lastSinglePeriodSec: state.lastSinglePeriodSec,
          measureStartMs: state.measureStartMs,
          measureStartPhase: state.measureStartPhase,
          startNowMs: state.startNowMs,
          stopNowMs: state.stopNowMs,
          runCount: state.runCount,
          mode: state.mode
        };
      }
    };
  }

  components.createStopwatchTiming = createStopwatchTiming;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createStopwatchTiming };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
