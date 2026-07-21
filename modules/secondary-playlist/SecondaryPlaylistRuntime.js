/**
 * AV Media Telangana - Secondary Playlist OBS Runtime (Task 4A Integration)
 * Unified Master Orchestrator linking PlaylistEngine, Interpreter, PlaybackController, BadgeMotion, CrawlMotion, & StaticRenderer.
 * Strictly adheres to SECONDARY_NEWS_PLAYLIST_ENGINE_SPEC.md Constitution v1.0.
 */

import { SecondaryNewsPlaylistEngine, PlaylistModel } from './playlist-engine.js';
import { PlaylistInterpreter } from './interpreter/index.js';
import { TimelinePlaybackController, PlaylistTransitionManager } from './playback/index.js';
import { BadgeMotionEngine, CrawlMotionEngine } from './motion/index.js';
import { StaticRenderer } from './renderer/index.js';

export class SecondaryPlaylistRuntime {
  constructor(options = {}) {
    this.options = options;
    this.containerElement = options.containerElement || null;
    this.badgeElement = options.badgeElement || null;
    this.newsElement = options.newsElement || null;

    this.playlistEngine = null;
    this.interpreter = null;
    this.playbackController = null;
    this.badgeMotionEngine = null;
    this.crawlMotionEngine = null;
    this.staticRenderer = null;
    this.transitionManager = null;

    this.isInitialized = false;
    this.isLooping = options.loop !== false; // Default infinite loop
  }

  /**
   * Initialize all core engines and wire playback orchestration.
   */
  async initialize(options = {}) {
    try {
      if (options.containerElement) this.containerElement = options.containerElement;
      if (options.badgeElement) this.badgeElement = options.badgeElement;
      if (options.newsElement) this.newsElement = options.newsElement;

      this.playlistEngine = new SecondaryNewsPlaylistEngine();
      this.interpreter = new PlaylistInterpreter();
      this.badgeMotionEngine = new BadgeMotionEngine();
      this.crawlMotionEngine = new CrawlMotionEngine({
        pixelsPerSecond: options.pixelsPerSecond || 120
      });
      this.staticRenderer = new StaticRenderer({
        logoSrc: options.logoSrc || '/assets/logos/logo-round.png'
      });
      this.transitionManager = new PlaylistTransitionManager();

      this.playbackController = new TimelinePlaybackController({
        badgeMotionEngine: this.badgeMotionEngine,
        crawlMotionEngine: this.crawlMotionEngine,
        staticRenderer: this.staticRenderer
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[SecondaryPlaylistRuntime] Initialization error:', error);
      return false;
    }
  }

  /**
   * Load and validate playlists into the engine.
   */
  loadPlaylists(playlistsInput) {
    if (!this.isInitialized) return false;

    try {
      this.stop();
      this.playlistEngine = new SecondaryNewsPlaylistEngine();

      if (!Array.isArray(playlistsInput) || playlistsInput.length === 0) {
        if (this.playbackController) this.playbackController.setTimeline([]);
        return false;
      }

      playlistsInput.forEach(pl => {
        if (pl) this.playlistEngine.addPlaylist(pl);
      });

      const validation = SecondaryNewsPlaylistEngine.validate(this.playlistEngine.playlists);
      if (!validation.isValid) {
        console.warn('[SecondaryPlaylistRuntime] Playlist validation warnings:', validation.errors);
      }

      const timeline = this.interpreter.interpretPlaylists(this.playlistEngine.playlists);
      this.playbackController.setTimeline(timeline);

      return timeline.length > 0;
    } catch (error) {
      console.error('[SecondaryPlaylistRuntime] Load playlists error:', error);
      if (this.playbackController) this.playbackController.setTimeline([]);
      return false;
    }
  }

  /**
   * Play timeline loop with graceful error recovery.
   */
  async play() {
    if (!this.isInitialized || !this.playbackController) return 'NOT_INITIALIZED';

    try {
      let result = await this.playbackController.play({
        containerElement: this.containerElement,
        badgeElement: this.badgeElement,
        newsElement: this.newsElement
      });

      // Infinite loop playback if enabled
      if (this.isLooping && result === 'TIMELINE_COMPLETED' && this.playlistEngine && this.playlistEngine.playlists.length > 0) {
        this.playbackController.currentIndex = 0;
        return this.play();
      }

      return result;
    } catch (error) {
      console.error('[SecondaryPlaylistRuntime] Runtime playback error recovered:', error);
      return 'RECOVERED_FROM_ERROR';
    }
  }

  pause() {
    if (this.playbackController) this.playbackController.pause();
  }

  resume() {
    if (this.playbackController) this.playbackController.resume();
  }

  stop() {
    if (this.playbackController) this.playbackController.stop();
    if (this.transitionManager) this.transitionManager.reset();
  }

  destroy() {
    this.stop();
    this.containerElement = null;
    this.badgeElement = null;
    this.newsElement = null;
    this.playlistEngine = null;
    this.interpreter = null;
    this.playbackController = null;
    this.badgeMotionEngine = null;
    this.crawlMotionEngine = null;
    this.staticRenderer = null;
    this.transitionManager = null;
    this.isInitialized = false;
  }
}
