# Release Notes: v0.0.1-m0-walking-skeleton

Release date: 2026-07-29
Milestone: M0 Platform Bootstrap / Walking Skeleton

## Goal

Freeze the first running version of the Single Overlay Platform: one OBS Browser Source URL backed by a new Platform Kernel, dynamic Overlay Registry, Overlay Runtime, OBS Adapter, and existing WebSocket protocol bridge.

## Completed Architecture

- Added `/overlay/` as the single development OBS overlay URL.
- Added `PlatformKernel` with lifecycle states: `BOOTING`, `READY`, `RUNNING`, `ERROR`.
- Added `OverlayRegistry` with deterministic layer registration and priority ordering.
- Added `OverlayRuntime` with the first platform runtime contract: `init`, `update`, `show`, `hide`, `destroy`.
- Added `OBSAdapter` to isolate 1920x1080 transparent Browser Source assumptions and dev diagnostics.
- Added default layer registry entries: `future`, `logo`, `clock`, `ticker`, `secondary`, `primary`, `breaking`.
- Connected current `StateEngine` WebSocket/BroadcastChannel message shape into the new platform without importing legacy overlay engines.
- Implemented breaking priority behavior in the platform path: `breaking-news:preempt` hides primary; `breaking-news:release` restores primary visibility.

## Tests

- Added `tests/single-overlay-platform-kernel.test.js`.
- Verified walking skeleton checks:
  - Kernel starts.
  - Registry loads.
  - OBS adapter locks 1920x1080 transparent runtime assumptions.
  - Runtime mounts registered layers.
  - Event bus updates layer state.
  - Frame loop records a rendered frame.
  - Breaking preemption priority is enforced.
- Full suite passed with `npm.cmd test`.

## Known Limitations

- Feature overlays are not rebuilt yet.
- Current rendered layer content is a development diagnostic/test adapter, not production graphics.
- Standalone legacy module URLs remain in the repository but are not part of the new platform development contract.
- Runtime contract does not yet separate `mount`/`unmount` from `init`/`destroy`; this is reserved for M1 or later dynamic loading work.
- GitHub release creation requires GitHub CLI or equivalent authenticated release tooling.

## Next Milestone: M1

M1 should focus only on platform-level improvements:

- Platform configuration.
- Version API / version manifest integration.
- Health snapshot hardening.
- Runtime diagnostics.
- Error recovery behavior.

Primary, Breaking, and Secondary production overlays should not begin until M1 platform work is frozen.
