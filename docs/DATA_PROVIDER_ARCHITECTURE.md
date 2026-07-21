# Data Provider Architecture

The Secondary News Playlist Engine uses a generic Data Provider Abstraction Layer to receive news playlists from any data source without coupling the core broadcast rendering engine to external file formats or network protocols.

---

## 🏛️ Architecture Flow

```text
External Source (JSON / Excel / Google Sheets / REST API)
                       │
                       ▼
            [ Data Provider Layer ]
                       │
                       │ Returns Standardized
                       ▼
                  Playlist[]
                       │
                       ▼
      [ Secondary Playlist Engine ]
```

---

## 🔑 Core Components

1. **`BaseDataProvider` Interface**:
   Contract requiring `initialize()`, `load()`, `refresh()`, `dispose()`, `getPlaylists()`, and `getStatus()`.

2. **`ProviderResult` Model**:
   Standardized container returning `Playlists[]` objects to ensure no source-specific objects leak into the Playlist Engine.

3. **`ProviderRegistry`**:
   Central registry mapping provider keys (`json`, `excel`, `google-sheet`, `api`, `custom`) to provider implementation classes.

4. **`ProviderFactory`**:
   Factory interface instantiating provider objects dynamically via the registry.

---

## 🛡️ Isolation Rule

The **Secondary News Playlist Engine** communicates **ONLY** with the `BaseDataProvider` interface contract. It never accesses Google Sheets, Excel files, or external APIs directly.
