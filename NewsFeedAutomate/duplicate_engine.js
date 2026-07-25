/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Duplicate Engine (Stage 4)
 * Generates content hashes and resolves duplicates across sources and priorities.
 * ============================================================
 */

/**
 * Deduplicates and priority-merges validated feed items.
 *
 * Input: Array<ValidatedFeedItem>
 * Output Contract: Array<UniqueFeedItem> (Status: "UNIQUE", Hash: SHA-256 string)
 *
 * @param {Array<Object>} items - Array of ValidatedFeedItem objects.
 * @returns {Array<Object>} Deduplicated array of items with Status = "UNIQUE".
 */
function deduplicateFeedItems(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return [];
  }

  // Step 1: Compute Hash and Canonical URL for every item
  var processedItems = items.map(function (item) {
    var canonicalUrl = sanitizeCanonicalUrl_(item.Link);
    var normTitleHash = generateNormalizedTitleHash_(item.Title);

    return {
      Source: item.Source || "",
      Priority: item.Priority || 99,
      Title: item.Title || "",
      Description: item.Description || "",
      Link: item.Link || "",
      CanonicalLink: canonicalUrl,
      PublishedTime: item.PublishedTime || "",
      Category: item.Category || [],
      Author: item.Author || "",
      GUID: (item.GUID || "").trim(),
      Language: item.Language || "te",
      Hash: normTitleHash,
      Status: "NEW"
    };
  });

  // Step 2 & 3 & 4: Deduplicate and Priority Merge
  var uniqueGroups = [];

  for (var i = 0; i < processedItems.length; i++) {
    var current = processedItems[i];
    var matchedGroup = null;

    for (var g = 0; g < uniqueGroups.length; g++) {
      var candidate = uniqueGroups[g];

      var isGuidMatch = current.GUID && candidate.GUID && (current.GUID === candidate.GUID);
      var isUrlMatch = current.CanonicalLink && candidate.CanonicalLink && (current.CanonicalLink === candidate.CanonicalLink);
      var isTitleHashMatch = current.Hash && candidate.Hash && (current.Hash === candidate.Hash);

      if (isGuidMatch || isUrlMatch || isTitleHashMatch) {
        matchedGroup = candidate;
        break;
      }
    }

    if (!matchedGroup) {
      uniqueGroups.push(current);
    } else {
      // Compare current vs matchedGroup winner
      // Rule: Lower Priority Number wins (1 > 2 > 3 > 4)
      // If Priority equal, Newest PublishedTime wins
      if (shouldReplaceWinner_(current, matchedGroup)) {
        var idx = uniqueGroups.indexOf(matchedGroup);
        if (idx !== -1) {
          uniqueGroups[idx] = current;
        }
      }
    }
  }

  // Step 5: Format output contract (Status = "UNIQUE")
  return uniqueGroups.map(function (item) {
    return {
      Source: item.Source,
      Priority: item.Priority,
      Title: item.Title,
      Description: item.Description,
      Link: item.Link,
      PublishedTime: item.PublishedTime,
      Category: item.Category,
      Author: item.Author,
      GUID: item.GUID,
      Language: item.Language,
      Hash: item.Hash,
      Status: "UNIQUE"
    };
  });
}

/**
 * Compares incoming item against existing winner to see if incoming item should replace it.
 * Priority: 1. Lower Priority Number (HMTV=1 > V6=2 > Raj=3 > Vaartha=4).
 *           2. If Priority equal, Newer PublishedTime.
 */
function shouldReplaceWinner_(newItem, existingWinner) {
  if (newItem.Priority < existingWinner.Priority) {
    return true; // Priority 1 (HMTV) beats Priority 2 (V6)
  }

  if (newItem.Priority === existingWinner.Priority) {
    var newTimeMs = new Date(newItem.PublishedTime || 0).getTime();
    var existingTimeMs = new Date(existingWinner.PublishedTime || 0).getTime();
    return newTimeMs > existingTimeMs;
  }

  return false;
}

/**
 * Removes tracking parameters (utm_*, fbclid, ref) from a URL.
 */
function sanitizeCanonicalUrl_(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return '';
  return urlStr.replace(/([?&])(utm_[^&]+|fbclid|ref)=[^&]*&?/gi, '$1')
               .replace(/[?&]$/, '')
               .trim();
}

/**
 * Generates a deterministic SHA-256 hash of normalized title string.
 */
function generateNormalizedTitleHash_(titleStr) {
  if (!titleStr || typeof titleStr !== 'string') return '';

  // 1. Lowercase
  var text = titleStr.toLowerCase();

  // 2. Normalize Unicode NFC
  if (typeof text.normalize === 'function') {
    text = text.normalize('NFC');
  }

  // 3. Remove punctuation
  text = text.replace(/[\!\?\'\"\`\.\,\:\;\-\–\—\(\)\[\]\{\}\\\/\@\#\$\%\^\&\*\_\+\=\<\>\~\|\“\”\‘\’]/g, '');

  // 4. Collapse whitespace & trim
  text = text.replace(/\s+/g, ' ').trim();

  // 5. SHA-256 Hash
  return computeSha256_(text);
}

/**
 * Computes SHA-256 hash using Google Apps Script Utilities or fallback crypto.
 */
function computeSha256_(str) {
  if (!str) return '';

  if (typeof Utilities !== 'undefined' && typeof Utilities.computeDigest === 'function') {
    try {
      var rawDigest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
      var txt = '';
      for (var j = 0; j < rawDigest.length; j++) {
        var byteVal = rawDigest[j];
        if (byteVal < 0) byteVal += 256;
        var byteStr = byteVal.toString(16);
        if (byteStr.length === 1) byteStr = '0' + byteStr;
        txt += byteStr;
      }
      return txt;
    } catch (e) {
      // Fallback
    }
  }

  if (typeof crypto !== 'undefined' && typeof crypto.createHash === 'function') {
    try {
      return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
    } catch (e) {}
  }

  var hash = 0x811c9dc5;
  for (var i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return 'hash_' + (hash >>> 0).toString(16);
}
