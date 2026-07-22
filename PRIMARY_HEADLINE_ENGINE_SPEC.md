> ఇది Project Constitution.
>
> అంటే ఇకపై AI ఊహించకూడదు. మనం నిర్ణయించిన Rules మాత్రమే Follow చేయాలి.
>
> **Governance Rule**: ఈ Document ఎప్పటికీ Edit చేయకూడదు. ఒకసారి Accepted అయితే, భవిష్యత్తులో మార్పులు వస్తే `PRIMARY_HEADLINE_ENGINE_SPEC_v2.md` లేదా ADR (Architecture Decision Record) రూపంలో మాత్రమే నమోదు చేయాలి.

---

# 📜 AV Media Telangana – Primary Headline Engine Constitution v1.0

## 🚫 ABSOLUTE RULE

This document overrides any AI assumptions, UI redesign ideas, or future creative reinterpretations.

If there is any conflict between previous implementations, suggestions, or ideas and this document, **THIS DOCUMENT ALWAYS WINS**.

This document is the **ONLY** source of truth for the Primary Headline Engine.

---

## 1. Product Identity

### Official Name
**Primary Headline Engine**

### Purpose
Present the channel's most important headline with premium broadcast presentation.

### This is NOT:
- ❌ A Ticker
- ❌ A Crawl
- ❌ A Playlist Marquee

### This IS:
- A **Headline Presentation Engine** designed to showcase high-priority broadcast headlines one at a time with supreme clarity.

---

## 2. Screen Layout & Absolute Geometry

All positioning coordinates are **ABSOLUTE** within the 1080p Broadcast Canvas. They must **NEVER** be calculated dynamically or relative to other layers.

| Parameter | Absolute Value | Notes |
|---|---|---|
| **Canvas Resolution** | `1920 × 1080` | Broadcast Standard (16:9) |
| **X Coordinate** | `0 px` | Left Edge |
| **Y Coordinate** | `890 px` | Top Edge of Primary Bar |
| **Width** | `1920 px` | Full Screen Width |
| **Height** | `135 px` | Fixed Bar Height |
| **Bottom Coordinate** | `1025 px` | Y (890) + Height (135) |

> [!IMPORTANT]
> The bottom edge of the Primary Bar sits directly at `Y = 1025px`, placing it immediately above the Secondary Crawl Bar (`Y = 1025px` to `1077px`).

---

## 3. Bar & Text Styling Rules

- **Bar Background Color**: **Always Blue** (`#0F172A` / `#1E3A8A` broadcast blue base token).
- **Text Color**: **Always White** (`#FFFFFF`).
- **Bar Structure**: Permanent layer. The bar itself **never moves** after its initial entry reveal.
- **Headline Content**: Only the headline content inside the bar changes between items.

---

## 4. Typography & Layout Constraints

### Primary Font Stack
1. `Ramabhadra` (Primary Telugu Headline Font)
2. `Noto Sans Telugu` (Secondary Fallback)
3. `sans-serif` (System Fallback)

### Alignment Rules
- **Text Alignment**: **Always Center** (`text-align: center`).
- ❌ **Never** Left
- ❌ **Never** Right
- ❌ **Never** Justify

### Strict Text Constraints
- **Single Line Only**: Exactly **ONE** line is allowed.
- ❌ Multiple lines are **strictly prohibited**.
- ❌ **No Scrolling** / No Crawling
- ❌ **No Marquee** / No horizontal movement
- ❌ **No Icons**
- ❌ **No Emojis**
- ❌ **No Bullets**
- Headline text must always remain centered within the bar.

---

## 5. Automatic Font Scaling

- Automatically scale font size down so that any headline fits onto a **single line**.
- **Never wrap text** to a second line.
- Font scaling algorithm must preserve visual legibility and readability across all screen sizes.

---

## 6. Primary Motion Language (5-Stage Animation Lifecycle)

The Primary Headline Engine adheres to a strict 5-stage motion lifecycle:

```
[Stage 1: Bar Reveal] ➔ [Stage 2: Headline Reveal] ➔ [Stage 3: Headline Hold] ➔ [Stage 4: Headline Hide] ➔ [Stage 5: Bar Hide]
```

### Stage 1: Blue Bar Reveal
- **Direction**: Left → Right
- **Duration**: `300 ms`
- **Animation Type**: Scale Reveal (`transform: scaleX(0)` → `scaleX(1)`)
- **Transform Origin**: `Left`
- **Constraint**: The bar **NEVER translates** (no `translateX`). The bar **ONLY reveals** via scaleX.

### Stage 2: Headline Reveal
- **Direction**: Center → Outside (symmetrical reveal)
- **Duration**: `300 ms`
- **Constraint**: The headline **NEVER slides**. The headline **NEVER moves horizontally**. The headline is revealed symmetrically from its center point.

### Stage 3: Headline Hold
- **Duration**: `4000 ms` (4 Seconds)
- **State**: Stationary. **Zero movement**.

### Stage 4: Headline Hide
- **Direction**: Outside → Center
- **Duration**: `300 ms`
- **Animation Type**: Symmetrical collapse back to center (exact reverse of Stage 2 Headline Reveal).

### Stage 5: Blue Bar Hide (Optional End-of-Feed or Transition)
- **Direction**: Right → Left
- **Duration**: `300 ms`
- **Animation Type**: Scale collapse (`scaleX(1)` → `scaleX(0)` with transform origin `Right`, exact reverse of Stage 1 Bar Reveal).

---

## 7. Playback & Looping Strategy

Continuous infinite loop sequence:

$$\text{Headline 1} \longrightarrow \text{Headline 2} \longrightarrow \text{Headline 3} \longrightarrow \dots \longrightarrow \text{Headline } N \longrightarrow \text{Headline 1 (Loop)}$$

- Each headline completes Stage 2 (Reveal), Stage 3 (Hold 4000ms), and Stage 4 (Hide) before the next headline enters via Stage 2.
- The blue bar remains visible and fixed on screen between consecutive headlines during normal loop playback.

---

## 8. Breaking News Engine Compatibility

- When a **Breaking News Event** is triggered by the future Breaking Engine:
  1. The Breaking Engine **temporarily replaces** the Primary Headline content.
  2. Primary Headline playback pauses/defers safely.
  3. When the Breaking News event concludes, the Primary Headline Engine **resumes automatically** from the next scheduled headline item in the queue.

---

## 9. Performance Constraints

- **Target Frame Rate**: **60 FPS** smooth animation.
- **Hardware Acceleration**: **GPU accelerated transforms only** (`transform: scaleX()`, `opacity`, `translate3d()`).
- **Reflow Prevention**: **Zero layout reflows**. Never animate `width`, `height`, `margin`, `padding`, `top`, or `left`.
- **DOM Efficiency**: No unnecessary DOM destruction or rebuilds during playback loop.

---

## 10. Visual Philosophy

> **"The animation exists to support readability."**
> 
> **"The animation must NEVER draw more attention than the headline itself."**
> 
> **"The viewer should remember the NEWS, not the animation."**

---

## 11. Scope Boundaries (Out of Scope for P1-0)

The following components are strictly out of scope for Task P1-0:
- No JavaScript runtime code.
- No HTML/CSS renderer implementation.
- No animation driver code.
- No Google Sheet Provider implementation.
- No Control Panel tab or UI.
- No OBS integration.

---

## 12. Immutability & ADR Governance

- **Document Immutability**: Once accepted by the team, `PRIMARY_HEADLINE_ENGINE_SPEC.md` is **IMMUTABLE**. It must never be directly edited or overwritten for future feature iterations.
- **Future Changes**: Any future architectural or design revisions must be documented in `PRIMARY_HEADLINE_ENGINE_SPEC_v2.md` or created as numbered **Architecture Decision Records (ADRs)** in `docs/adr/`.
- **Historical Traceability**: Versioned governance ensures a complete, unbroken record of "Why was this decision made?" for future developers and maintainers.
