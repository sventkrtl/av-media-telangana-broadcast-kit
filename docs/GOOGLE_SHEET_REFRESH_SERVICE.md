# Google Sheet Refresh Service Architecture (Auto Refresh & Hot Reload)

The **Google Sheet Refresh Service** monitors web-published Google Sheet CSV endpoints for real-time updates and triggers zero-interruption hot reloads at safe playlist boundaries.

---

## 🏛️ Ingestion & Hot Reload Flow

```text
       [ Published Google Sheet CSV ]
                     │
                     ▼
       [ GoogleSheetRefreshService ]
  (15s / 30s / 60s / Manual Polling Interval)
                     │
                     ▼
          [ Deep Diff Detection ]
      (Compares Labels, Themes & News)
                     │
                     ▼
        [ Safe Hot Reload Boundary ]
    (Waits for PLAYLIST_END Completion)
                     │
                     ▼
           [ Live Runtime Update ]
```

---

## 🔑 Key Service Features

1. **Configurable Polling Intervals**:
   Supports `15s`, `30s` (Default), `60s`, and `Manual (0)` polling schedules.

2. **Deep Diff Change Detection**:
   Compares incoming CSV parsed models against the current active dataset. If identical, zero runtime overhead is incurred.

3. **Zero-Interruption Safe Hot Reload**:
   Never restarts playback or cuts off news mid-crawl. New playlist data is applied only when the current playlist completes (`PLAYLIST_END`).

4. **Network Error Resilience**:
   In the event of HTTP timeouts or temporary CSV formatting errors, polling retries automatically without stopping active broadcasting.
