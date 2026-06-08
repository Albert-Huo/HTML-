(function initContact(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};

  function resolveContactStop({ moverRect, obstacleRect, proposedDx = 0, proposedDy = 0 }) {
    const nextLeft = moverRect.left + proposedDx;
    const nextRight = moverRect.right + proposedDx;
    const nextTop = moverRect.top + proposedDy;
    const nextBottom = moverRect.bottom + proposedDy;

    const overlapsX = nextRight > obstacleRect.left && nextLeft < obstacleRect.right;
    const overlapsY = nextBottom > obstacleRect.top && nextTop < obstacleRect.bottom;

    if (!overlapsX || !overlapsY) {
      return {
        resolvedDx: proposedDx,
        resolvedDy: proposedDy,
        collided: false,
        normal: null
      };
    }

    if (proposedDx === 0 && proposedDy === 0) {
      return {
        resolvedDx: 0,
        resolvedDy: 0,
        collided: true,
        normal: null
      };
    }

    const xCorrection = proposedDx > 0
      ? obstacleRect.left - moverRect.right
      : proposedDx < 0
        ? obstacleRect.right - moverRect.left
        : Infinity;
    const yCorrection = proposedDy > 0
      ? obstacleRect.top - moverRect.bottom
      : proposedDy < 0
        ? obstacleRect.bottom - moverRect.top
        : Infinity;

    if (Math.abs(yCorrection) < Math.abs(xCorrection)) {
      return {
        resolvedDx: proposedDx,
        resolvedDy: yCorrection,
        collided: true,
        normal: proposedDy > 0 ? { x: 0, y: -1 } : { x: 0, y: 1 }
      };
    }

    return {
      resolvedDx: xCorrection,
      resolvedDy: proposedDy,
      collided: true,
      normal: proposedDx > 0 ? { x: -1, y: 0 } : { x: 1, y: 0 }
    };
  }

  primitives.resolveContactStop = resolveContactStop;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { resolveContactStop };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
