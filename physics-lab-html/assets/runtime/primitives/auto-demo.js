(function initAutoDemo(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};

  function createDemoError(code) {
    const error = new Error(code);
    error.code = code;
    return error;
  }

  function resolveFailureCode(error) {
    if (!error) return 'AUTO_DEMO_FAILED';
    return error.code || error.message || 'AUTO_DEMO_FAILED';
  }

  function resolveHook(step, hookName, sharedHook, index) {
    if (typeof sharedHook === 'function') {
      return () => sharedHook(step, index);
    }
    if (typeof step[hookName] === 'function') {
      return () => step[hookName](index);
    }
    return null;
  }

  function createAutoDemoRunner({
    steps = [],
    beforeStep,
    runStep,
    assertStep,
    recover = async () => {}
  }) {
    const state = {
      autoPlaying: false,
      stopRequested: false,
      failureCode: '',
      recoveryError: ''
    };

    return {
      async start() {
        if (state.autoPlaying) {
          throw createDemoError('AUTO_DEMO_ALREADY_RUNNING');
        }

        state.autoPlaying = true;
        state.stopRequested = false;
        state.failureCode = '';
        state.recoveryError = '';

        try {
          for (let index = 0; index < steps.length; index += 1) {
            const step = steps[index];
            const before = resolveHook(step, 'before', beforeStep, index);
            const run = resolveHook(step, 'run', runStep, index);
            const assert = resolveHook(step, 'assert', assertStep, index);
            const usesRecordContract = Boolean(before || assert);

            if (usesRecordContract && (!before || !assert)) {
              throw createDemoError('AUTO_DEMO_RECORD_ASSERTION_CONTRACT');
            }

            if (state.stopRequested) break;
            if (before) {
              await before();
            }

            if (state.stopRequested) break;
            if (run) {
              await run();
            }

            if (state.stopRequested) break;
            if (assert) {
              await assert();
            }
          }
        } catch (error) {
          state.failureCode = resolveFailureCode(error);
          try {
            await recover(error);
          } catch (recoverError) {
            state.recoveryError = resolveFailureCode(recoverError);
            error.recoveryError = recoverError;
          }
          throw error;
        } finally {
          state.autoPlaying = false;
          state.stopRequested = false;
        }
      },
      stop() {
        state.stopRequested = true;
        return this.getState();
      },
      getState() {
        return { ...state };
      }
    };
  }

  primitives.createAutoDemoRunner = createAutoDemoRunner;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createAutoDemoRunner };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
