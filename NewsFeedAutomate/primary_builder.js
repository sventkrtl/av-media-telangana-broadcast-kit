/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Editorial Input Builder (Stage 5)
 * Constructs token-optimized input payload for Gemini Editorial Processing.
 * ============================================================
 */

/**
 * Builds the compact, deterministic EditorialInput payload for Gemini processing.
 *
 * Input: Array<UniqueFeedItem>
 * Output Contract: EditorialInput Object
 * {
 *   generatedAt: string, // ISO-8601 UTC
 *   itemCount: number,
 *   stories: Array<{
 *     Source: string,
 *     Priority: number,
 *     Title: string,
 *     Description: string,
 *     PublishedTime: string,
 *     Category: Array<string>,
 *     Link: string
 *   }>
 * }
 *
 * @param {Array<Object>} uniqueItems - Array of UniqueFeedItem objects from Duplicate Engine.
 * @param {Date} [referenceDate] - Optional reference date for deterministic testing.
 * @returns {Object} EditorialInput payload object.
 */
function buildEditorialInputPayload(uniqueItems, referenceDate) {
  if (!uniqueItems || !Array.isArray(uniqueItems) || uniqueItems.length === 0) {
    var genTimeEmpty = (typeof getCurrentUtcTimestamp === 'function')
      ? getCurrentUtcTimestamp(referenceDate)
      : (referenceDate instanceof Date ? referenceDate.toISOString() : new Date().toISOString());

    return {
      generatedAt: genTimeEmpty,
      itemCount: 0,
      stories: []
    };
  }

  // Step 1: Sort Newest First (PublishedTime descending)
  var sortedItems = uniqueItems.slice().sort(function (a, b) {
    var timeA = new Date(a.PublishedTime || 0).getTime();
    var timeB = new Date(b.PublishedTime || 0).getTime();
    return timeB - timeA; // Descending
  });

  // Step 2: Limit items to CONFIG.PIPELINE_LIMITS.MAX_GEMINI_INPUT_ITEMS
  var maxInputItems = 20;
  if (typeof CONFIG !== 'undefined' && CONFIG.PIPELINE_LIMITS && CONFIG.PIPELINE_LIMITS.MAX_GEMINI_INPUT_ITEMS) {
    maxInputItems = CONFIG.PIPELINE_LIMITS.MAX_GEMINI_INPUT_ITEMS;
  }

  var limitedItems = sortedItems.slice(0, maxInputItems);

  // Step 3 & 4: Include ONLY required fields (Exclude GUID, Hash, Status, Author, Media, Image)
  var stories = limitedItems.map(function (item) {
    return {
      Source: item.Source || "",
      Priority: item.Priority || 0,
      Title: item.Title || "",
      Description: item.Description || "",
      PublishedTime: item.PublishedTime || "",
      Category: item.Category || [],
      Link: item.Link || ""
    };
  });

  var genTime = (typeof getCurrentUtcTimestamp === 'function')
    ? getCurrentUtcTimestamp(referenceDate)
    : (referenceDate instanceof Date ? referenceDate.toISOString() : new Date().toISOString());

  // Step 5 & 6: Deterministic output object
  return {
    generatedAt: genTime,
    itemCount: stories.length,
    stories: stories
  };
}