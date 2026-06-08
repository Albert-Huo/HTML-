(function initScaleReading(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function createScaleReading({
    totalCm = 20,
    objectLengthCm = 10.8,
    objectCm = 2.6,
    guideCm,
    zeroSnapThresholdCm = 0.15,
    guideSnapThresholdCm = 0.1
  } = {}) {
    const state = {
      totalCm: Number(totalCm),
      objectLengthCm: Number(objectLengthCm),
      objectCm: round(clamp(Number(objectCm), 0, Number(totalCm)), 1),
      guideCm: 0,
      aligned: false,
      lastRead: null,
      measureCount: 0,
      alignedCount: 0,
      zeroSnapPulse: 0,
      guideSnapPulse: 0,
      zeroSnapThresholdCm,
      guideSnapThresholdCm
    };

    function maxObjectStart() {
      return Math.max(0, state.totalCm - state.objectLengthCm);
    }

    function objectEndCm() {
      return round(state.objectCm + state.objectLengthCm, 1);
    }

    function setGuideCm(value, snapToEnd = true) {
      let next = round(clamp(Number(value), 0, state.totalCm), 1);
      const targetEnd = objectEndCm();
      if (snapToEnd && Math.abs(next - targetEnd) <= state.guideSnapThresholdCm + 1e-9) {
        next = targetEnd;
      }
      state.guideCm = next;
      return state.guideCm;
    }

    function commitAlignment(showPulse = true) {
      const wasAligned = state.aligned;
      if (state.objectCm <= state.zeroSnapThresholdCm) {
        state.objectCm = 0;
        state.aligned = true;
        if (!wasAligned) {
          state.alignedCount += 1;
        }
        if (showPulse) {
          state.zeroSnapPulse = 1;
        }
        return true;
      }

      state.aligned = false;
      return false;
    }

    state.objectCm = round(clamp(state.objectCm, 0, maxObjectStart()), 1);
    state.guideCm = round(
      clamp(
        guideCm == null ? state.objectCm + state.objectLengthCm + 0.8 : Number(guideCm),
        0,
        state.totalCm
      ),
      1
    );
    state.aligned = state.objectCm === 0;

    return {
      reset({
        objectLengthCm: nextLength = state.objectLengthCm,
        objectCm: nextObjectCm = state.objectCm,
        guideCm: nextGuideCm
      } = {}) {
        state.objectLengthCm = Number(nextLength);
        state.objectCm = round(clamp(Number(nextObjectCm), 0, maxObjectStart()), 1);
        state.guideCm = round(
          clamp(
            nextGuideCm == null ? state.objectCm + state.objectLengthCm + 0.8 : Number(nextGuideCm),
            0,
            state.totalCm
          ),
          1
        );
        state.aligned = state.objectCm === 0;
        state.lastRead = null;
        state.measureCount = 0;
        state.alignedCount = state.aligned ? 1 : 0;
        state.zeroSnapPulse = 0;
        state.guideSnapPulse = 0;
        return this.getState();
      },
      setObjectLength(lengthCm) {
        state.objectLengthCm = Number(lengthCm);
        state.objectCm = round(clamp(state.objectCm, 0, maxObjectStart()), 1);
        setGuideCm(state.guideCm, true);
        return this.getVisualState();
      },
      setObjectStart(cm) {
        state.objectCm = round(clamp(Number(cm), 0, maxObjectStart()), 1);
        commitAlignment(true);
        return this.getVisualState();
      },
      alignZero() {
        state.objectCm = 0;
        state.aligned = true;
        state.alignedCount += 1;
        state.zeroSnapPulse = 1;
        return this.getVisualState();
      },
      moveGuide(cm) {
        setGuideCm(cm, true);
        return this.getVisualState();
      },
      read() {
        if (!state.aligned) {
          return {
            accepted: false,
            reason: '请先将物体对齐零刻度',
            state: this.getVisualState()
          };
        }

        const readCm = setGuideCm(state.guideCm, true);
        state.lastRead = round(readCm, 1);
        state.measureCount += 1;
        state.guideSnapPulse = 1;

        const reading = primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.lastRead,
          format: (value) => `${value.toFixed(1)} cm`
        });

        return {
          accepted: true,
          reading,
          referenceCm: round(state.objectLengthCm, 1),
          errorCm: round(state.lastRead - state.objectLengthCm, 1)
        };
      },
      getVisualState() {
        return {
          aligned: state.aligned,
          objectCm: state.objectCm,
          objectLengthCm: state.objectLengthCm,
          objectEndCm: objectEndCm(),
          guideCm: state.guideCm,
          lastRead: state.lastRead,
          measureCount: state.measureCount,
          alignedCount: state.alignedCount,
          zeroSnapPulse: state.zeroSnapPulse,
          guideSnapPulse: state.guideSnapPulse
        };
      },
      getState() {
        return {
          totalCm: state.totalCm,
          objectLengthCm: state.objectLengthCm,
          objectCm: state.objectCm,
          guideCm: state.guideCm,
          aligned: state.aligned,
          lastRead: state.lastRead,
          measureCount: state.measureCount,
          alignedCount: state.alignedCount,
          zeroSnapPulse: state.zeroSnapPulse,
          guideSnapPulse: state.guideSnapPulse
        };
      }
    };
  }

  components.createScaleReading = createScaleReading;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createScaleReading };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
