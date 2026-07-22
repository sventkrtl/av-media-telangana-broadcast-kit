/**
 * AV Media Telangana - Primary Headline Engine OBS Entrypoint (Task P1-7)
 *
 * Client entrypoint script running inside OBS Browser Source (http://127.0.0.1:8085/modules/primary-headline/).
 * Initializes PrimaryHeadlineRuntime & PrimaryHeadlineDataAdapter, connects Google Sheet, and starts broadcast.
 *
 * Rules:
 *   - Follows PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0 100%
 *   - Zero modifications to frozen Secondary Engine or Provider files
 *   - Auto-starts playback on load
 *   - Safe boundary hot reload (applies dataset changes ONLY after HEADLINE_END)
 *   - Never crashes; retains last valid headlines on error
 */

import { PrimaryHeadlineRuntime } from './runtime/PrimaryHeadlineRuntime.js';
import { PrimaryHeadlineDataAdapter } from './adapters/PrimaryHeadlineDataAdapter.js';
import { StateEngine } from '../../shared/js/state-engine.js';

export class PrimaryHeadlineApp {
  constructor() {
    this.runtime = new PrimaryHeadlineRuntime();
    this.adapter = null;
    this.stateEngine = new StateEngine('av_media_broadcast_channel');
    this.init();
  }

  async init() {
    const containerEl = document.getElementById('ph-container');
    const barEl = document.getElementById('ph-blue-bar');
    const textEl = document.getElementById('ph-headline-text');

    // 1. Read URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const googleSheetUrl = urlParams.get('sheetUrl') || urlParams.get('csvUrl') || '';
    const pollInterval = parseInt(urlParams.get('interval') || '30000', 10);

    // 2. Initialize Unified Runtime
    await this.runtime.initialize({
      containerElement: containerEl,
      loop: true
    });

    // Manually link DOM nodes if already present in index.html
    if (this.runtime.staticRenderer) {
      if (barEl) this.runtime.staticRenderer.barElement = barEl;
      if (textEl) this.runtime.staticRenderer.textElement = textEl;
    }

    // 3. Create Thin Adapter
    this.adapter = new PrimaryHeadlineDataAdapter({
      runtime: this.runtime,
      pollInterval
    });

    // Log runtime start
    console.log('[PrimaryHeadlineApp] OBS Overlay Initialized successfully.');

    // 4. Connect Published Google Sheet or load default broadcast feed
    if (googleSheetUrl) {
      try {
        await this.adapter.connectGoogleSheet({
          url: googleSheetUrl,
          pollInterval,
          autoPlay: true
        });
      } catch (err) {
        console.warn('[PrimaryHeadlineApp] Google Sheet initial connect error. Using default fallback feed:', err);
        this.loadDefaultFeed();
      }
    } else {
      this.loadDefaultFeed();
    }

    // 5. Subscribe to WebSocket broadcast channel for Control Panel messages
    this.stateEngine.subscribe((msg) => {
      if (!msg || (msg.engine !== 'primary-headline' && msg.engine !== 'global')) return;

      if (msg.action === 'update' && msg.payload) {
        if (msg.payload.sheetUrl) {
          this.adapter.connectGoogleSheet({
            url: msg.payload.sheetUrl,
            pollInterval: msg.payload.pollInterval || 30000,
            autoPlay: true
          });
        } else if (Array.isArray(msg.payload.headlines) && msg.payload.headlines.length > 0) {
          this.runtime.loadHeadlines(msg.payload.headlines);
          this.runtime.play();
        }
      } else if (msg.action === 'pause') {
        this.runtime.pause();
      } else if (msg.action === 'resume') {
        this.runtime.resume();
      } else if (msg.action === 'stop') {
        this.runtime.stop();
      }
    });
  }

  loadDefaultFeed() {
    const defaultHeadlines = [
      'జగిత్యాల జిల్లాలో విస్తారంగా కురుస్తున్న వర్షాలు - కలెక్టరేట్‌లో కంట్రోల్ రూమ్ ఏర్పాటు',
      'ధర్మపురి గోదావరి పుష్కర ఘాట్ వద్ద పెరిగిన నీటిమట్టం - హెచ్చరికలు జారీ',
      'ఇండియా వర్సెస్ ఆస్ట్రేలియా బోర్డర్-గవాస్కర్ ట్రోఫీ మూడో టెస్ట్ రేపే ప్రారంభం'
    ];

    this.runtime.loadHeadlines(defaultHeadlines);
    this.runtime.play();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PrimaryHeadlineApp();
});
