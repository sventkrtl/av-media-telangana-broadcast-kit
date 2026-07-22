/**
 * AV Media Telangana - Primary Headline Timeline Event Definitions (Task P1-1)
 *
 * Defines standard timeline event types and immutable event objects
 * for the Primary Headline Engine timeline.
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0.
 */

export const EVENT_TYPES = Object.freeze({
  BAR_IN: 'BAR_IN',
  TEXT_IN: 'TEXT_IN',
  TEXT_HOLD: 'TEXT_HOLD',
  TEXT_OUT: 'TEXT_OUT',
  BAR_OUT: 'BAR_OUT',
  HEADLINE_END: 'HEADLINE_END'
});

export const DEFAULT_STAGE_DURATIONS = Object.freeze({
  [EVENT_TYPES.BAR_IN]: 300,
  [EVENT_TYPES.TEXT_IN]: 300,
  [EVENT_TYPES.TEXT_HOLD]: 4000,
  [EVENT_TYPES.TEXT_OUT]: 300,
  [EVENT_TYPES.BAR_OUT]: 300,
  [EVENT_TYPES.HEADLINE_END]: 0
});

export class HeadlineTimelineEvent {
  /**
   * @param {Object} params
   * @param {string} params.type - One of EVENT_TYPES
   * @param {string|number} [params.headlineId] - Unique ID of headline item
   * @param {number} [params.headlineIndex] - 0-indexed position in playlist
   * @param {number} [params.duration] - Duration in ms
   * @param {Object} [params.payload] - Headline content payload
   */
  constructor({
    type,
    headlineId = null,
    headlineIndex = -1,
    duration = null,
    payload = {}
  }) {
    if (!type || !EVENT_TYPES[type]) {
      throw new Error(`[HeadlineTimelineEvent] Invalid event type: "${type}". Must be one of ${Object.keys(EVENT_TYPES).join(', ')}`);
    }

    this.id = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.type = type;
    this.headlineId = headlineId;
    this.headlineIndex = headlineIndex;
    this.duration = duration !== null ? duration : (DEFAULT_STAGE_DURATIONS[type] || 0);
    this.payload = Object.freeze({ ...payload });
    this.timestamp = Date.now();

    Object.freeze(this);
  }
}
