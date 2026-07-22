# 📜 ADR-0007: Future Shared Feed Parsing SDK (Deferred to v3.x)

- **Status**: Proposed / Deferred to v3.x
- **Date**: 2026-07-22
- **Deciders**: AV Media Telangana Engineering Team
- **Technical Scope**: Platform Unified CSV Ingestion Architecture (Planned for v3.x)

---

## 🎯 Context & Future Vision

Across v1.x and v2.x, three distinct broadcast engines consume Google Sheet data:
1. **Primary Headline Engine**: `PrimaryHeadlineDataAdapter.js`
2. **Secondary Playlist Engine**: `GoogleSheetProvider.js`
3. **Breaking News Profile Engine**: `BreakingNewsDataAdapter.js`

Each engine currently maintains a lightweight, isolated CSV parsing implementation. While this ensures **100% frozen module isolation** during v2.x development, it introduces minor code repetition across adapters.

---

## 💡 Future Unification Strategy (v3.x Platform Phase)

During the v3.x platform refactoring milestone, a centralized **Shared Feed SDK** (`shared/js/feed-sdk/`) will be introduced to standardize:
- CSV row parsing and quotes escaping.
- Schema auto-detection & header mapping.
- Network retry, rate-limiting, and error reporting.

```
Google Sheet URL
       │
       ▼
Shared Feed SDK (shared/js/feed-sdk/)
       │
       ├── Primary Headline Adapter
       ├── Secondary Playlist Adapter
       └── Breaking News Profile Adapter
```

---

## 🔒 Governance & Constraints

1. **Strict Immutability in v2.x**: No refactoring will occur during v2.x. Existing frozen engines (`GoogleSheetProvider.js`, `PrimaryHeadlineDataAdapter.js`, `BreakingNewsDataAdapter.js`) remain completely frozen and untouched.
2. **Backward Compatibility Guarantee**: The Shared Feed SDK must maintain identical contract interfaces so adapters require zero architectural breaking changes.

---

*ADR-0007 archived for future v3.x platform planning.*
