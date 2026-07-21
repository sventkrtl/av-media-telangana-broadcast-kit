/**
 * AV Media Telangana - Base Data Provider Interface
 * Abstract contract interface for all Secondary News Playlist Data Providers.
 */

import { ProviderResult } from './ProviderResult.js';

export class BaseDataProvider {
  constructor(options = {}) {
    if (new.target === BaseDataProvider) {
      throw new Error('Cannot instantiate abstract class BaseDataProvider directly.');
    }
    this.options = options;
    this.status = 'UNINITIALIZED'; // 'UNINITIALIZED' | 'READY' | 'LOADING' | 'ERROR' | 'DISPOSED'
  }

  async initialize() {
    throw new Error('Method initialize() must be implemented by Provider class.');
  }

  async load() {
    throw new Error('Method load() must be implemented by Provider class.');
  }

  async refresh() {
    throw new Error('Method refresh() must be implemented by Provider class.');
  }

  async dispose() {
    this.status = 'DISPOSED';
  }

  getPlaylists() {
    return new ProviderResult({ status: 'idle', playlists: [] });
  }

  getStatus() {
    return this.status;
  }
}
