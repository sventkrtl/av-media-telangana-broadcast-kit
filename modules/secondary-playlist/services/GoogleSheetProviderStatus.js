/**
 * AV Media Telangana - Google Sheet Provider Health & Status Monitor (Task M2-1C)
 * Dedicated health & telemetry monitoring for GoogleSheetProvider and GoogleSheetRefreshService.
 * Tracks ONLINE/OFFLINE/SYNCING/ERROR states, dataset versions, sync metrics, and failure diagnostics.
 * Strictly adheres to SECONDARY_NEWS_PLAYLIST_ENGINE_SPEC.md Constitution v1.0.
 */

export class GoogleSheetProviderStatus {
  constructor(options = {}) {
    this.csvUrl = options.csvUrl || '';
    this.pollInterval = options.pollInterval || 30000;

    this.state = 'OFFLINE'; // 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'ERROR'
    this.lastSync = null;
    this.playlistCount = 0;
    this.newsCount = 0;
    this.datasetVersion = 0;
    this.lastError = null;
    this.failureCount = 0;
  }

  setCsvUrl(url) {
    if (typeof url === 'string') this.csvUrl = url;
  }

  setPollInterval(intervalMs) {
    if (typeof intervalMs === 'number') this.pollInterval = intervalMs;
  }

  /**
   * Record start of sync operation.
   */
  recordSyncStart() {
    this.state = 'SYNCING';
  }

  /**
   * Record successful sync metrics & dataset version increment.
   */
  recordSyncSuccess(playlistsInput = []) {
    this.state = 'ONLINE';
    this.lastSync = new Date().toISOString();
    this.lastError = null;
    this.failureCount = 0;
    this.datasetVersion++;

    const playlists = Array.isArray(playlistsInput) ? playlistsInput : [];
    this.playlistCount = playlists.length;
    this.newsCount = playlists.reduce((total, pl) => {
      return total + (Array.isArray(pl.items) ? pl.items.length : 0);
    }, 0);
  }

  /**
   * Record sync failure with diagnostic error message.
   */
  recordSyncFailure(errorMessage) {
    this.failureCount++;
    this.lastError = String(errorMessage || 'Unknown provider error');
    this.state = this.failureCount >= 3 ? 'OFFLINE' : 'ERROR';
  }

  /**
   * Standardized Health Status API for telemetry & diagnostics.
   */
  getStatus() {
    return {
      status: this.state,
      lastSync: this.lastSync,
      pollInterval: this.pollInterval,
      csvUrl: this.csvUrl,
      playlistCount: this.playlistCount,
      newsCount: this.newsCount,
      datasetVersion: this.datasetVersion,
      lastError: this.lastError,
      failureCount: this.failureCount
    };
  }

  reset() {
    this.state = 'OFFLINE';
    this.lastSync = null;
    this.playlistCount = 0;
    this.newsCount = 0;
    this.datasetVersion = 0;
    this.lastError = null;
    this.failureCount = 0;
  }
}
