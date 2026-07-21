# Timeline Playback Controller Architecture (The Conductor)

The **Timeline Playback Controller** acts as the central conductor orchestrating sequential timeline execution across Badge Motion Engine, Crawl Motion Engine, and Static Renderer.

---

## 🏛️ Architecture Flow

```text
               [ Timeline Events ]
                        │
                        ▼
       [ Timeline Playback Controller ]
                 (The Conductor)
                        │
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
[ Badge Motion ]  [ Crawl Motion ]  [ Static Renderer ]
```

---

## 🔑 Orchestration Responsibilities

1. **Event Sequence Dispatch**:
   Reads `TimelineEvent[]` step-by-step and delegates execution to the specialized engine (Badge Motion for `BADGE_IN`/`BADGE_OUT`, Crawl Motion for `NEWS_START`, Static Renderer for DOM layout).

2. **Playback Lifecycle Controls**:
   Provides standard broadcast controls: `play()`, `pause()`, `resume()`, `stop()`, and `stepNext()`.

3. **Event & Playlist Callbacks**:
   Emits `onEventStart`, `onEventEnd`, and `onPlaylistChange` hooks for real-time state tracking without tightly coupling engines together.

---

## 🛡️ Event Isolation Rule

Motion engines remain 100% decoupled from each other. Badge Motion Engine only sees badge events, Crawl Motion Engine only sees scroll events, and the Playback Controller seamlessly coordinates them.
