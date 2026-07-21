/**
 * Broadcast Event Bus (Lightweight & YAGNI Compliant)
 */

export class StateEngine {
  constructor(channelName = 'av_media_broadcast_channel') {
    this.channelName = channelName;
    this.bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName) : null;
    this.listeners = [];

    if (this.bc) {
      this.bc.onmessage = (e) => this.notify(e.data);
    }

    window.addEventListener('storage', (e) => {
      if (e.key === this.channelName && e.newValue) {
        try { this.notify(JSON.parse(e.newValue)); } catch (err) {}
      }
    });
  }

  emit(action, payload) {
    const data = { action, payload, time: Date.now() };
    if (this.bc) this.bc.postMessage(data);
    localStorage.setItem(this.channelName, JSON.stringify(data));
    this.notify(data);
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify(data) {
    this.listeners.forEach(cb => cb(data));
  }
}
