# 11_OBS_RUNTIME — OBS Runtime Architecture Specification

| Metadata Field | Value |
|---|---|
| **Status** | Active Governance |
| **Version** | 1.0.0 |
| **Constitution Layer** | Production Runtime |
| **Authority** | Execution Environment |
| **Last Updated** | July 23, 2026 |
| **Depends On** | [01_PROJECT_CONSTITUTION.md](01_PROJECT_CONSTITUTION.md), [04_ARCHITECTURE.md](04_ARCHITECTURE.md) |
| **Related Documents** | [05_SDK_REFERENCE.md](05_SDK_REFERENCE.md), [08_MOTION_LANGUAGE.md](08_MOTION_LANGUAGE.md), [10_CONTROL_PANEL.md](10_CONTROL_PANEL.md) |
| **Update Frequency** | Architecture Event |
| **Owner** | AV Media Telangana Broadcast SDK |

---

## 1. Purpose

The **OBS Browser Source** execution environment is the ultimate production runtime for the AV Media Telangana Broadcast Kit. It provides the hardware-accelerated 1920x1080 canvas inside OBS Studio's Chromium Embedded Framework (CEF), executing real-time graphic overlays, lower thirds, tickers, and breaking news alerts with broadcast-grade stability, zero visual distortion, and deterministic frame pacing.

---

## 2. Runtime Philosophy

The runtime architecture is built upon five fundamental principles:

1. **OBS First**: OBS Studio Browser Source is the primary target runtime environment. All graphic modules, styling tokens, typography baselines, and motion scripts are designed specifically for CEF execution.
2. **GPU Accelerated**: Visual transitions rely exclusively on GPU-accelerated CSS properties (`transform: translate3d()`, `clip-path`, `opacity`), avoiding CPU reflows or blocking layout recalculations.
3. **Browser Source Runtime**: Overlays run as web applications inside OBS Browser Source instances, communicating with control docks via lightweight inter-process event buses (`BroadcastChannel`).
4. **Deterministic Rendering**: Stage transitions, hold durations, and optical gaps execute in predictable, deterministic sequences governed by explicit state machines.
5. **Production Stability**: The runtime operates continuously without memory leaks, DOM accumulation, or state corruption, ensuring rock-solid stability during extended 24/7 broadcast operations.

---

## 3. Runtime Execution Pipeline

Events and rendering directives traverse a seven-stage execution pipeline:

```
Control Panel (Operator Action / Preempt Command - [10_CONTROL_PANEL.md](10_CONTROL_PANEL.md))
       │
       ▼
State Engine (BroadcastChannel IPC Event Bus)
       │
       ▼
Runtime Engine (State Machine Guard Verification & Index Management)
       │
       ▼
Motion Engine (Stage Timing & Easing Timeline Execution - [08_MOTION_LANGUAGE.md](08_MOTION_LANGUAGE.md))
       │
       ▼
Renderer (DOM Node Construction & Style Property Application)
       │
       ▼
OBS Browser Source (1080p 60fps Chromium CEF Compositor)
       │
       ▼
Viewer (On-Air Program Video Stream Output)
```

---

## 4. Runtime Layer Responsibilities

The execution stack divides operational responsibilities into five isolated layers:

- **Runtime**: Orchestrates dataset index tracking, item sequencing, autoloop bounds, and finite state machine transitions.
- **Renderer**: Assembles and updates physical DOM structures, applying typography offsets, color theme tokens, and clipping bounds.
- **Motion**: Executes precise stage timelines (`BAR_IN`, `TEXT_IN`, `TEXT_HOLD`, `TEXT_OUT`, `BAR_OUT`), managing animation easing and optical stage separators ([08_MOTION_LANGUAGE.md](08_MOTION_LANGUAGE.md)).
- **State**: Provides isolated, immutable Single Source of Truth (SSOT) data models and tracks dataset revision counters.
- **OBS**: Provides the physical 1920x1080 GPU rendering canvas, composite video blending, and program stream output.

---

## 5. Rendering Principles

1. **Deterministic Rendering**: Graphic stage transitions MUST produce identical visual results regardless of system load or execution timing.
2. **No Hidden State**: Runtimes MUST NOT store application state in DOM elements, closure hacks, or unmonitored variables.
3. **GPU-first Animation**: Animating properties other than GPU-accelerated transforms, clip-paths, and opacity is strictly prohibited.
4. **Runtime Isolation**: Each overlay engine executes in its isolated runtime scope; an active preemption engine cannot corrupt background engine state.
5. **Presentation Separation**: Business logic, data parsing, and state management MUST remain completely separate from presentation layout and DOM manipulation.

---

## 6. Runtime Validation Framework

The repository enforces a clear separation of testing and validation responsibilities:

- **Unit Tests Validate Logic**: Automated unit test suites verify dataset parsing, state machine transitions, diff detectors, and model integrity.
- **Browser Testing is Supportive**: Standard desktop browser testing provides preliminary developer feedback during initial layout design.
- **OBS Validates Presentation**: **OBS Studio Browser Source is the ONLY authoritative visual validation environment.** No graphic layout, typography baseline, or motion animation is certified for production without visual inspection and screenshot validation inside live OBS Studio.

---

## 7. Runtime Stability Rules

To maintain broadcast-grade reliability, all graphic modules MUST conform to five stability rules:

1. **No Frame Drops**: Animations must execute smoothly at 60fps without layout thrashing, micro-stutters, or dropped frames.
2. **No Layout Drift**: Container dimensions, viewport bounds, and background plates must remain locked to their calibrated pixel geometry.
3. **No Typography Drift**: Text elements must preserve their calibrated font size (`59px`), line-height, and vertical alignment offsets (`translateY(-11px)`) across all render cycles.
4. **No State Corruption**: Index tracking and state machine status must remain strictly synchronized, avoiding duplicate triggers or skipped items.
5. **Graceful Recovery**: Network disconnections, missing spreadsheet feeds, or invalid inputs MUST be trapped safely, maintaining current graphics on-air without crashing or clearing the overlay canvas.

---

## 8. Future Runtime Extensions

> **FUTURE MODULES SHALL EXECUTE INSIDE THE SAME RUNTIME ARCHITECTURE. PARALLEL RUNTIMES ARE PROHIBITED.**

1. **Shared Runtime Architecture**: All upcoming graphic engines (Lower Third, Reporter Cards - [13_ROADMAP.md](13_ROADMAP.md)) MUST adopt the established Runtime ➔ Motion ➔ Renderer ➔ OBS architecture.
2. **No Custom Engines**: Creating standalone rendering frameworks, introducing unvetted graphics libraries, or bypassing the `StateEngine` IPC bus is strictly forbidden.

---

## 9. Closing Rule

> **OBS BROWSER SOURCE IS THE AUTHORITATIVE PRODUCTION RUNTIME FOR THE BROADCAST GRAPHICS SDK.**

The OBS Browser Source runtime guarantees that every broadcast graphic overlay delivered by the AV Media Telangana Broadcast Kit executes with absolute optical precision, visual stability, and broadcast-grade reliability on live television.

---

## Read Next

👉 Proceed to **[12_ADR_INDEX.md](12_ADR_INDEX.md)** — Architecture Decision Record Master Registry.
