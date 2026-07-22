/**
 * AV Media Telangana - Breaking News Data Adapter (Task B1-0)
 *
 * Thin Data Adapter for Breaking News feeds.
 * Reuses GoogleSheetProvider URL normalization and direct CSV resolution strategy
 * to fetch Breaking News payloads without modifying any frozen provider files.
 *
 * Rules:
 *   - Thin Adapter pattern inside modules/breaking-news/adapters/
 *   - Reuses Primary GID Resolution strategy (probes gid=3, 1, 0, 2 for Breaking tab)
 *   - Parses active breaking headlines safely
 *   - Zero edits to frozen provider code
 *
 * Strictly adheres to BREAKING_NEWS_PROFILE_ARCHITECTURE.md.
 */

import { GoogleSheetProvider } from '../../secondary-playlist/data-providers/GoogleSheetProvider.js';

export class BreakingNewsDataAdapter {
  /**
   * @param {Object} [options]
   * @param {string} [options.url] - Google Sheet URL
   */
  constructor(options = {}) {
    this.url = options.url || '';
    this.lastValidHeadlines = [];
  }

  /**
   * Fetch breaking headlines directly from Google Sheet CSV or raw payload.
   * Probes GID sequence (gid=3, 1, 0, 2) to auto-detect Breaking News tab.
   *
   * @param {string} url - Google Sheet URL
   * @returns {Promise<Array<string>>} Clean array of active breaking headlines
   */
  async fetchBreakingHeadlines(url) {
    if (!url || typeof url !== 'string' || !url.trim()) {
      return [];
    }

    const normalizedBase = GoogleSheetProvider.normalizeGoogleSheetUrl(url);

    // Build probe list for Breaking News tab (probe gid=3, 1, 0, 2)
    const urlsToProbe = [];
    if (normalizedBase.includes('gid=')) {
      urlsToProbe.push(normalizedBase);
    } else {
      const base = normalizedBase;
      urlsToProbe.push(`${base}&gid=3`, `${base}&gid=1`, `${base}&gid=0`, `${base}&gid=2`);
    }

    for (const probeUrl of urlsToProbe) {
      try {
        const response = await fetch(probeUrl);
        if (!response.ok) continue;

        const csvText = await response.text();
        const headlines = this.parseBreakingCsv(csvText);

        if (headlines.length > 0) {
          this.lastValidHeadlines = [...headlines];
          return headlines;
        }
      } catch (err) {
        // Probe next URL
      }
    }

    return this.lastValidHeadlines;
  }

  /**
   * Parse CSV text for breaking headlines.
   * Supports 'Headline', 'News', or 'Breaking' column headers.
   * Excludes inactive items (`Active = FALSE/false/0`).
   *
   * @param {string} csvText
   * @returns {Array<string>}
   */
  parseBreakingCsv(csvText) {
    if (!csvText || typeof csvText !== 'string') return [];

    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = this._parseCsvRow(lines[0]).map(h => h.trim().toLowerCase());

    const headlineIdx = headers.findIndex(h =>
      h.includes('breaking') || h.includes('headline') || h.includes('news') || h.includes('text')
    );
    if (headlineIdx === -1) return [];

    const activeIdx = headers.findIndex(h => h.includes('active') || h.includes('status'));

    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const row = this._parseCsvRow(lines[i]);
      if (!row || row.length === 0) continue;

      const text = (row[headlineIdx] || '').trim();
      if (!text) continue;

      if (activeIdx !== -1) {
        const activeVal = (row[activeIdx] || '').trim().toLowerCase();
        if (activeVal === 'false' || activeVal === '0' || activeVal === 'inactive' || activeVal === 'disabled') {
          continue;
        }
      }

      items.push(text);
    }

    return items;
  }

  _parseCsvRow(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current);
    return fields;
  }
}
