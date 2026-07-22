# 📜 ADR-0004: Breaking News Implemented as Primary Profile Reuse

- **Status**: Approved
- **Date**: 2026-07-22
- **Deciders**: AV Media Telangana Engineering Team
- **Technical Scope**: v2.1.0 Breaking News Integration

---

## 🎯 Context & Problem Statement

The broadcast graphics kit requires a **Breaking News** capability to interrupt regular primary headlines with urgent, high-priority breaking updates (rendered with a Red Bar theme and manual operator controls).

Initial naive approaches suggested building a brand-new "Breaking News Engine" codebase or duplicating the Primary Headline Engine. However, building a separate engine introduces risk:
- Duplication of complex motion timing and clip-path animation code.
- Potential re-emergence of Telugu glyph clipping bugs.
- Maintenance overhead of synchronizing two independent rendering runtimes.

---

## 💡 Decision Drivers

1. **Zero Layout & Glyph Regressions**: Primary Headline Engine v1.0.0 is production-tested and frozen with zero-clipping guarantees (59px Ramabhadra, `translateY(-11px)` optical offset).
2. **Architecture Reuse**: Avoid duplicate codebase maintenance.
3. **Execution Reliability**: Configuration-based profile switching is inherently safer than multi-engine orchestration.

---

## 🏛️ Decision: Implement Breaking News as a Profile Variant (`Breaking News Profile`)

We decide to implement Breaking News **NOT as a new engine codebase**, but as a **Profile Configuration Variant** (`Breaking News Profile`) of the frozen Primary Headline Engine architecture.

### Architecture Summary:

```
Primary Headline Engine (v1.0.0 Architecture)
        │
        ├── Primary Profile  (Blue Bar #1E3A8A, Auto-Loop Trigger, Yields Control)
        └── Breaking Profile (Red Bar #DC2626, Manual Trigger 🔴 SHOW NOW / ■ STOP, Preempts Screen)
```

Both profiles share **100% identical**:
- `PrimaryHeadlineRuntime.js`
- `PrimaryMotionEngine.js`
- `PrimaryStaticRenderer.js`
- `PrimaryTimelinePlaybackController.js`
- Viewport geometry (Y = 890px, Height = 135px) and typography rules

---

## ⚡ Key Rules & Contracts

1. **Engine Ownership Rule**: Primary Headline Engine owns the timeline and queue. Breaking Profile requests preemption via `StateEngine` and never directly mutates Primary state, queue, or index.
2. **Breaking Priority Rule**: When Breaking Profile is active, all Primary background timers, loops, and auto-schedulers are locked out to prevent race conditions.
3. **Control Handshake**: Upon `■ STOP`, Breaking Profile releases screen ownership, and Primary Profile automatically resumes execution from its paused state.

---

## 📈 Consequences

### Positive:
- **Zero Regression Risk**: Uses 100% production-tested rendering and motion code.
- **Fast Development Cycle**: Reuses ~95% of existing architecture.
- **Single Source of Truth**: Improvements to core motion/rendering benefit both Primary and Breaking displays simultaneously.

### Negative / Trade-offs:
- Requires strict event preemption handling in `StateEngine` to ensure clean pause/resume handshakes without race conditions.

---

*ADR-0004 permanently archived for project governance.*
