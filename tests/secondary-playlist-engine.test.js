/**
 * Unit Validation Suite - Secondary News Playlist Engine (Task 1 Foundation)
 * Verifies empty playlists, empty labels, empty news, single news, multiple news, loop behavior, & automatic separator injection.
 */

import { SecondaryNewsPlaylistEngine, PlaylistModel } from '../modules/secondary-playlist/playlist-engine.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

export function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task 1 Foundation Unit Validation Suite');
  console.log('====================================================');

  // Test 1: Empty Playlist Validation
  const emptyVal = SecondaryNewsPlaylistEngine.validate([]);
  assert(emptyVal.isValid === false, 'Empty playlists collection fails validation');
  assert(emptyVal.errors.length > 0, 'Empty playlists collection returns error message');

  // Test 2: Empty Label & Empty News Validation
  const invalidPlaylists = [
    { label: '', theme: 'district', items: ['News 1'] },
    { label: 'జగిత్యాల', theme: 'district', items: [] }
  ];
  const invalidVal = SecondaryNewsPlaylistEngine.validate(invalidPlaylists);
  assert(invalidVal.isValid === false, 'Empty label or empty news items fail validation');
  assert(invalidVal.errors.length === 2, 'Validation catches both empty label and empty news items');

  // Test 3: Valid Playlists (Single & Multiple News Items)
  const validPlaylists = [
    new PlaylistModel({
      label: 'జగిత్యాల',
      theme: 'district',
      items: ['వార్త 1 - జగిత్యాల కలెక్టరేట్ ప్రారంభం']
    }),
    new PlaylistModel({
      label: 'క్రీడలు',
      theme: 'sports',
      items: [
        'వార్త 1 - ఇండియా వర్సెస్ ఆస్ట్రేలియా టెస్ట్ మ్యాచ్',
        'వార్త 2 - ఐపీఎల్ వేలం వివరాలు విడుదల',
        'వార్త 3 - హైదరాబాద్‌లో జాతీయ బ్యాడ్మింటన్ పోటీలు'
      ]
    })
  ];
  const validVal = SecondaryNewsPlaylistEngine.validate(validPlaylists);
  assert(validVal.isValid === true, 'Valid playlists pass validation');

  // Test 4: Engine Instantiation & Queue Navigation
  const engine = new SecondaryNewsPlaylistEngine(validPlaylists);
  assert(engine.getCurrentPlaylist().label === 'జగిత్యాల', 'Initial playlist is Jagityal');
  assert(engine.getCurrentNews() === 'వార్త 1 - జగిత్యాల కలెక్టరేట్ ప్రారంభం', 'Initial news is Jagityal News 1');

  // Test 5: Loop Playlist Behavior
  const nextPl = engine.nextPlaylist();
  assert(nextPl.label === 'క్రీడలు', 'nextPlaylist advances to Sports');
  const loopedPl = engine.nextPlaylist();
  assert(loopedPl.label === 'జగిత్యాల', 'nextPlaylist loops back to Jagityal infinitely');

  // Test 6: Loop News Behavior Inside Playlist
  engine.nextPlaylist(); // Go to Sports
  assert(engine.getCurrentNews().includes('ఇండియా వర్సెస్'), 'Sports News 1 selected');
  engine.nextNews(); // Sports News 2
  engine.nextNews(); // Sports News 3
  const loopedNews = engine.nextNews(); // Loop back to Sports News 1
  assert(loopedNews.includes('ఇండియా వర్సెస్'), 'nextNews loops back to News 1 infinitely inside playlist');

  // Test 7: Automatic Separator Injection (No separator before 1st, after last, or between playlists)
  const sportsSeq = engine.getSequenceWithSeparators(validPlaylists[1]);
  assert(sportsSeq.length === 5, '3 News items generate 5 sequence elements (News1, Logo, News2, Logo, News3)');
  assert(sportsSeq[0].type === 'NEWS', 'Sequence element 0 is NEWS (No separator before 1st)');
  assert(sportsSeq[1].type === 'SEPARATOR', 'Sequence element 1 is LOGO separator');
  assert(sportsSeq[2].type === 'NEWS', 'Sequence element 2 is NEWS');
  assert(sportsSeq[3].type === 'SEPARATOR', 'Sequence element 3 is LOGO separator');
  assert(sportsSeq[4].type === 'NEWS', 'Sequence element 4 is NEWS (No separator after last)');

  const singleSeq = engine.getSequenceWithSeparators(validPlaylists[0]);
  assert(singleSeq.length === 1, 'Single news item generates exactly 1 sequence element (No separators)');
  assert(singleSeq[0].type === 'NEWS', 'Single news item element is NEWS');

  console.log('====================================================');
  console.log('✅ ALL TASK 1 FOUNDATION VALIDATIONS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('secondary-playlist-engine.test.js')) {
  runTests();
}
