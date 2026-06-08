(function initMeasure(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};

  function measureBinding({ sourceState, compute, format = (value) => String(value) }) {
    const value = compute(sourceState);
    return {
      value,
      displayText: format(value)
    };
  }

  primitives.measureBinding = measureBinding;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { measureBinding };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
