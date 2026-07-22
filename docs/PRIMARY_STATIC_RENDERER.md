# 🖼️ Primary Static Renderer Architecture & Specifications (Task P1-3)

This document describes the responsibilities, DOM structure, layout geometry, and strict boundary rules for the **`PrimaryStaticRenderer`**.

Strictly adheres to [`PRIMARY_HEADLINE_ENGINE_SPEC.md`](../PRIMARY_HEADLINE_ENGINE_SPEC.md) v1.0.

---

## 📐 1. DOM Hierarchy & Absolute Geometry

The static renderer builds and maintains a clean 3-tier DOM tree positioned at absolute 1080p canvas coordinates:

```
[ Primary Container ] (Absolute: 1920x135 at X:0, Y:890, Bottom:1025)
       │
       └── [ #ph-blue-bar ] (Always Blue #0F172A, Full Width, Flex Center)
                 │
                 └── [ #ph-headline-text ] (Always White #FFFFFF, Ramabhadra Font, Center Aligned, Single Line)
```

| Parameter | Absolute Value | CSS Mapping |
|---|---|---|
| **Canvas Resolution** | `1920 × 1080` | Canvas Container |
| **Bar X Position** | `0 px` | `left: 0px` |
| **Bar Y Position** | `890 px` | `top: 890px` |
| **Bar Width** | `1920 px` | `width: 1920px` |
| **Bar Height** | `135 px` | `height: 135px` |
| **Bar Bottom Edge** | `1025 px` | `890px + 135px` |
| **Title-Safe Padding**| `40 px` | `padding: 0 40px` |

---

## 🎨 2. Color & Typography Rules

- **Bar Background**: **Always Blue** (`#0F172A`). No theme switching or category color overrides permitted.
- **Headline Text Color**: **Always White** (`#FFFFFF`).
- **Font Stack**: `'Ramabhadra', 'Noto Sans Telugu', system-ui, sans-serif`.
- **Text Alignment**: **Always Center** (`text-align: center`).
- **Single-Line Guarantee**: `white-space: nowrap`, `overflow: hidden`. Text never wraps to a second line.
- **Sanitization**: Newlines, tabs, emojis, icons, and bullets (`•`, `✦`, `★`, `▶`) are stripped during rendering.

---

## ⛔ 3. Strict Boundary Responsibilities

```
                               ┌───────────────────────────┐
                               │ PrimaryStaticRenderer     │
                               └─────────────┬─────────────┘
                                             │
               ┌─────────────────────────────┴─────────────────────────────┐
               ▼                                                           ▼
       ✅ WHAT IT DOES                                             ❌ WHAT IT DOES NOT DO
  -----------------------------                               ---------------------------------
  • Create DOM Nodes                                          • Execute CSS Animations / Transitions
  • Update Headline Text                                      • Manage Playback State
  • Enforce Single-Line                                       • Drive Timeline Events
  • Clear DOM Content                                         • Perform Font Auto-Scaling (Runtime Task)
  • Destroy DOM Nodes                                         • Load Feed Data
```

---

## 🕹️ 4. Public API Reference

```javascript
import { PrimaryStaticRenderer } from './renderer/PrimaryStaticRenderer.js';

const renderer = new PrimaryStaticRenderer();

// 1. Initialize DOM nodes inside parent container
renderer.initialize(document.getElementById('ph-overlay'));

// 2. Render / update headline text
renderer.renderHeadline('తెలంగాణలో విస్తారంగా కురుస్తున్న వర్షాలు');

// 3. Clear text
renderer.clear();

// 4. Destroy DOM nodes
renderer.destroy();
```
