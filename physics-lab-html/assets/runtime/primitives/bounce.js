(function initBounce(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function computeBounce({ velocity, normal, restitution, minBounceDistance, maxBounceDistance }) {
    const vDotN = (velocity.x || 0) * (normal.x || 0) + (velocity.y || 0) * (normal.y || 0);
    if (vDotN >= 0) {
      return {
        bounceDx: 0,
        bounceDy: 0,
        nextVelocity: {
          x: velocity.x || 0,
          y: velocity.y || 0
        }
      };
    }
    const projectedSpeed = Math.abs(vDotN);
    const bounceDistance = clamp(
      projectedSpeed * (restitution == null ? 1 : restitution),
      minBounceDistance == null ? 0 : minBounceDistance,
      maxBounceDistance == null ? Infinity : maxBounceDistance
    );

    return {
      bounceDx: (normal.x || 0) * bounceDistance,
      bounceDy: (normal.y || 0) * bounceDistance,
      nextVelocity: {
        x: (velocity.x || 0) - (1 + (restitution == null ? 1 : restitution)) * vDotN * (normal.x || 0),
        y: (velocity.y || 0) - (1 + (restitution == null ? 1 : restitution)) * vDotN * (normal.y || 0)
      }
    };
  }

  primitives.computeBounce = computeBounce;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { computeBounce };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
