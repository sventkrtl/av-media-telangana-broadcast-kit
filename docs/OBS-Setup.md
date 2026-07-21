# OBS Studio Setup Guide

This guide details how to integrate the overlay modules from **AV Media Telangana Broadcast Kit** into **OBS Studio** using the Unified HTTP Broadcast Server (`http://127.0.0.1:8085/`).

---

## ⚡ Step 1: Start the Broadcast Server

Run the single-process HTTP + WebSocket server before launching OBS Studio:

```bash
node server.js
```

---

## 🛠️ Step 2: Adding Overlays as Browser Sources

1. Launch **OBS Studio**.
2. Under the **Sources** dock, click `+` -> **Browser**.
3. Name your source (e.g., `AV-Ticker`).
4. **Uncheck** Local file.
5. Set **URL**:
   `http://127.0.0.1:8085/modules/ticker/`
6. Set Resolution:
   - **Width**: `1920`
   - **Height**: `1080`
7. Click **OK**.

---

## 🎛️ Step 3: Adding Control Panel as Custom Browser Dock

1. In **OBS Studio**, go to **View** -> **Docks** -> **Custom Browser Docks...**
2. **Dock Name**: `AV Media Control Panel`
3. **URL**:
   `http://127.0.0.1:8085/control-panel/`
4. Click **Apply** and dock the window into your OBS Studio workspace!
