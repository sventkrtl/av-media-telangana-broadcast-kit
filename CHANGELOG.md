# Changelog

All notable changes to the **AV Media Telangana Broadcast Kit** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0-m2-runtime-stability] - 2026-07-29

### Added
- **Frame Scheduler (`overlay/platform/runtime/FrameScheduler.js`)**: 60 FPS clock, delta-time calculation, frame drop detection.
- **Performance & FPS Monitor (`overlay/platform/monitoring/PerformanceMonitor.js`)**: Real-time FPS & frame duration analytics, <45 FPS degradation detection.
- **Memory Monitor & Leak Detector (`overlay/platform/monitoring/MemoryMonitor.js`)**: Real-time heap memory snapshotting and leak trend detection.
- **Event Queue Optimizer (`overlay/platform/events/EventQueueOptimizer.js`)**: Priority queues (`CRITICAL`, `HIGH`, `NORMAL`, `LOW`) and backpressure control.
- **Resource Lifecycle Manager (`overlay/platform/runtime/ResourceManager.js`)**: Explicit `acquire`, `release`, `purgeUnused`, `disposeAll` contracts.
- **Startup Probe Endpoint (`/startup`)**: Completed Production Observability Suite (`/status`, `/ready`, `/startup`, `/health`, `/version`).
- **Production Burn-in Benchmark Plan (`docs/BENCHMARK_PLAN.md`)**: 1-Hour, 6-Hour, 24-Hour stability benchmark protocol.
- **10,000 Event Stress Test (`tests/platform-m2-stability.test.js`)**: Verified zero memory drift under continuous heavy event load.

---

## [0.1.0-m1-platform-services] - 2026-07-29

### Added
- Isolated Configuration System (`config/*.json` and `PlatformConfig.js`).
- Capability Registry (`CapabilityRegistry.js`) for module declaration and compatibility checks.
- Runtime Manifest (`RuntimeManifest.js`) for version telemetry (`/version`).
- Observability Endpoints (`ObservabilityEndpoints.js`) for `/status`, `/ready`, `/health`, `/version`.
- Diagnostics Engine (`DiagnosticsEngine.js`) for ring-buffer logging and event tracing.
- Error Recovery System (`ErrorRecoverySystem.js`) for crash isolation and exponential backoff retry.

---

## [0.0.1-m0-walking-skeleton] - 2026-07-29

### Added
- Single Overlay Platform entrypoint at `/overlay/`.
- Platform Kernel with lifecycle state and health snapshot.
- Dynamic Overlay Registry with deterministic layer priority ordering.
- Overlay Runtime with walking-skeleton layer adapter contract.
- OBS Adapter for 1920x1080 transparent Browser Source assumptions and diagnostics.
- Event Bus bridge for the existing WebSocket/BroadcastChannel protocol shape.
- Walking skeleton validation test suite.
- M0 release notes, ADR-0012, version manifest, and developer documentation.

### Changed
- `npm test` now includes the Single Overlay Platform Kernel test before legacy module validation.

### Known Limitations
- Production feature overlays are not rebuilt yet.
- Legacy overlay engines are reference-only and are not imported by the new platform.

---

## [1.0.0] - 2026-07-21

### Added
- **Broadcast Graphics SDK Core Engines** (`shared/engines/`):
  - `ThemeEngine`: Dynamic theme loading & CSS token manager
  - `FontEngine`: Telugu & English webfont loader (`Noto Sans Telugu`, `Ramabhadra`, `Outfit`, `Inter`)
  - `AudioEngine`: Broadcast stinger & sound effect player
  - `ConfigEngine`: JSON preset loader & manager
  - `ApiEngine`: Data connector for feeds & WebSockets
- **Standalone Ticker Module** (`modules/ticker/`):
  - 60fps GPU-accelerated marquee ticker overlay for OBS Studio Browser Source.
- **Central Production Control Panel** (`control-panel/`):
  - Built for OBS Custom Browser Docks (`View -> Docks -> Custom Browser Docks`).
  - Interactive live animated preview canvas window.
  - Professional `⚡ Apply (Update Live)` workflow.
  - Single `⏸️ Pause / ▶️ Resume Ticker` toggle.
  - Radio button theme selection & speed range slider (20s - 80s).
  - Recent Headlines History list with 1-click restore.
- **Category Color Mapping System**:
  - Standardized color tokens for `Breaking`, `Politics`, `Crime`, `Sports`, `Weather`, `Business`, and `General`.
