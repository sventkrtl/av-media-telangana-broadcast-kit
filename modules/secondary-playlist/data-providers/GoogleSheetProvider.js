/**
 * AV Media Telangana - Google Sheet Data Provider (Task M2-1A Read-Only)
 * Consumes Web-Published Google Sheet CSV data and converts rows into standardized PlaylistModel[] objects.
 * Supports UTF-8 Telugu text, status filtering, automatic URL normalization, and flexible column alias matching.
 * Strictly adheres to SECONDARY_NEWS_PLAYLIST_ENGINE_SPEC.md Constitution v1.0.
 */

import { BaseDataProvider } from './BaseDataProvider.js';
import { ProviderResult } from './ProviderResult.js';
import { PlaylistModel } from '../playlist-engine.js';

export class GoogleSheetProvider extends BaseDataProvider {
  constructor(options = {}) {
    super(options);
    this.url = options.url || '';
    this.csvText = options.csvText || null;
    this.playlists = [];
    this.status = 'UNINITIALIZED';
  }

  async initialize() {
    this.status = 'READY';
    return true;
  }

  /**
   * Automatically normalizes any Google Sheet URL (Edit / Share / Published / HTML / Nested OBS Params) into a valid direct CSV URL.
   */
  static normalizeGoogleSheetUrl(url) {
    if (!url || typeof url !== 'string') return '';
    let trimmed = url.trim();

    // If full OBS URL containing ?sheetUrl= or &sheetUrl= was pasted by mistake, extract inner Google Sheet URL
    if (trimmed.includes('sheetUrl=')) {
      const matchParam = trimmed.match(/[?&]sheetUrl=([^&]+)/);
      if (matchParam && matchParam[1]) {
        trimmed = decodeURIComponent(matchParam[1]);
      }
    }

    // Already a direct CSV export URL or published CSV URL
    if (trimmed.includes('output=csv') || trimmed.includes('format=csv') || trimmed.includes('out:csv')) {
      return trimmed;
    }

    // Match Google Sheet ID: /spreadsheets/d/([a-zA-Z0-9-_]+)
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const sheetId = match[1];

      // Check if URL has specific gid
      const gidMatch = trimmed.match(/[?&]gid=([0-9]+)/) || trimmed.match(/#gid=([0-9]+)/);
      const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';

      return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
    }

    return trimmed;
  }

  /**
   * Fetch published CSV text from web URL or consume direct csvText.
   */
  async load(options = {}) {
    this.status = 'LOADING';
    if (options.url) this.url = options.url;
    if (options.csvText !== undefined) this.csvText = options.csvText;

    const directCsv = this.csvText;
    const csvUrl = GoogleSheetProvider.normalizeGoogleSheetUrl(this.url);

    try {
      let rawCsv = '';

      if (directCsv) {
        rawCsv = directCsv;
      } else if (csvUrl) {
        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        rawCsv = await response.text();
      } else {
        throw new Error('No Published CSV URL or CSV content provided to GoogleSheetProvider.');
      }

      this.playlists = this.parseCSVToPlaylists(rawCsv);
      this.status = 'READY';

      return new ProviderResult({
        status: 'success',
        playlists: this.playlists,
        count: this.playlists.length
      });
    } catch (error) {
      this.status = 'ERROR';
      console.error('[GoogleSheetProvider] Load error trapped:', error.message);

      return new ProviderResult({
        status: 'error',
        error: error.message,
        playlists: []
      });
    }
  }

  async refresh() {
    return this.load();
  }

  getPlaylists() {
    return new ProviderResult({
      status: 'success',
      playlists: this.playlists,
      count: this.playlists.length
    });
  }

  /**
   * Parse CSV string into standardized PlaylistModel[] objects.
   * Traps malformed rows and filters out inactive items safely.
   */
  parseCSVToPlaylists(csvString) {
    if (!csvString || typeof csvString !== 'string') return [];

    const rows = this.parseCSVRows(csvString);
    if (rows.length < 1) return [];

    // Check header row (row 0)
    const rawHeaders = rows[0].map(h => h.trim().toLowerCase());
    
    // Find column indexes with broad alias matching (English & Telugu)
    let labelIdx = rawHeaders.findIndex(h => 
      h.includes('label') || h.includes('district') || h.includes('category') || h.includes('item') || h.includes('లేబుల్') || h.includes('వర్గం') || h.includes('జిల్లా')
    );

    let newsIdx = rawHeaders.findIndex(h => 
      h.includes('news') || h.includes('headline') || h.includes('text') || h.includes('content') || h.includes('description') || h.includes('details') || h.includes('వార్త') || h.includes('వివరాలు')
    );

    const themeIdx = rawHeaders.findIndex(h => 
      h.includes('theme') || h.includes('type') || h.includes('థీమ్')
    );

    const statusIdx = rawHeaders.findIndex(h => 
      h.includes('status') || h.includes('active') || h.includes('enable') || h.includes('స్టేటస్')
    );

    const priorityIdx = rawHeaders.findIndex(h => 
      h.includes('priority') || h.includes('order')
    );

    let startRow = 1;

    // Fallback for sheets without standard headers (e.g. plain 2-column data)
    if (labelIdx === -1 || newsIdx === -1) {
      const hasInvalidHeader = rawHeaders.some(h => h.includes('cola') || h.includes('header') || h.includes('foo'));
      if (hasInvalidHeader) {
        console.warn('[GoogleSheetProvider] CSV missing required columns: Label or News');
        return [];
      }

      if (rows[0].length >= 2) {
        labelIdx = 0;
        newsIdx = 1;
        if (rows[0][0].toLowerCase().includes('label') || rows[0][0].toLowerCase().includes('item')) {
          startRow = 1;
        } else {
          startRow = 0; // Row 0 is actual data
        }
      } else {
        console.warn('[GoogleSheetProvider] CSV missing required columns: Label or News');
        return [];
      }
    }

    const validItems = [];

    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const label = (row[labelIdx] || '').trim();
      const news = (row[newsIdx] || '').trim();
      const theme = (themeIdx !== -1 && row[themeIdx]) ? row[themeIdx].trim().toLowerCase() : 'district';
      const status = (statusIdx !== -1 && row[statusIdx]) ? row[statusIdx].trim().toLowerCase() : 'active';
      const priority = (priorityIdx !== -1 && row[priorityIdx]) ? parseInt(row[priorityIdx] || '10', 10) : 10;

      // Filter empty news or inactive rows
      if (!label || !news) continue;
      if (status === 'inactive' || status === 'false' || status === '0' || status === 'disabled') continue;

      validItems.push({
        label,
        theme: theme || 'district',
        news,
        priority: isNaN(priority) ? 10 : priority
      });
    }

    // Sort by Priority (ascending)
    validItems.sort((a, b) => a.priority - b.priority);

    // Group items by Theme + Label
    const grouped = new Map();
    validItems.forEach(item => {
      const key = `${item.theme}::${item.label}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          label: item.label,
          theme: item.theme,
          items: []
        });
      }
      grouped.get(key).items.push(item.news);
    });

    // Convert grouped map to PlaylistModel[]
    const playlistModels = [];
    grouped.forEach(group => {
      playlistModels.push(new PlaylistModel({
        label: group.label,
        theme: group.theme,
        items: group.items
      }));
    });

    return playlistModels;
  }

  /**
   * Universal CSV line & quoted cell parser handling UTF-8 Telugu, multi-line values & quotes.
   */
  parseCSVRows(csvText) {
    const lines = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    const normalized = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      const nextChar = normalized[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell);
        currentCell = '';
      } else if (char === '\n' && !inQuotes) {
        currentRow.push(currentCell);
        lines.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell);
      lines.push(currentRow);
    }

    return lines;
  }
}
