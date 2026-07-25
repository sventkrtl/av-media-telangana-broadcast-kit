/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Gemini Model Discovery (Temporary Diagnostic Function)
 * ============================================================
 */

function listAvailableGeminiModels() {
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
    var errLog = "[MODEL DISCOVERY ERROR] GEMINI_API_KEY missing from ScriptProperties.";
    if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
      Logger.log(errLog);
    } else {
      console.log(errLog);
    }
    return [];
  }

  var endpointUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;

  try {
    var response = null;
    if (typeof UrlFetchApp !== 'undefined' && typeof UrlFetchApp.fetch === 'function') {
      response = UrlFetchApp.fetch(endpointUrl, {
        method: "get",
        muteHttpExceptions: true
      });
    }

    if (response && typeof response.getResponseCode === 'function') {
      var statusCode = response.getResponseCode();
      var responseText = response.getContentText() || "";

      if (statusCode !== 200) {
        var failMsg = "[MODEL DISCOVERY] HTTP Status: " + statusCode + " | Error: " + responseText.substring(0, 150);
        if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
          Logger.log(failMsg);
        } else {
          console.log(failMsg);
        }
        return [];
      }

      var data = JSON.parse(responseText);
      var models = data.models || [];

      var modelSummary = models.map(function (m) {
        return {
          name: m.name || "",
          displayName: m.displayName || "",
          supportedGenerationMethods: m.supportedGenerationMethods || []
        };
      });

      var headerMsg = "[MODEL DISCOVERY] Found " + modelSummary.length + " available Gemini models:";
      if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
        Logger.log(headerMsg);
      } else {
        console.log(headerMsg);
      }

      modelSummary.forEach(function (m, idx) {
        var info = "  " + (idx + 1) + ". Name: " + m.name + " | Display: " + m.displayName + " | Methods: " + JSON.stringify(m.supportedGenerationMethods);
        if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
          Logger.log(info);
        } else {
          console.log(info);
        }
      });

      return modelSummary;
    }
  } catch (err) {
    var catErr = "[MODEL DISCOVERY ERROR] Exception: " + err.message;
    if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
      Logger.log(catErr);
    } else {
      console.log(catErr);
    }
  }

  return [];
}
