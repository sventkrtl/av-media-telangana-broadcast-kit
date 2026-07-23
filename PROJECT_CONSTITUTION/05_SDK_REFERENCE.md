# 05_SDK_REFERENCE — Broadcast Graphics SDK Reference Manual

| Metadata Field | Value |
|---|---|
| **Status** | Active Governance |
| **Version** | 1.0.0 |
| **Constitution Layer** | Reference |
| **Authority** | Framework Specification |
| **Last Updated** | July 23, 2026 |
| **Depends On** | [04_ARCHITECTURE.md](04_ARCHITECTURE.md) |
| **Related Documents** | [06_FROZEN_MODULES.md](06_FROZEN_MODULES.md), [08_MOTION_LANGUAGE.md](08_MOTION_LANGUAGE.md), [11_OBS_RUNTIME.md](11_OBS_RUNTIME.md) |
| **Update Frequency** | Static |
| **Owner** | AV Media Telangana Broadcast SDK |

---

## 1. SDK Overview

The **Broadcast Graphics SDK** is the core foundational framework providing reusable execution engines, state synchronization buses, rendering abstractions, and data ingestion services for the AV Media Telangana Broadcast Kit. Its primary purpose is to deliver a standardized, broadcast-grade graphics infrastructure that powers diverse lower third, ticker, breaking news, and newsroom control panel modules with 60fps rendering efficiency and zero architectural duplication.

---

## 2. Core SDK Components

The SDK exposes twelve core functional components that govern broadcast graphic operations:

| Component | Responsibility | Lifecycle |
|---|---|---|
| **Control Panel** | Provides operator dock interface, manual triggers, and live telemetry projections ([10_CONTROL_PANEL.md](10_CONTROL_PANEL.md)) | Persistent User Session |
| **State Engine** | Manages inter-module event communication, preemption handshakes, and release signals | Persistent Event Loop |
| **Runtime Engine** | Orchestrates playback sequencing, item index tracking, and state machine transitions | Continuous / On-Demand Loop |
| **Motion Engine** | Executes stage timing (`BAR_IN`, `TEXT_IN`, `TEXT_HOLD`, `TEXT_OUT`, `BAR_OUT`), easing, and optical gaps ([08_MOTION_LANGUAGE.md](08_MOTION_LANGUAGE.md)) | Stage Execution Duration |
| **Renderer** | Constructs and updates DOM node hierarchies, applying GPU styling and geometry bounds | Active Rendering Session |
| **Data Adapter** | Ingests, validates, and transforms external datasets into internal Single Source of Truth models ([09_GOOGLE_SHEETS.md](09_GOOGLE_SHEETS.md)) | On Initialization / Sync |
| **Configuration Engine** | Resolves environment settings, theme variables, polling intervals, and canvas presets | Application Startup |
| **Animation Engine** | Provides GPU-accelerated CSS transform keyframes and hardware animation primitives | Active Transition |
| **Theme Engine** | Applies visual style profiles, color tokens, background plates, and theme classes | Module Initialization |
| **Font Engine** | Manages font loading, Telugu script rendering baseline offsets, and typography bounds | Engine Startup |
| **Audio Engine** | Triggers audio stings, transition sound effects, and volume level controls | Stage Transition |
| **API Engine** | Exposes external control interfaces, WebSocket command receivers, and remote RPC bridges | Background Daemon |

---

## 3. Profile Engine Definition

A **Profile Engine** is an additive, lightweight wrapper that configures and reuses core SDK components to present a specialized visual graphic output or operational workflow. Profile Engines DO NOT implement independent rendering pipelines or custom state machines from scratch; instead, they compose existing core SDK primitives.

### Profile Engine Concepts & Responsibilities:

- **Primary Headline Profile**: Manages continuous multi-headline lower third sequences with vibrant corporate blue styling, standard autoloop timing, and automatic dataset refresh handling.
- **Breaking News Profile**: Reuses headline runtime and motion drivers to wrap urgent news items in a red theme plate, executing manual operator preemption (`SHOW NOW` / `STOP`), persistent backing plate lifecycle, and symmetrical horizontal text reveals.
- **Lower Third Profile**: Composes renderer and animation drivers to present dynamic dual-line name titles, reporter designations, and location tags on demand.
- **Reporter Card Profile**: Configures specialized graphic badges and station identification tags anchored to live broadcast video streams.

---

## 4. Shared Services

The SDK relies on six standardized background support services:

1. **Google Sheets Service**: Fetches published CSV datasets, auto-detects tab names and GID indices, and validates schema constraints ([09_GOOGLE_SHEETS.md](09_GOOGLE_SHEETS.md)).
2. **OBS Browser Source Service**: Interfaces with Chromium Embedded Framework (CEF), enforcing 1920x1080 resolution bounds and 60fps GPU hardware acceleration ([11_OBS_RUNTIME.md](11_OBS_RUNTIME.md)).
3. **WebSocket Service**: Listens for remote broadcast control events, external automation triggers, and multi-room command synchronization.
4. **BroadcastChannel Service**: Drives local browser inter-tab communication, ensuring instant preemption and release handshakes between control panels and on-air overlays.
5. **Telemetry Service**: Monitors system health, active feed sources, revision counters, dataset versions, and error diagnostics in real time.
6. **Configuration Service**: Persists non-sensitive user preferences (e.g., sheet URLs) across sessions while preventing transient state persistence.

---

## 5. Engine Lifecycle Contract

All profile engines and graphics modules follow a strict sequential lifecycle contract:

```
Operator Trigger (Control Panel)
       │
       ▼
State Engine (Preempt / Release Event)
       │
       ▼
Runtime Engine (State Machine & Index Transition)
       │
       ▼
Motion Engine (Stage Timing & Easing Drivers)
       │
       ▼
Renderer (DOM Node Styling & Clip-Path Reveal)
       │
       ▼
OBS Browser Source (1080p On-Air GPU Render)
```

---

## 6. SDK Extension Policy

1. **Reuse First**: Future graphic modules MUST attempt to reuse existing SDK components before introducing new code abstractions.
2. **Configuration First**: Visual themes, color schemes, timing offsets, and typography scaling MUST be achieved by passing parameters to existing SDK drivers rather than rewriting engine logic.
3. **ADR Required for Primitives**: Introducing a new Core SDK Component (e.g., a new rendering engine paradigm or database provider) requires a formal Architecture Decision Record ([12_ADR_INDEX.md](12_ADR_INDEX.md)) prior to implementation.

---

## 7. Stability Rule

> **SDK COMPONENTS ARE LONG-LIVED; PROFILE ENGINES EVOLVE; THE SDK REMAINS STABLE.**

Core SDK Components represent immutable broadcast infrastructure. While new Profile Engines and visual graphic themes may be added to expand broadcast capabilities, Core SDK interfaces remain backward-compatible, stable, and protected against architectural drift.

---

## Read Next

👉 Proceed to **[06_FROZEN_MODULES.md](06_FROZEN_MODULES.md)** — Frozen Module Registry.
