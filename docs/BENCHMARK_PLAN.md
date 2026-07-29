# Production Burn-in Benchmark Plan

This document outlines the benchmark and stability testing protocol for the AV Media Telangana Broadcast Kit.

## Objective

Ensure 24/7 continuous broadcast operation without memory leaks, frame drops, or event queue congestion in OBS Browser Source environments.

---

## Benchmark Stages

### Stage 1: 1-Hour Burn-in Test (Local Developer Validation)
- **Target Environment**: Local Node & Headless Browser Runtime.
- **Duration**: 60 Minutes (3600 seconds continuous execution at 60 FPS = 216,000 frames).
- **Event Load**: 60 events/minute continuous simulated control & overlay updates.
- **Pass Criteria**:
  - Zero memory growth drift (> 5 MB/hr threshold).
  - Target FPS maintained (avg >= 58 FPS).
  - Zero unhandled event drop errors.

### Stage 2: 6-Hour Burn-in Test (Staging QA Validation)
- **Target Environment**: Staging Broadcast Server & Real OBS Studio Instance.
- **Duration**: 6 Hours.
- **Event Load**: Automated broadcast schedule simulation including peak breaking news bursts (100 events/sec).
- **Pass Criteria**:
  - Heap memory usage remains within 15% sliding window boundary.
  - Zero OBS Browser Source crashes.
  - `/ready` and `/health` endpoints maintain HTTP 200 status throughout test run.

### Stage 3: 24-Hour Burn-in Test (Production Release Candidate Validation)
- **Target Environment**: Production OBS Broadcast Suite.
- **Duration**: 24 Continuous Hours.
- **Event Load**: Live broadcast simulation with full graphics pipeline (M3+ overlay modules).
- **Pass Criteria**:
  - Stable 60 FPS performance over 86,400 seconds.
  - Zero memory leaks detected by `MemoryMonitor`.
  - Zero event queue buffer overflows.
