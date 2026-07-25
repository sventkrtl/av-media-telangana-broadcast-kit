# NewsFeedAutomate — Release Notes (v1.0.0)

**Official Production Release v1.0.0 — AV Media Telangana**

---

## Key Highlights & Features

- **11-Stage Production Pipeline**: Fully modularized and fault-isolated RSS processing, Gemini AI editorial transformation, canonicalization, validation, and Sheets writing.
- **Gemini 3.6 Flash Integration**: Operates on `gemini-3.6-flash` with native `responseMimeType: "application/json"` JSON mode.
- **62.5% Prompt Size Optimization**: Story serialization whitelisting includes ONLY `Title`, `Source`, `PublishedTime`, `Category`, stripping bloated description texts while preserving editorial context.
- **Robust Key & Priority Canonicalization**: `editorial_normalizer.js` dynamically converts `primaryHeadlines` or `snake_case` keys into `PRIMARY_HEADLINES`, and string priorities (`"High"`, `"Medium"`, `"Low"`) into integer values `1`, `2`, `3`.
- **Progressive Sequential Selector**: `editorial_sanitizer.js` evaluates normalized items item-by-item, discarding over-length headlines (> 85 chars) while progressively selecting valid records up to configured pipeline caps.
- **Atomic Google Sheets Writer**: Ensures spreadsheet updates occur cleanly without partial data corruption.

---

## Architectural Principles

- **Single Responsibility**: Every module handles exactly one stage of the pipeline.
- **Fail-Safe & Defensive**: Exponential backoff retries handle transient 429 rate limits; invalid records are skipped without crashing the pipeline.
- **Immutable Configuration**: `CONFIG` registry is frozen using `Object.freeze()` (`deepFreeze`).

---

## Breaking Changes
- **None**: Initial production freeze release v1.0.0.

---

## Known Limitations & Future Improvements

- **Current Limitations**:
  - Dependent on external RSS availability and Google Apps Script `UrlFetchApp` quotas.
- **Future Improvements**:
  - Webhook integration for control room automation triggers.
  - Support for multi-lingual news translation.
