/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Gemini API Test Runner (Temporary Diagnostic Function)
 * ============================================================
 */

function testGeminiApi() {
  var sampleInput = {
    generatedAt: new Date().toISOString(),
    itemCount: 1,
    stories: [
      {
        Source: "HMTV",
        Priority: 1,
        Title: "మంచిర్యాల జిల్లాలో విస్తారంగా వర్షాలు",
        Description: "జిల్లా వ్యాప్తంగా వాగులు, వంకలు పొంగిపొర్లుతున్నాయి.",
        PublishedTime: new Date().toISOString(),
        Category: ["వరంగల్", "వాతావరణం"],
        Link: "https://www.hmtvlive.com/news/sample-1"
      }
    ]
  };

  try {
    var result = callGeminiApi(sampleInput);

    var rawSnippet = (result && result.rawResponse)
      ? result.rawResponse.substring(0, 100).replace(/\s+/g, ' ')
      : "";

    var logMsg = "[TEST GEMINI] HTTP Status: " + (result ? result.httpStatus : "N/A") +
                 " | Success: " + (result ? result.success : false) +
                 " | Error: " + (result ? (result.error || "None") : "N/A") +
                 " | Raw Response Snippet (First 100 chars): " + rawSnippet;

    if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
      Logger.log(logMsg);
    } else {
      console.log(logMsg);
    }

    return result;
  } catch (err) {
    var errLog = "[TEST GEMINI ERROR] Exception caught: " + err.message;
    if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
      Logger.log(errLog);
    } else {
      console.log(errLog);
    }
  }
}
