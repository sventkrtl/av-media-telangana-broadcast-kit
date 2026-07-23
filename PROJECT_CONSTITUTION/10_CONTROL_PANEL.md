# 10_CONTROL_PANEL — Control Panel Architecture Specification

| Metadata Field | Value |
|---|---|
| **Status** | Active Governance |
| **Version** | 1.0.0 |
| **Constitution Layer** | Operator Interface |
| **Authority** | Dock Architecture |
| **Last Updated** | July 23, 2026 |
| **Depends On** | [01_PROJECT_CONSTITUTION.md](01_PROJECT_CONSTITUTION.md), [04_ARCHITECTURE.md](04_ARCHITECTURE.md) |
| **Related Documents** | [05_SDK_REFERENCE.md](05_SDK_REFERENCE.md), [09_GOOGLE_SHEETS.md](09_GOOGLE_SHEETS.md), [11_OBS_RUNTIME.md](11_OBS_RUNTIME.md) |
| **Update Frequency** | Architecture Event |
| **Owner** | AV Media Telangana Broadcast SDK |

---

## 1. Purpose

The **AV Media Control Panel** is the centralized, broadcast-grade operator interface dock for the AV Media Telangana Broadcast Kit. It provides newsroom graphic operators, directors, and technical engineers with a unified, high-reliability control environment to configure editorial feeds, preview graphics off-air, trigger real-time preemption overlays, and monitor system telemetry across all active broadcast graphic engines.

---

## 2. Design Philosophy

The Control Panel architecture is governed by five operational design principles:

1. **Single Operator Interface**: All broadcast graphic engines (Primary Headline, Breaking News, Secondary Playlist, Lower Third, Reporter Cards) are managed from a single, unified web control dock.
2. **Broadcast First**: Interface layouts prioritize immediate operational responsiveness, high visibility, and clear status indicators suitable for high-stress live control room environments.
3. **Operator Friendly**: Workflows minimize cognitive load, eliminating complex technical setup or raw database manipulation during live broadcasts.
4. **One Action ➔ One Result**: Every button click, keyboard shortcut, or toggle trigger produces a deterministic, instantaneous broadcast result without ambiguous multi-step side effects.
5. **Preview before Broadcast**: Feed synchronization and editorial text changes MUST project onto an off-air visual preview card prior to being broadcast live on-air.

---

## 3. Architectural Responsibilities

The Control Panel executes six decoupled operational responsibilities:

- **Operator Input**: Captures manual headline overrides, text edits, tab selections, and action button triggers.
- **Feed Management**: Manages remote Google Sheet published CSV URLs ([09_GOOGLE_SHEETS.md](09_GOOGLE_SHEETS.md)), handles on-demand synchronization triggers, and updates localized persistent settings.
- **Preview Projection**: Projects raw feed headlines onto off-air visual preview observers (`#bn-preview-headline`), ensuring broadcast accuracy before triggering on-air events.
- **Telemetry Monitoring**: Displays active state machine status (`IDLE`/`READY`/`ACTIVE`), provider status (`ONLINE`/`OFFLINE`/`ERROR`), current feed source, monotonically increasing revision counters, and error diagnostics.
- **Broadcast Command Dispatch**: Formats and dispatches preemption commands (`preempt`) and release signals (`release`) across the inter-module event bus (`StateEngine`).
- **State Visualization**: Subscribes as a read-only observer to Single Source of Truth (SSOT) data models, reflecting model state changes in real time without mutating runtime state directly.

---

## 4. Control Flow Architecture

Operational commands flow strictly down a deterministic five-layer control path:

```
Operator Trigger (Click / Shortcut)
       │
       ▼
Control Panel (Event Formatting & Guard Verification)
       │
       ▼
State Engine (BroadcastChannel Inter-Tab Bus)
       │
       ▼
Runtime Engine (State Machine Transition & Playback Index)
       │
       ▼
Renderer (DOM Graphic Assembly & GPU Motion Stage)
       │
       ▼
OBS Browser Source (1080p On-Air GPU Render - [11_OBS_RUNTIME.md](11_OBS_RUNTIME.md))
```

---

## 5. Panel Principles

1. **Single Control Panel**: The repository mandates ONE central Control Panel application dock for all graphic modules.
2. **Module Isolation**: Each graphic engine occupies a dedicated navigation tab scope. Actions inside one module tab SHALL NOT corrupt or interfere with another module's control controls.
3. **Shared Navigation**: A unified navigation sidebar provides seamless switching between graphic module control tabs.
4. **Shared Telemetry**: Standardized telemetry status cards present consistent health metrics across all modules.
5. **Shared Status Model**: State indicators (`IDLE`, `READY`, `ACTIVE`, `SYNCING`, `ONLINE`, `ERROR`) use a common color-coded status language across the entire control interface.

---

## 6. Operator Workflow Rules

All editorial and broadcast operations MUST follow a five-stage sequential workflow:

```
Configuration  ➔  Preview  ➔  Broadcast  ➔  Monitor  ➔  Stop
```

1. **Configuration**: Operator pastes or validates Google Sheet URL / types manual text override.
2. **Preview**: Click "Sync Now" / "Apply Feed" to update off-air preview card and verify accuracy.
3. **Broadcast**: Click "SHOW NOW" to trigger on-air preemption overlay.
4. **Monitor**: Track live state telemetry (`ACTIVE`), cycle counter, and active headline index.
5. **Stop**: Click "STOP" to execute graceful exit motion (`BAR_OUT`) and release primary graphics.

---

## 7. Keyboard Philosophy

To support rapid, error-free operation in live newsrooms, keyboard shortcuts MUST adhere to four rules:

- **Consistent**: Core action keys (e.g., `Ctrl + Enter` for broadcast trigger, `Esc` for stop) perform identical functions across all module tabs.
- **Predictable**: Shortcuts trigger intuitive, immediate actions matching on-screen primary button labels.
- **Module-aware**: Keyboard shortcuts evaluate active tab context to prevent accidental triggering of inactive modules.
- **Non-conflicting**: Shortcuts do not overlap with standard browser navigation or text input editing commands.

---

## 8. Extension Rules

> **FUTURE MODULES SHALL INTEGRATE INTO THE EXISTING CONTROL PANEL. PARALLEL CONTROL PANELS ARE PROHIBITED.**

1. **New Tabs Preferred**: Adding new broadcast graphic engines (Lower Third, Reporter Card - [13_ROADMAP.md](13_ROADMAP.md)) MUST be accomplished by adding a new navigation tab inside the existing Control Panel.
2. **No Parallel Applications**: Creating separate control panel applications, standalone control pages, or un-unified HTML interfaces is strictly forbidden.
3. **Unified Architectural Blueprint**: New module tabs must implement the standardized panel sections (Feed Configuration, Operator Controls, Off-Air Preview, Telemetry Monitor).

---

## 9. Closing Rule

> **THE CONTROL PANEL IS THE SINGLE OPERATIONAL INTERFACE FOR THE BROADCAST SDK.**

The AV Media Control Panel represents the single operational interface connecting newsroom staff to the underlying Broadcast Graphics SDK. It enforces operational safety, visual validation, and unified telemetry, ensuring absolute control over all live broadcast graphic overlays.

---

## Read Next

👉 Proceed to **[11_OBS_RUNTIME.md](11_OBS_RUNTIME.md)** — OBS Runtime Architecture Specification.
