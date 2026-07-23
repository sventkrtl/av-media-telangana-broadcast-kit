# ADR-0011: Persistent Breaking Bar Playback Profile Behavior

* **Status:** Accepted
* **Date:** 2026-07-23
* **Context:** Task B1-2E — Persistent Breaking Bar Playback Profile
* **Authors:** AV Media Telangana Architecture Team

---

## Context

In professional television broadcast newsroom operations, lower-third graphic overlays for breaking announcements use a **Persistent Backing Plate** design pattern.

Previously, each headline in a Breaking feed executed full entrance and exit animations for the background plate (`BAR_IN ➔ TEXT_IN ➔ HOLD ➔ TEXT_OUT ➔ BAR_OUT`). This caused unnecessary visual repetition as the Red Bar repeatedly collapsed and re-expanded between items.

---

## Architectural Decision

1. **Persistent Red Bar Lifecycle**:
   - `BAR_IN` executes **ONLY ONCE** upon operator `🔴 SHOW NOW`.
   - State Machine transitions: `IDLE` ➔ `BAR_VISIBLE` ➔ `ACTIVE_TEXT_LOOP` ➔ `STOP` ➔ `IDLE`.
   - The Red Bar (`#DC2626`) remains 100% visible on screen throughout the entire active Breaking session.
   - `BAR_OUT` is **NEVER** called between headlines while in `ACTIVE_TEXT_LOOP`.

2. **Text-Only Headline Transitions**:
   - Headlines cycle continuously using text-only stages: `TEXT_IN (300ms) ➔ TEXT_HOLD (4000ms) ➔ TEXT_OUT (300ms)`.
   - When a headline finishes `TEXT_OUT`, `BreakingFeedModel.next()` advances to the next item, and `TEXT_IN` begins immediately for the next headline without disturbing the persistent Red Bar.

3. **Single BAR_OUT on Manual STOP**:
   - When operator clicks **■ STOP**:
     - If text is currently in `TEXT_IN` or `TEXT_HOLD`, `TEXT_OUT` executes once.
     - `BAR_OUT` executes **ONLY ONCE** at the end of the Breaking session.
     - Overlay resets to transparent `IDLE` state, `selectedIndex` resets to 0, and `breaking-news:release` handshake is emitted to automatically resume Primary Engine.

4. **Zero Impact on Frozen Engines**:
   - No modifications to `PrimaryMotionEngine`, `PrimaryStaticRenderer`, `PrimaryHeadlineRuntime`, or `GoogleSheetProvider`.
   - `BreakingNewsProfile` orchestrates motion stages via `this.runtime.motionEngine.play(stage)`.

---

## Consequences

- **Positive**: Matches broadcast newsroom lower-third graphics standards with zero visual flicker or repetitive bar animations between headlines.
- **Positive**: Clean state machine with explicit `BAR_VISIBLE` and `ACTIVE_TEXT_LOOP` states.
- **Positive**: Single Source of Truth (`BreakingFeedModel`) remains preserved.
