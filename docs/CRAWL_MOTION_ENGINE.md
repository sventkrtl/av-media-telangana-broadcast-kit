# Constant Pixel-per-Second Crawl Engine Architecture

The **Crawl Motion Engine** calculates dynamic travel durations for scrolling headlines to maintain a constant visual reading speed across all broadcast news items.

---

## 🏛️ Architecture Flow

```text
       [ Timeline Events ]
                │
                ▼
     [ Crawl Motion Engine ]
                │
                ▼
       [ Static Renderer ]
```

---

## 📐 Constant Velocity Formula

Duration is **NEVER** fixed. It is calculated dynamically for every headline:

$$\text{Travel Distance} = \text{Text Width} + \text{Viewport Width} + \text{Configured Gap}$$

$$\text{Duration (seconds)} = \frac{\text{Travel Distance}}{\text{Pixels Per Second}}$$

- **Short News**: Short travel distance ──> Finishes sooner.
- **Long News**: Long travel distance ──> Takes longer.
- **Visual Reading Speed**: Constant at all times (`linear` timing, no easing).

---

## 🛡️ Performance & Isolation Rules

- **GPU Only**: Animates **ONLY** `transform: translate3d(x, 0, 0)`.
- **Zero Reflow**: Never animates `left`, `top`, `width`, `height`, `margin`, or `padding`.
- **Full Traversal**: News enters completely outside the right viewport edge and exits completely beyond the left edge before `NEWS_END` triggers.
