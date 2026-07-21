> పర్ఫెక్ట్ ఇప్పుడు ఆంటిగ్రావిటిని డ్రిఫ్ట్ కాకుండా మన పని 100% పూర్తి అయ్యేలా చేయాలి ఎందుకంటే ఇంతకముందు చేసిన డిజైన్ ఊహల్లోనే మళ్ళీ మన పనిని మార్చే అవకాశం ఉంది.
>
> ఇది నేను Antigravity కి ఇవ్వమనే Prompt కాదు.
>
> ఇది Project Constitution.
>
> అంటే ఇకపై AI ఊహించకూడదు. మనం నిర్ణయించిన Rules మాత్రమే Follow చేయాలి.

---

# 📜 AV Media Telangana – Secondary News Playlist Engine Constitution v1.0

## 🚫 ABSOLUTE RULE

This document overrides any AI assumptions, UI redesign ideas, or future creative reinterpretations.

If there is any conflict between previous implementations and this document, **THIS DOCUMENT ALWAYS WINS**.

This engine is now Feature Locked by Behaviour Specification.

---

## 1. Product Identity

### Official Name
**Secondary News Playlist Engine**

### This is NOT:
- A ticker
- A marquee
- A scrolling text widget

### This IS:
- A **Permanent Broadcast Information Layer**.

---

## 2. Product Mission

Provide continuous district/category news information without visual distraction.
- The bar itself never appears or disappears.
- Only its content changes.

---

## 3. Permanent Bar Rules

The crawl bar is permanently visible.

It **NEVER**:
- ❌ Slides In
- ❌ Slides Out
- ❌ Fades In
- ❌ Fades Out

Video advertisements, scene switching, primary headline changes, and breaking news must **NOT** animate this bar. It always stays on screen.

---

## 4. Label Badge Rules

The left badge represents the current playlist label.

### Examples
- జగిత్యాల
- ఖమ్మం
- హైదరాబాద్
- క్రీడలు
- వ్యాపారం
- వాతావరణం
- అంతర్జాతీయం

### Badge Behaviour
Only when the playlist label changes:

```
Badge IN ──> Hold ──> Remain Visible ──> News Playlist ──> Badge OUT ──> Next Badge
```

Badge **NEVER** animates between news items inside the same playlist.

---

## 5. Badge Layout Rules

- **Height**: Fixed forever.
- **Padding**: Fixed forever.
- **Corner Radius**: Fixed forever.
- **Font Size**: Fixed forever.
- **Width**: **AUTO** (Calculated from text width).

### Examples
- `ఆదిలాబాద్` ──> Small width
- `మహబూబాబాద్` ──> Larger width

Height **NEVER** changes. Only width expands.

Use minimum width and auto expansion so short labels do not look visually tiny. This follows common responsive UI sizing practices.

---

## 6. Theme Rules

Themes are based on **CONTENT TYPE**. Never based on district.

| Theme | Color |
| :--- | :--- |
| **District** | Grey |
| **Sports** | Green |
| **Weather** | Blue |
| **Business** | Gold |
| **International** | Purple |
| **Entertainment** | Pink |
| **Technology** | Cyan |

- District names **NEVER** change colour.
- Only content category changes theme.

---

## 7. Playlist Rules

Each playlist contains:
```
Label ──> News[]
```

### Example
- **Jagityal**: News 1, News 2, News 3

---

## 8. News Separator Rules

Between news items **ONLY** show **AV Media Telangana Round Logo**.

### Example
```
News 1 ──> LOGO ──> News 2 ──> LOGO ──> News 3
```

**NO separator** between playlists. Badge animation itself is the separator.

---

## 9. Logo Rules

The logo asset may be:
- PNG
- SVG
- WEBP
- JPG
- Any aspect ratio.

### Engine Rules
- **Height**: 80% of crawl height
- **Width**: AUTO
- **Aspect Ratio**: Always Preserve
- Never stretch.
- Never crop.
- Always vertically centered.

---

## 10. Crawl Behaviour

Inside one playlist:
```
News 1 ──> Logo ──> News 2 ──> Logo ──> News 3
```

- Each news item must completely finish scrolling before Logo appears.
- Logo must completely pass before next news starts.
- Nothing overlaps.

---

## 11. Scroll Algorithm

**DO NOT** use Fixed Duration.

Use:
$$\text{Duration} = \frac{\text{Travel Distance}}{\text{Pixels Per Second}}$$

- **Pixels/sec** is constant.
- **Duration** changes.
- Reading speed never changes.

This avoids long headlines appearing unnaturally fast and matches the way professional scrolling systems keep a constant visual velocity.

---

## 12. Queue Rules

Queue order **must never change automatically**.
- Operator controls order.
- Engine only renders.

---

## 13. Loop Rules

- After Last News ──> Loop ──> First News
- After Last Playlist ──> Loop ──> First Playlist
- **Infinite loop.**

---

## 14. Operator Experience

- Operator **never** inserts Logo separators. Engine inserts them automatically.
- Operator only provides: **Label**, **Theme**, **News**. Nothing else.

---

## 15. Runtime Rules

Engine must **NEVER** modify:
- Protocol
- Runtime
- StateEngine
- HTTP Server
- WebSocket

This engine is only a **Runtime Client**.

---

## 16. Animation Rules

- **Badge**: Animates.
- **News**: Scrolls.
- **Logo**: Scrolls.
- **Bar**: Never animates.

---

## 17. Performance Rules

- **60 FPS target**.
- **GPU Transform Only Rule**: Renderer MUST ONLY animate using `transform` (`translateX` / `translate3d`).
- **NO Layout Reflow**: Renderer MUST NEVER animate `left`, `top`, `width`, or `height` during movement.
- GPU accelerated transforms.
- No layout thrashing.
- No DOM rebuild during scrolling.
- Only update when playlist changes.

---

## 18. Future Compatibility

This engine must support:
- District
- Sports
- Business
- International
- Weather
- Technology
- Entertainment

...without changing engine code. Only data changes.

---

## 19. Freeze Rule

Once implemented, **NO feature may be added** unless it improves performance, stability, or fixes a bug.

- No cosmetic redesigns.
- No AI-generated UI reinterpretations.