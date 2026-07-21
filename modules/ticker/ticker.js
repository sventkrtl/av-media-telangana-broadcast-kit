import { FontEngine, ConfigEngine, ThemeEngine } from '../../shared/engines/index.js';

export class TickerModule {
  constructor(containerId = 'ticker-app') {
    this.container = document.getElementById(containerId);
    this.themeEngine = new ThemeEngine('default');
    this.config = null;
  }

  async init() {
    await FontEngine.loadFonts(['Noto Sans Telugu', 'Ramabhadra', 'Outfit']);
    this.config = await ConfigEngine.loadConfig('./config.json');
    this.render();
  }

  render() {
    if (!this.container || !this.config) return;

    const itemsText = this.config.items.join(this.config.separator || ' ✦ ');
    const fullText = `${itemsText} ${this.config.separator || ' ✦ '} ${itemsText}`;

    this.container.innerHTML = `
      <div class="ticker-wrapper ticker-container">
        <div class="ticker-badge">${this.config.category || 'తాజా వార్తలు'}</div>
        <div class="ticker-viewport">
          <div class="ticker-track scrolling" style="--ticker-duration: ${this.config.speed || 40}s">
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
