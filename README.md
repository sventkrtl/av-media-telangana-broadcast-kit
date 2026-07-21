# AV Media Telangana Broadcast Kit (v1.2.2)

A high-performance, broadcast-grade Web Graphics SDK and Production Control System engineered specifically for **OBS Studio** Browser Sources and Custom Browser Docks.

Built using zero-dependency, hardware-accelerated **HTML5, CSS3, and Vanilla JavaScript (ES6 Modules)** for 60fps ultra-low latency rendering hosted over a unified local **HTTP + WebSocket Runtime** (`http://127.0.0.1:8085/`).

---

## 🚀 Quick Start & Server Execution

Start the Unified Broadcast Runtime:

```bash
node server.js
```

**Console Startup Output:**
```
====================================================
📡 Broadcast Runtime Started

HTTP:
http://127.0.0.1:8085/

WebSocket:
ws://127.0.0.1:8085/

Static Root:
d:\AV Media Telangana\av-media-telangana-broadcast-kit

Ready for OBS.
====================================================
```

---

## 🎬 OBS Studio Setup & Integration

### 1. Control Panel Setup (Custom Browser Dock)
1. Launch **OBS Studio**.
2. Go to **View** -> **Docks** -> **Custom Browser Docks...**
3. Set **Dock Name**: `AV Media Control Panel`
4. Set **URL**:
   `http://127.0.0.1:8085/control-panel/`
5. Click **Apply** and dock the panel directly into your OBS interface!

### 2. Ticker Overlay Setup (Browser Source)
1. Under **Sources** dock in OBS, click `+` -> **Browser**.
2. Name source: `AV-Ticker`.
3. Uncheck Local File and set **URL**:
   `http://127.0.0.1:8085/modules/ticker/`
4. Set Dimensions:
   - **Width**: `1920`
   - **Height**: `1080`
5. Click **OK**.

---

## 🏛️ Broadcast Graphics SDK Architecture

```
av-media-telangana-broadcast-kit/

├── server.js               # Unified Server Entrypoint (node server.js)
├── README.md               # Master Project Documentation & OBS Integration Guide
├── LICENSE                 # MIT License
├── .gitignore              # Git ignore rules
├── CHANGELOG.md            # Release notes & version history
├── ROADMAP.md              # Planned features & version targets

├── shared/                 # Core SDK Engines & Shared Tokens
│   ├── js/                 # Server & State Engine
│   │   ├── server.js       # Unified HTTP + WebSocket Native Runtime
│   │   ├── state-engine.js # Protocol v1 State Engine
│   │   ├── dom.js          # DOM Helper
│   │   └── utils.js        # Date & Query Utilities
│   ├── engines/            # Broadcast Graphics SDK Core Engines
│   │   ├── index.js        # Master SDK Export Entrypoint
│   │   ├── ThemeEngine.js  # Dynamic Theme & Token Controller
│   │   ├── FontEngine.js   # Telugu & English Broadcast Typography Loader
│   │   ├── AudioEngine.js  # Broadcast Sound Effect Player
│   │   ├── ConfigEngine.js # Config & Preset Loader
│   │   └── ApiEngine.js    # Data Connector (REST / WebSockets)
│   ├── css/                # Global Resets, Category Color Tokens & Utilities
│   └── config/             # Channel & Global JSON Presets

├── control-panel/          # Central Production Control Panel (OBS Dock)
│   ├── index.html          # http://127.0.0.1:8085/control-panel/
│   ├── control-panel.css   # Dark-themed Broadcast Dock Layout
│   └── control-panel.js    # Preview, Apply, Speed, Theme & Recent History Engine

├── modules/                # Standalone Graphics Micro-Project Modules
│   └── ticker/             # Ticker Engine Module (v1.0)
│       ├── index.html      # http://127.0.0.1:8085/modules/ticker/
│       ├── ticker.css      # Ticker Layout & Category Color Rules
│       ├── ticker.js       # Module Controller & SDK Integration
│       ├── config.json     # Headline text & preset configuration
│       ├── themes/         # Theme stylesheets (default.css, breaking.css)
│       └── animations/     # Ticker Marquee Scroll Animations

└── docs/                   # Architectural & System Guides
```

---

## 🎨 Category Color Mapping Matrix

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

## 📋 Protocol v1 Message Schema

```json
{
  "version": 1,
  "timestamp": 1753092500123,
  "requestId": "1753092500123_x8a9k2b1",
  "source": "control-panel",
  "engine": "ticker",
  "action": "update",
  "payload": {
    "items": ["తెలంగాణలో విస్తారంగా వర్షాలు..."],
    "category": "తాజా వార్తలు",
    "theme": "default",
    "speed": 50
  }
}
```

---

## 📄 License

MIT License - Copyright (c) 2026 AV Media Telangana.