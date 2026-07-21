/**
 * AV Media Telangana - Constant Pixel-per-Second Crawl Engine (Task 3B)
 * Calculates constant visual reading velocity crawl animations for broadcast headlines.
 * Strictly adheres to SECONDARY_NEWS_PLAYLIST_ENGINE_SPEC.md Constitution v1.0.
 * Duration = TravelDistance / PixelsPerSecond. Uses translate3d with linear timing.
 */

import { EVENT_TYPES } from '../interpreter/TimelineEvent.js';

export class CrawlMotionEngine {
  constructor(options = {}) {
    this.pixelsPerSecond = options.pixelsPerSecond || 120; // Default constant speed (px/sec)
    this.configuredGap = options.configuredGap || 40;       // Gap px
    this.isCrawling = false;
    this.currentNewsElement = null;
  }

  /**
   * Set constant scroll speed in pixels per second.
   */
  setSpeed(pixelsPerSecond) {
    if (typeof pixelsPerSecond === 'number' && pixelsPerSecond > 0) {
      this.pixelsPerSecond = pixelsPerSecond;
    }
  }

  /**
   * Calculate travel distance and duration based on constant velocity formula:
   * TravelDistance = TextWidth + ViewportWidth + ConfiguredGap
   * Duration = TravelDistance / PixelsPerSecond
   */
  calculateCrawlMetrics(textWidth, viewportWidth = 1920) {
    const validTextWidth = Math.max(1, typeof textWidth === 'number' ? textWidth : 0);
    const validViewportWidth = Math.max(1, typeof viewportWidth === 'number' ? viewportWidth : 1920);

    const travelDistance = validTextWidth + validViewportWidth + this.configuredGap;
    const durationSeconds = travelDistance / this.pixelsPerSecond;
    const durationMs = durationSeconds * 1000;

    return {
      textWidth: validTextWidth,
      viewportWidth: validViewportWidth,
      travelDistance,
      pixelsPerSecond: this.pixelsPerSecond,
      durationSeconds,
      durationMs,
      startX: validViewportWidth + this.configuredGap,
      endX: -validTextWidth
    };
  }

  /**
   * Estimate text width based on character count for non-DOM / test environments.
   * Approx 11px per character at 18px font size.
   */
  estimateTextWidth(textString) {
    if (!textString) return 100;
    return Math.max(80, String(textString).length * 11);
  }

  /**
   * Animate news item crawl across viewport.
   * Starts outside right edge (startX) and exits completely beyond left edge (endX).
   * Uses translate3d with linear timing (no easing).
   */
  crawl(newsElement, newsContent, viewportWidth = 1920) {
    return new Promise((resolve) => {
      this.isCrawling = true;
      this.currentNewsElement = newsElement;

      let textWidth = 0;
      if (newsElement && typeof newsElement.offsetWidth === 'number' && newsElement.offsetWidth > 0) {
        textWidth = newsElement.offsetWidth;
      } else {
        textWidth = this.estimateTextWidth(newsContent);
      }

      const metrics = this.calculateCrawlMetrics(textWidth, viewportWidth);

      if (typeof document !== 'undefined' && newsElement instanceof HTMLElement) {
        newsElement.style.willChange = 'transform';
        newsElement.style.transition = 'none';
        newsElement.style.transform = `translate3d(${metrics.startX}px, 0, 0)`;

        void newsElement.offsetWidth; // Flush style

        newsElement.style.transition = `transform ${metrics.durationMs}ms linear`;
        newsElement.style.transform = `translate3d(${metrics.endX}px, 0, 0)`;

        setTimeout(() => {
          newsElement.style.willChange = 'auto';
          newsElement.style.transition = 'none';
          this.isCrawling = false;
          resolve({ status: 'CRAWL_COMPLETE', metrics });
        }, metrics.durationMs);
      } else {
        // Mock environment (Node test execution)
        if (newsElement && newsElement.style) {
          newsElement.style.transform = `translate3d(${metrics.endX}px, 0, 0)`;
        }
        this.isCrawling = false;
        resolve({ status: 'CRAWL_COMPLETE', metrics });
      }
    });
  }

  /**
   * Process a TimelineEvent for crawl motion.
   */
  async processEvent(newsElement, timelineEvent, viewportWidth = 1920) {
    if (!newsElement || !timelineEvent || timelineEvent.type !== EVENT_TYPES.NEWS_START) {
      return null;
    }

    const content = timelineEvent.payload ? timelineEvent.payload.newsContent : '';
    return this.crawl(newsElement, content, viewportWidth);
  }
}
