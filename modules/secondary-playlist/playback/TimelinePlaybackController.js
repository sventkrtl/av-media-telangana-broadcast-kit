/**
 * AV Media Telangana - Timeline Playback Controller (Task 3C - The Conductor)
 * Orchestrates sequential execution of TimelineEvent[] across Badge Motion Engine, Crawl Motion Engine, & Renderer.
 * Strictly adheres to SECONDARY_NEWS_PLAYLIST_ENGINE_SPEC.md Constitution v1.0.
 */

import { EVENT_TYPES } from '../interpreter/TimelineEvent.js';

export class TimelinePlaybackController {
  constructor(options = {}) {
    this.badgeMotionEngine = options.badgeMotionEngine || null;
    this.crawlMotionEngine = options.crawlMotionEngine || null;
    this.staticRenderer = options.staticRenderer || null;

    this.timeline = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.playbackState = 'IDLE'; // 'IDLE' | 'PLAYING' | 'PAUSED' | 'STOPPED'

    // Callbacks
    this.eventStartCallbacks = [];
    this.eventEndCallbacks = [];
    this.playlistChangeCallbacks = [];
  }

  setTimeline(timelineEvents) {
    this.timeline = Array.isArray(timelineEvents) ? timelineEvents : [];
    this.currentIndex = 0;
  }

  onEventStart(callback) {
    if (typeof callback === 'function') this.eventStartCallbacks.push(callback);
  }

  onEventEnd(callback) {
    if (typeof callback === 'function') this.eventEndCallbacks.push(callback);
  }

  onPlaylistChange(callback) {
    if (typeof callback === 'function') this.playlistChangeCallbacks.push(callback);
  }

  /**
   * Start sequential playback of the timeline.
   */
  async play(containerElements = {}) {
    if (this.timeline.length === 0) return 'TIMELINE_EMPTY';

    this.isPlaying = true;
    this.isPaused = false;
    this.playbackState = 'PLAYING';

    while (this.currentIndex < this.timeline.length && this.isPlaying) {
      if (this.isPaused) {
        await this.waitForResume();
        if (!this.isPlaying) break;
      }

      const event = this.timeline[this.currentIndex];
      this.notifyEventStart(event);

      // Execute event through motion engines & renderer
      await this.executeEvent(event, containerElements);

      this.notifyEventEnd(event);

      // Check if playlist changed
      if (event.type === EVENT_TYPES.PLAYLIST_END) {
        this.notifyPlaylistChange(event);
      }

      this.currentIndex++;
    }

    if (this.currentIndex >= this.timeline.length) {
      this.playbackState = 'COMPLETED';
      this.isPlaying = false;
      return 'TIMELINE_COMPLETED';
    }

    return this.playbackState;
  }

  /**
   * Execute a single TimelineEvent with the appropriate Engine (Badge / Crawl / Renderer).
   */
  async executeEvent(event, containerElements = {}) {
    const { badgeElement, newsElement, containerElement } = containerElements;

    // Render static DOM node if StaticRenderer available
    if (this.staticRenderer && containerElement) {
      this.staticRenderer.renderEvent(containerElement, event);
    }

    switch (event.type) {
      case EVENT_TYPES.BADGE_IN:
        if (this.badgeMotionEngine && badgeElement) {
          await this.badgeMotionEngine.processEvent(badgeElement, event);
        }
        break;

      case EVENT_TYPES.BADGE_HOLD:
        if (this.badgeMotionEngine && badgeElement) {
          await this.badgeMotionEngine.processEvent(badgeElement, event);
        }
        break;

      case EVENT_TYPES.NEWS_START:
        if (this.crawlMotionEngine && newsElement) {
          await this.crawlMotionEngine.processEvent(newsElement, event);
        }
        break;


      case EVENT_TYPES.LOGO_SEPARATOR:
        // SPEC Section 10 & 16: Logo scrolls inline at the same constant velocity as news text.
        // The logo has already been injected into newsElement by the onEventStart callback.
        // We now crawl it through the viewport — newsElement carries the <img> at this point.
        if (this.crawlMotionEngine && newsElement) {
          const vpWidth = (containerElement && containerElement.offsetWidth) ? containerElement.offsetWidth : 1920;
          await this.crawlMotionEngine.crawl(newsElement, '', vpWidth);
        }
        break;


      case EVENT_TYPES.NEWS_END:
        break;

      case EVENT_TYPES.BADGE_OUT:
        if (this.badgeMotionEngine && badgeElement) {
          await this.badgeMotionEngine.processEvent(badgeElement, event);
        }
        break;

      case EVENT_TYPES.PLAYLIST_END:
        break;
    }
  }

  pause() {
    if (this.isPlaying && !this.isPaused) {
      this.isPaused = true;
      this.playbackState = 'PAUSED';
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.playbackState = 'PLAYING';
    }
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentIndex = 0;
    this.playbackState = 'STOPPED';
  }

  stepNext() {
    if (this.currentIndex < this.timeline.length - 1) {
      this.currentIndex++;
      return this.timeline[this.currentIndex];
    }
    return null;
  }

  waitForResume() {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (!this.isPaused || !this.isPlaying) {
          clearInterval(check);
          resolve();
        }
      }, 50);
    });
  }

  notifyEventStart(event) {
    this.eventStartCallbacks.forEach(cb => cb(event, this.currentIndex));
  }

  notifyEventEnd(event) {
    this.eventEndCallbacks.forEach(cb => cb(event, this.currentIndex));
  }

  notifyPlaylistChange(event) {
    this.playlistChangeCallbacks.forEach(cb => cb(event));
  }
}
