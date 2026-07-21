/**
 * AV Media Telangana - Provider Result Model
 * Standardized data transfer model returned by all Data Providers.
 */

import { PlaylistModel } from '../playlist-engine.js';

export class ProviderResult {
  constructor({ playlists = [], status = 'idle', error = null } = {}) {
    this.status = status; // 'idle' | 'loading' | 'success' | 'error'
    this.error = error ? String(error) : null;
    this.playlists = Array.isArray(playlists)
      ? playlists.map(pl => (pl instanceof PlaylistModel ? pl : new PlaylistModel(pl)))
      : [];
  }
}
