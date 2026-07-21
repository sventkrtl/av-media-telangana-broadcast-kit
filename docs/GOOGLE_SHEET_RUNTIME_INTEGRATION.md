# Google Sheet Runtime Integration Architecture

The **Google Sheet Runtime Integration** seamlessly connects `GoogleSheetProvider`, `GoogleSheetRefreshService`, and `GoogleSheetProviderStatus` directly into `SecondaryPlaylistRuntime`.

---

## 🏛️ Integrated Architecture Flow

```text
    [ GoogleSheetProvider ] ◄─────► [ GoogleSheetProviderStatus ]
               │                                   ▲
               ▼                                   │ (Telemetry)
   [ GoogleSheetRefreshService ] ──────────────────┘
   (30s Polling / Diff Engine)
               │
               ▼ (Safe Hot Reload at PLAYLIST_END)
   [ SecondaryPlaylistRuntime ]
               │
               ▼
      [ Playback Controller ] ──► [ Motion & Renderer ]
```

---

## 🔑 Integration Rules & Behavior

1. **Cold Startup Rules**:
   - On runtime boot, if initial Google Sheet CSV fetch succeeds, playlists load and playback starts automatically.
   - If initial fetch fails (e.g. network offline), background polling retries automatically without starting empty playback or crashing.

2. **Zero-Interruption Hot Reload**:
   Updates from Google Sheet are safely held in queue and applied only at the next `PLAYLIST_END` boundary event, preserving live crawls without mid-sentence cuts.

3. **Runtime Telemetry API**:
   `runtime.getProviderStatus()` exposes real-time `status` (`ONLINE`/`OFFLINE`/`SYNCING`/`ERROR`), `lastSync`, `playlistCount`, `newsCount`, and `datasetVersion`.

4. **Graceful Destruction**:
   Calling `runtime.destroy()` cleanly stops background polling timers, clears event hooks, halts playback, and frees all provider resources.
