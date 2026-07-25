/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Production Editorial Prompt Builder & Response Schema (PE-001 / PE-010 / PE-012)
 * Builds system prompt, optimized user prompt, and JSON Response Schema for Gemini AI.
 * Updated with Strict JSON Key & Type Enforcement.
 * ============================================================
 */

/**
 * Builds the complete prompt package and JSON Response Schema.
 *
 * Input: EditorialInput object (from Primary Builder)
 * Output Contract:
 * {
 *   systemPrompt: string,
 *   userPrompt: string,
 *   responseSchema: Object
 * }
 *
 * @param {Object|string} editorialInput - Serialized stories input payload from Primary Builder.
 * @returns {Object} Prompt Package Object
 */
function buildEditorialPrompt(editorialInput) {
  // 1. System Prompt Definition (PE-012 Strict JSON Keys & Types)
  var systemPrompt = [
    "You are a Senior Telugu Broadcast News Editor for AV Media Telangana.",
    "Your duty is to curate, summarize, and edit raw RSS news feeds into broadcast-ready headlines and ticker playlists.",
    "",
    "CRITICAL OUTPUT FORMATTING & STRICT JSON KEY RULES:",
    "1. You MUST output strictly valid JSON matching the exact key names below.",
    "2. Top-Level Keys MUST use these EXACT UPPERCASE names (case-sensitive):",
    "   - PRIMARY_HEADLINES",
    "   - SECONDARY_PLAYLIST",
    "   Do NOT use 'primaryHeadlines', 'secondaryPlaylist', 'primary_headlines', or 'secondary_playlist'.",
    "3. NEVER output markdown code block fences (do NOT use ```json or ```).",
    "4. NEVER output explanations, introductions, commentary, notes, or HTML tags. Output raw valid JSON ONLY.",
    "5. Do NOT rename any field. Do NOT invent additional fields.",
    "",
    "PRIMARY_HEADLINES ITEM KEY SPECIFICATION:",
    "- Each item in PRIMARY_HEADLINES array MUST contain EXACTLY these keys:",
    "  * 'headline': string (Telugu broadcast headline text, max 85 characters, max 2 sentences)",
    "  * 'source': string (Name of news source e.g. HMTV, V6 Velugu, Raj News, Vaartha)",
    "- Quantity: Exactly 10 to 15 primary headlines.",
    "- Language: Pure Telugu script ONLY. Regional Focus: Telangana regional & state news.",
    "",
    "SECONDARY_PLAYLIST ITEM KEY & TYPE SPECIFICATION:",
    "- Each item in SECONDARY_PLAYLIST array MUST contain EXACTLY these keys:",
    "  * 'category': string (District or Sports, Cinema, Education, Jobs, Government Notifications)",
    "  * 'district': string (One of Telangana's 33 official districts or empty string for state category)",
    "  * 'priority': integer (MUST be an INTEGER number like 1, 2, 3. Do NOT output strings like 'High', 'Medium', 'Low')",
    "  * 'order': integer (Sequential integer index like 1, 2, 3)",
    "  * 'crawlText': string (Telugu ticker text, max 5 sentences)",
    "- District News: Use ONLY Telangana's 33 official districts (Adilabad, Bhadradri Kothagudem, Hanamkonda, Hyderabad, Jagtial, Jangaon, Jayashankar Bhupalpally, Jogulamba Gadwal, Kamareddy, Karimnagar, Khammam, Kumuram Bheem Asifabad, Mahabubabad, Mahabubnagar, Mancherial, Medak, Medchal-Malkajgiri, Mulugu, Nagarkurnool, Nalgonda, Narayanpet, Nirmal, Nizamabad, Peddapalli, Rajanna Sircilla, Ranga Reddy, Sangareddy, Siddipet, Suryapet, Vicarabad, Wanaparthy, Warangal, Yadadri Bhuvanagiri). Max 2 to 4 stories per district.",
    "- State Categories: Permitted categories ONLY: 'Sports', 'Cinema', 'Education', 'Jobs', 'Government Notifications'.",
    "- STRICT PROHIBITION: 'Politics' is strictly FORBIDDEN in the Secondary Playlist.",
    "- Language: Pure Telugu script ONLY."
  ].join("\n");

  // 2. User Prompt Construction with Optimization (PE-010)
  var unoptimizedInputStr = (typeof editorialInput === 'string')
    ? editorialInput
    : JSON.stringify(editorialInput || { stories: [] });

  var originalUserPrompt = "Below is the current raw RSS news feed items array collected from verified Telugu news sources.\nEdit and transform these stories according to the System Editorial Rules into PRIMARY_HEADLINES and SECONDARY_PLAYLIST.\n\nRAW NEWS FEED INPUT DATA:\n" + unoptimizedInputStr;
  var originalPromptLength = systemPrompt.length + originalUserPrompt.length;

  var optimizedPayload = optimizeStoriesPayload_(editorialInput);
  var optimizedInputStr = JSON.stringify(optimizedPayload);

  var userPrompt = [
    "Below is the current raw RSS news feed items array collected from verified Telugu news sources.",
    "Edit and transform these stories according to the System Editorial Rules into PRIMARY_HEADLINES and SECONDARY_PLAYLIST.",
    "",
    "RAW NEWS FEED INPUT DATA:",
    optimizedInputStr
  ].join("\n");

  var optimizedPromptLength = systemPrompt.length + userPrompt.length;
  var reductionPct = originalPromptLength > 0
    ? (((originalPromptLength - optimizedPromptLength) / originalPromptLength) * 100).toFixed(1)
    : 0;

  logPromptOpt_("INFO", "[PROMPT OPT] Original Prompt Length: " + originalPromptLength + " chars | Optimized Prompt Length: " + optimizedPromptLength + " chars | Estimated Reduction: " + reductionPct + "%");

  // 3. Complete JSON Response Schema (Google Gemini OpenAPI / Type Schema)
  var responseSchema = {
    type: "OBJECT",
    properties: {
      PRIMARY_HEADLINES: {
        type: "ARRAY",
        description: "List of 10-15 broadcast primary headlines in Telugu.",
        items: {
          type: "OBJECT",
          properties: {
            headline: {
              type: "STRING",
              description: "Telugu broadcast headline text (max 85 chars, max 2 sentences)."
            },
            source: {
              type: "STRING",
              description: "Name of the news source (e.g. HMTV, V6 Velugu, Raj News, Vaartha)."
            }
          },
          required: ["headline", "source"]
        }
      },
      SECONDARY_PLAYLIST: {
        type: "ARRAY",
        description: "List of district and state category news stories for broadcast ticker playlist.",
        items: {
          type: "OBJECT",
          properties: {
            category: {
              type: "STRING",
              description: "Category name (District or Sports, Cinema, Education, Jobs, Government Notifications)."
            },
            district: {
              type: "STRING",
              description: "Telangana district name (one of 33 official districts) or empty for state category."
            },
            priority: {
              type: "INTEGER",
              description: "Broadcast priority integer."
            },
            order: {
              type: "INTEGER",
              description: "Sequential display order integer."
            },
            crawlText: {
              type: "STRING",
              description: "Telugu ticker crawl text (max 5 sentences)."
            }
          },
          required: ["category", "district", "priority", "order", "crawlText"]
        }
      }
    },
    required: ["PRIMARY_HEADLINES", "SECONDARY_PLAYLIST"]
  };

  return {
    systemPrompt: systemPrompt,
    userPrompt: userPrompt,
    responseSchema: responseSchema
  };
}

/**
 * Reduces story items to include ONLY Title, Source, PublishedTime, Category.
 * Strips Description, Author, Priority, GUID, Hash, Status, Link, and extra metadata.
 */
function optimizeStoriesPayload_(editorialInput) {
  var inputObj = null;
  if (typeof editorialInput === 'string') {
    try {
      inputObj = JSON.parse(editorialInput);
    } catch (e) {
      inputObj = null;
    }
  } else if (editorialInput && typeof editorialInput === 'object') {
    inputObj = editorialInput;
  }

  if (!inputObj) {
    return { stories: [] };
  }

  var rawStories = inputObj.stories || (Array.isArray(inputObj) ? inputObj : []);
  var optimizedStories = rawStories.map(function (item) {
    return {
      Title: item.Title || item.title || "",
      Source: item.Source || item.source || "",
      PublishedTime: item.PublishedTime || item.publishedTime || "",
      Category: item.Category || item.category || []
    };
  });

  return {
    generatedAt: inputObj.generatedAt || new Date().toISOString(),
    itemCount: optimizedStories.length,
    stories: optimizedStories
  };
}

function logPromptOpt_(level, message) {
  var msg = "[" + level + "] " + message;
  if (typeof Logger !== 'undefined' && typeof Logger.log === 'function') {
    Logger.log(msg);
  } else {
    console.log(msg);
  }
}
