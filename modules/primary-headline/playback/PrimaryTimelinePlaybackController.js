/**
 * AV Media Telangana - Primary Timeline Playback Controller (Task P1-4 - The Conductor)
 *
 * Orchestrates sequential execution of Primary Headline Timelines across:
 *   HeadlineTimelineEvent[] ➔ HeadlineStateMachine ➔ PrimaryMotionEngine ➔ PrimaryStaticRenderer
 *
 * Responsibilities:
 *   - Execute timeline stages sequentially (BAR_IN ➔ TEXT_IN ➔ TEXT_HOLD ➔ TEXT_OUT ➔ BAR_OUT ➔ HEADLINE_END)
 *   - Enforce non-overlapping stage execution
 *   - Manage playback controls (load, play, pause, resume, stop, step, reset, destroy)
 *   - Provide event hook callbacks (onStageStart, onStageComplete, onHeadlineComplete)
 *   - Protect against duplicate play calls, invalid timelines, and illegal transitions
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0.
 */

import { HeadlinePlaybackContract } from '../HeadlinePlaybackContract.js';
import { EVENT_TYPES } from '../HeadlineTimelineEvent.js';
import { HEADLINE_STATES, HeadlineStateMachine } from '../HeadlineStateMachine.js';
import { MOTION_STAGES, PrimaryMotionEngine } from '../motion/PrimaryMotionEngine.js';
import { PrimaryStaticRenderer } from '../renderer/PrimaryStaticRenderer.js';

export class PrimaryTimelinePlaybackController extends HeadlinePlaybackContract {
  /**
   * @param {Object} [options]
   * @param {PrimaryMotionEngine} [options.motionEngine] - Primary Motion Engine instance
   * @param {PrimaryStaticRenderer} [options.staticRenderer] - Primary Static Renderer instance
   * @param {HeadlineStateMachine} [options.stateMachine] - Primary State Machine instance
   * @param {boolean} [options.loop=true] - Whether to loop timeline continuously
   */
  constructor(options = {}) {
    super();

    this.motionEngine = options.motionEngine || new PrimaryMotionEngine();
    this.staticRenderer = options.staticRenderer || new PrimaryStaticRenderer();
    this.stateMachine = options.stateMachine || new HeadlineStateMachine();
    this.loop = options.loop !== undefined ? Boolean(options.loop) : true;

    this.timeline = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.isDestroyed = false;
    this.activeContainerElements = {};

    // Callback registries
    this.stageStartCallbacks = [];
    this.stageCompleteCallbacks = [];
    this.headlineCompleteCallbacks = [];
  }

  // ----------------------------------------------------
  // Event Hook Callbacks
  // ----------------------------------------------------

  /**
   * Register a callback triggered when a motion stage begins.
   * @param {Function} callback - (stageEvent) => void
   */
  onStageStart(callback) {
    if (typeof callback === 'function') {
      this.stageStartCallbacks.push(callback);
    }
  }

  /**
   * Register a callback triggered when a motion stage completes.
   * @param {Function} callback - (stageEvent, result) => void
   */
  onStageComplete(callback) {
    if (typeof callback === 'function') {
      this.stageCompleteCallbacks.push(callback);
    }
  }

  /**
   * Register a callback triggered when a headline item completes its lifecycle.
   * @param {Function} callback - (headlineId, index) => void
   */
  onHeadlineComplete(callback) {
    if (typeof callback === 'function') {
      this.headlineCompleteCallbacks.push(callback);
    }
  }

  // ----------------------------------------------------
  // Playback API Implementation
  // ----------------------------------------------------

  /**
   * Load timeline events into the controller.
   *
   * @param {Array<Object>} timelineEvents - List of HeadlineTimelineEvents
   * @throws {Error} If timeline is invalid or empty
   */
  load(timelineEvents) {
    if (!Array.isArray(timelineEvents) || timelineEvents.length === 0) {
      throw new Error('[PrimaryTimelinePlaybackController] Cannot load empty or invalid timeline array.');
    }

    this.timeline = [...timelineEvents];
    this.currentIndex = 0;
    this.stateMachine.reset();
  }

  /**
   * Start sequential timeline execution.
   *
   * @param {Object} [containerElements={}] - { barElement, textElement }
   * @returns {Promise<string>} Resolves with status when playback completes or stops
   */
  async play(containerElements = {}) {
    if (this.isPlaying) {
      throw new Error('[PrimaryTimelinePlaybackController] Duplicate play() request rejected. Controller is already playing.');
    }

    if (!Array.isArray(this.timeline) || this.timeline.length === 0) {
      throw new Error('[PrimaryTimelinePlaybackController] Cannot play: No loaded timeline events exist.');
    }

    this.activeContainerElements = containerElements;
    this.isPlaying = true;
    this.isPaused = false;

    try {
      while (this.currentIndex < this.timeline.length && this.isPlaying) {
        if (this.isPaused) {
          await this._waitForResume();
          if (!this.isPlaying) break;
        }

        const event = this.timeline[this.currentIndex];
        await this._executeEvent(event);

        this.currentIndex++;

        // Loop timeline continuous playback if configured
        if (this.currentIndex >= this.timeline.length && this.loop && this.isPlaying) {
          this.currentIndex = 0;
        }
      }

      this.isPlaying = false;
      return 'PLAYBACK_FINISHED';
    } catch (err) {
      this.isPlaying = false;
      console.error('[PrimaryTimelinePlaybackController] Playback error caught:', err);
      throw err;
    }
  }

  /**
   * Execute a single event manually (step mode).
   */
  async step(containerElements = {}) {
    if (this.timeline.length === 0 || this.currentIndex >= this.timeline.length) {
      return null;
    }

    this.activeContainerElements = containerElements;
    const event = this.timeline[this.currentIndex];
    const res = await this._executeEvent(event);
    this.currentIndex++;
    return res;
  }

  /**
   * Pause playback. Preserves stage progress.
   */
  pause() {
    if (!this.isPlaying || this.isPaused) return;

    this.isPaused = true;
    if (this.motionEngine) {
      this.motionEngine.pause();
    }
  }

  /**
   * Resume paused playback.
   */
  resume() {
    if (!this.isPlaying || !this.isPaused) return;

    this.isPaused = false;
    if (this.motionEngine) {
      this.motionEngine.resume();
    }
  }

  /**
   * Stop playback and return to IDLE state.
   */
  stop() {
    this.isPlaying = false;
    this.isPaused = false;

    if (this.motionEngine) {
      this.motionEngine.stop();
    }

    if (this.staticRenderer) {
      this.staticRenderer.clear();
    }

    this.stateMachine.reset();
    this.currentIndex = 0;
  }

  /**
   * Reset controller state and clear timeline.
   */
  reset() {
    this.stop();
    this.timeline = [];
    this.currentIndex = 0;
    this.activeContainerElements = {};
  }

  /**
   * Destroy controller instance and clean up references.
   */
  destroy() {
    this.reset();
    this.isDestroyed = true;

    if (this.motionEngine) {
      this.motionEngine.destroy();
    }
    if (this.staticRenderer) {
      this.staticRenderer.destroy();
    }

    this.stageStartCallbacks = [];
    this.stageCompleteCallbacks = [];
    this.headlineCompleteCallbacks = [];
  }

  // ----------------------------------------------------
  // Internal Stage Execution & State Synchronizer
  // ----------------------------------------------------

  /**
   * Execute one TimelineEvent sequentially across StateMachine ➔ Renderer ➔ MotionEngine.
   */
  async _executeEvent(event) {
    if (!event || !event.type) return null;

    const { barElement, viewportElement, textElement } = this.activeContainerElements;

    // 1. Sync State Machine transition
    const targetState = this._mapEventToState(event.type);
    if (targetState && this.stateMachine.canTransitionTo(targetState)) {
      this.stateMachine.transitionTo(targetState);
    }

    // 2. Notify onStageStart listeners
    this._notifyStart(event);

    // 3. Update Static Renderer text if BAR_IN or TEXT_IN
    if ((event.type === EVENT_TYPES.BAR_IN || event.type === EVENT_TYPES.TEXT_IN) && event.payload && event.payload.headlineText) {
      if (this.staticRenderer && this.staticRenderer.isInitialized) {
        this.staticRenderer.renderHeadline(event.payload.headlineText);
      }
    }

    // 4. Delegate motion stage execution to MotionEngine (sequential await).
    //    P1-7E Rendering Isolation: viewportElement receives clip-path / opacity (not textElement).
    //    textElement is the pure glyph rendering layer and is never touched by the Motion Engine.
    let motionResult = null;
    if (this.motionEngine && MOTION_STAGES[event.type]) {
      motionResult = await this.motionEngine.play(event.type, barElement, viewportElement || textElement);
    }

    // 5. Notify onStageComplete listeners
    this._notifyComplete(event, motionResult);

    // 6. Notify onHeadlineComplete when HEADLINE_END or TEXT_OUT finishes
    if (event.type === EVENT_TYPES.HEADLINE_END) {
      this._notifyHeadlineComplete(event.headlineId, event.headlineIndex);
    }

    return motionResult;
  }

  _mapEventToState(eventType) {
    switch (eventType) {
      case EVENT_TYPES.BAR_IN: return HEADLINE_STATES.BAR_IN;
      case EVENT_TYPES.TEXT_IN: return HEADLINE_STATES.TEXT_IN;
      case EVENT_TYPES.TEXT_HOLD: return HEADLINE_STATES.HOLD;
      case EVENT_TYPES.TEXT_OUT: return HEADLINE_STATES.TEXT_OUT;
      case EVENT_TYPES.BAR_OUT: return HEADLINE_STATES.BAR_OUT;
      case EVENT_TYPES.HEADLINE_END: return HEADLINE_STATES.COMPLETE;
      default: return null;
    }
  }

  _waitForResume() {
    return new Promise(resolve => {
      const check = setInterval(() => {
        if (!this.isPaused || !this.isPlaying) {
          clearInterval(check);
          resolve();
        }
      }, 50);
    });
  }

  _notifyStart(event) {
    this.stageStartCallbacks.forEach(fn => {
      try { fn(event); } catch (e) { console.error(e); }
    });
  }

  _notifyComplete(event, result) {
    this.stageCompleteCallbacks.forEach(fn => {
      try { fn(event, result); } catch (e) { console.error(e); }
    });
  }

  _notifyHeadlineComplete(headlineId, index) {
    this.headlineCompleteCallbacks.forEach(fn => {
      try { fn(headlineId, index); } catch (e) { console.error(e); }
    });
  }
}
