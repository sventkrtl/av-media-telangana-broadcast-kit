/**
 * AV Media Telangana Broadcast State Engine
 * Real-Time WebSocket (ws://localhost:8085) + BroadcastChannel + LocalStorage Fallback
 */

export class StateEngine {
  constructor(channelName = 'av_media_broadcast_channel', wsUrl = 'ws://localhost:8085') {
    this.channelName = channelName;
    this.wsUrl = wsUrl;
    this.listeners = [];
    this.lastProcessedNonce = null;

    // 1. WebSocket Engine (Port 8085 for OBS QtWebEngine Dock <-> OBS CEF Overlay)
    this.initWebSocket();

    // 2. BroadcastChannel Engine
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.bc = new BroadcastChannel(channelName);
        this.bc.onmessage = (e) => this.handleIncoming(e.data);
      } catch (err) {}
    }

    // 3. Storage Listener
    window.addEventListener('storage', (e) => {
      if (e.key === this.channelName && e.newValue) {
        try { this.handleIncoming(JSON.parse(e.newValue)); } catch (err) {}
      }
    });

    // 4. CEF Polling Fallback
    setInterval(() => {
      const raw = localStorage.getItem(this.channelName);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          if (data && data.nonce !== this.lastProcessedNonce) {
            this.handleIncoming(data);
          }
        } catch (err) {}
      }
    }, 300);
  }

  initWebSocket() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          this.handleIncoming(data);
        } catch (err) {}
      };
      this.ws.onclose = () => {
        setTimeout(() => this.initWebSocket(), 3000);
      };
      this.ws.onerror = () => {
        try { this.ws.close(); } catch(e) {}
      };
    } catch (e) {}
  }

  emit(action, payload) {
    const data = {
      action,
      payload,
      nonce: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try { this.ws.send(JSON.stringify(data)); } catch (e) {}
    }

    if (this.bc) {
      try { this.bc.postMessage(data); } catch (e) {}
    }

    localStorage.setItem(this.channelName, JSON.stringify(data));
    this.handleIncoming(data);
  }

  handleIncoming(data) {
    if (!data || !data.nonce || data.nonce === this.lastProcessedNonce) return;
    this.lastProcessedNonce = data.nonce;
    this.notify(data);
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify(data) {
    this.listeners.forEach(cb => cb(data));
  }
}
