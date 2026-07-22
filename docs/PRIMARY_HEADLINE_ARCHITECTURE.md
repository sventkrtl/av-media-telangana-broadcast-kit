# 🏛️ Primary Headline Engine – Architectural Foundation (Task P1-1)

This document explains the internal playback architecture foundation for the **Primary Headline Engine**.

It acts as the technical bridge between the specification ([`PRIMARY_HEADLINE_ENGINE_SPEC.md`](../PRIMARY_HEADLINE_ENGINE_SPEC.md)) and future runtime implementations.

---

## 📐 Architecture Overview

The Primary Headline Engine follows a decoupled 4-tier foundation:

```
[ Input Headline Data ]
          │
          ▼
[ HeadlineTimelineBuilder ] ──► Generates ──► [ HeadlineTimelineEvent Sequence ]
                                                      │
                                                      ▼
[ HeadlineStateMachine ]    ◄── Controls ──  [ HeadlinePlaybackController ] (Implements Contract)
  (IDLE ➔ BAR_IN ➔            State Flow              │
   TEXT_IN ➔ HOLD ➔                                   ├──► [ Future Motion Engine ]
   TEXT_OUT ➔ BAR_OUT ➔                               └──► [ Future DOM Renderer ]
   COMPLETE)
```

---

## 1. Timeline Model (`HeadlineTimelineEvent.js` & `HeadlineTimelineBuilder.js`)

### Event Types
The engine timeline consists of 6 standardized events:
- **`BAR_IN`**: Stage 1 scale reveal of the blue background bar (`300 ms`).
- **`TEXT_IN`**: Stage 2 center-to-outside symmetrical text reveal (`300 ms`).
- **`TEXT_HOLD`**: Stage 3 stationary hold phase (`4000 ms`).
- **`TEXT_OUT`**: Stage 4 outside-to-center symmetrical text hide (`300 ms`).
- **`BAR_OUT`**: Stage 5 right-to-left scale hide of the blue background bar (`300 ms`).
- **`HEADLINE_END`**: End-of-headline timeline boundary marker (`0 ms`).

### Timeline Sequence Generation
`HeadlineTimelineBuilder` converts raw headline input strings/objects into a strict sequential event queue:

```
BAR_IN ➔ TEXT_IN ➔ TEXT_HOLD ➔ TEXT_OUT ➔ [NEXT TEXT_IN ...] ➔ BAR_OUT ➔ HEADLINE_END
```

Input validation rejects empty strings, nulls, whitespace-only strings, or unsupported types before generating events.

---

## 2. State Machine (`HeadlineStateMachine.js`)

The state machine enforces deterministic, non-overlapping lifecycle states:

$$\text{IDLE} \longrightarrow \text{BAR\_IN} \longrightarrow \text{TEXT\_IN} \longrightarrow \text{HOLD} \longrightarrow \text{TEXT\_OUT} \longrightarrow \text{BAR\_OUT} \longrightarrow \text{COMPLETE}$$

### Key State Rules:
1. **No State Skipping**: Transitions must strictly follow sequential order. Attempting an illegal jump (e.g. `IDLE` → `HOLD`) throws an explicit error.
2. **No Parallel States**: Exactly one state is active at any point in time.
3. **Explicit Stage Synchronization**:
   - `TEXT_IN` (Stage 2) cannot begin until `BAR_IN` (Stage 1) completes.
   - `BAR_OUT` (Stage 5) cannot begin until `TEXT_OUT` (Stage 4) completes.

---

## 3. Playback Contract (`HeadlinePlaybackContract.js`)

`HeadlinePlaybackContract` defines the mandatory public API interface that all future Primary Headline playback controllers must implement:

```javascript
class HeadlinePlaybackController extends HeadlinePlaybackContract {
  async load(headlines) { ... }
  async play()           { ... }
  pause()                { ... }
  resume()               { ... }
  async stop()           { ... }
  async next()           { ... }
  async previous()       { ... }
  reset()                { ... }
  destroy()              { ... }
}
```

---

## 4. Future Runtime Integration Strategy

When visual runtime development begins in future tasks:

1. **Google Sheet Provider**: Will fetch headline rows and pass them to `HeadlineTimelineBuilder.buildPlaylistTimeline()`.
2. **Motion Engine (GPU Driver)**: Will listen to state machine events and apply CSS `scaleX()` (for `BAR_IN`/`BAR_OUT`) and symmetrical center clip (`TEXT_IN`/`TEXT_OUT`) without DOM reflow.
3. **DOM Renderer**: Will manage `Ramabhadra` font auto-scaling and ensure text remains inside the broadcast title-safe margin.
4. **Control Panel Tab**: Will communicate via WebSocket/BroadcastChannel to trigger `play()`, `pause()`, `stop()`, `next()`, and `previous()`.
