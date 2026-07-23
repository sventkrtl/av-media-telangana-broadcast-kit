# 08_MOTION_LANGUAGE — Broadcast Motion Language Specification

| Metadata Field | Value |
|---|---|
| **Status** | Active Governance |
| **Version** | 1.0.0 |
| **Constitution Layer** | Motion Specification |
| **Authority** | Visual Motion Standard |
| **Last Updated** | July 23, 2026 |
| **Depends On** | [01_PROJECT_CONSTITUTION.md](01_PROJECT_CONSTITUTION.md), [04_ARCHITECTURE.md](04_ARCHITECTURE.md) |
| **Related Documents** | [05_SDK_REFERENCE.md](05_SDK_REFERENCE.md), [06_FROZEN_MODULES.md](06_FROZEN_MODULES.md), [11_OBS_RUNTIME.md](11_OBS_RUNTIME.md) |
| **Update Frequency** | Architecture Event |
| **Owner** | AV Media Telangana Broadcast SDK |

---

## 1. Motion Language Purpose

A unified **Broadcast Motion Language** guarantees that all dynamic graphic overlays, lower thirds, tickers, and breaking news alerts across the AV Media Telangana Broadcast Kit share a cohesive visual cadence, optical elegance, and broadcast-grade urgency. The motion specification eliminates haphazard visual effects, establishing standard animation primitives and stage execution rules that maintain brand identity across all live broadcasts.

---

## 2. Motion Philosophy

The motion language is governed by five foundational design philosophies:

1. **Broadcast First**: Every animation is engineered specifically for 60fps GPU execution in OBS Studio and professional broadcast hardware without frame drops or jitter.
2. **Readability over Decoration**: Motion exists to guide the viewer's focal attention and enhance text legibility; decorative or distracting visual effects are strictly forbidden.
3. **Motion Supports Information**: Animation timing and stage transitions must emphasize editorial priority and headline hierarchy rather than showing off graphic mechanics.
4. **Consistency over Novelty**: Standardized transition stages (`TEXT_IN`, `TEXT_HOLD`, `TEXT_OUT`) create an intuitive, recognizable visual rhythm across every news broadcast.
5. **Measured Reality > Theory**: Motion curves, transition durations, and stage gaps MUST be calibrated under actual live broadcast rendering conditions at viewing distances.

---

## 3. Motion Identity

Each graphic engine owns a single, distinct **Motion Identity** that uniquely characterizes its broadcast function:

- **Primary Headline Identity**: Standard full-width lower third transition sequence with clean vertical scale-in and horizontal expansion, designed for continuous multi-headline editorial cycles.
- **Breaking News Identity**: Preemption overlay featuring a persistent red backing plate with symmetrical horizontal text expansion from center-out (`clip-path`) and collapse back to center, communicating breaking news urgency.
- **Lower Third Identity**: Dynamic dual-tier title reveal combining synchronized horizontal slide and opacity fade for dynamic speaker designations and location tags.
- **Reporter Card Identity**: Anchor badge reveal with smooth slide-in and static hold drivers, identifying on-air reporters and field correspondents.

---

## 4. Motion Primitives

The motion specification defines nine foundational motion primitives that compose all broadcast graphic transitions:

1. **`BAR_IN`**: Initial stage expanding the background plate or container graphic onto the canvas.
2. **`TEXT_IN`**: Transition stage revealing headline text or graphic glyphs within the viewport.
3. **`TEXT_HOLD`**: Static hold stage preserving full opacity and visibility for optical reading.
4. **`TEXT_OUT`**: Transition stage collapsing or fading text out of the viewport.
5. **`BAR_OUT`**: Final stage collapsing the background plate or container off the canvas.
6. **Reveal**: Symmetrical or directional expansion mechanism (`clip-path` or `transform`) opening a graphic viewport.
7. **Collapse**: Symmetrical or directional contraction mechanism closing a graphic viewport.
8. **Persistent Plate**: Operational mode where background plates remain continuously visible across headline transitions, avoiding redundant bar animation.
9. **Optical Separator**: Calibration gap inserted between consecutive text transitions to provide perceptual visual breathing space and eliminate text collision.

---

## 5. Motion Lifecycle

Motion execution flows strictly down a deterministic five-tier lifecycle pipeline:

```
Operator Trigger (Control Panel / Automation - [10_CONTROL_PANEL.md](10_CONTROL_PANEL.md))
       │
       ▼
Runtime Engine (State Machine Stage Selection)
       │
       ▼
Motion Engine (Easing Drivers & Timeline Execution)
       │
       ▼
Renderer (GPU Transform & Clip-Path Property Application)
       │
       ▼
Viewer (On-Air Optical Perception - [11_OBS_RUNTIME.md](11_OBS_RUNTIME.md))
```

---

## 6. Motion Calibration

1. **OBS is Authoritative**: All animation curves, easing profiles, and clip-path reveals MUST be inspected and calibrated inside OBS Studio ([11_OBS_RUNTIME.md](11_OBS_RUNTIME.md)).
2. **Production-Calibrated Values Override Theoretical Values**: Values validated under live broadcast viewing conditions take supreme precedence over initial design mockups or theoretical recommendations.
3. **Mandatory Live Broadcast Validation**: No motion profile is approved for production without real-time visual verification and optical clarity certification.

---

## 7. Motion Freeze Policy

> **MOTION BECOMES IMMUTABLE AFTER PRODUCTION FREEZE.**

Once a graphic engine enters Production Freeze ([06_FROZEN_MODULES.md](06_FROZEN_MODULES.md)), its motion identity, easing curves, stage progression, and calibrated optical stage gaps are locked. Only authorized bug fixes (e.g., resolving an animation promise hang) are permitted. Visual tuning or motion changes require initiating a new major version (`v3.0.0+`).

---

## 8. Future Motion Extensions

1. **Reuse Motion Primitives**: Future graphic engines SHALL compose existing motion primitives (`BAR_IN`, `TEXT_IN`, `TEXT_HOLD`, `TEXT_OUT`, `BAR_OUT`, Persistent Plate, Optical Separator) before introducing custom animations.
2. **Configuration-First**: Velocity adjustments or orientation shifts MUST be achieved via configuration parameters passed to existing motion drivers.
3. **ADR Required for New Primitives**: Introducing a new motion primitive (e.g., a 3D GPU flip or particle sting) requires a formal Architecture Decision Record ([12_ADR_INDEX.md](12_ADR_INDEX.md)) prior to implementation.

---

## 9. Closing Statement

> **MOTION LANGUAGE IS A PERMANENT BROADCAST IDENTITY, NOT AN ANIMATION LIBRARY.**

The Motion Language Specification ensures that the AV Media Telangana Broadcast Kit maintains visual authority, optical clarity, and professional broadcast polish across all past, present, and future graphic overlays.

---

## Read Next

👉 Proceed to **[09_GOOGLE_SHEETS.md](09_GOOGLE_SHEETS.md)** — Google Sheets Integration Specification.
