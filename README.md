# AV Media Telangana Broadcast Kit (v1.2.3)

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

### 2. Primary Ticker Overlay Setup (Browser Source)
1. Under **Sources** dock in OBS, click `+` -> **Browser**.
2. Name source: `AV-Ticker`.
3. Uncheck Local File and set **URL**:
   `http://127.0.0.1:8085/modules/ticker/`
4. Set Dimensions:
   - **Width**: `1920`
   - **Height**: `1080`
5. Click **OK**.

### 3. Secondary News Playlist Overlay Setup (Browser Source)
1. Under **Sources** dock in OBS, click `+` -> **Browser**.
2. Name source: `AV-Secondary-Playlist`.
3. Uncheck Local File and set **URL**:
   `http://127.0.0.1:8085/modules/secondary-playlist/`
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
├── package.json            # NPM Scripts & Dependency Rules

├── modules/                # Standalone Graphics Micro-Project Modules
│   ├── ticker/             # Primary Ticker Engine Module
│   │   └── index.html      # http://127.0.0.1:8085/modules/ticker/
│   └── secondary-playlist/ # Secondary News Playlist Engine (v1.0.0)
│       ├── index.html      # http://127.0.0.1:8085/modules/secondary-playlist/
│       ├── index.js        # Entrypoint Module Controller
│       ├── SecondaryPlaylistRuntime.js # Master Runtime Orchestrator
│       ├── data-providers/ # Data Providers (GoogleSheetProvider)
│       ├── services/       # Services (GoogleSheetRefreshService, Status)
│       ├── interpreter/    # PlaylistInterpreter
│       ├── motion/         # Badge & Crawl Motion Engines
│       └── renderer/       # StaticRenderer
```

---

## 📋 Protocol v1 Message Schema

```json
{
  "version": 1,
  "timestamp": 1753092500123,
  "requestId": "1753092500123_x8a9k2b1",
  "source": "control-panel",
  "engine": "secondary-playlist",
  "action": "update",
  "payload": {
    "playlists": []
  }
}
```

---

## 📄 License

MIT License - Copyright (c) 2026 AV Media Telangana.