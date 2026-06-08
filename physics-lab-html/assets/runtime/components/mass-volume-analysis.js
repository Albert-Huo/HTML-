(function initMassVolumeAnalysis(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  const DEFAULT_MATERIALS = Object.freeze({
    aluminum: Object.freeze({ label: '铝块', density: 2.7 }),
    wood: Object.freeze({ label: '木块', density: 0.6 }),
    iron: Object.freeze({ label: '铁块', density: 7.8 })
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function cloneMaterials(materials) {
    return JSON.parse(JSON.stringify(materials));
  }

  function createMassVolumeAnalysis({
    materials = DEFAULT_MATERIALS,
    initialMaterial = 'aluminum',
    initialVolume = 20,
    minVolume = 10,
    maxVolume = 100,
    volumeStep = 5
  } = {}) {
    const materialMap = cloneMaterials(materials);
    const state = {
      materials: materialMap,
      material: initialMaterial,
      volume: Number(initialVolume),
      minVolume: Number(minVolume),
      maxVolume: Number(maxVolume),
      volumeStep: Number(volumeStep),
      records: [],
      fitVisible: false,
      analysisOk: false,
      fitSummary: '',
      fits: {},
      measuredAtCurrent: false
    };

    function ensureMaterial(key) {
      if (!state.materials[key]) {
        throw new Error(`Unknown mass-volume material: ${key}`);
      }
      return state.materials[key];
    }

    function quantizeVolume(value) {
      return clamp(
        Math.round(Number(value) / state.volumeStep) * state.volumeStep,
        state.minVolume,
        state.maxVolume
      );
    }

    function currentMass() {
      return round(ensureMaterial(state.material).density * state.volume, 1);
    }

    function getMeasureRecords(material) {
      return state.records.filter(
        (record) => record.kind === 'measure' && (!material || record.material === material)
      );
    }

    function uniqueVolumes(material) {
      return [
        ...new Set(
          getMeasureRecords(material)
            .map((record) => record.volume)
        )
      ].sort((a, b) => a - b);
    }

    function materialKeysWithMinPoints(minPoints = 2) {
      return Object.keys(state.materials).filter((key) => uniqueVolumes(key).length >= Number(minPoints));
    }

    function fitLinear(points) {
      const n = points.length;
      if (n < 2) {
        return null;
      }
      let sx = 0;
      let sy = 0;
      let sxy = 0;
      let sxx = 0;
      for (const point of points) {
        sx += point.volume;
        sy += point.mass;
        sxy += point.volume * point.mass;
        sxx += point.volume * point.volume;
      }
      const denom = n * sxx - sx * sx;
      if (Math.abs(denom) < 1e-6) {
        return null;
      }
      return {
        slope: round((n * sxy - sx * sy) / denom, 4),
        intercept: round((sy - ((n * sxy - sx * sy) / denom) * sx) / n, 4)
      };
    }

    function clearAnalysis() {
      state.fitVisible = false;
      state.analysisOk = false;
      state.fitSummary = '';
      state.fits = {};
    }

    return {
      reset({
        material = initialMaterial,
        volume = initialVolume
      } = {}) {
        ensureMaterial(material);
        state.material = material;
        state.volume = quantizeVolume(volume);
        state.records = [];
        state.measuredAtCurrent = false;
        clearAnalysis();
        return this.getState();
      },
      setMaterial(key) {
        ensureMaterial(key);
        state.material = key;
        state.measuredAtCurrent = false;
        return this.getVisualState();
      },
      setVolume(value) {
        state.volume = quantizeVolume(value);
        state.measuredAtCurrent = false;
        return this.getVisualState();
      },
      currentMass,
      uniqueVolumes,
      materialKeysWithMinPoints,
      getMeasureRecords,
      measure() {
        if (
          state.records.some(
            (record) =>
              record.kind === 'measure' &&
              record.material === state.material &&
              record.volume === state.volume
          )
        ) {
          return {
            accepted: false,
            reason: '该材料与体积组合已记录，无需重复写入。',
            state: this.getVisualState()
          };
        }
        const row = {
          kind: 'measure',
          material: state.material,
          volume: state.volume,
          mass: currentMass(),
          note: `${ensureMaterial(state.material).label}测量点`
        };
        state.records.push(row);
        if (state.records.length > 200) {
          state.records.shift();
        }
        state.measuredAtCurrent = true;
        clearAnalysis();
        return {
          accepted: true,
          row,
          state: this.getVisualState()
        };
      },
      recordAnalysis(note) {
        const row = {
          kind: 'analysis',
          note: String(note || '分析记录')
        };
        state.records.push(row);
        if (state.records.length > 200) {
          state.records.shift();
        }
        return row;
      },
      runFitAnalysis() {
        const keys = materialKeysWithMinPoints(2);
        if (keys.length < 2) {
          clearAnalysis();
          return {
            accepted: false,
            reason: '至少需要两种材料、且每种至少两条记录，才能比较斜率。',
            state: this.getVisualState()
          };
        }
        const fits = keys
          .map((key) => ({ key, fit: fitLinear(getMeasureRecords(key)) }))
          .filter((item) => !!item.fit);
        if (fits.length < 2) {
          clearAnalysis();
          return {
            accepted: false,
            reason: '拟合失败，请补充数据。',
            state: this.getVisualState()
          };
        }
        state.fitVisible = true;
        state.analysisOk = true;
        state.fits = Object.fromEntries(
          fits.map((item) => [item.key, { ...item.fit }])
        );
        state.fitSummary = fits
          .map((item) => {
            const label = ensureMaterial(item.key).label;
            const sign = item.fit.intercept >= 0 ? '+' : '';
            return `${label}: m≈${item.fit.slope.toFixed(2)}V${sign}${item.fit.intercept.toFixed(2)}`;
          })
          .join('；');
        return {
          accepted: true,
          summary: state.fitSummary,
          fits: { ...state.fits },
          state: this.getVisualState()
        };
      },
      getGraphSeries() {
        return Object.keys(state.materials).map((key) => ({
          key,
          label: state.materials[key].label,
          points: getMeasureRecords(key).map((record) => ({
            volume: record.volume,
            mass: record.mass
          })),
          fit: state.fits[key] ? { ...state.fits[key] } : null
        }));
      },
      readMass() {
        return primitives.measureBinding({
          sourceState: state,
          compute: () => currentMass(),
          format: (value) => `${value.toFixed(1)} g`
        });
      },
      readVolume() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.volume,
          format: (value) => `${value} cm³`
        });
      },
      readMeasureCount() {
        return primitives.measureBinding({
          sourceState: state,
          compute: () => getMeasureRecords().length,
          format: (value) => `${value}`
        });
      },
      getVisualState() {
        return {
          material: state.material,
          materialLabel: ensureMaterial(state.material).label,
          volume: state.volume,
          currentMass: currentMass(),
          measureCount: getMeasureRecords().length,
          fitVisible: state.fitVisible,
          analysisOk: state.analysisOk,
          fitSummary: state.fitSummary,
          measuredAtCurrent: state.measuredAtCurrent
        };
      },
      getState() {
        return {
          materials: cloneMaterials(state.materials),
          material: state.material,
          volume: state.volume,
          minVolume: state.minVolume,
          maxVolume: state.maxVolume,
          volumeStep: state.volumeStep,
          records: [...state.records],
          fitVisible: state.fitVisible,
          analysisOk: state.analysisOk,
          fitSummary: state.fitSummary,
          fits: cloneMaterials(state.fits),
          measuredAtCurrent: state.measuredAtCurrent
        };
      }
    };
  }

  components.createMassVolumeAnalysis = createMassVolumeAnalysis;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createMassVolumeAnalysis };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
