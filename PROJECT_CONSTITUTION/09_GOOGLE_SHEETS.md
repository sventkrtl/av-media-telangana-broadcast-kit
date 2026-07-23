# 09_GOOGLE_SHEETS — Google Sheets Integration Specification

| Metadata Field | Value |
|---|---|
| **Status** | Active Governance |
| **Version** | 1.0.0 |
| **Constitution Layer** | Integration Specification |
| **Authority** | Data Provider Standard |
| **Last Updated** | July 23, 2026 |
| **Depends On** | [01_PROJECT_CONSTITUTION.md](01_PROJECT_CONSTITUTION.md), [04_ARCHITECTURE.md](04_ARCHITECTURE.md) |
| **Related Documents** | [05_SDK_REFERENCE.md](05_SDK_REFERENCE.md), [10_CONTROL_PANEL.md](10_CONTROL_PANEL.md), [12_ADR_INDEX.md](12_ADR_INDEX.md) |
| **Update Frequency** | Architecture Event |
| **Owner** | AV Media Telangana Broadcast SDK |

---

## 1. Purpose

Google Sheets serves as the primary newsroom editorial data source for the AV Media Telangana Broadcast Kit. It enables journalists, broadcast producers, and automation tools to manage live broadcast graphics feeds remotely via an accessible, real-time cloud spreadsheet interface. The integration specification establishes a standardized, fault-tolerant ingestion pipeline that transforms spreadsheet rows into validated, broadcast-ready graphic datasets.

---

## 2. Integration Philosophy

The Google Sheets provider architecture is built upon five operational pillars:

1. **Human Editable**: Spreadsheets MUST remain simple, intuitive, and clear for non-technical newsroom journalists to edit under breaking news pressure.
2. **AI Friendly**: Column structures and text schemas MUST be structured cleanly to facilitate automated content generation, translation, and verification by AI agents.
3. **Operator Friendly**: Control panel interfaces ([10_CONTROL_PANEL.md](10_CONTROL_PANEL.md)) MUST provide clear feed status indicators, single-click sync triggers, and instant visual feedback without requiring complex spreadsheet knowledge.
4. **Live Synchronization**: Supporting both periodic background polling and on-demand manual triggers to ingest editorial updates without interrupting active broadcast graphics loops.
5. **Schema Driven**: All spreadsheet tabs MUST conform to strict, pre-defined column schemas. Unvalidated or malformed spreadsheets MUST be rejected safely before reaching on-air runtimes.

---

## 3. Provider Architecture Pipeline

Data flows from remote cloud spreadsheets to live broadcast renderers through a seven-stage decoupled pipeline:

```
Google Sheet (Cloud Editorial Spreadsheet)
     │
     ▼
Published CSV (Raw Web Feed Output)
     │
     ▼
Data Adapter (Ingestion & Schema Resolution)
     │
     ▼
Validation (Required Column & Type Sanitization)
     │
     ▼
SSOT Model (Authoritative Data State & Revision Increment)
     │
     ▼
Runtime Engine (Playback Index & Item Selection)
     │
     ▼
Renderer (On-Air DOM Visualization)
```

---

## 4. Sheet Responsibilities

Each broadcast graphics module relies on a dedicated spreadsheet tab scope with strictly defined editorial responsibilities:

- **Primary Headline Feed**: Manages multi-item headline queues for continuous lower third rotation, supplying primary news text, sub-labels, and theme tags.
- **Breaking News Feed**: Supplies urgent, high-priority breaking news headlines consumed exclusively by the breaking preemption overlay wrapper.
- **Secondary Playlist Feed**: Supplies multi-category regional news, sports scores, and ticker items arranged in sequential editorial playlists.
- **Future Module Feeds**: Upcoming graphic modules (Lower Third, Reporter Cards - [13_ROADMAP.md](13_ROADMAP.md)) SHALL define dedicated spreadsheet tabs tailored to their specific graphic requirements.

---

## 5. Schema Philosophy

1. **Schema before Parsing**: A data adapter MUST define its required column schema prior to attempting data extraction.
2. **Validation before Runtime**: Spreadsheet rows MUST be fully validated, sanitized, and type-checked before populating the runtime Single Source of Truth (SSOT) model.
3. **One Authoritative Schema per Module**: Every module enforces one canonical column schema; mixing multi-module schemas inside a single tab is forbidden.
4. **No Hidden Columns**: Systems SHALL NOT rely on undocumented, hidden, or magical spreadsheet columns for core operational behavior.

---

## 6. Synchronization Rules

- **Manual Sync**: Operators can trigger immediate feed fetching from the control panel (`Sync Now`), updating the visual preview card prior to on-air broadcast.
- **Automatic Refresh**: Background refresh services poll published CSV URLs at safe intervals, executing hot-reloads ONLY at safe animation boundaries (`HEADLINE_END` or `PLAYLIST_END`).
- **State Integrity**: Hot-reloading a refreshed dataset MUST preserve the current on-air item display without visual jump cuts or index corruption.
- **Revision Tracking**: Every dataset update increments an internal monotonically increasing `revision` counter for complete broadcast trace auditing.
- **Error Handling**: Network timeouts, missing tabs, or invalid CSV schemas MUST be trapped gracefully, retaining the last valid dataset and logging diagnostic telemetry without interrupting active rendering.

---

## 7. Isolation Rules

> **EVERY MODULE OWNS ITS OWN DATASET. NO MODULE MAY SILENTLY CONSUME ANOTHER MODULE'S FEED.**

1. **Dataset Ownership**: Each profile wrapper and core engine communicates exclusively with its designated dataset model.
2. **Zero Cross-Feeding**: Breaking News SHALL NOT silently consume Primary Headline feeds; Secondary Playlists SHALL NOT parse Breaking News tabs.
3. **No Unrelated Fallback**: If a module's dedicated spreadsheet tab is missing, unparseable, or empty, the adapter MUST return an empty dataset with an `ERROR` status. It MUST NEVER fall back to another module's tab.

---

## 8. Extension Rules

1. **Dedicated Schemas for Future Engines**: Every new broadcast engine (Lower Third, Reporter Card) MUST define a dedicated spreadsheet schema document prior to integration.
2. **Documentation-First Updates**: Modifying an existing column schema requires updating the corresponding data provider documentation and ADR ([12_ADR_INDEX.md](12_ADR_INDEX.md)) before committing code changes.

---

## 9. Closing Rule

> **GOOGLE SHEETS ARE BROADCAST DATA SOURCES, NOT APPLICATION LOGIC.**

Spreadsheets supply raw editorial content, labels, and metadata. They SHALL NOT contain executable application code, UI styling commands, or state machine logic. Application behavior belongs strictly to the SDK core and constitutional runtime models.

---

## Read Next

👉 Proceed to **[10_CONTROL_PANEL.md](10_CONTROL_PANEL.md)** — Control Panel Architecture Specification.
