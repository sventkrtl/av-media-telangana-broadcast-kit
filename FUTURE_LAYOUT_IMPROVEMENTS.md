# Future Layout Improvements & Visual Refinements

This document records planned visual and layout enhancements that have been intentionally deferred to prioritize **Production Stability** during the `v2.0.0` Secondary Playlist Engine freeze.

---

## 📋 Planned Improvements

### 1. Secondary Crawl Bar Height & Layout Balance

- **Version Target**: `v3.x (Subject to Production Validation)`
- **Proposed Change**: Increase Secondary Crawl Height from `52px` / `55px` → `70px`
- **Reason**: Field-tested readability improvement across legacy CRT televisions, small LED televisions, and modern Smart TVs.
- **Related Layout Change**: 
  - **Primary Headline Height**: `135px` → `150px`
  - **Reason**: Maintain proportional visual balance between the Primary Headline and the Secondary Crawl.
- **Current Status**: **Deferred Intentionally**
- **Rationale**: Production stability and code freeze take precedence over visual refinement.

---

## 🧪 Production Validation Requirements

Before any proposed layout changes in this document are implemented in code, the following mandatory field-testing verifications must be completed and documented:

- [ ] **CRT Television Verification**: Text legibility & scan-line clarity on 4:3 / legacy CRT screens
- [ ] **Small LED Television Verification**: Font sharpness on 24"-32" 720p / 1080p LED displays
- [ ] **32" Smart TV Verification**: Standard living-room viewing distance legibility
- [ ] **43"+ Smart TV Verification**: Scale and proportional balance on large 4K / UHD displays
- [ ] **1080p OBS Preview Verification**: Pixel-perfect rendering check in OBS Studio Canvas (1920x1080)
- [ ] **Reading-Distance Verification**: Multi-angle visual testing at 6–10 feet broadcast viewing distance

---

## 🏛️ Architectural Rationale & Governance

1. **Why Document Now**: Context behind field-tested design decisions (e.g., "Why 70px / 150px?") can easily fade over time. Documenting this ensures long-term team alignment and clear design history.
2. **Freeze Compliance**: No layout or visual redesigns will be made during the `v2.x` release lifecycle unless required to fix critical rendering bugs.
3. **Evidence-Driven Implementation**: Implementation will occur only after all Production Validation Requirements are satisfied with real broadcast evidence.
