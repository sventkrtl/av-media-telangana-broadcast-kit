# NewsFeedAutomate — Production Architecture (v1.0.0)

**Detailed Pipeline Stage Specification & Data Contracts**

---

## Complete Pipeline Architecture Diagram

```
[Stage 1: RSS Collector] (news_fetcher.js)
  │ Raw XML String Array
  ▼
[Stage 2: RSS Normalizer] (rss_normalizer.js)
  │ Unified Feed Item Objects
  ▼
[Stage 3: RSS Validator] (rss_validator.js)
  │ Validated Feed Items Array
  ▼
[Stage 4: Duplicate Resolution Engine] (duplicate_engine.js)
  │ Unique Feed Items (SHA-256 Deduplicated)
  ▼
[Stage 5A: Editorial Input Builder] (primary_builder.js)
  │ Editorial Input Object
  ▼
[Stage 5B: Gemini REST Client] (gemini_client.js)
  │ Raw Gemini JSON HTTP Response
  ▼
[Stage 5C: Gemini Response Parser] (gemini_response_parser.js)
  │ Raw Unwrapped Editorial Object
  ▼
[Stage 5D: Editorial Normalizer] (editorial_normalizer.js)
  │ Canonicalized Editorial Object (UPPERCASE Keys, Integer Priorities)
  ▼
[Stage 5E: Progressive Selector] (editorial_sanitizer.js)
  │ Sanitized Editorial Object (Cap Enforced & Malformed Entries Skipped)
  ▼
[Stage 6: Editorial Output Validator] (secondary_builder.js)
  │ Validated Editorial Output Data Package
  ▼
[Stage 7: Google Sheets Atomic Writer] (sheet_writer.js)
  ▼ Atomic Write to Google Sheets
```

---

## Detailed Stage Specifications

### **Stage 1: RSS Collector (`news_fetcher.js`)**
- **Responsibilities**: Fetches live RSS feed XML payloads from configured Telugu news outlets using `UrlFetchApp.fetchAll()` or `fetch()` with timeout and retries.
- **Input**: `CONFIG.SOURCES`
- **Output**: `Array<{ source: Object, xmlText: string, success: boolean, statusCode: number }>`
- **Dependencies**: `config.js`

### **Stage 2: RSS Normalizer (`rss_normalizer.js`)**
- **Responsibilities**: Parses raw RSS XML, decodes HTML entities, strips noise tags, normalizes strings to Unicode NFC, extracts publication dates, and converts to Unified Internal Schema.
- **Input**: Raw feed array from Stage 1.
- **Output**: `Array<UnifiedFeedItem>` (`{ Title, Description, Link, PublishedTime, Author, Category, GUID, Language, Source }`)
- **Dependencies**: `normalizer_utils.js`, `date_utils.js`

### **Stage 3: RSS Validator (`rss_validator.js`)**
- **Responsibilities**: Validates mandatory fields (`Title`, `Link`, `PublishedTime`), checks maximum story age (24 hours), enforces minimum title length (10 chars), and rejects non-Telugu / garbage feeds.
- **Input**: `Array<UnifiedFeedItem>`
- **Output**: Validated items array.
- **Dependencies**: `config.js`, `date_utils.js`

### **Stage 4: Duplicate Resolution Engine (`duplicate_engine.js`)**
- **Responsibilities**: Deduplicates items across multiple news sources using GUID matching, normalized URL comparison, and SHA-256 title hash digest matching.
- **Input**: Validated items array.
- **Output**: Unique items array (`Status: "UNIQUE"`).
- **Dependencies**: `Utilities.computeDigest`

### **Stage 5A: Editorial Input Builder (`primary_builder.js`)**
- **Responsibilities**: Sorts unique items chronologically, truncates array to `CONFIG.INPUT_PAYLOAD.MAX_STORIES` (50 items), and serializes payload context for Gemini AI.
- **Input**: Unique items array.
- **Output**: `EditorialInput` object (`{ generatedAt, itemCount, stories }`).
- **Dependencies**: `config.js`

### **Stage 5B: Gemini API Client (`gemini_client.js`)**
- **Responsibilities**: Invokes Gemini REST API (`gemini-3.6-flash:generateContent`) with `responseMimeType: "application/json"`, system instructions, and user prompt. Handles exponential backoff retries (`429`, `500`, `503`).
- **Input**: `EditorialInput` object.
- **Output**: `{ success: boolean, rawResponse: string, httpStatus: number, error: string|null }`
- **Dependencies**: `editorial_prompt_builder.js`, `config.js`

### **Stage 5C: Gemini Response Parser (`gemini_response_parser.js`)**
- **Responsibilities**: Strips markdown JSON fences (` ```json `), unwraps candidates envelope (`candidates[0].content.parts[0].text`), and parses JSON text.
- **Input**: Gemini HTTP response envelope object.
- **Output**: Raw parsed JSON Object.
- **Dependencies**: None

### **Stage 5D: Editorial Normalizer (`editorial_normalizer.js`)**
- **Responsibilities**: Canonicalizes top-level keys (`primaryHeadlines` / `primary_headlines` -> `PRIMARY_HEADLINES`), maps priority strings (`"High"` -> `1`, `"Medium"` -> `2`, `"Low"` -> `3`), and trims string whitespace.
- **Input**: Raw parsed JSON Object.
- **Output**: Canonicalized Editorial Object.
- **Dependencies**: None

### **Stage 5E: Progressive Selector (`editorial_sanitizer.js`)**
- **Responsibilities**: Evaluates items sequentially; skips invalid/over-length entries (> 85 chars, missing source, invalid categories, empty crawlText) and progressively accepts valid records up to configured caps.
- **Input**: Canonicalized Editorial Object.
- **Output**: Sanitized Editorial Object.
- **Dependencies**: `config.js`

### **Stage 6: Editorial Output Validator (`secondary_builder.js`)**
- **Responsibilities**: Enforces strict broadcast editorial rules: exactly 10-15 primary headlines, pure Telugu script, 33 official Telangana districts, forbidden `Politics` category.
- **Input**: Sanitized Editorial Object.
- **Output**: `{ status: "VALID"|"INVALID", data: Object, reason: string|null }`
- **Dependencies**: `config.js`

### **Stage 7: Google Sheets Atomic Writer (`sheet_writer.js`)**
- **Responsibilities**: Prepares 2D data arrays, validates sheet availability, clears existing content below headers, and atomically writes validated primary and secondary outputs to Google Sheets.
- **Input**: Validated Editorial Data package.
- **Output**: `{ status: "WRITTEN"|"WRITE_FAILED", rowsWritten: Object }`
- **Dependencies**: `SpreadsheetApp`, `config.js`
