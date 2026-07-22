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

---

## 🗂️ 7. Google Sheet Tab (GID) Resolution Strategy

> **This section is the authoritative specification for the GID probe order.**
> If this logic ever changes in code, update this section immediately.

### Background

The Primary Headline Google Sheet contains **multiple tabs** (each with a different `gid` parameter):

| GID | Tab Purpose | Columns |
|-----|-------------|---------|
| `gid=0` | Summary / Dashboard | `Item, Description, Version, ...` |
| `gid=1` | **Primary Headlines Feed** | `Order, Active, Priority, Headline, Repeat` |
| `gid=2` | Secondary Playlist Feed | `Active, Theme, Label, Priority, Order, News` |
| `gid=3+` | Reserved / future use | — |

The adapter does **not** require the operator to know the correct `gid`. It auto-detects the correct tab using a structured probe sequence.

### Probe Order (authoritative)

```
Operator pastes ANY Google Sheet URL (edit / share / export)
    │
    ▼ normalizeGoogleSheetUrl() → converts to export?format=csv base URL
    │
    ├── Try gid=1 ← PRIMARY CANDIDATE (Primary Headline tab in standard sheet layout)
    │       └── If 'Headline' column found AND active rows > 0 → ✅ USE THIS
    │
    ├── Try gid=0 ← FALLBACK (default tab — usually Summary)
    │       └── If 'Headline' column found AND active rows > 0 → ✅ USE THIS
    │
    ├── Try gid=2 ← FALLBACK (usually Secondary Playlist tab)
    │       └── If 'Headline' column found AND active rows > 0 → ✅ USE THIS
    │
    └── Try gid=3 ← LAST RESORT
            └── If 'Headline' column found AND active rows > 0 → ✅ USE THIS

If no tab returns headlines → return [] (zero headlines, retain last valid dataset)
```

### Why gid=1 First?

The standard AV Media Telangana editorial sheet layout places the Primary Headlines
feed on the **second tab (gid=1)**. Probing gid=1 first avoids unnecessary network
requests in the common case.

The probe order is: `1 → 0 → 2 → 3`.

### Schema Detection

A tab is considered a valid "Primary Headline tab" if its CSV header row contains
a column matching any of: `headline`, `text`, `news`, `content`.

Active rows are filtered using the `Active` column (`FALSE`/`false`/`0`/`inactive`/`disabled` = excluded).

### Operator Note

The operator can paste **any URL format** into the Control Panel Sheet URL field:
- `https://docs.google.com/spreadsheets/d/...../edit?usp=sharing` ← standard share link ✅
- `https://docs.google.com/spreadsheets/d/...../pub?output=csv` ← published CSV ✅
- `https://docs.google.com/spreadsheets/d/...../export?format=csv&gid=1` ← direct CSV ✅

All formats are normalized by `GoogleSheetProvider.normalizeGoogleSheetUrl()` before probing.

---

## 🔀 8. Two-Strategy Fetch Architecture

`connectGoogleSheet()` uses a two-strategy pattern to maximize compatibility across
different sheet formats:

```
connectGoogleSheet(url)
    │
    ├── STRATEGY 1: fetchHeadlinesCsvDirect()  ← Primary strategy
    │       │
    │       ├── normalizeGoogleSheetUrl(url)
    │       ├── Probe gid=1 → _parsePrimaryHeadlineCsv()
    │       ├── Probe gid=0 → _parsePrimaryHeadlineCsv()
    │       ├── Probe gid=2 → _parsePrimaryHeadlineCsv()
    │       ├── Probe gid=3 → _parsePrimaryHeadlineCsv()
    │       └── Return first result with headlines.length > 0
    │           → Load runtime → Start background poll loop
    │
    └── STRATEGY 2: GoogleSheetProvider.fetchPlaylists()  ← Fallback
            │
            ├── Returns PlaylistModel[] (Secondary Playlist format)
            ├── extractHeadlines() → flattens items[].news from playlists
            └── Used when sheet has Secondary Playlist format (Label + News columns)
```

**Strategy 1** handles the Primary Headline sheet format (`Headline` column, no `Label` column).

**Strategy 2** is the legacy fallback for sheets structured in Secondary Playlist format.

Background polling in **Strategy 1** also uses `fetchHeadlinesCsvDirect()` directly
(not the `GoogleSheetRefreshService` timer) to maintain format consistency.

---

## 🔮 9. Future Naming Note — PrimaryHeadlineSheetResolver

> *This note is for future reference. No code change is required now.*

The current method `fetchHeadlinesCsvDirect()` is accurate but tied to the CSV format.

As the system evolves, future data sources may include:
- JSON REST APIs
- Firebase Firestore real-time listeners
- WebSocket editorial feeds

When that refactor happens, consider renaming:

| Current | Proposed Future |
|---------|-----------------|
| `fetchHeadlinesCsvDirect()` | `PrimaryHeadlineSheetResolver.resolve()` |
| `_parsePrimaryHeadlineCsv()` | `CsvHeadlineParser.parse()` |
| `_parseCsvRow()` | (internal to `CsvHeadlineParser`) |

A `PrimaryHeadlineSheetResolver` interface would abstract over CSV / JSON / REST / Firestore,
allowing the adapter to remain unchanged when the data transport changes.

This refactor is planned for **v2.0 (Primary Headline Engine v2)** — not required for v1.0.0 freeze.

---

*Document last updated: P1-8 (Control Panel Integration) + GID Resolution Fix — commit `5f970a3`*
