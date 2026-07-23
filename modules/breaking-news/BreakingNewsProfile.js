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

export class BreakingNewsProfile {
  /**
   * @param {Object} [options]
   * @param {HTMLElement} [options.containerElement] - DOM container
   * @param {StateEngine} [options.stateEngine] - Shared StateEngine instance
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
    this.isActive = false;
    this.currentHeadline = null;

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
    // NOTE: We do NOT set transform or opacity here — the CSS idle state
    // (transform: scaleX(0); opacity: 0) is the ground truth on page load.
    // PrimaryMotionEngine.BAR_IN / BAR_OUT owns all visibility transitions.
    if (this.runtime.staticRenderer && this.runtime.staticRenderer.barElement) {
      if (!this.runtime.staticRenderer.barElement.style) {
        this.runtime.staticRenderer.barElement.style = {};
      }
      this.runtime.staticRenderer.barElement.style.backgroundColor = '#DC2626';
      // Ensure IDLE CSS starting position is maintained at initialization
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

    // Wire runtime completion to continuous circular playback until operator STOP
    this.runtime.onHeadlineComplete(() => {
      if (!this.isActive) return;

      // Yield event loop so current timeline play() loop completes gracefully
      setTimeout(async () => {
        if (!this.isActive) return;

        if (this.headlines && this.headlines.length > 0) {
          const total = this.headlines.length;
          const nextIdx = (this.selectedIndex + 1) % total;
          const isWrapped = nextIdx === 0;
          this.selectedIndex = nextIdx;

          if (isWrapped) {
            console.log(`[Playback]\n\nSelected Index:\n${this.selectedIndex + 1} / ${total}\n\nEnd of Queue\n\nRestarting from index 0`);
          } else {
            console.log(`[Playback]\n\nSelected Index:\n${this.selectedIndex + 1} / ${total}\n\nHeadline Finished\n\nNext Index:\n${this.selectedIndex}\n\nNext Headline:\n${this.headlines[this.selectedIndex]}`);
          }

          const nextHeadline = this.headlines[this.selectedIndex];
          this.currentHeadline = nextHeadline;
          this.runtime.loadHeadlines([nextHeadline]);
          await this.runtime.play();
        } else if (this.currentHeadline) {
          this.runtime.loadHeadlines([this.currentHeadline]);
          await this.runtime.play();
        }
      }, 0);
    });

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
   * Emits preemption request to Primary Engine via StateEngine without mutating Primary state.
   *
   * @param {string} headlineText - Urgent Breaking Headline text
   * @returns {Promise<string>} Playback promise
   */
  async showNow(input) {
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
    console.log(`[BreakingNewsProfile] State Transition: IDLE -> ACTIVE | Trigger: showNow()`);

    this.isActive = true;
    this.currentHeadline = text;
    this.headlines = queueList;
    this.selectedIndex = startIdx;

    // 1. Send preemption handshake to Primary Headline Engine via StateEngine
    this.stateEngine.emit('breaking-news', 'preempt', {
      timestamp: Date.now(),
      headline: text,
      headlines: this.headlines,
      selectedIndex: this.selectedIndex
    });

    // 2. Load breaking headline into runtime
    this.runtime.loadHeadlines([text]);

    // 3. Notify callbacks
    this._notifyShowNow(text);

    // 4. Start playback cycle
    console.log(`[Runtime] Playback started`);
    return await this.runtime.play();
  }

  /**
   * Stop Breaking News display immediately (Manual Trigger: ■ STOP).
   * Executes collapse motion, hides Breaking display, and emits release request
   * to allow Primary Headline Engine to automatically resume playback.
   */
  stop() {
    if (!this.isActive) return;

    console.log(`[Playback]\n\nManual STOP received\n\nQueue terminated\n\nPrimary resumed`);
    console.log(`[BreakingNewsProfile] State Transition: ACTIVE -> IDLE | Trigger: release()`);
    this.isActive = false;
    this.selectedIndex = 0;

    // 1. Stop underlying runtime (clears timers and playback state)
    this.runtime.stop();

    // 2. Visually reset overlay to IDLE transparent state immediately.
    //    This ensures no static Red Bar lingers on screen after STOP.
    this._resetToIdleState();

    // 3. Emit release handshake via StateEngine to resume Primary Engine
    this.stateEngine.emit('breaking-news', 'release', {
      timestamp: Date.now()
    });

    // 4. Notify callbacks
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
