# ADR-0009: Single Source of Truth (SSOT) Architecture for Breaking Profile

* **Status:** Accepted
* **Date:** 2026-07-23
* **Context:** Task B1-2C — Breaking Profile Single Source of Truth Refactor
* **Authors:** AV Media Telangana Architecture Team

---

## Context

Prior to this architectural update, state for the Breaking News Profile was implicitly duplicated across the Google Sheet Feed, Control Panel memory variables, DOM element nodes (such as `#bn-preview-headline`), and WebSocket event payloads. When `SHOW NOW` was triggered, reading string data directly from DOM nodes (`previewElement.textContent`) risked state drift, UI race conditions, and synchronization bugs.

To achieve production-grade stability for broadcast operations, the application state must follow a **Single Source of Truth (SSOT)** model. The DOM MUST NEVER serve as an application data store.

---

## Architectural Flow Diagram

```
Google Sheet / Manual Entry
            │
            ▼
   BreakingFeedModel      ← Single Source of Truth (SSOT)
            │
            ├─────────────────► Preview Card (Visual Projection / Observer)
            │
            └─────────────────► SHOW NOW
                                  │
                                  ▼
                         Runtime.showNow()
                                  │
                                  ▼
                         OBS Broadcast Overlay
```

---

## Decision Principles

1. **State Ownership**:
   - `BreakingFeedModel` is the sole, authoritative owner of Breaking Profile application state (`headlines[]`, `selectedIndex`, `currentHeadline`, `feedSource`, `providerStatus`, `state`, `lastSync`, `lastError`, `revision`).
   - The model is strictly module-scoped within `modules/breaking-news/models/BreakingFeedModel.js` and MUST NOT be instantiated as a global window object.

2. **Unidirectional Data Flow**:
   - Data flows strictly from Data Source ➔ `BreakingFeedModel` ➔ Projections/Consumers.
   - **DOM is Presentation Only**: The Preview Card DOM node (`#bn-preview-headline`) subscribes to `BreakingFeedModel` as a read-only visual projection. DOM nodes are NEVER read as inputs for state or runtime execution.

3. **Runtime Injection**:
   - Operator actions (`SHOW NOW`) read directly from `BreakingFeedModel.currentHeadline`.
   - The exact headline string logged by `[BreakingFeedModel]`, `[SHOW NOW]`, and `[Runtime]` is guaranteed to be identical via the shared SSOT snapshot.

4. **State Machine Transitions**:
   - Explicit State Machine transitions use `BreakingFeedModel.transitionTo(state)` with valid target states (`IDLE`, `READY`, `ACTIVE`).
   - Every mutation increments the monotonically increasing `revision` counter for absolute auditing.

---

## Consequences

* **Positive**: Eliminates state drift, prevents DOM reading race conditions, enforces clean module isolation, and guarantees auditability via `revision` tracking.
* **Non-impacted Components**: Preserves all frozen Primary Headline Engine, Secondary Playlist Engine, and Google Sheet provider components without regression.
