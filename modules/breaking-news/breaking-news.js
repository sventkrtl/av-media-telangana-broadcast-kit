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

    // 1. Initialize Profile Wrapper
    await this.profileWrapper.initialize({
      containerElement: containerEl
    });

    console.log('[BreakingNewsApp] OBS Overlay Initialized successfully.');

    // 2. Subscribe to WebSocket broadcast channel for Control Panel triggers
    this.stateEngine.subscribe(async (msg) => {
      if (!msg || (msg.engine !== 'breaking-news' && msg.engine !== 'global')) return;

      if (msg.action === 'show' || msg.action === 'trigger' || msg.action === 'showNow') {
        const headline = (msg.payload && msg.payload.headline) ? msg.payload.headline : '';
        if (headline) {
          try {
            await this.profileWrapper.showNow(headline);
          } catch (err) {
            console.error('[BreakingNewsApp] Error triggering Breaking News display:', err);
          }
        }
      } else if (msg.action === 'stop' || msg.action === 'hide') {
        this.profileWrapper.stop();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BreakingNewsApp();
});
