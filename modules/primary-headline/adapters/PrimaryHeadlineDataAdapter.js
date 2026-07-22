/**
 * AV Media Telangana - Primary Headline Data Adapter (Task P1-6 Thin Adapter)
 *
 * Consumes existing frozen GoogleSheetProvider, GoogleSheetRefreshService, and
 * GoogleSheetProviderStatus via their public APIs ONLY. Converts PlaylistModel[] data
 * into clean Headline[] arrays for PrimaryHeadlineRuntime.
 *
 * Rules & Boundaries:
 *   - Thin Adapter pattern inside modules/primary-headline/adapters/
 *   - Zero edits or modifications to frozen provider files
 *   - Consumes ONLY public APIs (fetchPlaylists(), getStatus(), start(), onUpdate())
 *   - Filters out inactive, disabled, empty, null, or whitespace-only headlines
 *   - Preserves top-to-bottom editorial order (never randomizes)
 *   - Safe boundary hot reload (applies dataset changes ONLY after HEADLINE_END)
 *   - Failure policy: auto-retry on failure, retains last valid dataset if connection drops
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0 & ENGINEERING_GOVERNANCE.md.
 */

import { GoogleSheetProvider } from '../../secondary-playlist/data-providers/GoogleSheetProvider.js';
import { GoogleSheetRefreshService } from '../../secondary-playlist/services/GoogleSheetRefreshService.js';
import { GoogleSheetProviderStatus } from '../../secondary-playlist/services/GoogleSheetProviderStatus.js';
import { EVENT_TYPES } from '../HeadlineTimelineEvent.js';

export class PrimaryHeadlineDataAdapter {
  /**
   * @param {Object} [options]
   * @param {PrimaryHeadlineRuntime} [options.runtime] - Primary Headline Runtime instance
   * @param {GoogleSheetProvider} [options.provider] - Existing provider instance
   * @param {GoogleSheetRefreshService} [options.refreshService] - Existing refresh service instance
   * @param {GoogleSheetProviderStatus} [options.statusTracker] - Existing status tracker instance
   */
  constructor(options = {}) {
    this.runtime = options.runtime || null;
    this.url = options.url || '';

    // Consume existing providers through public APIs only
    this.provider = options.provider || new GoogleSheetProvider({ url: this.url });
    this.statusTracker = options.statusTracker || new GoogleSheetProviderStatus({ url: this.url });

    this.refreshService = options.refreshService || new GoogleSheetRefreshService({
      provider: this.provider,
      runtime: null, // Custom boundary reload handled by this adapter
      intervalMs: options.pollInterval || 30000
    });

    this.lastValidHeadlines = [];
    this.pendingHeadlines = null;
    this.isReloadPending = false;

    // Callbacks
    this.onHeadlinesUpdatedCallbacks = [];
    this.onErrorCallbacks = [];
  }

  // ----------------------------------------------------
  // Public Event Hooks
  // ----------------------------------------------------

  /**
   * Register a callback triggered when headlines dataset updates.
   * @param {Function} callback - (headlines) => void
   */
  onHeadlinesUpdated(callback) {
    if (typeof callback === 'function') {
      this.onHeadlinesUpdatedCallbacks.push(callback);
    }
  }

  /**
   * Register a callback triggered on provider/adapter error.
   * @param {Function} callback - (error) => void
   */
  onError(callback) {
    if (typeof callback === 'function') {
      this.onErrorCallbacks.push(callback);
    }
  }

  // ----------------------------------------------------
  // Headline Conversion & Filtering
  // ----------------------------------------------------

  /**
   * Convert PlaylistModel[] from provider into a clean Headline[] string list.
   *
   * Rules:
   *   - Ignore inactive/disabled items
   *   - Ignore empty, null, or whitespace-only headlines
   *   - Preserve top-to-bottom editorial order (never randomize)
   *
   * @param {Array<Object>} playlists - List of PlaylistModel objects from provider
   * @returns {Array<string>} Clean headline string array
   */
  extractHeadlines(playlists) {
    if (!Array.isArray(playlists) || playlists.length === 0) {
      return [];
    }

    const headlines = [];

    playlists.forEach(playlist => {
      // Ignore inactive/disabled playlists if status property exists
      if (playlist && playlist.status !== undefined && String(playlist.status).toLowerCase() === 'inactive') {
        return;
      }

      const items = Array.isArray(playlist.items) ? playlist.items : [];

      items.forEach(item => {
        if (item === null || item === undefined) return;

        let text = '';
        if (typeof item === 'string') {
          text = item.trim();
        } else if (typeof item === 'object' && item !== null && typeof item.text === 'string') {
          text = item.text.trim();
        }

        // Ignore empty or whitespace-only headlines
        if (text && text.length > 0) {
          headlines.push(text);
        }
      });
    });

    return headlines;
  }

  // ----------------------------------------------------
  // Connection & Refresh Service Lifecycle
  // ----------------------------------------------------

  /**
   * Connect to Google Sheet URL and start automatic polling.
   *
   * @param {Object} params
   * @param {string} params.url - Web-published Google Sheet URL / CSV URL
   * @param {number} [params.pollInterval=30000] - Polling interval in ms
   * @param {boolean} [params.autoPlay=true] - Auto-play runtime after loading
   * @returns {Promise<Array<string>>} Loaded headlines
   */
  async connectGoogleSheet({ url, pollInterval = 30000, autoPlay = true }) {
    if (!url || typeof url !== 'string' || !url.trim()) {
      const err = new Error('[PrimaryHeadlineDataAdapter] Google Sheet URL is required.');
      this._notifyError(err);
      throw err;
    }

    const normalizedUrl = GoogleSheetProvider.normalizeGoogleSheetUrl(url);
    this.url = normalizedUrl;
    this.provider.url = normalizedUrl;
    this.statusTracker.setCsvUrl(normalizedUrl);

    // Initial fetch
    this.statusTracker.recordSyncStart();
    try {
      const result = await this.provider.fetchPlaylists();

      if (result && result.success && Array.isArray(result.data)) {
        const headlines = this.extractHeadlines(result.data);

        if (headlines.length > 0) {
          this.lastValidHeadlines = [...headlines];
          this.statusTracker.recordSyncSuccess(result.data);

          if (this.runtime && this.runtime.isInitialized) {
            this.runtime.loadHeadlines(headlines);
            if (autoPlay) {
              this.runtime.play();
            }
          }

          this._notifyUpdated(headlines);
        } else {
          console.warn('[PrimaryHeadlineDataAdapter] Fetched feed contains zero active headlines.');
        }
      } else {
        const errMsg = result ? result.error : 'Unknown provider fetch failure';
        this.statusTracker.recordSyncFailure(errMsg);
        this._notifyError(new Error(errMsg));
      }
    } catch (err) {
      this.statusTracker.recordSyncFailure(err.message);
      this._notifyError(err);
      console.warn('[PrimaryHeadlineDataAdapter] Fetch failed. Retaining last valid dataset.');
    }

    // Configure and start background refresh service
    this.refreshService.setIntervalMs(pollInterval);

    // Listen to background updates from refresh service
    this.refreshService.onUpdate((result) => {
      if (result && result.success && Array.isArray(result.data)) {
        const newHeadlines = this.extractHeadlines(result.data);
        if (newHeadlines.length > 0 && !this._areHeadlinesEqual(newHeadlines, this.lastValidHeadlines)) {
          this.scheduleSafeHotReload(newHeadlines);
        }
      }
    });

    this.refreshService.onError((err) => {
      this.statusTracker.recordSyncFailure(err.message || 'Background poll error');
      this._notifyError(err);
    });

    this.refreshService.start();

    // Wire safe hot reload listener to runtime's headline completion event
    if (this.runtime) {
      this.runtime.onHeadlineComplete(() => {
        if (this.isReloadPending && this.pendingHeadlines) {
          this.applyPendingReload();
        }
      });
    }

    return this.lastValidHeadlines;
  }

  // ----------------------------------------------------
  // Safe Boundary Hot Reload (HEADLINE_END Contract)
  // ----------------------------------------------------

  /**
   * Schedule hot reload to be applied at HEADLINE_END boundary without interrupting active animation.
   *
   * @param {Array<string>} newHeadlines
   */
  scheduleSafeHotReload(newHeadlines) {
    if (!Array.isArray(newHeadlines) || newHeadlines.length === 0) return;

    this.pendingHeadlines = [...newHeadlines];
    this.isReloadPending = true;
    console.log('[PrimaryHeadlineDataAdapter] Content change detected! Hot reload scheduled pending HEADLINE_END.');
  }

  /**
   * Apply scheduled pending dataset update safely.
   */
  applyPendingReload() {
    if (!this.isReloadPending || !this.pendingHeadlines) return;

    const headlinesToApply = [...this.pendingHeadlines];
    this.lastValidHeadlines = headlinesToApply;
    this.pendingHeadlines = null;
    this.isReloadPending = false;

    if (this.runtime && this.runtime.isInitialized) {
      this.runtime.loadHeadlines(headlinesToApply);
    }

    this._notifyUpdated(headlinesToApply);
    console.log('[PrimaryHeadlineDataAdapter] Safe boundary reached. Pending headlines update applied to runtime.');
  }

  // ----------------------------------------------------
  // Provider Status Passthrough API
  // ----------------------------------------------------

  /**
   * Get provider telemetry and status metrics without modifying provider objects.
   *
   * @returns {Object} Status metrics object
   */
  getProviderStatus() {
    if (this.statusTracker) {
      return this.statusTracker.getStatus();
    }
    return {
      status: 'OFFLINE',
      playlistCount: 0,
      totalNewsCount: 0
    };
  }

  // ----------------------------------------------------
  // Helper Utilities
  // ----------------------------------------------------

  _areHeadlinesEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, index) => val === arr2[index]);
  }

  _notifyUpdated(headlines) {
    this.onHeadlinesUpdatedCallbacks.forEach(fn => {
      try { fn(headlines); } catch (e) { console.error(e); }
    });
  }

  _notifyError(err) {
    this.onErrorCallbacks.forEach(fn => {
      try { fn(err); } catch (e) { console.error(e); }
    });
  }
}
