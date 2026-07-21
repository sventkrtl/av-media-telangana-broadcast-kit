/**
 * Task 3D Playlist Transition Behavior Test Suite
 * Validates Rules 1-5: Same playlist keep badge, Different playlist change badge, Logo placement, & PLAYLIST_END ordering.
 */

import { PlaylistTransitionManager } from '../modules/secondary-playlist/playback/index.js';
import { PlaylistInterpreter, EVENT_TYPES } from '../modules/secondary-playlist/interpreter/index.js';
import { PlaylistModel } from '../modules/secondary-playlist/playlist-engine.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

export function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task 3D Playlist Transition Behavior Tests');
  console.log('====================================================');

  const transitionMgr = new PlaylistTransitionManager();

  // Test 1: Rule 1 - Same Playlist Label keeps badge (shouldTransitionBadge returns false)
  transitionMgr.reset();
  assert(transitionMgr.shouldTransitionBadge('జగిత్యాల', 'district') === true, 'Initial playlist triggers BADGE_IN');
  assert(transitionMgr.shouldTransitionBadge('జగిత్యాల', 'district') === false, 'Same playlist item maintains badge without BADGE_OUT/IN');
  assert(transitionMgr.shouldTransitionBadge('జగిత్యాల', 'district') === false, 'Consecutive news item 3 maintains badge without BADGE_OUT/IN');

  // Test 2: Rule 2 - Playlist Label Change triggers badge transition (shouldTransitionBadge returns true)
  assert(transitionMgr.shouldTransitionBadge('ఖమ్మం', 'district') === true, 'Changing playlist label triggers BADGE_OUT -> BADGE_IN transition');
  assert(transitionMgr.shouldTransitionBadge('ఖమ్మం', 'district') === false, 'Subsequent item in Khammam maintains badge');

  // Test 3: Rule 3 - Logo Separator Placement Verification
  // Between consecutive news items inside SAME playlist (Index 1 of 3)
  assert(transitionMgr.shouldInjectSeparator(1, 3, true) === true, 'Logo separator injected between news 1 and news 2 inside same playlist');
  // Before 1st news item
  assert(transitionMgr.shouldInjectSeparator(0, 3, true) === false, 'No separator before first news item');
  // After last news item
  assert(transitionMgr.shouldInjectSeparator(3, 3, true) === false, 'No separator after last news item');
  // Between different playlists
  assert(transitionMgr.shouldInjectSeparator(1, 3, false) === false, 'No separator between different playlists');

  // Test 4: Rule 4 - PLAYLIST_END ordering verification
  const interpreter = new PlaylistInterpreter();
  const samplePl = new PlaylistModel({ label: 'క్రీడలు', theme: 'sports', items: ['వార్త 1', 'వార్త 2'] });
  const timeline = interpreter.interpretPlaylist(samplePl);

  const isValidSequence = transitionMgr.validatePlaylistEndSequence(timeline);
  assert(isValidSequence === true, 'PLAYLIST_END occurs only after BADGE_OUT has completely finished');

  // Test 5: Verify Multi-Playlist Timeline Event Sequence (Rules 1-4 combined)
  const pl1 = new PlaylistModel({ label: 'జగిత్యాల', theme: 'district', items: ['వార్త 1', 'వార్త 2'] });
  const pl2 = new PlaylistModel({ label: 'ఖమ్మం', theme: 'district', items: ['వార్త 1'] });
  const fullTimeline = interpreter.interpretPlaylists([pl1, pl2]);

  // Jagityal segment end event at index 7 is BADGE_OUT, index 8 is PLAYLIST_END
  assert(fullTimeline[7].type === EVENT_TYPES.BADGE_OUT && fullTimeline[7].label === 'జగిత్యాల', 'Jagityal ends with BADGE_OUT');
  assert(fullTimeline[8].type === EVENT_TYPES.PLAYLIST_END && fullTimeline[8].label === 'జగిత్యాల', 'Jagityal ends with PLAYLIST_END');

  // Khammam segment start event at index 9 is BADGE_IN
  assert(fullTimeline[9].type === EVENT_TYPES.BADGE_IN && fullTimeline[9].label === 'ఖమ్మం', 'Khammam starts with BADGE_IN');
  assert(fullTimeline[10].type === EVENT_TYPES.BADGE_HOLD && fullTimeline[10].label === 'ఖమ్మం', 'Khammam follows with BADGE_HOLD');

  console.log('====================================================');
  console.log('✅ ALL TASK 3D TRANSITION BEHAVIOR TESTS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('playlist-transition-behavior.test.js')) {
  runTests();
}
