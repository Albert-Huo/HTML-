(function initSpeedMeasurement(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function createSpeedMeasurement({
    distanceM = 0.8,
    markerLabel = 's1',
    accelerationMps2 = 0.56
  } = {}) {
    if (typeof components.createStopwatchTiming !== 'function') {
      throw new Error('createSpeedMeasurement requires components.createStopwatchTiming');
    }

    const stopwatch = components.createStopwatchTiming({
      targetCycles: 1,
      periodSec: 1
    });

    const state = {
      distanceM: Number(distanceM),
      markerLabel,
      accelerationMps2: Number(accelerationMps2),
      running: false,
      cartReady: true,
      cartProgress: 0,
      startMs: 0,
      runDurationSec: 0,
      runCount: 0,
      hitFlash: 0,
      lastTimeSec: null,
      lastSpeedMps: null,
      lastDistanceM: null,
      lastLabel: null
    };

    function computeRunDuration(distanceValue = state.distanceM, accelerationValue = state.accelerationMps2) {
      const safeDistance = Math.max(0.01, Number(distanceValue));
      const safeAcceleration = Math.max(0.05, Number(accelerationValue));
      return round(Math.sqrt((2 * safeDistance) / safeAcceleration), 2);
    }

    function finalizeRun(finishMs) {
      const finishResult = stopwatch.stopTiming({ nowMs: finishMs });
      const elapsedSec = finishResult.elapsedSec;
      const speedMps = round(state.distanceM / elapsedSec, 2);

      state.running = false;
      state.cartReady = false;
      state.cartProgress = 1;
      state.runCount += 1;
      state.hitFlash = 1;
      state.lastTimeSec = elapsedSec;
      state.lastSpeedMps = speedMps;
      state.lastDistanceM = state.distanceM;
      state.lastLabel = state.markerLabel;

      return {
        accepted: true,
        elapsedSec,
        speedMps,
        distanceM: state.distanceM,
        label: state.markerLabel
      };
    }

    return {
      reset({
        distanceM: nextDistanceM = state.distanceM,
        markerLabel: nextMarkerLabel = state.markerLabel,
        accelerationMps2: nextAccelerationMps2 = state.accelerationMps2
      } = {}) {
        state.distanceM = Number(nextDistanceM);
        state.markerLabel = nextMarkerLabel;
        state.accelerationMps2 = Number(nextAccelerationMps2);
        state.running = false;
        state.cartReady = true;
        state.cartProgress = 0;
        state.startMs = 0;
        state.runDurationSec = 0;
        state.runCount = 0;
        state.hitFlash = 0;
        state.lastTimeSec = null;
        state.lastSpeedMps = null;
        state.lastDistanceM = null;
        state.lastLabel = null;
        stopwatch.reset({ targetCycles: 1, periodSec: 1 });
        return this.getState();
      },
      setDistance(distanceValue, label = state.markerLabel) {
        state.distanceM = Number(distanceValue);
        state.markerLabel = label;
        return this.getVisualState();
      },
      setAcceleration(accelerationValue) {
        state.accelerationMps2 = Number(accelerationValue);
        return this.getVisualState();
      },
      startRun({
        nowMs = 0,
        distanceM: nextDistanceM = state.distanceM,
        markerLabel: nextMarkerLabel = state.markerLabel,
        accelerationMps2: nextAccelerationMps2 = state.accelerationMps2
      } = {}) {
        if (state.running) {
          return {
            accepted: false,
            reason: '小车正在运动',
            state: this.getVisualState()
          };
        }

        state.distanceM = Number(nextDistanceM);
        state.markerLabel = nextMarkerLabel;
        state.accelerationMps2 = Number(nextAccelerationMps2);
        state.running = true;
        state.cartReady = false;
        state.cartProgress = 0;
        state.startMs = Number(nowMs);
        state.runDurationSec = computeRunDuration();
        state.hitFlash = 0;
        state.lastTimeSec = null;
        state.lastSpeedMps = null;
        state.lastDistanceM = null;
        state.lastLabel = null;

        stopwatch.reset({ targetCycles: 1, periodSec: 1 });
        stopwatch.startTimer({ nowMs: state.startMs, targetCycles: 1 });

        return {
          accepted: true,
          runDurationSec: state.runDurationSec,
          distanceM: state.distanceM,
          label: state.markerLabel
        };
      },
      tick({ nowMs = 0 } = {}) {
        if (!state.running) {
          return this.getVisualState();
        }

        const safeDuration = Math.max(0.1, state.runDurationSec || 0.1);
        const elapsedSec = Math.max(0, (Number(nowMs) - state.startMs) / 1000);
        const progress = clamp(elapsedSec / safeDuration, 0, 1);
        state.cartProgress = round(progress * progress, 3);
        stopwatch.tick({ nowMs });

        if (progress >= 1) {
          finalizeRun(state.startMs + safeDuration * 1000);
        }

        return this.getVisualState();
      },
      resetCart() {
        state.running = false;
        state.cartReady = true;
        state.cartProgress = 0;
        state.hitFlash = 0;
        stopwatch.reset({ targetCycles: 1, periodSec: 1 });
        return this.getVisualState();
      },
      readTime() {
        if (state.lastTimeSec == null) {
          return stopwatch.readElapsed();
        }
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.lastTimeSec,
          format: (value) => `${value.toFixed(2)} s`
        });
      },
      readSpeed() {
        if (state.lastSpeedMps == null) {
          return {
            accepted: false,
            reason: '请先完成一次测速',
            state: this.getVisualState()
          };
        }
        return {
          accepted: true,
          reading: primitives.measureBinding({
            sourceState: state,
            compute: (source) => source.lastSpeedMps,
            format: (value) => `${value.toFixed(2)} m/s`
          })
        };
      },
      recordRun() {
        if (state.lastTimeSec == null || state.lastSpeedMps == null || state.lastDistanceM == null) {
          return {
            accepted: false,
            reason: '请先完成一次测速',
            state: this.getVisualState()
          };
        }

        return {
          accepted: true,
          label: state.lastLabel,
          distanceM: state.lastDistanceM,
          time: this.readTime(),
          speed: this.readSpeed().reading,
          note: 'v=s/t'
        };
      },
      getStopwatch() {
        return stopwatch;
      },
      getVisualState() {
        return {
          distanceM: state.distanceM,
          markerLabel: state.markerLabel,
          accelerationMps2: state.accelerationMps2,
          running: state.running,
          cartReady: state.cartReady,
          cartProgress: state.cartProgress,
          runDurationSec: state.runDurationSec,
          runCount: state.runCount,
          hitFlash: state.hitFlash,
          lastTimeSec: state.lastTimeSec,
          lastSpeedMps: state.lastSpeedMps,
          stopwatch: stopwatch.getVisualState()
        };
      },
      getState() {
        return {
          distanceM: state.distanceM,
          markerLabel: state.markerLabel,
          accelerationMps2: state.accelerationMps2,
          running: state.running,
          cartReady: state.cartReady,
          cartProgress: state.cartProgress,
          startMs: state.startMs,
          runDurationSec: state.runDurationSec,
          runCount: state.runCount,
          hitFlash: state.hitFlash,
          lastTimeSec: state.lastTimeSec,
          lastSpeedMps: state.lastSpeedMps,
          lastDistanceM: state.lastDistanceM,
          lastLabel: state.lastLabel,
          stopwatch: stopwatch.getState()
        };
      }
    };
  }

  components.createSpeedMeasurement = createSpeedMeasurement;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createSpeedMeasurement };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
