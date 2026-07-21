# Plugin & Controller Setup Guide

This guide covers setup procedures for external plugins, WebSocket controllers, and automated data ingestion scripts.

---

## 📡 Live Controller & WebSocket Setup

The broadcast kit includes a WebSocket state server under `shared/js/` to sync graphic states across multiple browser instances or remote control panels.

### Environment Requirements
- Node.js v18+ or Python 3.10+ (for WebSocket server runner)
- OBS Studio 28.0+ (built-in OBS WebSocket 5.x support)

### Initializing Controller Connection
```javascript
import { BroadcastController } from '../shared/js/controller.js';

const controller = new BroadcastController({
  wsUrl: 'ws://localhost:8080',
  autoReconnect: true
});

controller.on('stateChange', (data) => {
  console.log('Broadcast Graphic State Updated:', data);
});
```

---

## 📰 Ingesting External Data Feeds

- **RSS Ticker Feed**: Configure your RSS feed endpoint in `shared/config/ticker-config.json`.
- **Google Sheets Live Ingestion**: Use standard published CSV/JSON endpoints to pull live lower-third speaker names and news bulletins dynamically.
