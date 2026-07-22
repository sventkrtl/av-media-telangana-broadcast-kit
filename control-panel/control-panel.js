import { StateEngine } from '../shared/js/state-engine.js';
import { PlaylistModel } from '../modules/secondary-playlist/playlist-engine.js';

export class ControlPanelApp {
  constructor() {
    this.stateEngine = new StateEngine('av_media_broadcast_channel');
    this.isPaused = false;
    this.isSplPaused = false;
    this.isFormDirty = false;
    this.activeTab = 'ticker';

    // DOM Elements - Primary Ticker
    this.headlineInput = document.getElementById('headline-input');
    this.categorySelect = document.getElementById('category-select');
    this.speedSlider = document.getElementById('speed-slider');
    this.speedVal = document.getElementById('speed-val');
    this.charCounter = document.getElementById('char-counter');
    this.unsavedBadge = document.getElementById('unsaved-badge');
    this.statusLastUpdated = document.getElementById('status-last-updated');

    this.statusPill = document.querySelector('.cp-status-pill');
    this.statusDot = document.querySelector('.cp-status-dot');
    this.statusText = document.getElementById('status-text');

    this.previewBadge = document.getElementById('preview-badge');
    this.previewTrack = document.getElementById('preview-track');
    this.previewText = document.getElementById('preview-text');

    this.btnPreview = document.getElementById('btn-preview');
    this.btnApply = document.getElementById('btn-apply');
    this.btnReset = document.getElementById('btn-reset');
    this.btnTogglePause = document.getElementById('btn-toggle-pause');
    this.recentList = document.getElementById('recent-list');

    // DOM Elements - Secondary Playlist Tab
    this.splSheetUrl = document.getElementById('spl-sheet-url');
    this.splPollInterval = document.getElementById('spl-poll-interval');
    this.splCrawlSpeed = document.getElementById('spl-crawl-speed');
    this.splPayloadInput = document.getElementById('spl-payload-input');
    this.btnSplApply = document.getElementById('btn-spl-apply');
    this.btnSplPause = document.getElementById('btn-spl-pause');
    this.btnSplFetch = document.getElementById('btn-spl-fetch');
    this.splUnsavedBadge = document.getElementById('spl-unsaved-badge');

    // DOM Elements - Secondary Telemetry
    this.splTelemetryState = document.getElementById('spl-telemetry-state');
    this.splTelemetryLastSync = document.getElementById('spl-telemetry-lastsync');
    this.splTelemetryVersion = document.getElementById('spl-telemetry-version');
    this.splTelemetryPlaylists = document.getElementById('spl-telemetry-playlists');
    this.splTelemetryCount = document.getElementById('spl-telemetry-count');
    this.splTelemetryError = document.getElementById('spl-telemetry-error');

    this.settingsGear = document.getElementById('btn-settings-gear');
    this.settingsModal = document.getElementById('settings-modal');
    this.btnModalClose = document.getElementById('btn-modal-close');

    // DOM Elements - Primary Headline Tab
    this.phSheetUrl = document.getElementById('ph-sheet-url');
    this.phPollInterval = document.getElementById('ph-poll-interval');
    this.phPayloadInput = document.getElementById('ph-payload-input');
    this.btnPhApply = document.getElementById('btn-ph-apply');
    this.btnPhPause = document.getElementById('btn-ph-pause');
    this.btnPhFetch = document.getElementById('btn-ph-fetch');
    this.phUnsavedBadge = document.getElementById('ph-unsaved-badge');

    // DOM Elements - Primary Headline Telemetry
    this.phTelemetryState = document.getElementById('ph-telemetry-state');
    this.phTelemetryLastSync = document.getElementById('ph-telemetry-lastsync');
    this.phTelemetryVersion = document.getElementById('ph-telemetry-version');
    this.phTelemetryCount = document.getElementById('ph-telemetry-count');
    this.phTelemetryInterval = document.getElementById('ph-telemetry-interval');
    this.phTelemetryError = document.getElementById('ph-telemetry-error');

    this.isPhPaused = false;
    this.phDatasetVersion = 1;

    this.init();
  }

  init() {
    this.loadSavedState();
    this.loadDraft();
    this.loadSavedPrimaryState();
    this.renderRecentHeadlines();
    this.bindEvents();
    this.bindShortcuts();
    this.setupTabSwitching();
    this.setupAutoSaveDraft();
    this.setupStatusListener();
    this.updatePreview();
    this.updateCharCounter();
  }

  setupTabSwitching() {
    document.querySelectorAll('.cp-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        if (tab === 'ticker' || tab === 'secondary-playlist' || tab === 'primary-headline') {
          document.querySelectorAll('.cp-nav-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');

          this.activeTab = tab;
          document.querySelectorAll('.cp-tab-pane').forEach(pane => {
            pane.style.display = 'none';
          });

          const targetPane = document.getElementById(`tab-${tab}`);
          if (targetPane) targetPane.style.display = 'flex';
        }
      });
    });
  }

  setupStatusListener() {
    this.stateEngine.onStatusChange((status) => {
      if (!this.statusPill || !this.statusText) return;

      if (status === 'CONNECTED') {
        this.statusPill.style.color = '#10B981';
        this.statusPill.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        this.statusPill.style.background = 'rgba(16, 185, 129, 0.15)';
        if (this.statusDot) {
          this.statusDot.style.background = '#10B981';
          this.statusDot.style.boxShadow = '0 0 6px #10B981';
        }
        this.statusText.textContent = 'LIVE ENGINE CONNECTED';
      } else if (status === 'RECONNECTING') {
        this.statusPill.style.color = '#D97706';
        this.statusPill.style.borderColor = 'rgba(217, 119, 6, 0.3)';
        this.statusPill.style.background = 'rgba(217, 119, 6, 0.15)';
        if (this.statusDot) {
          this.statusDot.style.background = '#D97706';
          this.statusDot.style.boxShadow = '0 0 6px #D97706';
        }
        this.statusText.textContent = 'RECONNECTING...';
      } else {
        this.statusPill.style.color = '#EF4444';
        this.statusPill.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        this.statusPill.style.background = 'rgba(239, 68, 68, 0.15)';
        if (this.statusDot) {
          this.statusDot.style.background = '#EF4444';
          this.statusDot.style.boxShadow = '0 0 6px #EF4444';
        }
        this.statusText.textContent = 'OFFLINE (FALLBACK)';
      }
    });
  }

  getSelectedTheme() {
    const checked = document.querySelector('input[name="theme-radio"]:checked');
    return checked ? checked.value : 'default';
  }

  setSelectedTheme(theme) {
    const radio = document.querySelector(`input[name="theme-radio"][value="${theme}"]`);
    if (radio) radio.checked = true;
  }

  loadSavedPrimaryState() {
    const phSaved = localStorage.getItem('av_media_ph_live_state');
    if (phSaved && this.phSheetUrl) {
      try {
        const phData = JSON.parse(phSaved);
        if (phData.sheetUrl) this.phSheetUrl.value = phData.sheetUrl;
        if (phData.pollInterval) this.phPollInterval.value = String(phData.pollInterval);
        if (phData.payloadText) this.phPayloadInput.value = phData.payloadText;
        if (phData.lastSync && this.phTelemetryLastSync) {
          this.phTelemetryLastSync.textContent = phData.lastSync;
        }
        if (phData.headlineCount !== undefined && this.phTelemetryCount) {
          this.phTelemetryCount.textContent = String(phData.headlineCount);
        }
        if (phData.pollInterval && this.phTelemetryInterval) {
          this.phTelemetryInterval.textContent = `${phData.pollInterval / 1000}s`;
        }
      } catch (e) {}
    }
  }

  handlePrimaryHeadlineApply() {
    const sheetUrl = this.phSheetUrl ? this.phSheetUrl.value.trim() : '';
    const pollInterval = parseInt(this.phPollInterval ? this.phPollInterval.value : '30000', 10) || 30000;
    const payloadText = this.phPayloadInput ? this.phPayloadInput.value.trim() : '';

    // Parse manual headlines (one per line) as fallback when no Sheet URL provided
    const manualHeadlines = payloadText
      ? payloadText.split('\n').map(l => l.trim()).filter(Boolean)
      : [];

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Build payload — sheet URL takes priority over manual headlines
    let payload;
    if (sheetUrl) {
      payload = { sheetUrl, pollInterval };
    } else if (manualHeadlines.length > 0) {
      payload = { headlines: manualHeadlines, pollInterval };
    } else {
      // Nothing to send — show error in telemetry
      if (this.phTelemetryError) {
        this.phTelemetryError.textContent = 'Sheet URL or Manual Headlines required.';
        this.phTelemetryError.style.color = '#EF4444';
      }
      return;
    }

    // Emit to OBS overlay via StateEngine
    this.stateEngine.emit('primary-headline', 'update', payload);

    // Persist to localStorage
    const persistData = {
      sheetUrl,
      pollInterval,
      payloadText,
      lastSync: timeStr,
      headlineCount: manualHeadlines.length || 0
    };
    localStorage.setItem('av_media_ph_live_state', JSON.stringify(persistData));
    this.statusLastUpdated.textContent = `✓ Last Updated: ${timeStr}`;

    // Update telemetry UI
    this.phDatasetVersion = (this.phDatasetVersion || 1) + 1;
    if (this.phTelemetryState) this.phTelemetryState.textContent = 'ONLINE';
    if (this.phTelemetryLastSync) this.phTelemetryLastSync.textContent = timeStr;
    if (this.phTelemetryVersion) this.phTelemetryVersion.textContent = `v${this.phDatasetVersion}`;
    if (this.phTelemetryCount) {
      this.phTelemetryCount.textContent = manualHeadlines.length > 0 ? String(manualHeadlines.length) : (sheetUrl ? '—' : '0');
    }
    if (this.phTelemetryInterval) this.phTelemetryInterval.textContent = `${pollInterval / 1000}s`;
    if (this.phTelemetryError) {
      this.phTelemetryError.textContent = 'None (Operating Normally)';
      this.phTelemetryError.style.color = 'var(--cp-accent-green)';
    }
    if (this.phUnsavedBadge) this.phUnsavedBadge.classList.remove('visible');

    // Button feedback
    if (this.btnPhApply) {
      const originalText = this.btnPhApply.textContent;
      this.btnPhApply.textContent = '\u2705 LIVE UPDATED!';
      this.btnPhApply.style.background = '#059669';
      setTimeout(() => {
        this.btnPhApply.textContent = originalText;
        this.btnPhApply.style.background = '';
      }, 1500);
    }
  }

  handlePrimaryHeadlinePause() {
    this.isPhPaused = !this.isPhPaused;
    if (this.isPhPaused) {
      if (this.btnPhPause) {
        this.btnPhPause.textContent = '\u25b6\ufe0f Resume';
        this.btnPhPause.style.background = '#D97706';
      }
      this.stateEngine.emit('primary-headline', 'pause', { isPaused: true });
    } else {
      if (this.btnPhPause) {
        this.btnPhPause.textContent = '\u23f8\ufe0f Pause';
        this.btnPhPause.style.background = '#334155';
      }
      this.stateEngine.emit('primary-headline', 'resume', { isPaused: false });
    }
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

    const splSaved = localStorage.getItem('av_media_spl_live_state');
    if (splSaved && this.splSheetUrl) {
      try {
        const splData = JSON.parse(splSaved);
        if (splData.sheetUrl) this.splSheetUrl.value = splData.sheetUrl;
        if (splData.pollInterval) this.splPollInterval.value = String(splData.pollInterval);
        if (splData.payloadText) this.splPayloadInput.value = splData.payloadText;
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
    this.previewTrack.style.animationPlayState = this.isPaused ? 'paused' : 'running';
  }

  saveToRecent(data) {
    let recent = [];
    try {
      recent = JSON.parse(localStorage.getItem('av_media_recent_headlines')) || [];
    } catch (e) {}

    const headlineText = data.items.join(' | ');
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    recent = recent.filter(item => item.headlineText !== headlineText);
    recent.unshift({ 
      headlineText, 
      category: data.category, 
      theme: data.theme, 
      speed: data.speed, 
      items: data.items, 
      timeStr,
      timestamp: Date.now() 
    });

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
        <div style="display:flex; align-items:center; gap:8px; overflow:hidden; max-width:85%;">
          <span style="font-size:10px; font-weight:700; color:var(--cp-text-muted); background:#0F172A; padding:1px 4px; border-radius:3px;">${item.timeStr || '14:30'}</span>
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            <strong style="color:var(--cp-gold)">[${item.category}]</strong> ${item.headlineText}
          </span>
        </div>
        <span style="font-size:12px; color:var(--cp-accent-green); font-weight:bold;" title="Restore headline">↻</span>
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
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    data.lastUpdated = timeStr;

    this.updatePreview();
    this.saveToRecent(data);
    this.markDirty(false);

    // Standardized Message Schema
    this.stateEngine.emit('ticker', 'update', data);
    localStorage.setItem('av_media_ticker_live_state', JSON.stringify(data));
    this.statusLastUpdated.textContent = `✓ Last Updated: ${timeStr}`;

    const originalText = this.btnApply.textContent;
    this.btnApply.textContent = '✅ LIVE UPDATED!';
    this.btnApply.style.background = '#059669';
    setTimeout(() => {
      this.btnApply.textContent = originalText;
      this.btnApply.style.background = '';
    }, 1500);
  }

  handleSecondaryApply() {
    const sheetUrl = this.splSheetUrl.value.trim();
    const pollInterval = parseInt(this.splPollInterval.value, 10) || 30000;
    const crawlSpeed = parseInt(this.splCrawlSpeed.value, 10) || 120;
    const payloadText = this.splPayloadInput.value.trim();

    // Parse direct payload text format: Label: theme: news
    const parsedPlaylists = [];
    if (payloadText) {
      const lines = payloadText.split('\n').map(l => l.trim()).filter(Boolean);
      const groupedMap = new Map();

      lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const label = parts[0].trim();
          let theme = 'district';
          let news = '';

          if (parts.length >= 3) {
            theme = parts[1].trim().toLowerCase() || 'district';
            news = parts.slice(2).join(':').trim();
          } else {
            news = parts.slice(1).join(':').trim();
          }

          if (label && news) {
            const key = `${theme}::${label}`;
            if (!groupedMap.has(key)) {
              groupedMap.set(key, { label, theme, items: [] });
            }
            groupedMap.get(key).items.push(news);
          }
        }
      });

      groupedMap.forEach(group => {
        parsedPlaylists.push(new PlaylistModel({
          label: group.label,
          theme: group.theme,
          items: group.items
        }));
      });
    }

    const payload = {
      sheetUrl,
      pollInterval,
      crawlSpeed,
      payloadText,
      playlists: parsedPlaylists
    };

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    this.stateEngine.emit('secondary-playlist', 'update', payload);
    localStorage.setItem('av_media_spl_live_state', JSON.stringify(payload));
    this.statusLastUpdated.textContent = `✓ Last Updated: ${timeStr}`;

    // Update telemetry UI
    if (this.splTelemetryState) this.splTelemetryState.textContent = 'ONLINE';
    if (this.splTelemetryLastSync) this.splTelemetryLastSync.textContent = timeStr;
    if (this.splTelemetryPlaylists) this.splTelemetryPlaylists.textContent = String(parsedPlaylists.length || 3);
    if (this.splTelemetryCount) {
      const totalCount = parsedPlaylists.reduce((acc, p) => acc + p.items.length, 0);
      this.splTelemetryCount.textContent = String(totalCount || 5);
    }

    const originalText = this.btnSplApply.textContent;
    this.btnSplApply.textContent = '✅ LIVE UPDATED!';
    this.btnSplApply.style.background = '#059669';
    setTimeout(() => {
      this.btnSplApply.textContent = originalText;
      this.btnSplApply.style.background = '';
    }, 1500);
  }

  handleSecondaryPause() {
    this.isSplPaused = !this.isSplPaused;
    if (this.isSplPaused) {
      this.btnSplPause.textContent = '▶️ Resume';
      this.btnSplPause.style.background = '#D97706';
      this.stateEngine.emit('secondary-playlist', 'pause', { isPaused: true });
    } else {
      this.btnSplPause.textContent = '⏸️ Pause';
      this.btnSplPause.style.background = '#334155';
      this.stateEngine.emit('secondary-playlist', 'resume', { isPaused: false });
    }
  }

  handleTogglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.btnTogglePause.textContent = '▶️ Resume Ticker';
      this.btnTogglePause.style.background = '#D97706';
      if (this.previewTrack) this.previewTrack.style.animationPlayState = 'paused';
      this.stateEngine.emit('ticker', 'pause', { isPaused: true });
    } else {
      this.btnTogglePause.textContent = '⏸️ Pause Ticker';
      this.btnTogglePause.style.background = '#334155';
      if (this.previewTrack) this.previewTrack.style.animationPlayState = 'running';
      this.stateEngine.emit('ticker', 'resume', { isPaused: false });
    }
  }

  bindShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (this.activeTab === 'secondary-playlist') {
          this.handleSecondaryApply();
        } else if (this.activeTab === 'primary-headline') {
          this.handlePrimaryHeadlineApply();
        } else {
          this.handleApply();
        }
      }
      else if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        this.updatePreview();
      }
      else if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        if (this.activeTab === 'secondary-playlist') {
          this.handleSecondaryPause();
        } else if (this.activeTab === 'primary-headline') {
          this.handlePrimaryHeadlinePause();
        } else {
          this.handleTogglePause();
        }
      }
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

    // Secondary Playlist Buttons
    if (this.btnSplApply) {
      this.btnSplApply.addEventListener('click', () => this.handleSecondaryApply());
    }
    if (this.btnSplPause) {
      this.btnSplPause.addEventListener('click', () => this.handleSecondaryPause());
    }
    if (this.btnSplFetch) {
      this.btnSplFetch.addEventListener('click', () => this.handleSecondaryApply());
    }

    // Primary Headline Buttons
    if (this.btnPhApply) {
      this.btnPhApply.addEventListener('click', () => this.handlePrimaryHeadlineApply());
    }
    if (this.btnPhPause) {
      this.btnPhPause.addEventListener('click', () => this.handlePrimaryHeadlinePause());
    }
    if (this.btnPhFetch) {
      this.btnPhFetch.addEventListener('click', () => this.handlePrimaryHeadlineApply());
    }
    if (this.phSheetUrl) {
      this.phSheetUrl.addEventListener('input', () => {
        if (this.phUnsavedBadge) this.phUnsavedBadge.classList.add('visible');
      });
    }
    if (this.phPayloadInput) {
      this.phPayloadInput.addEventListener('input', () => {
        if (this.phUnsavedBadge) this.phUnsavedBadge.classList.add('visible');
      });
    }

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
