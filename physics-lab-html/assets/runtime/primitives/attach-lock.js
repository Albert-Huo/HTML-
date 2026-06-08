(function initAttachLock(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};

  function attachLock({ aligned, distance, angleError = 0, lockThreshold, releaseThreshold, locked = false }) {
    const isAligned = !!aligned;
    const shouldLock = !locked && isAligned && distance <= lockThreshold;
    const shouldRelease = !!locked && (!isAligned || distance >= releaseThreshold);

    return {
      locked: shouldLock ? true : (shouldRelease ? false : !!locked),
      shouldLock,
      shouldRelease
    };
  }

  primitives.attachLock = attachLock;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { attachLock };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
