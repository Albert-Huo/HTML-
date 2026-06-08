(function initSnap(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};

  function centerOf(rect) {
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
  }

  function crossAxisPosition(anchorRect, subjectRect, axis, align) {
    if (axis === 'x') {
      if (align === 'start') return anchorRect.x;
      if (align === 'end') return anchorRect.x + anchorRect.width - subjectRect.width;
      return anchorRect.x + (anchorRect.width - subjectRect.width) / 2;
    }

    if (align === 'start') return anchorRect.y;
    if (align === 'end') return anchorRect.y + anchorRect.height - subjectRect.height;
    return anchorRect.y + (anchorRect.height - subjectRect.height) / 2;
  }

  function snapTargetPosition(subjectRect, anchorRect, anchorSide, gap, align) {
    if (anchorSide === 'right') {
      return {
        x: anchorRect.x + anchorRect.width + gap,
        y: crossAxisPosition(anchorRect, subjectRect, 'y', align)
      };
    }

    if (anchorSide === 'left') {
      return {
        x: anchorRect.x - subjectRect.width - gap,
        y: crossAxisPosition(anchorRect, subjectRect, 'y', align)
      };
    }

    if (anchorSide === 'top') {
      return {
        x: crossAxisPosition(anchorRect, subjectRect, 'x', align),
        y: anchorRect.y - subjectRect.height - gap
      };
    }

    if (anchorSide === 'bottom') {
      return {
        x: crossAxisPosition(anchorRect, subjectRect, 'x', align),
        y: anchorRect.y + anchorRect.height + gap
      };
    }

    if (anchorSide === 'center') {
      return {
        x: anchorRect.x + (anchorRect.width - subjectRect.width) / 2,
        y: anchorRect.y + (anchorRect.height - subjectRect.height) / 2
      };
    }

    throw new RangeError(`Unsupported anchorSide: ${anchorSide}`);
  }

  function snapToAnchor({
    subjectRect,
    anchorRect,
    anchorSide,
    threshold,
    gap = 0,
    align = 'center'
  }) {
    const target = snapTargetPosition(subjectRect, anchorRect, anchorSide, gap, align);
    const distance = Math.hypot(subjectRect.x - target.x, subjectRect.y - target.y);
    const snapped = distance <= threshold;

    return {
      snapped,
      x: snapped ? target.x : subjectRect.x,
      y: snapped ? target.y : subjectRect.y,
      distance
    };
  }

  primitives.snapToAnchor = snapToAnchor;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { snapToAnchor };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
