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

    // Enforce Red Bar Theme (#DC2626) on static renderer bar element
    if (this.runtime.staticRenderer && this.runtime.staticRenderer.barElement) {
      if (!this.runtime.staticRenderer.barElement.style) {
        this.runtime.staticRenderer.barElement.style = {};
      }
      this.runtime.staticRenderer.barElement.style.backgroundColor = '#DC2626';
    }

    // Wire runtime completion to automatic release handshake if single cycle completes
    this.runtime.onHeadlineComplete(() => {
      if (this.isActive) {
        this.stop();
      }
    });

    return success;
  }

  /**
   * Trigger Breaking News display immediately (Manual Trigger: 🔴 SHOW NOW).
   * Emits preemption request to Primary Engine via StateEngine without mutating Primary state.
   *
   * @param {string} headlineText - Urgent Breaking Headline text
   * @returns {Promise<string>} Playback promise
   */
  async showNow(headlineText) {
    if (!headlineText || typeof headlineText !== 'string' || !headlineText.trim()) {
      throw new Error('[BreakingNewsProfile] Headline text must be a non-empty string.');
    }

    const cleanText = headlineText.trim();
    this.isActive = true;
    this.currentHeadline = cleanText;

    // 1. Send preemption handshake to Primary Headline Engine via StateEngine
    this.stateEngine.emit('breaking-news', 'preempt', {
      timestamp: Date.now(),
      headline: cleanText
    });

    // 2. Load breaking headline into runtime
    this.runtime.loadHeadlines([cleanText]);

    // 3. Notify callbacks
    this._notifyShowNow(cleanText);

    // 4. Start playback cycle
    return await this.runtime.play();
  }

  /**
   * Stop Breaking News display immediately (Manual Trigger: ■ STOP).
   * Executes collapse motion, hides Breaking display, and emits release request
   * to allow Primary Headline Engine to automatically resume playback.
   */
  stop() {
    if (!this.isActive) return;

    this.isActive = false;

    // 1. Stop underlying runtime
    this.runtime.stop();

    // 2. Emit release handshake via StateEngine to resume Primary Engine
    this.stateEngine.emit('breaking-news', 'release', {
      timestamp: Date.now()
    });

    // 3. Notify callbacks
    this._notifyStop();
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
