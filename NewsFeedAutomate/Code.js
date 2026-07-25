/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Production Editorial Pipeline Controller & Orchestrator
 * Coordinates all stages of RSS collection, normalization, validation,
 * deduplication, Gemini AI processing, output parsing, canonicalization, output validation, and atomic Sheets writing.
 * ============================================================
 */

/**
 * Main Production Entry Point for NewsFeedAutomate Pipeline.
 *
 * Execution Order:
 * 1. fetchRssFeeds()               [Stage 1: Collector]
 * 2. parseRssFeeds()               [Stage 2: Normalizer]
 * 3. validateNormalizedItems()     [Stage 3: Validator]
 * 4. deduplicateFeedItems()        [Stage 4: Duplicate Engine]
 * 5. buildEditorialInputPayload()  [Stage 5A: Input Builder]
 * 6. callGeminiApi()               [Stage 5B: Gemini API Client]
 * 7. parseGeminiResponse()         [Stage 5C: Gemini Response Parser]
 * 8. normalizeEditorialOutput()    [Stage 5D: Editorial Normalizer]
 * 9. validateEditorialOutput()     [Stage 6: Output Validator]
 * 10. writeValidatedEditorialOutput() [Stage 7: Atomic Writer] (IF VALID)
 *
 * @returns {Object} Structured Execution Summary
 */
function runEditorialPipeline() {
  var startTimeMs = new Date().getTime();

  logStage_("START", "==================================================");
  logStage_("START", "NewsFeedAutomate — Editorial Pipeline Started");
  logStage_("START", "==================================================");

  var summary = {
    status: "FAILED",
    executionTimeMs: 0,
    rssItemsCount: 0,
    normalizedCount: 0,
    validatedCount: 0,
    uniqueCount: 0,
    primaryHeadlinesCount: 0,
    secondaryStoriesCount: 0,
    sheetWriteStatus: "SKIPPED",
    error: null
  };

  try {
    // STAGE 1: RSS Collector
    logStage_("STAGE 1", "Starting RSS Collector...");
    var rawFeeds = fetchRssFeeds();
    if (!rawFeeds || !Array.isArray(rawFeeds) || rawFeeds.length === 0) {
      return finishPipeline_(summary, "FAILED", "Stage 1: RSS Collector returned empty raw feeds array.", startTimeMs);
    }
    summary.rssItemsCount = rawFeeds.reduce(function (acc, feed) { return acc + (feed.success ? 1 : 0); }, 0);
    logStage_("STAGE 1", "RSS Collector complete. Feeds fetched: " + summary.rssItemsCount + "/" + rawFeeds.length);

    // STAGE 2: RSS Normalizer
    logStage_("STAGE 2", "Starting RSS Normalizer...");
    var normalizedItems = parseRssFeeds(rawFeeds);
    summary.normalizedCount = (normalizedItems && Array.isArray(normalizedItems)) ? normalizedItems.length : 0;
    logStage_("STAGE 2", "RSS Normalizer complete. Items normalized: " + summary.normalizedCount);
    if (summary.normalizedCount === 0) {
      return finishPipeline_(summary, "NO_DATA", "Stage 2: No valid RSS items parsed.", startTimeMs);
    }

    // STAGE 3: RSS Validator
    logStage_("STAGE 3", "Starting RSS Validator...");
    var validatedItems = validateNormalizedItems(normalizedItems);
    summary.validatedCount = (validatedItems && Array.isArray(validatedItems)) ? validatedItems.length : 0;
    logStage_("STAGE 3", "RSS Validator complete. Items validated: " + summary.validatedCount);
    if (summary.validatedCount === 0) {
      return finishPipeline_(summary, "NO_DATA", "Stage 3: All normalized items failed RSS validation.", startTimeMs);
    }

    // STAGE 4: Duplicate Engine
    logStage_("STAGE 4", "Starting Duplicate Resolution Engine...");
    var uniqueItems = deduplicateFeedItems(validatedItems);
    summary.uniqueCount = (uniqueItems && Array.isArray(uniqueItems)) ? uniqueItems.length : 0;
    logStage_("STAGE 4", "Duplicate Engine complete. Unique items remaining: " + summary.uniqueCount);
    if (summary.uniqueCount === 0) {
      return finishPipeline_(summary, "NO_DATA", "Stage 4: No unique items after deduplication.", startTimeMs);
    }

    // STAGE 5: Editorial Input Builder
    logStage_("STAGE 5A", "Building Gemini Editorial Input payload...");
    var editorialInput = buildEditorialInputPayload(uniqueItems);
    logStage_("STAGE 5A", "Editorial Input Builder complete. Payload stories: " + editorialInput.itemCount);

    // STAGE 5B: Gemini REST API Client Call
    logStage_("STAGE 5B", "Invoking Gemini REST API Client...");
    var geminiResult = callGeminiApi(editorialInput);
    if (!geminiResult || !geminiResult.success) {
      var geminiErrMsg = (geminiResult && geminiResult.error) ? geminiResult.error : "Gemini API call failed.";
      return finishPipeline_(summary, "FAILED", "Stage 5B: " + geminiErrMsg, startTimeMs);
    }
    logStage_("STAGE 5B", "Gemini API Call complete. HTTP Status: " + geminiResult.httpStatus);

    // STAGE 5C: Gemini Response Parser
    logStage_("STAGE 5C", "Parsing Gemini HTTP Response envelope...");
    var parsedEditorialObj = null;
    try {
      parsedEditorialObj = parseGeminiResponse(geminiResult);
    } catch (parseErr) {
      logStage_("ERROR", "Stage 5C Gemini Parsing Failed: " + parseErr.message);
      summary.sheetWriteStatus = "SKIPPED";
      return finishPipeline_(summary, "FAILED", "Stage 5C Gemini Parsing Failed: " + parseErr.message, startTimeMs);
    }
    logStage_("STAGE 5C", "Gemini Response Parser complete. Editorial JSON unwrapped successfully.");

    // STAGE 5D: Editorial Normalizer
    logStage_("STAGE 5D", "Canonicalizing top-level keys, priorities, and string formatting...");
    var normalizedEditorialObj = normalizeEditorialOutput(parsedEditorialObj);

    // TASK NL-003: Log complete normalized JSON output
    var normJsonText = "BEGIN NORMALIZED OUTPUT\n" + JSON.stringify(normalizedEditorialObj, null, 2) + "\nEND NORMALIZED OUTPUT";
    logStage_("STAGE 5D", normJsonText);
    logStage_("STAGE 5D", "Editorial Normalizer complete.");

    // STAGE 6: Editorial Output Validator
    logStage_("STAGE 6", "Validating Gemini Editorial Output...");
    var validatedOutput = validateEditorialOutput(normalizedEditorialObj);
    if (!validatedOutput || validatedOutput.status !== "VALID") {
      var validationReason = (validatedOutput && validatedOutput.reason) ? validatedOutput.reason : "Output validation failed.";
      var validationStage = (validatedOutput && validatedOutput.stage) ? validatedOutput.stage : "VALIDATION_FAILED";
      logStage_("ERROR", "Stage 6 Validation Failed: " + validationReason + " (" + validationStage + ")");
      summary.sheetWriteStatus = "SKIPPED";
      return finishPipeline_(summary, "VALIDATION_FAILED", "Stage 6 Validation Failed: " + validationReason, startTimeMs);
    }

    summary.primaryHeadlinesCount = validatedOutput.data.PRIMARY_HEADLINES.length;
    summary.secondaryStoriesCount = validatedOutput.data.SECONDARY_PLAYLIST.length;
    logStage_("STAGE 6", "Validation Successful! Primary: " + summary.primaryHeadlinesCount + " headlines | Secondary: " + summary.secondaryStoriesCount + " stories.");

    // STAGE 7: Google Sheets Atomic Writer
    logStage_("STAGE 7", "Writing validated output atomically to Google Sheets...");
    var writeResult = writeValidatedEditorialOutput(validatedOutput);
    if (!writeResult || writeResult.status !== "WRITTEN") {
      var writeErrMsg = (writeResult && writeResult.error) ? writeResult.error : "Sheet write operation failed.";
      summary.sheetWriteStatus = "WRITE_FAILED";
      return finishPipeline_(summary, "FAILED", "Stage 7 Sheet Write Failed: " + writeErrMsg, startTimeMs);
    }

    summary.sheetWriteStatus = "WRITTEN";
    logStage_("STAGE 7", "Google Sheets Atomic Write Complete.");

    return finishPipeline_(summary, "SUCCESS", null, startTimeMs);

  } catch (fatalErr) {
    logStage_("FATAL", "Uncaught Pipeline Error: " + fatalErr.message);
    return finishPipeline_(summary, "FAILED", "Uncaught Error: " + fatalErr.message, startTimeMs);
  }
}

/**
 * Manual Execution Test Runner
 */
function testPipeline() {
  return runEditorialPipeline();
}

/**
 * Helper to log pipeline stage transition telemetry.
 */
function logStage_(tag, message) {
  var text = "[" + tag + "] " + message;
  if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
    Logger.log(text);
  } else {
    console.log(text);
  }
}

/**
 * Finalizes execution summary telemetry and logs pipeline completion.
 */
function finishPipeline_(summary, statusText, errorMessage, startTimeMs) {
  summary.status = statusText;
  summary.error = errorMessage;
  summary.executionTimeMs = new Date().getTime() - startTimeMs;

  logStage_("FINISH", "==================================================");
  logStage_("FINISH", "NewsFeedAutomate Pipeline Finished with Status: " + summary.status);
  logStage_("FINISH", "Execution Time: " + summary.executionTimeMs + "ms | Feeds: " + summary.rssItemsCount + " | Normalized: " + summary.normalizedCount + " | Validated: " + summary.validatedCount + " | Unique: " + summary.uniqueCount);
  logStage_("FINISH", "Output Headlines: " + summary.primaryHeadlinesCount + " | Playlist Stories: " + summary.secondaryStoriesCount + " | Sheet Write: " + summary.sheetWriteStatus);
  if (summary.error) {
    logStage_("FINISH", "Pipeline Error Cause: " + summary.error);
  }
  logStage_("FINISH", "==================================================");

  return summary;
}