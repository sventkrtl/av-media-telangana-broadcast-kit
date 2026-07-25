/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Minimal Structured Output Proof-of-Concept (TASK PE-011)
 * ============================================================
 */

function testMinimalStructuredOutput() {
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

  if (!apiKey) {
    var errLog = "[POC ERROR] GEMINI_API_KEY is missing from ScriptProperties.";
    if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
      Logger.log(errLog);
    } else {
      console.log(errLog);
    }
    return;
  }

  var modelName = "gemini-3.6-flash";
  var endpointUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(modelName) + ":generateContent?key=" + apiKey;

  var schema = {
    "type": "OBJECT",
    "properties": {
      "PRIMARY_HEADLINES": {
        "type": "ARRAY",
        "items": {
          "type": "OBJECT",
          "properties": {
            "headline": { "type": "STRING" },
            "source": { "type": "STRING" }
          },
          "required": ["headline", "source"]
        }
      }
    },
    "required": ["PRIMARY_HEADLINES"]
  };

  var payload = {
    contents: [
      {
        parts: [
          { text: "Return ONLY valid JSON. Output exactly one object." }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  };

  var startTimeMs = new Date().getTime();

  try {
    var response = null;
    if (typeof UrlFetchApp !== 'undefined' && typeof UrlFetchApp.fetch === 'function') {
      response = UrlFetchApp.fetch(endpointUrl, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
    }

    var executionTime = new Date().getTime() - startTimeMs;

    if (response && typeof response.getResponseCode === 'function') {
      var statusCode = response.getResponseCode();
      var rawResponse = response.getContentText() || "";

      logPoc_("HTTP Status: " + statusCode);
      logPoc_("Execution Time: " + executionTime + "ms");
      logPoc_("Raw Response:\n" + rawResponse);
    } else {
      logPoc_("HTTP Status: N/A (UrlFetchApp uninitialized)");
      logPoc_("Execution Time: " + executionTime + "ms");
    }

  } catch (err) {
    var totalTime = new Date().getTime() - startTimeMs;
    logPoc_("POC Exception: " + err.message);
    logPoc_("Execution Time: " + totalTime + "ms");
  }
}

function logPoc_(msg) {
  var logText = "[POC MINIMAL STRUCTURED OUTPUT] " + msg;
  if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
    Logger.log(logText);
  } else {
    console.log(logText);
  }
}
