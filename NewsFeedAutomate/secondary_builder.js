/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Editorial Output Validator (Stage 6)
 * Validates Gemini JSON responses against editorial & broadcast rules.
 * ============================================================
 */

/**
 * Validates raw Gemini response JSON output.
 *
 * Output Contract: ValidatedEditorialOutput Object
 * Success: { status: "VALID", data: Object, reason: null, stage: "VALIDATION_COMPLETE" }
 * Failure: { status: "INVALID", data: null, reason: string, stage: string }
 *
 * @param {string|Object} rawResponseInput - Raw response text or Gemini result object.
 * @returns {Object} ValidatedEditorialOutput contract object.
 */
function validateEditorialOutput(rawResponseInput) {
  try {
    // 1. Extract JSON string from input object or raw string
    var jsonText = extractJsonText_(rawResponseInput);
    if (!jsonText) {
      return buildInvalidResult_("Empty or unparseable JSON text in Gemini response.", "JSON_EXTRACTION");
    }

    // 2. Parse JSON safely
    var parsedData = null;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (parseErr) {
      return buildInvalidResult_("Malformed JSON syntax: " + parseErr.message, "JSON_PARSING");
    }

    if (!parsedData || typeof parsedData !== 'object' || Array.isArray(parsedData)) {
      return buildInvalidResult_("Top-level JSON payload must be an object.", "ROOT_SCHEMA");
    }

    // 4. Validate top-level required sections
    if (!parsedData.PRIMARY_HEADLINES) {
      return buildInvalidResult_("Missing required top-level section: PRIMARY_HEADLINES", "TOP_LEVEL_SCHEMA");
    }
    if (!parsedData.SECONDARY_PLAYLIST) {
      return buildInvalidResult_("Missing required top-level section: SECONDARY_PLAYLIST", "TOP_LEVEL_SCHEMA");
    }

    // 5. Validate PRIMARY_HEADLINES
    var primaryResult = validatePrimaryHeadlines_(parsedData.PRIMARY_HEADLINES);
    if (primaryResult.status === "INVALID") {
      return primaryResult;
    }

    // 6. Validate SECONDARY_PLAYLIST
    var secondaryResult = validateSecondaryPlaylist_(parsedData.SECONDARY_PLAYLIST);
    if (secondaryResult.status === "INVALID") {
      return secondaryResult;
    }

    // Validation complete and successful
    return {
      status: "VALID",
      data: {
        PRIMARY_HEADLINES: primaryResult.validatedHeadlines,
        SECONDARY_PLAYLIST: secondaryResult.validatedPlaylist
      },
      reason: null,
      stage: "VALIDATION_COMPLETE"
    };

  } catch (uncaughtErr) {
    return buildInvalidResult_("Uncaught validation error: " + uncaughtErr.message, "UNCAUGHT_EXCEPTION");
  }
}

/**
 * Validates PRIMARY_HEADLINES array against length, language, sentence, and field rules.
 */
function validatePrimaryHeadlines_(headlines) {
  if (!Array.isArray(headlines)) {
    return buildInvalidResult_("PRIMARY_HEADLINES must be an array.", "PRIMARY_SCHEMA");
  }

  if (headlines.length < 10 || headlines.length > 15) {
    return buildInvalidResult_("PRIMARY_HEADLINES count (" + headlines.length + ") out of bounds. Must be between 10 and 15 headlines.", "PRIMARY_COUNT_BOUNDS");
  }

  var validatedHeadlines = [];

  for (var i = 0; i < headlines.length; i++) {
    var item = headlines[i];
    if (!item || typeof item !== 'object') {
      return buildInvalidResult_("Headline entry at index " + i + " is not an object.", "PRIMARY_ITEM_SCHEMA");
    }

    var text = item.headline || item.headline_text || item.text || "";
    var source = item.source || item.source_name || "";

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return buildInvalidResult_("Headline text missing or empty at index " + i, "PRIMARY_MISSING_FIELDS");
    }
    if (!source || typeof source !== 'string' || source.trim().length === 0) {
      return buildInvalidResult_("Headline source missing or empty at index " + i, "PRIMARY_MISSING_FIELDS");
    }

    var cleanText = text.trim();

    // Max 85 characters rule
    if (cleanText.length > 85) {
      return buildInvalidResult_("Headline at index " + i + " exceeds maximum 85 characters limit (" + cleanText.length + " chars): \"" + cleanText.substring(0, 30) + "...\"", "PRIMARY_LENGTH_EXCEEDED");
    }

    // Max 2 sentences rule
    var sentenceCount = countSentences_(cleanText);
    if (sentenceCount > 2) {
      return buildInvalidResult_("Headline at index " + i + " exceeds maximum 2 sentences limit (" + sentenceCount + " sentences).", "PRIMARY_SENTENCE_EXCEEDED");
    }

    // Telugu language check
    if (!/[\u0C00-\u0C7F]/.test(cleanText)) {
      return buildInvalidResult_("Headline at index " + i + " must be in Telugu language.", "PRIMARY_LANGUAGE_INVALID");
    }

    validatedHeadlines.push({
      headline: cleanText,
      source: source.trim()
    });
  }

  return { status: "VALID", validatedHeadlines: validatedHeadlines };
}

/**
 * Validates SECONDARY_PLAYLIST array against district, category, sentence, and language rules.
 */
function validateSecondaryPlaylist_(playlist) {
  if (!Array.isArray(playlist)) {
    return buildInvalidResult_("SECONDARY_PLAYLIST must be an array.", "SECONDARY_SCHEMA");
  }

  if (playlist.length === 0) {
    return buildInvalidResult_("SECONDARY_PLAYLIST array cannot be empty.", "SECONDARY_EMPTY");
  }

  var validDistricts = getTelanganaDistricts_();
  var allowedStateCategories = ["Sports", "Cinema", "Education", "Jobs", "Government Notifications", "క్రీడలు", "సినిమా", "విద్య", "ఉద్యోగాలు", "ప్రభుత్వ నివేదికలు"];

  var districtCounts = {};
  var validatedPlaylist = [];

  for (var i = 0; i < playlist.length; i++) {
    var item = playlist[i];
    if (!item || typeof item !== 'object') {
      return buildInvalidResult_("Playlist entry at index " + i + " is not an object.", "SECONDARY_ITEM_SCHEMA");
    }

    var text = item.headline || item.story || item.crawl_text || item.text || "";
    var district = item.district || "";
    var category = item.category || "";

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return buildInvalidResult_("Playlist story text missing or empty at index " + i, "SECONDARY_MISSING_FIELDS");
    }

    var cleanText = text.trim();

    // Check sentence count (max 5 sentences)
    var sentenceCount = countSentences_(cleanText);
    if (sentenceCount > 5) {
      return buildInvalidResult_("Playlist story at index " + i + " exceeds maximum 5 sentences limit (" + sentenceCount + " sentences).", "SECONDARY_SENTENCE_EXCEEDED");
    }

    // Check Telugu language
    if (!/[\u0C00-\u0C7F]/.test(cleanText)) {
      return buildInvalidResult_("Playlist story at index " + i + " must be in Telugu language.", "SECONDARY_LANGUAGE_INVALID");
    }

    // Category / District Validation
    if (district && district.trim().length > 0) {
      var normDistrict = normalizeDistrictName_(district);
      if (!validDistricts[normDistrict]) {
        return buildInvalidResult_("Invalid Telangana district name: \"" + district + "\" at index " + i, "SECONDARY_INVALID_DISTRICT");
      }

      districtCounts[normDistrict] = (districtCounts[normDistrict] || 0) + 1;
      if (districtCounts[normDistrict] > 4) {
        return buildInvalidResult_("District \"" + normDistrict + "\" exceeds maximum 4 stories limit.", "SECONDARY_DISTRICT_LIMIT_EXCEEDED");
      }

      validatedPlaylist.push({
        category: category.trim() || "District",
        district: validDistricts[normDistrict],
        headline: cleanText
      });
    } else if (category && category.trim().length > 0) {
      var cleanCat = category.trim();

      // Reject Politics
      if (/politics|రాజకీయాలు/i.test(cleanCat)) {
        return buildInvalidResult_("Forbidden category 'Politics' at index " + i + ". Politics is strictly not allowed in Secondary Playlist.", "SECONDARY_FORBIDDEN_CATEGORY");
      }

      var isAllowedCat = allowedStateCategories.some(function (allowed) {
        return allowed.toLowerCase() === cleanCat.toLowerCase();
      });

      if (!isAllowedCat) {
        return buildInvalidResult_("Invalid or unapproved State Category: \"" + cleanCat + "\" at index " + i, "SECONDARY_INVALID_CATEGORY");
      }

      validatedPlaylist.push({
        category: cleanCat,
        district: "",
        headline: cleanText
      });
    } else {
      return buildInvalidResult_("Playlist entry at index " + i + " must specify either a valid District or an approved State Category.", "SECONDARY_MISSING_CLASSIFICATION");
    }
  }

  return { status: "VALID", validatedPlaylist: validatedPlaylist };
}

/**
 * Extracts raw JSON text from Gemini response structure or raw response string.
 */
function extractJsonText_(rawInput) {
  if (!rawInput) return "";

  var textStr = "";
  if (typeof rawInput === 'string') {
    textStr = rawInput;
  } else if (typeof rawInput === 'object') {
    if (rawInput.rawResponse && typeof rawInput.rawResponse === 'string') {
      textStr = rawInput.rawResponse;
    } else {
      try {
        textStr = JSON.stringify(rawInput);
      } catch (e) {
        return "";
      }
    }
  }

  // Handle Gemini API response wrapper candidates[0].content.parts[0].text
  try {
    var parsedWrapper = JSON.parse(textStr);
    if (parsedWrapper && parsedWrapper.candidates && parsedWrapper.candidates[0] &&
        parsedWrapper.candidates[0].content && parsedWrapper.candidates[0].content.parts &&
        parsedWrapper.candidates[0].content.parts[0] && parsedWrapper.candidates[0].content.parts[0].text) {
      textStr = parsedWrapper.candidates[0].content.parts[0].text;
    }
  } catch (e) {
    // String is direct JSON payload
  }

  // Strip markdown code block wrappers if present (e.g. ```json ... ```)
  textStr = textStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  return textStr;
}

/**
 * Helper to count sentences based on punctuation delimiters (., !, ?, |, newlines).
 */
function countSentences_(text) {
  if (!text) return 0;
  var sentences = text.split(/[\.!\?\|\n]+/g).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
  return Math.max(1, sentences.length);
}

/**
 * Normalizes district string for case-insensitive lookup.
 */
function normalizeDistrictName_(distStr) {
  if (!distStr) return "";
  return distStr.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Returns map of 33 Telangana districts normalized to canonical display names.
 */
function getTelanganaDistricts_() {
  var districts = [
    "Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial",
    "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar",
    "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial",
    "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda",
    "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla",
    "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vicarabad",
    "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
  ];

  var map = {};
  districts.forEach(function (d) {
    var key = d.toLowerCase().replace(/[^a-z0-9]/g, '');
    map[key] = d;
  });

  // Handle alternate spellings
  map["rangareddy"] = "Ranga Reddy";
  map["warangalurban"] = "Hanamkonda";
  map["warangalarban"] = "Hanamkonda";
  map["asifabad"] = "Kumuram Bheem Asifabad";
  map["komrambheem"] = "Kumuram Bheem Asifabad";

  return map;
}

/**
 * Constructs structured error result object.
 */
function buildInvalidResult_(reasonMessage, stageName) {
  return {
    status: "INVALID",
    data: null,
    reason: reasonMessage,
    stage: stageName || "VALIDATION_FAILED"
  };
}