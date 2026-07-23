# 06_FROZEN_MODULES — Frozen Module Registry

| Metadata Field | Value |
|---|---|
| **Status** | Active Governance |
| **Version** | 1.0.0 |
| **Constitution Layer** | Registry |
| **Authority** | Immutability Ledger |
| **Last Updated** | July 23, 2026 |
| **Depends On** | [01_PROJECT_CONSTITUTION.md](01_PROJECT_CONSTITUTION.md), [02_PROJECT_STATE.md](02_PROJECT_STATE.md) |
| **Related Documents** | [07_GOVERNANCE.md](07_GOVERNANCE.md), [13_ROADMAP.md](13_ROADMAP.md), [14_PROJECT_HISTORY.md](14_PROJECT_HISTORY.md) |
| **Update Frequency** | Freeze Event |
| **Owner** | AV Media Telangana Broadcast SDK |

---

## 1. Registry Purpose

The **Frozen Module Registry** is the single authoritative ledger for every Production-Frozen module in the AV Media Telangana Broadcast Kit. It defines the immutability boundaries, version locks, git release tags, and patch maintenance rules for modules that have completed broadcast testing and reached Production Freeze.

---

## 2. Freeze Lifecycle

Every broadcast graphic module progresses through a mandatory six-phase lifecycle prior to long-term lock:

```
Design
  │
  ▼
Prototype
  │
  ▼
OBS Validation
  │
  ▼
Production Acceptance
  │
  ▼
Production Freeze (Lock Tagged)
  │
  ▼
Patch Maintenance (Authorized Fixes Only)
```

---

## 3. Frozen Module Table

| Module | Version | Status | Freeze Tag | Production Commit |
|---|---|---|---|---|
| **Secondary Playlist Engine** | `v2.0.0` | ❄️ **Frozen** | `v2.0.0` | `57a7cd2` |
| **Primary Headline Engine** | `v1.0.0` | ❄️ **Frozen** | `v1.0.0-primary-headline` | `7e46c53` |
| **Breaking News Profile** | `v2.1.0` | ❄️ **Frozen** | `v2.1.0-breaking-news` | `9a0d894` |

---

## 4. Freeze Contract

When a module enters Production Freeze, the following engineering characteristics are permanently locked:

- **Architecture**: Core class dependencies, wrapper abstractions, and directory structures.
- **Runtime**: Execution loops, event listeners, and lifecycle hooks.
- **Behavior**: Auto-loop behavior, trigger handshakes (`SHOW NOW`/`STOP`), and preemption logic.
- **Motion**: Stage timelines (`BAR_IN`, `TEXT_IN`, `TEXT_HOLD`, `TEXT_OUT`, `BAR_OUT`), easing curves, and reveal vectors ([08_MOTION_LANGUAGE.md](08_MOTION_LANGUAGE.md)).
- **Typography**: Font family (Ramabhadra), font size (`59px`), line-height, and vertical offset (`translateY(-11px)`).
- **Geometry**: Container placement (Y: `890px`), height (`135px`), width (`1920px`), and clip-path bounds.
- **Visual Identity**: Color tokens (`#1E3A8A` blue, `#DC2626` red), background plates, and theme classes.
- **State Machine**: Finite states (`IDLE`, `READY`, `ACTIVE`), transition guards, and revision counters.
- **Public Interfaces**: Method signatures, event names, and data model contracts.

---

## 5. Allowed Changes

The ONLY permitted code modifications on Frozen Modules are:

1. **Bug Fix**: Resolution of verified runtime crashes, unhandled promises, or memory leak defects.
2. **Security Fix**: Hardening input sanitization, data provider validation, or network safety.
3. **Performance Optimization**: Micro-optimizations for garbage collection or DOM query efficiency without altering visual output.
4. **Compatibility Patch**: Updates required to maintain compatibility with updated browser engines (CEF Chromium) or OBS Studio releases.
5. **Documentation Correction**: Fixing typographical errors or updating architectural documentation.

---

## 6. Forbidden Changes

The following modifications are strictly FORBIDDEN on Frozen Modules:

- ❌ **Architecture Drift**: Modifying module interfaces or introducing parallel data models.
- ❌ **Motion Drift**: Changing easing functions, animation durations, or clip-path vectors.
- ❌ **Typography Changes**: Adjusting font size, font family, line-height, or vertical alignment offsets.
- ❌ **Visual Calibration Changes**: Altering frozen optical values (e.g., modifying the `70ms` optical separator).
- ❌ **Behavior Changes**: Altering trigger lifecycles, circular loop rules, or preemption handshakes.
- ❌ **State Machine Changes**: Adding unvetted states, bypassing state transitions, or mutating index tracking.
- ❌ **New Features**: Introducing unapproved capabilities, visual stings, or controls.
- ❌ **Configuration Drift**: Overriding immutable design tokens or baseline layout variables.

---

## 7. Patch Policy

When an authorized patch is applied to a Frozen Module, the following rules apply:

1. **Backward Compatibility**: Patches MUST preserve 100% backward compatibility with all existing control panel docks and OBS Browser Source overlays.
2. **Identity Retention**: The module retains its visual and motion identity without alteration.
3. **Regression Testing**: Patches MUST pass 100% of existing unit, integration, stability, and PAT test suites.
4. **Registry Update**: The patch version (e.g., `v2.1.1`) and commit hash MUST be updated in this registry document.

---

## 8. Future Frozen Modules

Placeholder registry for upcoming broadcast graphic modules scheduled for Production Freeze in future sprints ([13_ROADMAP.md](13_ROADMAP.md)):

| Module | Target Version | Status | Target Freeze Tag | Planned Horizon |
|---|---|---|---|---|
| **Lower Third Engine** | `v2.2.0` | 🛠️ In Planning | `v2.2.0-lower-third` | Sprint v2.2.0 |
| **Reporter Card Engine** | `v2.3.0` | 🛠️ In Planning | `v2.3.0-reporter-card` | Sprint v2.3.0 |

---

## 9. Registry Rule

> **THIS DOCUMENT IS THE SINGLE AUTHORITATIVE REGISTRY FOR EVERY PRODUCTION-FROZEN MODULE.**

No module may claim Production Freeze status unless officially registered in Section 3 of this document with a verified version, status badge, git tag, and production commit hash.

---

## Read Next

👉 Proceed to **[07_GOVERNANCE.md](07_GOVERNANCE.md)** — Engineering Governance Framework.
