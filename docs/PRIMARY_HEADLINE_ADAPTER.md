# 🔌 Primary Headline Data Adapter Architecture (Task P1-6)

This document describes the design, data pipeline, hot reload strategy, and governance compliance of **`PrimaryHeadlineDataAdapter`**.

Strictly adheres to [`PRIMARY_HEADLINE_ENGINE_SPEC.md`](../PRIMARY_HEADLINE_ENGINE_SPEC.md) v1.0 & [`ENGINEERING_GOVERNANCE.md`](../ENGINEERING_GOVERNANCE.md).

---

## 🧊 1. Frozen Provider Protection Compliance

Per repository governance (`ENGINEERING_GOVERNANCE.md`), all existing data provider modules are **100% FROZEN and IMMUTABLE**:
- `GoogleSheetProvider.js`
- `GoogleSheetRefreshService.js`
- `GoogleSheetProviderStatus.js`
- `ProviderRegistry.js`
- `ProviderFactory.js`

`PrimaryHeadlineDataAdapter` acts as a **Thin Adapter** placed strictly inside `modules/primary-headline/adapters/`. It consumes existing providers **ONLY through their public APIs** without modifying, extending, or reformatting a single line of provider code.

---

## 📐 2. Architecture & Data Flow

```
[ GoogleSheetProvider ] (Web-Published CSV / Public API)
          │
          ▼ (fetchPlaylists() ➔ returns ProviderResult)
[ PlaylistModel[] ]
          │
          ▼ (extractHeadlines() ➔ Filters inactive / empty / null items)
[ PrimaryHeadlineDataAdapter ]
          │
          ▼ (loadHeadlines() ➔ Enforces single line & top-to-bottom order)
[ PrimaryHeadlineRuntime ]
```

---

## 🧹 3. Filtering & Editorial Order Rules

1. **Inactive Filtering**: Ignores any playlist marked with `status === 'inactive'`.
2. **Sanitization**: Ignores `null`, `undefined`, empty strings, or whitespace-only headlines.
3. **Editorial Order Preservation**: Preserves top-to-bottom row sequence from the Google Sheet. Headlines are **NEVER randomized**.

---

## 🔄 4. Safe Boundary Hot Reload (HEADLINE_END Contract)

To prevent visual disruption during 24/7 broadcast playback:

1. **Background Polling**: `GoogleSheetRefreshService` polls for CSV changes at the configured interval (e.g. 30s).
2. **Diff Detection**: When a change is detected, `PrimaryHeadlineDataAdapter.scheduleSafeHotReload(newHeadlines)` flags a pending update.
3. **Zero Interruption**: The currently playing headline is **NEVER interrupted mid-animation**.
4. **Boundary Release**: The pending dataset is applied to `PrimaryHeadlineRuntime` **ONLY after `HEADLINE_END` is reached** (when the current headline completes its cycle).

---

## 📊 5. Status Telemetry Passthrough

`adapter.getProviderStatus()` passes through status metrics directly from `GoogleSheetProviderStatus`:

```javascript
const status = adapter.getProviderStatus();
// Returns: { status: 'ONLINE', datasetVersion: 2, playlistCount: 1, totalNewsCount: 4, lastSync: '2026-07-22T10:48:00Z' }
```

---

## 🛡️ 6. Failure Policy & Recovery

- **Startup Failure**: If the initial network connection fails, the adapter traps the error, records failure status, logs a diagnostic warning, and automatically retries background polling.
- **Connection Loss**: If network connectivity drops during live broadcast, the adapter **retains the last valid dataset** and continues looping seamlessly. The screen never goes black or empty.
