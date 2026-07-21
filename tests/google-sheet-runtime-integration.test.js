/**
 * Task M2-1D Google Sheet Runtime Integration Unit Test Suite
 * Validates cold startup, successful startup, network unavailable startup, network recovery, hot reload, getProviderStatus(), & destroy().
 */

import { SecondaryPlaylistRuntime } from '../modules/secondary-playlist/SecondaryPlaylistRuntime.js';
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
  console.log('🧪 Running Task M2-1D Google Sheet Runtime Integration Tests');
  console.log('====================================================');

  const mockCsv = `Label,Theme,News
జగిత్యాల,district,జగిత్యాల వార్త 1
క్రీడలు,sports,క్రీడా వార్త 1`;

  // Test 1: Successful Cold Startup with Google Sheet Integration
  const runtime1 = new SecondaryPlaylistRuntime({ loop: false });
  const initRes1 = await runtime1.initialize({
    containerElement: new MockElement(),
    badgeElement: new MockElement(),
    newsElement: new MockElement(),
    csvText: mockCsv,
    autoPlay: false,
    pixelsPerSecond: 100000
  });

  assert(initRes1 === true, 'Runtime initializes with Google Sheet CSV');
  assert(runtime1.playlistEngine.playlists.length === 2, 'Runtime auto-loads 2 playlists from CSV');

  const providerStatus1 = runtime1.getProviderStatus();
  assert(providerStatus1.status === 'ONLINE', 'getProviderStatus() returns ONLINE status');
  assert(providerStatus1.playlistCount === 2, 'getProviderStatus() reports 2 playlists');
  assert(providerStatus1.newsCount === 2, 'getProviderStatus() reports 2 news items');
  assert(providerStatus1.datasetVersion === 1, 'getProviderStatus() reports datasetVersion === 1');

  runtime1.destroy();

  // Test 2: Startup with Network Unavailable / Empty URL (Cold Failure Resilience)
  const runtime2 = new SecondaryPlaylistRuntime({ loop: false });
  const initRes2 = await runtime2.initialize({
    containerElement: new MockElement(),
    badgeElement: new MockElement(),
    newsElement: new MockElement(),
    csvUrl: '', // No URL
    autoPlay: false
  });

  assert(initRes2 === true, 'Runtime initializes cleanly without crash even when network/URL unavailable');
  const providerStatus2 = runtime2.getProviderStatus();
  assert(providerStatus2.status === 'ERROR' || providerStatus2.status === 'OFFLINE', 'getProviderStatus() returns ERROR/OFFLINE');
  assert(runtime2.playlistEngine.playlists.length === 0, 'No empty playback started on cold failure');

  // Test 3: Network Recovery & Hot Reload Simulation
  const updatedCsv = `Label,Theme,News
జగిత్యాల,district,తాజా వార్త 1
ఖమ్మం,district,ఖమ్మం వార్త 1
వాతావరణం,weather,వాతావరణ నివేదిక 1`;

  // Connect valid CSV data (Network Recovery)
  await runtime2.connectGoogleSheet({ csvText: updatedCsv, autoPlay: false });
  const statusAfterRecovery = runtime2.getProviderStatus();
  assert(statusAfterRecovery.status === 'ONLINE', 'Network recovery updates status back to ONLINE');
  assert(statusAfterRecovery.datasetVersion === 1, 'Dataset version is 1 after recovery');
  assert(runtime2.playlistEngine.playlists.length === 3, 'Runtime updated to 3 playlists after recovery');

  // Test 4: Repeated Hot Reload Execution
  const repeatedCsv = `Label,Theme,News
జగిత్యాల,district,మూడో వర్షన్ వార్త 1`;

  await runtime2.googleSheetProvider.load({ csvText: repeatedCsv });
  await runtime2.googleSheetRefreshService.checkForUpdates();

  assert(runtime2.googleSheetRefreshService.isReloadPending === true, 'Repeated update schedules reload pending PLAYLIST_END');

  // Trigger safe boundary reload
  runtime2.playbackController.notifyEventEnd({ type: EVENT_TYPES.PLAYLIST_END, label: 'జగిత్యాల' });

  assert(runtime2.googleSheetRefreshService.isReloadPending === false, 'Hot reload applied at PLAYLIST_END boundary');
  assert(runtime2.getProviderStatus().datasetVersion === 2, 'Dataset version incremented to 2');

  // Test 5: Graceful Shutdown
  runtime2.destroy();
  assert(runtime2.isInitialized === false, 'Runtime destroy sets isInitialized to false');
  assert(runtime2.googleSheetRefreshService === null, 'Runtime destroy stops & clears GoogleSheetRefreshService');
  assert(runtime2.googleSheetStatus === null, 'Runtime destroy resets & clears GoogleSheetProviderStatus');

  console.log('====================================================');
  console.log('✅ ALL TASK M2-1D RUNTIME INTEGRATION TESTS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('google-sheet-runtime-integration.test.js')) {
  runTests();
}
