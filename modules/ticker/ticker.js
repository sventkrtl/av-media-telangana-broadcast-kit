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

    const savedPause = localStorage.getItem('av_media_ticker_pause_state');
    if (savedPause !== null) {
      this.isPaused = savedPause === 'true';
    }

    this.render();
    this.subscribeStateUpdates();
  }

  subscribeStateUpdates() {
    this.stateEngine.subscribe((msg) => {
      if (!msg || !msg.action) return;

      // Standard Protocol Protocol Matching
      if (msg.engine === 'ticker' || !msg.engine) {
        if (msg.action === 'update' || msg.action === 'TICKER_APPLY_LIVE') {
          this.config = { ...this.config, ...msg.payload };
          localStorage.setItem('av_media_ticker_live_state', JSON.stringify(this.config));
          this.render();
        } else if (msg.action === 'pause') {
          this.setPauseState(true);
        } else if (msg.action === 'resume') {
          this.setPauseState(false);
        } else if (msg.action === 'TICKER_TOGGLE_PAUSE') {
          this.setPauseState(msg.payload.isPaused);
        }
      }
    });
  }

  setPauseState(paused) {
    this.isPaused = paused;
    localStorage.setItem('av_media_ticker_pause_state', String(paused));
    
    const wrapper = this.container?.querySelector('.ticker-wrapper');
    const track = this.container?.querySelector('.ticker-track');

    if (wrapper) wrapper.classList.toggle('paused', paused);
    if (track) {
      track.classList.toggle('paused', paused);
      track.style.animationPlayState = paused ? 'paused' : 'running';
      track.style.webkitAnimationPlayState = paused ? 'paused' : 'running';
    }
  }

  render() {
    if (!this.container || !this.config) return;

    const items = Array.isArray(this.config.items) ? this.config.items : [this.config.items];
    const itemsText = items.join(this.config.separator || ' ✦ ');
    const fullText = `${itemsText} ${this.config.separator || ' ✦ '} ${itemsText}`;

    const duration = this.config.speed || 50;
    const category = this.config.category || 'తాజా వార్తలు';
    const theme = this.config.theme || 'default';
    const pauseClass = this.isPaused ? 'paused' : '';
    const pauseStateStyle = this.isPaused ? 'paused' : 'running';

    this.container.innerHTML = `
      <div class="ticker-wrapper ${pauseClass}" data-category="${category}" data-theme="${theme}">
        <div class="ticker-badge">${category}</div>
        <div class="ticker-viewport">
          <div class="ticker-track scrolling ${pauseClass}" style="--ticker-duration: ${duration}s; animation-play-state: ${pauseStateStyle}; -webkit-animation-play-state: ${pauseStateStyle}">
            <span class="ticker-item">${fullText}</span>
          </div>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ticker = new TickerModule('ticker-app');
  ticker.init();
});
