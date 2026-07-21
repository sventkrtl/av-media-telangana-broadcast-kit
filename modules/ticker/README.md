# Broadcast Ticker Module

A lightweight, 60fps marquee ticker module built on top of the **AV Media Telangana Broadcast Graphics SDK**.

---

## 📁 Architecture

```
ticker/
├── index.html       # OBS Browser Source Entrypoint
├── ticker.css       # Core Ticker Layout & Typography
├── ticker.js        # SDK Engine Integration & Logic
├── config.json      # Headline text, speed, & category preset
├── themes/          # Theme variations (default.css, breaking.css)
├── animations/      # Keyframe marquee animations
└── assets/          # Brand badges & logo graphics
```

---

## ⚡ Features & Usage

- **Zero-Dependency SDK Integration**: Uses shared `FontEngine`, `ConfigEngine`, and `ThemeEngine`.
- **Telugu Script Optimized**: Native support for `Noto Sans Telugu` and `Ramabhadra` broadcast typography.
- **OBS Studio Setup**: Load `index.html` as a 1920x1080 Browser Source.
