/**
 * Broadcast Graphics SDK - Config Engine
 * Manages fetching, caching, and updating module configurations.
 */

export class ConfigEngine {
  static async loadConfig(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error(`[SDK ConfigEngine] Failed to load config from ${url}:`, err);
      return {};
    }
  }
}
