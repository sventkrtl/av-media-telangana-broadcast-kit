# ADR-0012: Single Overlay Platform Kernel

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-29 |
| Affected Area | Overlay Runtime, OBS Integration, Platform Architecture |
| Milestone | v0.0.1-m0-walking-skeleton |

## Context

The previous broadcast kit used multiple standalone OBS Browser Source URLs for separate graphics modules. That model worked for module validation, but it made the on-air runtime depend on parallel browser sources, scattered layer ordering, and feature-specific boot paths.

The new platform requires one OBS Browser Source URL and one central on-air runtime. Existing overlay modules remain valuable references for timing, typography, and behavior, but they must not become dependencies of the new platform kernel.

## Decision

Create a new Single Overlay Platform at `/overlay/`.

The platform is composed of:

- `PlatformKernel`: lifecycle, health, configuration boundary, event routing, and orchestration.
- `OverlayRegistry`: dynamic layer registration, priority ordering, visibility policy, and state snapshots.
- `OverlayRuntime`: layer mounting, event application, frame loop, and runtime contract execution.
- `OBSAdapter`: OBS Browser Source assumptions, 1920x1080 transparent canvas, diagnostics, and error display boundary.
- `StateEngine` bridge: existing WebSocket/BroadcastChannel protocol shape routed into the kernel.

The development contract for M0 is one overlay URL only: `http://127.0.0.1:8085/overlay/`.

## Rationale

- A Platform Kernel makes the runtime the foundation for features, instead of letting features define platform behavior.
- A registry prevents hardcoded layer coupling and creates a path for future layers such as weather, election, sports, ads, emergency alerts, clock, and logo.
- An OBS Adapter keeps Browser Source assumptions out of business logic and allows a future preview renderer or alternate broadcast adapter.
- Keeping the existing WebSocket message shape protects the current unified control panel while the on-air platform is rebuilt.
- Treating old engines as reference-only avoids carrying forward architectural debt into the new runtime.

## Consequences

- New production graphics must be rebuilt against the platform runtime contract.
- Existing standalone module URLs are not first-phase compatibility targets for the new platform.
- Feature overlay work is intentionally delayed until the platform walking skeleton is frozen.
- Future compatibility mode, if needed, must be explicit and must not weaken the new platform boundary.

## Validation

M0 is validated by `tests/single-overlay-platform-kernel.test.js` and the full existing test suite.

Walking skeleton criteria:

- Kernel starts.
- Registry loads.
- OBS adapter connects.
- Overlay becomes visible.
- Event bus receives current control-panel protocol messages.
- Layer state updates.
- Frame loop renders.
