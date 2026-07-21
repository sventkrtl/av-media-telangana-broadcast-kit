# Static Renderer Architecture

The **Static Renderer** converts standardized `TimelineEvent[]` objects into static DOM elements for visual layout verification.

---

## 🏛️ Architecture Flow

```text
       [ Timeline Events ]
                │
                ▼
       [ Static Renderer ]
                │
                ▼
         [ DOM Container ]
```

---

## 🔑 Visual Rendering Components

1. **Badge**: Left-aligned, displays current playlist label. Theme color determined by content category. Fixed height, AUTO width.
2. **News Text**: Displays current news text string immediately following the badge.
3. **Logo Separator**: Displays `assets/logos/logo-round.png` between consecutive news items. Preserves aspect ratio, 80% crawl height.

---

## 🛡️ Static Verification Rule

The Static Renderer renders **ONE static frame or timeline sequence node array** for layout inspection. It contains **NO animations, NO CSS keyframes/transitions, NO scrolling, and NO timeline playback**.
