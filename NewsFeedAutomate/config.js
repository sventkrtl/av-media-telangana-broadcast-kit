/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Central Immutable Project Configuration & Source Registry
 * ============================================================
 */

function deepFreeze(obj) {
  Object.keys(obj).forEach(function (name) {
    var prop = obj[name];
    if (typeof prop === 'object' && prop !== null && !Object.isFrozen(prop)) {
      deepFreeze(prop);
    }
  });
  return Object.freeze(obj);
}

const CONFIG = deepFreeze({

  // 1. PROJECT
  PROJECT: {
    NAME: "NewsFeedAutomate",
    VERSION: "1.0.0",
    ENVIRONMENT: "production"
  },

  // 2. SCHEDULER
  SCHEDULER: {
    RUN_INTERVAL_HOURS: 1,
    HTTP_TIMEOUT_MS: 8000,
    RETRY_COUNT: 3,
    RETRY_BACKOFF_MS: 2000
  },

  // 3. RSS SOURCES
  RSS_SOURCES: {
    HMTV: {
      ENABLED: true,
      PRIORITY: 1,
      NAME: "HMTV",
      HOMEPAGE: "https://www.hmtvlive.com/",
      FEED_URL: "https://www.hmtvlive.com/feed"
    },
    V6_VELUGU: {
      ENABLED: true,
      PRIORITY: 2,
      NAME: "V6 Velugu",
      HOMEPAGE: "https://www.v6velugu.com/",
      FEED_URL: "https://www.v6velugu.com/feed"
    },
    RAJ_NEWS: {
      ENABLED: true,
      PRIORITY: 3,
      NAME: "Raj News Telugu",
      HOMEPAGE: "https://rajnewsonline.com/",
      FEED_URL: "https://rajnewsonline.com/feed"
    },
    VAARTHA: {
      ENABLED: true,
      PRIORITY: 4,
      NAME: "Vaartha",
      HOMEPAGE: "https://vaartha.com/",
      FEED_URL: "https://vaartha.com/feed"
    }
  },

  // 4. PIPELINE LIMITS
  PIPELINE_LIMITS: {
    MAX_FEED_AGE_HOURS: 24,
    MAX_GEMINI_INPUT_ITEMS: 20,
    MAX_PRIMARY_HEADLINES: 15,
    MAX_DISTRICT_NEWS: 3,
    MAX_STATE_CATEGORY_NEWS: 5
  },

  // 5. PRIMARY RULES
  PRIMARY_RULES: {
    MAX_HEADLINES: 15,
    MAX_CHARACTERS: 85,
    MAX_SENTENCES: 2,
    LANGUAGE: "te",
    COVERAGE: "Telangana & AP Regional News"
  },

  // 6. SECONDARY RULES
  SECONDARY_RULES: {
    DISTRICT_COUNT: 33,
    DISTRICT_NEWS_LIMIT: 3,
    MAX_SENTENCES: 5,
    STATE_CATEGORIES: [
      "Politics",
      "Crime",
      "Development",
      "Weather",
      "Sports",
      "Entertainment"
    ]
  },

  // 7. GOOGLE SHEETS
  GOOGLE_SHEETS: {
    SHEET_NAMES: {
      PRIMARY_HEADLINES: "PRIMARY_HEADLINES",
      SECONDARY_PLAYLIST: "SECONDARY_PLAYLIST",
      MASTER_DATA: "MASTER_DATA"
    }
  },

  // 8. LOGGING
  LOGGING: {
    ENABLE: true,
    LOG_LEVEL: "INFO"
  },

  // 9. GEMINI AI
  GEMINI: {
    MODEL: "gemini-3.6-flash"
  }

});