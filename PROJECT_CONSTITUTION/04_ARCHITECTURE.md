# 04_ARCHITECTURE — Permanent System Architecture Reference

**Status**: Active Governance  
**Version**: 1.0.0  

---

## 1. Architectural Overview

The **AV Media Telangana Broadcast Graphics SDK** is engineered as a modular, event-driven, 60fps real-time broadcast graphics platform. The SDK decouples editorial feed management, operator control interfaces, state synchronization buses, animation engines, and DOM rendering pipelines into distinct architectural layers. This modular design guarantees high reliability, zero state drift, and seamless scalability across diverse lower third, ticker, and breaking news broadcast graphic outputs.

---

## 2. Core Architectural Layers

The architecture is structured into six hierarchical layers with strictly defined, non-overlapping responsibilities:

```
Layer 1: Control Panel       (Operator UI Dock & Editorial Input)
           │
           ▼
Layer 2: State Engine         (Preemption & Event Communication Bus)
           │
           ▼
Layer 3: Runtime Engine       (Playback Sequence & Loop State Machine)
           │
           ▼
Layer 4: Motion Engine        (Stage Execution, Easing & Clip-Path Timing)
           │
           ▼
Layer 5: Renderer             (DOM Node Creation & Typography Layout)
           │
           ▼
Layer 6: OBS Browser Source   (1080p GPU Display Canvas)
```

### Layer Responsibilities:

- **Layer 1: Control Panel**  
  Provides editorial operators with interactive controls (Show Now, Stop, Sync Feed, Manual Overrides) and telemetry monitoring. Emits broadcast command events without mutating runtime engine state directly.

- **Layer 2: State Engine**  
  Serves as the inter-module event bus (`BroadcastChannel`). Manages preemption handshakes, release signals, and cross-tab communication between control docks and on-air overlays.

- **Layer 3: Runtime Engine**  
  Manages item sequencing, circular playback indices, autoloop bounds, and finite state machine transitions (`IDLE ➔ READY ➔ ACTIVE ➔ STOP ➔ IDLE`).

- **Layer 4: Motion Engine**  
  Executes precise animation stages (`BAR_IN`, `TEXT_IN`, `TEXT_HOLD`, `TEXT_OUT`, `BAR_OUT`), managing hardware-accelerated CSS transforms, clip-paths, and optical stage gap separators.

- **Layer 5: Renderer**  
  Constructs and updates physical DOM structures, applying GPU-accelerated styling, typography alignment tokens, and viewport clipping bounds.

- **Layer 6: OBS Browser Source**  
  The ultimate rendering canvas inside OBS Studio's Chromium Embedded Framework (CEF), executing 60fps hardware-accelerated composition at 1920x1080 resolution.

---

## 3. Architectural Principles

1. **Modular Engine Design**  
   Graphic engines are decoupled into reusable runtime, motion, and renderer components, preventing monolithic codebase sprawl.

2. **Profile Reuse**  
   Specialized broadcast graphic themes reuse established core engines via profile wrappers, inheriting verified motion drivers and rendering pipelines.

3. **Runtime Isolation**  
   Each engine maintains its isolated execution loop. An active preemption overlay cannot corrupt or mutate the state of a paused background engine.

4. **Rendering Isolation**  
   DOM node creation and visual updates are strictly isolated within renderer modules. Motion engines manipulate existing DOM handles without re-creating nodes.

5. **Explicit State Machines**  
   All runtime behavior is driven by deterministic finite state machines with explicit transition triggers and guard conditions.

6. **Event-driven Communication**  
   Modules communicate exclusively via asynchronous event messages (`StateEngine`), eliminating direct coupling or global variable dependencies.

7. **GPU-first Rendering**  
   All visual transitions rely strictly on GPU-accelerated CSS properties (`transform: translate3d()`, `clip-path`, `opacity`) to ensure 60fps rendering without layout reflows.

8. **OBS-first Validation**  
   Architectural performance, memory consumption, and visual layout are validated exclusively within the target OBS Studio Browser Source environment.

---

## 4. Engine Taxonomy

The platform categorizes all codebase assets into three distinct engine taxonomies:

### 1. Core Engines
Primary graphics engines (`modules/primary-headline/`, `modules/secondary-playlist/`, `modules/ticker/`) that provide complete runtime orchestration, motion drivers, static renderers, and state machine pipelines.

### 2. Profile Engines
Additive profile wrappers (`modules/breaking-news/`) that import and wrap core engines to apply specialized visual themes (e.g., Red Bar), operator preemption controls, and specific editorial loop behaviors without code duplication.

### 3. Support Services
Shared system infrastructure (`shared/js/`, `shared/css/`, `shared/engines/`) providing cross-cutting capabilities such as Google Sheet data fetching, published CSV parsing, telemetry status tracking, design token variables, and `StateEngine` event buses.

---

## 5. Data Flow Architecture

The data pipeline enforces strict Single Source of Truth (SSOT) data flow from raw feed ingestion to live OBS display:

```
Google Sheets (Published CSV)
          │
          ▼
   DataAdapter / Provider      (Ingestion & Schema Validation)
          │
          ▼
  State Model (SSOT)          (Authoritative Dataset & Revision Counter)
          │
          ▼
   Runtime Engine             (Item Selection & State Machine)
          │
          ▼
   Motion Engine              (Stage Timing & Animation Execution)
          │
          ▼
      Renderer                (DOM Viewport & Typography Placement)
          │
          ▼
 OBS Browser Source           (1080p 60fps On-Air Display)
```

---

## 6. Rendering Philosophy

The rendering pipeline strictly separates five core concerns:

- **Data**: Raw text headlines and metadata ingested from data sources.
- **State**: Authoritative model state, current index, and state machine status.
- **Motion**: Stage timelines, easing functions, and transition durations.
- **Rendering**: DOM structure generation and CSS property mutation.
- **Presentation**: On-air 1080p OBS canvas display.

> **RULE**: No single layer may own or execute another layer's responsibility. Renderers do NOT manage playback index; Motion engines do NOT parse CSV data; Data adapters do NOT manipulate DOM elements.

---

## 7. Broadcast Philosophy

The operational roles across the broadcast stack are strictly segregated:

- **The Control Panel controls.** (Handles operator intent and triggers command events)
- **The Runtime executes.** (Orchestrates playback sequence and handles ring buffer loops)
- **The Motion Engine animates.** (Drives stage timing, clip-path reveals, and optical gaps)
- **The Renderer draws.** (Applies GPU styling and layout placement to DOM nodes)
- **OBS validates.** (Certifies live 60fps render performance and visual clarity)

Each architectural layer has exactly one responsibility and executes it with total isolation.

---

## 8. Extension Rules

1. **Architecture Reuse First**: New broadcast features MUST attempt to reuse existing core engines and profile wrappers before introducing new modules.
2. **Configuration First**: Visual variations (colors, timing presets, font sizing) MUST be expressed through configuration profiles before modifying module code.
3. **New Architecture Only by ADR**: Introducing a new architectural layer, engine category, or data provider requires a formal Architecture Decision Record (ADR) prior to implementation.

---

## 9. Architectural Stability Rule

> **THIS DOCUMENT CHANGES ONLY WHEN SYSTEM ARCHITECTURE CHANGES.**

Feature additions, bug fixes, theme variations, and optical tuning SHALL NOT modify `04_ARCHITECTURE.md`. This reference remains permanent and stable across minor and patch SDK releases.
