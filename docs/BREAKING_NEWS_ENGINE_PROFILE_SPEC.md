# 🚨 Breaking News Engine Architecture & Profile Specification (v1.0)

This specification defines the architectural design of the **Breaking News Engine** as a **Configuration-based Profile Reuse** of the production-tested, frozen **Primary Headline Engine (v1.0.0)**.

---

## 🏛️ 1. Core Architectural Principle: Twin Profile Model

The Breaking News Engine is **NOT** a new codebase, nor is it a code clone.

It is a **Profile Variant** of the Primary Headline Engine Architecture.

```
                  ┌──────────────────────────────────────────────┐
                  │    Primary Headline Engine Architecture      │
                  │ (Runtime, Motion, Renderer, Playback, CSV)   │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
     ┌───────────────────────┐                       ┌───────────────────────┐
     │    Primary Profile    │                       │   Breaking Profile    │
     ├───────────────────────┤                       ├───────────────────────┤
     │  Bar Color: Blue      │                       │  Bar Color: Red       │
     │  Trigger: Auto Loop   │                       │  Trigger: Manual      │
     │  Priority: Normal     │                       │  Priority: Highest    │
     │  Auto-Resume: Self    │                       │  Preempts Primary     │
     └───────────────────────┘                       └───────────────────────┘
```

---

## ⚙️ 2. Configuration & Parameter Matrix

| Property | Primary Headline Profile | Breaking News Profile |
|----------|--------------------------|-----------------------|
| **Theme ID** | `primary` | `breaking` |
| **Bar Background Color** | 🔵 `#1E3A8A` (Always Blue) | 🔴 `#DC2626` (Always Red) |
| **Text Color** | `#FFFFFF` (Always White) | `#FFFFFF` (Always White) |
| **Typography Size** | `59px` (Ramabhadra) | `59px` (Ramabhadra) |
| **Optical Baseline** | `translateY(-11px)` | `translateY(-11px)` |
| **Viewport Placement** | Y = 890px, Height = 135px | Y = 890px, Height = 135px |
| **Motion Timing & FX** | Center Reveal / Center Collapse | Center Reveal / Center Collapse |
| **Trigger Mechanism** | Continuous Auto-Loop | **Manual Operator Trigger** |
| **Preemption Behavior** | Yields to Breaking News | **Preempts Primary Engine** |
| **Data Provider** | Google Sheet / Manual Text | Google Sheet / Manual Text |

---

## 🎮 3. Control Panel & Manual Operator Trigger Contract

Unlike Primary Headline which loops automatically upon payload apply, Breaking News is strictly **Operator-Triggered**:

```
[ Primary Headline Tab ]          [ Breaking News Tab ]
  ⚡ Apply & Go Live                 🔴 SHOW NOW    (Triggers Breaking Animation)
                                     ■  STOP        (Hides Breaking & Auto-Resumes Primary)
```

### State Behavior Sequence:
1. **Idle State**: Primary Headline Engine is running normally in auto-loop.
2. **Operator Clicks 🔴 SHOW NOW**:
   - `StateEngine` emits `breaking-news:trigger` message.
   - Primary Headline Engine receives preemption signal and gracefully pauses at safe boundary.
   - Breaking News Engine reveals using Red Bar styling (`#DC2626`).
3. **Operator Clicks ■ STOP** (or single cycle completes):
   - Breaking News Engine executes collapse animation (`BAR_OUT`).
   - Primary Headline Engine automatically resumes playback from where it was paused.

---

## 🔒 5. Engine Ownership & State Isolation Rule

To guarantee long-term system stability and zero queue corruption, the following constitution rule is strictly enforced:

```
Primary Headline Engine
        │
        │ owns the timeline & queue
        ▼
Breaking News Engine
        │
        ├── Requests Preemption
        ├── Never edits Primary state
        ├── Never changes Primary queue
        └── Releases control after STOP
```

### Mandated Architectural Boundaries:
- **No Direct Mutation**: Breaking Engine is strictly **FORBIDDEN** from mutating `PrimaryHeadlineRuntime` internal state.
- **No Queue Manipulation**: Breaking Engine **NEVER** alters, clears, inserts into, or reorders the Primary Headline queue.
- **No Index Reset**: Breaking Engine **NEVER** resets the Primary Headline playback index.
- **Preemption Contract**: Breaking Engine sends a read-only `preempt` event via `StateEngine`. Primary Headline Engine trap this event, saves its internal progress, executes `BAR_OUT`, and enters a `PREEMPTED_PAUSE` state.
- **Release Contract**: Upon `STOP` or manual hide, Breaking Engine emits a `release` event. Primary Headline Engine traps this, restores its saved state, and seamlessly resumes execution from where it paused.

---

## 🧊 6. Frozen Dependency Matrix

| Component / Subsystem | Source Engine | Status / Reuse Contract |
|-----------------------|---------------|-------------------------|
| **Runtime Engine** | Primary Headline | ❄️ Reused (`PrimaryHeadlineRuntime.js`) |
| **Motion Engine** | Primary Headline | ❄️ Reused (`PrimaryMotionEngine.js`) |
| **Static Renderer** | Primary Headline | ❄️ Reused (`PrimaryStaticRenderer.js`) |
| **Playback Controller** | Primary Headline | ❄️ Reused (`PrimaryTimelinePlaybackController.js`) |
| **Typography System** | Primary Headline | ❄️ Reused (`59px` Ramabhadra, `translateY(-11px)`) |
| **Geometry & Viewport** | Primary Headline | ❄️ Reused (Y = 890px, Height = 135px) |
| **Bar Theme Styling** | Breaking News | 🔴 New Configuration (`#DC2626` Red) |
| **Trigger Mechanism** | Breaking News | 🔴 New Configuration (Manual `🔴 SHOW NOW` / `■ STOP`) |

---

## 🧩 7. Software Engineering Rationale

1. **Zero Layout / Glyph Regressions**: By using the exact same rendering and motion code, Telugu glyph rendering, zero-clipping guarantee (59px / -11px), and layout boundaries are 100% preserved.
2. **Maintenance Simplicity**: Bug fixes or performance improvements made to the core rendering/motion engine instantly benefit both Primary and Breaking engines.
3. **Enterprise Stability**: Configuration reuse guarantees that battle-tested code is reused in production without introducing new runtime bugs.

---

*Specification approved for v2.1.0 Sprint.*
