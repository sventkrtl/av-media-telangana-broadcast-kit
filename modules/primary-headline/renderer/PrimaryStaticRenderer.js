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
  BAR_BG_COLOR: '#1E3A8A',
  TEXT_COLOR: '#FFFFFF',
  FONT_FAMILY: "'Ramabhadra', 'Noto Sans Telugu', system-ui, sans-serif",
  SIDE_PADDING: 40 // Title-safe horizontal margin in px
});

export class PrimaryStaticRenderer {
  constructor(options = {}) {
    this.containerElement = null;
    this.barElement = null;
    this.viewportElement = null; // Animation layer: owns clip-path & opacity
    this.textElement = null;     // Rendering layer: pure glyph output only
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

    // Check for pre-existing DOM elements in index.html to prevent duplication
    const existingBar      = isDom && container.querySelector ? container.querySelector('#ph-blue-bar')         : null;
    const existingViewport = isDom && container.querySelector ? container.querySelector('#ph-headline-viewport') : null;
    const existingText     = isDom && container.querySelector ? container.querySelector('#ph-headline-text')     : null;

    // 2. Create or Reuse Blue Background Bar
    const bar = existingBar || (isDom ? document.createElement('div') : { tagName: 'DIV', style: {} });
    bar.id = bar.id || 'ph-blue-bar';
    if (!bar.style) bar.style = {};
    bar.style.backgroundColor = PRIMARY_RENDER_CONSTANTS.BAR_BG_COLOR;
    if (isDom && !existingBar) {
      bar.className = 'ph-blue-bar';
      bar.style.position = 'absolute';
      bar.style.top = '0';
      bar.style.left = '0';
      bar.style.width = '100%';
      bar.style.height = '100%';
      bar.style.display = 'flex';
      bar.style.alignItems = 'center';
      bar.style.justifyContent = 'center';
      bar.style.padding = `0 ${PRIMARY_RENDER_CONSTANTS.SIDE_PADDING}px`;
      bar.style.boxSizing = 'border-box';
    }
    this.barElement = bar;

    // 3. Create or Reuse Headline Viewport (Animation Layer: clip-path & opacity target)
    //    This wrapper owns clip-path / opacity so the inner text element is NEVER clipped
    //    by clip-path during the reveal/collapse animation (Rendering Isolation Experiment P1-7E).
    const viewport = existingViewport || (isDom ? document.createElement('div') : { tagName: 'DIV', style: {} });
    viewport.id = viewport.id || 'ph-headline-viewport';
    if (!viewport.style) viewport.style = {};
    if (isDom && !existingViewport) {
      viewport.className = 'ph-headline-viewport';
      viewport.style.width = '100%';
      viewport.style.overflow = 'visible';
    }
    this.viewportElement = viewport;

    // 4. Create or Reuse Centered Headline Text Element (Pure Glyph Rendering Layer)
    //    No clip-path, no opacity, no will-change on this element.
    const text = existingText || (isDom ? document.createElement('div') : { tagName: 'DIV', style: {} });
    text.id = text.id || 'ph-headline-text';
    if (!text.style) text.style = {};
    text.style.color = PRIMARY_RENDER_CONSTANTS.TEXT_COLOR;
    text.style.textAlign = 'center';
    if (isDom && !existingText) {
      text.className = 'ph-headline-text';
      text.style.fontFamily = PRIMARY_RENDER_CONSTANTS.FONT_FAMILY;
      text.style.fontSize = '56px'; // Final Calibrated safe maximum for Ramabhadra in 135px bar
      text.style.fontWeight = '500'; // Clean vector rendering without faux-bold smudging
      text.style.whiteSpace = 'nowrap';
      text.style.overflow = 'visible'; // Fully unconstrained glyph rendering
      text.style.width = '100%';
      text.style.lineHeight = 'normal'; // Native Ramabhadra font metrics line height
      text.style.marginTop = '-6px'; // Optical Center baseline shift for Ramabhadra Telugu font
    }
    this.textElement = text;

    // Mount DOM nodes if not pre-existing
    if (isDom && container.appendChild) {
      if (!existingBar) {
        viewport.appendChild(text);
        bar.appendChild(viewport);
        container.appendChild(bar);
      } else if (!existingViewport && bar.appendChild) {
        viewport.appendChild(text);
        bar.appendChild(viewport);
      } else if (!existingText && viewport.appendChild) {
        viewport.appendChild(text);
      }
    }

    this.isInitialized = true;
    return {
      containerElement: this.containerElement,
      barElement: this.barElement,
      viewportElement: this.viewportElement, // Animation target for Motion Engine
      textElement: this.textElement          // Pure glyph rendering element
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
