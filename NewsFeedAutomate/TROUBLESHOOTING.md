# NewsFeedAutomate — Troubleshooting Guide (v1.0.0)

**Comprehensive Post-Mortem of Issues, Diagnoses, and Fixes**

---

## Issue 1: HTTP 404 Model Not Found
- **Symptom**: `Gemini API returned status 404: models/gemini-pro is not found for API version v1beta`.
- **Root Cause**: Deprecated model endpoint identifier used in early configuration.
- **Resolution**: Updated `config.js` to target official model `gemini-3.6-flash` on `:generateContent`.

---

## Issue 2: HTTP 400 Invalid Argument on Structured Output Schema
- **Symptom**: Gemini API returned `400 Invalid JSON payload received. Unknown field 'responseFormat'`.
- **Root Cause**: Mismatch between REST schema parameter name expectations across endpoints.
- **Resolution**: In `gemini_client.js`, simplified request configuration to `generationConfig: { responseMimeType: "application/json" }` for native JSON mode while using client-side schema enforcement (`secondary_builder.js` & `editorial_normalizer.js`).

---

## Issue 3: Gemini Markdown Code Fence Output
- **Symptom**: `JSON.parse` failed due to response wrapped in ` ```json ... ``` `.
- **Root Cause**: Gemini model occasionally includes markdown formatting fences in text parts.
- **Resolution**: Implemented regex stripping in `gemini_response_parser.js` (`rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '')`).

---

## Issue 4: Key Casing Variations (`primaryHeadlines` vs `PRIMARY_HEADLINES`)
- **Symptom**: Output Validator rejected output with `MISSING_PRIMARY_HEADLINES`.
- **Root Cause**: Gemini AI sometimes outputs camelCase or snake_case key names despite prompt rules.
- **Resolution**: Introduced `editorial_normalizer.js` (Stage 5D) to canonicalize all variants (`primaryHeadlines`, `primary_headlines`, `primaryheadlines`) to strict uppercase `PRIMARY_HEADLINES`.

---

## Issue 5: Priority Casing String Conversion ("High" vs 1)
- **Symptom**: Priority validation failed when Gemini returned `"High"`, `"Medium"`, or `"Low"`.
- **Root Cause**: Prompt string preferences overridden by language model default tokenization.
- **Resolution**: Added integer mapping in `editorial_normalizer.js` (`"High"` -> `1`, `"Medium"` -> `2`, `"Low"` -> `3`).

---

## Issue 6: Clasp Synchronization & Environment Cache Issues
- **Symptom**: Local script updates not reflected in Apps Script execution.
- **Root Cause**: Stale local files or un-pushed changes.
- **Resolution**: Standardized workflow using `clasp push` after code updates and verifying 24 project files pushed cleanly.
