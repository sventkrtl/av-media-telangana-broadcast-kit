/**
 * Task 3C Timeline Playback Controller Test Suite
 * Validates play(), pause(), resume(), stop(), stepNext(), event callbacks, & sequence orchestration.
 */

import { TimelinePlaybackController } from '../modules/secondary-playlist/playback/index.js';
import { TimelineEvent, EVENT_TYPES } from '../modules/secondary-playlist/interpreter/index.js';
import { BadgeMotionEngine, CrawlMotionEngine } from '../modules/secondary-playlist/motion/index.js';
import { StaticRenderer } from '../modules/secondary-playlist/renderer/index.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

class MockElement {
  constructor() {
    this.style = { transform: '', opacity: '', willChange: '', transition: '' };
    this.offsetWidth = 500;
  }
}

export async function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task 3C Timeline Playback Controller Tests');
  console.log('====================================================');

  const badgeEngine = new BadgeMotionEngine();
  const crawlEngine = new CrawlMotionEngine({ pixelsPerSecond: 500 }); // Fast for test
  const renderer = new StaticRenderer();

  const controller = new TimelinePlaybackController({
    badgeMotionEngine: badgeEngine,
    crawlMotionEngine: crawlEngine,
    staticRenderer: renderer
  });

  // Test 1: Empty Timeline Playback
  const emptyRes = await controller.play();
  assert(emptyRes === 'TIMELINE_EMPTY', 'Empty timeline returns TIMELINE_EMPTY');

  // Test 2: Sequence Orchestration & Callback Tracking
  const sampleTimeline = [
    new TimelineEvent({ type: EVENT_TYPES.BADGE_IN, label: 'జగిత్యాల', theme: 'district' }),
    new TimelineEvent({ type: EVENT_TYPES.BADGE_HOLD, label: 'జగిత్యాల', theme: 'district' }),
    new TimelineEvent({ type: EVENT_TYPES.NEWS_START, label: 'జగిత్యాల', theme: 'district', newsIndex: 0, payload: { newsContent: 'వార్త 1' } }),
    new TimelineEvent({ type: EVENT_TYPES.NEWS_END, label: 'జగిత్యాల', theme: 'district', newsIndex: 0, payload: { newsContent: 'వార్త 1' } }),
    new TimelineEvent({ type: EVENT_TYPES.BADGE_OUT, label: 'జగిత్యాల', theme: 'district' }),
    new TimelineEvent({ type: EVENT_TYPES.PLAYLIST_END, label: 'జగిత్యాల', theme: 'district' })
  ];

  controller.setTimeline(sampleTimeline);

  let eventsStarted = [];
  let eventsEnded = [];
  let playlistCompleted = false;

  controller.onEventStart((evt, idx) => eventsStarted.push({ type: evt.type, idx }));
  controller.onEventEnd((evt, idx) => eventsEnded.push({ type: evt.type, idx }));
  controller.onPlaylistChange((evt) => { playlistCompleted = true; });

  const mockBadge = new MockElement();
  const mockNews = new MockElement();

  const playPromise = controller.play({
    badgeElement: mockBadge,
    newsElement: mockNews
  });

  const playRes = await playPromise;
  assert(playRes === 'TIMELINE_COMPLETED', 'Timeline completes sequential execution');
  assert(eventsStarted.length === 6, 'All 6 timeline events emitted start callback');
  assert(eventsEnded.length === 6, 'All 6 timeline events emitted end callback');
  assert(playlistCompleted === true, 'Playlist completion callback triggered on PLAYLIST_END');

  // Test 3: Manual Stepping (stepNext)
  controller.setTimeline(sampleTimeline);
  assert(controller.currentIndex === 0, 'Reset timeline starts at index 0');
  const nextEvt = controller.stepNext();
  assert(nextEvt.type === EVENT_TYPES.BADGE_HOLD, 'stepNext advances to index 1 (BADGE_HOLD)');
  assert(controller.currentIndex === 1, 'Current index updated to 1');

  // Test 4: Pause / Resume / Stop Controls
  controller.setTimeline(sampleTimeline);
  controller.pause();
  assert(controller.playbackState === 'IDLE' || controller.isPaused === false, 'Pause before play remains idle');

  controller.play({ badgeElement: mockBadge, newsElement: mockNews });
  controller.pause();
  assert(controller.isPaused === true, 'Pause sets isPaused to true');
  assert(controller.playbackState === 'PAUSED', 'Playback state is PAUSED');

  controller.resume();
  assert(controller.isPaused === false, 'Resume sets isPaused to false');
  assert(controller.playbackState === 'PLAYING', 'Playback state resumes to PLAYING');

  controller.stop();
  assert(controller.isPlaying === false, 'Stop halts playback execution');
  assert(controller.currentIndex === 0, 'Stop resets current index to 0');
  assert(controller.playbackState === 'STOPPED', 'Playback state is STOPPED');

  console.log('====================================================');
  console.log('✅ ALL TASK 3C PLAYBACK CONTROLLER TESTS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('timeline-playback-controller.test.js')) {
  runTests();
}
