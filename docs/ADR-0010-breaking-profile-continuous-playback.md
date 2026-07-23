# ADR-0010: Breaking Profile Continuous Circular Playback Behavior

* **Status:** Accepted
* **Date:** 2026-07-23
* **Context:** Task B1-2D — Breaking Profile Continuous Playback Until Manual STOP
* **Authors:** AV Media Telangana Architecture Team

---

## Context

In television broadcast operations, urgent breaking news announcements must continuously loop on-screen through all items in the Breaking Profile feed until the broadcast operator explicitly terminates the broadcast by clicking **■ STOP**.

Previously, the profile wrapper executed a single headline cycle and stopped automatically. This behavior did not match live broadcast requirements.

---

## Architectural Decision

1. **Continuous Circular Playback**:
   - Upon operator `🔴 SHOW NOW`, the Breaking Profile enters `ACTIVE` state and begins continuous circular playback (ring buffer) through all active headlines in `BreakingFeedModel`.
   - When a headline completes (`HEADLINE_END`), the queue index automatically advances to `(selectedIndex + 1) % headlines.length`.
   - When wrapping from the last headline back to index 0, playback continues seamlessly without operator interaction.

2. **Single Source of Truth (SSOT) Model Ownership**:
   - `BreakingFeedModel` remains the sole, authoritative owner of `headlines[]` and `selectedIndex`. `BreakingNewsProfile` reads directly from `BreakingFeedModel` via getters (`next()`, `currentHeadline`) without maintaining duplicate state arrays.

3. **Operator Control & STOP Behavior**:
   - Playback SHALL run indefinitely until the operator presses **■ STOP**.
   - Pressing **■ STOP** terminates playback immediately, resets `selectedIndex = 0` on `BreakingFeedModel`, hides the overlay, and emits `breaking-news:release` so the Primary Headline Engine automatically resumes from its paused position.

4. **Duplicate SHOW NOW Protection**:
   - Clicking `SHOW NOW` while `ACTIVE` is safely ignored and MUST NOT reset the queue or restart playback.

---

## Logging & Auditing

- **Headline Advance**:
  ```text
  [Playback]
  Revision: <rev>
  Selected Index: <idx> / <total>
  Headline Finished
  Next Index: <nextIdx>
  Next Headline: <headline>
  ```
- **Queue Wrap**:
  ```text
  [Playback]
  Revision: <rev>
  Selected Index: 1 / <total>
  End of Queue
  Restarting from index 0
  ```
- **Manual STOP**:
  ```text
  [Playback]
  Manual STOP received
  Queue terminated
  Primary resumed
  ```

---

## Consequences

* **Positive**: Aligns Breaking Profile 100% with live broadcast operations, eliminates manual re-triggering overhead, and maintains strict SSOT state model integrity.
* **Non-impacted Components**: Preserves all frozen Primary Headline Engine, Secondary Playlist Engine, and Google Sheet provider components without regression.
