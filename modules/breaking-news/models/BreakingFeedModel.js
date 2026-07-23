/**
 * AV Media Telangana - Breaking Feed Model (Task B1-2C)
 *
 * Single Source of Truth (SSOT) model for the Breaking Profile workflow.
 * Encapsulates application state for the Breaking feed, decoupling UI presentation
 * (DOM) from business data and runtime injection.
 *
 * Architecture Flow:
 *   Google Sheet / Manual Entry ➔ BreakingFeedModel ➔ Preview UI Projection
 *                                         │
 *                                         └➔ SHOW NOW ➔ Runtime ➔ Overlay
 *
 * Rules:
 *   - DOM nodes are NEVER read as data sources.
 *   - UI is a visual projection (observer) subscribing to snapshot updates.
 *   - Runtime consumes BreakingFeedModel.currentHeadline directly.
 *   - Scoped strictly to Breaking Profile module (not attached to global window).
 */

export class BreakingFeedModel {
  constructor() {
    this.headlines = [];
    this.selectedIndex = 0;
    this.manualHeadline = null;
    this.feedSource = 'Google Sheet'; // 'Google Sheet' | 'Manual'
    this.providerStatus = 'UNINITIALIZED'; // 'UNINITIALIZED' | 'LOADING' | 'READY' | 'ERROR'
    this.state = 'IDLE'; // 'IDLE' | 'READY' | 'ACTIVE'
    this.lastError = null;
    this.lastSync = null;
    this.revision = 0;
    this.listeners = [];
  }

  /**
   * Computed current headline getter.
   * Gives preference to active manual override if present, otherwise reads from headlines[selectedIndex].
   * @returns {string}
   */
  get currentHeadline() {
    if (this.manualHeadline) {
      return this.manualHeadline;
    }
    if (this.headlines && this.headlines.length > 0) {
      const idx = (this.selectedIndex >= 0 && this.selectedIndex < this.headlines.length) ? this.selectedIndex : 0;
      return this.headlines[idx] || '';
    }
    return '';
  }

  /**
   * Update feed data from Google Sheet provider.
   * Resets manual override unless explicitly preserved.
   *
   * @param {Array<string>} headlines - Array of headline strings
   * @param {Object} [statusObj] - Status metadata object
   */
  setSheetFeed(headlines, statusObj = {}) {
    this.headlines = Array.isArray(headlines) ? [...headlines] : [];
    this.selectedIndex = 0;
    this.manualHeadline = null;
    this.feedSource = 'Google Sheet';
    this.providerStatus = statusObj.status || (this.headlines.length > 0 ? 'READY' : 'UNINITIALIZED');
    this.lastError = statusObj.lastError || null;
    this.lastSync = new Date().toISOString();
    
    if (this.state !== 'ACTIVE') {
      this.state = this.headlines.length > 0 ? 'READY' : 'IDLE';
    }

    this.revision++;
    this._logModel();
    this.notify();
  }

  /**
   * Set manual headline override.
   * @param {string} headlineText
   */
  setManualHeadline(headlineText) {
    const text = (headlineText || '').trim();
    if (!text) return;

    this.manualHeadline = text;
    this.feedSource = 'Manual';
    if (this.state !== 'ACTIVE') {
      this.state = 'READY';
    }

    this.revision++;
    this._logModel();
    this.notify();
  }

  /**
   * Select a specific headline from headlines[] array.
   * @param {number} index
   */
  selectIndex(index) {
    if (typeof index === 'number' && index >= 0 && index < (this.headlines.length || 1)) {
      this.selectedIndex = index;
      this.manualHeadline = null;
      this.feedSource = 'Google Sheet';
      this.revision++;
      this._logModel();
      this.notify();
    }
  }

  /**
   * Advance to the next headline in the circular queue (ring buffer).
   * Automatically wraps from last index to index 0.
   * @returns {Object} Snapshot of next item metadata { headline, nextIndex, isWrapped }
   */
  next() {
    const total = this.headlines.length || 1;
    const nextIdx = (this.selectedIndex + 1) % total;
    const isWrapped = nextIdx === 0;

    this.selectedIndex = nextIdx;
    this.manualHeadline = null;
    this.revision++;

    if (isWrapped) {
      console.log(`[Playback]\n\nRevision:\n${this.revision}\n\nSelected Index:\n${this.selectedIndex + 1} / ${total}\n\nEnd of Queue\n\nRestarting from index 0`);
    } else {
      console.log(`[Playback]\n\nRevision:\n${this.revision}\n\nSelected Index:\n${this.selectedIndex + 1} / ${total}\n\nHeadline Finished\n\nNext Index:\n${this.selectedIndex}\n\nNext Headline:\n${this.currentHeadline}`);
    }

    this.notify();
    return {
      headline: this.currentHeadline,
      selectedIndex: this.selectedIndex,
      totalHeadlines: total,
      isWrapped
    };
  }

  /**
   * Reset selected index back to 0 (called upon STOP).
   */
  resetIndex() {
    this.selectedIndex = 0;
    this.manualHeadline = null;
    this.revision++;
    this._logModel();
    this.notify();
  }

  /**
   * Clear manual override and revert to Google Sheet feed.
   */
  clearManual() {
    this.manualHeadline = null;
    this.feedSource = 'Google Sheet';
    if (this.state !== 'ACTIVE') {
      this.state = this.headlines.length > 0 ? 'READY' : 'IDLE';
    }
    this.revision++;
    this._logModel();
    this.notify();
  }

  /**
   * Transition State Machine state.
   * Supported states: 'IDLE' | 'READY' | 'ACTIVE'
   * @param {string} targetState
   */
  transitionTo(targetState) {
    const validStates = ['IDLE', 'READY', 'ACTIVE'];
    if (!validStates.includes(targetState)) {
      console.warn(`[BreakingFeedModel] Invalid target state: ${targetState}`);
      return;
    }
    if (this.state !== targetState) {
      this.state = targetState;
      this.revision++;
      this._logModel();
      this.notify();
    }
  }

  /**
   * Returns immutable snapshot of current model state.
   * @returns {Object}
   */
  getSnapshot() {
    return {
      currentHeadline: this.currentHeadline,
      headlines: [...this.headlines],
      selectedIndex: this.selectedIndex,
      manualHeadline: this.manualHeadline,
      feedSource: this.feedSource,
      providerStatus: this.providerStatus,
      state: this.state,
      lastError: this.lastError,
      lastSync: this.lastSync,
      revision: this.revision
    };
  }

  /**
   * Internal logging function enforcing specified logging output.
   * @private
   */
  _logModel() {
    const total = this.headlines.length || 1;
    const currentIdx = this.manualHeadline ? 'Manual' : `${this.selectedIndex + 1} / ${total}`;
    console.log(`[BreakingFeedModel]\n\nRevision: ${this.revision}\nSelected Index: ${currentIdx}\nCurrent Headline:\n${this.currentHeadline}\n\nProvider:\n${this.feedSource}\n\nState:\n${this.state}`);
  }

  /**
   * Subscribe listener to model changes.
   * @param {Function} listener
   * @returns {Function} Unsubscribe handle
   */
  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all subscribed listeners with current snapshot.
   */
  notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach(fn => {
      try { fn(snapshot); } catch (e) { console.error(e); }
    });
  }
}
