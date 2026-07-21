/**
 * Broadcast Graphics SDK - API Engine
 * Manages external data sources (RSS, REST JSON API, WebSocket feeds).
 */

export class ApiEngine {
  static async fetchJson(url) {
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.error(`[SDK ApiEngine] JSON fetch error:`, err);
      return null;
    }
  }

  static connectWebSocket(url, onMessage) {
    const ws = new WebSocket(url);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        onMessage(event.data);
      }
    };
    return ws;
  }
}
