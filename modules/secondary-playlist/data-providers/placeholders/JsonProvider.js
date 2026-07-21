/**
 * AV Media Telangana - JSON Data Provider (Placeholder)
 */

import { BaseDataProvider } from '../BaseDataProvider.js';
import { ProviderResult } from '../ProviderResult.js';

export class JsonProvider extends BaseDataProvider {
  constructor(options = {}) {
    super(options);
    this.playlists = options.playlists || [];
  }

  async initialize() {
    this.status = 'READY';
  }

  async load() {
    this.status = 'READY';
    return this.getPlaylists();
  }

  async refresh() {
    return this.load();
  }

  getPlaylists() {
    return new ProviderResult({
      status: 'success',
      playlists: this.playlists
    });
  }
}
