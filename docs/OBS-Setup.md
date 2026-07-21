# OBS Studio Setup Guide

This guide details how to integrate the overlay modules from **AV Media Telangana Broadcast Kit** into **OBS Studio**.

---

## 🛠️ Adding Overlays as Browser Sources

1. Launch **OBS Studio**.
2. Under the **Sources** dock, click `+` -> **Browser**.
3. Name your source appropriately (e.g., `AV-Ticker` or `AV-Lower-Third`).
4. Check **Local file** and browse to the module's HTML file:
   - Example: `modules/lower-third/index.html`
5. Set Resolution:
   - **Width**: `1920`
   - **Height**: `1080`
6. Check **Shutdown source when not visible** (Optional, keeps browser memory fresh).
7. Check **Refresh browser when scene becomes active** (Recommended for live transitions).

---

## 💡 Recommended Source Settings

| Module | Source Width | Source Height | Custom CSS / Notes |
| :--- | :--- | :--- | :--- |
| **Ticker** | 1920 | 1080 | Align at bottom of screen canvas |
| **Lower Third** | 1920 | 1080 | Transparent background enabled |
| **Breaking News**| 1920 | 1080 | Full canvas overlay |
| **Clock** | 400 | 150 | Positioned top-right or top-left |

---

## 🔌 OBS WebSocket Integration (Optional)

1. Enable OBS WebSocket Server in OBS Studio (`Tools` -> `OBS WebSocket Settings`).
2. Configure port `4455` and set your server password.
3. Configure `shared/config/obs-config.json` with matching credentials for automated scene switching and graphic triggers.
