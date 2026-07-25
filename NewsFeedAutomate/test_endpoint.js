/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Gemini Endpoint Diagnostic (Temporary Diagnostic Function)
 * ============================================================
 */

function diagnoseGeminiEndpoint() {
  var modelName = (typeof getGeminiModelName_ === 'function')
    ? getGeminiModelName_()
    : ((typeof CONFIG !== 'undefined' && CONFIG.GEMINI_MODEL) ? CONFIG.GEMINI_MODEL : "gemini-2.5-flash-lite");

  var apiKey = null;
  if (typeof PropertiesService !== 'undefined' && typeof PropertiesService.getScriptProperties === 'function') {
    var props = PropertiesService.getScriptProperties();
    if (props) {
      apiKey = props.getProperty("GEMINI_API_KEY");
    }
  }
  if (!apiKey && typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    apiKey = process.env.GEMINI_API_KEY;
  }

  var rawEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(modelName) + ":generateContent";
  var maskedUrl = rawEndpoint + "?key=***MASKED***";
  var fullUrl = apiKey ? (rawEndpoint + "?key=" + apiKey) : rawEndpoint;

  logDiag_("1. Model value read from CONFIG: " + modelName);
  logDiag_("2. Final Request URL: " + maskedUrl);

  if (!apiKey) {
    logDiag_("3. HTTP Status: N/A (GEMINI_API_KEY missing from ScriptProperties)");
    logDiag_("4. First 200 characters of response body: N/A");
    return;
  }

  var testPayload = {
    contents: [
      {
        parts: [
          { text: "Hello, confirm model connectivity." }
        ]
      }
    ]
  };

  try {
    var response = null;
    if (typeof UrlFetchApp !== 'undefined' && typeof UrlFetchApp.fetch === 'function') {
      response = UrlFetchApp.fetch(fullUrl, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(testPayload),
        muteHttpExceptions: true
      });
    }

    if (response && typeof response.getResponseCode === 'function') {
      var statusCode = response.getResponseCode();
      var responseText = response.getContentText() || "";
      var snippet = responseText.substring(0, 200).replace(/\s+/g, ' ');

      logDiag_("3. HTTP Status: " + statusCode);
      logDiag_("4. First 200 characters of response body: " + snippet);
    }
  } catch (err) {
    logDiag_("3. HTTP Status: ERROR (" + err.message + ")");
    logDiag_("4. First 200 characters of response body: N/A");
  }
}

function logDiag_(msg) {
  var text = "[GEMINI DIAGNOSTIC] " + msg;
  if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
    Logger.log(text);
  } else {
    console.log(text);
  }
}
