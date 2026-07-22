/**
 * AV Media Telangana - Primary Motion Engine (Task P1-2)
 *
 * Dedicated GPU-accelerated motion orchestrator for the Primary Headline Engine.
 * Animates the 5-stage motion lifecycle:
 *
 *   1. BAR_IN    (300ms) - Left-to-right scaleX reveal (transform-origin: left, NO translation)
 *   2. TEXT_IN   (300ms) - Center-to-outside symmetrical reveal (NO slide, NO horizontal translation)
 *   3. TEXT_HOLD (4000ms)- Stationary hold (Zero movement)
 *   4. TEXT_OUT  (300ms) - Outside-to-center symmetrical collapse (Reverse of TEXT_IN)
 *   5. BAR_OUT   (300ms) - Right-to-left scaleX collapse (transform-origin: right)
 *
 * GPU Safety Policy:
 *   ONLY transform, opacity, and clip-path are animated.
 *   Layout reflow properties (width, height, left, right, top, bottom, margin, padding) are NEVER animated.
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0.
 */

import { EVENT_TYPES, DEFAULT_STAGE_DURATIONS } from '../HeadlineTimelineEvent.js';

export const MOTION_STAGES = Object.freeze({
  BAR_IN: EVENT_TYPES.BAR_IN,
  TEXT_IN: EVENT_TYPES.TEXT_IN,
  TEXT_HOLD: EVENT_TYPES.TEXT_HOLD,
  TEXT_OUT: EVENT_TYPES.TEXT_OUT,
  BAR_OUT: EVENT_TYPES.BAR_OUT
});

export class PrimaryMotionEngine {
  /**
   * @param {Object} [options]
   * @param {number} [options.barInDuration=300]
   * @param {number} [options.textInDuration=300]
   * @param {number} [options.textHoldDuration=4000]
   * @param {number} [options.textOutDuration=300]
   * @param {number} [options.barOutDuration=300]
   */
  constructor(options = {}) {
    this.durations = {
      [MOTION_STAGES.BAR_IN]: options.barInDuration || DEFAULT_STAGE_DURATIONS[EVENT_TYPES.BAR_IN],
      [MOTION_STAGES.TEXT_IN]: options.textInDuration || DEFAULT_STAGE_DURATIONS[EVENT_TYPES.TEXT_IN],
      [MOTION_STAGES.TEXT_HOLD]: options.textHoldDuration || DEFAULT_STAGE_DURATIONS[EVENT_TYPES.TEXT_HOLD],
      [MOTION_STAGES.TEXT_OUT]: options.textOutDuration || DEFAULT_STAGE_DURATIONS[EVENT_TYPES.TEXT_OUT],
      [MOTION_STAGES.BAR_OUT]: options.barOutDuration || DEFAULT_STAGE_DURATIONS[EVENT_TYPES.BAR_OUT]
    };

    this.currentStage = null;
    this.isAnimating = false;
    this.isPaused = false;
    this.activePromise = null;
    this.activeTimeout = null;
    this.activeReject = null;
    this.remainingPauseMs = 0;
    this.pauseStartTime = 0;
    this.stageStartTime = 0;
    this.currentBarElement = null;
    this.currentTextElement = null;
  }

  /**
   * Execute motion for a specific stage.
   *
   * @param {string} stage - One of MOTION_STAGES (BAR_IN, TEXT_IN, TEXT_HOLD, TEXT_OUT, BAR_OUT)
   * @param {HTMLElement|Object} [barElement] - DOM or mock element for blue background bar
   * @param {HTMLElement|Object} [textElement] - DOM or mock element for headline text
   * @returns {Promise<{ status: string, stage: string, durationMs: number }>}
   */
  async play(stage, barElement = null, textElement = null) {
    if (!stage || !MOTION_STAGES[stage]) {
      throw new Error(`[PrimaryMotionEngine] Invalid motion stage: "${stage}". Must be one of ${Object.keys(MOTION_STAGES).join(', ')}`);
    }

    if (this.isAnimating) {
      throw new Error(`[PrimaryMotionEngine] Overlapping stage call blocked. Stage "${this.currentStage}" is currently running.`);
    }

    this.currentStage = stage;
    this.isAnimating = true;
    this.isPaused = false;

    if (barElement) this.currentBarElement = barElement;
    if (textElement) this.currentTextElement = textElement;

    const durationMs = this.durations[stage];

    switch (stage) {
      case MOTION_STAGES.BAR_IN:
        return this._animateBarIn(barElement, durationMs);

      case MOTION_STAGES.TEXT_IN:
        return this._animateTextIn(textElement, durationMs);

      case MOTION_STAGES.TEXT_HOLD:
        return this._animateTextHold(textElement, durationMs);

      case MOTION_STAGES.TEXT_OUT:
        return this._animateTextOut(textElement, durationMs);

      case MOTION_STAGES.BAR_OUT:
        return this._animateBarOut(barElement, durationMs);

      default:
        this.isAnimating = false;
        return { status: 'COMPLETE', stage, durationMs: 0 };
    }
  }

  /**
   * Pause current animation.
   */
  pause() {
    if (!this.isAnimating || this.isPaused) return;

    this.isPaused = true;
    const elapsed = Date.now() - this.stageStartTime;
    const totalDuration = this.durations[this.currentStage] || 0;
    this.remainingPauseMs = Math.max(0, totalDuration - elapsed);
    this.pauseStartTime = Date.now();

    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }

    // Freeze CSS transition on active DOM elements
    this._freezeElementTransition(this.currentBarElement);
    this._freezeElementTransition(this.currentTextElement);
  }

  /**
   * Resume paused animation.
   */
  resume() {
    if (!this.isAnimating || !this.isPaused) return;

    this.isPaused = false;
    this.stageStartTime = Date.now();

    // Re-schedule completion with remaining duration
    const durationMs = this.remainingPauseMs;

    this._unfreezeElementTransition(this.currentBarElement, durationMs);
    this._unfreezeElementTransition(this.currentTextElement, durationMs);

    if (this._activeResolve) {
      const resolve = this._activeResolve;
      const stage = this.currentStage;
      this.activeTimeout = setTimeout(() => {
        this.isAnimating = false;
        this.activeTimeout = null;
        resolve({ status: 'STAGE_COMPLETE', stage, durationMs });
      }, durationMs);
    }
  }

  /**
   * Stop active animation immediately and reset elements.
   */
  stop() {
    this._clearActiveTimer();
    this.isAnimating = false;
    this.isPaused = false;
    this.currentStage = null;
  }

  /**
   * Reset engine state and element styles.
   */
  reset() {
    this.stop();
    this._resetElementStyles(this.currentBarElement);
    this._resetElementStyles(this.currentTextElement);
    this.currentBarElement = null;
    this.currentTextElement = null;
  }

  /**
   * Destroy motion engine.
   */
  destroy() {
    this.reset();
  }

  // ----------------------------------------------------
  // Stage Animation Implementations (GPU Accelerated)
  // ----------------------------------------------------

  /**
   * Stage 1: BAR_IN
   * ScaleX(0) ➔ ScaleX(1), transform-origin: left, duration: 300ms
   * NO translation (translateX).
   */
  _animateBarIn(barEl, durationMs) {
    return this._runStagePromise(durationMs, (isDom) => {
      if (isDom && barEl) {
        barEl.style.willChange = 'transform';
        barEl.style.transformOrigin = 'left center';
        barEl.style.transition = 'none';
        barEl.style.transform = 'scaleX(0)';
        barEl.style.opacity = '1';

        // Keep text element hidden during initial BAR_IN scaleX expansion
        if (this.currentTextElement && this.currentTextElement.style) {
          this.currentTextElement.style.opacity = '0';
          this.currentTextElement.style.clipPath = 'inset(0 50% 0 50%)';
        }

        void barEl.offsetWidth; // Force style reflow flush

        barEl.style.transition = `transform ${durationMs}ms cubic-bezier(0, 0, 0.2, 1)`;
        barEl.style.transform = 'scaleX(1)';
      } else if (barEl && barEl.style) {
        barEl.style.transformOrigin = 'left center';
        barEl.style.transform = 'scaleX(1)';
        barEl.style.opacity = '1';
      }
    });
  }

  /**
   * Stage 2: TEXT_IN
   * Symmetrical Center Reveal, duration: 300ms
   * NO horizontal sliding, NO translateX.
   */
  _animateTextIn(textEl, durationMs) {
    return this._runStagePromise(durationMs, (isDom) => {
      if (isDom && textEl) {
        textEl.style.willChange = 'clip-path, opacity';
        textEl.style.transition = 'none';
        textEl.style.clipPath = 'inset(0 50% 0 50%)';
        textEl.style.opacity = '0';

        void textEl.offsetWidth;

        textEl.style.transition = `clip-path ${durationMs}ms cubic-bezier(0, 0, 0.2, 1), opacity ${durationMs}ms cubic-bezier(0, 0, 0.2, 1)`;
        textEl.style.clipPath = 'inset(0 0% 0 0%)';
        textEl.style.opacity = '1';
      } else if (textEl && textEl.style) {
        textEl.style.clipPath = 'inset(0 0% 0 0%)';
        textEl.style.opacity = '1';
      }
    });
  }

  /**
   * Stage 3: TEXT_HOLD
   * Duration: 4000ms. Stationary hold. Zero movement.
   */
  _animateTextHold(textEl, durationMs) {
    return this._runStagePromise(durationMs, (isDom) => {
      if (textEl && textEl.style) {
        textEl.style.willChange = 'auto';
        textEl.style.transition = 'none';
        textEl.style.opacity = '1';
        textEl.style.clipPath = 'inset(0 0% 0 0%)';
      }
    });
  }

  /**
   * Stage 4: TEXT_OUT
   * Reverse of Stage 2. Symmetrical Center Collapse, duration: 300ms.
   */
  _animateTextOut(textEl, durationMs) {
    return this._runStagePromise(durationMs, (isDom) => {
      if (isDom && textEl) {
        textEl.style.willChange = 'clip-path, opacity';
        textEl.style.transition = `clip-path ${durationMs}ms cubic-bezier(0.4, 0, 1, 1), opacity ${durationMs}ms cubic-bezier(0.4, 0, 1, 1)`;
        textEl.style.clipPath = 'inset(0 50% 0 50%)';
        textEl.style.opacity = '0';
      } else if (textEl && textEl.style) {
        textEl.style.clipPath = 'inset(0 50% 0 50%)';
        textEl.style.opacity = '0';
      }
    });
  }

  /**
   * Stage 5: BAR_OUT
   * Reverse of Stage 1. ScaleX(1) ➔ ScaleX(0), transform-origin: right, duration: 300ms.
   */
  _animateBarOut(barEl, durationMs) {
    return this._runStagePromise(durationMs, (isDom) => {
      if (isDom && barEl) {
        barEl.style.willChange = 'transform';
        barEl.style.transformOrigin = 'right center';
        barEl.style.transition = `transform ${durationMs}ms cubic-bezier(0.4, 0, 1, 1)`;
        barEl.style.transform = 'scaleX(0)';
      } else if (barEl && barEl.style) {
        barEl.style.transformOrigin = 'right center';
        barEl.style.transform = 'scaleX(0)';
      }
    });
  }

  // ----------------------------------------------------
  // Helper Utility Methods
  // ----------------------------------------------------

  _runStagePromise(durationMs, applyFn) {
    return new Promise((resolve, reject) => {
      this.stageStartTime = Date.now();
      this._activeResolve = resolve;
      this.activeReject = reject;

      const isDom = typeof document !== 'undefined';
      applyFn(isDom);

      this.activeTimeout = setTimeout(() => {
        this.isAnimating = false;
        this.activeTimeout = null;
        this._activeResolve = null;
        this.activeReject = null;
        resolve({ status: 'STAGE_COMPLETE', stage: this.currentStage, durationMs });
      }, durationMs);
    });
  }

  _clearActiveTimer() {
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }
    this._activeResolve = null;
    this.activeReject = null;
  }

  _freezeElementTransition(el) {
    if (el && el.style) {
      el.style.transition = 'none';
    }
  }

  _unfreezeElementTransition(el, durationMs) {
    if (el && el.style && el.style.willChange && el.style.willChange !== 'auto') {
      el.style.transition = `transform ${durationMs}ms linear, opacity ${durationMs}ms linear, clip-path ${durationMs}ms linear`;
    }
  }

  _resetElementStyles(el) {
    if (el && el.style) {
      el.style.willChange = 'auto';
      el.style.transition = 'none';
      el.style.transform = '';
      el.style.transformOrigin = '';
      el.style.clipPath = '';
      el.style.opacity = '';
    }
  }
}
