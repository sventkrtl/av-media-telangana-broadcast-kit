/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Gemini Response Parser (Stage 5 Response Layer)
 * Extracts and parses structured Editorial JSON from raw Gemini API envelopes.
 * ============================================================
 */

/**
 * Parses raw Gemini API response envelope and returns the unwrapped Editorial JSON object.
 *
 * @param {string|Object} rawInput - Raw HTTP response string or Gemini result contract.
 * @returns {Object} Unwrapped Editorial JSON Object.
 * @throws {Error} Structured error with descriptive message on parsing failure.
 */
function parseGeminiResponse(rawInput) {
  if (!rawInput) {
    throw new Error("[GEMINI PARSER ERROR] Raw input is empty or null.");
  }

  var rawResponseText = "";
  if (typeof rawInput === 'string') {
    rawResponseText = rawInput;
  } else if (typeof rawInput === 'object') {
    if (rawInput.rawResponse && typeof rawInput.rawResponse === 'string') {
      rawResponseText = rawInput.rawResponse;
    } else {
      try {
        rawResponseText = JSON.stringify(rawInput);
      } catch (e) {
        throw new Error("[GEMINI PARSER ERROR] Unable to serialize raw input object.");
      }
    }
  }

  if (!rawResponseText || rawResponseText.trim().length === 0) {
    throw new Error("[GEMINI PARSER ERROR] Empty raw response text.");
  }

  // Step 1: Parse outer Gemini HTTP JSON response envelope
  var outerEnvelope = null;
  try {
    outerEnvelope = JSON.parse(rawResponseText);
  } catch (outerErr) {
    throw new Error("[GEMINI PARSER ERROR] Malformed outer HTTP JSON response: " + outerErr.message);
  }

  // Step 2: Validate candidates structure
  if (!outerEnvelope || typeof outerEnvelope !== 'object') {
    throw new Error("[GEMINI PARSER ERROR] Outer response envelope is not a valid JSON object.");
  }

  if (outerEnvelope.error) {
    var apiErrMsg = outerEnvelope.error.message || JSON.stringify(outerEnvelope.error);
    throw new Error("[GEMINI PARSER ERROR] Gemini API returned error envelope: " + apiErrMsg);
  }

  if (!outerEnvelope.candidates || !Array.isArray(outerEnvelope.candidates) || outerEnvelope.candidates.length === 0) {
    throw new Error("[GEMINI PARSER ERROR] Missing or empty 'candidates' array in Gemini response.");
  }

  var candidate = outerEnvelope.candidates[0];
  if (!candidate || !candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
    throw new Error("[GEMINI PARSER ERROR] Missing 'content.parts' in candidate response.");
  }

  var rawPartText = candidate.content.parts[0].text;
  if (!rawPartText || typeof rawPartText !== 'string' || rawPartText.trim().length === 0) {
    throw new Error("[GEMINI PARSER ERROR] Text part is empty or missing in candidate response.");
  }

  // TASK PE-006: Capture raw model output before any parser logic
  var rawLogText = "BEGIN RAW MODEL OUTPUT\n" + rawPartText + "\nEND RAW MODEL OUTPUT";
  if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
    Logger.log(rawLogText);
  } else {
    console.log(rawLogText);
  }

  // Step 3: Strip ```json and ``` code block wrappers if present
  var cleanJsonText = rawPartText.trim();
  cleanJsonText = cleanJsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  // Step 4: Parse inner Editorial JSON text
  var editorialObj = null;
  try {
    editorialObj = JSON.parse(cleanJsonText);
  } catch (innerErr) {
    throw new Error("[GEMINI PARSER ERROR] Invalid inner editorial JSON text: " + innerErr.message);
  }

  // Step 5: Verify top-level result is an object
  if (!editorialObj || typeof editorialObj !== 'object' || Array.isArray(editorialObj)) {
    throw new Error("[GEMINI PARSER ERROR] Parsed editorial content must be a JSON object.");
  }

  return editorialObj;
}
