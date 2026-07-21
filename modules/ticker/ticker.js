import { FontEngine, ConfigEngine, ThemeEngine } from '../../shared/engines/index.js';
import { StateEngine } from '../../shared/js/state-engine.js';

export class TickerModule {
  constructor(containerId = 'ticker-app') {
    this.container = document.getElementById(containerId);
    this.themeEngine = new ThemeEngine('default');
    this.stateEngine = new StateEngine('av_media_broadcast_channel');
    this.config = null;
    this.isPaused = false;
  }

  async init() {
    await FontEngine.loadFonts(['Noto Sans Telugu', 'Ramabhadra', 'Outfit']);
    
    // Check if there is saved live state in localStorage
    const savedLiveState = localStorage.getItem('av_media_ticker_live_state');
    if (savedLiveState) {
      try {
        this.config = JSON.parse(savedLiveState);
      } catch (e) {
        this.config = await ConfigEngine.loadConfig('./config.json');
      }
    } else {
      this.config = await ConfigEngine.loadConfig('./config.json');
    }

    this.render();
    this.subscribeStateUpdates();
  }

  subscribeStateUpdates() {
    this.stateEngine.subscribe((msg) => {
      if (!msg || !msg.action) return;

      if (msg.action === 'TICKER_GO_LIVE') {
        this.config = { ...this.config, ...msg.payload };
        localStorage.setItem('av_media_ticker_live_state', JSON.stringify(this.config));
        this.render();
      } else if (msg.action === 'TICKER_PAUSE') {
        this.setPauseState(true);
      } else if (msg.action === 'TICKER_PLAY') {
        this.setPauseState(false);
      }
    });
  }

  setPauseState(paused) {
    this.isPaused = paused;
    const track = this.container?.querySelector('.ticker-track');
    if (track) {
      if (paused) {
        track.style.animationPlayState = 'paused';
      } else {
        track.style.animationPlayState = 'running';
      }
    }
  }

  render() {
    if (!this.container || !this.config) return;

    // Apply theme
    this.themeEngine.setTheme(this.config.theme || 'default');

    const items = Array.isArray(this.config.items) ? this.config.items : [this.config.items];
    const itemsText = items.join(this.config.separator || ' ✦ ');
    const fullText = `${itemsText} ${this.config.separator || ' ✦ '} ${itemsText}`;

    // Speed calculation: slow = 80s, medium = 50s, fast = 30s
    let duration = 50;
    if (typeof this.config.speed === 'number') {
      duration = this.config.speed;
    } else if (this.config.speed === 'slow') {
      duration = 80;
    } else if (this.config.speed === 'fast') {
      duration = 30;
    } else if (this.config.speed === 'medium') {
      duration = 50;
    }

    // Dynamic Theme stylesheet link injection
    let themeLink = document.getElementById('ticker-theme-style');
    if (!themeLink) {
      themeLink = document.createElement('link');
      themeLink.id = 'ticker-theme-style';
      themeLink.rel = 'stylesheet';
      document.head.appendChild(themeLink);
    }
    themeLink.href = `./themes/${this.config.theme || 'default'}.css`;

    this.container.innerHTML = `
      <div class="ticker-wrapper ticker-container">
        <div class="ticker-badge">${this.config.category || 'తాజా వార్తలు'}</div>
        <div class="ticker-viewport">
          <div class="ticker-track scrolling" style="--ticker-duration: ${duration}s; animation-play-state: ${this.isPaused ? 'paused' : 'running'}">
            <span class="ticker-item">${fullText}</span>
          </div>
        </div>
      </div>
    `;
  }
}

// Auto Initialize when loaded in Browser Source
document.addEventListener('DOMContentLoaded', () => {
  const ticker = new TickerModule('ticker-app');
  ticker.init();
});
