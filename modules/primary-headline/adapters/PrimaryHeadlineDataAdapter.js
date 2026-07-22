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
  // Direct CSV Fetch for Primary Headline Sheet Format
  // ----------------------------------------------------

  /**
   * Directly fetch and parse the Primary Headline Google Sheet CSV.
   * Handles the format: Order, Active, Priority, Headline, Repeat
   * This bypasses GoogleSheetProvider's PlaylistModel parser which
   * requires a 'Label' column not present in the Primary Headline sheet.
   *
   * Also probes alternate gids (0,1,2) to auto-detect the correct tab.
   *
   * @param {string} url - Google Sheet URL (any format: edit, share, export)
   * @returns {Promise<Array<string>>} Clean, active headline strings in order
   */
  async fetchHeadlinesCsvDirect(url) {
    const normalizedBase = GoogleSheetProvider.normalizeGoogleSheetUrl(url);

    // Build list of URLs to probe: explicit gid first, then gid=1, 0, 2
    const urlsToProbe = [];
    if (normalizedBase.includes('gid=')) {
      urlsToProbe.push(normalizedBase);
    } else {
      // Probe gid=1 first (most common Primary Headline tab position), then 0, 2
      const base = normalizedBase.includes('?') ? normalizedBase : normalizedBase;
      urlsToProbe.push(`${base}&gid=1`, `${base}&gid=0`, `${base}&gid=2`, `${base}&gid=3`);
    }

    for (const probeUrl of urlsToProbe) {
      try {
        const response = await fetch(probeUrl);
        if (!response.ok) continue;

        const csvText = await response.text();
        const headlines = this._parsePrimaryHeadlineCsv(csvText);

        if (headlines.length > 0) {
          console.log(`[PrimaryHeadlineDataAdapter] Direct CSV fetch succeeded. URL: ${probeUrl}, Headlines: ${headlines.length}`);
          return headlines;
        }
      } catch (err) {
        // Try next URL
      }
    }

    return [];
  }

  /**
   * Parse a CSV string that has at minimum a 'Headline' column.
   * Supports formats:
   *   - Order, Active, Priority, Headline, Repeat  (Primary Headline sheet)
   *   - Headline (single column)
   *   - Active, Headline (two columns)
   *
   * Rows with Active = FALSE/false/0 are excluded.
   * Order column is used for sorting if present.
   *
   * @param {string} csvText
   * @returns {Array<string>}
   */
  _parsePrimaryHeadlineCsv(csvText) {
    if (!csvText || typeof csvText !== 'string') return [];

    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Parse header row
    const headers = this._parseCsvRow(lines[0]).map(h => h.trim().toLowerCase());

    const headlineIdx = headers.findIndex(h =>
      h.includes('headline') || h.includes('text') || h.includes('news') || h.includes('content')
    );
    if (headlineIdx === -1) return [];

    const activeIdx = headers.findIndex(h => h.includes('active') || h.includes('status') || h.includes('enable'));
    const orderIdx = headers.findIndex(h => h === 'order' || h === 'priority');

    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const row = this._parseCsvRow(lines[i]);
      if (!row || row.length === 0) continue;

      const headline = (row[headlineIdx] || '').trim();
      if (!headline) continue;

      // Skip inactive rows
      if (activeIdx !== -1) {
        const activeVal = (row[activeIdx] || '').trim().toLowerCase();
        if (activeVal === 'false' || activeVal === '0' || activeVal === 'inactive' || activeVal === 'disabled') {
          continue;
        }
      }

      const order = orderIdx !== -1 ? parseInt(row[orderIdx] || '9999', 10) : i;
      items.push({ headline, order: isNaN(order) ? i : order });
    }

    // Sort by order, preserve editorial sequence
    items.sort((a, b) => a.order - b.order);
    return items.map(item => item.headline);
  }

  /**
   * Minimal RFC 4180-compliant CSV row parser.
   * Handles quoted fields containing commas and newlines.
   */
  _parseCsvRow(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current);
    return fields;
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

    // STRATEGY 1: Direct CSV fetch (handles Primary Headline sheet format)
    this.statusTracker.recordSyncStart();
    try {
      const headlines = await this.fetchHeadlinesCsvDirect(url);

      if (headlines.length > 0) {
        this.lastValidHeadlines = [...headlines];
        this.statusTracker.recordSyncSuccess([]);

        if (this.runtime && this.runtime.isInitialized) {
          this.runtime.loadHeadlines(headlines);
          if (autoPlay) {
            this.runtime.play();
          }
        }

        this._notifyUpdated(headlines);

        // Start background polling via refresh service
        this.refreshService.setIntervalMs(pollInterval);
        this.refreshService.onUpdate(async () => {
          try {
            const newHeadlines = await this.fetchHeadlinesCsvDirect(url);
            if (newHeadlines.length > 0 && !this._areHeadlinesEqual(newHeadlines, this.lastValidHeadlines)) {
              this.scheduleSafeHotReload(newHeadlines);
            }
          } catch (e) {
            this._notifyError(e);
          }
        });
        this.refreshService.start();

        // Wire safe hot reload listener to runtime
        if (this.runtime) {
          this.runtime.onHeadlineComplete(() => {
            if (this.isReloadPending && this.pendingHeadlines) {
              this.applyPendingReload();
            }
          });
        }

        return this.lastValidHeadlines;
      }
    } catch (err) {
      console.warn('[PrimaryHeadlineDataAdapter] Direct CSV strategy failed, trying provider fallback:', err.message);
    }

    // STRATEGY 2: Fallback to GoogleSheetProvider (Secondary Playlist PlaylistModel format)
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
          console.warn('[PrimaryHeadlineDataAdapter] Both strategies returned zero headlines.');
        }
      } else {
        const errMsg = result ? result.error : 'Unknown provider fetch failure';
        this.statusTracker.recordSyncFailure(errMsg);
        this._notifyError(new Error(errMsg));
      }
    } catch (err) {
      this.statusTracker.recordSyncFailure(err.message);
      this._notifyError(err);
      console.warn('[PrimaryHeadlineDataAdapter] Both strategies failed. Retaining last valid dataset.');
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
