/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Structured Output Compatibility Matrix (Temporary Diagnostic Script)
 * ============================================================
 */

function runCompatibilityMatrix() {
  var apiKey = null;
  if (typeof PropertiesService !== 'undefined' && typeof PropertiesService.getScriptProperties === 'function') {
    var props = PropertiesService.getScriptProperties();
    if (props) apiKey = props.getProperty("GEMINI_API_KEY");
  }
  if (!apiKey && typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    apiKey = process.env.GEMINI_API_KEY;
  }

  var modelName = (typeof getGeminiModelName_ === 'function') ? getGeminiModelName_() : "gemini-3.6-flash";
  var endpointUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(modelName) + ":generateContent?key=" + apiKey;

  var schemaSample = {
    type: "OBJECT",
    properties: {
      PRIMARY_HEADLINES: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            headline: { type: "STRING" },
            source: { type: "STRING" }
          },
          required: ["headline", "source"]
        }
      },
      SECONDARY_PLAYLIST: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            category: { type: "STRING" },
            district: { type: "STRING" },
            priority: { type: "INTEGER" },
            order: { type: "INTEGER" },
            crawlText: { type: "STRING" }
          },
          required: ["category", "district", "priority", "order", "crawlText"]
        }
      }
    },
    required: ["PRIMARY_HEADLINES", "SECONDARY_PLAYLIST"]
  };

  var basePrompt = {
    contents: [
      { parts: [{ text: "Return 1 primary headline and 1 secondary item." }] }
    ],
    systemInstruction: {
      parts: [{ text: "You are a Telugu news editor. Output valid JSON ONLY." }]
    }
  };

  var variants = {
    "Variant A (responseMimeType + responseSchema)": {
      responseMimeType: "application/json",
      responseSchema: schemaSample
    },
    "Variant B (responseMimeType + responseJsonSchema)": {
      responseMimeType: "application/json",
      responseJsonSchema: schemaSample
    },
    "Variant C (responseFormat.text)": {
      responseFormat: {
        text: {
          mimeType: "application/json",
          schema: schemaSample
        }
      }
    },
    "Variant D (Plain JSON mode, responseMimeType only)": {
      responseMimeType: "application/json"
    }
  };

  var matrixResults = [];

  Object.keys(variants).forEach(function (vName) {
    var genConfig = variants[vName];
    var payload = {
      contents: basePrompt.contents,
      systemInstruction: basePrompt.systemInstruction,
      generationConfig: genConfig
    };

    var resStatus = 0;
    var resBody = "";
    var isSuccess = false;

    if (!apiKey) {
      resBody = "GEMINI_API_KEY missing";
    } else {
      try {
        if (typeof UrlFetchApp !== 'undefined' && typeof UrlFetchApp.fetch === 'function') {
          var response = UrlFetchApp.fetch(endpointUrl, {
            method: "post",
            contentType: "application/json",
            payload: JSON.stringify(payload),
            muteHttpExceptions: true
          });
          resStatus = response.getResponseCode();
          resBody = response.getContentText() || "";
          isSuccess = (resStatus === 200);
        }
      } catch (err) {
        resBody = err.message;
      }
    }

    matrixResults.push({
      variant: vName,
      status: resStatus,
      success: isSuccess,
      errorSnippet: isSuccess ? "None" : resBody.substring(0, 150)
    });
  });

  logMatrix_("==================================================");
  logMatrix_("GEMINI STRUCTURED OUTPUT COMPATIBILITY MATRIX");
  logMatrix_("==================================================");
  matrixResults.forEach(function (r) {
    logMatrix_("[" + (r.success ? "PASS" : "FAIL") + "] " + r.variant + " | HTTP Status: " + r.status + " | Error: " + r.errorSnippet);
  });

  return matrixResults;
}

function logMatrix_(msg) {
  if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
    Logger.log(msg);
  } else {
    console.log(msg);
  }
}
