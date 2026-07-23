/**
 * AV Media Telangana - Breaking News Profile Wrapper (Task B1-0)
 *
 * Lightweight Profile Wrapper around PrimaryHeadlineRuntime.
 * ZERO CODE DUPLICATION: Imports Primary Headline Runtime directly.
 *
 * Responsibilities:
 *   - Configures PrimaryHeadlineRuntime with Breaking News parameters:
 *       * Profile: 'breaking'
 *       * Theme: Red Bar (#DC2626)
 *       * Trigger: Manual Operator Trigger (SHOW NOW / STOP)
 *       * Loop: Single-cycle on-demand execution (loop = false)
 *   - Manages Manual Trigger lifecycle (showNow, stop)
 *   - Orchestrates preemption & release handshake via StateEngine
 *   - Strictly enforces State Isolation (never mutates Primary queue, index, or timeline)
 *
 * Strictly adheres to BREAKING_NEWS_PROFILE_ARCHITECTURE.md & ADR-0005.
 */

import { PrimaryHeadlineRuntime } from '../primary-headline/runtime/PrimaryHeadlineRuntime.js';
import { StateEngine } from '../../shared/js/state-engine.js';
import { BreakingFeedModel } from './models/BreakingFeedModel.js';

export class BreakingNewsProfile {
  /**
   * @param {Object} [options]
   * @param {HTMLElement} [options.containerElement] - DOM container
   * @param {StateEngine} [options.stateEngine] - Shared StateEngine instance
   * @param {BreakingFeedModel} [options.feedModel] - Single Source of Truth Model
   */
  constructor(options = {}) {
    this.options = options;

    // Direct instantiation of frozen Primary Runtime with Breaking Profile configuration
    this.runtime = new PrimaryHeadlineRuntime({
      profile: 'breaking',
      barColor: '#DC2626',
      loop: false
    });

    this.stateEngine = options.stateEngine || new StateEngine('av_media_broadcast_channel');
    this.feedModel = options.feedModel || new BreakingFeedModel();
    this.isActive = false;
    this.currentHeadline = null;
    this.currentTextStage = null;

    // Callbacks
    this.showNowCallbacks = [];
    this.stopCallbacks = [];
  }

  /**
   * Initialize underlying Primary Headline Runtime with Breaking container.
   *
   * @param {Object} [options]
   * @returns {Promise<boolean>}
   */
  async initialize(options = {}) {
    const success = await this.runtime.initialize({
      containerElement: options.containerElement || this.options.containerElement,
      loop: false
    });

    // Enforce Red Bar Theme (#DC2626) on static renderer bar element.
    if (this.runtime.staticRenderer && this.runtime.staticRenderer.barElement) {
      if (!this.runtime.staticRenderer.barElement.style) {
        this.runtime.staticRenderer.barElement.style = {};
      }
      this.runtime.staticRenderer.barElement.style.backgroundColor = '#DC2626';
      this.runtime.staticRenderer.barElement.style.transform = 'scaleX(0)';
      this.runtime.staticRenderer.barElement.style.opacity = '0';
    }

    // Ensure viewport is in IDLE state (collapsed) at initialization
    if (this.runtime.staticRenderer && this.runtime.staticRenderer.viewportElement) {
      if (!this.runtime.staticRenderer.viewportElement.style) {
        this.runtime.staticRenderer.viewportElement.style = {};
      }
      this.runtime.staticRenderer.viewportElement.style.clipPath = 'inset(0 50% 0 50%)';
      this.runtime.staticRenderer.viewportElement.style.opacity = '0';
    }

    // Inject Stage Start logging from the playback controller to satisfy Audit requirements
    if (this.runtime.playbackController) {
      this.runtime.playbackController.onStageStart((event) => {
        console.log(`[PrimaryMotionEngine] Stage Start: ${event.type} (${event.duration}ms)`);
      });
    }

    return success;
  }

  /**
   * Trigger Breaking News display immediately (Manual Trigger: 🔴 SHOW NOW).
   * Executes BAR_IN ONCE, then enters persistent text-only transition loop.
   *
   * @param {string|Object} input - Urgent Breaking Headline text or payload object
   * @returns {Promise<void>}
   */
  async showNow(input) {
    if (this.isActive) {
      console.warn('[BreakingNewsProfile] Duplicate showNow ignored while ACTIVE.');
      return;
    }

    let text = '';
    let queueList = [];
    let startIdx = 0;

    if (typeof input === 'string') {
      text = input.trim();
      queueList = [text];
      startIdx = 0;
    } else if (input && typeof input === 'object') {
      queueList = Array.isArray(input.headlines) ? input.headlines : [];
      startIdx = typeof input.selectedIndex === 'number' ? input.selectedIndex : 0;
      text = queueList[startIdx] || input.headline || '';
      if (!text && queueList.length > 0) text = queueList[0];
      if (queueList.length === 0 && text) queueList = [text];
    }

    if (!text) {
      throw new Error('[BreakingNewsProfile] Headline text must be a non-empty string.');
    }

    console.log(`[Profile] showNow("${text}")`);
    console.log(`[BreakingNewsProfile] State Transition: IDLE -> BAR_VISIBLE | Trigger: showNow()`);

    this.isActive = true;
    this.currentHeadline = text;

    // Update Model state (Single Source of Truth)
    if (queueList.length > 0) {
      this.feedModel.setSheetFeed(queueList, { status: 'READY' });
      this.feedModel.selectIndex(startIdx);
    } else {
      this.feedModel.setManualHeadline(text);
    }
    this.feedModel.transitionTo('BAR_VISIBLE');

    // 1. Send preemption handshake to Primary Engine
    this.stateEngine.emit('breaking-news', 'preempt', {
      timestamp: Date.now(),
      headline: text,
      headlines: this.feedModel.headlines,
      selectedIndex: this.feedModel.selectedIndex
    });

    // 2. Notify callbacks
    this._notifyShowNow(text);

    // 3. Persistent Red Bar: Execute BAR_IN ONCE
    console.log(`[Playback]\n\nBAR_IN\n\nPersistent Bar : ON`);
    const barEl = this.runtime.staticRenderer ? this.runtime.staticRenderer.barElement : null;
    if (this.runtime.motionEngine) {
      await this.runtime.motionEngine.play('BAR_IN', barEl);
    }

    this.feedModel.transitionTo('ACTIVE_TEXT_LOOP');

    // 4. Start text-only continuous transition loop
    return await this._runContinuousTextLoop();
  }

  /**
   * Continuous text-only headline transition loop.
   * Red Bar remains 100% visible on screen while only headline text animates.
   * @private
   */
  async _runContinuousTextLoop() {
    while (this.isActive) {
      const headline = this.feedModel.currentHeadline;
      if (!headline) break;

      const barEl = this.runtime.staticRenderer ? this.runtime.staticRenderer.barElement : null;
      const textEl = this.runtime.staticRenderer ? (this.runtime.staticRenderer.viewportElement || this.runtime.staticRenderer.textElement) : null;

      if (this.runtime.staticRenderer && typeof this.runtime.staticRenderer.renderHeadline === 'function') {
        this.runtime.staticRenderer.renderHeadline(headline);
      }

      console.log(`[Playback]\n\nHeadline Complete\n\nNext Headline\n\nTEXT_IN only.`);

      try {
        // Stage 1: TEXT_IN (300ms)
        if (this.isActive && this.runtime.motionEngine) {
          this.currentTextStage = 'TEXT_IN';
          await this.runtime.motionEngine.play('TEXT_IN', barEl, textEl);
        }
        // Stage 2: TEXT_HOLD (4000ms)
        if (this.isActive && this.runtime.motionEngine) {
          this.currentTextStage = 'TEXT_HOLD';
          await this.runtime.motionEngine.play('TEXT_HOLD', barEl, textEl);
        }
        // Stage 3: TEXT_OUT (300ms)
        if (this.isActive && this.runtime.motionEngine) {
          this.currentTextStage = 'TEXT_OUT';
          await this.runtime.motionEngine.play('TEXT_OUT', barEl, textEl);
          this.currentTextStage = null;
        }

        // 60ms stage separator gap for smooth optical clarity between headline text transitions
        if (this.isActive) {
          await new Promise(resolve => setTimeout(resolve, 60));
        }
      } catch (err) {
        // Interrupted by manual STOP
        break;
      }

      if (!this.isActive) break;

      // Advance circular queue in model
      this.feedModel.next();
    }
  }

  /**
   * Stop Breaking News display immediately (Manual Trigger: ■ STOP).
   * Executes final TEXT_OUT (if required) followed by single BAR_OUT,
   * resets state to IDLE, and emits release handshake to resume Primary.
   */
  async stop() {
    if (!this.isActive) return;

    console.log(`[Playback]\n\nManual STOP\n\nExecuting final TEXT_OUT\n\nExecuting BAR_OUT\n\nPersistent Bar : OFF\n\nPrimary Resume`);
    console.log(`[BreakingNewsProfile] State Transition: ACTIVE -> IDLE | Trigger: release()`);

    this.isActive = false;

    const barEl = this.runtime.staticRenderer ? this.runtime.staticRenderer.barElement : null;
    const textEl = this.runtime.staticRenderer ? (this.runtime.staticRenderer.viewportElement || this.runtime.staticRenderer.textElement) : null;

    // Stop current motion engine step if running
    if (this.runtime.motionEngine) {
      const prevStage = this.currentTextStage;
      this.runtime.motionEngine.stop();

      // If stopped during TEXT_IN or TEXT_HOLD, run TEXT_OUT once cleanly
      if (prevStage === 'TEXT_IN' || prevStage === 'TEXT_HOLD') {
        try {
          await this.runtime.motionEngine.play('TEXT_OUT', barEl, textEl);
          // 60ms stage gap before BAR_OUT so Red Bar does not clip text
          await new Promise(resolve => setTimeout(resolve, 60));
        } catch (e) {}
      }

      // Execute BAR_OUT ONCE at end of session
      try {
        await this.runtime.motionEngine.play('BAR_OUT', barEl);
      } catch (e) {}
    }

    this.currentTextStage = null;

    // Reset Model index back to 0 on STOP (SSOT Rule)
    this.feedModel.resetIndex();
    this.feedModel.transitionTo('IDLE');

    // Visually reset overlay to IDLE transparent state immediately
    this._resetToIdleState();

    // Emit release handshake via StateEngine to resume Primary Engine
    this.stateEngine.emit('breaking-news', 'release', {
      timestamp: Date.now()
    });

    // Notify callbacks
    this._notifyStop();
  }

  /**
   * Immediately force all overlay elements back to their CSS IDLE state
   * (bar: scaleX(0) + opacity 0, viewport: collapsed + opacity 0).
   * Called by stop() to guarantee no visual residue on-screen.
   *
   * Does NOT modify any frozen Primary Engine files or Primary containers.
   */
  _resetToIdleState() {
    try {
      const renderer = this.runtime && this.runtime.staticRenderer;
      if (!renderer) return;

      // Reset Red Bar — collapse back to left-origin scaleX(0)
      const bar = renderer.barElement;
      if (bar && bar.style) {
        bar.style.transition = 'none';
        bar.style.transformOrigin = 'right center';
        bar.style.transform = 'scaleX(0)';
        bar.style.opacity = '0';
      }

      // Reset Viewport — collapse text clip back to center
      const viewport = renderer.viewportElement;
      if (viewport && viewport.style) {
        viewport.style.transition = 'none';
        viewport.style.clipPath = 'inset(0 50% 0 50%)';
        viewport.style.opacity = '0';
      }

      // Clear headline text content
      if (renderer.textElement) {
        renderer.textElement.textContent = '';
      }

      this.currentHeadline = null;
    } catch (e) {
      console.error('[BreakingNewsProfile] Error resetting idle state:', e);
    }
  }

  /**
   * Returns current profile metadata.
   */
  getProfileInfo() {
    return {
      profile: 'breaking',
      themeColor: '#DC2626',
      triggerMode: 'manual',
      isActive: this.isActive,
      currentHeadline: this.currentHeadline,
      reusedModules: [
        'PrimaryHeadlineRuntime',
        'PrimaryMotionEngine',
        'PrimaryStaticRenderer',
        'PrimaryTimelinePlaybackController'
      ]
    };
  }

  // ----------------------------------------------------
  // Event Hooks & Helpers
  // ----------------------------------------------------

  onShowNow(callback) {
    if (typeof callback === 'function') {
      this.showNowCallbacks.push(callback);
    }
  }

  onStop(callback) {
    if (typeof callback === 'function') {
      this.stopCallbacks.push(callback);
    }
  }

  _notifyShowNow(headline) {
    this.showNowCallbacks.forEach(fn => {
      try { fn(headline); } catch (e) { console.error(e); }
    });
  }

  _notifyStop() {
    this.stopCallbacks.forEach(fn => {
      try { fn(); } catch (e) { console.error(e); }
    });
  }

  destroy() {
    this.stop();
    if (this.runtime) {
      this.runtime.destroy();
    }
    this.isActive = false;
    this.currentHeadline = null;
    this.showNowCallbacks = [];
    this.stopCallbacks = [];
  }
}
