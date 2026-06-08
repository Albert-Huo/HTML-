(function initElasticPlasticBench(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  const DEFAULT_MATERIALS = Object.freeze([
    Object.freeze({
      key: 'rubber',
      label: '橡皮筋',
      stiffness: 1.0,
      elastic: true,
      threshold: 258,
      springK: 0.11,
      damping: 0.78,
      plasticTarget: 120
    }),
    Object.freeze({
      key: 'spring',
      label: '钢弹簧',
      stiffness: 2.1,
      elastic: true,
      threshold: 232,
      springK: 0.13,
      damping: 0.82,
      plasticTarget: 120
    }),
    Object.freeze({
      key: 'clay',
      label: '橡皮泥',
      stiffness: 1.2,
      elastic: false,
      threshold: 258,
      springK: 0,
      damping: 0,
      plasticTarget: 182
    })
  ]);

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function cloneMaterials(materials, baseHeight) {
    return materials.map((material) => ({
      ...material,
      height: baseHeight,
      maxHeight: baseHeight,
      released: false,
      recovered: false,
      status: '待拉伸',
      animating: false,
      velocity: 0,
      settleElapsedSec: 0,
      settleFrom: baseHeight
    }));
  }

  function createElasticPlasticBench({
    baseHeight = 120,
    maxHeight = 320,
    plasticSettleDurationSec = 0.32,
    materials = DEFAULT_MATERIALS
  } = {}) {
    const state = {
      baseHeight: Number(baseHeight),
      maxHeight: Number(maxHeight),
      plasticSettleDurationSec: Number(plasticSettleDurationSec),
      materials: cloneMaterials(materials, Number(baseHeight)),
      draggingKey: '',
      dragStartHeight: Number(baseHeight),
      records: []
    };

    function materialByKey(key) {
      const material = state.materials.find((entry) => entry.key === key);
      if (!material) {
        throw new Error(`Unknown elastic-plastic material: ${key}`);
      }
      return material;
    }

    function setMaterialHeight(key, height) {
      const material = materialByKey(key);
      material.height = clamp(Number(height), state.baseHeight, state.maxHeight);
      material.maxHeight = Math.max(material.maxHeight, material.height);
      return material.height;
    }

    function resetMaterial(key) {
      const material = materialByKey(key);
      material.height = state.baseHeight;
      material.maxHeight = state.baseHeight;
      material.released = false;
      material.recovered = false;
      material.status = '待拉伸';
      material.animating = false;
      material.velocity = 0;
      material.settleElapsedSec = 0;
      material.settleFrom = state.baseHeight;
      return material;
    }

    function canPassElastic(key) {
      const material = materialByKey(key);
      return (
        material.maxHeight >= material.threshold &&
        material.released &&
        !material.animating &&
        material.recovered
      );
    }

    function canPassPlastic(key) {
      const material = materialByKey(key);
      return (
        material.maxHeight >= material.threshold &&
        material.released &&
        !material.animating &&
        !material.recovered &&
        material.height >= state.baseHeight + 45
      );
    }

    function canPassMaterial(key) {
      const material = materialByKey(key);
      return material.elastic ? canPassElastic(key) : canPassPlastic(key);
    }

    function resultText(key) {
      return canPassMaterial(key) ? '达标' : '未达标';
    }

    function releaseMaterial(material) {
      material.released = true;
      material.animating = true;
      material.velocity = 0;
      material.settleElapsedSec = 0;
      material.settleFrom = material.height;
      material.status = material.elastic ? '回弹中' : '塑性定型中';
    }

    function stepElastic(material) {
      const force = (state.baseHeight - material.height) * material.springK;
      material.velocity = (material.velocity + force) * material.damping;
      setMaterialHeight(material.key, material.height + material.velocity);
      if (Math.abs(material.velocity) < 0.08 && Math.abs(material.height - state.baseHeight) < 0.6) {
        material.height = state.baseHeight;
        material.animating = false;
        material.recovered = true;
        material.velocity = 0;
        material.status = '已回弹';
      }
    }

    function stepPlastic(material, dt) {
      material.settleElapsedSec = round(material.settleElapsedSec + dt, 6);
      const progress = clamp(
        material.settleElapsedSec / state.plasticSettleDurationSec,
        0,
        1
      );
      const ease = 1 - Math.pow(1 - progress, 3);
      const nextHeight = material.settleFrom + (material.plasticTarget - material.settleFrom) * ease;
      setMaterialHeight(material.key, nextHeight);
      if (progress >= 1) {
        material.height = material.plasticTarget;
        material.animating = false;
        material.recovered = false;
        material.status = '塑性残余';
      }
    }

    return {
      reset() {
        state.draggingKey = '';
        state.dragStartHeight = state.baseHeight;
        state.records = [];
        for (const material of state.materials) {
          resetMaterial(material.key);
        }
        return this.getState();
      },
      resetMaterialTrial(key) {
        resetMaterial(key);
        if (state.draggingKey === key) {
          state.draggingKey = '';
          state.dragStartHeight = state.baseHeight;
        }
        return this.getVisualState();
      },
      beginDrag(key) {
        const material = materialByKey(key);
        material.animating = false;
        material.velocity = 0;
        material.released = false;
        material.recovered = false;
        material.status = '拉伸中';
        material.settleElapsedSec = 0;
        material.settleFrom = material.height;
        state.draggingKey = key;
        state.dragStartHeight = material.height;
        return {
          accepted: true,
          state: this.getVisualState()
        };
      },
      updateDrag(totalDeltaY) {
        if (!state.draggingKey) {
          return this.getVisualState();
        }
        const material = materialByKey(state.draggingKey);
        const effectiveDy = Math.max(0, Number(totalDeltaY) || 0) / material.stiffness;
        setMaterialHeight(material.key, state.dragStartHeight + effectiveDy);
        return this.getVisualState();
      },
      releaseDrag() {
        if (!state.draggingKey) {
          return {
            accepted: false,
            reason: '当前没有处于拖拽中的材料。',
            state: this.getVisualState()
          };
        }
        const material = materialByKey(state.draggingKey);
        state.draggingKey = '';
        state.dragStartHeight = state.baseHeight;
        releaseMaterial(material);
        return {
          accepted: true,
          state: this.getVisualState()
        };
      },
      tick(dt) {
        let remainingSec = Math.max(0, Number(dt) || 0);
        while (remainingSec > 0) {
          const stepSec = Math.min(remainingSec, 1 / 60);
          remainingSec -= stepSec;
          for (const material of state.materials) {
            if (!material.animating) continue;
            if (material.elastic) {
              stepElastic(material);
            } else {
              stepPlastic(material, stepSec);
            }
          }
        }
        return this.getVisualState();
      },
      canPassElastic,
      canPassPlastic,
      canPassMaterial,
      resultText,
      record(step = '步骤', key) {
        const material = materialByKey(key);
        const entry = {
          step,
          material: material.label,
          maxLen: round(material.maxHeight, 1),
          rebound: material.recovered ? '回弹' : '不回弹'
        };
        state.records.push(entry);
        if (state.records.length > 120) {
          state.records.shift();
        }
        return entry;
      },
      readCurrentLength(key) {
        const material = materialByKey(key);
        return primitives.measureBinding({
          sourceState: material,
          compute: (source) => round(source.height, 1),
          format: (value) => `${value.toFixed(1)} px`
        });
      },
      readMaxLength(key) {
        const material = materialByKey(key);
        return primitives.measureBinding({
          sourceState: material,
          compute: (source) => round(source.maxHeight, 1),
          format: (value) => `${value.toFixed(1)} px`
        });
      },
      getMaterialState(key) {
        const material = materialByKey(key);
        return { ...material };
      },
      getVisualState() {
        return {
          draggingKey: state.draggingKey,
          activeMaterial: state.draggingKey || state.materials[0].key,
          recordCount: state.records.length,
          materials: state.materials.map((material) => ({
            key: material.key,
            label: material.label,
            height: material.height,
            maxHeight: material.maxHeight,
            status: material.status,
            released: material.released,
            recovered: material.recovered,
            animating: material.animating,
            resultText: resultText(material.key)
          }))
        };
      },
      getState() {
        return {
          baseHeight: state.baseHeight,
          maxHeight: state.maxHeight,
          plasticSettleDurationSec: state.plasticSettleDurationSec,
          draggingKey: state.draggingKey,
          dragStartHeight: state.dragStartHeight,
          records: [...state.records],
          materials: state.materials.map((material) => ({ ...material }))
        };
      }
    };
  }

  components.createElasticPlasticBench = createElasticPlasticBench;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createElasticPlasticBench };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
