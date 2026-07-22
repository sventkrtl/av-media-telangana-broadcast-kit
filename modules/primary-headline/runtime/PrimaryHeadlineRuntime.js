/**
 * AV Media Telangana - Primary Headline Runtime (Task P1-5)
 *
 * Master unified runtime orchestrator for the Primary Headline Engine.
 * Coordinates TimelineBuilder ➔ PlaybackController ➔ MotionEngine ➔ StaticRenderer.
 *
 * Responsibilities:
 *   - Single unified public runtime API
 *   - Lifetime management (initialize, loadHeadlines, play, pause, resume, stop, next, previous, reset, destroy)
 *   - Strict headline validation (rejects empty, null, whitespace-only, invalid inputs)
 *   - Continuous infinite looping (Headline 1 ➔ ... ➔ Headline N ➔ Headline 1)
 *   - Event hooks (onHeadlineStart, onHeadlineComplete, onRuntimeError)
 *   - Defensive error policy (traps errors, notifies callbacks, never crashes process)
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0.
 */

import { HeadlineTimelineBuilder } from '../HeadlineTimelineBuilder.js';
import { PrimaryTimelinePlaybackController } from '../playback/PrimaryTimelinePlaybackController.js';
import { PrimaryMotionEngine } from '../motion/PrimaryMotionEngine.js';
import { PrimaryStaticRenderer } from '../renderer/PrimaryStaticRenderer.js';
import { EVENT_TYPES } from '../HeadlineTimelineEvent.js';

export class PrimaryHeadlineRuntime {
  /**
   * @param {Object} [options]
   * @param {HTMLElement|Object} [options.containerElement] - Parent DOM container
   * @param {boolean} [options.loop=true] - Infinite continuous looping flag
   */
  constructor(options = {}) {
    this.options = options;
    this.containerElement = options.containerElement || null;

    this.timelineBuilder = null;
    this.motionEngine = null;
    this.staticRenderer = null;
    this.playbackController = null;

    this.isInitialized = false;
    this.isLooping = options.loop !== false;
    this.rawHeadlines = [];

    // Callback registries
    this.headlineStartCallbacks = [];
    this.headlineCompleteCallbacks = [];
    this.runtimeErrorCallbacks = [];
  }

  // ----------------------------------------------------
  // Event Hook Callbacks
  // ----------------------------------------------------

  /**
   * Register a callback triggered when a headline begins playback.
   * @param {Function} callback - (headlineText, index) => void
   */
  onHeadlineStart(callback) {
    if (typeof callback === 'function') {
      this.headlineStartCallbacks.push(callback);
    }
  }

  /**
   * Register a callback triggered when a headline completes its lifecycle.
   * @param {Function} callback - (headlineId, index) => void
   */
  onHeadlineComplete(callback) {
    if (typeof callback === 'function') {
      this.headlineCompleteCallbacks.push(callback);
    }
  }

  /**
   * Register a callback triggered when a runtime error occurs.
   * @param {Function} callback - (error) => void
   */
  onRuntimeError(callback) {
    if (typeof callback === 'function') {
      this.runtimeErrorCallbacks.push(callback);
    }
  }

  // ----------------------------------------------------
  // Public Runtime API
  // ----------------------------------------------------

  /**
   * Initialize all core foundation modules and wire event hooks.
   *
   * @param {Object} [options]
   * @returns {Promise<boolean>} Resolves true when initialization succeeds
   */
  async initialize(options = {}) {
    try {
      if (options.containerElement) {
        this.containerElement = options.containerElement;
      }

      this.timelineBuilder = new HeadlineTimelineBuilder();
      this.motionEngine = new PrimaryMotionEngine(options);
      this.staticRenderer = new PrimaryStaticRenderer();

      this.playbackController = new PrimaryTimelinePlaybackController({
        motionEngine: this.motionEngine,
        staticRenderer: this.staticRenderer,
        loop: this.isLooping
      });

      // Mount renderer if container element provided
      if (this.containerElement) {
        this.staticRenderer.initialize(this.containerElement);
      }

      // Wire playback controller event callbacks
      this.playbackController.onStageStart((event) => {
        if (event.type === EVENT_TYPES.TEXT_IN && event.payload && event.payload.headlineText) {
          this._notifyHeadlineStart(event.payload.headlineText, event.headlineIndex);
        }
      });

      this.playbackController.onHeadlineComplete((headlineId, index) => {
        this._notifyHeadlineComplete(headlineId, index);
      });

      this.isInitialized = true;
      return true;
    } catch (err) {
      this._notifyRuntimeError(err);
      return false;
    }
  }

  /**
   * Load raw headline array into the runtime.
   *
   * @param {Array<string|Object>} headlines
   * @returns {number} Count of headlines loaded
   */
  loadHeadlines(headlines) {
    if (!this.isInitialized) {
      const err = new Error('[PrimaryHeadlineRuntime] Cannot load headlines before calling initialize().');
      this._notifyRuntimeError(err);
      throw err;
    }

    if (!Array.isArray(headlines) || headlines.length === 0) {
      const err = new Error('[PrimaryHeadlineRuntime] Cannot load empty or invalid headlines array.');
      this._notifyRuntimeError(err);
      throw err;
    }

    try {
      const timeline = this.timelineBuilder.buildPlaylistTimeline(headlines);
      this.playbackController.load(timeline);
      this.rawHeadlines = [...headlines];
      return headlines.length;
    } catch (err) {
      this._notifyRuntimeError(err);
      throw err;
    }
  }

  /**
   * Start playback of loaded headlines.
   *
   * @returns {Promise<string>}
   */
  async play() {
    if (!this.isInitialized) {
      const err = new Error('[PrimaryHeadlineRuntime] Cannot play before initialization.');
      this._notifyRuntimeError(err);
      throw err;
    }

    try {
      const containerElements = {
        barElement: this.staticRenderer ? this.staticRenderer.barElement : null,
        textElement: this.staticRenderer ? this.staticRenderer.textElement : null
      };

      return await this.playbackController.play(containerElements);
    } catch (err) {
      this._notifyRuntimeError(err);
      throw err;
    }
  }

  /**
   * Pause runtime playback.
   */
  pause() {
    if (this.playbackController) {
      this.playbackController.pause();
    }
  }

  /**
   * Resume paused runtime playback.
   */
  resume() {
    if (this.playbackController) {
      this.playbackController.resume();
    }
  }

  /**
   * Stop runtime playback and return to idle.
   */
  stop() {
    if (this.playbackController) {
      this.playbackController.stop();
    }
  }

  /**
   * Advance immediately to next headline item.
   */
  async next() {
    if (this.playbackController) {
      return await this.playbackController.step({
        barElement: this.staticRenderer ? this.staticRenderer.barElement : null,
        textElement: this.staticRenderer ? this.staticRenderer.textElement : null
      });
    }
  }

  /**
   * Skip back to previous headline item.
   */
  async previous() {
    if (this.playbackController && this.playbackController.currentIndex > 0) {
      this.playbackController.currentIndex = Math.max(0, this.playbackController.currentIndex - 2);
      return await this.next();
    }
  }

  /**
   * Reset runtime state and clear loaded headlines.
   */
  reset() {
    if (this.playbackController) {
      this.playbackController.reset();
    }
    this.rawHeadlines = [];
  }

  /**
   * Destroy runtime instance and all underlying sub-modules.
   */
  destroy() {
    this.reset();
    if (this.playbackController) {
      this.playbackController.destroy();
    }
    if (this.staticRenderer) {
      this.staticRenderer.destroy();
    }

    this.containerElement = null;
    this.timelineBuilder = null;
    this.motionEngine = null;
    this.staticRenderer = null;
    this.playbackController = null;
    this.isInitialized = false;

    this.headlineStartCallbacks = [];
    this.headlineCompleteCallbacks = [];
    this.runtimeErrorCallbacks = [];
  }

  // ----------------------------------------------------
  // Internal Notification Helpers
  // ----------------------------------------------------

  _notifyHeadlineStart(text, index) {
    this.headlineStartCallbacks.forEach(fn => {
      try { fn(text, index); } catch (e) { console.error(e); }
    });
  }

  _notifyHeadlineComplete(headlineId, index) {
    this.headlineCompleteCallbacks.forEach(fn => {
      try { fn(headlineId, index); } catch (e) { console.error(e); }
    });
  }

  _notifyRuntimeError(error) {
    this.runtimeErrorCallbacks.forEach(fn => {
      try { fn(error); } catch (e) { console.error(e); }
    });
  }
}
