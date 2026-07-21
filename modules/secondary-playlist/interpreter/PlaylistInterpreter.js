/**
 * AV Media Telangana - Playlist Interpreter
 * Converts Playlist data models into a standardized Rendering Timeline (TimelineEvent[]).
 * Pure JavaScript timeline generation engine without any rendering, DOM or CSS logic.
 */

import { TimelineEvent, EVENT_TYPES } from './TimelineEvent.js';
import { PlaylistModel } from '../playlist-engine.js';

export class PlaylistInterpreter {
  constructor(options = {}) {
    this.separatorAsset = options.separatorAsset || 'AV_MEDIA_ROUND_LOGO';
  }

  /**
   * Interpret a single PlaylistModel into a timeline event sequence.
   * @param {PlaylistModel} playlist 
   * @returns {TimelineEvent[]}
   */
  interpretPlaylist(playlist) {
    if (!playlist || !(playlist instanceof PlaylistModel) || !playlist.isValid()) {
      return [];
    }

    const events = [];
    const playlistId = playlist.id;
    const label = playlist.label;
    const theme = playlist.theme;
    const timestamp = Date.now();

    // 1. BADGE_IN
    events.push(new TimelineEvent({
      type: EVENT_TYPES.BADGE_IN,
      playlistId,
      label,
      theme,
      newsIndex: -1,
      payload: {},
      timestamp
    }));

    // 2. BADGE_HOLD
    events.push(new TimelineEvent({
      type: EVENT_TYPES.BADGE_HOLD,
      playlistId,
      label,
      theme,
      newsIndex: -1,
      payload: {},
      timestamp
    }));

    // 3. News Items & Automatic Separators
    playlist.items.forEach((newsContent, newsIndex) => {
      // NEWS_START
      events.push(new TimelineEvent({
        type: EVENT_TYPES.NEWS_START,
        playlistId,
        label,
        theme,
        newsIndex,
        payload: { newsContent },
        timestamp
      }));

      // NEWS_END
      events.push(new TimelineEvent({
        type: EVENT_TYPES.NEWS_END,
        playlistId,
        label,
        theme,
        newsIndex,
        payload: { newsContent },
        timestamp
      }));

      // Inject LOGO_SEPARATOR between consecutive news items inside the same playlist
      if (newsIndex < playlist.items.length - 1) {
        events.push(new TimelineEvent({
          type: EVENT_TYPES.LOGO_SEPARATOR,
          playlistId,
          label,
          theme,
          newsIndex: -1,
          payload: { asset: this.separatorAsset },
          timestamp
        }));
      }
    });

    // 4. BADGE_OUT
    events.push(new TimelineEvent({
      type: EVENT_TYPES.BADGE_OUT,
      playlistId,
      label,
      theme,
      newsIndex: -1,
      payload: {},
      timestamp
    }));

    // 5. PLAYLIST_END
    events.push(new TimelineEvent({
      type: EVENT_TYPES.PLAYLIST_END,
      playlistId,
      label,
      theme,
      newsIndex: -1,
      payload: {},
      timestamp
    }));

    return events;
  }

  /**
   * Interpret multiple PlaylistModels into a complete multi-playlist timeline.
   * @param {PlaylistModel[]} playlists 
   * @returns {TimelineEvent[]}
   */
  interpretPlaylists(playlists) {
    if (!Array.isArray(playlists) || playlists.length === 0) {
      return [];
    }

    const fullTimeline = [];
    playlists.forEach(pl => {
      const playlistInstance = pl instanceof PlaylistModel ? pl : new PlaylistModel(pl);
      const timeline = this.interpretPlaylist(playlistInstance);
      fullTimeline.push(...timeline);
    });

    return fullTimeline;
  }
}
