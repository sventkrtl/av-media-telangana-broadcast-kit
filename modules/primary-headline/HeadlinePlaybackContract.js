/**
 * AV Media Telangana - Primary Headline Playback Contract (Task P1-1)
 *
 * Defines the formal public API contract interface for Primary Headline Engine
 * playback controllers and runtimes.
 *
 * Required Public API:
 *   - load(headlines)
 *   - play()
 *   - pause()
 *   - resume()
 *   - stop()
 *   - next()
 *   - previous()
 *   - reset()
 *   - destroy()
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0.
 * THIS IS AN INTERFACE CONTRACT ONLY — NO RENDERER / MOTION LOGIC IS IMPLEMENTED HERE.
 */

export class HeadlinePlaybackContract {
  constructor() {
    if (new.target === HeadlinePlaybackContract) {
      throw new Error('[HeadlinePlaybackContract] Cannot instantiate Abstract Playback Contract directly.');
    }
  }

  /**
   * Load headline items into the playback controller.
   * @param {Array<string|Object>|string|Object} headlines
   * @returns {Promise<void>|void}
   */
  load(headlines) {
    throw new Error('[HeadlinePlaybackContract] Method "load(headlines)" must be implemented by subclass.');
  }

  /**
   * Start playback of loaded headlines.
   * @returns {Promise<void>|void}
   */
  play() {
    throw new Error('[HeadlinePlaybackContract] Method "play()" must be implemented by subclass.');
  }

  /**
   * Pause headline playback (hold at current stage).
   * @returns {void}
   */
  pause() {
    throw new Error('[HeadlinePlaybackContract] Method "pause()" must be implemented by subclass.');
  }

  /**
   * Resume headline playback from paused state.
   * @returns {void}
   */
  resume() {
    throw new Error('[HeadlinePlaybackContract] Method "resume()" must be implemented by subclass.');
  }

  /**
   * Stop headline playback and return to IDLE state.
   * @returns {Promise<void>|void}
   */
  stop() {
    throw new Error('[HeadlinePlaybackContract] Method "stop()" must be implemented by subclass.');
  }

  /**
   * Advance immediately to the next headline in queue.
   * @returns {Promise<void>|void}
   */
  next() {
    throw new Error('[HeadlinePlaybackContract] Method "next()" must be implemented by subclass.');
  }

  /**
   * Skip back to previous headline in queue.
   * @returns {Promise<void>|void}
   */
  previous() {
    throw new Error('[HeadlinePlaybackContract] Method "previous()" must be implemented by subclass.');
  }

  /**
   * Reset playback state, clearing active timeline and queue.
   * @returns {void}
   */
  reset() {
    throw new Error('[HeadlinePlaybackContract] Method "reset()" must be implemented by subclass.');
  }

  /**
   * Destroy playback instance and clean up references.
   * @returns {void}
   */
  destroy() {
    throw new Error('[HeadlinePlaybackContract] Method "destroy()" must be implemented by subclass.');
  }
}
