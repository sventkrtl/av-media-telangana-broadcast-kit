/**
 * Task 2A Playlist Interpreter Test Suite
 * Validates timeline generation, event ordering, separator injection, & single/multiple playlist interpretation.
 */

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
  console.log('🧪 Running Task 2A Playlist Interpreter Unit Tests');
  console.log('====================================================');

  const interpreter = new PlaylistInterpreter();

  // Test 1: Empty Playlist Interpretation
  const emptyTimeline = interpreter.interpretPlaylist(new PlaylistModel());
  assert(emptyTimeline.length === 0, 'Empty playlist returns empty timeline array');

  const nullTimeline = interpreter.interpretPlaylist(null);
  assert(nullTimeline.length === 0, 'Null playlist returns empty timeline array');

  // Test 2: Single News Item Timeline Sequence
  const singlePl = new PlaylistModel({
    label: 'జగిత్యాల',
    theme: 'district',
    items: ['వార్త 1 - కలెక్టరేట్ ముట్టడి']
  });

  const singleTimeline = interpreter.interpretPlaylist(singlePl);
  assert(singleTimeline.length === 6, 'Single news playlist generates exactly 6 timeline events');
  assert(singleTimeline[0].type === EVENT_TYPES.BADGE_IN, 'Event 0 is BADGE_IN');
  assert(singleTimeline[1].type === EVENT_TYPES.BADGE_HOLD, 'Event 1 is BADGE_HOLD');
  assert(singleTimeline[2].type === EVENT_TYPES.NEWS_START, 'Event 2 is NEWS_START');
  assert(singleTimeline[3].type === EVENT_TYPES.NEWS_END, 'Event 3 is NEWS_END');
  assert(singleTimeline[4].type === EVENT_TYPES.BADGE_OUT, 'Event 4 is BADGE_OUT');
  assert(singleTimeline[5].type === EVENT_TYPES.PLAYLIST_END, 'Event 5 is PLAYLIST_END');

  // Test 3: Multiple News Items Timeline Sequence & Separator Injection
  const multiPl = new PlaylistModel({
    label: 'క్రీడలు',
    theme: 'sports',
    items: ['వార్త 1', 'వార్త 2', 'వార్త 3']
  });

  const multiTimeline = interpreter.interpretPlaylist(multiPl);
  // Expected sequence: BADGE_IN, BADGE_HOLD, NEWS_START(0), NEWS_END(0), LOGO_SEPARATOR, NEWS_START(1), NEWS_END(1), LOGO_SEPARATOR, NEWS_START(2), NEWS_END(2), BADGE_OUT, PLAYLIST_END = 12 events
  assert(multiTimeline.length === 12, '3 News playlist generates 12 timeline events');

  assert(multiTimeline[0].type === EVENT_TYPES.BADGE_IN, 'Event 0 is BADGE_IN');
  assert(multiTimeline[1].type === EVENT_TYPES.BADGE_HOLD, 'Event 1 is BADGE_HOLD');

  // News 1
  assert(multiTimeline[2].type === EVENT_TYPES.NEWS_START && multiTimeline[2].newsIndex === 0, 'Event 2 is NEWS_START(0)');
  assert(multiTimeline[3].type === EVENT_TYPES.NEWS_END && multiTimeline[3].newsIndex === 0, 'Event 3 is NEWS_END(0)');

  // Separator 1
  assert(multiTimeline[4].type === EVENT_TYPES.LOGO_SEPARATOR, 'Event 4 is LOGO_SEPARATOR after News 1');

  // News 2
  assert(multiTimeline[5].type === EVENT_TYPES.NEWS_START && multiTimeline[5].newsIndex === 1, 'Event 5 is NEWS_START(1)');
  assert(multiTimeline[6].type === EVENT_TYPES.NEWS_END && multiTimeline[6].newsIndex === 1, 'Event 6 is NEWS_END(1)');

  // Separator 2
  assert(multiTimeline[7].type === EVENT_TYPES.LOGO_SEPARATOR, 'Event 7 is LOGO_SEPARATOR after News 2');

  // News 3 (No separator after last news)
  assert(multiTimeline[8].type === EVENT_TYPES.NEWS_START && multiTimeline[8].newsIndex === 2, 'Event 8 is NEWS_START(2)');
  assert(multiTimeline[9].type === EVENT_TYPES.NEWS_END && multiTimeline[9].newsIndex === 2, 'Event 9 is NEWS_END(2)');

  assert(multiTimeline[10].type === EVENT_TYPES.BADGE_OUT, 'Event 10 is BADGE_OUT');
  assert(multiTimeline[11].type === EVENT_TYPES.PLAYLIST_END, 'Event 11 is PLAYLIST_END');

  // Test 4: Multiple Playlists Interpretation
  const playlists = [singlePl, multiPl];
  const fullTimeline = interpreter.interpretPlaylists(playlists);
  assert(fullTimeline.length === 6 + 12, 'Multiple playlists generate combined sequential timeline (18 events)');
  assert(fullTimeline[0].label === 'జగిత్యాల', 'First playlist segment label is Jagityal');
  assert(fullTimeline[6].label === 'క్రీడలు', 'Second playlist segment label is Sports');

  // Test 5: Verify No Separator Injected Between Playlists
  assert(fullTimeline[5].type === EVENT_TYPES.PLAYLIST_END, 'Event before next playlist is PLAYLIST_END');
  assert(fullTimeline[6].type === EVENT_TYPES.BADGE_IN, 'Event at start of next playlist is BADGE_IN (No separator between playlists)');

  console.log('====================================================');
  console.log('✅ ALL TASK 2A INTERPRETER TESTS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('playlist-interpreter.test.js')) {
  runTests();
}
