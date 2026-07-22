# 🚀 Primary Headline Runtime Architecture & Specifications (Task P1-5)

This document describes the design, initialization pipeline, public API, and sub-module orchestration for **`PrimaryHeadlineRuntime`**.

Strictly adheres to [`PRIMARY_HEADLINE_ENGINE_SPEC.md`](../PRIMARY_HEADLINE_ENGINE_SPEC.md) v1.0.

---

## 📐 1. Master Orchestrator Architecture

`PrimaryHeadlineRuntime` serves as the master entrypoint for the Primary Headline Engine. It integrates and manages the lifecycle of all foundation modules:

```
                                 ┌────────────────────────┐
                                 │ PrimaryHeadlineRuntime │
                                 └───────────┬────────────┘
                                             │
             ┌───────────────────────┬───────┴───────────────┬───────────────────────┐
             ▼                       ▼                       ▼                       ▼
  [ HeadlineTimelineBuilder ]  [ PlaybackController ]  [ StaticRenderer ]    [ MotionEngine ]
  (Builds Event Sequence)      (Conductor / Lifecycle) (Generates DOM Nodes) (Drives GPU Motion)
```

---

## 🔄 2. Initialization & Execution Pipeline

```
1. initialize(options) ──► Instantiate Sub-Modules ──► Mount Renderer DOM
                                                              │
2. loadHeadlines(data) ──► Build Timeline Events ────► Load Controller
                                                              │
3. play()              ──► Execute Sequence ────────► Loop Continuous
```

---

## 🕹️ 3. Public Runtime API Reference

```javascript
import { PrimaryHeadlineRuntime } from './runtime/PrimaryHeadlineRuntime.js';

const runtime = new PrimaryHeadlineRuntime();

// 1. Initialize runtime with DOM container element
await runtime.initialize({
  containerElement: document.getElementById('ph-overlay'),
  loop: true // Enable continuous infinite loop playback
});

// 2. Register event callbacks
runtime.onHeadlineStart((text, index) => {
  console.log(`Headline #${index} started: "${text}"`);
});

runtime.onHeadlineComplete((headlineId, index) => {
  console.log(`Headline #${index} completed.`);
});

runtime.onRuntimeError((error) => {
  console.error('Runtime error trapped:', error.message);
});

// 3. Load headline data array (strings or { id, text } objects)
runtime.loadHeadlines([
  'జగిత్యాల జిల్లాలో విస్తారంగా కురుస్తున్న వర్షాలు',
  'ధర్మపురి గోదావరి పుష్కర ఘాట్ వద్ద పెరిగిన నీటిమట్టం',
  'ఇండియా వర్సెస్ ఆస్ట్రేలియా బోర్డర్-గవాస్కర్ ట్రోఫీ మూడో టెస్ట్ రేపే ప్రారంభం'
]);

// 4. Start playback
await runtime.play();

// 5. Lifecycle Controls
runtime.pause();
runtime.resume();
runtime.stop();
runtime.next();
runtime.previous();
runtime.reset();
runtime.destroy();
```

---

## 🛡️ 4. Headline Validation & Error Policy

- **Input Validation**: `loadHeadlines()` rejects null inputs, empty arrays, empty strings, and whitespace-only strings with explicit error messages.
- **Continuous Looping**: Playback runs in an infinite continuous loop (`Headline 1 ➔ ... ➔ Headline N ➔ Headline 1`) without random ordering or interruption.
- **Defensive Recovery**: Runtime errors are trapped, logged, and emitted via `onRuntimeError` callbacks. The process never crashes.
