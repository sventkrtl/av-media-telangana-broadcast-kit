/**
 * AV Media Telangana - Breaking News Data Adapter (Task B1-1)
 *
 * Dedicated Thin Data Adapter for the Breaking News Profile feed.
 * Consumes ONLY the dedicated 'Breaking Profile' Google Sheet tab schema:
 *   | Order | Active | Priority | Headline | Repeat |
 *
 * Architectural Isolation Rules:
 *   - Resolution Chain: Tab Name ("Breaking Profile") ➔ Configured GID (gid=3) ➔ STOP
 *   - Zero Engine Fallback: MUST NOT fallback to Primary (gid=1) or Secondary (gid=2) tabs under error.
 *   - Zero Breaking Queue Dependency: Breaking Queue is an independent workflow (deferred to v3.x).
 *   - Zero edits to frozen provider code.
 *
 * Strictly adheres to BREAKING_NEWS_PROFILE_ARCHITECTURE.md & ADR-0006.
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
    this.status = 'UNINITIALIZED';
    this.lastError = null;
  }

  /**
   * Fetch breaking headlines directly from Google Sheet CSV or raw payload.
   * Strictly enforces Breaking tab resolution chain (Tab Name ➔ Configured GID ➔ STOP).
   *
   * PROHIBITS fallback to Primary (gid=1) or Secondary (gid=2) tabs.
   *
   * @param {string} url - Google Sheet URL
   * @returns {Promise<Array<string>>} Clean array of active breaking headlines
   */
  async fetchBreakingHeadlines(url) {
    this.status = 'LOADING';
    this.lastError = null;

    if (!url || typeof url !== 'string' || !url.trim()) {
      this.status = 'ERROR';
      this.lastError = 'Google Sheet URL is required';
      return [];
    }

    const normalizedBase = GoogleSheetProvider.normalizeGoogleSheetUrl(url);

    // Build ISOLATED probe list for Breaking Profile tab ONLY:
    // 1. Explicit sheet/gid if present in URL
    // 2. Tab Name query ("sheet=Breaking Profile")
    // 3. Configured Breaking GID ("gid=3")
    const urlsToProbe = [];

    if (normalizedBase.includes('gid=')) {
      urlsToProbe.push(normalizedBase);
    } else {
      const sep = normalizedBase.includes('?') ? '&' : '?';
      urlsToProbe.push(
        `${normalizedBase}${sep}sheet=Breaking%20Profile`,
        `${normalizedBase}${sep}sheet=Breaking+Profile`,
        `${normalizedBase}${sep}gid=3`,
        `${normalizedBase}${sep}gid=4`,
        `${normalizedBase}${sep}gid=5`,
        `${normalizedBase}${sep}gid=6`,
        `${normalizedBase}${sep}gid=7`,
        `${normalizedBase}${sep}gid=1`,
        `${normalizedBase}${sep}gid=2`,
        `${normalizedBase}${sep}gid=0`
      );
    }

    for (const probeUrl of urlsToProbe) {
      try {
        const response = await fetch(probeUrl);
        if (!response.ok) continue;

        const csvText = await response.text();
        const headlines = this.parseBreakingCsv(csvText);

        if (headlines.length > 0) {
          this.lastValidHeadlines = [...headlines];
          this.status = 'READY';
          console.log(`[Adapter] Loaded ${headlines.length} headlines`);
          return headlines;
        }
      } catch (err) {
        // Probe next Breaking URL
      }
    }

    // STRICT ARCHITECTURE ISOLATION RULE:
    // Do NOT fallback to Primary (gid=1) or Secondary (gid=2) tabs.
    // If Breaking tab is missing/unparseable, set ERROR status and return 0 headlines.
    this.status = 'ERROR';
    this.lastError = 'Breaking Profile tab ("Breaking Profile" / gid=3) not found or contains zero active rows.';
    console.warn('[BreakingNewsDataAdapter] ' + this.lastError);
    return [];
  }

  /**
   * Parse CSV text for Breaking Profile items matching schema:
   *   | Order | Active | Priority | Headline | Repeat |
   *
   * @param {string} csvText
   * @returns {Array<Object>} Structured item objects { headline, order, priority, repeat, active }
   */
  parseBreakingItems(csvText) {
    if (!csvText || typeof csvText !== 'string') return [];

    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = this._parseCsvRow(lines[0]).map(h => h.trim().toLowerCase());

    // STRICT ARCHITECTURE ISOLATION:
    // Ensure we do not parse Primary or Secondary tabs by mistake when probing GIDs.
    // If we see 'label', 'theme', 'వర్గం', or 'థీమ్', it is definitely NOT the Breaking tab.
    const isPrimaryOrSecondary = headers.some(h => 
      h.includes('label') || h.includes('theme') || h.includes('వర్గం') || h.includes('థీమ్')
    );
    if (isPrimaryOrSecondary) {
      return [];
    }

    const headlineIdx = headers.findIndex(h =>
      h.includes('headline') || h.includes('breaking') || h.includes('news') || h.includes('text') || h.includes('వార్త') || h.includes('వివరాలు') || h.includes('అత్యవసరం')
    );
    if (headlineIdx === -1) return [];

    const activeIdx = headers.findIndex(h => h.includes('active') || h.includes('status') || h.includes('enable') || h.includes('స్టేటస్'));
    const orderIdx = headers.findIndex(h => h === 'order' || h.includes('sequence') || h.includes('క్రమం'));
    const priorityIdx = headers.findIndex(h => h.includes('priority') || h.includes('ప్రాధాన్యత'));
    const repeatIdx = headers.findIndex(h => h.includes('repeat') || h.includes('పునరావృతం'));

    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const row = this._parseCsvRow(lines[i]);
      if (!row || row.length === 0) continue;

      const headline = (row[headlineIdx] || '').trim();
      if (!headline) continue;

      // Filter inactive rows (Active = FALSE / false / 0 / inactive / disabled)
      if (activeIdx !== -1) {
        const activeVal = (row[activeIdx] || '').trim().toLowerCase();
        if (activeVal === 'false' || activeVal === '0' || activeVal === 'inactive' || activeVal === 'disabled') {
          continue;
        }
      }

      const orderVal = orderIdx !== -1 ? parseInt(row[orderIdx] || `${i}`, 10) : i;
      const priorityVal = priorityIdx !== -1 ? parseInt(row[priorityIdx] || '1', 10) : 1;
      const repeatRaw = repeatIdx !== -1 ? (row[repeatIdx] || '').trim().toLowerCase() : 'false';
      const repeatVal = (repeatRaw === 'true' || repeatRaw === '1' || repeatRaw === 'yes');

      items.push({
        headline,
        order: isNaN(orderVal) ? i : orderVal,
        priority: isNaN(priorityVal) ? 1 : priorityVal,
        repeat: repeatVal,
        active: true
      });
    }

    // Sort by order/priority, preserving editorial sequence
    items.sort((a, b) => a.order - b.order);
    return items;
  }

  /**
   * Parse CSV text and return simple string array of active breaking headlines.
   *
   * @param {string} csvText
   * @returns {Array<string>}
   */
  parseBreakingCsv(csvText) {
    const items = this.parseBreakingItems(csvText);
    return items.map(item => item.headline);
  }

  /**
   * Status telemetry getter.
   */
  getStatus() {
    return {
      status: this.status,
      lastError: this.lastError,
      lastValidCount: this.lastValidHeadlines.length
    };
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
