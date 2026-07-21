# Google Sheet Provider Health & Status Architecture

The **Google Sheet Provider Health & Status Monitor** tracks real-time operational state, telemetry metrics, and failure diagnostics for Google Sheet data ingestion.

---

## 🏛️ Health State Matrix

```text
    [ SYNCING ] ──(Success)──> [ ONLINE ]
         │                        │
      (Failure)                (3x Consecutive Failures)
         │                        │
         ▼                        ▼
     [ ERROR ] ──────────────> [ OFFLINE ]
```

---

## 🔑 Telemetry API Contract (`getStatus()`)

The `getStatus()` API returns a standardized health JSON object:

- `status`: Operational state (`ONLINE` | `OFFLINE` | `SYNCING` | `ERROR`).
- `lastSync`: ISO 8601 timestamp of last successful sync.
- `pollInterval`: Polling interval in ms (e.g. `30000`).
- `csvUrl`: Current published CSV web URL.
- `playlistCount`: Count of active parsed playlists.
- `newsCount`: Total count of active headlines across all playlists.
- `datasetVersion`: Monotonically increasing version counter.
- `lastError`: Last recorded error diagnostic string (or `null`).
- `failureCount`: Consecutive failure counter.
