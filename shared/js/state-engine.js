/**
 * AV Media Telangana Broadcast Kit - Real-time State & BroadcastChannel Engine
 * Facilitates zero-latency communication between OBS Docks (Control Panel) and Overlay Sources.
 */

export class StateEngine {
  constructor(channelName = 'av_media_broadcast_channel') {
    this.channelName = channelName;
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName) : null;
    this.listeners = new Set();

    if (this.channel) {
      this.channel.onmessage = (event) => {
        this.notify(event.data);
      };
    }

    // Storage event fallback for cross-tab or OBS dock compatibility
    window.addEventListener('storage', (event) => {
      if (event.key === this.channelName && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          this.notify(data);
        } catch (e) {
          console.error('[StateEngine] Storage event parse error:', e);
        }
      }
    });
  }

  emit(action, payload) {
    const message = { action, payload, timestamp: Date.now() };
    if (this.channel) {
      this.channel.postMessage(message);
    }
    // Storage fallback trigger
    localStorage.setItem(this.channelName, JSON.stringify(message));
    this.notify(message);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(data) {
    for (const listener of this.listeners) {
      listener(data);
    }
  }
}
