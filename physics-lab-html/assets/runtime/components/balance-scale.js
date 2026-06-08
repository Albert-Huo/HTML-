(function initBalanceScale(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  const DEFAULT_WEIGHTS = Object.freeze([
    { id: 'w50', mass: 50, kind: 'weight' },
    { id: 'w20a', mass: 20, kind: 'weight' },
    { id: 'w20b', mass: 20, kind: 'weight' },
    { id: 'w10', mass: 10, kind: 'weight' },
    { id: 'w5', mass: 5, kind: 'weight' }
  ]);

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function roundToStep(value, step) {
    return Math.round(value / step) * step;
  }

  function normalizeWeight(weight, index) {
    if (typeof weight === 'number') {
      return {
        id: `w${index}`,
        mass: weight,
        kind: 'weight'
      };
    }

    return {
      id: weight.id || `w${index}`,
      mass: Number(weight.mass != null ? weight.mass : weight.value),
      kind: 'weight'
    };
  }

  function defaultZones({ x, y, width, height }) {
    return {
      left: {
        x: x + width * 0.08,
        y: y + height * 0.1,
        width: width * 0.26,
        height: height * 0.2
      },
      right: {
        x: x + width * 0.66,
        y: y + height * 0.1,
        width: width * 0.26,
        height: height * 0.2
      },
      shelf: {
        x: x + width * 0.02,
        y: y + height * 0.62,
        width: width * 0.22,
        height: height * 0.22
      },
      box: {
        x: x + width * 0.7,
        y: y + height * 0.58,
        width: width * 0.24,
        height: height * 0.24
      }
    };
  }

  function createBalanceScale({
    x = 0,
    y = 0,
    width = 320,
    height = 220,
    objectId = 'object',
    objectMass = 0,
    weights = DEFAULT_WEIGHTS,
    riderMax = 5,
    riderStep = 0.1,
    nutRange = { min: -5, max: 5 },
    balanceThreshold = 0.12,
    maxTilt = 20,
    enforceLabRule = true,
    zones
  } = {}) {
    const items = [
      { id: objectId, mass: Number(objectMass), kind: 'object' },
      ...weights.map(normalizeWeight)
    ];

    const itemById = Object.fromEntries(items.map((item) => [item.id, item]));
    const geometry = { x, y, width, height };
    const state = {
      x,
      y,
      width,
      height,
      objectId,
      objectMass: Number(objectMass),
      riderMax,
      riderStep,
      nutRange: { min: nutRange.min, max: nutRange.max },
      balanceThreshold,
      maxTilt,
      enforceLabRule,
      nutOffset: 0,
      riderValue: 0,
      leftLoad: 0,
      rightLoad: 0,
      diffText: '平衡',
      itemsPos: {},
      zones: Object.assign(defaultZones(geometry), zones || {})
    };

    function assignDefaultPositions() {
      for (const item of items) {
        state.itemsPos[item.id] = item.kind === 'object' ? 'shelf' : 'box';
      }
    }

    function refreshLoads() {
      state.leftLoad = 0;
      state.rightLoad = 0;

      for (const item of items) {
        const currentMass = item.kind === 'object' ? state.objectMass : item.mass;
        if (state.itemsPos[item.id] === 'left') state.leftLoad += currentMass;
        if (state.itemsPos[item.id] === 'right') state.rightLoad += currentMass;
      }
    }

    function getNetDiff() {
      return state.leftLoad - (state.rightLoad + state.riderValue) + state.nutOffset;
    }

    function getDiffText(diff, isBalanced) {
      if (isBalanced) return '平衡';
      return diff > 0 ? '左偏' : '右偏';
    }

    function solveBalance() {
      refreshLoads();
      const rawDiff = Number(getNetDiff().toFixed(4));
      const diff = Object.is(rawDiff, -0) ? 0 : rawDiff;
      const isBalanced = Math.abs(diff) < state.balanceThreshold;
      const rawAngle = clamp(diff * -2.5, -state.maxTilt, state.maxTilt);
      const pointerAngle = Object.is(rawAngle, -0) ? 0 : rawAngle;
      state.diffText = getDiffText(diff, isBalanced);

      return {
        leftLoad: state.leftLoad,
        rightLoad: state.rightLoad,
        riderValue: state.riderValue,
        nutOffset: state.nutOffset,
        diff,
        isBalanced,
        pointerAngle,
        diffText: state.diffText
      };
    }

    function getDropZoneRect(target) {
      const zone = state.zones[target];
      if (!zone) {
        throw new RangeError(`Unsupported balance-scale target: ${target}`);
      }
      return {
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height
      };
    }

    function validatePlacement(item, target) {
      if (!state.enforceLabRule) return { accepted: true };
      if (item.kind === 'object' && (target === 'right' || target === 'box')) {
        return { accepted: false, reason: '待测物体应放左盘或器材架。' };
      }
      if (item.kind === 'weight' && (target === 'left' || target === 'shelf')) {
        return { accepted: false, reason: '砝码应放右盘或砝码盒。' };
      }
      return { accepted: true };
    }

    assignDefaultPositions();
    solveBalance();

    return {
      reset({ objectMass: nextMass, nutOffset = 0 } = {}) {
        if (typeof nextMass === 'number') {
          state.objectMass = nextMass;
        }
        state.nutOffset = clamp(Number(nutOffset), state.nutRange.min, state.nutRange.max);
        state.riderValue = 0;
        assignDefaultPositions();
        return solveBalance();
      },
      placeItem(itemId, target) {
        const item = itemById[itemId];
        if (!item) {
          throw new Error(`Unknown balance-scale item: ${itemId}`);
        }
        getDropZoneRect(target);
        const validation = validatePlacement(item, target);
        if (!validation.accepted) {
          return {
            accepted: false,
            reason: validation.reason,
            target,
            state: this.getVisualState()
          };
        }

        state.itemsPos[itemId] = target;
        return {
          accepted: true,
          target,
          state: solveBalance()
        };
      },
      adjustNut(delta) {
        state.nutOffset = clamp(
          Number((state.nutOffset + delta).toFixed(2)),
          state.nutRange.min,
          state.nutRange.max
        );
        return solveBalance();
      },
      setRider(value) {
        const quantized = roundToStep(Number(value), state.riderStep);
        state.riderValue = clamp(
          Number(quantized.toFixed(1)),
          0,
          state.riderMax
        );
        return solveBalance();
      },
      solveBalance,
      readMass() {
        return primitives.measureBinding({
          sourceState: state,
          compute: () => state.rightLoad + state.riderValue,
          format: (value) => `${value.toFixed(1)} g`
        });
      },
      snapItem({ itemRect, target, threshold = 18 }) {
        return primitives.snapToAnchor({
          subjectRect: itemRect,
          anchorRect: getDropZoneRect(target),
          anchorSide: 'center',
          threshold,
          gap: 0,
          align: 'center'
        });
      },
      getDropZoneRect,
      getVisualState() {
        const balance = solveBalance();
        return {
          ...balance,
          measuredMass: this.readMass().value,
          riderRatio: state.riderMax === 0 ? 0 : state.riderValue / state.riderMax,
          itemsPos: { ...state.itemsPos }
        };
      },
      getState() {
        return {
          objectId: state.objectId,
          objectMass: state.objectMass,
          nutOffset: state.nutOffset,
          riderValue: state.riderValue,
          leftLoad: state.leftLoad,
          rightLoad: state.rightLoad,
          diffText: state.diffText,
          itemsPos: { ...state.itemsPos }
        };
      }
    };
  }

  components.createBalanceScale = createBalanceScale;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createBalanceScale };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
