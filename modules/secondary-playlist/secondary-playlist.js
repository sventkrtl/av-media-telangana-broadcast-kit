/**
 * AV Media Telangana - Secondary News Playlist Module Controller
 * Connects WebSocket StateEngine to SecondaryPlaylistRuntime for live OBS overlay broadcasting.
 */

import { SecondaryPlaylistRuntime } from './SecondaryPlaylistRuntime.js';
import { StateEngine } from '../../shared/js/state-engine.js';
import { PlaylistModel } from './playlist-engine.js';
import { THEME_COLOR_MAP } from './renderer/StaticRenderer.js';

export class SecondaryPlaylistController {
  constructor() {
    this.runtime = new SecondaryPlaylistRuntime();
    this.stateEngine = new StateEngine('av_media_broadcast_channel');
    this.init();
  }

  async init() {
    const containerEl = document.getElementById('spl-crawl-bar');
    const badgeEl = document.getElementById('spl-badge');
    const newsEl = document.getElementById('spl-news');

    await this.runtime.initialize({
      containerElement: containerEl,
      badgeElement: badgeEl,
      newsElement: newsEl,
      pixelsPerSecond: 120,
      logoSrc: '/assets/logos/logo-round.png'
    });

    // 1. Prevent static renderer from clearing container during live broadcast execution
    if (this.runtime.staticRenderer) {
      this.runtime.staticRenderer.renderEvent = () => null;
    }

    // 2. Dynamically update DOM elements when timeline events start
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

    // Logo separator HTML definition (matches CSS rules in secondary-playlist.css)
    const logoHtml = '<span class="spl-logo-wrapper"><img src="/assets/logos/logo-round.png" class="spl-logo-img" width="30" height="30"></span>';

    // 3. Helper to inject logo separators between consecutive news items
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

    // Default Production Starter Playlists
    const initialPlaylists = [
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

    this.runtime.loadPlaylists(processPlaylists(initialPlaylists));
    this.runtime.play();

    // Listen to live WebSocket broadcast messages
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
  new SecondaryPlaylistController();
});
