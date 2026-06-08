(function initBoilingCurveLab(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  const DEFAULT_CORRECT_ANSWERS = Object.freeze([
    'B',
    '温度基本保持不变',
    '基本保持不变',
    '保持不变'
  ]);

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function normalizeAnswer(answer) {
    return String(answer || '').trim().toLowerCase();
  }

  function createBoilingCurveLab({
    roomTempC = 20,
    boilingPointC = 100,
    plateauEntryOffsetC = 0.25,
    plateauNoiseAmplitudeC = 0.11,
    heatRateBase = 14,
    heatRateNoise = 3,
    nearWindowC = 28,
    coolingRate = 6.2,
    stableEnterTempC = 99.1,
    stableExitTempC = 98.3,
    stableDecayRate = 0.65,
    sampleIntervalSec = 0.4,
    maxDataPoints = 240,
    bubbleStartTempC = 85,
    bubbleWindowC = 20,
    bubbleMinChance = 0.04,
    bubbleMaxChance = 0.28,
    bubbleRateScale = 6,
    correctAnswers = DEFAULT_CORRECT_ANSWERS
  } = {}) {
    const normalizedCorrectAnswers = new Set(correctAnswers.map(normalizeAnswer));
    const state = {
      roomTempC: Number(roomTempC),
      boilingPointC: Number(boilingPointC),
      plateauEntryOffsetC: Number(plateauEntryOffsetC),
      plateauNoiseAmplitudeC: Number(plateauNoiseAmplitudeC),
      heatRateBase: Number(heatRateBase),
      heatRateNoise: Number(heatRateNoise),
      nearWindowC: Number(nearWindowC),
      coolingRate: Number(coolingRate),
      stableEnterTempC: Number(stableEnterTempC),
      stableExitTempC: Number(stableExitTempC),
      stableDecayRate: Number(stableDecayRate),
      sampleIntervalSec: Number(sampleIntervalSec),
      maxDataPoints: Number(maxDataPoints),
      bubbleStartTempC: Number(bubbleStartTempC),
      bubbleWindowC: Number(bubbleWindowC),
      bubbleMinChance: Number(bubbleMinChance),
      bubbleMaxChance: Number(bubbleMaxChance),
      bubbleRateScale: Number(bubbleRateScale),
      tempC: Number(roomTempC),
      timeSec: 0,
      heating: false,
      inserted: false,
      boilStableSec: 0,
      dataPoints: [],
      lastSampleAt: 0,
      records: [],
      quizPassed: false,
      selectedAnswer: null,
      bubbleAcc: 0,
      bubbleBurstCount: 0
    };

    function pushDataPoint() {
      state.dataPoints.push({
        t: round(state.timeSec, 3),
        temp: round(state.tempC, 3)
      });
      if (state.dataPoints.length > state.maxDataPoints) {
        state.dataPoints.shift();
      }
    }

    function stepTemperature(elapsedSec, randomFn) {
      if (state.heating) {
        if (state.tempC < state.boilingPointC - state.plateauEntryOffsetC) {
          const near = clamp(
            (state.boilingPointC - state.tempC) / state.nearWindowC,
            0.35,
            1
          );
          state.tempC += (state.heatRateBase + randomFn() * state.heatRateNoise) * near * elapsedSec;
        } else {
          state.tempC = state.boilingPointC + ((randomFn() * 2 - 1) * state.plateauNoiseAmplitudeC);
        }
      } else if (state.tempC > state.roomTempC) {
        state.tempC -= state.coolingRate * elapsedSec;
      }

      state.tempC = clamp(state.tempC, state.roomTempC, state.boilingPointC + 2);

      if (state.heating && state.tempC >= state.stableEnterTempC) {
        state.boilStableSec = round(state.boilStableSec + elapsedSec, 3);
      } else if (state.tempC < state.stableExitTempC) {
        state.boilStableSec = round(
          Math.max(0, state.boilStableSec - elapsedSec * state.stableDecayRate),
          3
        );
      }
    }

    function stepSampling(elapsedSec) {
      if (!(state.heating || state.tempC > state.roomTempC + 0.2)) {
        return;
      }
      state.timeSec = round(state.timeSec + elapsedSec, 3);
      state.lastSampleAt = round(state.lastSampleAt + elapsedSec, 3);
      while (state.lastSampleAt >= state.sampleIntervalSec) {
        state.lastSampleAt = round(state.lastSampleAt - state.sampleIntervalSec, 3);
        pushDataPoint();
      }
    }

    function stepBubbles(elapsedSec) {
      if (!(state.heating && state.tempC > state.bubbleStartTempC)) {
        return;
      }
      const chance = clamp(
        (state.tempC - state.bubbleStartTempC) / state.bubbleWindowC,
        state.bubbleMinChance,
        state.bubbleMaxChance
      );
      state.bubbleAcc = round(state.bubbleAcc + elapsedSec * chance * state.bubbleRateScale, 6);
      while (state.bubbleAcc >= 1) {
        state.bubbleBurstCount += 1;
        state.bubbleAcc = round(state.bubbleAcc - 1, 6);
      }
    }

    function plateauCount({ minTempC = 99, maxTempC = 100.4 } = {}) {
      return state.dataPoints.filter(
        (point) => point.temp >= Number(minTempC) && point.temp <= Number(maxTempC)
      ).length;
    }

    function boilingStageText() {
      if (!state.inserted) return '温度计未插入';
      if (!state.heating) return '待加热';
      if (state.tempC < 99) return '升温中';
      return '沸腾平台观察中';
    }

    return {
      reset({
        tempC = state.roomTempC,
        inserted = false,
        heating = false
      } = {}) {
        state.tempC = clamp(Number(tempC), state.roomTempC, state.boilingPointC + 2);
        state.timeSec = 0;
        state.heating = !!heating && !!inserted;
        state.inserted = !!inserted;
        state.boilStableSec = 0;
        state.dataPoints = [];
        state.lastSampleAt = 0;
        state.records = [];
        state.quizPassed = false;
        state.selectedAnswer = null;
        state.bubbleAcc = 0;
        state.bubbleBurstCount = 0;
        return this.getState();
      },
      setInserted(on) {
        state.inserted = !!on;
        return {
          accepted: true,
          state: this.getVisualState()
        };
      },
      setHeating(on) {
        const next = !!on;
        if (next && !state.inserted) {
          return {
            accepted: false,
            reason: '请先插入温度计，再加热。',
            state: this.getVisualState()
          };
        }
        state.heating = next;
        return {
          accepted: true,
          state: this.getVisualState()
        };
      },
      tick(dt, { randomFn = Math.random } = {}) {
        const elapsedSec = Math.max(0, Number(dt) || 0);
        if (elapsedSec <= 0) {
          return this.getVisualState();
        }
        stepTemperature(elapsedSec, randomFn);
        stepSampling(elapsedSec);
        stepBubbles(elapsedSec);
        return this.getVisualState();
      },
      record(step = '步骤', note = '') {
        const entry = {
          step: note ? `${step}(${note})` : step,
          temp: round(state.tempC, 1),
          t: Math.round(state.timeSec)
        };
        state.records.push(entry);
        if (state.records.length > 80) {
          state.records.shift();
        }
        return entry;
      },
      answerQuiz(answer, { acceptedAnswers = null } = {}) {
        const normalized = normalizeAnswer(answer);
        const allowSet = acceptedAnswers
          ? new Set(acceptedAnswers.map(normalizeAnswer))
          : normalizedCorrectAnswers;
        state.selectedAnswer = String(answer || '');
        state.quizPassed = allowSet.has(normalized);
        return {
          accepted: true,
          correct: state.quizPassed,
          state: this.getVisualState()
        };
      },
      plateauCount,
      isBoilingStable({
        minStableSec = 3,
        minPlateauPoints = 8,
        minTempC = 99,
        maxTempC = 100.4
      } = {}) {
        return (
          state.boilStableSec >= Number(minStableSec) &&
          plateauCount({ minTempC, maxTempC }) >= Number(minPlateauPoints)
        );
      },
      getGraphWindow(windowSec = 180) {
        const latestTime = state.dataPoints.length
          ? state.dataPoints[state.dataPoints.length - 1].t
          : 0;
        const fromTimeSec = Math.max(0, latestTime - Number(windowSec));
        return state.dataPoints.filter((point) => point.t >= fromTimeSec);
      },
      readTemperature() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => round(source.tempC, 1),
          format: (value) => `${value.toFixed(1)} ℃`
        });
      },
      readStableTime() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => round(source.boilStableSec, 1),
          format: (value) => `${value.toFixed(1)} s`
        });
      },
      readTime() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => round(source.timeSec, 1),
          format: (value) => `${value.toFixed(1)} s`
        });
      },
      readSampleCount() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.dataPoints.length,
          format: (value) => `${value} 个采样点`
        });
      },
      getVisualState() {
        return {
          tempC: state.tempC,
          timeSec: state.timeSec,
          heating: state.heating,
          inserted: state.inserted,
          boilStableSec: state.boilStableSec,
          sampleCount: state.dataPoints.length,
          plateauCount: plateauCount(),
          bubbleBurstCount: state.bubbleBurstCount,
          quizPassed: state.quizPassed,
          selectedAnswer: state.selectedAnswer,
          isBoilingStable: this.isBoilingStable(),
          stageText: boilingStageText()
        };
      },
      getState() {
        return {
          roomTempC: state.roomTempC,
          boilingPointC: state.boilingPointC,
          tempC: state.tempC,
          timeSec: state.timeSec,
          heating: state.heating,
          inserted: state.inserted,
          boilStableSec: state.boilStableSec,
          dataPoints: [...state.dataPoints],
          lastSampleAt: state.lastSampleAt,
          records: [...state.records],
          quizPassed: state.quizPassed,
          selectedAnswer: state.selectedAnswer,
          bubbleBurstCount: state.bubbleBurstCount,
          bubbleAcc: state.bubbleAcc
        };
      }
    };
  }

  components.createBoilingCurveLab = createBoilingCurveLab;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createBoilingCurveLab };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
