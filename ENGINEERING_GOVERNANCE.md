# 🏛️ AV Media Telangana Broadcast Kit – Engineering Governance Constitution

> **"Production Stability always takes precedence over feature expansion, visual refinement, or architectural experimentation."**

This document defines the mandatory, repository-wide engineering governance hierarchy, module lifecycle policy, code compliance rules, and constitution immutability standards for the entire **AV Media Telangana Broadcast Kit**.

All current and future development MUST strictly comply with this document.

---

## 📜 1. Repository Governance Hierarchy

The repository operates under a strict 7-level architectural hierarchy. Lower levels must always yield to higher levels.

```
Level 1: ROADMAP.md (Master Strategy & Target Versions)
  │
  ├── Level 2: Engine Constitutions (*_SPEC.md)
  │     │
  │     └── Level 3: Architecture Decision Records (docs/adr/*.md)
  │           │
  │           └── Level 4: Implementation (JavaScript, HTML, CSS)
  │                 │
  │                 └── Level 5: Testing (Unit, Integration, Stress, PAT)
  │                       │
  │                       └── Level 6: Production Validation (CEF & Field TV Tests)
  │                             │
  │                             └── Level 7: Freeze & Annotated Release Tag (vX.Y.Z)
```

| Level | Document / Stage | Scope & Authority |
|---|---|---|
| **Level 1** | `ROADMAP.md` | Master project roadmap, phase targets, and overall system strategy. |
| **Level 2** | Engine Constitutions (`*_SPEC.md`) | Single Source of Truth for each graphic engine. **Supreme authority for that engine.** |
| **Level 3** | Architecture Decision Records (`ADR`) | Recorded architectural trade-offs, versioned deltas, or approved spec modifications. |
| **Level 4** | Implementation | Production code (JavaScript modules, HTML canvas overlays, CSS stylesheets). |
| **Level 5** | Testing | Test suites (unit tests, provider tests, runtime integration tests, 1000-loop memory audits). |
| **Level 6** | Production Validation | Real-world TV verification (CRT, LED, Smart TV, OBS Studio 1080p canvas preview). |
| **Level 7** | Freeze & Release Tag | Annotated Git Tag (`vX.Y.Z`) locking the module into immutable production status. |

---

## 🔒 2. Implementation Pre-Condition Rule

> **"No implementation may begin until its Constitution has been Approved and Locked."**

- **Rule**: Developers and AI agents must **NEVER** write runtime code, HTML/CSS layout templates, data providers, or motion drivers for an engine until its specification document (`*_SPEC.md`) has passed formal review and been marked **APPROVED & LOCKED**.
- **Enforcement**: Any code written prior to constitution approval is considered unverified scratch code and must be discarded or halted.

---

## 🛡️ 3. Constitution Immutability Rule

- **Rule**: Once an Engine Constitution (`*_SPEC.md`) is approved and locked by the team, it becomes **IMMUTABLE**.
- **Prohibition**: Accepted constitutions must **NEVER** be edited, modified, or overwritten directly to introduce new features or change behavior.
- **Handling Requirements Changes**:
  - If a major structural requirement change is approved, create a **new Constitution version** (e.g., `PRIMARY_HEADLINE_ENGINE_SPEC_v2.md`).
  - If a localized decision or delta is approved, record it as a numbered **Architecture Decision Record (ADR)** in `docs/adr/ADR-xxx.md`.
- **Outcome**: The original constitution remains historically intact, ensuring a complete audit trail of design intent.

---

## ⚖️ 4. Code Compliance & Conflict Resolution

- **Rule**: Production code must **NEVER** contradict an approved Engine Constitution.
- **Precedence**: In any conflict between code implementation, developer preferences, AI assumptions, and the Constitution, **THE CONSTITUTION ALWAYS WINS**.
- **Refactoring Requirement**: If an existing implementation violates an approved Constitution rule, the code MUST be refactored to align 100% with the specification.

---

## ❄️ 5. Frozen Module Policy

When an engine reaches **Level 7 (Freeze & Release Tag)**, it enters **FROZEN** status.

### Permitted Changes:
- ✅ **Critical Bug Fixes** (trapped crashes, timing deadlocks)
- ✅ **Security Fixes** (input sanitization, credential safety)
- ✅ **Performance Fixes** (memory leak resolution, CEF 60 FPS optimizations)

### Strictly Prohibited Changes:
- ❌ **No New Features**
- ❌ **No Behaviour Changes**
- ❌ **No Architecture Changes**
- ❌ **No Layout / Visual Redesigns**

### 🧊 Absolutely Immutable Provider Modules
The following data provider components are **FROZEN & IMMUTABLE**:
- `GoogleSheetProvider` (`modules/secondary-playlist/data-providers/GoogleSheetProvider.js`)
- `GoogleSheetRefreshService` (`modules/secondary-playlist/services/GoogleSheetRefreshService.js`)
- `GoogleSheetProviderStatus` (`modules/secondary-playlist/services/GoogleSheetProviderStatus.js`)
- `ProviderRegistry` (`modules/secondary-playlist/data-providers/ProviderRegistry.js`)
- `ProviderFactory` (`modules/secondary-playlist/data-providers/ProviderFactory.js`)

**Protection Rules**:
1. These files **MUST NOT** be modified, reformatted, extended, or given new methods.
2. The Primary Headline Engine (or any future graphic engine) **MUST** consume existing providers **ONLY through their public API**.
3. If adaptation is required for a new engine, developers/AI **MUST create a thin adapter** inside `modules/[new-engine]/`. Existing provider files must remain 100% untouched.

---

## 🎥 6. Production & Design Philosophies

### Production Philosophy
> **"Production Stability always takes precedence over feature expansion, visual refinement, or architectural experimentation."**

A running 24/7 broadcast channel values zero crashes, zero visual glitches, and constant 60 FPS performance above all else.

### Design & Motion Philosophy
> **"The viewer should remember the NEWS, not the animation."**
>
> **"Every animation exists ONLY to improve readability."**

Animations must support comprehension and title-safe legibility. Motion effects must never draw attention away from broadcast headline content.

---

## 🔄 7. Standard Engine Development Lifecycle

Every major broadcast graphic engine in this repository MUST progress through the mandatory 9-stage pipeline:

$$\text{1. Idea} \longrightarrow \text{2. Discussion} \longrightarrow \text{3. Constitution} \longrightarrow \text{4. Approval} \longrightarrow \text{5. Implementation} \longrightarrow \text{6. Testing} \longrightarrow \text{7. Prod Validation} \longrightarrow \text{8. Freeze} \longrightarrow \text{9. Annotated Tag}$$

1. **Idea**: Conceptual requirement defined in `ROADMAP.md`.
2. **Discussion**: Architectural alignment on scope and absolute geometry.
3. **Constitution**: Draft `[ENGINE_NAME]_SPEC.md`.
4. **Approval**: Lock Constitution (Level 2 Approval).
5. **Implementation**: Build Runtime, Provider, Renderer, and Motion engines.
6. **Testing**: Pass all automated test suites and 1,000-cycle stability audits.
7. **Production Validation**: Cross-device display and OBS Studio visual verification.
8. **Freeze**: Mark module as Constitutionally Frozen ❄️.
9. **Annotated Git Tag**: Create versioned Git release tag (`vX.Y.Z`).

### 📺 OBS Visual Validation Mandatory Rule
An OBS/Overlay task is **NOT complete** until the following elements are explicitly verified visually in a live Browser Source / CEF render:
- ✓ **Layout**: Absolute geometry & canvas bounds
- ✓ **Typography**: Font rendering, Telugu legibility, single-line compliance
- ✓ **Motion**: Correct stage sequence & direction
- ✓ **Timing**: Correct stage durations (BAR_IN 300ms ➔ TEXT_IN 300ms ➔ HOLD 4000ms ➔ TEXT_OUT 300ms ➔ BAR_OUT 300ms)
- ✓ **Runtime**: Continuous looping & error resilience
- ✓ **Live OBS Browser Source**: Clean execution in actual browser viewport

> **Unit tests alone are NOT sufficient for broadcast completion.**

---

## 📋 8. Active Module Governance Matrix

| Module | Constitution File | Governance Status | Current Version |
|---|---|---|---|
| **Secondary News Playlist Engine** | [`SECONDARY_NEWS_PLAYLIST_ENGINE_SPEC.md`](./SECONDARY_NEWS_PLAYLIST_ENGINE_SPEC.md) | ❄️ FROZEN | `v2.0.0` |
| **Primary Headline Engine** | [`PRIMARY_HEADLINE_ENGINE_SPEC.md`](./PRIMARY_HEADLINE_ENGINE_SPEC.md) | 📜 APPROVED & LOCKED | `v1.0` (P1-0) |
| **Ticker Engine** | (`modules/ticker/`) | ❄️ FROZEN | `v1.2.1` |
| **Future Engines** (Lower Third, Reporter, Breaking) | Pending P-series tasks | ⏳ Pre-Constitution | Target `v2.1.0`+ |
