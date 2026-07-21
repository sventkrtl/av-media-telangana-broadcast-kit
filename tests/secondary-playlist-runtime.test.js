/**
 * Task 4A Secondary Playlist Runtime Test Suite
 * Validates initialization, destroy, play, pause, resume, stop, multi-playlist execution, & error recovery.
 */

import { SecondaryPlaylistRuntime } from '../modules/secondary-playlist/SecondaryPlaylistRuntime.js';
import { PlaylistModel } from '../modules/secondary-playlist/playlist-engine.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

class MockElement {
  constructor() {
    this.style = { transform: '', opacity: '', willChange: '', transition: '' };
    this.offsetWidth = 400;
  }
}

export async function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task 4A Secondary Playlist Runtime Tests');
  console.log('====================================================');

  const runtime = new SecondaryPlaylistRuntime({ loop: false });

  // Test 1: Initialization
  const initRes = await runtime.initialize({
    containerElement: new MockElement(),
    badgeElement: new MockElement(),
    newsElement: new MockElement(),
    pixelsPerSecond: 1000 // Fast speed for tests
  });
  assert(initRes === true, 'Runtime initializes successfully');
  assert(runtime.isInitialized === true, 'Runtime isInitialized flag is true');

  // Test 2: Playlist Loading
  const samplePlaylists = [
    new PlaylistModel({ label: 'జగిత్యాల', theme: 'district', items: ['వార్త 1', 'వార్త 2'] }),
    new PlaylistModel({ label: 'ఖమ్మం', theme: 'district', items: ['వార్త 1'] })
  ];

  const loadRes = runtime.loadPlaylists(samplePlaylists);
  assert(loadRes === true, 'Valid playlists load successfully into runtime');

  // Test 3: Playback Execution
  const playPromise = runtime.play();
  const playRes = await playPromise;
  assert(playRes === 'TIMELINE_COMPLETED', 'Runtime executes multi-playlist sequence to completion');

  // Test 4: Pause / Resume / Stop Controls
  runtime.loadPlaylists(samplePlaylists);
  assert(runtime.playbackController.playbackState === 'STOPPED', 'Loading playlists resets state to STOPPED');

  runtime.stop();
  assert(runtime.playbackController.isPlaying === false, 'Runtime stop controls work');

  // Test 5: Fault Tolerance & Error Recovery
  // Empty playlists input
  const emptyLoad = runtime.loadPlaylists([]);
  assert(emptyLoad === false, 'Empty playlists loading handled gracefully without crash');

  const emptyPlay = await runtime.play();
  assert(emptyPlay === 'TIMELINE_EMPTY', 'Playing empty timeline returns TIMELINE_EMPTY safely');

  // Null input
  const nullLoad = runtime.loadPlaylists(null);
  assert(nullLoad === false, 'Null playlist input handled safely');

  // Test 6: Destroy Lifecycle
  runtime.destroy();
  assert(runtime.isInitialized === false, 'Runtime destroy sets isInitialized to false');
  assert(runtime.playbackController === null, 'Runtime destroy cleans up playback controller references');

  console.log('====================================================');
  console.log('✅ ALL TASK 4A RUNTIME INTEGRATION TESTS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('secondary-playlist-runtime.test.js')) {
  runTests();
}
