# AV Media Telangana Broadcast Kit (v1.0)

A high-performance, broadcast-grade Web Graphics SDK and Production Control System engineered specifically for **OBS Studio** Browser Sources and Custom Browser Docks.

Built using zero-dependency, hardware-accelerated **HTML5, CSS3, and Vanilla JavaScript (ES6 Modules)** for 60fps ultra-low latency rendering on Windows and Linux.

---

## 🏛️ Broadcast Graphics SDK Architecture

```
av-media-telangana-broadcast-kit/

├── README.md               # Master Project Documentation & OBS Integration Guide
├── LICENSE                 # MIT License
├── .gitignore              # Git ignore rules
├── CHANGELOG.md            # Release notes & version history
├── ROADMAP.md              # Planned features & version targets

├── shared/                 # Core SDK Engines & Shared Tokens
│   ├── engines/            # Broadcast Graphics SDK Core Engines
│   │   ├── index.js        # Master SDK Export Entrypoint
│   │   ├── ThemeEngine.js  # Dynamic Theme & Token Controller
│   │   ├── FontEngine.js   # Telugu & English Broadcast Typography Loader
│   │   ├── AudioEngine.js  # Broadcast Sound Effect Player
│   │   ├── ConfigEngine.js # Config & Preset Loader
│   │   └── ApiEngine.js    # Data Connector (REST / WebSockets)
│   ├── css/                # Global Resets, Category Color Tokens & Utilities
│   ├── js/                 # EventBus & Real-time State Synchronization Engine
│   ├── animations/         # GPU-Accelerated CSS Marquee & Keyframe Library
│   └── config/             # Channel & Global JSON Presets

├── control-panel/          # Central Production Control Panel (OBS Dock)
│   ├── index.html          # Control Panel UI Canvas
│   ├── control-panel.css   # Dark-themed Broadcast Dock Layout
│   └── control-panel.js    # Preview, Apply, Speed, Theme & Recent History Engine

├── modules/                # Standalone Graphics Micro-Project Modules
│   └── ticker/             # Ticker Engine Module (v1.0)
│       ├── index.html      # OBS Browser Source Entrypoint (1920x1080)
│       ├── ticker.css      # Ticker Layout & Category Color Rules
│       ├── ticker.js       # Module Controller & SDK Integration
│       ├── config.json     # Headline text & preset configuration
│       ├── themes/         # Theme stylesheets (default.css, breaking.css)
│       └── animations/     # Ticker Marquee Scroll Animations

├── docs/                   # Architectural & System Guides
│   ├── Architecture.md     # System design & overlay dataflow
│   ├── Design-System.md    # Typography, color tokens & visual rules
│   ├── OBS-Setup.md        # OBS Studio browser source setup guide
│   ├── Plugin-Setup.md     # Controller & WebSocket integration guide
│   └── Coding-Standards.md # JavaScript, CSS, & modular structure standards

├── assets/                 # Static Logos, Fonts, Audio & Backgrounds
├── obs/                    # OBS Profiles, Scenes & Helper Plugins
└── tests/                  # Automated Visual & Module Tests
```

---

## 🎨 Category Color Mapping Matrix

All modules dynamically adhere to the standardized Category Color Matrix:

| Category (వర్గం) | Color Code | Color Name | Visual Role |
| :--- | :--- | :--- | :--- |
| **అత్యవసర వర్తమానం** | `#DC2626` | 🔴 Red | Breaking Flash Alerts |
| **రాజకీయం** | `#1E40AF` | 🔵 Navy Blue | Political Headlines |
| **క్రైమ్** | `#991B1B` | ⚫ Dark Red | Crime & Security Updates |
| **క్రీడలు** | `#15803D` | 🟢 Green | Sports Scores & News |
| **వాతావరణం** | `#D97706` | 🟡 Amber Yellow | Weather Bulletins |
| **బిజినెస్** | `#7E22CE` | 🟣 Purple | Markets & Economy |
| **తాజా వార్తలు** | `#0284C7` | 🔷 Cyan Blue | General News Bulletin |

---

## 🎬 OBS Studio Setup & Workflow Guide

### 1. Control Panel Setup (Custom Browser Dock)
1. Open **OBS Studio**.
2. Go to **View** -> **Docks** -> **Custom Browser Docks...**
3. Set **Dock Name**: `AV Media Control Panel`
4. Set **URL**: Select local file path:
   `d:\AV Media Telangana\av-media-telangana-broadcast-kit\control-panel\index.html`
5. Click **Apply** and dock the panel directly into your OBS interface!

### 2. Ticker Overlay Setup (Browser Source)
1. Under **Sources** dock in OBS, click `+` -> **Browser**.
2. Name source: `AV-Ticker`.
3. Check **Local File** and select:
   `d:\AV Media Telangana\av-media-telangana-broadcast-kit\modules\ticker\index.html`
4. Set Dimensions:
   - **Width**: `1920`
   - **Height**: `1080`
5. Click **OK**.

---

## ⚡ Live Operator Workflow

```
[ Operator Input ] ──> [ 👁️ Preview ] ──> [ ⚡ Apply (Update Live) ] ──> [ On-Air Ticker ]
```

1. **Type Headlines**: Enter news items line-by-line in the Control Panel.
2. **Select Theme & Speed**: Pick Radio Theme (`Default`, `Breaking`, `Election`, `Sports`, `Weather`) and adjust Speed Slider (`20s - 80s`).
3. **Live Preview**: Observe real-time scrolling preview in the Control Panel.
4. **Apply (Update Live)**: Click `⚡ Apply (Update Live)` to push updates instantly to the On-Air Ticker.
5. **Recent History**: Click any previous headline set in **Recent Headlines History** to restore with 1-click!

---

## 📄 License

MIT License - Copyright (c) 2026 AV Media Telangana.