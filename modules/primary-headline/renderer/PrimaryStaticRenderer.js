/**
 * AV Media Telangana - Primary Static Renderer (Task P1-3)
 *
 * Generates, mounts, and updates the static DOM hierarchy for the Primary Headline Engine.
 *
 * DOM Hierarchy:
 *   Primary Container (1920x135 at X:0, Y:890)
 *     └── Blue Background Bar (Always Blue: #0F172A / #1E3A8A)
 *           └── Centered Headline Text (Always White: #FFFFFF, Single Line, Centered)
 *
 * Rules & Boundaries:
 *   - Strictly static DOM generation and updating.
 *   - NO animation execution.
 *   - NO timeline playback.
 *   - NO state management.
 *   - NO theme switching (Bar is always Blue, Text is always White).
 *   - Single line only (no wrapping, no marquee, no icons, no emojis, no bullets).
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0.
 */

export const PRIMARY_RENDER_CONSTANTS = Object.freeze({
  CANVAS_WIDTH: 1920,
  CANVAS_HEIGHT: 1080,
  BAR_X: 0,
  BAR_Y: 890,
  BAR_WIDTH: 1920,
  BAR_HEIGHT: 135,
  BAR_BOTTOM: 1025,
  BAR_BG_COLOR: '#0F172A',
  TEXT_COLOR: '#FFFFFF',
  FONT_FAMILY: "'Ramabhadra', 'Noto Sans Telugu', system-ui, sans-serif",
  SIDE_PADDING: 40 // Title-safe horizontal margin in px
});

export class PrimaryStaticRenderer {
  constructor(options = {}) {
    this.containerElement = null;
    this.barElement = null;
    this.textElement = null;
    this.isInitialized = false;
    this.currentText = '';
  }

  /**
   * Sanitize headline text according to Primary Engine rules:
   *   - Single line only (strip newlines/tabs)
   *   - Strip emojis, icons, and bullet symbols
   *   - Trim whitespace
   *
   * @param {string} rawText
   * @returns {string} Cleaned headline string
   */
  sanitizeHeadlineText(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';

    return rawText
      .replace(/[\r\n\t]+/g, ' ') // Convert line breaks to space
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Strip emojis
      .replace(/[•✦★▶■◆●]/g, '') // Strip bullet & icon symbols
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }

  /**
   * Initialize and mount the Primary Headline DOM structure into container.
   *
   * @param {HTMLElement|Object} container - Parent container element
   * @returns {Object} Mounted DOM references { container, bar, text }
   */
  initialize(container) {
    if (!container) {
      throw new Error('[PrimaryStaticRenderer] Container element is required for initialization.');
    }

    this.containerElement = container;
    const isDom = typeof document !== 'undefined';

    // 1. Configure Primary Container
    if (isDom && container instanceof HTMLElement) {
      container.style.position = 'absolute';
      container.style.left = `${PRIMARY_RENDER_CONSTANTS.BAR_X}px`;
      container.style.top = `${PRIMARY_RENDER_CONSTANTS.BAR_Y}px`;
      container.style.width = `${PRIMARY_RENDER_CONSTANTS.BAR_WIDTH}px`;
      container.style.height = `${PRIMARY_RENDER_CONSTANTS.BAR_HEIGHT}px`;
      container.style.overflow = 'hidden';
      container.style.pointerEvents = 'none';
    }

    // 2. Create Blue Background Bar
    const bar = isDom ? document.createElement('div') : { tagName: 'DIV', style: {} };
    if (isDom) {
      bar.id = 'ph-blue-bar';
      bar.className = 'ph-blue-bar';
      bar.style.position = 'absolute';
      bar.style.top = '0';
      bar.style.left = '0';
      bar.style.width = '100%';
      bar.style.height = '100%';
      bar.style.backgroundColor = PRIMARY_RENDER_CONSTANTS.BAR_BG_COLOR;
      bar.style.display = 'flex';
      bar.style.alignItems = 'center';
      bar.style.justifyContent = 'center';
      bar.style.padding = `0 ${PRIMARY_RENDER_CONSTANTS.SIDE_PADDING}px`;
      bar.style.boxSizing = 'border-box';
    } else {
      bar.id = 'ph-blue-bar';
      bar.style = { backgroundColor: PRIMARY_RENDER_CONSTANTS.BAR_BG_COLOR };
    }
    this.barElement = bar;

    // 3. Create Centered Headline Text Element
    const text = isDom ? document.createElement('div') : { tagName: 'DIV', style: {} };
    if (isDom) {
      text.id = 'ph-headline-text';
      text.className = 'ph-headline-text';
      text.style.color = PRIMARY_RENDER_CONSTANTS.TEXT_COLOR;
      text.style.fontFamily = PRIMARY_RENDER_CONSTANTS.FONT_FAMILY;
      text.style.fontSize = '32px'; // Base font size before runtime auto-scaling
      text.style.fontWeight = '700';
      text.style.textAlign = 'center';
      text.style.whiteSpace = 'nowrap';
      text.style.overflow = 'hidden';
      text.style.textOverflow = 'clip';
      text.style.width = '100%';
      text.style.lineHeight = '1.2';
    } else {
      text.id = 'ph-headline-text';
      text.style = { color: PRIMARY_RENDER_CONSTANTS.TEXT_COLOR, textAlign: 'center' };
    }
    this.textElement = text;

    // Mount DOM nodes
    if (isDom && container.appendChild) {
      bar.appendChild(text);
      container.appendChild(bar);
    }

    this.isInitialized = true;
    return {
      containerElement: this.containerElement,
      barElement: this.barElement,
      textElement: this.textElement
    };
  }

  /**
   * Render/Update headline text in DOM.
   *
   * @param {string} text - Raw headline string
   * @returns {string} Sanitized text applied to DOM
   */
  renderHeadline(text) {
    if (!this.isInitialized) {
      throw new Error('[PrimaryStaticRenderer] Cannot render headline before calling initialize().');
    }

    const cleanText = this.sanitizeHeadlineText(text);
    this.currentText = cleanText;

    if (this.textElement) {
      if (typeof document !== 'undefined') {
        this.textElement.textContent = cleanText;
      } else {
        this.textElement.textContent = cleanText;
      }
    }

    return cleanText;
  }

  /**
   * Clear rendered text from DOM.
   */
  clear() {
    this.currentText = '';
    if (this.textElement) {
      this.textElement.textContent = '';
    }
  }

  /**
   * Destroy DOM nodes and clear instance references.
   */
  destroy() {
    this.clear();

    if (typeof document !== 'undefined' && this.barElement && this.barElement.parentNode) {
      this.barElement.parentNode.removeChild(this.barElement);
    }

    this.containerElement = null;
    this.barElement = null;
    this.textElement = null;
    this.isInitialized = false;
  }
}
