# Changelog

All notable changes to the **AV Media Telangana Broadcast Kit** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
