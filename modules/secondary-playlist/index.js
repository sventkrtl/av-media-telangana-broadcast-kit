/**
 * AV Media Telangana - Secondary News Playlist Entrypoint (Task M2-2E)
 * Continuous Playlist Crawl Rendering.
 *
 * Architecture:
 *   - ONE DOM content stream per playlist (all news + logo separators inline).
 *   - ONE translate3d() animation per playlist via ContinuousCrawlAdapter.
 *   - TimelinePlaybackController's await loop is preserved via proportional
 *     timing promises — so badge sequencing remains exactly correct.
 *   - No frozen modules modified (Runtime, PlaybackController, Provider, etc.).
 *
 * SPEC compliance:
 *   §8  — Logos only between news items in the SAME playlist; none between playlists.
 *   §9  — Logo: height=80% of crawl bar, width=auto, aspect ratio preserved.
 *   §10 — Crawl: continuous; all items flow without interruption.
 *   §11 — Duration = TravelDistance / PixelsPerSecond (constant velocity).
 *   §16 — Logo scrolls inline with crawl, not a floating overlay.
 *   §17 — GPU transform only (translate3d). No left/top/width animation.
 */

import { SecondaryPlaylistRuntime } from './SecondaryPlaylistRuntime.js';
import { StateEngine } from '../../shared/js/state-engine.js';
import { PlaylistModel } from './playlist-engine.js';
import { THEME_COLOR_MAP } from './renderer/StaticRenderer.js';
import { EVENT_TYPES } from './interpreter/TimelineEvent.js';

// ═══════════════════════════════════════════════════════════════════════════
// ContinuousCrawlAdapter
//
// Replaces CrawlMotionEngine for the live broadcast overlay.
//
// Responsibilities:
//   1. Build ONE HTML content string per playlist:
//        News1 [gap][Logo][gap] News2 [gap][Logo][gap] News3
//   2. Animate the entire content with ONE translate3d CSS transition.
//   3. Provide per-item timing promises so TimelinePlaybackController
//      can sequence BADGE_OUT correctly after all content exits.
//
// Timing contract (SPEC §11):
//   news(i)    timing = (newsWidth[i] / px) * 1000 ms
//   logo(i)    timing = ((logoW + 2*gap) / px) * 1000 ms
//   news(last) timing = (newsWidth[last] + vpWidth + gap) / px * 1000 ms
//   ─────────────────────────────────────────────────────────────────
//   sum = (contentWidth + vpWidth + gap) / px = totalMs  ✓
//   → BADGE_OUT fires when the last item's back edge exits the viewport.
// ═══════════════════════════════════════════════════════════════════════════
class ContinuousCrawlAdapter {
  /**
   * @param {object}      opts
   * @param {HTMLElement} opts.newsEl          — The #spl-news element
   * @param {HTMLElement} opts.containerEl     — The #spl-crawl-bar element
   * @param {number}      opts.pixelsPerSecond — Constant crawl speed (default 120)
   * @param {number}      opts.gap             — Pixels before/after each logo (default 40)
   * @param {string}      opts.logoSrc         — Logo <img> src path
   * @param {number}      opts.logoHeight       — Rendered logo height in px (80% of bar)
   */
  constructor({ newsEl, containerEl, pixelsPerSecond = 120, gap = 40, logoSrc, logoHeight }) {
    this.newsEl          = newsEl;
    this.containerEl     = containerEl;
    this.pixelsPerSecond = pixelsPerSecond;
    this.gap             = gap;
    this.logoSrc         = logoSrc;
    this.logoHeight      = logoHeight;
    this.isCrawling      = false;

    // Queue of resolve functions from TimelinePlaybackController's awaited promises.
    // Populated by processEvent() / crawl() calls; consumed by scheduled timers.
    this._resolverQueue = [];

    // Active setTimeout handles — all cleared on each new playlist start.
    this._timers = [];
  }

  // ─── TimelinePlaybackController interface ────────────────────────────────

  /**
   * Called by TimelinePlaybackController for each NEWS_START event.
   * Returns a timing promise that resolves after this item's proportional duration.
   * Does NOT touch DOM or transforms — the continuous animation is already running.
   */
  processEvent(element, event, vpWidth = 1920) {
    if (!event || event.type !== EVENT_TYPES.NEWS_START) return Promise.resolve(null);
    return this._enqueue();
  }

  /**
   * Called by TimelinePlaybackController for each LOGO_SEPARATOR event.
   * Returns a timing promise that resolves after the logo+gap traversal duration.
   */
  crawl(element, content, vpWidth = 1920) {
    return this._enqueue();
  }

  /** Enqueue a timing promise. Resolved by the next scheduled timer release. */
  _enqueue() {
    return new Promise(resolve => {
      this._resolverQueue.push(resolve);
    });
  }

  // ─── Continuous crawl orchestration ──────────────────────────────────────

  /**
   * Build the full playlist content and start ONE continuous animation.
   * Called from index.js onEventStart when BADGE_HOLD fires.
   *
   * @param {string[]} items   — Raw news text/HTML strings for one playlist
   * @param {number}   vpWidth — Viewport width in pixels
   */
  startPlaylistCrawl(items, vpWidth = 1920) {
    // Clear any running timers and resolver queue from the previous playlist
    this._clearTimers();
    this._resolverQueue = [];

    if (!items || items.length === 0) return;

    const gap    = this.gap;
    const px     = this.pixelsPerSecond;
    const logoH  = this.logoHeight;
    const logoW  = logoH; // AV round logo is ~1:1 aspect ratio

    // ── Build ONE continuous inline HTML content ──────────────────────────
    // SPEC §8:  Logo ONLY between items of the SAME playlist.
    // SPEC §9:  height=80% of bar, width=auto, aspect ratio preserved.
    // SPEC §16: Logo scrolls with crawl (inline), not floating.
    const gapSpan  = `<span style="display:inline-block;width:${gap}px;flex-shrink:0;"></span>`;
    const logoImg  = `<img src="${this.logoSrc}" alt="" `
                   + `style="height:${logoH}px;width:auto;object-fit:contain;`
                   + `display:inline-block;vertical-align:middle;">`;
    const separator = gapSpan + logoImg + gapSpan;

    this.newsEl.innerHTML = items.join(separator);

    // ── Measure total content width after forced reflow ───────────────────
    void this.newsEl.offsetWidth;
    const contentWidth = Math.max(200, this.newsEl.scrollWidth || this.newsEl.offsetWidth || 500);

    // ── SPEC §11: Duration = TravelDistance / PixelsPerSecond ────────────
    // Content starts: translate3d(+startX) — off-screen right
    // Content ends:   translate3d(-contentWidth) — off-screen left
    // Travel distance = contentWidth + vpWidth + gap
    const startX  = vpWidth + gap;
    const endX    = -contentWidth;
    const totalMs = ((contentWidth + vpWidth + gap) / px) * 1000;

    // ── SPEC §17: GPU transform only — ONE transition, linear, no easing ─
    this.isCrawling = true;
    this.newsEl.style.willChange  = 'transform';
    this.newsEl.style.transition  = 'none';
    this.newsEl.style.transform   = `translate3d(${startX}px, -50%, 0)`;
    void this.newsEl.offsetWidth; // flush initial transform before animation
    this.newsEl.style.transition  = `transform ${totalMs}ms linear`;
    this.newsEl.style.transform   = `translate3d(${endX}px, -50%, 0)`;

    // ── Schedule per-item timing releases ─────────────────────────────────
    //
    // Estimated widths → proportional timing fractions of contentWidth.
    // Scale factor maps character-estimated total to actual scrollWidth
    // so timing stays accurate regardless of font metrics.
    //
    // Event sequence (mirrors PlaylistInterpreter output):
    //   news(0) → logo(0) → news(1) → logo(1) → ... → news(n-1)
    //
    // BADGE_OUT contract:
    //   news(last) duration includes the full viewport exit traversal.
    //   This ensures: sum of all timing promises = totalMs.
    const newsWidths   = items.map(item =>
      Math.max(80, String(item).replace(/<[^>]+>/g, '').length * 11)
    );
    const logoBlockW   = logoW + gap * 2;                         // [gap][logo][gap]
    const logoCount    = items.length - 1;
    const estimatedTotal =
      newsWidths.reduce((s, w) => s + w, 0) + logoCount * logoBlockW;
    const scale        = contentWidth / Math.max(1, estimatedTotal);

    let cumulativeMs = 0;

    items.forEach((_, i) => {
      const isLast  = i === items.length - 1;
      const newsW   = newsWidths[i] * scale;

      // Last item carries the viewport exit traversal so sum = totalMs
      const itemMs  = isLast
        ? ((newsW + vpWidth + gap) / px) * 1000
        : (newsW / px) * 1000;

      cumulativeMs += itemMs;
      this._scheduleRelease(cumulativeMs); // → resolves processEvent() promise

      if (!isLast) {
        const logoMs  = (logoBlockW * scale / px) * 1000;
        cumulativeMs += logoMs;
        this._scheduleRelease(cumulativeMs); // → resolves crawl() promise
      }
    });

    // GPU hint cleanup after animation completes
    const cleanT = setTimeout(() => {
      this.newsEl.style.willChange = 'auto';
      this.newsEl.style.transition = 'none';
      this.isCrawling = false;
    }, totalMs + 150);
    this._timers.push(cleanT);
  }

  /** Pop and resolve the next queued timing promise after delayMs. */
  _scheduleRelease(delayMs) {
    const t = setTimeout(() => {
      const resolve = this._resolverQueue.shift();
      if (typeof resolve === 'function') resolve({ status: 'CRAWL_COMPLETE' });
    }, delayMs);
    this._timers.push(t);
  }

  _clearTimers() {
    this._timers.forEach(t => clearTimeout(t));
    this._timers = [];
  }

  // ─── Compatibility surface (Runtime / test harness) ──────────────────────

  calculateCrawlMetrics(textWidth, vpWidth = 1920) {
    const travelDistance = textWidth + vpWidth + this.gap;
    return {
      textWidth,
      viewportWidth:   vpWidth,
      travelDistance,
      pixelsPerSecond: this.pixelsPerSecond,
      durationSeconds: travelDistance / this.pixelsPerSecond,
      durationMs:      (travelDistance / this.pixelsPerSecond) * 1000,
      startX:          vpWidth + this.gap,
      endX:            -textWidth
    };
  }

  estimateTextWidth(text) {
    if (!text) return 100;
    return Math.max(80, String(text).length * 11);
  }

  setSpeed(pps) {
    if (typeof pps === 'number' && pps > 0) this.pixelsPerSecond = pps;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SecondaryPlaylistApp — OBS Overlay Entrypoint
// ═══════════════════════════════════════════════════════════════════════════

export class SecondaryPlaylistApp {
  constructor() {
    this.runtime = new SecondaryPlaylistRuntime();
    this.stateEngine = new StateEngine('av_media_broadcast_channel');
    this.init();
  }

  async init() {
    const containerEl = document.getElementById('spl-crawl-bar');
    const badgeEl     = document.getElementById('spl-badge');
    const newsEl      = document.getElementById('spl-news');

    // 1. Read URL parameters
    const urlParams       = new URLSearchParams(window.location.search);
    const googleSheetUrl  = urlParams.get('sheetUrl') || urlParams.get('csvUrl') || '';
    const pollInterval    = parseInt(urlParams.get('interval') || '30000', 10);
    const pixelsPerSecond = parseInt(urlParams.get('speed') || '120', 10);

    // 2. Initialize Runtime (wires PlaylistEngine, Interpreter, BadgeMotion, etc.)
    await this.runtime.initialize({
      containerElement: containerEl,
      badgeElement:     badgeEl,
      newsElement:      newsEl,
      pixelsPerSecond,
      logoSrc: '/assets/logos/logo-round.png'
    });

    // 3. Disable StaticRenderer — live broadcast manages DOM directly
    if (this.runtime.staticRenderer) {
      this.runtime.staticRenderer.renderEvent = () => null;
    }

    // 4. Create ContinuousCrawlAdapter
    //    containerEl must already be in the document for offsetHeight/Width.
    const crawlBarHeight  = containerEl ? containerEl.offsetHeight : 52;
    const logoHeight      = Math.round(crawlBarHeight * 0.8);
    const vpWidth         = containerEl ? containerEl.offsetWidth  : 1920;

    const crawlAdapter = new ContinuousCrawlAdapter({
      newsEl,
      containerEl,
      pixelsPerSecond,
      gap:        40,
      logoSrc:    '/assets/logos/logo-round.png',
      logoHeight
    });

    // 5. Wire the adapter into the Runtime's playback chain.
    //    TimelinePlaybackController holds its own reference to crawlMotionEngine,
    //    so both must be replaced. No frozen module files are modified.
    this.runtime.crawlMotionEngine                    = crawlAdapter;
    this.runtime.playbackController.crawlMotionEngine = crawlAdapter;

    // 6. Event callbacks: badge updates + continuous crawl trigger
    if (this.runtime.playbackController) {
      this.runtime.playbackController.onEventStart((event) => {

        // Badge label and theme color — fired on BADGE_IN and BADGE_HOLD
        if (event.type === EVENT_TYPES.BADGE_IN || event.type === EVENT_TYPES.BADGE_HOLD) {
          badgeEl.textContent           = event.label || '';
          badgeEl.style.backgroundColor =
            THEME_COLOR_MAP[event.theme] || THEME_COLOR_MAP.district;
        }

        // BADGE_HOLD: collect all news items for this playlist and start ONE crawl.
        // BadgeMotionEngine.hold() is synchronous (Promise.resolve) so this fires
        // before any NEWS_START event is awaited by the controller.
        if (event.type === EVENT_TYPES.BADGE_HOLD) {
          const timeline = this.runtime.playbackController.timeline;
          const items = timeline
            .filter(e =>
              e.playlistId === event.playlistId &&
              e.type       === EVENT_TYPES.NEWS_START
            )
            .map(e => (e.payload && e.payload.newsContent) ? e.payload.newsContent : '');

          if (items.length > 0) {
            crawlAdapter.startPlaylistCrawl(items, vpWidth);
          }
        }

        // NEWS_START and LOGO_SEPARATOR: no DOM action needed here.
        // Content is already rendered by startPlaylistCrawl().
        // ContinuousCrawlAdapter returns timing promises to the controller.
      });
    }

    // 7. Connect Google Sheet or load default playlists
    if (googleSheetUrl) {
      await this.runtime.connectGoogleSheet({
        url:          googleSheetUrl,
        pollInterval,
        autoPlay:     true
      });
    } else {
      const defaultPlaylists = [
        new PlaylistModel({
          label: 'జగిత్యాల',
          theme: 'district',
          items: [
            'జగిత్యాల జిల్లాలో విస్తారంగా కురుస్తున్న వర్షాలు - కలెక్టరేట్‌లో కంట్రోల్ రూమ్ ఏర్పాటు',
            'ధర్మపురి గోదావరి పుష్కర ఘాట్ వద్ద పెరిగిన నీటిమట్టం - హెచ్చరికలు జారీ'
          ]
        }),
        new PlaylistModel({
          label: 'క్రీడలు',
          theme: 'sports',
          items: [
            'ఇండియా వర్సెస్ ఆస్ట్రేలియా బోర్డర్-గవాస్కర్ ట్రోఫీ మూడో టెస్ట్ రేపే ప్రారంభం',
            'హైదరాబాద్‌లోని ఉప్పల్ స్టేడి్యంలో అంతర్జాతీయ బ్యాడ్మింటన్ సిరీస్ పోటీలు'
          ]
        }),
        new PlaylistModel({
          label: 'వాతావరణం',
          theme: 'weather',
          items: [
            'మరో రెండు రోజుల పాటు తెలంగాణలో భారీ వర్షాలు - హైదరాబాద్ వాతావరణ కేంద్రం హెచ్చరిక'
          ]
        })
      ];

      this.runtime.loadPlaylists(defaultPlaylists);
      this.runtime.play();
    }

    // 8. WebSocket messages from Control Panel
    this.stateEngine.subscribe((msg) => {
      if (!msg || msg.engine !== 'secondary-playlist') return;

      if (msg.action === 'update' && msg.payload) {
        if (msg.payload.sheetUrl) {
          this.runtime.connectGoogleSheet({
            url:          msg.payload.sheetUrl,
            pollInterval: msg.payload.pollInterval || 30000,
            autoPlay:     true
          });
        } else if (Array.isArray(msg.payload.playlists) && msg.payload.playlists.length > 0) {
          this.runtime.loadPlaylists(msg.payload.playlists);
          this.runtime.play();
        }
      } else if (msg.action === 'pause')  { this.runtime.pause();  }
      else if (msg.action === 'resume')   { this.runtime.resume(); }
      else if (msg.action === 'stop')     { this.runtime.stop();   }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SecondaryPlaylistApp();
});
