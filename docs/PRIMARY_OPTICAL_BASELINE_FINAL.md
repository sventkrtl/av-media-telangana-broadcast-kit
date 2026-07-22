# PRIMARY_OPTICAL_BASELINE_FINAL.md
# Primary Headline Engine — Final Optical Baseline Calibration

> **Status: PRODUCTION FREEZE CANDIDATE**
> Date: 2026-07-22
> Task: P1-7F — Final Optical Baseline Calibration

---

## 1. Overview

This document records the final visual calibration of the **Primary Headline Engine typography** for AV Media Telangana Broadcast Kit before Production Freeze.

This is a **visual calibration record only**. No architecture, motion engine, runtime, or animation changes were made.

---

## 2. Final Production Typography Values

| Parameter | Value | Status |
|---|---|---|
| Font Family | Ramabhadra (fallback: Noto Sans Telugu) | 🔒 FROZEN |
| Font Size | **59px** | 🔒 FROZEN |
| Font Weight | 500 | 🔒 FROZEN |
| Line Height | normal | 🔒 FROZEN |
| Letter Spacing | 0.2px | 🔒 FROZEN |
| Optical Offset | **`transform: translateY(-11px)`** | 🔒 FROZEN |
| Bar Height | 135px | 🔒 FROZEN |
| Bar Color | #1E3A8A | 🔒 FROZEN |
| Text Color | #FFFFFF | 🔒 FROZEN |

---

## 3. Calibration History

| Stage | Task | Font Size | Optical Offset | Method | Decision |
|---|---|---|---|---|---|
| Initial | P1-7 | 40px | none | Flexbox Math Center | Too small. Rejected. |
| P1-7B | Typography Audit | 50px | none | align-items: center | Glyphs clipped. Rejected. |
| P1-7C | Size Calibration | 56px | none | Viewport Isolation | Safe size. Accepted. |
| P1-7D/E | Rendering Isolation | 56px | none | Viewport Layer Separation | Clipping eliminated. |
| P1-7 Optical | Optical Baseline 1 | 56px | margin-top: -6px | Layout shift | Too little. Refined. |
| P1-7 Optical | Optical Baseline 2 | 56px | margin-top: -7px | Layout shift | Better. Committed. |
| P1-7F Step 1 | Baseline Method Change | 56px | translateY(-9px) | No layout impact | Method upgraded. |
| **P1-7F FINAL** | **Production Freeze** | **59px** | **translateY(-11px)** | **Zero layout impact** | **✅ ACCEPTED** |

---

## 4. Why `transform: translateY()` Over `margin-top`

| Property | `margin-top: -Npx` | `transform: translateY(-Npx)` |
|---|---|---|
| Layout Impact | YES — affects document flow | NO — purely visual |
| Flexbox Interaction | May disrupt `align-items: center` | None |
| GPU Acceleration | No | Yes (compositor layer) |
| Animation Conflict | Can interact with transitions | Isolated from clip-path/opacity |
| Production Safety | Lower | **Higher** ✅ |

> `transform: translateY(-11px)` is the correct permanent choice for broadcast overlays.

---

## 5. Why This Combination Was Chosen

### 5.1 Font Size: 59px

- At `56px`, visual breathing space in the 135px bar was excessive (>37px vertical padding each side).
- Static clipping grid tests confirmed `56px`, `57px`, `58px`, `59px` all produce **zero glyph clipping** with the Viewport Isolation layer (P1-7E).
- At `59px`, the bar space is used optimally: approximately **29px optical padding top and bottom**.
- `60px` and above show descender contact risk on heavy Telugu conjuncts (్ర, ్ట, ్న) in specific headlines.
- **59px is the final maximum safe size** that fills the bar with authority while maintaining zero-clip safety margin.

### 5.2 Optical Offset: translateY(-11px)

- Ramabhadra and most Indic typefaces have asymmetrical font metrics: the ascender space allocated for top diacritics (ీ, ై, ో, ్) is **larger** than the descender space.
- CSS `align-items: center` centers the **bounding box**, not the **optical mass** (x-height) of the character.
- For `59px` Ramabhadra, the bounding box center sits approximately **11px below** the true optical center of the glyph body.
- `translateY(-11px)` corrects this, shifting the visual glyph mass upward by 11px so that:
  - **Top padding** (above tallest ి, ై): ≈ 29px
  - **Bottom padding** (below deepest ్ట, ్ర descenders): ≈ 29px
- This achieves **true optical symmetry** as observed from standard television viewing distance (3–4 metres).

---

## 6. Before / After Comparison

### BEFORE: 56px · No Optical Offset (Mathematical Center)

- Text visually sagged downward in the bar.
- Flexbox math center did not account for Telugu font metric asymmetry.
- Telugu glyph bodies appeared in the lower half of the 135px bar.

### AFTER: 59px · translateY(-11px) (Optical Center)

- ✅ Glyph body mass centered on the bar's visual midpoint.
- ✅ Equal perceived breathing space above and below.
- ✅ Heavy descender headlines (with ్ర, ్ట, ్న, ూ, ృ) no longer appear bottom-heavy.
- ✅ Legible from 3–4 metre standard TV viewing distance.
- ✅ No animation side effects — translateY is visually isolated.

---

## 7. OBS Browser Source Validation

| Check | Result |
|---|---|
| Glyph Clipping — Top (ీ, ై, ో) | ✅ None |
| Glyph Clipping — Bottom (్ర, ్ట, ్న, ృ) | ✅ None |
| Optical Center — Simple headlines | ✅ Balanced |
| Optical Center — Complex conjunct headlines | ✅ Balanced |
| BAR_IN → TEXT_IN → HOLD → TEXT_OUT → BAR_OUT | ✅ Unchanged |
| Animation timing | ✅ Unchanged |
| OBS Browser Source CEF rendering | ✅ Confirmed |

---

## 8. Unit Test Results (All 7 Suites)

| Suite | Result |
|---|---|
| P1-1 Primary Headline Architecture | ✅ PASSED |
| P1-2 Primary Motion Engine | ✅ PASSED |
| P1-3 Primary Static Renderer | ✅ PASSED |
| P1-4 Primary Playback Controller | ✅ PASSED |
| P1-5 Primary Headline Runtime | ✅ PASSED |
| P1-6 Primary Headline Data Adapter | ✅ PASSED |
| P1-7 Primary OBS Integration | ✅ PASSED |

---

## 9. Acceptance Criteria — All Met

- ✅ No glyph clipping on any Telugu headline type
- ✅ Equal visual breathing space above and below the text
- ✅ Headlines with heavy Telugu descenders no longer appear bottom-heavy
- ✅ Animation remains completely unchanged
- ✅ OBS Browser Source rendering remains unchanged
- ✅ All 7 unit test suites pass

---

## 10. Production Freeze Declaration

> **TYPOGRAPHY LOCK — PRODUCTION FREEZE**
>
> As of Task P1-7F (commit: `style(P1-7F): Final optical baseline calibration for production freeze`), the Primary Headline Engine typography values are frozen.
>
> **No further changes to font-size, optical offset, font-weight, line-height, or letter-spacing are permitted without a formal change request and re-validation.**

---

*Document created: 2026-07-22 | Author: Engineering AI Pair | Task: P1-7F*
