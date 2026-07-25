/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Shared Date Utilities (Module 2)
 * Deterministic date parsing, ISO-8601 UTC conversion, and age calculation.
 * ============================================================
 */

/**
 * Returns current UTC timestamp in ISO-8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
 * @param {Date} [now] - Optional reference Date object for deterministic testing.
 * @returns {string} ISO-8601 UTC timestamp string.
 */
function getCurrentUtcTimestamp(now) {
  var refDate = (now instanceof Date) ? now : new Date();
  return refDate.toISOString();
}

/**
 * Parses any date string (GMT, UTC, IST +0530, RFC 822) and converts to ISO-8601 UTC string.
 * Returns null if parsing fails or input is invalid.
 * @param {string|Date} dateInput - Date string or Date object.
 * @returns {string|null} ISO-8601 UTC timestamp string or null.
 */
function toIsoUtcString(dateInput) {
  if (!dateInput) return null;

  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput.toISOString();
  }

  if (typeof dateInput !== 'string') return null;

  var str = dateInput.trim();

  // Try standard JS Date parse first
  var parsedMs = Date.parse(str);
  if (!isNaN(parsedMs)) {
    return new Date(parsedMs).toISOString();
  }

  // Fallback for custom or non-standard RFC 822 strings
  // E.g. "Fri, 24 Jul 2026 18:16:54 GMT" or "24 Jul 2026 22:06:00 +0530"
  var cleaned = str.replace(/^[a-zA-Z]{3},\s*/, ''); // Remove day of week if present
  parsedMs = Date.parse(cleaned);
  if (!isNaN(parsedMs)) {
    return new Date(parsedMs).toISOString();
  }

  return null;
}

/**
 * Calculates item age in minutes relative to a reference time.
 * @param {string|Date} isoDateInput - Target date (ISO string or Date).
 * @param {Date} [referenceDate] - Optional reference date (defaults to now).
 * @returns {number} Age in minutes (returns Infinity if parsing fails).
 */
function getAgeInMinutes(isoDateInput, referenceDate) {
  var targetIso = toIsoUtcString(isoDateInput);
  if (!targetIso) return Infinity;

  var targetMs = new Date(targetIso).getTime();
  var refMs = (referenceDate instanceof Date) ? referenceDate.getTime() : new Date().getTime();

  var diffMs = refMs - targetMs;
  return Math.max(0, Math.floor(diffMs / (1000 * 60)));
}

/**
 * Calculates item age in hours relative to a reference time.
 * @param {string|Date} isoDateInput - Target date (ISO string or Date).
 * @param {Date} [referenceDate] - Optional reference date (defaults to now).
 * @returns {number} Age in hours.
 */
function getAgeInHours(isoDateInput, referenceDate) {
  var minutes = getAgeInMinutes(isoDateInput, referenceDate);
  if (minutes === Infinity) return Infinity;
  return minutes / 60;
}

/**
 * Checks if an item is older than X hours relative to reference time.
 * @param {string|Date} isoDateInput - Target date.
 * @param {number} maxHours - Maximum allowed age in hours.
 * @param {Date} [referenceDate] - Optional reference date.
 * @returns {boolean} True if age > maxHours or if date is unparseable.
 */
function isOlderThanHours(isoDateInput, maxHours, referenceDate) {
  var hours = getAgeInHours(isoDateInput, referenceDate);
  return hours > maxHours;
}
