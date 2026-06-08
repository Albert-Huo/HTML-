(function initThermalObservationBench(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const components = root.components = root.components || {};

  function round(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function cloneRecords(records) {
    return records.map((entry) => ({ ...entry }));
  }

  function createThermalObservationBench({
    profile = 'sublimation-condensation'
  } = {}) {
    const state = {
      profile,
      elapsedSec: 0,
      running: false,
      activeCondition: 'none',
      records: [],
      observables: {}
    };

    function resetProfile(nextProfile = profile) {
      state.profile = nextProfile;
      state.elapsedSec = 0;
      state.running = false;
      state.activeCondition = 'none';
      state.records = [];
      if (nextProfile === 'sublimation-condensation') {
        state.observables = {
          temperatureC: 20,
          solidLeft: 100,
          gasLevel: 0,
          coolingLevel: 0,
          crystalLevel: 0
        };
      } else {
        state.observables = {
          hasPrimed: false,
          massA: 30,
          massB: 30,
          naturalRate: 0.015,
          vaporBudgetA: 0,
          vaporBudgetB: 0,
          conditionFlags: {
            heat: false,
            spread: false,
            fan: false
          }
        };
      }
    }

    function setConditionFlags(name) {
      if (!state.observables.conditionFlags) return;
      state.observables.conditionFlags = {
        heat: name === 'heat',
        spread: name === 'spread',
        fan: name === 'fan'
      };
    }

    resetProfile(profile);

    return {
      reset({ profile: nextProfile = state.profile } = {}) {
        resetProfile(nextProfile);
        return this.getState();
      },
      prime() {
        if (state.profile !== 'evaporation-compare') {
          return { accepted: true, state: this.getVisualState() };
        }
        state.observables.hasPrimed = true;
        return { accepted: true, state: this.getVisualState() };
      },
      setCondition(name) {
        if (!['none', 'heat', 'cool', 'spread', 'fan'].includes(name)) {
          throw new RangeError(`Unsupported thermal condition: ${name}`);
        }
        if (state.profile === 'evaporation-compare' && name !== 'none' && !state.observables.hasPrimed) {
          return {
            accepted: false,
            reason: '请先完成滴水准备',
            state: this.getVisualState()
          };
        }
        state.activeCondition = name;
        setConditionFlags(name);
        return { accepted: true, state: this.getVisualState() };
      },
      tick(dtSec = 1) {
        const dt = Math.max(0, Number(dtSec));
        state.elapsedSec = round(state.elapsedSec + dt, 2);
        state.running = state.activeCondition !== 'none';

        if (state.profile === 'sublimation-condensation') {
          const obs = state.observables;
          if (state.activeCondition === 'heat') {
            obs.temperatureC = round(Math.min(100, obs.temperatureC + 2.4 * dt), 2);
            const release = obs.temperatureC > 80 ? Math.min(obs.solidLeft, (obs.temperatureC - 75) * 0.18 * dt) : 0;
            obs.solidLeft = round(clamp(obs.solidLeft - release, 0, 100), 2);
            obs.gasLevel = round(clamp(obs.gasLevel + release * 1.1, 0, 100), 2);
            obs.crystalLevel = round(clamp(obs.crystalLevel - dt * 0.6, 0, 100), 2);
            obs.coolingLevel = round(clamp(obs.coolingLevel - dt * 0.5, 0, 100), 2);
          } else if (state.activeCondition === 'cool') {
            obs.coolingLevel = round(clamp(obs.coolingLevel + 1.8 * dt, 0, 100), 2);
            obs.temperatureC = round(Math.max(20, obs.temperatureC - 2.2 * dt), 2);
            const condense = Math.min(obs.gasLevel, (1.0 + obs.coolingLevel * 0.08) * dt);
            obs.gasLevel = round(clamp(obs.gasLevel - condense, 0, 100), 2);
            obs.crystalLevel = round(clamp(obs.crystalLevel + condense * 1.15, 0, 100), 2);
          } else {
            obs.temperatureC = round(obs.temperatureC + (25 - obs.temperatureC) * Math.min(1, dt * 0.08), 2);
          }
        } else {
          const obs = state.observables;
          if (!obs.hasPrimed) {
            return this.getVisualState();
          }
          const natural = obs.naturalRate * dt;
          let extraA = 0;
          if (state.activeCondition === 'heat') extraA = 0.05 * dt;
          if (state.activeCondition === 'spread') extraA = 0.035 * dt;
          if (state.activeCondition === 'fan') extraA = 0.03 * dt;

          obs.massA = round(clamp(obs.massA - natural - extraA, 0, 30), 3);
          obs.massB = round(clamp(obs.massB - natural, 0, 30), 3);
          obs.vaporBudgetA = round(30 - obs.massA, 3);
          obs.vaporBudgetB = round(30 - obs.massB, 3);
        }

        return this.getVisualState();
      },
      record(step = '', note = '') {
        const snapshot = {
          step,
          note,
          elapsedSec: state.elapsedSec,
          condition: state.activeCondition,
          ...state.observables,
          diff: state.profile === 'evaporation-compare'
            ? round(state.observables.massB - state.observables.massA, 3)
            : undefined
        };
        state.records.push(snapshot);
        return {
          accepted: true,
          record: snapshot,
          state: this.getVisualState()
        };
      },
      getObservation() {
        return {
          profile: state.profile,
          elapsedSec: state.elapsedSec,
          activeCondition: state.activeCondition,
          ...state.observables,
          diff: state.profile === 'evaporation-compare'
            ? round(state.observables.massB - state.observables.massA, 3)
            : undefined,
          records: cloneRecords(state.records)
        };
      },
      getVisualState() {
        return {
          profile: state.profile,
          running: state.running,
          elapsedSec: state.elapsedSec,
          activeCondition: state.activeCondition,
          observables: { ...state.observables, conditionFlags: state.observables.conditionFlags ? { ...state.observables.conditionFlags } : undefined },
          records: cloneRecords(state.records)
        };
      },
      getState() {
        return {
          ...state,
          observables: { ...state.observables, conditionFlags: state.observables.conditionFlags ? { ...state.observables.conditionFlags } : undefined },
          records: cloneRecords(state.records)
        };
      }
    };
  }

  components.createThermalObservationBench = createThermalObservationBench;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createThermalObservationBench };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
