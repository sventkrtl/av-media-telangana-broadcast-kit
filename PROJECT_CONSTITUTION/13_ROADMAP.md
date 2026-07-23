# 13_ROADMAP — Constitutional Roadmap & Module Registry

| Metadata Field | Value |
|---|---|
| **Status** | Active Governance |
| **Version** | 1.0.0 |
| **Constitution Layer** | Roadmap |
| **Authority** | Strategic Direction |
| **Last Updated** | July 23, 2026 |
| **Depends On** | [01_PROJECT_CONSTITUTION.md](01_PROJECT_CONSTITUTION.md), [02_PROJECT_STATE.md](02_PROJECT_STATE.md) |
| **Related Documents** | [06_FROZEN_MODULES.md](06_FROZEN_MODULES.md), [07_GOVERNANCE.md](07_GOVERNANCE.md), [14_PROJECT_HISTORY.md](14_PROJECT_HISTORY.md) |
| **Update Frequency** | Milestone Event |
| **Owner** | AV Media Telangana Broadcast SDK |

---

## 1. Purpose

The **Constitutional Roadmap** establishes the strategic engineering direction, module progression hierarchy, and expansion governance for the AV Media Telangana Broadcast Graphics SDK. It defines the structured roadmap for expanding newsroom graphics capabilities while protecting core architectural stability and frozen production modules.

---

## 2. Roadmap Philosophy

Roadmap execution is anchored in five governing principles:

1. **Broadcast Platform Evolution**: System expansion progresses sequentially from foundational news tickers and lower thirds to comprehensive channel branding suites.
2. **Module-first Growth**: Features are introduced strictly as discrete, well-defined broadcast graphic modules with isolated execution scopes.
3. **SDK-first Reuse**: Every new module MUST maximize code reuse, importing existing core SDK runtimes, motion drivers, and rendering primitives ([05_SDK_REFERENCE.md](05_SDK_REFERENCE.md)).
4. **Freeze before Expansion**: A module MUST complete full OBS Studio validation and reach Production Freeze status ([06_FROZEN_MODULES.md](06_FROZEN_MODULES.md)) before team resources expand to the next major graphic engine.
5. **Configuration before Architecture**: New graphic styles, color variations, and timing presets MUST be implemented via configuration profiles before creating new code abstractions.

---

## 3. Module Lifecycle

Every broadcast graphic module in the SDK progresses through a seven-phase lifecycle:

```
Idea
 │
 ▼
Planning
 │
 ▼
Architecture (ADR & Schema Definition - [12_ADR_INDEX.md](12_ADR_INDEX.md))
 │
 ▼
Implementation
 │
 ▼
OBS Validation (1080p 60fps CEF Visual Inspection - [11_OBS_RUNTIME.md](11_OBS_RUNTIME.md))
 │
 ▼
Production Acceptance (PAT Stress Testing)
 │
 ▼
Freeze (Git Release Tag & Registry Lock - [06_FROZEN_MODULES.md](06_FROZEN_MODULES.md))
```

---

## 4. Module Registry

The table below catalogs every current, active, and planned broadcast graphic module within the SDK ecosystem:

| Module | Target Version | Current Status | Category |
|---|---|---|---|
| **Secondary Playlist Engine** | `v2.0.0` | ❄️ **Frozen** | Core Engine |
| **Primary Headline Engine** | `v1.0.0` | ❄️ **Frozen** | Core Engine |
| **Breaking News Profile** | `v2.1.0` | ❄️ **Frozen** | Profile Engine |
| **Lower Third Engine** | `v2.2.0` | 🛠️ **In Planning (Next)** | Core Engine |
| **Reporter Card Engine** | `v2.3.0` | 🛠️ **Planned** | Profile Engine |
| **Clock Engine** | `v2.4.0` | 🛠️ **Planned** | Utility Engine |
| **Logo Engine / Live Bug** | `v2.5.0` | 🛠️ **Planned** | Utility Engine |
| **Live Indicator** | `v2.6.0` | 🛠️ **Planned** | Utility Engine |
| **Weather Engine** | `v2.7.0` | 🛠️ **Planned** | Data Engine |
| **Future Ecosystem Modules** | `v3.0.0+` | 🛠️ **Unplanned** | Ecosystem Engine |

---

## 5. Expansion Rules

Future broadcast graphic engines MUST adhere to four expansion mandates:

- **Reuse SDK**: Utilize core SDK components (`shared/js/`, `shared/css/`, `shared/engines/`) for data parsing, state tracking, and helper utilities.
- **Reuse Motion**: Compose existing motion primitives (`BAR_IN`, `TEXT_IN`, `TEXT_HOLD`, `TEXT_OUT`, `BAR_OUT`, Reveal, Collapse - [08_MOTION_LANGUAGE.md](08_MOTION_LANGUAGE.md)) before authoring custom animations.
- **Reuse Runtime**: Execute within the established `Runtime ➔ Motion ➔ Renderer ➔ OBS` architecture ([04_ARCHITECTURE.md](04_ARCHITECTURE.md)).
- **Reuse Control Panel**: Integrate new module controls into the central AV Media Control Panel as a new navigation tab ([10_CONTROL_PANEL.md](10_CONTROL_PANEL.md)); creating parallel control applications is prohibited.
- **ADR Approval Required**: Introducing new core abstractions, data provider paradigms, or IPC protocols requires an approved Architecture Decision Record ([12_ADR_INDEX.md](12_ADR_INDEX.md)).

---

## 6. Freeze Governance

> **NO NEW MODULE BEGINS PRODUCTION UNTIL THE CURRENT MODULE REACHES PRODUCTION ACCEPTANCE.**

1. **Sequential Focus**: Team resources and AI engineering agents SHALL concentrate on one active module sprint at a time.
2. **Constitutional Assets**: Once a module reaches Production Freeze ([06_FROZEN_MODULES.md](06_FROZEN_MODULES.md)), it becomes an immutable constitutional asset. It is protected against visual drift, architecture drift, or non-essential modification.

---

## 7. Roadmap Maintenance

Upon achieving a major milestone or transitioning a module to Production Freeze, the following constitutional documents MUST be updated in lockstep:

- **[02_PROJECT_STATE.md](02_PROJECT_STATE.md)** (Dynamic active state and milestone status)
- **[13_ROADMAP.md](13_ROADMAP.md)** (Module registry status and active sprint designation)
- **[14_PROJECT_HISTORY.md](14_PROJECT_HISTORY.md)** (Historical milestone log and release tag records)

---

## 8. Closing Rule

> **THE ROADMAP DEFINES ENGINEERING DIRECTION; IMPLEMENTATION DETAILS BELONG OUTSIDE THIS DOCUMENT.**

This document provides the high-level strategic roadmap for the AV Media Telangana Broadcast Graphics SDK. Detailed implementation plans, specific line changes, and temporary scratch notes belong strictly in transient task plans or code pull requests.

---

## Read Next

👉 Proceed to **[14_PROJECT_HISTORY.md](14_PROJECT_HISTORY.md)** — Project History Registry.
