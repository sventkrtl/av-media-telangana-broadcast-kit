# 07_GOVERNANCE — Engineering Governance Framework

| Metadata Field | Value |
|---|---|
| **Status** | Active Governance |
| **Version** | 1.0.0 |
| **Constitution Layer** | Governance |
| **Authority** | Policy & Lock Rules |
| **Last Updated** | July 23, 2026 |
| **Depends On** | [01_PROJECT_CONSTITUTION.md](01_PROJECT_CONSTITUTION.md) |
| **Related Documents** | [03_AI_DEVELOPMENT_RULES.md](03_AI_DEVELOPMENT_RULES.md), [06_FROZEN_MODULES.md](06_FROZEN_MODULES.md), [12_ADR_INDEX.md](12_ADR_INDEX.md) |
| **Update Frequency** | Static |
| **Owner** | AV Media Telangana Broadcast SDK |

---

## 1. Governance Purpose

Engineering Governance exists to protect the architectural integrity, operational reliability, and optical precision of the AV Media Telangana Broadcast Kit. It establishes explicit decision-making hierarchies, change approval rules, production validation workflows, and constitutional synchronization policies. Governance ensures that no architectural drift, uncalibrated visual tweak, or unvetted shortcut compromises live 1080p broadcast quality.

---

## 2. Engineering Decision Hierarchy

When resolving technical conflicts, evaluating proposed modifications, or making engineering choices, authority flows strictly down the following hierarchy:

```
PROJECT_CONSTITUTION        (Supreme Intent & Governance)
       │
       ▼
ENGINEERING_GOVERNANCE       (Policy, Lock Rules & Approval Matrix)
       │
       ▼
ADR (Architecture Decision)  (Historical Decision Rationale - [12_ADR_INDEX.md](12_ADR_INDEX.md))
       │
       ▼
Implementation               (Source Code Execution)
       │
       ▼
Tests                        (Automated Suite Verification)
       │
       ▼
Documentation                (Derived Reference Documentation)
```

Higher tiers in this hierarchy supersede lower tiers without exception.

---

## 3. Decision Categories

Engineering decisions within the repository are classified into five distinct categories:

1. **Constitutional Decision**  
   Alters project mission, governing principles, frozen module contracts, or constitutional layers. Requires major version update (`v3.0.0+`) and full constitutional revision.

2. **Architectural Decision**  
   Introduces a new core SDK component, data provider abstraction, runtime framework pattern, or IPC protocol. Requires a formal Architecture Decision Record ([12_ADR_INDEX.md](12_ADR_INDEX.md)).

3. **Engineering Decision**  
   Defines new profile wrappers, configuration options, or feature additions within existing architectural boundaries. Governed by minor release cycles (`v1.X.0`).

4. **Implementation Decision**  
   Internal code organization, refactoring non-frozen code, or optimizing function routines. Governed by standard pull request review and unit test validation.

5. **Operational Decision**  
   Configuring Google Sheet feed URLs, deployment scripts, or OBS Browser Source scene collections. Managed at the operator level.

---

## 4. ADR Policy

Architectural changes in this repository are strictly governed by Architecture Decision Records (ADRs):

- **ADR Requirement**: Every modification that alters component interfaces, state machine boundaries, IPC buses, or data provider paradigms MUST be documented in an ADR prior to implementation.
- **Immutable Historical Record**: Once an ADR is accepted and committed to `docs/`, it becomes an immutable historical decision record. ADRs are never edited retroactively; superseded decisions require a new ADR referencing the prior record.
- **No Unapproved Drift**: Source code architecture CANNOT be altered without an approved ADR cataloged in [12_ADR_INDEX.md](12_ADR_INDEX.md).

---

## 5. Production Validation Policy

No graphics engine or profile wrapper may reach Production Freeze status without progressing sequentially through the five-phase validation pipeline:

```
Design Review
     │
     ▼
Implementation
     │
     ▼
OBS Validation (1080p 60fps CEF Visual Inspection)
     │
     ▼
Production Acceptance (Stress Test & PAT Execution)
     │
     ▼
Freeze (Git Tag & Registry Lock - [06_FROZEN_MODULES.md](06_FROZEN_MODULES.md))
```

---

## 6. Constitutional Rules

All engineering activities are strictly bound by seven constitutional rules:

1. **Constitution First**: Check `PROJECT_CONSTITUTION/` rules before initiating any engineering change.
2. **OBS First**: Certify visual graphics inside OBS Studio Browser Source before declaring work complete.
3. **Measured Reality > Theory**: Empirical live broadcast rendering overrides theoretical recommendations or design mockups.
4. **Single Source of Truth (SSOT)**: Maintain one authoritative model per dataset; prohibit state duplication.
5. **Profile Reuse**: Compose existing core SDK engines for new themes before writing parallel code.
6. **Freeze Protection**: Treat Production-Frozen modules as immutable ([06_FROZEN_MODULES.md](06_FROZEN_MODULES.md)); restrict edits to authorized patches.
7. **Synchronization Mandatory**: Update `PROJECT_CONSTITUTION/` documents in lockstep with every completed task ([18_DOCUMENT_UPDATE_MATRIX.md](18_DOCUMENT_UPDATE_MATRIX.md)).

---

## 7. Change Approval Matrix

The following matrix governs the approval and validation requirements for all repository changes:

| Change Type | ADR Required | OBS Validation Required | Constitution Update Required |
|---|---|---|---|
| **Architecture Modification** | ✅ YES | ✅ YES | ✅ YES |
| **New Graphic Engine / Profile** | ✅ YES | ✅ YES | ✅ YES |
| **Motion Curve / Easing Adjustment** | ❌ NO | ✅ YES | ✅ YES |
| **Typography & Baseline Calibration** | ❌ NO | ✅ YES | ✅ YES |
| **Core SDK Component Modification** | ✅ YES | ✅ YES | ✅ YES |
| **Bug Fix on Frozen Module** | ❌ NO | ✅ YES | ✅ YES |
| **Documentation & Minor Refactoring** | ❌ NO | ❌ NO | ✅ YES |

---

## 8. Repository Governance Rule

> **ENGINEERING WORK IS COMPLETE ONLY AFTER TESTS, DOCUMENTATION, CONSTITUTION, AND GIT ARE SYNCHRONIZED.**

No task is considered resolved or complete merely because source code compiles or passes unit tests. A task reaches completion ONLY when:
1. Automated tests pass with 100% success.
2. Derived documentation is updated.
3. `PROJECT_CONSTITUTION/` (State, ADR Index, Frozen Modules, Roadmap) is fully synchronized.
4. Git commit and push to `origin/main` are successfully completed.

---

## 9. Closing Statement

Long-term architectural stability, optical precision, and system maintainability take absolute priority over short-term implementation convenience. Engineering Governance ensures that as the AV Media Telangana Broadcast Kit expands, its foundational standards remain uncompromised and broadcast-ready.

---

## Read Next

👉 Proceed to **[08_MOTION_LANGUAGE.md](08_MOTION_LANGUAGE.md)** — Broadcast Motion Language Specification.
