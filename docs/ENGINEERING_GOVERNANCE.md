# 🏛️ Engineering Governance & Production Calibration Lock

**Project**: AV Media Telangana Broadcast Kit  
**Status**: ACTIVE GOVERNANCE CONSTITUTION  
**Last Updated**: July 23, 2026  

---

## 🧊 1. Frozen Modules Registry

| Module Name | Version | Governance Status | Scope / Restrictions |
|---|---|---|---|
| **Secondary Playlist Engine** | `v2.0.0` | ❄️ **Frozen** | Continuous crawl & badge loop |
| **Primary Headline Engine** | `v1.0.0` | ❄️ **Frozen** | Core headline runtime, renderer & motion engine |
| **Breaking News Profile** | `v2.1.0` | ❄️ **Frozen** | Preemption wrapper, SSOT model & persistent red bar |

---

## 🔒 2. Production Calibration Lock Rule

> **CONSTITUTIONAL GOVERNANCE RULE**:
> Once a motion parameter, typography parameter, or optical timing value has been validated through live OBS broadcast testing and frozen in a production release, it **SHALL NOT** be modified unless:
> 1. A verified production defect exists (*supported by empirical logs or visual bug reports*)
> **OR**
> 2. A new major version (`v3.0.0+`) is explicitly initiated.
>
> *Personal visual preference alone is NOT sufficient justification to mutate frozen broadcast parameters.*

### Validation Methodology Standard:
```
Design Preview ➔ Engineering Implementation ➔ Live OBS Broadcast Validation ➔ Production Freeze
```
- **Measured Reality > Theoretical Recommendation**: All optical values are validated at actual broadcast viewing distances on live Chromium/OBS renderers.

---

## 🛑 3. Constitutionally Frozen Rules for Breaking News Profile (v2.1.0)

The **Breaking News Profile v2.1.0** is officially declared a **Constitutionally Frozen Module**.

### Permitted Maintenance Activities:
- ✅ **Bug Fixes**: Critical runtime errors, unhandled exceptions, or websocket disconnect handling.
- ✅ **Security Fixes**: Sanitization of Google Sheet inputs or XSS safeguards.
- ✅ **Performance Optimizations**: Garbage collection tweaks or memory retention reduction without visual alterations.

### Strictly Prohibited Modifications:
- ❌ **Typography**: Font family, font size (`59px`), vertical offset (`translateY(-11px)`), line-height, letter-spacing.
- ❌ **Geometry & Baseline**: Y-position (`890px`), container height (`135px`), width (`1920px`).
- ❌ **Motion & Animation**: Reveal style (`clip-path: inset(0 50% 0 50%) ➔ inset(0 0% 0 0%)`), opacity helper bounds (`0.95 ➔ 1.00`), stage durations (`300ms` / `4000ms` / `300ms`).
- ❌ **Optical Timing**: Stage gap (`70ms Production-Calibrated Final Value`).
- ❌ **Persistent Bar Lifecycle**: Single `BAR_IN` on trigger, single `BAR_OUT` on STOP.
- ❌ **SSOT Model Architecture**: Single Source of Truth isolation (`BreakingFeedModel`).

---

*Document version: v1.0.0 (Engineering Governance & Production Calibration Lock).*
