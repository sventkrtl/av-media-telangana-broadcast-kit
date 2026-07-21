# OBS Production Validation - Secondary News Playlist Engine

This document records the production integration, OBS Studio setup URL, and performance validation checklist for the **Secondary News Playlist Engine**.

---

## 📺 Environment & Setup Specifications

- **Target Resolution**: `1920x1080`
- **Target Frame Rate**: `60 FPS`
- **OBS Studio Version**: `OBS 28+` (Built-in Browser Source CEF / QtWebEngine)
- **Local Runtime URL**:
  `http://127.0.0.1:8085/modules/secondary-playlist/`

---

## 🛠️ OBS Integration Guide

1. In **OBS Studio**, navigate to **Sources** dock -> click `+` -> **Browser**.
2. Name source: `AV-Secondary-Playlist`.
3. **Uncheck** *Local File*.
4. Enter **URL**:
   `http://127.0.0.1:8085/modules/secondary-playlist/`
5. Set Dimensions:
   - **Width**: `1920`
   - **Height**: `1080`
6. Click **OK**.

---

## ✅ Production Validation Checklist

| Test Item | Pass Criteria | Status |
| :--- | :--- | :---: |
| **Badge Motion** | `BADGE_IN` 300ms ease-out, `BADGE_OUT` 250ms ease-in | ✅ PASSED |
| **Badge Persistence** | Badge remains visible across news items in same playlist | ✅ PASSED |
| **Badge Transition** | Badge transitions smoothly on playlist label change | ✅ PASSED |
| **Constant Velocity Crawl** | Reading speed constant ($\text{Duration} = \frac{\text{Distance}}{\text{Speed}}$) | ✅ PASSED |
| **Logo Separator** | Rendered ONLY between consecutive news items | ✅ PASSED |
| **Zero Reflow** | Animates `transform` (`translate3d`) and `opacity` ONLY | ✅ PASSED |
| **Infinite Loop** | Playlists loop continuously without memory leaks | ✅ PASSED |

---

## 📝 Known Issues & Resolutions
- **CORS / ES Modules**: Eliminated by running over unified local HTTP server (`http://127.0.0.1:8085/`).
