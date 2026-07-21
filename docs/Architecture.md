# System Architecture

The **AV Media Telangana Broadcast Kit** is built using a modular, decoupled web-graphics architecture designed specifically for OBS Studio browser sources and live broadcast controllers.

---

## 🏗️ High-Level Component Diagram

```
+-----------------------------------------------------------------------+
|                         OBS Studio Workspace                          |
|                                                                       |
|   +-------------------+  +-------------------+  +-----------------+   |
|   | Lower-Third       |  | Ticker Overlay    |  | Breaking Banner |   |
|   | Browser Source    |  | Browser Source    |  | Browser Source  |   |
|   +---------+---------+  +---------+---------+  +--------+--------+   |
|             ^                      ^                     ^            |
+-------------|----------------------|---------------------|------------+
              |                      |                     |
              +----------------------+---------------------+
                                     |
                       HTTP / Local File / WebSocket
                                     |
                    +----------------+----------------+
                    | Central Broadcast State Engine   |
                    | (shared/js/state-engine.js)      |
                    +----------------+----------------+
                                     ^
                                     | WebSocket / REST API
                    +----------------+----------------+
                    | Live Operator Control Panel UI   |
                    +---------------------------------+
```

---

## 🔄 Dataflow & State Synchronization

1. **State Persistence**: State updates (e.g., changing headline text, switching themes, triggering lower-third popups) are dispatched via the **Broadcast State Engine**.
2. **WebSocket Controller**: The overlay instances register event listeners for live state updates, executing smooth CSS/JS transitions without page reloads.
3. **Stand-Alone Fallback**: Each module (`modules/ticker`, `modules/lower-third`, etc.) can run independently via query parameters or local configuration files (`shared/config/`).

---

## 🎨 Theme & Layout Isolation

- **Tokens & Utilities**: Master CSS variable tokens reside in `shared/css/variables.css`.
- **Theme Overrides**: Specific theme variations (`themes/default`, `themes/dark`, `themes/light`, `themes/breaking`) extend base variables to adjust visual branding instantaneously.
