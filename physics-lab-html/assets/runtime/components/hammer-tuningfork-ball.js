(function initHammerTuningForkBall(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  function cloneRect(rect) {
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    };
  }

  function createHammerTuningForkBall({
    hammerX = 112,
    hammerY = 82,
    ballX = 140,
    ballY = 100
  } = {}) {
    const state = {
      hammer: {
        x: hammerX,
        y: hammerY,
        width: 20,
        height: 20,
        velocity: { x: 0, y: 0 },
        pullback: 0
      },
      fork: {
        body: { x: 0, y: 0, width: 28, height: 60 },
        leftTine: { x: 0, y: 0, width: 6, height: 28 },
        rightTine: { x: 0, y: 0, width: 6, height: 28 },
        contact: { x: 0, y: 0, width: 2, height: 16 },
        oscillation: 0,
        phase: 0
      },
      ball: {
        x: ballX,
        y: ballY,
        width: 16,
        height: 16,
        velocity: { x: 0, y: 0 }
      },
      forkBallLock: {
        locked: false,
        shouldLock: false,
        shouldRelease: false
      },
      collisionState: {
        hasHammerContact: false,
        normal: null
      },
      readyPose: {
        hammerX,
        hammerY
      },
      impactStrength: 0
    };

    function ballRect() {
      return {
        x: state.ball.x,
        y: state.ball.y,
        width: state.ball.width,
        height: state.ball.height
      };
    }

    function hammerMoverRect() {
      return {
        left: state.hammer.x,
        right: state.hammer.x + state.hammer.width,
        top: state.hammer.y,
        bottom: state.hammer.y + state.hammer.height
      };
    }

    function currentVisualOffset() {
      return state.fork.oscillation * Math.sin(state.fork.phase);
    }

    function currentLeftTineGeometry() {
      return {
        x: state.fork.leftTine.x - currentVisualOffset(),
        y: state.fork.leftTine.y,
        width: state.fork.leftTine.width,
        height: state.fork.leftTine.height
      };
    }

    function currentRightTineGeometry() {
      return {
        x: state.fork.rightTine.x + currentVisualOffset(),
        y: state.fork.rightTine.y,
        width: state.fork.rightTine.width,
        height: state.fork.rightTine.height
      };
    }

    function leftTineRect() {
      const leftTine = currentLeftTineGeometry();
      return {
        left: leftTine.x,
        right: leftTine.x + leftTine.width,
        top: leftTine.y,
        bottom: leftTine.y + leftTine.height
      };
    }

    function refreshForkGeometry() {
      state.fork.leftTine.x = state.fork.body.x;
      state.fork.leftTine.y = state.fork.body.y;
      state.fork.rightTine.x = state.fork.body.x + state.fork.body.width - state.fork.rightTine.width;
      state.fork.rightTine.y = state.fork.body.y;
      state.fork.contact.x = state.fork.body.x;
      state.fork.contact.y = state.fork.body.y + (state.fork.body.height - state.fork.contact.height) / 2;
    }

    function lockFromSettledPose(locked) {
      return primitives.attachLock({
        aligned: true,
        distance: 0,
        lockThreshold: 8,
        releaseThreshold: 24,
        locked
      });
    }

    function forkContactRect() {
      return {
        x: state.fork.contact.x,
        y: state.fork.contact.y,
        width: state.fork.contact.width,
        height: state.fork.contact.height
      };
    }

    function syncForkToBall({ force = false } = {}) {
      const snapResult = primitives.snapToAnchor({
        subjectRect: forkContactRect(),
        anchorRect: ballRect(),
        anchorSide: 'right',
        threshold: force ? Number.POSITIVE_INFINITY : 24,
        gap: 0,
        align: 'center'
      });

      const currentContact = forkContactRect();
      const distance = Math.hypot(currentContact.x - snapResult.x, currentContact.y - snapResult.y);
      const tentativeLock = primitives.attachLock({
        aligned: distance <= 4 || force,
        distance,
        lockThreshold: 4,
        releaseThreshold: 24,
        locked: state.forkBallLock.locked
      });

      if (force || snapResult.snapped || tentativeLock.locked || tentativeLock.shouldLock) {
        state.fork.body.x += snapResult.x - currentContact.x;
        state.fork.body.y += snapResult.y - currentContact.y;
        refreshForkGeometry();
        state.forkBallLock = lockFromSettledPose(true);
        return state.forkBallLock;
      }

      state.forkBallLock = tentativeLock;
      return tentativeLock;
    }

    function setReadyPose() {
      state.ball.x = ballX;
      state.ball.y = ballY;
      state.ball.velocity = { x: 0, y: 0 };
      state.fork.body.x = state.ball.x + state.ball.width;
      state.fork.body.y = state.ball.y + (state.ball.height - state.fork.body.height) / 2;
      state.fork.oscillation = 0;
      state.fork.phase = 0;
      refreshForkGeometry();
      syncForkToBall({ force: true });
      state.hammer.x = state.fork.leftTine.x - state.hammer.width;
      state.hammer.y = state.fork.leftTine.y + 4;
      state.hammer.velocity = { x: 0, y: 0 };
      state.hammer.pullback = 0;
      state.readyPose.hammerX = state.hammer.x;
      state.readyPose.hammerY = state.hammer.y;
      state.collisionState = {
        hasHammerContact: false,
        normal: null
      };
      state.impactStrength = 0;
    }

    function normalizePointerEvent(event) {
      if (!event || (typeof event !== 'object')) {
        throw new TypeError('handleHammerPointer(event) requires an event-like object');
      }

      const pointer = event.pointer || {
        x: event.clientX != null ? event.clientX : event.x,
        y: event.clientY != null ? event.clientY : event.y
      };

      if (typeof pointer.x !== 'number' || typeof pointer.y !== 'number') {
        throw new TypeError('handleHammerPointer(event) requires numeric clientX/clientY or pointer.x/pointer.y');
      }

      return {
        pointer,
        offset: event.offset || {
          x: typeof event.offsetX === 'number' ? event.offsetX : state.hammer.width / 2,
          y: typeof event.offsetY === 'number' ? event.offsetY : state.hammer.height / 2
        },
        stageRect: event.stageRect || { x: 0, y: 0, width: 320, height: 240 },
        clampPadding: event.clampPadding || 0
      };
    }

    function handleHammerPointer(event) {
      const normalized = normalizePointerEvent(event);
      const dragResult = primitives.dragWithinStage({
        pointer: normalized.pointer,
        offset: normalized.offset,
        itemSize: { width: state.hammer.width, height: state.hammer.height },
        targetRect: {
          x: state.hammer.x,
          y: state.hammer.y,
          width: state.hammer.width,
          height: state.hammer.height
        },
        stageRect: normalized.stageRect,
        axis: 'x',
        clampPadding: normalized.clampPadding
      });
      const contact = primitives.resolveContactStop({
        moverRect: hammerMoverRect(),
        obstacleRect: leftTineRect(),
        proposedDx: dragResult.nextX - state.hammer.x,
        proposedDy: 0
      });

      state.hammer.x += contact.resolvedDx;
      state.hammer.pullback = Math.max(0, state.readyPose.hammerX - state.hammer.x);
      state.collisionState = {
        hasHammerContact: contact.collided,
        normal: contact.normal
      };

      return {
        nextX: state.hammer.x,
        nextY: state.hammer.y,
        dragging: dragResult.dragging,
        collided: contact.collided
      };
    }

    function strike() {
      if (state.hammer.pullback <= 0.001) {
        state.hammer.velocity = { x: 0, y: 0 };
        state.ball.velocity = { x: 0, y: 0 };
        state.collisionState = {
          hasHammerContact: false,
          normal: null
        };
        state.impactStrength = 0;
        return getObservation();
      }

      const visibleLeftTine = currentLeftTineGeometry();
      const contactGap = visibleLeftTine.x - (state.hammer.x + state.hammer.width);
      const impactTravel = Math.max(contactGap, state.hammer.pullback);
      const impactStrength = impactTravel * 0.35;
      const releaseDx = contactGap + impactStrength;
      const stop = primitives.resolveContactStop({
        moverRect: hammerMoverRect(),
        obstacleRect: leftTineRect(),
        proposedDx: releaseDx,
        proposedDy: 0
      });

      state.hammer.x += stop.resolvedDx;
      state.collisionState = {
        hasHammerContact: stop.collided,
        normal: stop.normal
      };
      state.impactStrength = impactStrength;

      if (!stop.collided || !stop.normal) {
        state.hammer.velocity = { x: releaseDx, y: 0 };
        return getObservation();
      }

      const bounce = primitives.computeBounce({
        velocity: { x: impactStrength, y: 0 },
        normal: stop.normal,
        restitution: 0.6,
        minBounceDistance: 2,
        maxBounceDistance: 6
      });

      state.hammer.x += bounce.bounceDx;
      state.hammer.y += bounce.bounceDy;
      state.hammer.velocity = bounce.nextVelocity;
      state.hammer.pullback = 0;
      state.fork.oscillation = impactStrength * 0.25;
      state.fork.phase = 0;

      const impulse = primitives.inferImpulseDirection({
        sourceRect: forkContactRect(),
        targetRect: state.ball,
        axis: 'x',
        mode: 'push-away'
      });

      state.ball.velocity = {
        x: impulse.sign * impactStrength * 0.45,
        y: 0
      };
      syncForkToBall();
      return getObservation();
    }

    function tick(dt = 1) {
      state.hammer.x += state.hammer.velocity.x * dt;
      state.ball.x += state.ball.velocity.x * dt;
      state.fork.phase += dt * 10;
      state.fork.oscillation = Math.max(0, state.fork.oscillation - 0.3 * dt);
      syncForkToBall();
      state.hammer.velocity = {
        x: state.hammer.velocity.x * 0.85,
        y: state.hammer.velocity.y * 0.85
      };
      state.ball.velocity = {
        x: state.ball.velocity.x * 0.92,
        y: state.ball.velocity.y * 0.92
      };
      return getObservation();
    }

    function getObservation() {
      const forkGap = primitives.measureBinding({
        sourceState: state,
        compute: (source) => source.fork.contact.x - (source.ball.x + source.ball.width),
        format: (value) => `${value.toFixed(2)} px`
      });

      return {
        hammerStoppedAtFork: state.hammer.x + state.hammer.width <= currentLeftTineGeometry().x,
        hammerVelocity: {
          x: state.hammer.velocity.x,
          y: state.hammer.velocity.y
        },
        ballVelocity: {
          x: state.ball.velocity.x,
          y: state.ball.velocity.y
        },
        ballDirection: state.ball.velocity.x < 0 ? 'left' : (state.ball.velocity.x > 0 ? 'right' : 'still'),
        pullback: state.hammer.pullback,
        impactStrength: state.impactStrength,
        forkBallLock: {
          locked: state.forkBallLock.locked,
          shouldLock: state.forkBallLock.shouldLock,
          shouldRelease: state.forkBallLock.shouldRelease
        },
        forkGap,
        forkOscillation: state.fork.oscillation,
        collisionState: {
          hasHammerContact: state.collisionState.hasHammerContact,
          normal: state.collisionState.normal
        }
      };
    }

    function getAnchors() {
      return {
        hammer: {
          x: state.hammer.x,
          y: state.hammer.y,
          width: state.hammer.width,
          height: state.hammer.height,
          faceX: state.hammer.x + state.hammer.width
        },
        fork: {
          body: cloneRect(state.fork.body),
          leftTine: currentLeftTineGeometry(),
          rightTine: currentRightTineGeometry(),
          contact: cloneRect(state.fork.contact)
        },
        ball: cloneRect(state.ball)
      };
    }

    setReadyPose();

    return {
      reset() {
        setReadyPose();
      },
      setReadyPose,
      handleHammerPointer,
      strike,
      tick,
      getObservation,
      getAnchors
    };
  }

  components.createHammerTuningForkBall = createHammerTuningForkBall;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createHammerTuningForkBall };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
