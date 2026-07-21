# Google Sheet Data Provider Architecture (Read-Only)

The **Google Sheet Data Provider** consumes web-published Google Sheet CSV endpoints without requiring OAuth, Google API keys, or user login.

---

## 🏛️ Data Ingestion Flow

```text
  [ Published Google Sheet ]
 (File -> Publish to Web -> CSV)
               │
               ▼
      [ Public Web CSV URL ]
               │
               ▼
     [ GoogleSheetProvider ]
 (Parses UTF-8 Telugu, Filters Inactive)
               │
               ▼
       [ PlaylistModel[] ]
```

---

## 🔑 Key Features & Parsing Rules

1. **Read-Only Ingestion**:
   Consumes web-published CSV URL or raw CSV string. No write operations or API authentication required.

2. **Telugu UTF-8 Support**:
   Full support for multi-line quoted Telugu text and district/category names.

3. **Status & Priority Filtering**:
   Filters out inactive/disabled rows (`Status === 'inactive'`). Sorts headlines by priority order.

4. **Fault Tolerance**:
   Traps malformed CSV rows, missing columns, or HTTP network failures gracefully without crashing the broadcast runtime.
