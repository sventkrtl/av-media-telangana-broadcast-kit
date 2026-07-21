# Playlist Transition Behavior Architecture

The **Playlist Transition Behavior Manager** enforces seamless badge continuity and logo separator placement rules during broadcast transitions.

---

## 🏛️ Transition Rules Matrix

```text
  Consecutive News in SAME Playlist           Playlist Label Changes
       (e.g., Jagityal ──> Jagityal)              (e.g., Jagityal ──> Khammam)
                │                                         │
                ▼                                         ▼
         [ Keep Badge ]                            [ Change Badge ]
         - No BADGE_OUT                            - BADGE_OUT (250ms)
         - No BADGE_IN                             - BADGE_IN (300ms)
         - Render LOGO_SEPARATOR                   - BADGE_HOLD
```

---

## 🔑 Core Rules

1. **Rule 1 (Same Playlist)**:
   When news items belong to the same playlist label, the badge remains continuously visible. No `BADGE_OUT` or `BADGE_IN` occurs. Sequence: `NEWS_END ──> LOGO_SEPARATOR ──> NEWS_START`.

2. **Rule 2 (Different Playlist)**:
   When playlist label changes, the badge animates out before entering for the new category. Sequence: `NEWS_END ──> BADGE_OUT ──> BADGE_IN ──> BADGE_HOLD ──> NEWS_START`.

3. **Rule 3 (Logo Separator)**:
   Logo separators render **ONLY** between consecutive news items inside the same playlist. Never before the first news item, after the final news item, or between different playlists.

4. **Rule 4 (PLAYLIST_END Ordering)**:
   `PLAYLIST_END` occurs **ONLY** after `BADGE_OUT` has completely finished.
