/**
 * AV Media Telangana - Google Sheet Refresh Service (Task M2-1B Auto Refresh & Hot Reload)
 * Automatic background polling service for GoogleSheetProvider with deep diff change detection
 * and zero-interruption safe playlist boundary hot reloads.
 * Strictly adheres to SECONDARY_NEWS_PLAYLIST_ENGINE_SPEC.md Constitution v1.0.
 */

import { EVENT_TYPES } from '../interpreter/TimelineEvent.js';

export class GoogleSheetRefreshService {
  constructor(options = {}) {
    this.provider = options.provider || null;
    this.runtime = options.runtime || null;
    
    // Polling Interval: 15000 (15s), 30000 (30s - default), 60000 (60s), 0 (Manual)
    this.intervalMs = typeof options.intervalMs === 'number' ? options.intervalMs : 30000;
    
    this.timer = null;
    this.isRunning = false;
    this.lastValidPlaylists = [];
    this.pendingPlaylists = null;
    this.isReloadPending = false;
    
    // Callback hooks
    this.onUpdateCallbacks = [];
    this.onErrorCallbacks = [];
  }

  onUpdate(callback) {
    if (typeof callback === 'function') this.onUpdateCallbacks.push(callback);
  }

  onError(callback) {
    if (typeof callback === 'function') this.onErrorCallbacks.push(callback);
  }

  setIntervalMs(intervalMs) {
    const validInterval = typeof intervalMs === 'number' && intervalMs >= 0 ? intervalMs : 30000;
    this.intervalMs = validInterval;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Start automatic background polling.
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    if (this.intervalMs > 0) {
      this.timer = setInterval(() => {
        this.checkForUpdates();
      }, this.intervalMs);
    }
  }

  /**
   * Stop background polling timer.
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  /**
   * Check published Google Sheet CSV for content updates.
   * Traps all network & malformed CSV errors without interrupting active playback.
   */
  async checkForUpdates() {
    if (!this.provider) return false;

    try {
      const result = await this.provider.load();

      if (result.status !== 'success' || !Array.isArray(result.playlists) || result.playlists.length === 0) {
        console.warn('[GoogleSheetRefreshService] Temporary feed load warning/error. Retaining last valid dataset.');
        this.notifyError(result.error || 'Empty or invalid feed');
        return false;
      }

      const newPlaylists = result.playlists;

      if (this.lastValidPlaylists.length === 0) {
        // Initial dataset load
        this.lastValidPlaylists = newPlaylists;
        this.applyToRuntime(newPlaylists);
        return true;
      }

      const changed = this.hasChanged(newPlaylists, this.lastValidPlaylists);
      if (changed) {
        console.log('[GoogleSheetRefreshService] Content change detected! Scheduling safe hot reload.');
        this.scheduleSafeHotReload(newPlaylists);
        return true;
      }

      return false; // No changes detected
    } catch (error) {
      console.warn('[GoogleSheetRefreshService] Network or parsing exception caught safely:', error.message);
      this.notifyError(error.message);
      return false;
    }
  }

  /**
   * Deep diff comparison between new and current PlaylistModel[] datasets.
   * Compares counts, labels, themes, and items.
   */
  hasChanged(newPlaylists, currentPlaylists) {
    if (!Array.isArray(newPlaylists) || !Array.isArray(currentPlaylists)) return true;
    if (newPlaylists.length !== currentPlaylists.length) return true;

    for (let i = 0; i < newPlaylists.length; i++) {
      const pNew = newPlaylists[i];
      const pCurr = currentPlaylists[i];

      if (pNew.label !== pCurr.label) return true;
      if (pNew.theme !== pCurr.theme) return true;
      if (!Array.isArray(pNew.items) || !Array.isArray(pCurr.items)) return true;
      if (pNew.items.length !== pCurr.items.length) return true;

      for (let j = 0; j < pNew.items.length; j++) {
        if (pNew.items[j] !== pCurr.items[j]) return true;
      }
    }

    return false;
  }

  /**
   * Safe Hot Reload: Never interrupts mid-crawl news item.
   * Waits for PLAYLIST_END boundary event before applying updated playlist.
   */
  scheduleSafeHotReload(newPlaylists) {
    this.pendingPlaylists = newPlaylists;
    this.isReloadPending = true;

    if (!this.runtime || !this.runtime.playbackController) {
      this.lastValidPlaylists = newPlaylists;
      return;
    }

    const controller = this.runtime.playbackController;

    // Listen for safe boundary PLAYLIST_END event
    const unsubscribe = (event) => {
      if (this.isReloadPending && event.type === EVENT_TYPES.PLAYLIST_END) {
        this.isReloadPending = false;
        this.lastValidPlaylists = this.pendingPlaylists;
        this.applyToRuntime(this.pendingPlaylists);
        this.pendingPlaylists = null;
      }
    };

    controller.onEventEnd(unsubscribe);
  }

  /**
   * Apply updated playlists to live runtime without restarting motion engines.
   */
  applyToRuntime(playlists) {
    if (this.runtime) {
      this.runtime.loadPlaylists(playlists);
    }
    this.notifyUpdate(playlists);
  }

  notifyUpdate(playlists) {
    this.onUpdateCallbacks.forEach(cb => cb(playlists));
  }

  notifyError(error) {
    this.onErrorCallbacks.forEach(cb => cb(error));
  }
}
