/**
 * AV Media Telangana - Secondary News Playlist Entrypoint (Task M2-2A)
 * Loads SecondaryPlaylistRuntime, binds DOM overlay elements, reads configuration, and starts live broadcast.
 */

import { SecondaryPlaylistRuntime } from './SecondaryPlaylistRuntime.js';
import { StateEngine } from '../../shared/js/state-engine.js';
import { PlaylistModel } from './playlist-engine.js';
import { THEME_COLOR_MAP } from './renderer/StaticRenderer.js';

export class SecondaryPlaylistApp {
  constructor() {
    this.runtime = new SecondaryPlaylistRuntime();
    this.stateEngine = new StateEngine('av_media_broadcast_channel');
    this.init();
  }

  async init() {
    const containerEl = document.getElementById('spl-crawl-bar');
    const badgeEl = document.getElementById('spl-badge');
    const newsEl = document.getElementById('spl-news');

    // 1. Read URL params / Configuration
    const urlParams = new URLSearchParams(window.location.search);
    const googleSheetUrl = urlParams.get('sheetUrl') || urlParams.get('csvUrl') || '';
    const pollInterval = parseInt(urlParams.get('interval') || '30000', 10);
    const pixelsPerSecond = parseInt(urlParams.get('speed') || '120', 10);

    // 2. Initialize Runtime
    await this.runtime.initialize({
      containerElement: containerEl,
      badgeElement: badgeEl,
      newsElement: newsEl,
      pixelsPerSecond: pixelsPerSecond,
      logoSrc: '/assets/logos/logo-round.png'
    });

    // 3. Override static renderer for continuous live broadcast DOM updates
    if (this.runtime.staticRenderer) {
      this.runtime.staticRenderer.renderEvent = () => null;
    }

    // 4. Update DOM elements dynamically on event start
    if (this.runtime.playbackController) {
      this.runtime.playbackController.onEventStart((event) => {
        if (event.type === 'BADGE_IN' || event.type === 'BADGE_HOLD') {
          badgeEl.textContent = event.label || '';
          badgeEl.style.backgroundColor = THEME_COLOR_MAP[event.theme] || THEME_COLOR_MAP.district;
        } else if (event.type === 'NEWS_START') {
          newsEl.innerHTML = event.payload ? event.payload.newsContent : '';
        }
      });
    }

    // 5. Connect Published Google Sheet if URL provided in config or load default production playlists
    const logoHtml = '<span class="spl-logo-wrapper"><img src="/assets/logos/logo-round.png" class="spl-logo-img" width="30" height="30"></span>';

    const processPlaylists = (playlists) => {
      return playlists.map(pl => {
        const items = pl.items.map((item, idx) => {
          if (idx < pl.items.length - 1) {
            return `${item}${logoHtml}`;
          }
          return item;
        });
        return new PlaylistModel({
          id: pl.id,
          label: pl.label,
          theme: pl.theme,
          items: items
        });
      });
    };

    if (googleSheetUrl) {
      await this.runtime.connectGoogleSheet({
        url: googleSheetUrl,
        pollInterval: pollInterval,
        autoPlay: true
      });
    } else {
      // Default production fallback feed
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
            'హైదరాబాద్‌లోని ఉప్పల్ స్టేడియంలో అంతర్జాతీయ బ్యాడ్మింటన్ సిరీస్ పోటీలు'
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

      this.runtime.loadPlaylists(processPlaylists(defaultPlaylists));
      this.runtime.play();
    }

    // 6. Listen to live WebSocket broadcast messages from Control Panel
    this.stateEngine.subscribe((msg) => {
      if (!msg || msg.engine !== 'secondary-playlist') return;

      if (msg.action === 'update' && msg.payload && Array.isArray(msg.payload.playlists)) {
        this.runtime.loadPlaylists(processPlaylists(msg.payload.playlists));
        this.runtime.play();
      } else if (msg.action === 'pause') {
        this.runtime.pause();
      } else if (msg.action === 'resume') {
        this.runtime.resume();
      } else if (msg.action === 'stop') {
        this.runtime.stop();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SecondaryPlaylistApp();
});
