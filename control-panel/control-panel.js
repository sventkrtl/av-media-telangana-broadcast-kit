import { StateEngine } from '../shared/js/state-engine.js';

export class ControlPanelApp {
  constructor() {
    this.stateEngine = new StateEngine('av_media_broadcast_channel');
    this.isPaused = false;
    this.isFormDirty = false;

    // DOM Elements
    this.headlineInput = document.getElementById('headline-input');
    this.categorySelect = document.getElementById('category-select');
    this.speedSlider = document.getElementById('speed-slider');
    this.speedVal = document.getElementById('speed-val');
    this.charCounter = document.getElementById('char-counter');
    this.unsavedBadge = document.getElementById('unsaved-badge');
    this.statusLastUpdated = document.getElementById('status-last-updated');

    this.previewBadge = document.getElementById('preview-badge');
    this.previewTrack = document.getElementById('preview-track');
    this.previewText = document.getElementById('preview-text');

    this.btnPreview = document.getElementById('btn-preview');
    this.btnApply = document.getElementById('btn-apply');
    this.btnReset = document.getElementById('btn-reset');
    this.btnTogglePause = document.getElementById('btn-toggle-pause');
    this.recentList = document.getElementById('recent-list');

    this.settingsGear = document.getElementById('btn-settings-gear');
    this.settingsModal = document.getElementById('settings-modal');
    this.btnModalClose = document.getElementById('btn-modal-close');

    this.init();
  }

  init() {
    this.loadSavedState();
    this.loadDraft();
    this.renderRecentHeadlines();
    this.bindEvents();
    this.bindShortcuts();
    this.setupAutoSaveDraft();
    this.updatePreview();
    this.updateCharCounter();
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
        if (data.lastUpdated) {
          this.statusLastUpdated.textContent = `✓ Last Updated: ${data.lastUpdated}`;
        }
      } catch (e) {}
    }
  }

  loadDraft() {
    const draft = localStorage.getItem('av_media_ticker_draft');
    if (draft && !this.headlineInput.value) {
      this.headlineInput.value = draft;
    }
  }

  setupAutoSaveDraft() {
    setInterval(() => {
      if (this.headlineInput.value) {
        localStorage.setItem('av_media_ticker_draft', this.headlineInput.value);
      }
    }, 5000);
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

  updateCharCounter() {
    const len = this.headlineInput.value.length;
    this.charCounter.textContent = `${len} / 180 chars`;
    if (len > 180) {
      this.charCounter.style.color = '#EF4444';
    } else {
      this.charCounter.style.color = 'var(--cp-text-muted)';
    }
  }

  markDirty(dirty = true) {
    this.isFormDirty = dirty;
    if (dirty) {
      this.unsavedBadge.classList.add('visible');
    } else {
      this.unsavedBadge.classList.remove('visible');
    }
  }

  updatePreview() {
    const data = this.getFormData();
    this.previewBadge.textContent = data.category;
    
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
          this.updateCharCounter();
          this.markDirty(true);
          this.updatePreview();
        }
      });
    });
  }

  handleApply() {
    const data = this.getFormData();
    const timeStr = new Date().toLocaleTimeString();
    data.lastUpdated = timeStr;

    this.updatePreview();
    this.saveToRecent(data);
    this.markDirty(false);

    this.stateEngine.emit('TICKER_APPLY_LIVE', data);
    localStorage.setItem('av_media_ticker_live_state', JSON.stringify(data));
    this.statusLastUpdated.textContent = `✓ Last Updated: ${timeStr}`;

    // Visual Feedback
    const originalText = this.btnApply.textContent;
    this.btnApply.textContent = '✅ LIVE UPDATED!';
    this.btnApply.style.background = '#059669';
    setTimeout(() => {
      this.btnApply.textContent = originalText;
      this.btnApply.style.background = '';
    }, 1500);
  }

  handleTogglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.btnTogglePause.textContent = '▶️ Resume Ticker';
      this.btnTogglePause.style.background = '#D97706';
    } else {
      this.btnTogglePause.textContent = '⏸️ Pause Ticker';
      this.btnTogglePause.style.background = '#334155';
    }
    this.stateEngine.emit('TICKER_TOGGLE_PAUSE', { isPaused: this.isPaused });
  }

  bindShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl + Enter: Apply Live
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        this.handleApply();
      }
      // Ctrl + P: Preview
      else if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        this.updatePreview();
      }
      // Ctrl + Space: Toggle Pause
      else if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        this.handleTogglePause();
      }
      // Esc: Reset Form
      else if (e.key === 'Escape') {
        this.loadSavedState();
        this.markDirty(false);
        this.updatePreview();
      }
    });
  }

  bindEvents() {
    this.speedSlider.addEventListener('input', () => {
      this.speedVal.textContent = `${this.speedSlider.value}s`;
      this.markDirty(true);
      this.updatePreview();
    });

    this.btnPreview.addEventListener('click', () => this.updatePreview());
    this.btnApply.addEventListener('click', () => this.handleApply());
    this.btnReset.addEventListener('click', () => {
      this.loadSavedState();
      this.markDirty(false);
      this.updatePreview();
    });

    this.btnTogglePause.addEventListener('click', () => this.handleTogglePause());

    this.headlineInput.addEventListener('input', () => {
      this.updateCharCounter();
      this.markDirty(true);
      this.updatePreview();
    });

    this.categorySelect.addEventListener('change', () => {
      this.markDirty(true);
      this.updatePreview();
    });

    document.querySelectorAll('input[name="theme-radio"]').forEach(r => {
      r.addEventListener('change', () => {
        this.markDirty(true);
        this.updatePreview();
      });
    });

    // Settings Modal
    this.settingsGear.addEventListener('click', () => {
      this.settingsModal.classList.add('visible');
    });

    this.btnModalClose.addEventListener('click', () => {
      this.settingsModal.classList.remove('visible');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ControlPanelApp();
});
