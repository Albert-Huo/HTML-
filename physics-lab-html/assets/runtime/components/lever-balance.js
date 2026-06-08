(function initLeverBalance(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const components = root.components = root.components || {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function createLeverBalance({
    balanceThreshold = 2,
    maxAngle = 0.24
  } = {}) {
    const state = {
      leftArm: 0,
      rightArm: 0,
      leftForce: 0,
      rightForce: 0,
      leftTorque: 0,
      rightTorque: 0,
      balanced: false,
      tests: []
    };

    function cloneTests() {
      return state.tests.map((entry) => ({ ...entry }));
    }

    function currentAngle() {
      return clamp((state.leftTorque - state.rightTorque) / 180, -maxAngle, maxAngle);
    }

    return {
      reset() {
        state.leftArm = 0;
        state.rightArm = 0;
        state.leftForce = 0;
        state.rightForce = 0;
        state.leftTorque = 0;
        state.rightTorque = 0;
        state.balanced = false;
        state.tests = [];
        return this.getState();
      },
      setLever({ leftArm, rightArm, leftForce, rightForce }) {
        state.leftArm = Number(leftArm);
        state.rightArm = Number(rightArm);
        state.leftForce = Number(leftForce);
        state.rightForce = Number(rightForce);
        state.leftTorque = round(state.leftArm * state.leftForce, 2);
        state.rightTorque = round(state.rightArm * state.rightForce, 2);
        return {
          accepted: true,
          state: this.getVisualState()
        };
      },
      observeLeverBalance() {
        if (state.leftTorque <= 0 || state.rightTorque <= 0) {
          return {
            accepted: false,
            reason: '请先加载参数',
            state: this.getVisualState()
          };
        }
        state.balanced = Math.abs(state.leftTorque - state.rightTorque) <= balanceThreshold;
        state.tests.push({
          lt: state.leftTorque,
          rt: state.rightTorque,
          balanced: state.balanced
        });
        return {
          accepted: true,
          balanced: state.balanced,
          state: this.getVisualState()
        };
      },
      getObservation() {
        return {
          leftTorque: state.leftTorque,
          rightTorque: state.rightTorque,
          diff: round(Math.abs(state.leftTorque - state.rightTorque), 2),
          balanced: state.balanced,
          angle: currentAngle(),
          tests: cloneTests()
        };
      },
      getVisualState() {
        return {
          leftArm: state.leftArm,
          rightArm: state.rightArm,
          leftForce: state.leftForce,
          rightForce: state.rightForce,
          leftTorque: state.leftTorque,
          rightTorque: state.rightTorque,
          angle: currentAngle(),
          balanced: state.balanced,
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

  components.createLeverBalance = createLeverBalance;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createLeverBalance };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
