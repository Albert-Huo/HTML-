(function initSpringScale(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  function createSpringScale({ x, y, width = 110, height = 168, maxN = 8 }) {
    const state = { x, y, width, height, maxN, force: 0 };

    function getHookAnchor() {
      return {
        x: state.x + state.width / 2,
        y: state.y + state.height - 8
      };
    }

    return {
      reset() {
        state.force = 0;
      },
      setForce(value) {
        state.force = Math.max(0, Math.min(state.maxN, value));
      },
      read() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => source.force,
          format: (value) => `${value.toFixed(2)} N`
        });
      },
      getHookAnchor,
      getVisualState() {
        return {
          ratio: state.maxN === 0 ? 0 : state.force / state.maxN,
          label: this.read().displayText
        };
      },
      snapLoad({ loadRect, threshold = 18, gap = 0 }) {
        const anchor = getHookAnchor();
        return primitives.snapToAnchor({
          subjectRect: loadRect,
          anchorRect: {
            x: anchor.x,
            y: anchor.y,
            width: 0,
            height: 0
          },
          anchorSide: 'bottom',
          threshold,
          gap,
          align: 'center'
        });
      }
    };
  }

  components.createSpringScale = createSpringScale;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createSpringScale };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
