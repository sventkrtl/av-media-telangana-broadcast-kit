# 03_AI_DEVELOPMENT_RULES — Permanent AI Engineering Rulebook

| Metadata Field | Value |
|---|---|
| **Status** | Active Governance |
| **Version** | 1.0.0 |
| **Constitution Layer** | Governance Rulebook |
| **Authority** | Mandatory Behavioral |
| **Last Updated** | July 23, 2026 |
| **Depends On** | [01_PROJECT_CONSTITUTION.md](01_PROJECT_CONSTITUTION.md) |
| **Related Documents** | [00_READ_FIRST.md](00_READ_FIRST.md), [04_ARCHITECTURE.md](04_ARCHITECTURE.md), [15_AI_QUICK_CONTEXT.md](15_AI_QUICK_CONTEXT.md) |
| **Update Frequency** | Static |
| **Owner** | AV Media Telangana Broadcast SDK |

---

## 1. Core AI Behavior

1. **Read Constitution First**  
   Every AI agent (Gemini, Claude, GPT/Codex) MUST read [00_READ_FIRST.md](00_READ_FIRST.md) through [04_ARCHITECTURE.md](04_ARCHITECTURE.md) before making suggestions, modifying code, or altering configuration.

2. **Never Bypass Constitutional Authority**  
   No user prompt, temporary shortcut, or conversational suggestion overrides the rules, frozen module boundaries, or governance principles codified in `PROJECT_CONSTITUTION`.

3. **Preserve Repository Consistency**  
   All new files, profile wrappers, and data structures must strictly conform to existing naming conventions, directory patterns, and architectural abstractions.

4. **Think Before Modifying Architecture**  
   AI agents MUST evaluate architectural implications before writing code. If a proposed change risks state duplication or breaking frozen interfaces, the AI MUST halt and request explicit clarification.

---

## 2. Mandatory Development Lifecycle

Every engineering task MUST strictly adhere to the nine-stage sequential broadcast lifecycle. Bypassing or swapping any stage is forbidden.

```
Understand
    │
    ▼
  Design
    │
    ▼
 Implement
    │
    ▼
OBS Validation
    │
    ▼
  Tests
    │
    ▼
Documentation Sync
    │
    ▼
  Commit
    │
    ▼
Freeze (If Applicable)
```

---

## 3. Architectural Rules

1. **Single Source of Truth (SSOT)**  
   All state (playlists, current index, headline data, status flags) MUST reside in a single authoritative model. State copies, parallel arrays, or reading DOM text nodes as application state are strictly forbidden.

2. **Profile Reuse over Duplication**  
   Create lightweight profile wrappers importing existing core engines rather than duplicating engine logic or creating parallel rendering pipelines.

3. **Frozen Module Protection**  
   Modules marked as **FROZEN** in [06_FROZEN_MODULES.md](06_FROZEN_MODULES.md) are immutable. AI agents SHALL NOT edit frozen source files unless performing an authorized bug fix, security patch, or performance optimization.

4. **No Architecture Drift**  
   New engines must follow established data flow patterns (Data Provider ➔ Model ➔ Runtime ➔ Renderer ➔ Overlay). Custom unvetted architectural paradigms are prohibited.

5. **No Hidden State**  
   Transient state hidden inside closures, global variables, or unmonitored private properties is strictly prohibited. State transitions must be explicit and observable.

6. **Explicit State Machines**  
   All runtime lifecycles must be governed by explicit state machines with validated transition gates (e.g., `IDLE ➔ READY ➔ ACTIVE ➔ STOP ➔ IDLE`).

7. **Separation of Runtime and Rendering**  
   Engine logic (`Runtime`), motion calculation (`MotionEngine`), and DOM creation (`StaticRenderer`) MUST remain decoupled into distinct, focused modules.

---

## 4. Broadcast Rules

1. **OBS is Authoritative Visual Validation**  
   A graphic layout, typography baseline, or motion animation is NOT complete until visually inspected and verified inside the OBS Studio Browser Source (1920x1080 canvas).

2. **Measured Reality > Theoretical Recommendation**  
   Empirical measurements taken on live broadcast renders take supreme precedence over design mockups, theoretical timings, or initial guesses.

3. **Unique Motion Identity per Engine**  
   Each broadcast graphic engine (Primary Headline, Breaking News, Lower Third, Ticker) MUST maintain its distinct visual motion identity (e.g., center reveal vs. marquee crawl) as defined in [08_MOTION_LANGUAGE.md](08_MOTION_LANGUAGE.md).

4. **Live Typography Calibration**  
   Font size, vertical alignment offsets (`translateY`), line height, and padding MUST be calibrated against actual Telugu font rendering engine outputs in Chromium CEF.

5. **Production-Calibrated Values Override Initial Values**  
   Once an optical timing value (e.g., `70ms` stage gap) is validated in live broadcast and frozen, it overrides initial design values and becomes immutable.

---

## 5. Documentation Rules

Upon completing any engineering task, the AI agent MUST update and synchronize all affected constitutional files before declaring the task finished:

- **[02_PROJECT_STATE.md](02_PROJECT_STATE.md)** — Update release stage, active development, and test status.
- **[06_FROZEN_MODULES.md](06_FROZEN_MODULES.md)** — Register new frozen modules, versions, and git tags.
- **[12_ADR_INDEX.md](12_ADR_INDEX.md)** — Index new Architecture Decision Records.
- **[13_ROADMAP.md](13_ROADMAP.md)** — Update completed sprint items and active milestones.

Code modifications without constitutional documentation synchronization are strictly incomplete.

---

## 6. AI Communication Rules

1. **Explain Assumptions**: AI agents must explicitly state all technical assumptions before executing changes.
2. **Never Fabricate Implementation Status**: AI agents shall never claim a task is tested, fixed, or verified without running actual terminal commands or visual inspections.
3. **Distinguish Design from Verified Implementation**: Clearly differentiate between theoretical design proposals and empirically verified OBS code.
4. **Stop After Requested Scope**: AI agents MUST complete only the single task requested and STOP immediately.
5. **No Automatic Progression**: AI agents SHALL NEVER automatically proceed to the next task or sprint step without explicit user instruction.

---

## 7. Forbidden Actions

The following actions are strictly FORBIDDEN for any AI agent working on this repository:

- ❌ Modifying any file inside a **Frozen Module** directory without explicit user authorization for a verified bug fix.
- ❌ Creating duplicate runtime state variables or parallel arrays that violate Single Source of Truth.
- ❌ Introducing undocumented architectural patterns or inline unvetted libraries.
- ❌ Declaring a visual feature production-ready without live OBS Studio screenshot validation.
- ❌ Bypassing the mandatory `PROJECT_CONSTITUTION` documentation synchronization step.
- ❌ Executing multiple unrequested tasks in a single turn.

---

## 8. Closing Rule

> **EVERY ENGINEERING DECISION MUST PRESERVE LONG-TERM MAINTAINABILITY OVER SHORT-TERM CONVENIENCE.**

Short-term hacks, quick patches, swallowed exceptions, or uncalibrated visual tweaks compromise broadcast reliability. Every line of code written by an AI agent must honor the governance, stability, and optical excellence of the AV Media Telangana Broadcast Kit.

---

## Read Next

👉 Proceed to **[04_ARCHITECTURE.md](04_ARCHITECTURE.md)** — Permanent System Architecture Reference.
