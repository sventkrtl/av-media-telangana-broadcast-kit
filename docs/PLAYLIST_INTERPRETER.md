# Playlist Interpreter Architecture

The **Playlist Interpreter** is responsible for converting raw Playlist data models into a standardized, sequential **Rendering Timeline**.

---

## 🏛️ Architecture Flow

```text
       [ Playlist Model ]
               │
               ▼
    [ Playlist Interpreter ]
               │
               ▼
     [ Rendering Timeline ]
               │
               ▼
     (Renderer - Future Task)
```

---

## 🔑 Timeline Event Cycle

For every valid playlist, the Interpreter generates a standardized timeline sequence:

1. `BADGE_IN`
2. `BADGE_HOLD`
3. `NEWS_START`
4. `NEWS_END`
5. `LOGO_SEPARATOR` *(Injected automatically between consecutive news items)*
6. `BADGE_OUT`
7. `PLAYLIST_END`

---

## 🛡️ Separation Rule

The Interpreter produces pure `TimelineEvent[]` objects containing event metadata only. It contains **NO DOM references, CSS styles, or rendering code**.
