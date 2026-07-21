import { StateEngine } from '../shared/js/state-engine.js';

export class ControlPanelApp {
  constructor() {
    this.stateEngine = new StateEngine('av_media_broadcast_channel');
    this.isPaused = false;

    // DOM Elements
    this.headlineInput = document.getElementById('headline-input');
    this.categorySelect = document.getElementById('category-select');
    this.speedSlider = document.getElementById('speed-slider');
    this.speedVal = document.getElementById('speed-val');
    
    this.previewBadge = document.getElementById('preview-badge');
    this.previewTrack = document.getElementById('preview-track');
    this.previewText = document.getElementById('preview-text');

    this.btnPreview = document.getElementById('btn-preview');
    this.btnApply = document.getElementById('btn-apply');
    this.btnReset = document.getElementById('btn-reset');
    this.btnTogglePause = document.getElementById('btn-toggle-pause');
    this.recentList = document.getElementById('recent-list');

    this.init();
  }

  init() {
    this.loadSavedState();
    this.renderRecentHeadlines();
    this.bindEvents();
    this.updatePreview();
  }

  getSelectedTheme() {
    const checked = document.querySelector('input[name="theme-radio"]:checked');
    return checked ? checked.value : 'default';
  }

  setSelectedTheme(theme) {
    const radio = document.querySelector(`input[name="theme-radio"][value="${theme}"]`);
    if (radio) radio.checked = true;
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
        if (data.theme) this.setSelectedTheme(data.theme);
        if (data.speed) {
          this.speedSlider.value = data.speed;
          this.speedVal.textContent = `${data.speed}s`;
        }
      } catch (e) {}
    }
  }

  getFormData() {
    const rawText = this.headlineInput.value.trim();
    const items = rawText ? rawText.split('\n').map(l => l.trim()).filter(Boolean) : [];
    
    return {
      items: items.length ? items : ['AV Media Telangana – లైవ్ న్యూస్ ప్రసారాలు నిరంతరం అందుబాటులో ఉంటాయి'],
      category: this.categorySelect.value,
      theme: this.getSelectedTheme(),
      speed: parseInt(this.speedSlider.value, 10) || 50,
      separator: ' ✦ '
    };
  }

  updatePreview() {
    const data = this.getFormData();
    this.previewBadge.textContent = data.category;
    
    // Set category styling on badge
    const catMap = {
      'రాజకీయం': '#1E40AF',
      'క్రైమ్': '#991B1B',
      'క్రీడలు': '#15803D',
      'వాతావరణం': '#D97706',
      'అత్యవసర వర్తమానం': '#DC2626',
      'బిజినెస్': '#7E22CE',
      'తాజా వార్తలు': '#0284C7'
    };

    if (data.theme === 'breaking') {
      this.previewBadge.style.background = '#FFD600';
      this.previewBadge.style.color = '#000';
    } else {
      this.previewBadge.style.background = catMap[data.category] || '#0284C7';
      this.previewBadge.style.color = '#FFF';
    }

    const textString = data.items.join(' ✦ ');
    this.previewText.textContent = `${textString} ✦ ${textString}`;
    this.previewTrack.style.setProperty('--preview-duration', `${data.speed}s`);
  }

  saveToRecent(data) {
    let recent = [];
    try {
      recent = JSON.parse(localStorage.getItem('av_media_recent_headlines')) || [];
    } catch (e) {}

    const headlineText = data.items.join(' | ');
    // Avoid exact duplicate at top
    recent = recent.filter(item => item.headlineText !== headlineText);
    recent.unshift({ headlineText, category: data.category, theme: data.theme, speed: data.speed, items: data.items, timestamp: Date.now() });

    if (recent.length > 10) recent = recent.slice(0, 10);
    localStorage.setItem('av_media_recent_headlines', JSON.stringify(recent));
    this.renderRecentHeadlines();
  }

  renderRecentHeadlines() {
    let recent = [];
    try {
      recent = JSON.parse(localStorage.getItem('av_media_recent_headlines')) || [];
    } catch (e) {}

    if (!recent.length) {
      this.recentList.innerHTML = `<div style="font-size:11px; color:var(--cp-text-muted);">No recent headlines saved yet...</div>`;
      return;
    }

    this.recentList.innerHTML = recent.map((item, idx) => `
      <div class="cp-recent-item" data-idx="${idx}">
        <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:85%;">
          <strong style="color:var(--cp-gold)">[${item.category}]</strong> ${item.headlineText}
        </div>
        <span style="font-size:10px; color:var(--cp-accent-green)">Restore ↩</span>
      </div>
    `).join('');

    this.recentList.querySelectorAll('.cp-recent-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx, 10);
        const selected = recent[idx];
        if (selected) {
          this.headlineInput.value = selected.items.join('\n');
          this.categorySelect.value = selected.category;
          this.setSelectedTheme(selected.theme);
          if (selected.speed) {
            this.speedSlider.value = selected.speed;
            this.speedVal.textContent = `${selected.speed}s`;
          }
          this.updatePreview();
        }
      });
    });
  }

  bindEvents() {
    // Speed Slider Update
    this.speedSlider.addEventListener('input', () => {
      this.speedVal.textContent = `${this.speedSlider.value}s`;
      this.updatePreview();
    });

    // Preview Click
    this.btnPreview.addEventListener('click', () => this.updatePreview());

    // Apply (Update Live) Click
    this.btnApply.addEventListener('click', () => {
      const data = this.getFormData();
      this.updatePreview();
      this.saveToRecent(data);

      this.stateEngine.emit('TICKER_APPLY_LIVE', data);
      localStorage.setItem('av_media_ticker_live_state', JSON.stringify(data));

      // Visual Feedback
      const originalText = this.btnApply.textContent;
      this.btnApply.textContent = '✅ LIVE UPDATED!';
      this.btnApply.style.background = '#059669';
      setTimeout(() => {
        this.btnApply.textContent = originalText;
        this.btnApply.style.background = '';
      }, 1500);
    });

    // Reset Form
    this.btnReset.addEventListener('click', () => {
      this.loadSavedState();
      this.updatePreview();
    });

    // Pause / Resume Single Toggle Button
    this.btnTogglePause.addEventListener('click', () => {
      this.isPaused = !this.isPaused;
      if (this.isPaused) {
        this.btnTogglePause.textContent = '▶️ Resume Ticker';
        this.btnTogglePause.style.background = '#D97706';
      } else {
        this.btnTogglePause.textContent = '⏸️ Pause Ticker';
        this.btnTogglePause.style.background = '#334155';
      }
      this.stateEngine.emit('TICKER_TOGGLE_PAUSE', { isPaused: this.isPaused });
    });

    // Form Change Auto-Preview
    this.headlineInput.addEventListener('input', () => this.updatePreview());
    this.categorySelect.addEventListener('change', () => this.updatePreview());
    document.querySelectorAll('input[name="theme-radio"]').forEach(r => {
      r.addEventListener('change', () => this.updatePreview());
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ControlPanelApp();
});
