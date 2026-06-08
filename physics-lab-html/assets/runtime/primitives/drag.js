(function initDrag(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function validateAxis(axis) {
    if (axis !== 'x' && axis !== 'y' && axis !== 'both') {
      throw new RangeError(`Unsupported axis: ${axis}`);
    }
  }

  function requireLockedAxisPosition(axis, targetRect) {
    if (axis === 'x') {
      if (!targetRect || typeof targetRect.y !== 'number') {
        throw new TypeError('dragWithinStage requires targetRect.y for axis="x"');
      }
      return targetRect.y;
    }

    if (axis === 'y') {
      if (!targetRect || typeof targetRect.x !== 'number') {
        throw new TypeError('dragWithinStage requires targetRect.x for axis="y"');
      }
      return targetRect.x;
    }

    return null;
  }

  function dragWithinStage({
    pointer,
    offset,
    itemSize,
    targetRect,
    stageRect,
    axis = 'both',
    clampPadding = 0
  }) {
    validateAxis(axis);
    const width = itemSize ? itemSize.width : targetRect.width;
    const height = itemSize ? itemSize.height : targetRect.height;
    const stageX = stageRect.x || 0;
    const stageY = stageRect.y || 0;
    const minX = stageX + clampPadding;
    const minY = stageY + clampPadding;
    const maxX = stageX + stageRect.width - width - clampPadding;
    const maxY = stageY + stageRect.height - height - clampPadding;
    const rawX = pointer.x - offset.x;
    const rawY = pointer.y - offset.y;
    const currentX = axis === 'y' ? requireLockedAxisPosition(axis, targetRect) : (targetRect ? targetRect.x : 0);
    const currentY = axis === 'x' ? requireLockedAxisPosition(axis, targetRect) : (targetRect ? targetRect.y : 0);

    return {
      nextX: axis === 'y' ? currentX : clamp(rawX, minX, maxX),
      nextY: axis === 'x' ? currentY : clamp(rawY, minY, maxY),
      dragging: true
    };
  }

  primitives.dragWithinStage = dragWithinStage;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { dragWithinStage };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
