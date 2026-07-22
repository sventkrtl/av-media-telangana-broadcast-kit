# 🎼 Primary Timeline Playback Controller Architecture (Task P1-4)

This document describes the design, execution flow, callback events, and error handling policy for the **`PrimaryTimelinePlaybackController`**.

Strictly adheres to [`PRIMARY_HEADLINE_ENGINE_SPEC.md`](../PRIMARY_HEADLINE_ENGINE_SPEC.md) v1.0.

---

## 📐 1. The Conductor Role

The `PrimaryTimelinePlaybackController` acts as the central conductor orchestrating sequential timeline execution across all foundation layers:

```
                          ┌─────────────────────────────────────────┐
                          │ PrimaryTimelinePlaybackController       │
                          └────────────────────┬────────────────────┘
                                               │
             ┌─────────────────────────────────┼─────────────────────────────────┐
             ▼                                 ▼                                 ▼
   [ HeadlineStateMachine ]       [ PrimaryStaticRenderer ]           [ PrimaryMotionEngine ]
   (Tracks & Syncs State)         (Renders Headline DOM Text)         (Drives 60 FPS GPU Motion)
```

---

## 🔄 2. Sequential Stage Execution Lifecycle

The controller processes `HeadlineTimelineEvent[]` in strict sequential order:

$$\text{BAR\_IN} \longrightarrow \text{TEXT\_IN} \longrightarrow \text{TEXT\_HOLD} \longrightarrow \text{TEXT\_OUT} \longrightarrow \text{BAR\_OUT} \longrightarrow \text{HEADLINE\_END}$$

### Execution Pipeline Per Event:
1. **Sync State Machine**: Validates and transitions `HeadlineStateMachine` state.
2. **Fire `onStageStart`**: Notifies stage start listeners.
3. **Update Renderer**: Injects sanitized headline text into `PrimaryStaticRenderer` on `TEXT_IN`.
4. **Await Motion**: Awaits `PrimaryMotionEngine.play(stage)` completion.
5. **Fire `onStageComplete`**: Notifies stage completion listeners.
6. **Fire `onHeadlineComplete`**: Notifies headline completion listeners on `HEADLINE_END`.

---

## 🛡️ 3. State & Error Protection Policy

- **Empty Timeline Rejection**: Invoking `load([])` or `play()` with an empty timeline throws an error.
- **Duplicate Play Protection**: Invoking `play()` while already playing throws an error (`"Duplicate play() request rejected"`).
- **Pause & Resume**: `pause()` preserves motion stage progress; `resume()` restores animation from the exact pause timestamp.
- **Stop**: Halts active motion, clears renderer text, and resets the state machine to `IDLE`.

---

## 🕹️ 4. Public API Reference

```javascript
import { PrimaryTimelinePlaybackController } from './playback/PrimaryTimelinePlaybackController.js';
import { HeadlineTimelineBuilder } from './HeadlineTimelineBuilder.js';

const builder = new HeadlineTimelineBuilder();
const controller = new PrimaryTimelinePlaybackController({ loop: true });

// 1. Load timeline
const timeline = builder.buildPlaylistTimeline(['హైదరాబాద్ వార్తలు', 'వర్షాల హెచ్చరిక']);
controller.load(timeline);

// 2. Register callbacks
controller.onStageStart((event) => console.log('Stage Start:', event.type));
controller.onStageComplete((event, res) => console.log('Stage Complete:', event.type));
controller.onHeadlineComplete((id, index) => console.log('Headline Complete:', index));

// 3. Start playback
await controller.play({ barElement, textElement });

// 4. Playback controls
controller.pause();
controller.resume();
controller.stop();
controller.reset();
controller.destroy();
```
