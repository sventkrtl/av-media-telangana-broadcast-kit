/**
 * Task M2-1C Google Sheet Provider Health & Status Unit Test Suite
 * Validates state transitions (ONLINE, OFFLINE, SYNCING, ERROR), metrics tracking, error recovery, & getStatus() API.
 */

import { GoogleSheetProviderStatus } from '../modules/secondary-playlist/services/index.js';
import { PlaylistModel } from '../modules/secondary-playlist/playlist-engine.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

export function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task M2-1C Google Sheet Provider Status Tests');
  console.log('====================================================');

  const statusMonitor = new GoogleSheetProviderStatus({
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/test/pub?output=csv',
    pollInterval: 30000
  });

  // Test 1: Initial State Inspection
  let status = statusMonitor.getStatus();
  assert(status.status === 'OFFLINE', 'Initial provider state is OFFLINE');
  assert(status.datasetVersion === 0, 'Initial dataset version is 0');
  assert(status.lastSync === null, 'Initial lastSync is null');
  assert(status.csvUrl.includes('pub?output=csv'), 'CSV URL tracked correctly');

  // Test 2: Syncing & Successful Sync Execution
  statusMonitor.recordSyncStart();
  assert(statusMonitor.getStatus().status === 'SYNCING', 'State transitions to SYNCING on sync start');

  const testPlaylists = [
    new PlaylistModel({ label: 'జగిత్యాల', theme: 'district', items: ['వార్త 1', 'వార్త 2'] }),
    new PlaylistModel({ label: 'క్రీడలు', theme: 'sports', items: ['క్రీడా వార్త 1'] })
  ];

  statusMonitor.recordSyncSuccess(testPlaylists);
  status = statusMonitor.getStatus();

  assert(status.status === 'ONLINE', 'Successful sync transitions state to ONLINE');
  assert(status.datasetVersion === 1, 'Dataset version incremented to 1');
  assert(status.playlistCount === 2, 'Playlist count correctly tracked as 2');
  assert(status.newsCount === 3, 'Total news count correctly tracked as 3');
  assert(status.lastSync !== null, 'lastSync timestamp updated to ISO string');
  assert(status.lastError === null, 'lastError cleared to null on successful sync');

  // Test 3: Failure Recording & Network Loss
  statusMonitor.recordSyncFailure('HTTP 500 Server Error');
  status = statusMonitor.getStatus();
  assert(status.status === 'ERROR', 'Single failure transitions state to ERROR');
  assert(status.failureCount === 1, 'Failure count is 1');
  assert(status.lastError === 'HTTP 500 Server Error', 'lastError records diagnostic message');

  // Test 4: Consecutive Failures Transition to OFFLINE
  statusMonitor.recordSyncFailure('HTTP 503 Service Unavailable');
  statusMonitor.recordSyncFailure('Network Timeout');
  status = statusMonitor.getStatus();
  assert(status.status === 'OFFLINE', '3 consecutive failures transition state to OFFLINE');
  assert(status.failureCount === 3, 'Failure count is 3');

  // Test 5: Recovery After Error
  statusMonitor.recordSyncSuccess(testPlaylists);
  status = statusMonitor.getStatus();
  assert(status.status === 'ONLINE', 'Recovery sync transitions state back to ONLINE');
  assert(status.failureCount === 0, 'Recovery sync resets failure count to 0');
  assert(status.datasetVersion === 2, 'Dataset version incremented to 2');

  console.log('====================================================');
  console.log('✅ ALL TASK M2-1C PROVIDER STATUS TESTS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('google-sheet-provider-status.test.js')) {
  runTests();
}
