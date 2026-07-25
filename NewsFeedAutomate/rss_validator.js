/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * RSS Validator (Stage 3)
 * Filters and validates normalized feed items against quality rules.
 * ============================================================
 */

/**
 * Validates an array of NormalizedFeedItem objects.
 *
 * Input: Array<NormalizedFeedItem>
 * Output Contract: Array<ValidatedFeedItem> (Status: "VALIDATED")
 *
 * @param {Array<Object>} items - Array of NormalizedFeedItem objects.
 * @param {Date} [referenceDate] - Optional reference date for deterministic testing.
 * @returns {Array<Object>} Filtered array of valid items with Status = "VALIDATED".
 */
function validateNormalizedItems(items, referenceDate) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return [];
  }

  var maxAgeHours = 24;
  if (typeof CONFIG !== 'undefined' && CONFIG.PIPELINE_LIMITS && CONFIG.PIPELINE_LIMITS.MAX_FEED_AGE_HOURS) {
    maxAgeHours = CONFIG.PIPELINE_LIMITS.MAX_FEED_AGE_HOURS;
  }

  var validatedItems = [];
  var seenLinks = {};

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (!item) continue;

    // Rule 1: Title exists
    if (!item.Title || typeof item.Title !== 'string' || item.Title.trim().length === 0) {
      continue;
    }

    var title = item.Title.trim();

    // Rule 7 & 8: Title Length Bounds (15 <= length <= 150)
    if (title.length < 15 || title.length > 150) {
      continue;
    }

    // Rule 3: Link exists and valid format
    if (!item.Link || typeof item.Link !== 'string' || !/^https?:\/\/.+/i.test(item.Link.trim())) {
      continue;
    }

    var link = item.Link.trim();

    // Rule 4: PublishedTime exists
    if (!item.PublishedTime || typeof item.PublishedTime !== 'string') {
      continue;
    }

    // Rule 5: GUID exists
    if (!item.GUID || typeof item.GUID !== 'string' || item.GUID.trim().length === 0) {
      continue;
    }

    // Rule 6: Language must be Telugu (\u0C00-\u0C7F)
    if (!isTeluguText_(title)) {
      continue;
    }

    // Rule 9: PublishedTime max age check
    if (typeof isOlderThanHours === 'function') {
      if (isOlderThanHours(item.PublishedTime, maxAgeHours, referenceDate)) {
        continue;
      }
    }

    // Rule 10: Reject Noise Entries
    if (isNoiseEntry_(title) || isNoiseEntry_(link)) {
      continue;
    }

    // Rule 11: Intra-batch Duplicate Link Filter
    if (seenLinks[link]) {
      continue;
    }
    seenLinks[link] = true;

    // Clone item and update status to VALIDATED
    validatedItems.push({
      Source: item.Source || "",
      Priority: item.Priority || 0,
      Title: title,
      Description: item.Description || "",
      Link: link,
      PublishedTime: item.PublishedTime,
      Category: item.Category || [],
      Author: item.Author || "",
      GUID: item.GUID.trim(),
      Language: "te",
      Hash: item.Hash || null,
      Status: "VALIDATED"
    });
  }

  return validatedItems;
}

/**
 * Checks if a string contains Telugu Unicode characters (\u0C00-\u0C7F).
 */
function isTeluguText_(text) {
  if (!text) return false;
  return /[\u0C00-\u0C7F]/.test(text);
}

/**
 * Checks if title or link matches known noise / non-news entry patterns.
 */
function isNoiseEntry_(text) {
  if (!text) return false;
  var noiseRegex = /\b(Privacy|Advertisement|Live TV|Contact|About|Terms|Policy|Subscribe|Breaking Banner|Navigation|Menu|Home|Login|Register|Copyright|All Rights Reserved)\b/i;
  return noiseRegex.test(text);
}
