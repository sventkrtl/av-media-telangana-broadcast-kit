/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Editorial Output Canonicalizer (Stage 5D)
 * Normalizes top-level keys, string priorities, and string whitespace
 * from raw Gemini responses into the canonical schema format.
 * ============================================================
 */

/**
 * Normalizes raw Gemini parsed output into canonical schema format.
 *
 * Input: Editorial JSON Object
 * Output Contract: Canonical Editorial Object
 * {
 *   PRIMARY_HEADLINES: Array<Object>,
 *   SECONDARY_PLAYLIST: Array<Object>
 * }
 *
 * @param {Object} editorialObject - Raw parsed JSON from Gemini Response Parser.
 * @returns {Object} Canonicalized Editorial Object.
 */
function normalizeEditorialOutput(editorialObject) {
  if (!editorialObject || typeof editorialObject !== 'object' || Array.isArray(editorialObject)) {
    return {
      PRIMARY_HEADLINES: [],
      SECONDARY_PLAYLIST: []
    };
  }

  // 1. Resolve Top-Level Key for PRIMARY_HEADLINES
  var rawPrimary = editorialObject.PRIMARY_HEADLINES ||
                   editorialObject.primaryHeadlines ||
                   editorialObject.primary_headlines ||
                   editorialObject.primaryheadlines ||
                   [];

  // 2. Resolve Top-Level Key for SECONDARY_PLAYLIST
  var rawSecondary = editorialObject.SECONDARY_PLAYLIST ||
                     editorialObject.secondaryPlaylist ||
                     editorialObject.secondary_playlist ||
                     editorialObject.secondaryplaylist ||
                     [];

  var canonicalPrimary = Array.isArray(rawPrimary) ? rawPrimary.map(normalizePrimaryItem_) : [];
  var canonicalSecondary = Array.isArray(rawSecondary) ? rawSecondary.map(normalizeSecondaryItem_) : [];

  return {
    PRIMARY_HEADLINES: canonicalPrimary,
    SECONDARY_PLAYLIST: canonicalSecondary
  };
}

/**
 * Normalizes individual Primary Headline item.
 */
function normalizePrimaryItem_(item) {
  if (!item || typeof item !== 'object') return item;

  var headlineText = item.headline || item.headline_text || item.text || "";
  var sourceText = item.source || item.source_name || "";

  return {
    headline: typeof headlineText === 'string' ? headlineText.trim() : headlineText,
    source: typeof sourceText === 'string' ? sourceText.trim() : sourceText
  };
}

/**
 * Normalizes individual Secondary Playlist item.
 */
function normalizeSecondaryItem_(item) {
  if (!item || typeof item !== 'object') return item;

  var categoryText = item.category || "";
  var districtText = item.district || "";
  var crawlText = item.headline || item.crawlText || item.crawl_text || item.story || item.text || "";

  return {
    category: typeof categoryText === 'string' ? categoryText.trim() : categoryText,
    district: typeof districtText === 'string' ? districtText.trim() : districtText,
    priority: normalizePriorityValue_(item.priority),
    order: normalizeIntegerValue_(item.order || item.sequence, 1),
    headline: typeof crawlText === 'string' ? crawlText.trim() : crawlText
  };
}

/**
 * Converts priority values (High/Medium/Low, string numbers, or integers) to integer 1, 2, or 3.
 */
function normalizePriorityValue_(val) {
  if (typeof val === 'number') {
    return Math.max(1, Math.floor(val));
  }

  if (typeof val === 'string') {
    var clean = val.trim().toLowerCase();
    if (clean === 'high' || clean === '1') return 1;
    if (clean === 'medium' || clean === '2') return 2;
    if (clean === 'low' || clean === '3') return 3;
    var parsedInt = parseInt(clean, 10);
    if (!isNaN(parsedInt) && parsedInt > 0) return parsedInt;
  }

  return 1;
}

/**
 * Safely normalizes integer value with fallback.
 */
function normalizeIntegerValue_(val, fallback) {
  if (typeof val === 'number') return Math.floor(val);
  if (typeof val === 'string') {
    var p = parseInt(val.trim(), 10);
    if (!isNaN(p)) return p;
  }
  return fallback || 1;
}
