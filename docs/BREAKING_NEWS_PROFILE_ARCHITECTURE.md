# 🚨 Breaking News Profile Architecture & Foundation Specification (Task B1-0)

This document describes the design, profile reuse strategy, runtime ownership rules, manual trigger lifecycle, and frozen dependency matrix for **Breaking News Profile v2.1.0**.

Strictly adheres to [`PRIMARY_HEADLINE_ENGINE_SPEC.md`](../PRIMARY_HEADLINE_ENGINE_SPEC.md) v1.0 & [`ENGINEERING_GOVERNANCE.md`](../ENGINEERING_GOVERNANCE.md).

---

## 🧊 1. Profile Wrapper Principle & Frozen Module Protection

> **CRITICAL RULE**: `modules/breaking-news/` is **NOT** a new rendering engine directory.
> It is a lightweight **Profile Wrapper** that imports `PrimaryHeadlineRuntime`, `PrimaryMotionEngine`, `PrimaryStaticRenderer`, and `PrimaryTimelinePlaybackController` directly from `modules/primary-headline/`.
> **Zero code is duplicated or copied from the primary headline engine.**

Per repository governance (`ENGINEERING_GOVERNANCE.md`), all existing Primary Headline Engine modules are **100% FROZEN and IMMUTABLE**:
- `modules/primary-headline/runtime/PrimaryHeadlineRuntime.js`
- `modules/primary-headline/motion/PrimaryMotionEngine.js`
- `modules/primary-headline/renderer/PrimaryStaticRenderer.js`
- `modules/primary-headline/playback/PrimaryTimelinePlaybackController.js`
- `modules/primary-headline/HeadlineTimelineBuilder.js`
- `modules/primary-headline/HeadlineStateMachine.js`
- `modules/primary-headline/primary-headline.css`
- `modules/primary-headline/index.html`

---

## 📐 2. Profile Reuse Strategy & Configuration Matrix

| Subsystem / Property | Primary Headline Profile | Breaking News Profile Wrapper |
|-----------------------|--------------------------|-------------------------------|
| **Theme ID** | `primary` | `breaking` |
| **Bar Background Color** | 🔵 `#1E3A8A` (Vibrant Corporate Blue) | 🔴 `#DC2626` (Urgent Crimson Red) |
| **Text Color** | `#FFFFFF` (White) | `#FFFFFF` (White) |
| **Typography** | `59px` Ramabhadra, `translateY(-11px)` | `59px` Ramabhadra, `translateY(-11px)` |
| **Geometry** | Y: 890px, Height: 135px, Width: 1920px | Y: 890px, Height: 135px, Width: 1920px |
| **Motion FX & Timing** | Center Reveal / Center Collapse | Center Reveal / Center Collapse |
| **Trigger Mechanism** | Continuous Auto Loop | **Manual Operator Trigger** |
| **Broadcast Priority** | Normal | **Highest (Preempts Screen)** |

---

## 🔒 3. Runtime Ownership & State Isolation Rules

To eliminate state corruption and race conditions between continuous Primary playback and on-demand Breaking updates:

```
Primary Headline Engine
        │
        │ owns Queue, Timeline, Playback Index, Runtime State
        ▼
Breaking News Profile Wrapper
        │
        ├── Requests Preemption via StateEngine
        ├── NEVER edits Primary state
        ├── NEVER changes Primary queue
        └── Releases control after STOP / Hide
```

### Mandated Architectural Boundaries:
1. **Primary State Protection**: Breaking Profile is strictly **FORBIDDEN** from mutating `PrimaryHeadlineRuntime` internal state, resetting index, or modifying its timeline.
2. **Queue Isolation**: Primary Headline Engine retains full ownership of its editorial dataset. Breaking Profile maintains its own isolated headline buffer.
3. **Preemption Handshake**:
   - Operator clicks `🔴 SHOW NOW` ➔ Breaking Profile emits `breaking-news:preempt`.
   - Primary Headline Overlay traps `breaking-news:preempt`, gracefully completes current animation boundary, saves current position, and pauses playback.
   - Breaking Overlay reveals with Red Bar theme (`#DC2626`).
4. **Release Handshake**:
   - Operator clicks `■ STOP` ➔ Breaking Profile executes `BAR_OUT` collapse and emits `breaking-news:release`.
   - Primary Headline Overlay traps `breaking-news:release` and automatically resumes playback from its saved position.

---

## 🎮 4. Manual Trigger Lifecycle

```
[ Operator Click: 🔴 SHOW NOW ]
               │
               ▼
   Emit `breaking-news:preempt`
               │
               ▼ (Primary Pauses)
   Init Red Bar Viewport (#DC2626)
               │
               ▼
   Execute Motion: BAR_IN ➔ TEXT_IN ➔ HOLD
               │
   ┌───────────┴───────────┐
   ▼                       ▼
[ Single Cycle End ]   [ Operator Click: ■ STOP ]
   │                       │
   └───────────┬───────────┘
               ▼
   Execute Motion: TEXT_OUT ➔ BAR_OUT
               │
               ▼
   Emit `breaking-news:release`
               │
               ▼
   Primary Auto-Resumes Seamlessly
```

---

## ⚡ 5. Breaking Priority Rule (Race Condition Prevention)

When Breaking Profile is active:
- Primary background timers (`setInterval`/`setTimeout`), auto-fetch boundaries, and loop iterators are **locked out / ignored**.
- Only Breaking Profile owns the screen canvas.
- Background dataset sync events occurring during Breaking playback are queued safely until `breaking-news:release` is emitted.

---

## 📊 6. Frozen Dependency Matrix

| Component | Class / File | Status |
|-----------|--------------|--------|
| Runtime Orchestrator | `PrimaryHeadlineRuntime` | ❄️ Imported Directly |
| Motion Engine | `PrimaryMotionEngine` | ❄️ Imported Directly |
| Static Renderer | `PrimaryStaticRenderer` | ❄️ Imported Directly |
| Playback Controller | `PrimaryTimelinePlaybackController` | ❄️ Imported Directly |
| Data Provider | `GoogleSheetProvider` | ❄️ Immutable Provider |
| Refresh Service | `GoogleSheetRefreshService` | ❄️ Immutable Service |
| Profile Wrapper | `BreakingNewsProfile` | 🔴 Additive Wrapper |
| Thin Adapter | `BreakingNewsDataAdapter` | 🔴 Additive Adapter |
| Red Overlay CSS | `breaking-news.css` | 🔴 Additive Stylesheet |

---

## 📜 7. Breaking Profile Feed Scope Rule

To maintain clear architectural boundaries and prevent scope creep:

> **CONSTITUTIONAL RULE**:
> - Breaking Profile **SHALL NOT** read from Breaking Queue.
> - Breaking Profile **SHALL** consume only its own dedicated editorial feed.
> - Breaking Queue is an independent editorial workflow and is strictly **outside the scope** of Breaking Profile v1.x (planned for v3.x).

### Architectural Scope Boundaries:
- **v1.x Scope**: Single-item / dedicated feed Breaking Profile with manual operator trigger (`🔴 SHOW NOW` / `■ STOP`).
- **v3.x Scope**: Multi-item Breaking Queue Management workflow.

---

## 📊 8. Breaking Profile Google Sheet Feed Specification (Task B1-1)

### Dedicated Feed Tab Name & Schema

The Breaking News Profile consumes its feed exclusively from a dedicated Google Sheet tab:

- **Tab Name**: `Breaking Profile`
- **Standard GID**: `gid=3`

#### Schema:
`| Order | Active | Priority | Headline | Repeat |`

| Column | Data Type | Required | Description |
|--------|-----------|----------|-------------|
| **Order** | Integer | Optional | Sorting order (1, 2, 3...) |
| **Active** | Boolean | Required | `TRUE`/`FALSE` or `1`/`0` filter |
| **Priority** | Integer | Optional | Headline priority rating |
| **Headline** | String | Required | Urgent Telugu/English breaking headline text |
| **Repeat** | Boolean/Int | Optional | Repeat count or repeat flag |

*Note*: No `Label`, `Theme`, `District`, or `Category` columns are required or consumed.

### Strict Resolution Sequence & Zero Fallback Rule

```
Operator Pastes Google Sheet URL
    │
    ▼
1. Try Tab Name: sheet=Breaking Profile (or sheet=Breaking+Profile)
    │
    ├── Found AND Schema Valid AND Active Rows > 0 ➔ ✅ USE THIS
    │
    ▼
2. Try Configured Breaking GID: gid=3 (or explicit user Breaking GID)
    │
    ├── Found AND Schema Valid AND Active Rows > 0 ➔ ✅ USE THIS
    │
    ▼
3. STOP & RETURN ERROR (0 Headlines, Provider Status: ERROR)
   ❌ DO NOT FALLBACK TO PRIMARY (GID 1) OR SECONDARY (GID 2) TABS!
```

### Feed Independence & Architecture Isolation Rules:
1. **No Engine Fallback**: If the `Breaking Profile` tab is missing, unparseable, or contains zero active rows, `BreakingNewsDataAdapter` MUST return `0 Headlines` with `status: ERROR`. It MUST NEVER read from Primary (`gid=1`) or Secondary (`gid=2`) tabs.
2. **No Breaking Queue Reading**: Breaking Profile SHALL NOT consume or read from Breaking Queue (deferred to v3.x).

---

## 🎛️ 9. Control Panel Workflow & Operator Lifecycle (Task B1-2)

### Two-Step Editorial Workflow

To enforce broadcast safety:
> **CONSTITUTIONAL RULE**:
> **Breaking feed synchronization SHALL NEVER trigger an on-air event automatically.**

```
1. Feed Config / Sync:
   Google Sheet URL ➔ Click "Apply Feed" / "Sync Now" ➔ Update Preview Card ➔ WAIT (Off-Air)

2. Broadcast Trigger:
   Click "🔴 SHOW NOW" (or Ctrl+Enter) ➔ Emit `breaking-news:preempt` ➔ Red Bar On-Air (Primary Pauses)

3. Release Broadcast:
   Click "■ STOP" (or Esc) ➔ Emit `breaking-news:release` ➔ Red Bar Out (Primary Auto-Resumes)
```

### Manual Headline Override:
- Textarea allows typing an urgent manual headline.
- Clicking `SHOW NOW (Manual)` broadcasts the manual headline immediately without overwriting the Google Sheet feed.
- Clicking `CLEAR` empties the textarea and resets the preview card.

### Telemetry & Safeguards:
- **Telemetry Monitor**: State (`Idle`/`Active`), Last Trigger Time, Feed Status (`ONLINE`/`OFFLINE`/`ERROR`), Current Source (`Google Sheet`/`Manual`).
- **Duplicate Safeguard**: Clicking `SHOW NOW` while already active safely rejects duplicate triggers.
- **Idle Safeguard**: Clicking `STOP` while already idle is safely ignored.
- **Keyboard Shortcuts**: `Ctrl + Enter` (SHOW NOW), `Esc` (STOP) when `🔴 Breaking Profile` tab is active.
- **Persistence**: Persists `av_media_breaking_sheet_url` in `localStorage` ONLY. Manual text, active state, and sessions are never persisted.

---

## 🏛️ 10. Single Source of Truth (SSOT) Architecture (Task B1-2C)

To prevent state drift, UI race conditions, and synchronization bugs, Breaking Profile state follows a strict **Single Source of Truth (SSOT)** model owned by `BreakingFeedModel`.

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

### Core Architecture Rules:

1. **State Ownership**:
   - `BreakingFeedModel` (`modules/breaking-news/models/BreakingFeedModel.js`) is the single authoritative owner of all Breaking Profile state (`headlines[]`, `selectedIndex`, `currentHeadline`, `feedSource`, `providerStatus`, `state`, `lastSync`, `lastError`, `revision`).
   - `BreakingFeedModel` is module-scoped within the Breaking Profile module. It MUST NOT be attached to the global `window` object or imported by un-isolated external engines.

2. **Unidirectional Data Flow**:
   - Data flows strictly: **Data Source ➔ BreakingFeedModel ➔ UI Projection / Runtime Consumer**.
   - **DOM Nodes are Presentation Only**: Visual UI elements (`#bn-preview-headline`) subscribe to `BreakingFeedModel` as read-only observers. DOM elements are **NEVER** read as application state or runtime inputs.

3. **State Machine & Auditing**:
   - Explicit state transitions utilize `transitionTo(targetState)` (`IDLE` | `READY` | `ACTIVE`).
   - Every model mutation increments a monotonically increasing `revision` counter for complete broadcast trace auditing.

---

## 🔄 11. Continuous Circular Playback Behavior (Task B1-2D)

To match broadcast operations, Breaking Profile executes continuous circular playback (ring buffer) until manually stopped by the operator.

```
[ Operator Click: 🔴 SHOW NOW ]
               │
               ▼
       Headline 1 (4 sec)
               │
               ▼
       Headline 2 (4 sec)
               │
               ▼
       ... Last Headline
               │
               ▼ (Wrap to Index 0)
       Headline 1 (Loop Forever)
               │
   [ Operator Click: ■ STOP ]
               │
               ▼
      selectedIndex = 0
               │
               ▼
      Hide Overlay & Resume Primary
```

### Mandated Continuous Playback Rules:

1. **Circular Queue Rotation**:
   - Every `HEADLINE_END` automatically advances `selectedIndex` to `(selectedIndex + 1) % headlines.length`.
   - Wrapping to index 0 logs `[Playback] End of Queue` and continues playback seamlessly.
2. **Manual STOP Authority**:
   - The operator is the ONLY authority that can stop playback.
   - Clicking **■ STOP** terminates playback, resets `selectedIndex = 0` on `BreakingFeedModel`, and releases Primary.
3. **Duplicate Protection**:
   - Clicking `SHOW NOW` while `ACTIVE` is ignored to prevent queue resets or motion glitches.

---

## 📺 12. Persistent Breaking Bar Playback Profile (Task B1-2E)

To match professional newsroom lower-third standards, the Breaking Profile operates with a **Persistent Backing Plate**:
- `BAR_IN` executes **ONLY ONCE** when the operator triggers `🔴 SHOW NOW`.
- The urgent Red Bar (`#DC2626`) remains 100% visible on screen during the entire Breaking session.
- Individual headlines cycle using **text-only transitions** (`TEXT_IN ➔ TEXT_HOLD ➔ TEXT_OUT`).
- `BAR_OUT` executes **ONLY ONCE** when the operator triggers **■ STOP**.

```
SHOW NOW
      │
      ▼
BAR_IN (Executed ONCE)
      │
──────────────────────────────
TEXT_IN ➔ TEXT_HOLD ➔ TEXT_OUT (Headline 1)
──────────────────────────────
TEXT_IN ➔ TEXT_HOLD ➔ TEXT_OUT (Headline 2)
──────────────────────────────
TEXT_IN ➔ TEXT_HOLD ➔ TEXT_OUT (Headline 3)
──────────────────────────────
(Continuous Circular Loop)
──────────────────────────────
STOP
      │
TEXT_OUT (Current Headline if visible)
      │
BAR_OUT (Executed ONCE)
      │
IDLE ➔ Primary Resume
```

### Persistent Bar Rules & State Machine:
1. **State Lifecycle**: `IDLE` ➔ `SHOW NOW` ➔ `BAR_VISIBLE` ➔ `ACTIVE_TEXT_LOOP` ➔ `STOP` ➔ `IDLE`.
2. **Persistent Bar Output**: `BAR_IN` activates the Red Bar plate (`Persistent Bar : ON`); `BAR_OUT` is NEVER called between headlines while in `ACTIVE_TEXT_LOOP`.
3. **Clean STOP & Double Animation Safeguard**: If `STOP` is triggered during `TEXT_IN` or `TEXT_HOLD`, `TEXT_OUT` executes once before `BAR_OUT`. If `STOP` is triggered when `TEXT_OUT` has already completed, `BAR_OUT` executes directly without duplicating `TEXT_OUT`.
4. **Logging Format**:
   - On `BAR_IN`: `[Playback]\n\nBAR_IN\n\nPersistent Bar : ON`
   - On Headline Transition: `[Playback]\n\nHeadline Complete\n\nNext Headline\n\nTEXT_IN only.`
   - On `BAR_OUT`: `[Playback]\n\nManual STOP\n\nExecuting final TEXT_OUT\n\nExecuting BAR_OUT\n\nPersistent Bar : OFF\n\nPrimary Resume`

### Primary vs Breaking Motion Language Comparison Matrix

| Feature | Primary Profile Engine | Breaking News Profile |
|---|---|---|
| **BAR_IN** | Every Headline | Once per Session |
| **TEXT_IN** | Every Headline | Every Headline |
| **BAR_OUT** | Every Headline | STOP only |
| **Stage Separator** | None | **70ms Optical Separator (Production Calibrated)** |
| **Trigger** | Automatic Loop | Manual Operator Trigger |
| **Stop** | Automatic | Manual Operator STOP |
| **Theme Color** | Slate Blue (`#1E3A8A`) | Red Bar (`#DC2626`) |

---

## 🔒 13. Production Optical Separator Calibration & Module Freeze (v2.1.0)

### Optical Separator Progression & Validation:
- **Design Value**: `50ms`
- **Engineering Recommendation**: `60ms`
- **Production-Calibrated Final Value**: `70ms`
- **Rationale**: Validated in live OBS Browser Source at broadcast viewing distance. Provides the best perceptual separation between consecutive Telugu headlines without reducing Breaking News urgency (*Measured Reality > Theoretical Recommendation*).

### Frozen Production Assets (v2.1.0):
- ✅ Typography (`59px` Ramabhadra, `translateY(-11px)`)
- ✅ Optical Baseline (`135px` Height, `Y: 890px`)
- ✅ Persistent Backing Plate (`BAR_IN` once on trigger, `BAR_OUT` once on STOP)
- ✅ Symmetrical Horizontal Reveal (`clip-path: inset(0 50% 0 50%) ➔ inset(0 0% 0 0%)`)
- ✅ Single Source of Truth (`BreakingFeedModel` authoritative model)
- ✅ Continuous Playback (`(selectedIndex + 1) % headlines.length`)
- ✅ Manual STOP & Preempt/Release Handshake (`StateEngine`)
- ✅ 70ms Optical Separator (Production Calibrated)

---

*Document version: v2.7.0 (B1-2G Production Freeze & 70ms Optical Calibration).*




