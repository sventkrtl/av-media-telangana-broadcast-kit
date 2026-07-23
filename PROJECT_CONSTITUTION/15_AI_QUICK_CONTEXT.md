# 15_AI_QUICK_CONTEXT — AI Bootstrap Context

| Metadata Field | Value |
|---|---|
| **Status** | Active Governance |
| **Version** | 1.0.0 |
| **Constitution Layer** | Bootstrap |
| **Authority** | Prompt Protocol |
| **Last Updated** | July 23, 2026 |
| **Depends On** | [00_READ_FIRST.md](00_READ_FIRST.md) |
| **Related Documents** | [01_PROJECT_CONSTITUTION.md](01_PROJECT_CONSTITUTION.md), [02_PROJECT_STATE.md](02_PROJECT_STATE.md), [03_AI_DEVELOPMENT_RULES.md](03_AI_DEVELOPMENT_RULES.md), [04_ARCHITECTURE.md](04_ARCHITECTURE.md) |
| **Update Frequency** | Static |
| **Owner** | AV Media Telangana Broadcast SDK |

---

## 1. Purpose

This document serves as the ultra-compact **AI Bootstrap Entry Point** for the AV Media Telangana Broadcast Kit. It is designed to be pasted into the initial prompt of a new AI conversation session (Gemini, Claude, GPT/Codex) to instantly prime the model, enforce constitutional authority, and guide token-efficient context loading.

---

## 2. Mandatory Reading Order

Upon receiving this bootstrap instruction, the AI agent MUST read and parse the constitutional layer in the following strict order:

```
00_READ_FIRST.md
       │
       ▼
01_PROJECT_CONSTITUTION.md
       │
       ▼
02_PROJECT_STATE.md
       │
       ▼
03_AI_DEVELOPMENT_RULES.md
       │
       ▼
04_ARCHITECTURE.md
       │
       ▼
Remaining Constitutional Files (Only as required by specific task scope)
```

---

## 3. AI Initialization Rules

The AI agent SHALL adhere to five mandatory startup rules:

1. **Read Before Coding**: Read primary constitutional documents ([01_PROJECT_CONSTITUTION.md](01_PROJECT_CONSTITUTION.md)) before authoring any source code.
2. **Read Before Architecture Proposals**: Read architectural rules ([04_ARCHITECTURE.md](04_ARCHITECTURE.md)) before suggesting module designs or data flow changes.
3. **Read Before Refactoring**: Verify frozen module boundaries ([06_FROZEN_MODULES.md](06_FROZEN_MODULES.md)) before modifying existing codebase files.
4. **Read Before Roadmap Suggestions**: Check current project state ([02_PROJECT_STATE.md](02_PROJECT_STATE.md)) and sprint targets ([13_ROADMAP.md](13_ROADMAP.md)) before suggesting next steps.
5. **Never Skip the Constitutional Layer**: Bypassing `PROJECT_CONSTITUTION/` context initialization is strictly forbidden.

---

## 4. Repository Authority Hierarchy

When evaluating context or resolving technical ambiguity, authority flows strictly in this order:

```
PROJECT_CONSTITUTION  (Supreme Context & Governing Intent)
       │
       ▼
ADR (Architecture Decision Records - [12_ADR_INDEX.md](12_ADR_INDEX.md))
       │
       ▼
Source Code  (Production Implementation)
       │
       ▼
Tests  (Automated Verification Suites)
       │
       ▼
Chats  (Transient Discussion History)
```

---

## 5. Scope Rule

To maximize token efficiency while preserving architectural precision:

- Do NOT read unnecessary files or load entire codebases blindly.
- Load additional constitutional documents (`05_SDK_REFERENCE` through `18_DOCUMENT_UPDATE_MATRIX`) ONLY when required by the specific task scope.
- Focus context retrieval strictly on files relevant to the active module sprint.

---

## 6. Conversation Startup Prompt

*Copy and paste the block below into the initial prompt of a new AI session:*

```text
[SYSTEM INITIALIZATION INSTRUCTION]
You are an AI pair-programming assistant working on the AV Media Telangana Broadcast Kit repository.
Before analyzing tasks or generating code, you MUST initialize your context by reading the supreme constitutional layer located in `PROJECT_CONSTITUTION/`:
1. Read `PROJECT_CONSTITUTION/00_READ_FIRST.md`
2. Read `PROJECT_CONSTITUTION/01_PROJECT_CONSTITUTION.md`
3. Read `PROJECT_CONSTITUTION/02_PROJECT_STATE.md`
4. Read `PROJECT_CONSTITUTION/03_AI_DEVELOPMENT_RULES.md`
5. Read `PROJECT_CONSTITUTION/04_ARCHITECTURE.md`
Treat `PROJECT_CONSTITUTION/` as supreme authoritative context overriding chat history.
Do NOT suggest code, refactoring, or architecture changes until this reading order is complete.
Acknowledge completion of context initialization before proceeding with the user request.
```

---

## 7. Closing Rule

> **THIS DOCUMENT EXISTS TO MINIMIZE TOKENS WHILE MAXIMIZING ARCHITECTURAL CONTEXT.**

By following this bootstrap protocol, AI agents achieve instant architectural alignment, observe frozen module boundaries, and eliminate conversational hallucinations while preserving context window capacity.

---

## Read Next

👉 Proceed to **[16_CONSTITUTION_MANIFEST.md](16_CONSTITUTION_MANIFEST.md)** — Master Constitutional Layer Manifest.
