# 🎬 Primary Motion Engine Architecture & Specifications (Task P1-2)

This document describes the design, timing parameters, stage lifecycle, and GPU safety policy for the **`PrimaryMotionEngine`**.

Strictly adheres to [`PRIMARY_HEADLINE_ENGINE_SPEC.md`](../PRIMARY_HEADLINE_ENGINE_SPEC.md) v1.0.

---

## 📐 1. Five-Stage Motion Lifecycle

The Primary Motion Engine drives 5 non-overlapping animation stages:

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Stage 1:     │ ───► │ Stage 2:     │ ───► │ Stage 3:     │ ───► │ Stage 4:     │ ───► │ Stage 5:     │
│ BAR_IN       │      │ TEXT_IN      │      │ TEXT_HOLD    │      │ TEXT_OUT     │      │ BAR_OUT      │
│ (300 ms)     │      │ (300 ms)     │      │ (4000 ms)    │      │ (300 ms)     │      │ (300 ms)     │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
```

---

## ⏱️ 2. Stage Details & Motion Specifications

| Stage | Duration | Animation Mechanics | Constraints & Rules |
|---|---|---|---|
| **`BAR_IN`** | `300 ms` | `transform: scaleX(0)` → `scaleX(1)` with `transform-origin: left center` | **NO translate** (`translateX`). The bar ONLY reveals via scaleX. |
| **`TEXT_IN`** | `300 ms` | `clip-path: inset(0 50% 0 50%)` → `clip-path: inset(0 0% 0 0%)`, opacity `0` → `1` | **NO horizontal sliding**. **NO horizontal translation**. Symmetrical center reveal. |
| **`TEXT_HOLD`** | `4000 ms` | Stationary hold phase (`clip-path: inset(0 0% 0 0%)`, opacity `1`) | **Zero movement**. Completely still. |
| **`TEXT_OUT`** | `300 ms` | `clip-path: inset(0 0% 0 0%)` → `clip-path: inset(0 50% 0 50%)`, opacity `1` → `0` | Exact reverse of `TEXT_IN`. Symmetrical center collapse. |
| **`BAR_OUT`** | `300 ms` | `transform: scaleX(1)` → `scaleX(0)` with `transform-origin: right center` | Exact reverse of `BAR_IN`. Scale collapse to right. |

---

## 🛡️ 3. GPU Safety & Reflow Policy

To guarantee 60 FPS continuous broadcast rendering inside OBS Browser Source (CEF):

### Allowed Properties (GPU Accelerated):
- ✅ `transform` (`scaleX()`, `translate3d()`)
- ✅ `opacity`
- ✅ `clip-path` (`inset()`)

### Strictly Prohibited Properties (Layout Reflow Risk):
- ❌ `width` / `height`
- ❌ `top` / `bottom` / `left` / `right`
- ❌ `margin` / `padding`
- ❌ `font-size` (during animation)

---

## 🕹️ 4. Public API Reference

```javascript
import { PrimaryMotionEngine, MOTION_STAGES } from './motion/PrimaryMotionEngine.js';

const motionEngine = new PrimaryMotionEngine({
  barInDuration: 300,
  textInDuration: 300,
  textHoldDuration: 4000,
  textOutDuration: 300,
  barOutDuration: 300
});

// Play a specific stage
await motionEngine.play(MOTION_STAGES.BAR_IN, barElement, textElement);

// Control playback
motionEngine.pause();
motionEngine.resume();
motionEngine.stop();
motionEngine.reset();
motionEngine.destroy();
```

---

## 🔒 5. Overlapping Stage Prevention

- **Sequential Execution**: `play()` returns a `Promise` that resolves only when the current stage animation completes.
- **Overlapping Guard**: Invoking `play()` while a stage is active throws an explicit error (`"Overlapping stage call blocked"`).
