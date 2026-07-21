/**
 * AV Media Telangana - Secondary News Playlist Engine (Task 1 Foundation)
 * Pure JavaScript Data Model, Queue Manager, Separator Injection & Validation Suite.
 * Strictly adheres to SECONDARY_NEWS_PLAYLIST_ENGINE_SPEC.md Constitution v1.0.
 */

export class PlaylistModel {
  constructor({ id = null, label = '', theme = 'district', items = [] } = {}) {
    this.id = id || `pl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.label = String(label).trim();
    this.theme = String(theme).toLowerCase().trim() || 'district';
    this.items = Array.isArray(items) ? items.map(item => String(item).trim()).filter(Boolean) : [];
  }

  isValid() {
    return this.label.length > 0 && this.items.length > 0;
  }
}

export class SecondaryNewsPlaylistEngine {
  constructor(playlists = []) {
    this.playlists = [];
    this.currentPlaylistIndex = 0;
    this.currentNewsIndex = 0;
    this.separatorAsset = 'AV_MEDIA_ROUND_LOGO';

    if (Array.isArray(playlists)) {
      playlists.forEach(pl => this.addPlaylist(pl));
    }
  }

  // --- 1 & 2. Playlist Queue Manager ---
  addPlaylist(playlistData) {
    const playlist = playlistData instanceof PlaylistModel ? playlistData : new PlaylistModel(playlistData);
    this.playlists.push(playlist);
    return playlist;
  }

  removePlaylist(identifier) {
    const index = typeof identifier === 'number'
      ? identifier
      : this.playlists.findIndex(p => p.id === identifier);

    if (index >= 0 && index < this.playlists.length) {
      const removed = this.playlists.splice(index, 1)[0];
      if (this.currentPlaylistIndex >= this.playlists.length) {
        this.currentPlaylistIndex = Math.max(0, this.playlists.length - 1);
      }
      return removed;
    }
    return null;
  }

  updatePlaylist(identifier, updatedData) {
    const index = typeof identifier === 'number'
      ? identifier
      : this.playlists.findIndex(p => p.id === identifier);

    if (index >= 0 && index < this.playlists.length) {
      const current = this.playlists[index];
      this.playlists[index] = new PlaylistModel({
        id: current.id,
        label: updatedData.label !== undefined ? updatedData.label : current.label,
        theme: updatedData.theme !== undefined ? updatedData.theme : current.theme,
        items: updatedData.items !== undefined ? updatedData.items : current.items
      });
      return this.playlists[index];
    }
    return null;
  }

  reorderPlaylists(newIndices) {
    if (!Array.isArray(newIndices) || newIndices.length !== this.playlists.length) return false;
    const reordered = newIndices.map(i => this.playlists[i]).filter(Boolean);
    if (reordered.length === this.playlists.length) {
      this.playlists = reordered;
      return true;
    }
    return false;
  }

  getCurrentPlaylist() {
    if (this.playlists.length === 0) return null;
    return this.playlists[this.currentPlaylistIndex];
  }

  nextPlaylist() {
    if (this.playlists.length === 0) return null;
    this.currentPlaylistIndex = (this.currentPlaylistIndex + 1) % this.playlists.length;
    this.currentNewsIndex = 0;
    return this.getCurrentPlaylist();
  }

  previousPlaylist() {
    if (this.playlists.length === 0) return null;
    this.currentPlaylistIndex = (this.currentPlaylistIndex - 1 + this.playlists.length) % this.playlists.length;
    this.currentNewsIndex = 0;
    return this.getCurrentPlaylist();
  }

  // --- 3. News Queue Inside Playlist ---
  getCurrentNews() {
    const playlist = this.getCurrentPlaylist();
    if (!playlist || playlist.items.length === 0) return null;
    return playlist.items[this.currentNewsIndex];
  }

  nextNews() {
    const playlist = this.getCurrentPlaylist();
    if (!playlist || playlist.items.length === 0) return null;
    this.currentNewsIndex = (this.currentNewsIndex + 1) % playlist.items.length;
    return this.getCurrentNews();
  }

  previousNews() {
    const playlist = this.getCurrentPlaylist();
    if (!playlist || playlist.items.length === 0) return null;
    this.currentNewsIndex = (this.currentNewsIndex - 1 + playlist.items.length) % playlist.items.length;
    return this.getCurrentNews();
  }

  reset() {
    this.currentPlaylistIndex = 0;
    this.currentNewsIndex = 0;
  }

  // --- 4. Automatic Separator Injection ---
  getSequenceWithSeparators(playlistInput) {
    const playlist = playlistInput || this.getCurrentPlaylist();
    if (!playlist || !Array.isArray(playlist.items) || playlist.items.length === 0) {
      return [];
    }

    const sequence = [];
    playlist.items.forEach((item, index) => {
      sequence.push({
        type: 'NEWS',
        content: item,
        playlistLabel: playlist.label,
        theme: playlist.theme
      });

      // Inject separator ONLY between consecutive news items inside the same playlist
      if (index < playlist.items.length - 1) {
        sequence.push({
          type: 'SEPARATOR',
          asset: this.separatorAsset,
          playlistLabel: playlist.label,
          theme: playlist.theme
        });
      }
    });

    return sequence;
  }

  // --- 5. Unit Validation Engine ---
  static validate(playlistsInput) {
    const results = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!Array.isArray(playlistsInput) || playlistsInput.length === 0) {
      results.isValid = false;
      results.errors.push('Playlists collection is empty.');
      return results;
    }

    playlistsInput.forEach((pl, idx) => {
      const label = pl.label ? String(pl.label).trim() : '';
      if (label.length === 0) {
        results.isValid = false;
        results.errors.push(`Playlist at index ${idx} has an empty label.`);
      }

      if (!Array.isArray(pl.items) || pl.items.length === 0) {
        results.isValid = false;
        results.errors.push(`Playlist "${label || idx}" has no news items.`);
      }
    });

    return results;
  }
}
