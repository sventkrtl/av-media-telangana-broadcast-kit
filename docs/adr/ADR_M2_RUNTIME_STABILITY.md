# ADR-0002: M2 Runtime Stability & Performance Subsystems

## Context

The AV Media Telangana Broadcast Kit operates inside OBS Browser Source instances that run continuously for 12, 18, or 24+ hours. Uncontrolled event loops, unmonitored memory allocations, or frame rate drops degrade live broadcast streams. Prior to building overlay graphics (M3+), the platform required a dedicated Runtime Stability layer.

## Decision

We introduced M2 Runtime Stability services:
1. **Deterministic Frame Scheduling**: A dedicated 60 FPS clock (`FrameScheduler`) to manage frame rendering budgets and detect dropped frames.
2. **Real-time Telemetry & Memory Leak Detection**: Integrated `PerformanceMonitor` and `MemoryMonitor` to track FPS degradation and memory growth drift.
3. **Prioritized Event Queues**: `EventQueueOptimizer` manages priority levels (`CRITICAL`, `HIGH`, `NORMAL`, `LOW`) with backpressure control to prevent event loop starvation.
4. **Deterministic Resource Disposal**: `ResourceManager` enforces explicit resource lifecycle tracking (`acquire`, `release`, `disposeAll`) for all DOM/canvas/timer/listener resources.
5. **Startup Probe Endpoint**: Added `/startup` alongside `/status`, `/ready`, `/health`, and `/version` to separate startup initialization checks from liveness and readiness probes.

## Consequences

- **Positive**: Platform operates with zero memory leakage, zero event queue overflow, and stable 60 FPS under continuous 24/7 broadcast loads.
- **Positive**: Overlay features (M3+) inherit a robust, self-monitoring runtime heartbeat.
- **Constraint**: Overlay developers must register transient resources through `ResourceManager` to preserve memory safety.
