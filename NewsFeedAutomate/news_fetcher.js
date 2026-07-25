/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * RSS Collector (Stage 1)
 * ============================================================
 */

/**
 * Collects raw XML feeds from all enabled RSS sources defined in CONFIG.
 *
 * Output Contract: Array<RawFeed>
 * {
 *   source: string,
 *   priority: number,
 *   httpStatus: number,
 *   rawXml: string,
 *   retrievedTime: string, // ISO-8601 UTC
 *   success: boolean
 * }
 */
function fetchRssFeeds() {
  var sourcesConfig = (typeof CONFIG !== 'undefined' && CONFIG.RSS_SOURCES) ? CONFIG.RSS_SOURCES : {};
  var enabledSources = [];

  Object.keys(sourcesConfig).forEach(function (key) {
    var src = sourcesConfig[key];
    if (src && src.ENABLED) {
      enabledSources.push(src);
    }
  });

  if (enabledSources.length === 0) {
    logTelemetry_("WARN", "[COLLECTOR] No enabled RSS sources found in CONFIG.");
    return [];
  }

  logTelemetry_("INFO", "[COLLECTOR] Starting collection for " + enabledSources.length + " enabled RSS sources.");

  var requests = enabledSources.map(function (src) {
    return {
      url: src.FEED_URL,
      method: "get",
      muteHttpExceptions: true,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    };
  });

  var responses = [];
  var isUrlFetchAvailable = typeof UrlFetchApp !== 'undefined' && typeof UrlFetchApp.fetchAll === 'function';

  if (isUrlFetchAvailable) {
    try {
      responses = UrlFetchApp.fetchAll(requests);
    } catch (e) {
      logTelemetry_("WARN", "[COLLECTOR] Batch fetchAll failed: " + e.message + ". Falling back to individual requests.");
      responses = new Array(enabledSources.length);
    }
  }

  var rawFeedResults = [];

  for (var i = 0; i < enabledSources.length; i++) {
    var src = enabledSources[i];
    var res = responses[i];
    var rawFeed = null;

    if (res && typeof res.getResponseCode === 'function') {
      var statusCode = res.getResponseCode();
      var contentText = res.getContentText() || "";

      if (statusCode === 200 && contentText.length > 0) {
        rawFeed = buildRawFeedObject_(src.NAME, src.PRIORITY, statusCode, contentText, true);
      } else if (shouldRetryHttpStatus_(statusCode)) {
        logTelemetry_("WARN", "[COLLECTOR] " + src.NAME + " returned HTTP " + statusCode + ". Initiating retry strategy.");
        rawFeed = fetchSingleSourceWithRetry_(src);
      } else {
        logTelemetry_("ERROR", "[COLLECTOR] " + src.NAME + " failed with HTTP " + statusCode + ". Retries bypassed.");
        rawFeed = buildRawFeedObject_(src.NAME, src.PRIORITY, statusCode, contentText, false);
      }
    } else {
      rawFeed = fetchSingleSourceWithRetry_(src);
    }

    rawFeedResults.push(rawFeed);
  }

  var successCount = rawFeedResults.filter(function (rf) { return rf.success; }).length;
  logTelemetry_("INFO", "[COLLECTOR] Collection complete. Successfully fetched " + successCount + "/" + enabledSources.length + " feeds.");

  return rawFeedResults;
}

/**
 * Fetches a single RSS source with exponential backoff retries.
 */
function fetchSingleSourceWithRetry_(source) {
  var maxRetries = (typeof CONFIG !== 'undefined' && CONFIG.SCHEDULER && CONFIG.SCHEDULER.RETRY_COUNT) ? CONFIG.SCHEDULER.RETRY_COUNT : 3;
  var backoffSchedule = [2000, 4000, 8000];

  var lastStatus = 0;
  var lastContent = "";

  for (var attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logTelemetry_("INFO", "[COLLECTOR] " + source.NAME + " attempt " + attempt + "/" + maxRetries + " (" + source.FEED_URL + ")");
      
      var res = null;
      if (typeof UrlFetchApp !== 'undefined' && typeof UrlFetchApp.fetch === 'function') {
        res = UrlFetchApp.fetch(source.FEED_URL, {
          method: "get",
          muteHttpExceptions: true,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
      }

      if (res && typeof res.getResponseCode === 'function') {
        lastStatus = res.getResponseCode();
        lastContent = res.getContentText() || "";

        if (lastStatus === 200 && lastContent.length > 0) {
          logTelemetry_("INFO", "[COLLECTOR] " + source.NAME + " fetch succeeded on attempt " + attempt + ".");
          return buildRawFeedObject_(source.NAME, source.PRIORITY, lastStatus, lastContent, true);
        }

        if (!shouldRetryHttpStatus_(lastStatus)) {
          logTelemetry_("ERROR", "[COLLECTOR] " + source.NAME + " returned HTTP " + lastStatus + ". Non-retryable status.");
          return buildRawFeedObject_(source.NAME, source.PRIORITY, lastStatus, lastContent, false);
        }
      }
    } catch (err) {
      logTelemetry_("WARN", "[COLLECTOR] " + source.NAME + " attempt " + attempt + " exception: " + err.message);
      lastContent = "";
      lastStatus = 0;
    }

    if (attempt < maxRetries) {
      var waitMs = backoffSchedule[attempt - 1] || 2000;
      logTelemetry_("INFO", "[COLLECTOR] Waiting " + waitMs + "ms before retrying " + source.NAME + "...");
      if (typeof Utilities !== 'undefined' && typeof Utilities.sleep === 'function') {
        Utilities.sleep(waitMs);
      }
    }
  }

  logTelemetry_("ERROR", "[COLLECTOR] " + source.NAME + " exhausted all " + maxRetries + " retries.");
  return buildRawFeedObject_(source.NAME, source.PRIORITY, lastStatus, lastContent, false);
}

/**
 * Checks if an HTTP status code is retryable (500, 502, 503, 504, or 0/timeout).
 */
function shouldRetryHttpStatus_(statusCode) {
  return statusCode === 0 || statusCode === 500 || statusCode === 502 || statusCode === 503 || statusCode === 504;
}

/**
 * Constructs the standard RawFeed output object.
 */
function buildRawFeedObject_(sourceName, priority, httpStatus, rawXml, success) {
  return {
    source: sourceName,
    priority: priority,
    httpStatus: httpStatus || 0,
    rawXml: rawXml || "",
    retrievedTime: new Date().toISOString(),
    success: !!success
  };
}

/**
 * Structured telemetry logging helper.
 */
function logTelemetry_(level, message) {
  var logMsg = "[" + level + "] " + message;
  if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
    Logger.log(logMsg);
  } else {
    console.log(logMsg);
  }
}