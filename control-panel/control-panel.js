import { StateEngine } from '../shared/js/state-engine.js';

export class ControlPanelApp {
  constructor() {
    this.stateEngine = new StateEngine('av_media_broadcast_channel');

    // DOM Elements
    this.headlineInput = document.getElementById('headline-input');
    this.categorySelect = document.getElementById('category-select');
    this.themeSelect = document.getElementById('theme-select');
    this.speedSelect = document.getElementById('speed-select');
    
    this.previewBadge = document.getElementById('preview-badge');
    this.previewText = document.getElementById('preview-text');

    this.btnPreview = document.getElementById('btn-preview');
    this.btnGoLive = document.getElementById('btn-golive');
    this.btnReset = document.getElementById('btn-reset');
    this.btnPause = document.getElementById('btn-pause');
    this.btnPlay = document.getElementById('btn-play');

    this.init();
  }

  init() {
    this.loadSavedState();
    this.bindEvents();
  }

  loadSavedState() {
    const saved = localStorage.getItem('av_media_ticker_live_state');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (Array.isArray(data.items)) {
          this.headlineInput.value = data.items.join('\n');
        } else if (typeof data.items === 'string') {
          this.headlineInput.value = data.items;
        }
        if (data.category) this.categorySelect.value = data.category;
        if (data.theme) this.themeSelect.value = data.theme;
        if (data.speed) this.speedSelect.value = data.speed;
        this.updatePreview();
      } catch (e) {
        console.warn('[ControlPanel] Error parsing saved state:', e);
      }
    }
  }

  getFormData() {
    const rawText = this.headlineInput.value.trim();
    const items = rawText ? rawText.split('\n').map(line => line.trim()).filter(Boolean) : [];
    
    return {
      items: items.length ? items : ['AV Media Telangana – లైవ్ న్యూస్ ప్రసారాలు నిరంతరం అందుబాటులో ఉంటాయి'],
      category: this.categorySelect.value,
      theme: this.themeSelect.value,
      speed: this.speedSelect.value,
      separator: ' ✦ '
    };
  }

  updatePreview() {
    const data = this.getFormData();
    this.previewBadge.textContent = data.category;
    this.previewText.textContent = data.items.join(' ✦ ');

    if (data.theme === 'breaking') {
      this.previewBadge.style.background = '#FFD600';
      this.previewBadge.style.color = '#000';
    } else {
      this.previewBadge.style.background = '#E50914';
      this.previewBadge.style.color = '#FFF';
    }
  }

  bindEvents() {
    this.btnPreview.addEventListener('click', () => {
      this.updatePreview();
    });

    this.btnGoLive.addEventListener('click', () => {
      const data = this.getFormData();
      this.updatePreview();
      this.stateEngine.emit('TICKER_GO_LIVE', data);
      localStorage.setItem('av_media_ticker_live_state', JSON.stringify(data));
      
      // Flash Go Live button feedback
      const originalText = this.btnGoLive.textContent;
      this.btnGoLive.textContent = '⚡ ON-AIR UPDATED!';
      this.btnGoLive.style.background = '#10B981';
      setTimeout(() => {
        this.btnGoLive.textContent = originalText;
        this.btnGoLive.style.background = '';
      }, 1500);
    });

    this.btnReset.addEventListener('click', () => {
      this.loadSavedState();
    });

    this.btnPause.addEventListener('click', () => {
      this.stateEngine.emit('TICKER_PAUSE', {});
    });

    this.btnPlay.addEventListener('click', () => {
      this.stateEngine.emit('TICKER_PLAY', {});
    });

    // Auto update preview on input changes
    this.headlineInput.addEventListener('input', () => this.updatePreview());
    this.categorySelect.addEventListener('change', () => this.updatePreview());
    this.themeSelect.addEventListener('change', () => this.updatePreview());
    this.speedSelect.addEventListener('change', () => this.updatePreview());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ControlPanelApp();
});
