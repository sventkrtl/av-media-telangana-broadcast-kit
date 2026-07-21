/**
 * AV Media Telangana - Playlist Transition Behavior Manager (Task 3D)
 * Manages badge animation & separator behavior rules during playlist & news transitions.
 * Strictly adheres to SECONDARY_NEWS_PLAYLIST_ENGINE_SPEC.md Constitution v1.0.
 */

import { EVENT_TYPES } from '../interpreter/TimelineEvent.js';

export class PlaylistTransitionManager {
  constructor(options = {}) {
    this.currentPlaylistLabel = null;
    this.currentPlaylistTheme = null;
  }

  /**
   * Determine whether a badge transition (BADGE_OUT -> BADGE_IN) is required
   * based on consecutive playlist labels.
   * Rule 1: Same label -> Keep Badge (returns false)
   * Rule 2: Different label -> Change Badge (returns true)
   */
  shouldTransitionBadge(nextLabel, nextTheme) {
    if (this.currentPlaylistLabel === null) {
      this.currentPlaylistLabel = nextLabel;
      this.currentPlaylistTheme = nextTheme;
      return true; // Initial BADGE_IN
    }

    const labelChanged = this.currentPlaylistLabel !== nextLabel;
    if (labelChanged) {
      this.currentPlaylistLabel = nextLabel;
      this.currentPlaylistTheme = nextTheme;
      return true;
    }

    return false;
  }

  /**
   * Determine whether a LOGO_SEPARATOR should be rendered between elements.
   * Rule 3: Render ONLY between consecutive news items inside the SAME playlist.
   * Never before first news, never after final news, never between different playlists.
   */
  shouldInjectSeparator(currentIndex, totalItemsInPlaylist, isSamePlaylist) {
    if (!isSamePlaylist) return false;
    if (currentIndex <= 0) return false;
    if (currentIndex >= totalItemsInPlaylist) return false;
    return true;
  }

  /**
   * Verify Rule 4: PLAYLIST_END occurs only after BADGE_OUT is complete.
   */
  validatePlaylistEndSequence(eventSequence) {
    if (!Array.isArray(eventSequence) || eventSequence.length === 0) return false;
    const lastEvent = eventSequence[eventSequence.length - 1];
    const secondLastEvent = eventSequence.length > 1 ? eventSequence[eventSequence.length - 2] : null;

    if (lastEvent.type !== EVENT_TYPES.PLAYLIST_END) return false;
    if (secondLastEvent && secondLastEvent.type !== EVENT_TYPES.BADGE_OUT) return false;

    return true;
  }

  reset() {
    this.currentPlaylistLabel = null;
    this.currentPlaylistTheme = null;
  }
}
