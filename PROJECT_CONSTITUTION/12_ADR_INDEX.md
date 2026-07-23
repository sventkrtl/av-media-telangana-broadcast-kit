# 12_ADR_INDEX — Architecture Decision Record Master Registry

**Status**: Active Governance  
**Version**: 1.0.0  

---

## 1. Purpose

Architecture Decision Records (ADRs) document significant technical choices, architectural designs, and design rationale across the AV Media Telangana Broadcast Kit. The **ADR Master Registry** serves as the central index cataloging every accepted, proposed, or superseded ADR in the repository.

---

## 2. ADR Philosophy

1. **Architecture Decisions are Permanent**: Technical choices governing system boundaries, state models, and IPC buses are codified to prevent arbitrary re-architecture.
2. **ADRs Preserve Rationale**: Records capture the contextual problem, evaluated alternatives, and engineering justification for future contributors and AI models.
3. **Implementation Follows ADR**: Source code development SHALL NOT begin prior to ADR approval for new architectural components.
4. **ADRs are Immutable Historical Records**: Once approved and committed, an ADR is an immutable historical document. It is never retroactively modified or deleted.

---

## 3. ADR Lifecycle

Architectural proposals progress through a mandatory five-phase lifecycle:

```
Proposal
   │
   ▼
Review
   │
   ▼
Approval
   │
   ▼
Implementation
   │
   ▼
Freeze (If Applicable)
```

---

## 4. ADR Master Registry

| ADR ID | Title | Status | Affected Area |
|---|---|---|---|
| **ADR-0001** | Shared Engine Architecture & Broadcast SDK Baseline | Accepted | SDK Core & Engine Architecture |
| **ADR-0002** | Secondary News Playlist Crawl Engine Architecture | Accepted | Secondary Playlist Engine |
| **ADR-0003** | Primary Headline 1080p Overlay & Renderer Architecture | Accepted | Primary Headline Engine |
| **ADR-0004** | Breaking News Profile Engine Reuse Architecture | Accepted | Breaking News Profile Wrapper |
| **ADR-0005** | Breaking Profile Module Reuse Strategy | Accepted | Module Hierarchy & Frozen Reuse |
| **ADR-0006** | Breaking Profile Google Sheet Dedicated Feed Tab | Accepted | Google Sheet Provider & Tab Isolation |
| **ADR-0007** | Future Shared Google Sheet Feed SDK & Data Engine Abstraction | Accepted | Shared Data Engine SDK |
| **ADR-0008** | Breaking Profile Control Panel Integration Architecture | Accepted | Control Panel & Telemetry Observer |
| **ADR-0009** | Breaking Profile Single Source of Truth (SSOT) Architecture | Accepted | State Model (`BreakingFeedModel`) |
| **ADR-0010** | Breaking Profile Continuous Circular Playback Architecture | Accepted | Runtime Engine & Loop State Machine |
| **ADR-0011** | Persistent Breaking Bar Playback Profile Architecture | Accepted | Motion Engine & Persistent Red Plate |

---

## 5. ADR Categories

The repository categorizes all ADRs into eight architectural domains:

- **Architecture**: System topology, profile reuse, and layer separation.
- **Runtime**: Playback engines, circular loop models, and state machine contracts.
- **Motion**: Stage timelines, easing drivers, and clip-path reveal mechanisms.
- **SDK**: Shared utility engines, animation libraries, and framework abstractions.
- **Control Panel**: Operator dock workflows, preview observers, and IPC command formatting.
- **Google Sheets**: Published CSV schema definitions, tab routing, and isolation rules.
- **Typography**: Telugu script baseline offsets, font sizing, and viewport clip bounds.
- **Governance**: Production Freeze policies, lock rules, and constitutional sync mandates.

---

## 6. ADR Rules

1. **Mandatory ADRs for Architecture Changes**: Any change modifying IPC protocols, data models, state machines, or engine hierarchies MUST be codified in a new ADR.
2. **Immutability of Committed ADRs**: Existing committed ADRs SHALL NOT be rewritten or edited retroactively to match code drift.
3. **Superseding Decisions**: If a future architectural design overrides a previous ADR, a NEW ADR MUST be created referencing the superseded ADR ID explicitly.

---

## 7. ADR Maintenance Workflow

Every accepted architectural change triggers a mandatory three-step documentation update:

```
New ADR Authored & Approved
            │
            ▼
ADR Index Updated (12_ADR_INDEX.md)
            │
            ▼
Constitution Sync (PROJECT_CONSTITUTION Lockstep Update)
```

---

## 8. Closing Rule

> **`12_ADR_INDEX.md` IS THE AUTHORITATIVE REGISTRY OF ARCHITECTURAL DECISIONS.**

This document provides the canonical catalog of all architectural decisions governing the AV Media Telangana Broadcast Kit. It ensures that technical context, design rationale, and system boundaries remain permanently accessible and transparent.
