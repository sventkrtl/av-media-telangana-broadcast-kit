# NewsFeedAutomate — Changelog (v1.0.0)

All notable changes to the NewsFeedAutomate broadcast editorial automation kit are documented below.

---

## [1.0.0] - 2026-07-25

### **Added Core Architecture Implementation Modules (`IMP` Tasks)**
- `config.js` (`IMP-001A`): Created central configuration registry with `deepFreeze` protection.
- `normalizer_utils.js` (`IMP-001B`): Created string sanitation utilities (HTML entity decoding, NFC normalization, CDATA extraction).
- `date_utils.js` (`IMP-001C`): Created ISO-8601 date parsing & 24-hour age boundary validation.
- `news_fetcher.js` (`IMP-001D`): Created parallel RSS fetcher with retries & error handling.
- `rss_normalizer.js` (`IMP-001E`): Created XML feed parser converting raw RSS to Unified Internal Schema.
- `rss_validator.js` (`IMP-001F`): Created RSS item validator enforcing title length, noise filtering, and age rules.
- `duplicate_engine.js` (`IMP-001G`): Created SHA-256 title hashing and GUID deduplication engine.
- `primary_builder.js` (`IMP-001H`): Created Stage 5A Editorial Input builder with 50-story capping.
- `editorial_prompt_builder.js` (`IMP-001I`): Created Stage 5A Gemini System Prompt and OpenAPI JSON Schema builder.
- `gemini_client.js` (`IMP-001J`): Created Stage 5B Gemini REST client supporting `gemini-3.6-flash` and exponential backoff retries.
- `gemini_response_parser.js` (`IMP-001K`): Created Stage 5C response envelope unwrapper and markdown code block fence stripper.
- `secondary_builder.js` (`IMP-001L`): Created Stage 6 Editorial Output Validator enforcing Telugu broadcast rules & 33 Telangana districts.
- `sheet_writer.js` (`IMP-001M`): Created Stage 7 Google Sheets Atomic Writer.
- `scheduler.js`: Created Apps Script hourly time-driven trigger manager (`createHourlyTrigger`).
- `Code.js`: Created main master entry point orchestrator (`runEditorialPipeline`).

### **Prompt Engineering & API Optimization (`PE` Tasks)**
- `PE-001` through `PE-003`: Added response schema structural validation.
- `PE-004`: Upgraded request payload format to official Gemini REST specification.
- `PE-005`: Conducted API compatibility audit confirming `:generateContent` REST endpoint support.
- `PE-006` & `PE-007`: Added raw model output logging and complete HTTP 400 error body logging.
- `PE-008`: Completed JSON Schema audit against Google Gemini Structured Output subset.
- `PE-009`: Built compatibility matrix diagnostic runner (`test_compatibility_matrix.js`).
- `PE-010`: Optimized story serialization in `editorial_prompt_builder.js`, achieving 62.5% prompt size reduction.
- `PE-011`: Created minimal Structured Output POC (`test_structured_output.js`).
- `PE-012`: Enforced strict case-sensitive JSON keys (`PRIMARY_HEADLINES`, `SECONDARY_PLAYLIST`) and integer priority types in system prompt instructions.

### **Normalization & Progressive Selection (`NL` Tasks)**
- `NL-001`: Created `editorial_normalizer.js` to canonicalize top-level keys (`primaryHeadlines` -> `PRIMARY_HEADLINES`) and priority strings (`"High"` -> `1`).
- `NL-002`: Integrated `editorial_normalizer.js` into Stage 5D of `Code.js`.
- `NL-003`: Added untruncated normalized output logging (`BEGIN NORMALIZED OUTPUT`).
- `NL-004`: Created `editorial_sanitizer.js` (Stage 5E) for filtering over-length items (> 85 chars) and malformed entries.
- `NL-005`: Refactored `editorial_sanitizer.js` into a progressive sequential selector evaluating items up to max caps without halting evaluation on individual invalid records.

### **Quality Assurance & Verification (`QA` Tasks)**
- `QA-001`: Conducted line-by-line Production Request Assembly Audit comparing production payload against Variant A POC.
- `QA-002`: Conducted 20-run Production Stability Validation benchmark confirming 100% success rate and zero failure causes.
