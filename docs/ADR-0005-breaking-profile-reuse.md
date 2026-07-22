# 📜 ADR-0005: Breaking News Profile Implemented via Primary Architecture Wrapper

- **Status**: Approved
- **Date**: 2026-07-22
- **Deciders**: AV Media Telangana Engineering Team
- **Technical Scope**: v2.1.0 Breaking News Profile Integration (Task B1-0)

---

## 🎯 Context & Problem Statement

The broadcast kit requires a Breaking News overlay capability to display urgent, high-priority breaking updates with a Red Bar theme and manual operator controls.

Creating a separate rendering engine or copying code from `modules/primary-headline/` would duplicate ~95% of existing code and risk introducing regressions into the verified, zero-clipping Telugu typography calibration (59px Ramabhadra, `translateY(-11px)`).

---

## 💡 Decision Drivers

1. **Zero Code Duplication**: Code must not be copied or duplicated from Primary Headline Engine.
2. **Zero Typography & Motion Regressions**: Preserve 100% of the verified motion timings, center reveal/collapse animations, and optical baseline calibration.
3. **State Isolation**: Primary Headline Engine must retain full ownership of its queue and playback position.

---

## 🏛️ Decision: Implement Breaking News as a Profile Wrapper (`modules/breaking-news/`)

We decide to implement Breaking News in `modules/breaking-news/` **NOT as a duplicate engine**, but as a **Profile Configuration Wrapper** (`BreakingNewsProfile`) that directly imports:
- `PrimaryHeadlineRuntime`
- `PrimaryMotionEngine`
- `PrimaryStaticRenderer`
- `PrimaryTimelinePlaybackController`

```
modules/primary-headline/ (FROZEN ARCHITECTURE)
        ▲
        │ Imports Directly (Zero Duplicate Code)
        │
modules/breaking-news/
        ├── BreakingNewsProfile.js  (Configures profile: 'breaking', Red Bar #DC2626)
        ├── breaking-news.css        (Red Bar theme #DC2626, Primary geometry)
        └── breaking-news.js         (OBS client script with preemption handshake)
```

---

## 🔒 Mandatory Governance Rules

1. **Wrapper Principle**: `modules/breaking-news/` contains NO copies of Primary runtime, renderer, motion, or playback code. It imports frozen Primary modules directly.
2. **Preemption & Release Protocol**: Breaking News communicates with Primary Headline Overlay strictly via `StateEngine` events (`breaking-news:preempt` and `breaking-news:release`).
3. **No Primary Mutation**: Breaking News NEVER mutates Primary queue, playback index, or runtime timeline.
4. **Auto-Resume Guarantee**: Upon operator clicking `■ STOP` or cycle end, Primary automatically resumes playback from its saved position.

---

## 📈 Consequences

### Positive:
- 100% reuse of verified Telugu typography calibration and motion animations.
- Zero risk of code divergence between Primary and Breaking displays.
- Complete state isolation prevents queue corruption or race conditions.

### Negative / Trade-offs:
- Requires OBS overlay event handling for `breaking-news:preempt` and `breaking-news:release`.

---

*ADR-0005 permanently archived for project governance.*
