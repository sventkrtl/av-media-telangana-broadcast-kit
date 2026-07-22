> ఇది Project Constitution.
>
> అంటే ఇకపై AI ఊహించకూడదు. మనం నిర్ణయించిన Rules మాత్రమే Follow చేయాలి.

---

# 📜 AV Media Telangana – Primary Headline Engine Constitution v1.0

## 🚫 ABSOLUTE RULE

This document overrides any AI assumptions, UI redesign ideas, or future creative reinterpretations.

If there is any conflict between previous implementations, suggestions, or ideas and this document, **THIS DOCUMENT ALWAYS WINS**.

This engine specification is now **Feature Locked by Specification**.

---

## 1. Product Identity

### Official Name
**Primary Headline Engine**

### Purpose
Display the channel's most important headline.

### This is NOT:
- ❌ A ticker
- ❌ A crawl
- ❌ A marquee
- ❌ A playlist crawl

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

## 3. Visual Role & Priority

- The Primary Headline Bar has **higher visual hierarchy and priority** than the Secondary Crawl.
- **Only ONE headline** is visible on screen at any given instant.

---

## 4. Bar Behaviour (Permanent Layer)

The Primary Headline Bar structure itself is a **permanent broadcast element**.

The Bar **NEVER**:
- ❌ Slides In
- ❌ Slides Out
- ❌ Fades In
- ❌ Fades Out
- ❌ Disappears during scene or headline changes

Only the headline content inside the bar animates during headline transitions.

---

## 5. Headline Behaviour & Transitions

### Sequence
1. Headline 1 enters.
2. Headline 1 remains static and fully visible for the designated hold duration.
3. Headline 1 exits.
4. Headline 2 enters.
5. Continuous infinite loop.

### Strict Transition Rules
- Headline content ONLY animates.
- The background bar remains completely stationary.

---

## 6. Strict Prohibition of Scrolling (NO CRAWL / MARQUEE)

The text content in the Primary Headline Engine:
- ❌ Must **NEVER** crawl.
- ❌ Must **NEVER** marquee.
- ❌ Must **NEVER** move horizontally across the screen.

All headline content presentation must be stationary during the hold phase.

---

## 7. Content Source & Looping Strategy

- **Source**: Dedicated Google Sheet for Primary Headlines.
- **Structure**: One row = One headline.
- **Loop Strategy**: Infinite continuous sequence:
  `Headline 1 → Headline 2 → ... → Headline N → Headline 1`

---

## 8. Breaking News Engine Compatibility

- When a **Breaking News Event** is triggered by the future Breaking Engine:
  1. The Breaking Engine **temporarily replaces** the Primary Headline content.
  2. Primary Headline playback pauses/defers.
  3. When the Breaking News event concludes, the Primary Headline Engine **resumes automatically** from where it was suspended or from the latest feed item.

---

## 9. Performance & Animation Constraints

- **Target**: 60 FPS continuous smooth animation.
- **Transforms**: Use **GPU-accelerated CSS properties only** (`transform: translate3d()`, `opacity`).
- **Reflow Prevention**: **Zero DOM layout reflows** during transitions (`width`, `height`, `margin`, `padding`, `top`, `left` MUST NOT be animated).

---

## 10. Scope Boundaries (Out of Scope for P1-0)

The following components are strictly out of scope for this specification task:
- No JavaScript runtime code.
- No HTML/CSS renderer implementation.
- No animation driver code.
- No Google Sheet Provider implementation.
- No Control Panel tab or UI.
- No OBS scene implementation.

---

## 11. Document Status

- **Status**: ✅ CONSTITUTIONALLY LOCKED
- **Phase**: P1-0 (Foundation Specification)
- **Governance**: All future code, providers, and modules for the Primary Headline Engine MUST conform 100% to this document.
