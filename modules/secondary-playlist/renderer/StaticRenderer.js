/**
 * AV Media Telangana - Static Renderer (Task 2B Foundation)
 * Consumes TimelineEvent[] and renders static DOM layout frames.
 * Strictly adheres to SECONDARY_NEWS_PLAYLIST_ENGINE_SPEC.md Constitution v1.0.
 * NO animation, NO scrolling, NO transitions, NO automatic playback.
 */

import { EVENT_TYPES } from '../interpreter/TimelineEvent.js';

export const THEME_COLOR_MAP = Object.freeze({
  district: '#64748B',      // Grey
  sports: '#15803D',        // Green
  weather: '#0284C7',       // Blue
  business: '#D97706',      // Gold
  international: '#7E22CE', // Purple
  entertainment: '#DB2777', // Pink
  technology: '#0891B2'     // Cyan
});

export class StaticRenderer {
  constructor(options = {}) {
    this.logoSrc = options.logoSrc || '/assets/logos/logo-round.png';
    this.fallbackSeparatorText = options.fallbackSeparatorText || '✦';
  }

  /**
   * Get theme color for playlist content type
   */
  getThemeColor(theme) {
    const key = String(theme).toLowerCase().trim();
    return THEME_COLOR_MAP[key] || THEME_COLOR_MAP.district;
  }

  /**
   * Create Badge DOM element
   */
  createBadgeElement(label, theme) {
    const badge = typeof document !== 'undefined' ? document.createElement('div') : { tagName: 'DIV' };
    const themeColor = this.getThemeColor(theme);

    if (typeof document !== 'undefined') {
      badge.className = 'spl-badge';
      badge.textContent = label || '';
      badge.style.height = '36px';
      badge.style.padding = '0 16px';
      badge.style.borderRadius = '4px';
      badge.style.fontSize = '16px';
      badge.style.fontWeight = 'bold';
      badge.style.color = '#FFFFFF';
      badge.style.background = themeColor;
      badge.style.display = 'inline-flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'center';
      badge.style.whiteSpace = 'nowrap';
      badge.style.width = 'auto'; // AUTO width per SPEC Section 5
      badge.style.minWidth = '100px'; // Prevent short labels looking tiny
      badge.style.boxSizing = 'border-box';
    }

    return badge;
  }

  /**
   * Create News Text DOM element
   */
  createNewsElement(content) {
    const newsEl = typeof document !== 'undefined' ? document.createElement('span') : { tagName: 'SPAN' };

    if (typeof document !== 'undefined') {
      newsEl.className = 'spl-news-item';
      newsEl.textContent = content || '';
      newsEl.style.fontSize = '18px';
      newsEl.style.fontWeight = '500';
      newsEl.style.color = '#FFFFFF';
      newsEl.style.whiteSpace = 'nowrap';
      newsEl.style.display = 'inline-block';
      newsEl.style.verticalAlign = 'middle';
    }

    return newsEl;
  }

  /**
   * Create Logo Separator DOM element
   */
  createLogoElement() {
    const logoWrapper = typeof document !== 'undefined' ? document.createElement('div') : { tagName: 'DIV' };

    if (typeof document !== 'undefined') {
      logoWrapper.className = 'spl-logo-wrapper';
      logoWrapper.style.display = 'inline-flex';
      logoWrapper.style.alignItems = 'center';
      logoWrapper.style.justifyContent = 'center';
      logoWrapper.style.height = '100%';
      logoWrapper.style.margin = '0 16px';
      logoWrapper.style.verticalAlign = 'middle';

      const img = document.createElement('img');
      img.className = 'spl-logo-img';
      img.src = this.logoSrc;
      img.alt = 'AV Media Logo';
      img.style.height = '80%'; // 80% of crawl height per SPEC Section 9
      img.style.width = 'auto'; // AUTO width per SPEC Section 9
      img.style.objectFit = 'contain'; // Preserve aspect ratio
      img.style.display = 'block';

      img.onerror = () => {
        img.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.className = 'spl-logo-fallback';
        fallback.textContent = this.fallbackSeparatorText;
        fallback.style.color = '#F59E0B';
        fallback.style.fontSize = '16px';
        logoWrapper.appendChild(fallback);
      };

      logoWrapper.appendChild(img);
    }

    return logoWrapper;
  }

  /**
   * Render a single TimelineEvent into a container (Static Frame)
   */
  renderEvent(container, event) {
    if (!container || !event || !event.type) return null;

    if (typeof document !== 'undefined' && container instanceof HTMLElement) {
      container.innerHTML = ''; // Clear container for static single frame inspection
    }

    switch (event.type) {
      case EVENT_TYPES.BADGE_IN:
      case EVENT_TYPES.BADGE_HOLD:
        return this.createBadgeElement(event.label, event.theme);

      case EVENT_TYPES.NEWS_START:
      case EVENT_TYPES.NEWS_END:
        return this.createNewsElement(event.payload ? event.payload.newsContent : '');

      case EVENT_TYPES.LOGO_SEPARATOR:
        return this.createLogoElement();

      default:
        return null;
    }
  }

  /**
   * Render a complete TimelineEvent[] sequence into a static layout container for inspection.
   * NO animation, NO scrolling, NO transitions.
   */
  renderTimelineStatic(container, timelineEvents) {
    if (!container || !Array.isArray(timelineEvents)) return [];

    const renderedNodes = [];

    if (typeof document !== 'undefined' && container instanceof HTMLElement) {
      container.innerHTML = '';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.height = '48px';
      container.style.background = '#0F172A';
      container.style.overflow = 'hidden';
    }

    // Extract active badge label & theme
    const activeBadgeEvent = timelineEvents.find(e => e.type === EVENT_TYPES.BADGE_IN || e.type === EVENT_TYPES.BADGE_HOLD);
    if (activeBadgeEvent) {
      const badgeEl = this.createBadgeElement(activeBadgeEvent.label, activeBadgeEvent.theme);
      if (typeof document !== 'undefined' && container instanceof HTMLElement) {
        container.appendChild(badgeEl);
      }
      renderedNodes.push(badgeEl);
    }

    // Render sequence elements (NEWS_START & LOGO_SEPARATOR)
    timelineEvents.forEach(event => {
      if (event.type === EVENT_TYPES.NEWS_START) {
        const newsEl = this.createNewsElement(event.payload ? event.payload.newsContent : '');
        if (typeof document !== 'undefined' && container instanceof HTMLElement) {
          container.appendChild(newsEl);
        }
        renderedNodes.push(newsEl);
      } else if (event.type === EVENT_TYPES.LOGO_SEPARATOR) {
        const logoEl = this.createLogoElement();
        if (typeof document !== 'undefined' && container instanceof HTMLElement) {
          container.appendChild(logoEl);
        }
        renderedNodes.push(logoEl);
      }
    });

    return renderedNodes;
  }
}
