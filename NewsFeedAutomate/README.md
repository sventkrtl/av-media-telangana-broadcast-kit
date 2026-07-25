# NewsFeedAutomate — Production Editorial Pipeline (v1.0.0)

**AV Media Telangana Broadcast Automation Kit**

`NewsFeedAutomate` is an enterprise-grade automated editorial intelligence and broadcast curation pipeline built for AV Media Telangana. It fetches live RSS feeds from trusted Telugu news outlets, normalizes, validates, deduplicates, and passes editorial context to Google Gemini AI to generate broadcast-ready Telugu primary headlines and secondary ticker playlist stories, writing them atomically to Google Sheets.

---

## Architecture & Execution Overview

The pipeline executes sequentially across 11 fault-isolated stages:

```
[Stage 1: RSS Collector] (news_fetcher.js)
        ↓
[Stage 2: RSS Normalizer] (rss_normalizer.js)
        ↓
[Stage 3: RSS Validator] (rss_validator.js)
        ↓
[Stage 4: Duplicate Resolution Engine] (duplicate_engine.js)
        ↓
[Stage 5A: Editorial Input Builder] (primary_builder.js)
        ↓
[Stage 5B: Gemini API Client] (gemini_client.js)
        ↓
[Stage 5C: Gemini Response Parser] (gemini_response_parser.js)
        ↓
[Stage 5D: Editorial Normalizer] (editorial_normalizer.js)
        ↓
[Stage 5E: Progressive Selector] (editorial_sanitizer.js)
        ↓
[Stage 6: Editorial Output Validator] (secondary_builder.js)
        ↓
[Stage 7: Google Sheets Atomic Writer] (sheet_writer.js)
```

---

## Production Module Registry

| Module Name | File Path | Description |
| :--- | :--- | :--- |
| **Config Registry** | `config.js` | Immutable central configuration registry (`deepFreeze`). |
| **Collector** | `news_fetcher.js` | Parallel multi-source HTTP RSS feed fetcher with retries. |
| **Normalizer Utils** | `normalizer_utils.js` | HTML entity decoding, NFC Unicode normalization, CDATA extraction. |
| **Date Utils** | `date_utils.js` | ISO-8601 UTC date parsing & age boundary validation. |
| **RSS Normalizer** | `rss_normalizer.js` | XML parser converting raw RSS streams to Unified Internal Schema. |
| **RSS Validator** | `rss_validator.js` | Script verification, noise filtering, title length & age validation. |
| **Duplicate Engine**| `duplicate_engine.js` | SHA-256 title hashing, GUID & Canonical URL deduplication. |
| **Input Builder** | `primary_builder.js` | Chronological sorting & story array truncation for AI prompt input. |
| **Prompt Builder** | `editorial_prompt_builder.js` | Persona framing, editorial rules & OpenAPI JSON Schema builder. |
| **Gemini Client** | `gemini_client.js` | REST client for Gemini 3.6 Flash with JSON Mode & exponential backoff. |
| **Response Parser** | `gemini_response_parser.js` | Outer envelope unwrapper & markdown code fence stripper. |
| **Normalizer** | `editorial_normalizer.js` | Canonicalizer for top-level keys (`PRIMARY_HEADLINES`) & priority types. |
| **Progressive Selector**| `editorial_sanitizer.js` | Sequential validator & selector up to pipeline max caps. |
| **Output Validator**| `secondary_builder.js` | Strict validation of primary headlines & 33 Telangana districts. |
| **Atomic Writer** | `sheet_writer.js` | 2D memory array writer for `PRIMARY_HEADLINES` & `SECONDARY_PLAYLIST`. |
| **Scheduler** | `scheduler.js` | Time-driven trigger management (`createHourlyTrigger`). |
| **Orchestrator** | `Code.js` | Top-level master entry point (`runEditorialPipeline`). |

---

## Configuration Summary

- **Environment**: Google Apps Script (V8 Runtime)
- **Script Property**: `GEMINI_API_KEY` (Stores authenticated Gemini API key safely)
- **AI Model**: `gemini-3.6-flash`
- **RSS Sources**:
  1. HMTV (Priority 1) — `https://www.hmtvlive.com/feed`
  2. V6 Velugu (Priority 2) — `https://www.v6velugu.com/feed`
  3. Raj News Telugu (Priority 3) — `https://rajnewsonline.com/feed`
  4. Vaartha (Priority 4) — `https://vaartha.com/feed`
- **Target Sheets**:
  - `PRIMARY_HEADLINES` (5 Columns: Active, Order, Priority, Headline, Repeat)
  - `SECONDARY_PLAYLIST` (6 Columns: Active, Category, District, Priority, Order, Crawl Text)

---

## Quick Start & Deployment

1. **Clone & Push via Clasp**:
   ```bash
   cd NewsFeedAutomate
   clasp login
   clasp push
   ```
2. **Configure API Key in Apps Script**:
   Go to Apps Script Project Settings -> Script Properties -> Add `GEMINI_API_KEY` = `<your-api-key>`.
3. **Execute Pipeline**:
   Run `runEditorialPipeline()` from `Code.js`.
4. **Set Up Automated Hourly Execution**:
   Run `createHourlyTrigger()` from `scheduler.js`.

---

## Known Limitations & Roadmap

- **Known Limitations**:
  - Requires active internet connection to reach Gemini REST API and news RSS endpoints.
  - Relies on Google Apps Script `UrlFetchApp` quotas (20,000 fetch calls / day).
- **Future Roadmap**:
  - Multi-language translation support (English / Hindi broadcast output).
  - Webhook integration for instant broadcast control room alert notifications.
