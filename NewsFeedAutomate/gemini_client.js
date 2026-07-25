/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Gemini API Client (Stage 5 API Layer)
 * Authenticated REST client for Google Gemini API with retries and telemetry.
 * Integrates with editorial_prompt_builder.js for prompt construction.
 * Production Stabilized: JSON Mode enabled with client-side schema enforcement.
 * ============================================================
 */

/**
 * Invokes Gemini REST API with the serialized editorial input context.
 *
 * Input: EditorialInput Object
 * Output Contract: Raw Gemini JSON Response string OR structured error object
 * {
 *   success: boolean,
 *   rawResponse: string, // Raw response body string if success=true
 *   httpStatus: number,
 *   error: string | null
 * }
 *
 * @param {Object} editorialInput - EditorialInput payload from Primary Builder.
 * @returns {Object} Result contract object.
 */
function callGeminiApi(editorialInput) {
  var apiKey = getGeminiApiKey_();
  if (!apiKey) {
    throw new Error("[GEMINI CONFIG ERROR] GEMINI_API_KEY is missing from ScriptProperties.");
  }

  var modelName = getGeminiModelName_();
  var endpointUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(modelName) + ":generateContent?key=" + apiKey;

  var timeoutMs = (typeof CONFIG !== 'undefined' && CONFIG.SCHEDULER && CONFIG.SCHEDULER.HTTP_TIMEOUT_MS)
    ? CONFIG.SCHEDULER.HTTP_TIMEOUT_MS
    : 15000;

  var maxRetries = (typeof CONFIG !== 'undefined' && CONFIG.SCHEDULER && CONFIG.SCHEDULER.RETRY_COUNT)
    ? CONFIG.SCHEDULER.RETRY_COUNT
    : 3;

  var backoffSchedule = [2000, 4000, 8000];

  // 1. Build prompt package from Prompt Builder layer
  var promptPkg = (typeof buildEditorialPrompt === 'function')
    ? buildEditorialPrompt(editorialInput)
    : {
        systemPrompt: "You are a Senior Telugu Broadcast News Editor. Output valid JSON ONLY.",
        userPrompt: (typeof editorialInput === 'string') ? editorialInput : JSON.stringify(editorialInput || {}),
        responseSchema: null
      };

  logGeminiTelemetry_("INFO", "[GEMINI CLIENT] Prompt Builder Loaded | System Prompt Length: " + (promptPkg.systemPrompt ? promptPkg.systemPrompt.length : 0) + " | User Prompt Length: " + (promptPkg.userPrompt ? promptPkg.userPrompt.length : 0));

  // 2. Build REST Request Payload (Production Stabilized JSON Mode)
  var requestBody = {
    contents: [
      {
        parts: [
          { text: promptPkg.userPrompt }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        { text: promptPkg.systemPrompt }
      ]
    },
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  logGeminiTelemetry_("INFO", "[GEMINI CLIENT] JSON Mode: ENABLED | Schema Enforcement: CLIENT SIDE");

  var payloadString = JSON.stringify(requestBody);

  var requestOptions = {
    method: "post",
    contentType: "application/json",
    payload: payloadString,
    muteHttpExceptions: true
  };

  logGeminiTelemetry_("INFO", "[GEMINI CLIENT] Request Started. Target Model: " + modelName);
  var startTimeMs = new Date().getTime();

  var lastStatus = 0;
  var lastErrorMsg = null;
  var rawResponseText = "";

  for (var attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      var response = null;
      if (typeof UrlFetchApp !== 'undefined' && typeof UrlFetchApp.fetch === 'function') {
        response = UrlFetchApp.fetch(endpointUrl, requestOptions);
      }

      if (response && typeof response.getResponseCode === 'function') {
        lastStatus = response.getResponseCode();
        rawResponseText = response.getContentText() || "";

        if (lastStatus === 200 && rawResponseText.length > 0) {
          var elapsedTimeMs = new Date().getTime() - startTimeMs;
          logGeminiTelemetry_("INFO", "[GEMINI CLIENT] Request Completed successfully. Elapsed Time: " + elapsedTimeMs + "ms | Status: " + lastStatus + " | Retries: " + (attempt - 1));
          return {
            success: true,
            rawResponse: rawResponseText,
            httpStatus: lastStatus,
            error: null
          };
        }

        // TASK PE-007: Log COMPLETE HTTP error response body when status != 200
        if (lastStatus !== 200) {
          var errLogText = "BEGIN GEMINI ERROR BODY\n" + rawResponseText + "\nEND GEMINI ERROR BODY";
          logGeminiTelemetry_("ERROR", errLogText);
        }

        if (!shouldRetryGeminiStatus_(lastStatus)) {
          var elapsedFailMs = new Date().getTime() - startTimeMs;
          logGeminiTelemetry_("ERROR", "[GEMINI CLIENT] Request Failed with non-retryable HTTP Status " + lastStatus + ". Elapsed Time: " + elapsedFailMs + "ms");
          return {
            success: false,
            rawResponse: "",
            httpStatus: lastStatus,
            error: "Gemini API returned non-retryable status " + lastStatus
          };
        }
      }
    } catch (err) {
      lastErrorMsg = err.message;
      lastStatus = 0;
      logGeminiTelemetry_("WARN", "[GEMINI CLIENT] Attempt " + attempt + " exception: " + err.message);
    }

    if (attempt < maxRetries) {
      var waitMs = backoffSchedule[attempt - 1] || 2000;
      logGeminiTelemetry_("WARN", "[GEMINI CLIENT] HTTP Status " + lastStatus + ". Retrying attempt " + (attempt + 1) + "/" + maxRetries + " after " + waitMs + "ms...");
      if (typeof Utilities !== 'undefined' && typeof Utilities.sleep === 'function') {
        Utilities.sleep(waitMs);
      }
    }
  }

  var totalElapsedMs = new Date().getTime() - startTimeMs;
  logGeminiTelemetry_("ERROR", "[GEMINI CLIENT] Exhausted all " + maxRetries + " retries. Final HTTP Status: " + lastStatus + " | Elapsed Time: " + totalElapsedMs + "ms");

  return {
    success: false,
    rawResponse: "",
    httpStatus: lastStatus,
    error: lastErrorMsg || ("Gemini API retries exhausted with status " + lastStatus)
  };
}

/**
 * Retrieves the API key from ScriptProperties without logging.
 */
function getGeminiApiKey_() {
  if (typeof PropertiesService !== 'undefined' && typeof PropertiesService.getScriptProperties === 'function') {
    var props = PropertiesService.getScriptProperties();
    if (props) {
      var key = props.getProperty("GEMINI_API_KEY");
      if (key && key.trim().length > 0) {
        return key.trim();
      }
    }
  }

  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }

  return null;
}

/**
 * Gets Gemini model name configured through CONFIG.
 */
function getGeminiModelName_() {
  if (typeof CONFIG !== 'undefined') {
    if (CONFIG.GEMINI && CONFIG.GEMINI.MODEL) return CONFIG.GEMINI.MODEL;
    if (CONFIG.GEMINI_MODEL) return CONFIG.GEMINI_MODEL;
  }
  return "gemini-3.6-flash";
}

/**
 * Determines if HTTP status code is retryable (429, 500, 503, or 0/Timeout).
 * Never retries on 400, 401, 403, 404.
 */
function shouldRetryGeminiStatus_(statusCode) {
  return statusCode === 429 || statusCode === 500 || statusCode === 503 || statusCode === 0;
}

/**
 * Safe telemetry logging. Never logs API keys, prompts, or raw responses.
 */
function logGeminiTelemetry_(level, message) {
  var logMsg = "[" + level + "] " + message;
  if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
    Logger.log(logMsg);
  } else {
    console.log(logMsg);
  }
}
