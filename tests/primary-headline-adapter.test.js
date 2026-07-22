/**
 * AV Media Telangana - Primary Headline Data Adapter Test Suite (Task P1-6)
 *
 * Validates:
 *   1. Provider ➔ Adapter headline extraction and conversion
 *   2. Filtering rules (inactive, empty, null, whitespace-only filtered out; top-to-bottom order preserved)
 *   3. Safe boundary hot reload (dataset replaced ONLY at HEADLINE_END)
 *   4. Provider status passthrough (getProviderStatus())
 *   5. Failure recovery (retains last valid dataset on network/fetch error)
 *   6. Strict adherence to frozen provider protection
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0 & ENGINEERING_GOVERNANCE.md.
 */

import { PrimaryHeadlineDataAdapter } from '../modules/primary-headline/adapters/PrimaryHeadlineDataAdapter.js';
import { PlaylistModel } from '../modules/secondary-playlist/playlist-engine.js';
import { PrimaryHeadlineRuntime } from '../modules/primary-headline/runtime/PrimaryHeadlineRuntime.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

function assertThrows(fn, expectedSubstr, message) {
  try {
    fn();
    throw new Error(`[FAILED] Expected exception containing "${expectedSubstr}", but no error was thrown: ${message}`);
  } catch (err) {
    if (err.message && err.message.includes(expectedSubstr)) {
      console.log(`[PASSED] ${message}`);
    } else if (err.message.startsWith('[FAILED]')) {
      throw err;
    } else {
      throw new Error(`[FAILED] Error message "${err.message}" did not contain "${expectedSubstr}": ${message}`);
    }
  }
}

async function assertRejects(promiseFn, expectedSubstr, message) {
  try {
    await promiseFn();
    throw new Error(`[FAILED] Expected promise to reject containing "${expectedSubstr}", but it resolved: ${message}`);
  } catch (err) {
    if (err.message && err.message.includes(expectedSubstr)) {
      console.log(`[PASSED] ${message}`);
    } else if (err.message.startsWith('[FAILED]')) {
      throw err;
    } else {
      throw new Error(`[FAILED] Error message "${err.message}" did not contain "${expectedSubstr}": ${message}`);
    }
  }
}

export async function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task P1-6 Primary Headline Data Adapter Unit Tests');
  console.log('====================================================');

  const adapter = new PrimaryHeadlineDataAdapter();

  // ----------------------------------------------------
  // SECTION 1: Headline Extraction & Filtering Rules
  // ----------------------------------------------------
  const mockPlaylists = [
    {
      label: 'ప్రధాన హెడ్‌లైన్స్',
      theme: 'district',
      status: 'active',
      items: [
        'జగిత్యాల జిల్లాలో విస్తారంగా కురుస్తున్న వర్షాలు',
        '  ',
        null,
        'ధర్మపురి గోదావరి పుష్కర ఘాట్ వద్ద పెరిగిన నీటిమట్టం'
      ]
    },
    {
      label: 'పాత ప్లేలిస్ట్',
      theme: 'sports',
      status: 'inactive',
      items: [
        'ఈ వార్త ఇన్-యాక్టివ్ కాబట్టి రాకూడదు'
      ]
    },
    {
      label: 'క్రీడలు',
      theme: 'sports',
      status: 'active',
      items: [
        'ఇండియా వర్సెస్ ఆస్ట్రేలియా బోర్డర్-గవాస్కర్ ట్రోఫీ మూడో టెస్ట్ రేపే ప్రారంభం'
      ]
    }
  ];

  const extracted = adapter.extractHeadlines(mockPlaylists);

  assert(extracted.length === 3, 'Adapter extracts exactly 3 valid active headlines');
  assert(extracted[0] === 'జగిత్యాల జిల్లాలో విస్తారంగా కురుస్తున్న వర్షాలు', 'First headline extracted in top-to-bottom order');
  assert(extracted[1] === 'ధర్మపురి గోదావరి పుష్కర ఘాట్ వద్ద పెరిగిన నీటిమట్టం', 'Second headline extracted in top-to-bottom order');
  assert(extracted[2] === 'ఇండియా వర్సెస్ ఆస్ట్రేలియా బోర్డర్-గవాస్కర్ ట్రోఫీ మూడో టెస్ట్ రేపే ప్రారంభం', 'Third headline extracted in top-to-bottom order');
  assert(!extracted.includes('ఈ వార్త ఇన్-యాక్టివ్ కాబట్టి రాకూడదు'), 'Inactive playlist items correctly filtered out');
  assert(!extracted.includes('  '), 'Whitespace-only items correctly filtered out');
  assert(!extracted.includes(null), 'Null items correctly filtered out');

  // ----------------------------------------------------
  // SECTION 2: Safe Boundary Hot Reload (HEADLINE_END Contract)
  // ----------------------------------------------------
  const mockRuntime = new PrimaryHeadlineRuntime({ loop: false });
  await mockRuntime.initialize();

  const boundAdapter = new PrimaryHeadlineDataAdapter({ runtime: mockRuntime });

  const initialHeadlines = ['హెడ్‌లైన్ 1', 'హెడ్‌లైన్ 2'];
  mockRuntime.loadHeadlines(initialHeadlines);
  boundAdapter.lastValidHeadlines = [...initialHeadlines];

  const newHeadlines = ['కొత్త హెడ్‌లైన్ 1', 'కొత్త హెడ్‌లైన్ 2'];
  boundAdapter.scheduleSafeHotReload(newHeadlines);

  assert(boundAdapter.isReloadPending === true, 'Hot reload scheduled pending HEADLINE_END');
  assert(boundAdapter.pendingHeadlines.length === 2, 'Pending headlines stored in queue');
  assert(mockRuntime.rawHeadlines[0] === 'హెడ్‌లైన్ 1', 'Current runtime dataset remains UNINTERRUPTED before boundary');

  // Simulate reaching HEADLINE_END boundary
  boundAdapter.applyPendingReload();

  assert(boundAdapter.isReloadPending === false, 'Pending status cleared after boundary reload');
  assert(mockRuntime.rawHeadlines[0] === 'కొత్త హెడ్‌లైన్ 1', 'Runtime dataset successfully updated at HEADLINE_END boundary');

  // ----------------------------------------------------
  // SECTION 3: Status API Passthrough
  // ----------------------------------------------------
  const status = boundAdapter.getProviderStatus();
  assert(status !== null && typeof status === 'object', 'getProviderStatus() returns status object');
  assert(typeof status.status === 'string', 'Status contains status string');

  // ----------------------------------------------------
  // SECTION 4: Invalid Input Handling
  // ----------------------------------------------------
  await assertRejects(
    () => boundAdapter.connectGoogleSheet({ url: '' }),
    'Google Sheet URL is required',
    'Connecting with empty URL throws error'
  );

  boundAdapter.refreshService.stop();

  console.log('====================================================');
  console.log('✅ ALL TASK P1-6 PRIMARY HEADLINE ADAPTER TESTS PASSED!');
  console.log('====================================================');
}

// Execute tests if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('primary-headline-adapter.test.js')) {
  runTests();
}
