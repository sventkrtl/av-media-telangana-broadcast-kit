/**
 * Task M2-1B Google Sheet Refresh Service Unit Test Suite
 * Validates polling interval configuration, diff change detection, network error resilience, & safe boundary hot reloads.
 */

import { GoogleSheetRefreshService } from '../modules/secondary-playlist/services/index.js';
import { GoogleSheetProvider } from '../modules/secondary-playlist/data-providers/index.js';
import { SecondaryPlaylistRuntime } from '../modules/secondary-playlist/SecondaryPlaylistRuntime.js';
import { PlaylistModel } from '../modules/secondary-playlist/playlist-engine.js';
import { EVENT_TYPES } from '../modules/secondary-playlist/interpreter/index.js';

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
  console.log('🧪 Running Task M2-1B Google Sheet Refresh Service Tests');
  console.log('====================================================');

  const provider = new GoogleSheetProvider();
  await provider.initialize();

  const runtime = new SecondaryPlaylistRuntime({ loop: false });
  await runtime.initialize({
    containerElement: new MockElement(),
    badgeElement: new MockElement(),
    newsElement: new MockElement(),
    pixelsPerSecond: 100000
  });

  const service = new GoogleSheetRefreshService({
    provider,
    runtime,
    intervalMs: 30000
  });

  // Test 1: Configurable Polling Intervals (15s, 30s, 60s, Manual)
  assert(service.intervalMs === 30000, 'Default polling interval is 30,000 ms (30s)');
  
  service.setIntervalMs(15000);
  assert(service.intervalMs === 15000, 'Polling interval updated to 15,000 ms (15s)');

  service.setIntervalMs(60000);
  assert(service.intervalMs === 60000, 'Polling interval updated to 60,000 ms (60s)');

  service.setIntervalMs(0);
  assert(service.intervalMs === 0, 'Polling interval updated to 0 ms (Manual mode)');

  // Test 2: Diff Change Detection (No changes vs Changed)
  const basePlaylists = [
    new PlaylistModel({ label: 'జగిత్యాల', theme: 'district', items: ['వార్త 1'] })
  ];

  const samePlaylists = [
    new PlaylistModel({ label: 'జగిత్యాల', theme: 'district', items: ['వార్త 1'] })
  ];

  const changedPlaylists = [
    new PlaylistModel({ label: 'జగిత్యాల', theme: 'district', items: ['వార్త 1', 'కొత్త వార్త 2'] })
  ];

  assert(service.hasChanged(samePlaylists, basePlaylists) === false, 'Diff detector: Identical playlists return hasChanged === false');
  assert(service.hasChanged(changedPlaylists, basePlaylists) === true, 'Diff detector: Added news item returns hasChanged === true');

  // Test 3: Network Error Resilience (Network Disconnected / Error)
  let errorTrapped = false;
  service.onError(() => { errorTrapped = true; });

  provider.csvText = null;
  provider.url = '';
  const invalidResult = await service.checkForUpdates();
  assert(invalidResult === false, 'Invalid/missing URL poll returns false without throwing exception');
  assert(errorTrapped === true, 'Error callback notified of missing feed input safely');

  // Test 4: Safe Hot Reload Execution at Playlist Boundary
  const initialCsv = `Label,Theme,News
జగిత్యాల,district,ప్రారంభ వార్త 1`;

  const updatedCsv = `Label,Theme,News
జగిత్యాల,district,తాజా అప్‌డేట్ వార్త 1
ఖమ్మం,district,ఖమ్మం వార్త 1`;

  // Initial load
  await provider.load({ csvText: initialCsv });
  await service.checkForUpdates();

  assert(runtime.playlistEngine.playlists.length === 1, 'Initial feed loaded 1 playlist into runtime');

  // Update provider CSV
  await provider.load({ csvText: updatedCsv });
  await service.checkForUpdates(); // Schedules safe hot reload

  assert(service.isReloadPending === true, 'Change detected: Hot reload scheduled pending PLAYLIST_END boundary');

  // Simulate boundary event PLAYLIST_END trigger
  runtime.playbackController.notifyEventEnd({ type: EVENT_TYPES.PLAYLIST_END, label: 'జగిత్యాల' });

  assert(service.isReloadPending === false, 'Safe boundary reached: Pending reload executed');
  assert(runtime.playlistEngine.playlists.length === 2, 'Runtime successfully updated to 2 playlists at safe boundary');

  console.log('====================================================');
  console.log('✅ ALL TASK M2-1B REFRESH SERVICE TESTS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('google-sheet-refresh-service.test.js')) {
  runTests();
}
