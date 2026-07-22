# 📜 ADR-0008: Breaking Profile Control Panel Integration & Two-Step Editorial Workflow

- **Status**: Approved
- **Date**: 2026-07-22
- **Deciders**: AV Media Telangana Engineering Team
- **Technical Scope**: v2.1.0 Breaking News Profile OBS Control Panel Integration (Task B1-2)

---

## 🎯 Context & Problem Statement

The Breaking News Profile requires an intuitive Control Panel interface for broadcast operators. Unlike the Primary Headline Engine (which auto-loops continuously), Breaking News items are urgent, manual-trigger broadcasts that preempt Primary content on-demand.

A key editorial concern is broadcast safety: syncing a new Google Sheet feed or editing a headline must never automatically trigger an on-air event without explicit operator confirmation.

---

## 💡 Decision Drivers

1. **Two-Step Editorial Workflow Rule**:
   > **CONSTITUTIONAL RULE**:
   > **Breaking feed synchronization shall never trigger an on-air event automatically.**
2. **Explicit Operator Action**:
   - `Apply Feed` / `Sync Now` saves the feed configuration, parses the active headlines, and updates the **Preview Card** without sending data to air.
   - `SHOW NOW` is required to emit `breaking-news:preempt` and bring the Red Bar headline on-air.
   - `STOP` emits `breaking-news:release` to hide Breaking and auto-resume Primary playback.
3. **Manual Operator Override**:
   - Allows typing an urgent manual headline in a dedicated textarea.
   - Bypasses Google Sheet temporarily for instant operator entry without overwriting Google Sheet data.
4. **State Safeguards**:
   - Pressing `SHOW NOW` while Breaking is already active rejects duplicate triggers safely without crashing or resetting timers.
   - Pressing `STOP` while Breaking is idle is ignored safely.

---

## 🏛️ Decision: Two-Step UI Flow Contract

```
Google Sheet URL Input
       │
       ▼
Click "Apply Feed" / "Sync Now"
       │
       ▼
Fetch & Parse Feed ➔ Update Preview Card ➔ WAITS FOR OPERATOR (Off-Air)
       │
       ▼
Click "🔴 SHOW NOW" (or Ctrl+Enter)
       │
       ▼
Emit `breaking-news:preempt` ➔ Red Bar On-Air ➔ Primary Pauses
       │
       ▼
Click "■ STOP" (or Esc)
       │
       ▼
Emit `breaking-news:release` ➔ Red Bar Out ➔ Primary Auto-Resumes
```

---

## 🔒 Keyboard Shortcuts

- `Ctrl + Enter`: Triggers `SHOW NOW` (when `🔴 Breaking Profile` tab is active).
- `Esc`: Triggers `STOP` (when `🔴 Breaking Profile` tab is active).

---

## 📈 Consequences

### Positive:
- **Maximum Broadcast Safety**: Zero risk of unverified headlines or feed syncs accidentally airing.
- **Clear Operator Lifecycle**: Explicit control over sync, preview, trigger, and release.
- **Manual Override Capability**: Instant manual broadcast without disturbing Google Sheet sources.

### Negative / Trade-offs:
- Requires two button clicks (`Apply Feed` then `SHOW NOW`) instead of a single auto-live action. (Chosen deliberately for broadcast safety).

---

*ADR-0008 permanently archived for project governance.*
