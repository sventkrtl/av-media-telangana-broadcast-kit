# 🎥 Primary Headline Engine OBS Browser Source Integration (Task P1-7)

This document describes the OBS Studio integration, Browser Source configuration, initialization flow, and failure recovery mechanisms for the **Primary Headline Engine**.

Strictly adheres to [`PRIMARY_HEADLINE_ENGINE_SPEC.md`](../PRIMARY_HEADLINE_ENGINE_SPEC.md) v1.0.

---

## 🌐 1. Public OBS Browser Source URL

Add a new **Browser Source** in OBS Studio with the following URL:

```
http://127.0.0.1:8085/modules/primary-headline/
```

### URL Query Parameters:
- `sheetUrl`: (Optional) Web-published Google Sheet CSV URL or share link.
- `interval`: (Optional) Polling refresh interval in milliseconds (default: `30000` = 30 seconds).

**Example Live Broadcast URL**:
```
http://127.0.0.1:8085/modules/primary-headline/?sheetUrl=https://docs.google.com/spreadsheets/d/1cLwWMHJ2bzG5KhShXa02i5D5G4VZOVKnAowIX0QP4Do/edit?usp=sharing
```

---

## 📐 2. OBS Browser Source Properties

Set the following exact properties in OBS Studio's Browser Source settings:

| Property | Value | Notes |
|---|---|---|
| **Width** | `1920` | Broadcast Canvas Standard |
| **Height** | `1080` | Broadcast Canvas Standard |
| **Custom CSS** | *(Leave Empty)* | Overlay stylesheet is loaded automatically |
| **Shutdown source when not visible** | `Unchecked` | Keeps playback engine alive across scene switches |
| **Refresh browser when scene becomes active** | `Unchecked` | Prevents unnecessary timeline restarts |

---

## 📐 3. Absolute Geometry Verification

| Parameter | Absolute Value | CSS Mapping |
|---|---|---|
| **Canvas Resolution** | `1920 × 1080` | `.ph-overlay-canvas` |
| **X Coordinate** | `0 px` | `left: 0px` |
| **Y Coordinate** | `890 px` | `top: 890px` |
| **Width** | `1920 px` | `width: 1920px` |
| **Height** | `135 px` | `height: 135px` |
| **Bottom Edge** | `1025 px` | `Y (890) + Height (135)` |

> [!NOTE]
> The bottom edge of the Primary Bar sits directly at `Y = 1025px`, placing it immediately above the Secondary News Playlist Bar (`Y = 1025px` to `1077px`).

---

## 🔄 4. Initialization & Hot Reload Flow

```
1. Browser Source Loads: http://127.0.0.1:8085/modules/primary-headline/
                             │
                             ▼
2. PrimaryHeadlineApp Initializes: PrimaryHeadlineRuntime & PrimaryHeadlineDataAdapter
                             │
                             ▼
3. Connects Feed: Fetches Google Sheet CSV ➔ Extracts Active Headlines
                             │
                             ▼
4. Starts Playback: Stage 1 BAR_IN ➔ Stage 2 TEXT_IN ➔ Stage 3 HOLD (4s) ➔ Stage 4 TEXT_OUT
                             │
                             ▼
5. Background Polling: On CSV change ➔ Schedules reload ➔ Applies dataset ONLY at HEADLINE_END
```

---

## 🛡️ 5. Failure Policy & Recovery Behavior

1. **Zero Black Screens**: The engine never crashes, throws unhandled UI exceptions, or presents an empty black screen.
2. **Network Connection Drop**: If the internet or Google Sheets API drops during live broadcast, the runtime retains the **last valid headline dataset** and continues playing without interruption.
3. **Automatic Recovery**: Background polling continues retrying silently until network connection recovers, at which point new headlines are loaded seamlessly at the next `HEADLINE_END` boundary.
