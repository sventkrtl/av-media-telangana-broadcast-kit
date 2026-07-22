/**
 * AV Media Telangana - Primary Headline State Machine (Task P1-1)
 *
 * Deterministic finite state machine managing playback states
 * for the Primary Headline Engine.
 *
 * States:
 *   IDLE ➔ BAR_IN ➔ TEXT_IN ➔ HOLD ➔ TEXT_OUT ➔ BAR_OUT ➔ COMPLETE
 *
 * Rules:
 *   - No state skipping permitted.
 *   - No parallel states permitted.
 *   - Throws error or rejects invalid/illegal state transitions.
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0.
 */

export const HEADLINE_STATES = Object.freeze({
  IDLE: 'IDLE',
  BAR_IN: 'BAR_IN',
  TEXT_IN: 'TEXT_IN',
  HOLD: 'HOLD',
  TEXT_OUT: 'TEXT_OUT',
  BAR_OUT: 'BAR_OUT',
  COMPLETE: 'COMPLETE'
});

export class HeadlineStateMachine {
  constructor() {
    this.currentState = HEADLINE_STATES.IDLE;
    this.history = [HEADLINE_STATES.IDLE];
    this.listeners = new Set();
  }

  /**
   * Get current state.
   * @returns {string}
   */
  getState() {
    return this.currentState;
  }

  /**
   * Check if a transition from current state to target state is legal.
   *
   * Legal Transitions Table:
   *   IDLE     ➔ BAR_IN, IDLE
   *   BAR_IN   ➔ TEXT_IN, BAR_OUT, IDLE
   *   TEXT_IN  ➔ HOLD, IDLE
   *   HOLD     ➔ TEXT_OUT, IDLE
   *   TEXT_OUT ➔ TEXT_IN (next item), BAR_OUT (playlist finish/stop), IDLE
   *   BAR_OUT  ➔ COMPLETE, IDLE
   *   COMPLETE ➔ IDLE
   *
   * @param {string} toState
   * @returns {boolean}
   */
  canTransitionTo(toState) {
    if (!HEADLINE_STATES[toState]) return false;

    const from = this.currentState;

    // Resetting to IDLE is always legal from any state
    if (toState === HEADLINE_STATES.IDLE) return true;

    switch (from) {
      case HEADLINE_STATES.IDLE:
        return toState === HEADLINE_STATES.BAR_IN;

      case HEADLINE_STATES.BAR_IN:
        return toState === HEADLINE_STATES.TEXT_IN || toState === HEADLINE_STATES.BAR_OUT;

      case HEADLINE_STATES.TEXT_IN:
        return toState === HEADLINE_STATES.HOLD;

      case HEADLINE_STATES.HOLD:
        return toState === HEADLINE_STATES.TEXT_OUT;

      case HEADLINE_STATES.TEXT_OUT:
        // Next headline item skips BAR_IN because permanent bar is already active
        return toState === HEADLINE_STATES.TEXT_IN || toState === HEADLINE_STATES.BAR_OUT;

      case HEADLINE_STATES.BAR_OUT:
        return toState === HEADLINE_STATES.COMPLETE;

      case HEADLINE_STATES.COMPLETE:
        return toState === HEADLINE_STATES.IDLE;

      default:
        return false;
    }
  }

  /**
   * Perform state transition.
   *
   * @param {string} toState
   * @returns {string} New state
   * @throws {Error} If transition is illegal
   */
  transitionTo(toState) {
    if (!this.canTransitionTo(toState)) {
      throw new Error(
        `[HeadlineStateMachine] Illegal state transition from "${this.currentState}" to "${toState}". Transitions must follow sequential lifecycle without skipping.`
      );
    }

    const previousState = this.currentState;
    this.currentState = toState;
    this.history.push(toState);

    // Keep history length manageable
    if (this.history.length > 50) {
      this.history.shift();
    }

    this._notify(previousState, toState);
    return this.currentState;
  }

  /**
   * Reset state machine to IDLE state.
   */
  reset() {
    this.currentState = HEADLINE_STATES.IDLE;
    this.history.push(HEADLINE_STATES.IDLE);
    this._notify(this.currentState, HEADLINE_STATES.IDLE);
  }

  /**
   * Subscribe to state change notifications.
   * @param {Function} listener - (fromState, toState) => void
   * @returns {Function} Unsubscribe callback
   */
  onStateChange(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
    }
    return () => this.listeners.delete(listener);
  }

  _notify(fromState, toState) {
    this.listeners.forEach(fn => {
      try {
        fn(fromState, toState);
      } catch (err) {
        console.error('[HeadlineStateMachine] Error in state listener:', err);
      }
    });
  }
}
