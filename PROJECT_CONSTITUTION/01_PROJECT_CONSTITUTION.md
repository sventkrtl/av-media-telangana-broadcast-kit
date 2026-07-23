# 01_PROJECT_CONSTITUTION — Supreme Project Constitution

| Metadata Field | Value |
|---|---|
| **Status** | Active Governance |
| **Version** | 1.0.0 |
| **Constitution Layer** | Core |
| **Authority** | Supreme Constitutional |
| **Last Updated** | July 23, 2026 |
| **Depends On** | [00_READ_FIRST.md](00_READ_FIRST.md) |
| **Related Documents** | [02_PROJECT_STATE.md](02_PROJECT_STATE.md), [03_AI_DEVELOPMENT_RULES.md](03_AI_DEVELOPMENT_RULES.md), [07_GOVERNANCE.md](07_GOVERNANCE.md) |
| **Update Frequency** | Architecture Event |
| **Owner** | AV Media Telangana Broadcast SDK |

---

## 1. Project Mission

The mission of the **AV Media Telangana Broadcast Graphics SDK** is to engineer a broadcast-grade, high-performance, real-time 1080p graphics suite for live television broadcast and digital streaming operations. The system delivers 60fps GPU-accelerated lower thirds, ticker marquees, breaking news overlays, and newsroom control panel workflows with absolute operational stability and optical precision.

---

## 2. Project Vision

The long-term vision is to establish a modular, production-frozen broadcast graphics architecture capable of executing continuously in OBS Studio and professional broadcast hardware without frame drops, visual drift, memory degradation, or editorial state desynchronization. The SDK serves as the constitutional foundation for all present and future newsroom graphic engines.

---

## 3. Constitutional Principles

1. **Single Source of Truth (SSOT)**  
   Every editorial item, index state, and runtime dataset MUST originate from a single authoritative model (`BreakingFeedModel`, `GoogleSheetProvider`). State copies, redundant variables, or reading from visual DOM nodes as state are strictly prohibited.

2. **Profile Reuse over Duplication**  
   New broadcast graphic themes (e.g., Breaking Profile) SHALL reuse existing core engines (`PrimaryHeadlineRuntime`, `PrimaryMotionEngine`, `PrimaryStaticRenderer`) via lightweight profile wrappers rather than duplicating code or creating parallel rendering engines.

3. **Measured Reality > Theoretical Recommendation**  
   Optical timing, motion curves, typography offsets, and baseline dimensions MUST be calibrated and validated under actual live broadcast rendering conditions in OBS Studio at viewing distances. Empirical broadcast validation overrides design mockups or theoretical recommendations.

4. **OBS Visual Validation First**  
   No animation sequence, visual layout, or typography baseline is certified for production without real-time visual inspection and screenshot confirmation inside the OBS Studio Browser Source environment.

5. **Broadcast Quality over Feature Quantity**  
   System stability, 60fps motion fluidity, zero memory leaks, and flawless visual typography supersede raw feature volume. A smaller set of production-frozen, rock-solid engines is preferred over numerous uncalibrated features.

6. **Documentation as Engineering Asset**  
   Documentation is not an afterthought; it is an active engineering asset. System specifications, architecture decision records (ADRs), and calibration parameters MUST be maintained with the same rigor as production code.

7. **Constitution before Code**  
   No file creation, refactoring, or feature development may commence without explicit alignment with the rules and constraints defined in the `PROJECT_CONSTITUTION`.

---

## 4. Repository Constitutional Layers

The repository operates under a strict four-tier constitutional hierarchy:

```
PROJECT_CONSTITUTION  (Tier 1: Supreme Context & Intent)
       │
       ▼
  Source Code         (Tier 2: Production Implementation)
       │
       ▼
     Tests            (Tier 3: Automated Verification)
       │
       ▼
 Documentation        (Tier 4: Derived Manuals & Logs)
```

Lower tiers must strictly conform to higher tiers. Any conflict between source code and `PROJECT_CONSTITUTION` represents a defect in source code.

---

## 5. Constitutional Authority Order

When resolving technical ambiguity, conflicts, or architectural disputes, authority flows strictly down the following sequence:

1. **`PROJECT_CONSTITUTION`** (Supreme Intent & Governance)
2. **`ENGINEERING_GOVERNANCE`** ([07_GOVERNANCE.md](07_GOVERNANCE.md))
3. **Architecture Decision Records ([12_ADR_INDEX.md](12_ADR_INDEX.md))**
4. **Source Code** (Current Physical Implementation)
5. **Chat / Discussion Logs** (Transient History)

Chat conversations and discussion logs carry zero governance weight once a decision is codified in the `PROJECT_CONSTITUTION`.

---

## 6. Immutable Engineering Laws

Every graphics engine, profile wrapper, and shared module in this repository MUST progress sequentially through the five-phase broadcast lifecycle:

```
Design  ➔  Prototype  ➔  OBS Validation  ➔  Production Acceptance  ➔  Freeze
```

### Mandatory Lifecycle Rules:
- **No Phase Bypassing**: No module may jump from Prototype to Freeze without formal OBS Validation and Production Acceptance testing.
- **Verification Gate**: Each phase requires explicit verification against automated tests and visual evidence before advancing.

---

## 7. Production Freeze Definition

A module declared as **FROZEN** in [06_FROZEN_MODULES.md](06_FROZEN_MODULES.md) is locked against architectural and visual modifications. 

### Permitted Modifications on Frozen Modules:
- ✅ **Bug Fixes**: Resolution of verified runtime crashes, unhandled exceptions, or logic defects.
- ✅ **Security Fixes**: Hardening input sanitization or network request safety.
- ✅ **Performance Fixes**: Optimizing garbage collection or resource cleanup without altering visual output.

### Strictly Prohibited Modifications on Frozen Modules:
- ❌ **Architecture Drift**: Altering data flow, state engine interfaces, or wrapper boundaries.
- ❌ **Visual Drift**: Modifying color tokens, background plates, or border geometries.
- ❌ **Behavior Drift**: Changing trigger lifecycles, loop logic, or preemption handshakes.
- ❌ **Motion Drift**: Mutating easing functions, clip-path bounds, or transition durations.
- ❌ **Typography Drift**: Adjusting font size, font family, line height, or vertical alignment offsets.

---

## 8. Constitutional Synchronization Rule

> **EVERY COMPLETED ENGINEERING TASK MUST SYNCHRONIZE `PROJECT_CONSTITUTION` BEFORE COMPLETION.**

An engineering task is incomplete until all relevant documents within `PROJECT_CONSTITUTION/` (State, ADR Index, Frozen Modules, Governance) are updated to accurately reflect the implemented code. Source code and the Constitution MUST remain in 100% lockstep alignment at all times.

---

## 9. Versioning Policy

The project adheres to Semantic Versioning (`vMAJOR.MINOR.PATCH`) complemented by explicit Release Tags and Constitutional Versioning:

- **MAJOR (`vX.0.0`)**: Breaking architectural changes, core framework rewrites, or major governance updates.
- **MINOR (`v1.X.0`)**: Additive engine modules, new profile wrappers, or backward-compatible feature additions.
- **PATCH (`v1.0.X`)**: Bug fixes, security patches, and internal performance optimizations.
- **Freeze Tag (`vX.Y.Z-<module>`)**: Git release tag marking a module's transition to Production Freeze (e.g., `v2.1.0-breaking-news`).
- **Constitution Version**: Independent versioning tracking the evolution of `PROJECT_CONSTITUTION` governance documents.

---

## 10. Closing Statement

The **`PROJECT_CONSTITUTION`** serves as the permanent, authoritative context layer for both human developers and AI models. It guarantees that as the AV Media Telangana Broadcast Kit scales across multiple graphic engines, the core principles of stability, optical precision, profile reuse, and operational discipline remain absolute and uncompromised.

---

## Read Next

👉 Proceed to **[02_PROJECT_STATE.md](02_PROJECT_STATE.md)** — Dynamic Project State Registry.
