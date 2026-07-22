/**
 * AV Media Telangana - Primary Headline Timeline Builder (Task P1-1)
 *
 * Converts input headline data (single item or list) into a structured,
 * sequential timeline of HeadlineTimelineEvents.
 *
 * Sequence Per Headline:
 *   BAR_IN ➔ TEXT_IN ➔ TEXT_HOLD ➔ TEXT_OUT ➔ BAR_OUT ➔ HEADLINE_END
 *
 * For multi-item continuous feeds, the permanent bar remains active between
 * consecutive headlines:
 *   BAR_IN ➔ [TEXT_IN ➔ TEXT_HOLD ➔ TEXT_OUT] × N ➔ BAR_OUT ➔ HEADLINE_END
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0.
 */

import { EVENT_TYPES, HeadlineTimelineEvent, DEFAULT_STAGE_DURATIONS } from './HeadlineTimelineEvent.js';

export class HeadlineTimelineBuilder {
  /**
   * @param {Object} [options]
   * @param {number} [options.holdDuration=4000] - Duration of TEXT_HOLD stage in ms
   * @param {number} [options.revealDuration=300] - Duration of BAR_IN / TEXT_IN stages in ms
   * @param {number} [options.hideDuration=300] - Duration of TEXT_OUT / BAR_OUT stages in ms
   */
  constructor(options = {}) {
    this.holdDuration = options.holdDuration || DEFAULT_STAGE_DURATIONS[EVENT_TYPES.TEXT_HOLD];
    this.revealDuration = options.revealDuration || DEFAULT_STAGE_DURATIONS[EVENT_TYPES.TEXT_IN];
    this.hideDuration = options.hideDuration || DEFAULT_STAGE_DURATIONS[EVENT_TYPES.TEXT_OUT];
  }

  /**
   * Validate a single headline item.
   * Rejects null, undefined, empty strings, whitespace-only strings, or objects without text.
   *
   * @param {string|Object} item
   * @returns {Object} Normalized headline object { id, text }
   * @throws {Error} If headline is invalid
   */
  validateHeadline(item) {
    if (item === null || item === undefined) {
      throw new Error('[HeadlineTimelineBuilder] Headline item cannot be null or undefined.');
    }

    let text = '';
    let id = null;

    if (typeof item === 'string') {
      text = item.trim();
    } else if (typeof item === 'object' && item !== null) {
      text = typeof item.text === 'string' ? item.text.trim() : '';
      id = item.id || null;
    } else {
      throw new Error(`[HeadlineTimelineBuilder] Unsupported headline item format: ${typeof item}`);
    }

    if (!text || text.length === 0) {
      throw new Error('[HeadlineTimelineBuilder] Headline text cannot be empty or whitespace-only.');
    }

    return {
      id: id || `hl_${Math.random().toString(36).substr(2, 8)}`,
      text
    };
  }

  /**
   * Build a complete timeline for a single headline.
   * Sequence: BAR_IN ➔ TEXT_IN ➔ TEXT_HOLD ➔ TEXT_OUT ➔ BAR_OUT ➔ HEADLINE_END
   *
   * @param {string|Object} rawHeadline
   * @returns {HeadlineTimelineEvent[]}
   */
  buildSingleTimeline(rawHeadline) {
    const headline = this.validateHeadline(rawHeadline);
    const events = [];

    // 1. Stage 1: Blue Bar Reveal
    events.push(new HeadlineTimelineEvent({
      type: EVENT_TYPES.BAR_IN,
      headlineId: headline.id,
      headlineIndex: 0,
      duration: this.revealDuration,
      payload: { headlineText: headline.text }
    }));

    // 2. Stage 2: Headline Reveal
    events.push(new HeadlineTimelineEvent({
      type: EVENT_TYPES.TEXT_IN,
      headlineId: headline.id,
      headlineIndex: 0,
      duration: this.revealDuration,
      payload: { headlineText: headline.text }
    }));

    // 3. Stage 3: Headline Hold (4000ms)
    events.push(new HeadlineTimelineEvent({
      type: EVENT_TYPES.TEXT_HOLD,
      headlineId: headline.id,
      headlineIndex: 0,
      duration: this.holdDuration,
      payload: { headlineText: headline.text }
    }));

    // 4. Stage 4: Headline Hide
    events.push(new HeadlineTimelineEvent({
      type: EVENT_TYPES.TEXT_OUT,
      headlineId: headline.id,
      headlineIndex: 0,
      duration: this.hideDuration,
      payload: { headlineText: headline.text }
    }));

    // 5. Stage 5: Blue Bar Hide
    events.push(new HeadlineTimelineEvent({
      type: EVENT_TYPES.BAR_OUT,
      headlineId: headline.id,
      headlineIndex: 0,
      duration: this.hideDuration,
      payload: { headlineText: headline.text }
    }));

    // 6. Timeline End Marker
    events.push(new HeadlineTimelineEvent({
      type: EVENT_TYPES.HEADLINE_END,
      headlineId: headline.id,
      headlineIndex: 0,
      duration: 0,
      payload: { headlineText: headline.text }
    }));

    return events;
  }

  /**
   * Build a multi-headline timeline for continuous broadcast loop playback.
   *
   * Sequence:
   *   BAR_IN
   *   ➔ [TEXT_IN ➔ TEXT_HOLD ➔ TEXT_OUT] for Item 0
   *   ➔ [TEXT_IN ➔ TEXT_HOLD ➔ TEXT_OUT] for Item 1
   *   ...
   *   ➔ BAR_OUT
   *   ➔ HEADLINE_END
   *
   * @param {Array<string|Object>} rawHeadlines
   * @returns {HeadlineTimelineEvent[]}
   */
  buildPlaylistTimeline(rawHeadlines) {
    if (!Array.isArray(rawHeadlines) || rawHeadlines.length === 0) {
      throw new Error('[HeadlineTimelineBuilder] Headline playlist must be a non-empty array.');
    }

    const validatedHeadlines = rawHeadlines.map(h => this.validateHeadline(h));
    const events = [];

    const firstItem = validatedHeadlines[0];
    const lastItem = validatedHeadlines[validatedHeadlines.length - 1];

    // Initial Stage 1: Blue Bar Reveal
    events.push(new HeadlineTimelineEvent({
      type: EVENT_TYPES.BAR_IN,
      headlineId: firstItem.id,
      headlineIndex: 0,
      duration: this.revealDuration,
      payload: { headlineText: firstItem.text }
    }));

    // Headlines iteration (Stage 2 ➔ Stage 3 ➔ Stage 4 for each headline)
    validatedHeadlines.forEach((headline, index) => {
      // Stage 2: Headline Reveal
      events.push(new HeadlineTimelineEvent({
        type: EVENT_TYPES.TEXT_IN,
        headlineId: headline.id,
        headlineIndex: index,
        duration: this.revealDuration,
        payload: { headlineText: headline.text }
      }));

      // Stage 3: Headline Hold
      events.push(new HeadlineTimelineEvent({
        type: EVENT_TYPES.TEXT_HOLD,
        headlineId: headline.id,
        headlineIndex: index,
        duration: this.holdDuration,
        payload: { headlineText: headline.text }
      }));

      // Stage 4: Headline Hide
      events.push(new HeadlineTimelineEvent({
        type: EVENT_TYPES.TEXT_OUT,
        headlineId: headline.id,
        headlineIndex: index,
        duration: this.hideDuration,
        payload: { headlineText: headline.text }
      }));
    });

    // Final Stage 5: Blue Bar Hide
    events.push(new HeadlineTimelineEvent({
      type: EVENT_TYPES.BAR_OUT,
      headlineId: lastItem.id,
      headlineIndex: validatedHeadlines.length - 1,
      duration: this.hideDuration,
      payload: { headlineText: lastItem.text }
    }));

    // Timeline End Marker
    events.push(new HeadlineTimelineEvent({
      type: EVENT_TYPES.HEADLINE_END,
      headlineId: lastItem.id,
      headlineIndex: validatedHeadlines.length - 1,
      duration: 0,
      payload: { headlineText: lastItem.text }
    }));

    return events;
  }
}
