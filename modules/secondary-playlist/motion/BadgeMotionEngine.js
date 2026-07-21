/**
 * AV Media Telangana - Badge Motion Engine (Task 3A Foundation)
 * Dedicated motion controller for animating ONLY the playlist category/district label badge.
 * Strictly adheres to SECONDARY_NEWS_PLAYLIST_ENGINE_SPEC.md Constitution v1.0.
 * Uses ONLY transform (translateX) and opacity for 60 FPS GPU acceleration without layout reflows.
 */

import { EVENT_TYPES } from '../interpreter/TimelineEvent.js';

export class BadgeMotionEngine {
  constructor(options = {}) {
    this.inDuration = options.inDuration || 300;   // 300ms BADGE_IN
    this.outDuration = options.outDuration || 250; // 250ms BADGE_OUT
    this.isAnimating = false;
    this.currentStatus = 'IDLE'; // 'IDLE' | 'IN' | 'HOLD' | 'OUT'
    this.activeBadgeElement = null;
  }

  /**
   * Process a TimelineEvent and trigger badge motion if applicable.
   * Ignores non-badge events (NEWS_START, NEWS_END, LOGO_SEPARATOR, PLAYLIST_END).
   * @param {HTMLElement|Object} badgeElement - DOM node or mock element representing the badge.
   * @param {Object} timelineEvent - TimelineEvent instance.
   * @returns {Promise<string>} Resolves with status when transition completes.
   */
  async processEvent(badgeElement, timelineEvent) {
    if (!badgeElement || !timelineEvent || !timelineEvent.type) {
      return this.currentStatus;
    }

    this.activeBadgeElement = badgeElement;

    switch (timelineEvent.type) {
      case EVENT_TYPES.BADGE_IN:
        return this.animateIn(badgeElement);

      case EVENT_TYPES.BADGE_HOLD:
        return this.hold(badgeElement);

      case EVENT_TYPES.BADGE_OUT:
        return this.animateOut(badgeElement);

      default:
        // Ignore all other events
        return this.currentStatus;
    }
  }

  /**
   * BADGE_IN Motion
   * translateX(-100%) -> translateX(0), opacity 0 -> 1 over 300ms (ease-out)
   */
  animateIn(element) {
    return new Promise((resolve) => {
      this.isAnimating = true;
      this.currentStatus = 'IN';

      if (typeof document !== 'undefined' && element instanceof HTMLElement) {
        element.style.willChange = 'transform, opacity';
        element.style.transition = `transform ${this.inDuration}ms cubic-bezier(0, 0, 0.2, 1), opacity ${this.inDuration}ms cubic-bezier(0, 0, 0.2, 1)`;
        element.style.transform = 'translate3d(-100%, 0, 0)';
        element.style.opacity = '0';

        // Force browser style flush
        void element.offsetWidth;

        element.style.transform = 'translate3d(0, 0, 0)';
        element.style.opacity = '1';

        setTimeout(() => {
          element.style.willChange = 'auto';
          element.style.transition = 'none';
          this.isAnimating = false;
          resolve('IN_COMPLETE');
        }, this.inDuration);
      } else {
        // Mock environment (Node test)
        if (element.style) {
          element.style.transform = 'translate3d(0, 0, 0)';
          element.style.opacity = '1';
        }
        this.isAnimating = false;
        resolve('IN_COMPLETE');
      }
    });
  }

  /**
   * BADGE_HOLD State
   * Remains perfectly still at translateX(0), opacity 1
   */
  hold(element) {
    this.isAnimating = false;
    this.currentStatus = 'HOLD';

    if (element && element.style) {
      element.style.willChange = 'auto';
      element.style.transition = 'none';
      element.style.transform = 'translate3d(0, 0, 0)';
      element.style.opacity = '1';
    }

    return Promise.resolve('HOLD_ACTIVE');
  }

  /**
   * BADGE_OUT Motion
   * translateX(0) -> translateX(-100%), opacity 1 -> 0 over 250ms (ease-in)
   */
  animateOut(element) {
    return new Promise((resolve) => {
      this.isAnimating = true;
      this.currentStatus = 'OUT';

      if (typeof document !== 'undefined' && element instanceof HTMLElement) {
        element.style.willChange = 'transform, opacity';
        element.style.transition = `transform ${this.outDuration}ms cubic-bezier(0.4, 0, 1, 1), opacity ${this.outDuration}ms cubic-bezier(0.4, 0, 1, 1)`;
        element.style.transform = 'translate3d(0, 0, 0)';
        element.style.opacity = '1';

        void element.offsetWidth;

        element.style.transform = 'translate3d(-100%, 0, 0)';
        element.style.opacity = '0';

        setTimeout(() => {
          element.style.willChange = 'auto';
          element.style.transition = 'none';
          this.isAnimating = false;
          resolve('OUT_COMPLETE');
        }, this.outDuration);
      } else {
        if (element.style) {
          element.style.transform = 'translate3d(-100%, 0, 0)';
          element.style.opacity = '0';
        }
        this.isAnimating = false;
        resolve('OUT_COMPLETE');
      }
    });
  }
}
