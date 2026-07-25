# NewsFeedAutomate — Configuration Guide (v1.0.0)

**Script Properties, Central Registry, and Environment Settings**

---

## 1. Script Properties Configuration

The system requires one secure credential stored in Google Apps Script properties:

| Property Key | Scope | Purpose | Required | Example |
| :--- | :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Private Script Property | Gemini REST API Authentication | **YES** | `AIzaSyB...` |

### Setting Script Properties in Apps Script:
1. Open Google Apps Script Editor.
2. Select **Project Settings** (gear icon on the left menu).
3. Scroll to **Script Properties** -> Click **Edit script properties**.
4. Add Property Key: `GEMINI_API_KEY`, Property Value: `<your-api-key>`.
5. Click **Save script properties**.

---

## 2. Central Configuration Registry (`config.js`)

All pipeline operational thresholds and schemas are defined centrally in `config.js` and frozen using `Object.freeze()` (`deepFreeze` recursive protection):

```javascript
const CONFIG = deepFreeze({
  SHEET_NAMES: {
    PRIMARY_HEADLINES: "PRIMARY_HEADLINES",
    SECONDARY_PLAYLIST: "SECONDARY_PLAYLIST",
    MASTER_DATA: "MASTER_DATA"
  },

  GEMINI: {
    MODEL: "gemini-3.6-flash",
    API_VERSION: "v1beta",
    RESPONSE_MIME_TYPE: "application/json"
  },

  SCHEDULER: {
    RUN_INTERVAL_HOURS: 1,
    HTTP_TIMEOUT_MS: 15000,
    RETRY_COUNT: 3
  },

  SOURCES: [
    { name: "HMTV", url: "https://www.hmtvlive.com/feed", enabled: true, priority: 1 },
    { name: "V6 Velugu", url: "https://www.v6velugu.com/feed", enabled: true, priority: 2 },
    { name: "Raj News Telugu", url: "https://rajnewsonline.com/feed", enabled: true, priority: 3 },
    { name: "Vaartha", url: "https://vaartha.com/feed", enabled: true, priority: 4 }
  ],

  PRIMARY_RULES: {
    MIN_HEADLINES: 10,
    MAX_HEADLINES: 15,
    MAX_CHARACTERS: 85,
    MAX_SENTENCES: 2,
    LANGUAGE: "te",
    REGIONAL_FOCUS: "Telangana"
  },

  SECONDARY_RULES: {
    DISTRICT_CAP_MIN: 2,
    DISTRICT_CAP_MAX: 4,
    PERMITTED_CATEGORIES: [
      "Sports", "Cinema", "Education", "Jobs", "Government Notifications",
      "క్రీడలు", "సినిమా", "విద్య", "ఉద్యోగాలు", "ప్రభుత్వ నివేదికలు"
    ],
    FORBIDDEN_CATEGORIES: ["Politics", "రాజకీయాలు"],
    MAX_SENTENCES: 5,
    LANGUAGE: "te"
  }
});
```

---

## 3. Supported Gemini Models

| Model Identifier | Status | Supported Features |
| :--- | :--- | :--- |
| `gemini-3.6-flash` | **PRIMARY PRODUCTION** | Fast response time, JSON Mode, Telugu script fluency. |
| `gemini-1.5-flash` | Backward Compatible | Legacy fallback. |
| `gemini-1.5-pro` | Optional | High capacity analytical model. |

---

## 4. Google Sheets Configuration

Target Google Spreadsheet MUST contain the following tabs with headers:

### **Tab 1: `PRIMARY_HEADLINES`**
- **Columns**: `Active` (Column A), `Order` (Column B), `Priority` (Column C), `Headline` (Column D), `Repeat` (Column E)

### **Tab 2: `SECONDARY_PLAYLIST`**
- **Columns**: `Active` (Column A), `Category` (Column B), `District` (Column C), `Priority` (Column D), `Order` (Column E), `Crawl Text` (Column F)
