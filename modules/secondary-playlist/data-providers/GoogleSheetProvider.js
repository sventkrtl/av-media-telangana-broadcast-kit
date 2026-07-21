/**
 * AV Media Telangana - Google Sheet Data Provider (Task M2-1A Read-Only)
 * Consumes Web-Published Google Sheet CSV data and converts rows into standardized PlaylistModel[] objects.
 * Supports UTF-8 Telugu text, status filtering, and sorting. No API keys or OAuth required.
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
   * Fetch published CSV text from web URL or consume direct csvText.
   */
  async load(options = {}) {
    this.status = 'LOADING';
    const csvUrl = options.url || this.url;
    const directCsv = options.csvText || this.csvText;

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
        success: true,
        status: 'success',
        playlists: this.playlists,
        count: this.playlists.length
      });
    } catch (error) {
      this.status = 'ERROR';
      console.error('[GoogleSheetProvider] Load error trapped:', error.message);

      return new ProviderResult({
        success: false,
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
      success: true,
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
    if (rows.length < 2) return []; // Require at least header + 1 data row

    const headers = rows[0].map(h => h.trim().toLowerCase());
    
    // Find column indexes
    const labelIdx = headers.findIndex(h => h.includes('label') || h.includes('district') || h.includes('category'));
    const themeIdx = headers.findIndex(h => h.includes('theme') || h.includes('type'));
    const newsIdx = headers.findIndex(h => h.includes('news') || h.includes('headline') || h.includes('text') || h.includes('content'));
    const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('active') || h.includes('enable'));
    const priorityIdx = headers.findIndex(h => h.includes('priority') || h.includes('order'));

    if (labelIdx === -1 || newsIdx === -1) {
      console.warn('[GoogleSheetProvider] CSV missing required columns: Label or News');
      return [];
    }

    const validItems = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const label = (row[labelIdx] || '').trim();
      const news = (row[newsIdx] || '').trim();
      const theme = themeIdx !== -1 ? (row[themeIdx] || '').trim().toLowerCase() : 'district';
      const status = statusIdx !== -1 ? (row[statusIdx] || '').trim().toLowerCase() : 'active';
      const priority = priorityIdx !== -1 ? parseInt(row[priorityIdx] || '10', 10) : 10;

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
