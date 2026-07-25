/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Shared Normalizer Utilities (Module 1)
 * Pure text processing and entity sanitization utilities.
 * ============================================================
 */

/**
 * Extracts inner text from CDATA sections if present.
 * @param {string} text - Raw XML/text string.
 * @returns {string} Text without CDATA wrapper.
 */
function extractCdata(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

/**
 * Strips HTML tags from text.
 * @param {string} htmlText - Text containing HTML tags.
 * @returns {string} Plain text without HTML tags.
 */
function stripHtml(htmlText) {
  if (!htmlText || typeof htmlText !== 'string') return '';
  return htmlText.replace(/<[^>]*>/g, '');
}

/**
 * Decodes HTML entities into raw Unicode characters.
 * Handles named entities, decimal numeric entities, and hex entities.
 * @param {string} text - Entity-encoded string.
 * @returns {string} Decoded string.
 */
function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return '';

  var entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&nbsp;': ' ',
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8216;': '‘',
    '&#8217;': '’',
    '&#8220;': '“',
    '&#8221;': '”',
    '&#8230;': '…'
  };

  var decoded = text.replace(/&(amp|lt|gt|quot|apos|nbsp|#39|#8211|#8212|#8216|#8217|#8220|#8221|#8230);/g, function (match) {
    return entities[match] || match;
  });

  // Decode decimal numeric entities (e.g. &#34;)
  decoded = decoded.replace(/&#(\d+);/g, function (match, dec) {
    return String.fromCharCode(parseInt(dec, 10));
  });

  // Decode hex numeric entities (e.g. &#x22;)
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, function (match, hex) {
    return String.fromCharCode(parseInt(hex, 16));
  });

  return decoded;
}

/**
 * Normalizes multi-spaces, newlines, and tabs into a single space and trims.
 * @param {string} text - Raw string.
 * @returns {string} Whitespace-normalized string.
 */
function normalizeWhitespace(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes string Unicode representation to UTF-8 Form C (NFC).
 * @param {string} text - Raw text string.
 * @returns {string} NFC normalized string.
 */
function normalizeUnicode(text) {
  if (!text || typeof text !== 'string') return '';
  return typeof text.normalize === 'function' ? text.normalize('NFC') : text;
}

/**
 * Removes trailing source branding suffixes from headline titles.
 * E.g., "- HMTV", "| V6 Velugu", "- Raj News", "- Vaartha", "| తెలుగు వార్తలు".
 * @param {string} title - Raw title string.
 * @returns {string} Clean title without trailing brand suffix.
 */
function removeSourceBranding(title) {
  if (!title || typeof title !== 'string') return '';

  var brandPatterns = [
    /\s*[-–—|]\s*HMTV\s*$/i,
    /\s*[-–—|]\s*V6\s*Velugu\s*$/i,
    /\s*[-–—|]\s*Raj\s*News\s*(Telugu)?\s*$/i,
    /\s*[-–—|]\s*Vaartha\s*$/i,
    /\s*[-–—|]\s*తెలుగు\s*వార్తలు\s*$/i,
    /\s*[-–—|]\s*V6\s*News\s*$/i
  ];

  var cleaned = title;
  brandPatterns.forEach(function (pattern) {
    cleaned = cleaned.replace(pattern, '');
  });

  return cleaned.trim();
}

/**
 * Full clean pipeline for headline title text:
 * CDATA extraction -> HTML strip -> Entity decode -> Brand removal -> Whitespace norm -> NFC norm.
 * @param {string} rawTitle - Raw feed title.
 * @returns {string} Sanitized title.
 */
function sanitizeHeadlineText(rawTitle) {
  if (!rawTitle || typeof rawTitle !== 'string') return '';
  var step1 = extractCdata(rawTitle);
  var step2 = stripHtml(step1);
  var step3 = decodeHtmlEntities(step2);
  var step4 = removeSourceBranding(step3);
  var step5 = normalizeWhitespace(step4);
  return normalizeUnicode(step5);
}
