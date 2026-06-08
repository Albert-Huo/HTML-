(function initDirection(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};

  function center(rect, axis) {
    return axis === 'x'
      ? rect.x + rect.width / 2
      : rect.y + rect.height / 2;
  }

  function inferImpulseDirection({ sourceRect, targetRect, axis, mode = 'push-away' }) {
    const sourceIsOnPositiveSide = center(sourceRect, axis) > center(targetRect, axis);
    const pushingAway = mode === 'push-away';
    const sign = pushingAway
      ? (sourceIsOnPositiveSide ? -1 : 1)
      : (sourceIsOnPositiveSide ? 1 : -1);

    if (axis === 'y') {
      return {
        direction: sign < 0 ? 'up' : 'down',
        sign
      };
    }

    return {
      direction: sign < 0 ? 'left' : 'right',
      sign
    };
  }

  primitives.inferImpulseDirection = inferImpulseDirection;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { inferImpulseDirection };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
