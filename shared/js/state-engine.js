/**
 * Broadcast Event Bus (Optimized for OBS CEF file:// and http:// origins)
 */

export class StateEngine {
  constructor(channelName = 'av_media_broadcast_channel') {
    this.channelName = channelName;
    this.bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName) : null;
    this.listeners = [];
    this.lastProcessedNonce = null;

    // 1. BroadcastChannel Listener
    if (this.bc) {
      this.bc.onmessage = (e) => this.handleIncoming(e.data);
    }

    // 2. Storage Event Listener (Cross-tab)
    window.addEventListener('storage', (e) => {
      if (e.key === this.channelName && e.newValue) {
        try {
          this.handleIncoming(JSON.parse(e.newValue));
        } catch (err) {}
      }
    });

    // 3. OBS CEF file:// Polling Fallback (300ms) for guaranteed zero-drop sync
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

  emit(action, payload) {
    const data = {
      action,
      payload,
      nonce: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
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
