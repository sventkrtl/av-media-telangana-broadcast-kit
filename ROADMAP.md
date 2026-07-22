# Development Roadmap & Sprint Architecture

మార్గదర్శకం: మనం ఈ క్రింది ప్రాధాన్యతా క్రమంలో ప్రాజెక్ట్ అభివృద్ధితో ముందుకు వెళ్తాము.

---

## 🏛️ Golden Architectural Rule
> **"ఈ Engine కి నిజంగా కొత్త Control Panel అవసరమా, లేక ఇప్పటికే ఉన్న AV Media Control Panel లో ఒక Tab చాలునా?"**
> 
> జవాబు: ప్రతి కొత్త గ్రాఫిక్ ఇంజన్ (Lower Third, Reporter, Breaking News) ఒకే Central **AV Media Control Panel** లో కొత్త Tab గా జోడించబడుతుంది.

---

## 📈 Version Roadmap & Sprint Targets

- [x] **v1.0.0**: Repository Setup & Core SDK Engines (`shared/engines/`)
- [x] **v1.1.0**: Central Control Panel & BroadcastChannel Synchronization
- [x] **v1.2.0**: Ticker Engine & Control Panel UI Refinements
- [x] **v1.2.1**: **Ticker Stable Freeze** ❄️ (Bug Fixes Only, CEF Performance Audit & Memory Optimization)
- [x] **v2.0.0**: **Secondary News Playlist Engine** — Google Sheet Provider, Refresh Service, Telemetry, OBS Runtime, Continuous Crawl Rendering — **FROZEN** ❄️
- [ ] **v2.1.0**: **Lower Third Engine** (Approach: Design ➔ OBS Prototype ➔ Control Panel Tab ➔ Testing)
- [ ] **v2.2.0**: **Reporter Card Engine**
- [ ] **v2.3.0**: **Breaking News Engine**

---

## 📺 Phase Status Overview

### 🏗️ Phase 1 – Foundation (✅ Completed)
- [x] **Repository Setup**: Structure v1.0, `.gitignore`, directory tree & git integration
- [x] **Brand System**: Design tokens, color palette, Telugu/English typography (`shared/css/variables.css`)
- [x] **Shared Animation Engine**: Standardized CSS keyframes & JS transition helpers (`shared/animations/`)
- [x] **Shared CSS**: Reset, layout grid, typography classes & utility classes (`shared/css/`)
- [x] **Shared JavaScript**: Core DOM tools, state handlers & helper utilities (`shared/js/`)
- [x] **Configuration System**: Global & module-level JSON presets (`shared/config/`)

### 📺 Phase 2 – Graphics (In Progress)
- [x] **Ticker Engine**: Continuous marquee & news ticker system (`modules/ticker/`) — **FROZEN** ❄️
- [x] **Secondary News Playlist Engine**: Google Sheet live feed, Refresh Service, Telemetry, OBS Runtime Integration, Continuous Crawl Rendering — **FROZEN** ❄️ `v2.0.0`
- [x] **AV Media Control Panel**: Central OBS Browser Dock (`control-panel/`)
- [ ] **Lower Third Engine**: Dynamic name, title & lower graphic banners (`modules/lower-third/`) — **NEXT SPRINT**
- [ ] **Reporter Card Engine**: On-air reporter tag & station identification (`modules/reporter/`)
- [ ] **Breaking News Engine**: Alert popups & flash banners (`modules/breaking-news/`)
- [ ] **Live Bug**: On-screen channel branding badge & live indicator
- [ ] **Clock**: Real-time broadcast clock (`modules/clock/`)
- [ ] **Date**: Dynamic date & calendar widget
- [ ] **Location**: City / location tag widget (`modules/weather/` & location modules)

---

## 🎨 Lower Third Development Approach (Sprint v2.1.0)
1. **Design**: Layout, typography, & broadcast color tokens
2. **OBS Prototype**: Standalone 1080p Browser Source Canvas
3. **Control**: Lower Third Tab inside `control-panel/`
4. **Testing**: 24/7 CEF Performance & Memory Leak Verification

---

## ❄️ Frozen Module Policy

The following modules are **constitutionally frozen** as of `v2.0.0`.
Only **Bug Fix**, **Security Fix**, or **Performance Fix** commits are permitted.
All new features, architecture changes, and behaviour changes are **LOCKED**.

| Module | Status | Frozen Since |
|---|---|---|
| `PRIMARY_HEADLINE_ENGINE_SPEC.md` | 📜 CONSTITUTION APPROVED | P1-0 (v1.0) |
| `modules/ticker/` | ❄️ FROZEN | v1.2.1 |
| `modules/secondary-playlist/SecondaryPlaylistRuntime.js` | ❄️ FROZEN | v2.0.0 |
| `modules/secondary-playlist/interpreter/` | ❄️ FROZEN | v2.0.0 |
| `modules/secondary-playlist/motion/` | ❄️ FROZEN | v2.0.0 |
| `modules/secondary-playlist/renderer/` | ❄️ FROZEN | v2.0.0 |
| `modules/secondary-playlist/playback/` | ❄️ FROZEN | v2.0.0 |
| `modules/secondary-playlist/data-providers/` | ❄️ FROZEN | v2.0.0 |
