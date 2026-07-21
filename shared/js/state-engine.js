/**
 * AV Media Telangana Broadcast State Engine
 * Frozen Protocol Schema (v1), Layer-Separated Payload & Reconnect Logic
 */

export class StateEngine {
  constructor(channelName = 'av_media_broadcast_channel', wsUrl = 'ws://127.0.0.1:8085') {
    this.channelName = channelName;
    this.wsUrl = wsUrl;
    this.listeners = [];
    this.statusListeners = [];
    this.lastProcessedRequestId = null;

    // Exponential Backoff Reconnect Variables
    this.reconnectAttempts = 0;
    this.reconnectDelays = [1000, 2000, 5000]; // 1s -> 2s -> 5s
    this.connectionStatus = 'DISCONNECTED';

    // 1. Initialize WebSocket Connection
    this.initWebSocket();

    // 2. BroadcastChannel Fallback
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.bc = new BroadcastChannel(channelName);
        this.bc.onmessage = (e) => this.handleIncoming(e.data);
      } catch (err) {}
    }

    // 3. Storage Listener Fallback
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
          if (data && data.requestId !== this.lastProcessedRequestId) {
            this.handleIncoming(data);
          }
        } catch (err) {}
      }
    }, 300);
  }

  setStatus(status) {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.statusListeners.forEach(cb => cb(status));
    }
  }

  onStatusChange(callback) {
    this.statusListeners.push(callback);
    callback(this.connectionStatus);
  }

  initWebSocket() {
    try {
      this.setStatus('RECONNECTING');
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('CONNECTED');
        console.log('[StateEngine] WebSocket Connected (Protocol v1).');
      };

      this.ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          this.handleIncoming(data);
        } catch (err) {}
      };

      this.ws.onclose = () => {
        this.setStatus('RECONNECTING');
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        try { this.ws.close(); } catch(e) {}
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    const delay = this.reconnectDelays[Math.min(this.reconnectAttempts, this.reconnectDelays.length - 1)];
    this.reconnectAttempts++;
    setTimeout(() => this.initWebSocket(), delay);
  }

  /**
   * Emit Protocol v1 Frame
   * @param {string} engine - Target graphic engine ('ticker', 'lower-third', 'reporter', 'breaking')
   * @param {string} action - Intent action ('update', 'pause', 'resume', 'show', 'hide')
   * @param {Object} payload - Engine-specific data payload
   * @param {string} source - Origin source identifier ('control-panel', 'mobile', 'automation')
   */
  emit(engine, action, payload = {}, source = 'control-panel') {
    const timestamp = Date.now();
    const requestId = `${timestamp}_${Math.random().toString(36).substr(2, 8)}`;

    const data = {
      version: 1,
      timestamp: timestamp,
      requestId: requestId,
      source: source,
      engine: engine || 'ticker',
      action: action,
      payload: payload
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
    if (!data || !data.requestId || data.requestId === this.lastProcessedRequestId) return;
    this.lastProcessedRequestId = data.requestId;
    this.notify(data);
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify(data) {
    this.listeners.forEach(cb => cb(data));
  }
}
