/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Progressive Editorial Selector & Sanitizer (Stage 5E)
 * Sequentially evaluates normalized items and progressively selects valid
 * records up to configured pipeline thresholds.
 * ============================================================
 */

/**
 * Progressively selects valid primary and secondary editorial entries.
 *
 * Input: Normalized Editorial Output
 * Output Contract: Sanitized Editorial Object
 * {
 *   PRIMARY_HEADLINES: Array<Object>,
 *   SECONDARY_PLAYLIST: Array<Object>
 * }
 *
 * @param {Object} normalizedObject - Object from Editorial Normalizer.
 * @returns {Object} Sanitized Editorial Object.
 */
function sanitizeEditorialOutput(normalizedObject) {
  if (!normalizedObject || typeof normalizedObject !== 'object' || Array.isArray(normalizedObject)) {
    return {
      PRIMARY_HEADLINES: [],
      SECONDARY_PLAYLIST: []
    };
  }

  var rawPrimary = Array.isArray(normalizedObject.PRIMARY_HEADLINES) ? normalizedObject.PRIMARY_HEADLINES : [];
  var rawSecondary = Array.isArray(normalizedObject.SECONDARY_PLAYLIST) ? normalizedObject.SECONDARY_PLAYLIST : [];

  var maxPrimaryChars = (typeof CONFIG !== 'undefined' && CONFIG.PRIMARY_RULES && CONFIG.PRIMARY_RULES.MAX_CHARACTERS)
    ? CONFIG.PRIMARY_RULES.MAX_CHARACTERS
    : 85;

  var maxPrimaryHeadlines = (typeof CONFIG !== 'undefined' && CONFIG.PRIMARY_RULES && CONFIG.PRIMARY_RULES.MAX_HEADLINES)
    ? CONFIG.PRIMARY_RULES.MAX_HEADLINES
    : 15;

  var validDistricts = getSanitizerTelanganaDistricts_();
  var allowedCategories = [
    "sports", "cinema", "education", "jobs", "government notifications",
    "క్రీడలు", "సినిమా", "విద్య", "ఉద్యోగాలు", "ప్రభుత్వ నివేదికలు", "district"
  ];

  // 1. Progressive Selection for PRIMARY_HEADLINES
  var selectedPrimary = [];
  var rejectedPrimaryCount = 0;

  for (var i = 0; i < rawPrimary.length; i++) {
    if (selectedPrimary.length >= maxPrimaryHeadlines) {
      break; // Cap reached
    }

    var item = rawPrimary[i];
    if (!item || typeof item !== 'object') {
      rejectedPrimaryCount++;
      continue;
    }

    var headline = (typeof item.headline === 'string') ? item.headline.trim() : "";
    var source = (typeof item.source === 'string') ? item.source.trim() : "";

    // Validation check for individual primary record
    if (headline.length === 0 || source.length === 0 || headline.length > maxPrimaryChars) {
      rejectedPrimaryCount++;
      continue; // Skip invalid, continue evaluating next items
    }

    selectedPrimary.push({
      headline: headline,
      source: source
    });
  }

  // 2. Progressive Selection for SECONDARY_PLAYLIST
  var selectedSecondary = [];
  var rejectedSecondaryCount = 0;

  for (var j = 0; j < rawSecondary.length; j++) {
    var sItem = rawSecondary[j];
    if (!sItem || typeof sItem !== 'object') {
      rejectedSecondaryCount++;
      continue;
    }

    var category = (typeof sItem.category === 'string') ? sItem.category.trim() : "";
    var district = (typeof sItem.district === 'string') ? sItem.district.trim() : "";
    var crawlText = (typeof sItem.headline === 'string') ? sItem.headline.trim() :
                    ((typeof sItem.crawlText === 'string') ? sItem.crawlText.trim() : "");

    if (crawlText.length === 0) {
      rejectedSecondaryCount++;
      continue;
    }

    var catLower = category.toLowerCase();
    var distLower = district.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Rule: Reject Politics
    if (catLower === "politics" || catLower === "రాజకీయాలు") {
      rejectedSecondaryCount++;
      continue;
    }

    // Rule: Category equals district name
    if (category.length > 0 && district.length > 0 && catLower === district.toLowerCase()) {
      rejectedSecondaryCount++;
      continue;
    }

    // Rule: District news with empty district
    if (catLower === "district" && district.length === 0) {
      rejectedSecondaryCount++;
      continue;
    }

    // Rule: Invalid category check
    var isDistrictValid = district.length > 0 && !!validDistricts[distLower];
    var isCategoryAllowed = allowedCategories.indexOf(catLower) !== -1 || isDistrictValid;

    if (!isCategoryAllowed && !isDistrictValid) {
      rejectedSecondaryCount++;
      continue;
    }

    selectedSecondary.push({
      category: category || (isDistrictValid ? "District" : ""),
      district: isDistrictValid ? validDistricts[distLower] : district,
      priority: typeof sItem.priority === 'number' ? Math.max(1, Math.floor(sItem.priority)) : 1,
      order: typeof sItem.order === 'number' ? Math.max(1, Math.floor(sItem.order)) : (selectedSecondary.length + 1),
      headline: crawlText
    });
  }

  logSanitizer_("INFO", "[PROGRESSIVE SELECTOR] Primary -> Input: " + rawPrimary.length + ", Accepted: " + selectedPrimary.length + ", Rejected: " + rejectedPrimaryCount + " | Secondary -> Input: " + rawSecondary.length + ", Accepted: " + selectedSecondary.length + ", Rejected: " + rejectedSecondaryCount);

  return {
    PRIMARY_HEADLINES: selectedPrimary,
    SECONDARY_PLAYLIST: selectedSecondary
  };
}

function getSanitizerTelanganaDistricts_() {
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
  map["rangareddy"] = "Ranga Reddy";
  map["warangalurban"] = "Hanamkonda";
  return map;
}

function logSanitizer_(level, message) {
  var text = "[" + level + "] " + message;
  if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
    Logger.log(text);
  } else {
    console.log(text);
  }
}
