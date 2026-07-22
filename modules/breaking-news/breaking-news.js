/**
 * AV Media Telangana - Breaking News Profile Overlay OBS Entrypoint (Task B1-0)
 *
 * Client entrypoint script running inside OBS Browser Source (http://127.0.0.1:8085/modules/breaking-news/).
 * Initializes BreakingNewsProfile wrapper and listens to WebSocket control channel for manual triggers.
 *
 * Rules:
 *   - Follows BREAKING_NEWS_PROFILE_ARCHITECTURE.md 100%
 *   - Reuses Primary Headline Engine Architecture via profile configuration wrapper
 *   - Zero code duplicated from primary-headline
 *   - Handles Manual Operator Triggers (SHOW NOW / STOP)
 *   - Sends preemption and release handshakes via StateEngine
 *
 * Control Panel WebSocket Event Protocol:
 *   SHOW NOW → emits engine='breaking-news', action='preempt', payload.headline=<string>
 *   STOP     → emits engine='breaking-news', action='release'
 */

import { BreakingNewsProfile } from './BreakingNewsProfile.js';
import { StateEngine } from '../../shared/js/state-engine.js';

export class BreakingNewsApp {
  constructor() {
    this.stateEngine = new StateEngine('av_media_broadcast_channel');
    this.profileWrapper = new BreakingNewsProfile({ stateEngine: this.stateEngine });
    this.init();
  }

  async init() {
    const containerEl = document.getElementById('bn-container');

    // 1. Initialize Profile Wrapper (does NOT start playback — overlay is transparent on load)
    await this.profileWrapper.initialize({
      containerElement: containerEl
    });

    console.log('[BreakingNewsApp] OBS Overlay Initialized. Idle state — awaiting SHOW NOW trigger.');

    // 2. Subscribe to WebSocket broadcast channel for Control Panel triggers.
    //    SHOW NOW  → 'preempt' (primary event from Control Panel)
    //    STOP      → 'release' (primary event from Control Panel)
    //    Legacy aliases supported for backward compatibility.
    this.stateEngine.subscribe(async (msg) => {
      if (!msg || (msg.engine !== 'breaking-news' && msg.engine !== 'global')) return;

      const action = msg.action;

      // SHOW NOW: 'preempt' is the primary action emitted by the Control Panel.
      // Legacy: 'show', 'trigger', 'showNow' also accepted for compatibility.
      if (action === 'preempt' || action === 'show' || action === 'trigger' || action === 'showNow') {
        const headline = (msg.payload && msg.payload.headline) ? msg.payload.headline : '';
        if (!headline) {
          console.warn('[BreakingNewsApp] SHOW NOW received with empty headline — ignoring.');
          return;
        }
        if (this.profileWrapper.isActive) {
          console.warn('[BreakingNewsApp] SHOW NOW received while already active — ignoring duplicate.');
          return;
        }
        try {
          console.log(`[BreakingNewsApp] SHOW NOW → "${headline}"`);
          await this.profileWrapper.showNow(headline);
        } catch (err) {
          console.error('[BreakingNewsApp] Error triggering Breaking News display:', err);
        }
        return;
      }

      // STOP: 'release' is the primary action emitted by the Control Panel.
      // Legacy: 'stop', 'hide' also accepted for compatibility.
      if (action === 'release' || action === 'stop' || action === 'hide') {
        if (!this.profileWrapper.isActive) {
          console.log('[BreakingNewsApp] STOP received while already idle — ignoring.');
          return;
        }
        console.log('[BreakingNewsApp] STOP → resetting to transparent idle state.');
        this.profileWrapper.stop();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BreakingNewsApp();
});
