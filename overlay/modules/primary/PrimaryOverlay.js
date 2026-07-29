import { ResourceManager } from '../../platform/runtime/ResourceManager.js';

export class PrimaryOverlay {
  constructor(options = {}) {
    this.id = 'primary';
    this.priority = 300;
    this.isVisible = false;
    this.currentData = null;
    this.container = null;
    this.badgeElement = null;
    this.headlineElement = null;
    this.resources = new ResourceManager();
    this.layoutConfig = this.loadLayoutConfig(options);
  }

  loadLayoutConfig(options = {}) {
    const defaultLayout = {
      bottom: 80,
      left: 60,
      width: 1800,
      height: 110,
      badgeWidth: 240,
      fontSizeHeadline: 36,
      fontSizeBadge: 24,
      borderRadius: 12,
      padding: 20
    };

    if (options.layout) {
      return { ...defaultLayout, ...options.layout };
    }

    return defaultLayout;
  }

  // 1. Contract Method: init(config)
  init(config = {}) {
    this.config = config;
    const documentObj = config.document || (typeof document !== 'undefined' ? document : null);
    const parentNode = config.parentNode || (documentObj ? documentObj.body : null);

    if (!documentObj) {
      throw new Error("PrimaryOverlay.init requires valid Document object");
    }

    // Create DOM structure
    this.container = documentObj.createElement('div');
    this.container.className = 'primary-overlay-container';
    this.container.id = 'primary-overlay';

    // Apply Layout Config
    const l = this.layoutConfig;
    this.container.style.top = `${l.top || 850}px`;
    this.container.style.left = `${l.left}px`;
    this.container.style.width = `${l.width}px`;
    this.container.style.height = `${l.height}px`;
    this.container.style.borderRadius = `${l.borderRadius}px`;

    // Apply Theme Tokens via CSS Variables
    const theme = config.theme || {};
    this.setThemeTokens(theme);

    // Create Badge Element
    this.badgeElement = documentObj.createElement('div');
    this.badgeElement.className = 'primary-badge';
    this.badgeElement.style.width = `${l.badgeWidth}px`;
    this.badgeElement.style.fontSize = `${l.fontSizeBadge}px`;
    this.badgeElement.textContent = 'HEADLINE';

    // Create Content Container & Headline Element
    const contentBox = documentObj.createElement('div');
    contentBox.className = 'primary-content';

    this.headlineElement = documentObj.createElement('div');
    this.headlineElement.className = 'primary-headline-text';
    this.headlineElement.style.fontSize = `${l.fontSizeHeadline}px`;
    this.headlineElement.textContent = '';

    contentBox.appendChild(this.headlineElement);
    this.container.appendChild(this.badgeElement);
    this.container.appendChild(contentBox);

    if (parentNode) {
      parentNode.appendChild(this.container);
    }

    // Register with ResourceManager
    this.resources.acquire('dom-container', this.container, (el) => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    return true;
  }

  setThemeTokens(theme = {}) {
    if (!this.container) return;
    const style = this.container.style;
    if (theme.primaryBg) style.setProperty('--primary-bg', theme.primaryBg);
    if (theme.categoryColor) style.setProperty('--category-color', theme.categoryColor);
    if (theme.headlineColor) style.setProperty('--headline-color', theme.headlineColor);
    if (theme.accentColor) style.setProperty('--accent-color', theme.accentColor);
  }

  setCategoryPreset(category = 'general') {
    if (!this.container) return;
    const presets = {
      breaking: '#d62828',
      politics: '#0077b6',
      crime: '#9d0208',
      sports: '#38b000',
      weather: '#00b4d8',
      business: '#7209b7',
      general: '#e63946'
    };
    const color = presets[category.toLowerCase()] || presets.general;
    this.container.style.setProperty('--category-color', color);
  }

  // 2. Contract Method: show(data)
  show(data = {}) {
    if (!this.container) return false;
    this.update(data);
    this.container.classList.add('visible');
    this.isVisible = true;
    return true;
  }

  // 3. Contract Method: update(data)
  update(data = {}) {
    this.currentData = data;
    const text = data.headline || data.text || (Array.isArray(data.headlines) ? data.headlines[0] : '');
    const category = data.category || data.label || 'HEADLINE';

    if (this.badgeElement) {
      this.badgeElement.textContent = String(category).toUpperCase();
      this.setCategoryPreset(String(category));
    }

    if (this.headlineElement) {
      this.headlineElement.textContent = String(text);
    }

    if (data.theme) {
      this.setThemeTokens(data.theme);
    }

    return true;
  }

  // 4. Contract Method: hide()
  hide() {
    if (!this.container) return false;
    this.container.classList.remove('visible');
    this.isVisible = false;
    return true;
  }

  // 5. Contract Method: destroy()
  destroy() {
    this.isVisible = false;
    this.currentData = null;
    this.resources.disposeAll();
    this.container = null;
    this.badgeElement = null;
    this.headlineElement = null;
    return true;
  }

  getSnapshot() {
    return {
      id: this.id,
      priority: this.priority,
      visible: this.isVisible,
      data: this.currentData,
      layout: this.layoutConfig
    };
  }
}
