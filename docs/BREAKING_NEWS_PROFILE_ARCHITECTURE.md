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

*Document version: v2.1.0 Foundation (B1-0).*
