# Badge Motion Engine Architecture

The **Badge Motion Engine** isolates and controls the hardware-accelerated entrance, hold, and exit animations for the category/district label badge.

---

## 🏛️ Architecture Flow

```text
       [ Timeline Events ]
                │
                ▼
     [ Badge Motion Engine ]
                │
                ▼
       [ Static Renderer ]
```

---

## 🔑 Supported Motion Transitions

1. **`BADGE_IN`**:
   Translates smoothly from `translateX(-100%)` to `translateX(0)` with opacity fade-in over 300ms (`ease-out`).

2. **`BADGE_HOLD`**:
   Holds perfectly still at `translateX(0)` with opacity 1.

3. **`BADGE_OUT`**:
   Translates smoothly from `translateX(0)` to `translateX(-100%)` with opacity fade-out over 250ms (`ease-in`).

---

## 🛡️ Performance & Isolation Rules

- **GPU Only**: Animates **ONLY** `transform` and `opacity`.
- **Zero Reflow**: Never animates `left`, `top`, `width`, `height`, `margin`, or `padding`.
- **Dynamic Optimization**: Applies `will-change: transform, opacity` strictly during active transitions and removes hints immediately upon completion.
