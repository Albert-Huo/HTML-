(function initGuidedFSM(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};

  function clampStep(index, taskCount) {
    if (taskCount <= 0) return 0;
    return Math.max(0, Math.min(taskCount - 1, index));
  }

  function createGuidedTaskFSM({
    tasks = [],
    currentTask = 0,
    freeMode = false,
    completed = false
  }) {
    const state = {
      currentTask: clampStep(currentTask, tasks.length),
      freeMode,
      completed,
      stepWarnIdx: -1,
      warningMessage: ''
    };

    function clearWarning() {
      state.stepWarnIdx = -1;
      state.warningMessage = '';
    }

    return {
      setStep(index) {
        state.currentTask = clampStep(index, tasks.length);
        state.completed = false;
        clearWarning();
        return this.getState();
      },
      warnCurrentStep(msg = '') {
        state.stepWarnIdx = state.currentTask;
        state.warningMessage = msg;
        return this.getState();
      },
      tryPass(ctx) {
        const task = tasks[state.currentTask];
        const canPass = state.freeMode || !task || typeof task.check !== 'function' || task.check(ctx);

        if (!canPass) {
          state.stepWarnIdx = state.currentTask;
          state.warningMessage = task && task.warnMessage ? task.warnMessage : '';
          return {
            passed: false,
            currentTask: state.currentTask,
            completed: state.completed
          };
        }

        clearWarning();

        if (state.currentTask >= tasks.length - 1) {
          state.completed = true;
          return {
            passed: true,
            currentTask: state.currentTask,
            completed: true
          };
        }

        state.currentTask += 1;
        return {
          passed: true,
          currentTask: state.currentTask,
          completed: state.completed
        };
      },
      renderStepState() {
        return tasks.map((task, index) => {
          let status = 'pending';

          if (state.stepWarnIdx === index) {
            status = 'warning';
          } else if (state.completed || index < state.currentTask) {
            status = 'done';
          } else if (index === state.currentTask) {
            status = 'active';
          }

          return {
            index,
            status,
            label: task && task.label ? task.label : ''
          };
        });
      },
      getState() {
        return { ...state };
      }
    };
  }

  primitives.createGuidedTaskFSM = createGuidedTaskFSM;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createGuidedTaskFSM };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
