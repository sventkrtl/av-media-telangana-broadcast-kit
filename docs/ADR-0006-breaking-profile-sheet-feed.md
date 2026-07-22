# 📜 ADR-0006: Dedicated Google Sheet Feed for Breaking News Profile with Zero Engine Fallback

- **Status**: Approved
- **Date**: 2026-07-22
- **Deciders**: AV Media Telangana Engineering Team
- **Technical Scope**: v2.1.0 Breaking News Profile Google Sheet Feed Integration (Task B1-1)

---

## 🎯 Context & Problem Statement

The Breaking News Profile requires access to Google Sheet editorial data. However, the system contains multiple independent editorial feeds:
1. Primary Headlines Feed (`GID=1` / `Headlines` tab)
2. Secondary Playlist Feed (`GID=2` / `News Playlist` tab)
3. **Breaking News Profile Feed** (`GID=3` / `Breaking Profile` tab)
4. Future Breaking Queue Workflow (v3.x)

To prevent cross-engine data pollution, race conditions, or accidental display of non-breaking content on the urgent Red Bar, the resolution strategy must be strictly isolated.

---

## 💡 Decision Drivers

1. **Strict Architecture Isolation**: Breaking News Profile must consume **ONLY** its dedicated `Breaking Profile` feed. It **SHALL NEVER** fall back to Primary (`GID=1`) or Secondary (`GID=2`) feeds under any failure condition.
2. **Exact Schema Compliance**:
   `| Order | Active | Priority | Headline | Repeat |`
   No `Label`, `Theme`, `District`, or `Category` columns required.
3. **Broadcast Safety**: If the `Breaking Profile` tab is missing, unparseable, or empty, the adapter must return `0 Headlines`, set status `ERROR`, and **STOP**. It MUST NOT fallback to other engines.

---

## 🏛️ Decision: Isolated Tab Name & Configured GID Resolution Chain

We decide to implement the resolution strategy in `BreakingNewsDataAdapter.js` using a strict, isolated lookup chain:

```
Operator Pastes Google Sheet URL
    │
    ▼
Try Tab Name Resolution: sheet=Breaking Profile (or sheet=Breaking+Profile)
    │
    ├── Found AND Schema Valid AND Active Rows > 0 → ✅ USE THIS
    │
    ▼
Try Configured Breaking GID Resolution: gid=3 (or explicit user Breaking GID)
    │
    ├── Found AND Schema Valid AND Active Rows > 0 → ✅ USE THIS
    │
    ▼
STOP & RETURN ERROR (0 Headlines, Provider Status: ERROR)
❌ DO NOT FALLBACK TO PRIMARY (GID 1) OR SECONDARY (GID 2) TABS!
```

---

## 🔒 Mandatory Governance Rules

1. **Feed Independence Rule**: Breaking Profile SHALL consume ONLY the `Breaking Profile` feed.
2. **No Breaking Queue Dependency**: Breaking Profile SHALL NEVER read from `Breaking Queue` (deferred to v3.x).
3. **No Engine Fallback**: Under error conditions, Breaking Profile MUST NOT load data from Primary or Secondary tabs.
4. **Frozen Boundary Protection**: Zero edits to `GoogleSheetProvider.js`, `GoogleSheetRefreshService.js`, `GoogleSheetProviderStatus.js`, `ProviderFactory.js`, `ProviderRegistry.js`, Primary Engine, or Secondary Engine.

---

## 📈 Consequences

### Positive:
- **Absolute Feed Isolation**: Zero risk of Primary or Secondary headlines accidentally displaying on the Red Breaking Bar.
- **Broadcast Safe Error Handling**: Missing Breaking tab cleanly outputs zero headlines with an explicit ERROR status.
- **Exact Schema Alignment**: Supports `Order`, `Active`, `Priority`, `Headline`, `Repeat` cleanly.

### Negative / Trade-offs:
- Requires editorial staff to create the `Breaking Profile` tab in their Google Sheet layout (or specify `gid=3`).

---

*ADR-0006 permanently archived for project governance.*
