(function initMagneticPoleBench(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  const DEFAULT_NAIL_LAYOUT = Object.freeze([
    Object.freeze({ x: 312, y: 104 }),
    Object.freeze({ x: 396, y: 116 }),
    Object.freeze({ x: 482, y: 108 }),
    Object.freeze({ x: 348, y: 174 }),
    Object.freeze({ x: 438, y: 182 }),
    Object.freeze({ x: 528, y: 176 }),
    Object.freeze({ x: 388, y: 248 }),
    Object.freeze({ x: 486, y: 252 })
  ]);

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function createNailOffsets(index) {
    return {
      dx: ((index % 3) - 1) * 8,
      dy: (Math.floor(index / 3) % 3 - 1) * 6,
      angle: ((index * 27) % 120) - 60
    };
  }

  function createMagnetState({
    key,
    x,
    y,
    width,
    height,
    flipped = false,
    enabled = true
  }) {
    return {
      key,
      x,
      y,
      width,
      height,
      flipped: !!flipped,
      enabled: !!enabled,
      baseX: x,
      baseY: y
    };
  }

  function createMagneticPoleBench({
    magnetWidth = 146,
    magnetHeight = 42,
    activeBounds = { minX: 12, maxX: 560, minY: 26, maxY: 320 },
    targetBounds = { minX: 250, maxX: 560 },
    railY = 176,
    nailAttachDistancePx = 56,
    repelDistancePx = 140,
    repelScale = 0.11,
    attractDistancePx = 166,
    attractScale = 0.135,
    snapDistancePx = 48,
    keepSnapDistancePx = 86,
    railTolerancePx = 70,
    snapGapPx = 6,
    nailLayout = DEFAULT_NAIL_LAYOUT
  } = {}) {
    const state = {
      magnetWidth: Number(magnetWidth),
      magnetHeight: Number(magnetHeight),
      activeBounds: { ...activeBounds },
      targetBounds: { ...targetBounds },
      railY: Number(railY),
      nailAttachDistancePx: Number(nailAttachDistancePx),
      repelDistancePx: Number(repelDistancePx),
      repelScale: Number(repelScale),
      attractDistancePx: Number(attractDistancePx),
      attractScale: Number(attractScale),
      snapDistancePx: Number(snapDistancePx),
      keepSnapDistancePx: Number(keepSnapDistancePx),
      railTolerancePx: Number(railTolerancePx),
      snapGapPx: Number(snapGapPx),
      mode: 'free',
      magnets: {
        active: createMagnetState({
          key: 'active',
          x: 54,
          y: 126,
          width: Number(magnetWidth),
          height: Number(magnetHeight),
          flipped: false,
          enabled: true
        }),
        target: createMagnetState({
          key: 'target',
          x: 422,
          y: Number(railY),
          width: Number(magnetWidth),
          height: Number(magnetHeight),
          flipped: false,
          enabled: true
        })
      },
      nails: [],
      lastInteraction: '未接近',
      snapped: false,
      snapLock: { engaged: false, activeSide: '', targetSide: '' },
      targetShift: 0,
      pairText: '未接近',
      minDistance: Infinity,
      records: []
    };

    function magnetByKey(key) {
      const magnet = state.magnets[key];
      if (!magnet) {
        throw new Error(`Unknown magnet key: ${key}`);
      }
      return magnet;
    }

    function clampActivePosition(x, y) {
      return {
        x: clamp(Number(x), state.activeBounds.minX, state.activeBounds.maxX),
        y: clamp(Number(y), state.activeBounds.minY, state.activeBounds.maxY)
      };
    }

    function clampTargetX(x) {
      return clamp(Number(x), state.targetBounds.minX, state.targetBounds.maxX);
    }

    function setMagnetPosition(key, x, y) {
      const magnet = magnetByKey(key);
      if (key === 'active') {
        const next = clampActivePosition(x, y);
        magnet.x = next.x;
        magnet.y = next.y;
      } else {
        magnet.x = clampTargetX(x);
        magnet.y = state.railY;
      }
      return magnet;
    }

    function setMagnetFlipped(key, flipped) {
      const magnet = magnetByKey(key);
      magnet.flipped = !!flipped;
      return magnet.flipped;
    }

    function getPoles(key) {
      const magnet = magnetByKey(key);
      if (!magnet.enabled) {
        return [];
      }
      const cx = magnet.x + magnet.width / 2;
      const cy = magnet.y + magnet.height / 2;
      const offset = magnet.width / 4;
      return [
        {
          x: cx - offset,
          y: cy,
          type: magnet.flipped ? 'S' : 'N',
          side: 'left'
        },
        {
          x: cx + offset,
          y: cy,
          type: magnet.flipped ? 'N' : 'S',
          side: 'right'
        }
      ];
    }

    function activePoleText() {
      const poles = getPoles('active');
      return poles.length ? `左${poles[0].type} 右${poles[1].type}` : '--';
    }

    function poleSideOffset(side) {
      return side === 'left' ? state.magnetWidth / 4 : state.magnetWidth * 3 / 4;
    }

    function clearNails() {
      state.nails = [];
    }

    function scatterNails(count = 6) {
      clearNails();
      nailLayout.slice(0, Number(count)).forEach((point, index) => {
        const offsets = createNailOffsets(index);
        state.nails.push({
          id: `nail-${index + 1}`,
          x: point.x,
          y: point.y,
          baseX: point.x,
          baseY: point.y,
          angle: offsets.angle,
          attachedTo: null
        });
      });
      return this.getVisualState();
    }

    function getAttachedNailCount() {
      return state.nails.filter((nail) => !!nail.attachedTo).length;
    }

    function releaseSnapLock() {
      state.snapLock.engaged = false;
      state.snapLock.activeSide = '';
      state.snapLock.targetSide = '';
    }

    function getFacingPair() {
      const active = magnetByKey('active');
      const target = magnetByKey('target');
      if (!active.enabled || !target.enabled) {
        return null;
      }
      const activePoles = getPoles('active');
      const targetPoles = getPoles('target');
      let best = null;
      for (const activePole of activePoles) {
        for (const targetPole of targetPoles) {
          const d = distance(activePole, targetPole);
          if (!best || d < best.distance) {
            best = { activePole, targetPole, distance: d };
          }
        }
      }
      return best;
    }

    function lockTargetToActive(pair) {
      const target = magnetByKey('target');
      const desiredPoleX = pair.activePole.x + (pair.targetPole.side === 'left' ? state.snapGapPx : -state.snapGapPx);
      target.x = clampTargetX(desiredPoleX - poleSideOffset(pair.targetPole.side));
      target.y = state.railY;
    }

    function engageSnapLock(pair) {
      state.snapLock.engaged = true;
      state.snapLock.activeSide = pair.activePole.side;
      state.snapLock.targetSide = pair.targetPole.side;
      lockTargetToActive(pair);
      state.snapped = true;
      state.lastInteraction = '异极相吸';
    }

    function canKeepSnap(pair) {
      const active = magnetByKey('active');
      const target = magnetByKey('target');
      if (!state.snapLock.engaged || !pair) {
        return false;
      }
      if (!active.enabled || !target.enabled) {
        return false;
      }
      if (pair.activePole.type === pair.targetPole.type) {
        return false;
      }
      if (Math.abs(active.y - target.y) >= state.railTolerancePx + 8) {
        return false;
      }
      if (pair.distance > state.keepSnapDistancePx) {
        return false;
      }
      return true;
    }

    function updateNailAttachment() {
      const magnets = Object.values(state.magnets).filter((magnet) => magnet.enabled);
      for (let index = 0; index < state.nails.length; index += 1) {
        const nail = state.nails[index];
        if (nail.attachedTo) {
          const poles = getPoles(nail.attachedTo.key);
          const pole = poles[nail.attachedTo.poleIndex];
          nail.x = round(pole.x + nail.attachedTo.dx, 3);
          nail.y = round(pole.y + nail.attachedTo.dy, 3);
          nail.angle = nail.attachedTo.angle;
          continue;
        }
        for (const magnet of magnets) {
          const poles = getPoles(magnet.key);
          for (let poleIndex = 0; poleIndex < poles.length; poleIndex += 1) {
            const pole = poles[poleIndex];
            const d = distance({ x: nail.x + 13, y: nail.y + 3 }, pole);
            if (d < state.nailAttachDistancePx) {
              const offsets = createNailOffsets(index);
              nail.attachedTo = {
                key: magnet.key,
                poleIndex,
                dx: offsets.dx,
                dy: offsets.dy,
                angle: offsets.angle
              };
              nail.x = round(pole.x + offsets.dx, 3);
              nail.y = round(pole.y + offsets.dy, 3);
              nail.angle = offsets.angle;
              break;
            }
          }
          if (nail.attachedTo) {
            break;
          }
        }
      }
    }

    function syncPhysics() {
      updateNailAttachment();

      const active = magnetByKey('active');
      const target = magnetByKey('target');
      let pair = null;
      state.lastInteraction = getAttachedNailCount() > 0 ? '吸住铁钉' : '未接近';
      state.pairText = '未接近';
      state.snapped = state.snapLock.engaged;
      state.minDistance = Infinity;

      if (active.enabled && target.enabled) {
        pair = getFacingPair();
        if (pair) {
          state.minDistance = pair.distance;
          state.pairText = `${pair.activePole.type} 对 ${pair.targetPole.type}`;
          const samePole = pair.activePole.type === pair.targetPole.type;
          const onRail = Math.abs(active.y - target.y) < state.railTolerancePx;

          if (canKeepSnap(pair)) {
            lockTargetToActive(pair);
            state.lastInteraction = '异极相吸';
            state.snapped = true;
          } else {
            releaseSnapLock();
          }

          if (!state.snapLock.engaged && onRail && pair.distance < state.repelDistancePx && samePole) {
            const push = (state.repelDistancePx - pair.distance) * state.repelScale;
            const direction = target.x >= active.x ? 1 : -1;
            target.x = clampTargetX(target.x + direction * push);
            state.lastInteraction = '同极相斥';
          } else if (!state.snapLock.engaged && onRail && pair.distance < state.attractDistancePx && !samePole) {
            const pull = (state.attractDistancePx - pair.distance) * state.attractScale;
            const direction = active.x >= target.x ? 1 : -1;
            target.x = clampTargetX(target.x + direction * pull);
            state.lastInteraction = '异极相吸';
            if (pair.distance < state.snapDistancePx) {
              engageSnapLock(pair);
            }
          }

          target.x = clampTargetX(target.x);
          target.y = state.railY;
          state.targetShift = round(Math.abs(target.x - target.baseX), 3);
        }
      } else {
        releaseSnapLock();
        state.targetShift = 0;
      }

      return this.getVisualState();
    }

    return {
      reset({ mode = 'free' } = {}) {
        state.mode = mode;
        state.records = [];
        releaseSnapLock();
        state.lastInteraction = '未接近';
        state.pairText = '未接近';
        state.minDistance = Infinity;
        state.targetShift = 0;
        state.snapped = false;

        const active = magnetByKey('active');
        const target = magnetByKey('target');

        if (mode === 'nails') {
          active.enabled = true;
          target.enabled = false;
          active.x = 54;
          active.y = 126;
          active.baseX = active.x;
          active.baseY = active.y;
          active.flipped = false;
          target.x = 422;
          target.y = state.railY;
          target.baseX = target.x;
          target.baseY = target.y;
          target.flipped = false;
          scatterNails.call(this, 6);
        } else if (mode === 'repel') {
          active.enabled = true;
          target.enabled = true;
          active.x = 54;
          active.y = state.railY;
          active.baseX = active.x;
          active.baseY = active.y;
          active.flipped = true;
          target.x = 422;
          target.y = state.railY;
          target.baseX = target.x;
          target.baseY = target.y;
          target.flipped = false;
          clearNails();
        } else if (mode === 'attract') {
          active.enabled = true;
          target.enabled = true;
          active.x = 54;
          active.y = state.railY;
          active.baseX = active.x;
          active.baseY = active.y;
          active.flipped = true;
          target.x = 422;
          target.y = state.railY;
          target.baseX = target.x;
          target.baseY = target.y;
          target.flipped = true;
          clearNails();
        } else {
          active.enabled = true;
          target.enabled = true;
          active.x = 54;
          active.y = 126;
          active.baseX = active.x;
          active.baseY = active.y;
          active.flipped = false;
          target.x = 422;
          target.y = state.railY;
          target.baseX = target.x;
          target.baseY = target.y;
          target.flipped = false;
          scatterNails.call(this, 8);
        }

        syncPhysics.call(this);
        return this.getState();
      },
      setMode(mode) {
        return this.reset({ mode });
      },
      setActivePosition(x, y) {
        setMagnetPosition('active', x, y);
        return syncPhysics.call(this);
      },
      moveActiveBy(dx, dy = 0) {
        const active = magnetByKey('active');
        return this.setActivePosition(active.x + Number(dx || 0), active.y + Number(dy || 0));
      },
      setActiveFlipped(flipped) {
        setMagnetFlipped('active', flipped);
        releaseSnapLock();
        return syncPhysics.call(this);
      },
      flipActive() {
        const active = magnetByKey('active');
        return this.setActiveFlipped(!active.flipped);
      },
      setTargetFlipped(flipped) {
        const target = magnetByKey('target');
        setMagnetFlipped('target', flipped);
        releaseSnapLock();
        return syncPhysics.call(this);
      },
      flipTarget() {
        const target = magnetByKey('target');
        return this.setTargetFlipped(!target.flipped);
      },
      tick() {
        return syncPhysics.call(this);
      },
      getAttachedNailCount,
      readDistance() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => Number.isFinite(source.minDistance) ? round(source.minDistance, 1) : null,
          format: (value) => value == null ? '--' : `${value.toFixed(1)} px`
        });
      },
      readTargetShift() {
        return primitives.measureBinding({
          sourceState: state,
          compute: (source) => round(source.targetShift, 1),
          format: (value) => `${value.toFixed(1)} px`
        });
      },
      readNailCount() {
        return primitives.measureBinding({
          sourceState: state,
          compute: () => getAttachedNailCount(),
          format: (value) => `${value} / ${state.nails.length}`
        });
      },
      buildRecord(step = '步骤') {
        let phenomenon = '未接近';
        let reading = '--';
        if (state.mode === 'nails') {
          phenomenon = '磁铁吸引铁钉';
          reading = `吸附 ${getAttachedNailCount()} / ${state.nails.length} 枚`;
        } else if (state.lastInteraction === '同极相斥') {
          phenomenon = '同极相斥';
          reading = `${state.pairText}，位移 ${state.targetShift.toFixed(1)} px`;
        } else if (state.lastInteraction === '异极相吸') {
          phenomenon = '异极相吸';
          reading = `${state.pairText}，极间距 ${Math.max(0, state.minDistance).toFixed(1)} px`;
        }
        const entry = { step, phenomenon, reading };
        state.records.push(entry);
        if (state.records.length > 120) {
          state.records.shift();
        }
        return entry;
      },
      getVisualState() {
        return {
          mode: state.mode,
          lastInteraction: state.lastInteraction,
          snapped: state.snapped,
          pairText: state.pairText,
          minDistance: Number.isFinite(state.minDistance) ? round(state.minDistance, 3) : Infinity,
          targetShift: round(state.targetShift, 3),
          attachedNails: getAttachedNailCount(),
          totalNails: state.nails.length,
          activePoleText: activePoleText()
        };
      },
      getState() {
        return {
          mode: state.mode,
          lastInteraction: state.lastInteraction,
          snapped: state.snapped,
          snapLock: { ...state.snapLock },
          pairText: state.pairText,
          minDistance: state.minDistance,
          targetShift: state.targetShift,
          magnets: {
            active: { ...state.magnets.active },
            target: { ...state.magnets.target }
          },
          nails: state.nails.map((nail) => ({
            ...nail,
            attachedTo: nail.attachedTo ? { ...nail.attachedTo } : null
          })),
          records: [...state.records]
        };
      }
    };
  }

  components.createMagneticPoleBench = createMagneticPoleBench;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createMagneticPoleBench };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
