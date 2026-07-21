/**
 * Task M2-1A Google Sheet Provider Unit Test Suite
 * Validates CSV parsing, UTF-8 Telugu text support, active/inactive filtering, missing values, & error recovery.
 */

import { GoogleSheetProvider } from '../modules/secondary-playlist/data-providers/GoogleSheetProvider.js';
import { ProviderFactory } from '../modules/secondary-playlist/data-providers/ProviderFactory.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

export async function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task M2-1A Google Sheet Provider Tests');
  console.log('====================================================');

  const provider = new GoogleSheetProvider();
  await provider.initialize();
  assert(provider.getStatus() === 'READY', 'GoogleSheetProvider initializes to READY state');

  // Test 1: Published CSV Parsing with UTF-8 Telugu & Multiple Districts/Themes
  const mockCsv = `Label,Theme,News,Status,Priority
జగిత్యాల,district,జగిత్యాల జిల్లాలో విస్తారంగా కురుస్తున్న భారీ వర్షాల కారణంగా కలెక్టరేట్‌లో కంట్రోల్ రూమ్ ఏర్పాటు చేశారు.,active,1
జగిత్యాల,district,ధర్మపురి గోదావరి పుష్కర ఘాట్ వద్ద పెరిగిన నీటిమట్టం - హెచ్చరికలు జారీ,active,2
ఖమ్మం,district,ఖమ్మం మున్సిపల్ కార్పొరేషన్ పరిధిలో అభివృద్ధి పనుల సమీక్ష,inactive,3
క్రీడలు,sports,ఇండియా వర్సెస్ ఆస్ట్రేలియా బోర్డర్-గవాస్కర్ ట్రోఫీ మూడో టెస్ట్ రేపే ప్రారంభం,active,1
వాతావరణం,weather,"మరో రెండు రోజుల పాటు తెలంగాణలో భారీ వర్షాలు - హైదరాబాద్ వాతావరణ కేంద్రం హెచ్చరిక",active,1`;

  const result = await provider.load({ csvText: mockCsv });
  assert(result.status === 'success', 'Provider parses published CSV successfully');
  assert(result.playlists.length === 3, `Provider generated exactly 3 active playlists (actual: ${result.playlists.length})`);

  // Verify Grouping & Inactive Row Filter (Khammam was inactive)
  const jagityalPl = result.playlists.find(p => p.label === 'జగిత్యాల');
  assert(jagityalPl !== undefined, 'Jagityal playlist exists');
  assert(jagityalPl.items.length === 2, 'Jagityal playlist contains 2 news items');

  const khammamPl = result.playlists.find(p => p.label === 'ఖమ్మం');
  assert(khammamPl === undefined, 'Inactive Khammam playlist was filtered out safely');

  const sportsPl = result.playlists.find(p => p.label === 'క్రీడలు');
  assert(sportsPl.theme === 'sports', 'Sports playlist theme correctly identified as sports');

  // Test 2: 300+ Character Long Headline Support
  const longHeadlineCsv = `Label,Theme,News,Status
నల్గొండ,district,"నల్గొండ జిల్లావ్యాప్తంగా విస్తారంగా కురుస్తున్న వర్షాల దృష్ట్యా ప్రభుత్వ యంత్రాంగం పూర్తిస్థాయిలో సిద్ధంగా ఉందని జిల్లా కలెక్టర్ తెలిపారు. అత్యవసర సహాయం కోసం ఏర్పాటు చేసిన టోల్ ఫ్రీ నంబరుకు కాల్ చేయాలని, ఎటువంటి పుకార్లను నమ్మవద్దని అధికారులను ఆదేశించారు. వాగులు వంకలు పొంగిపొర్లుతున్నందున ప్రయాణాల్లో జాగ్రత్త వహించాలని సూచించారు.",active`;

  const longRes = await provider.load({ csvText: longHeadlineCsv });
  const nalgondaPl = longRes.playlists[0];
  assert(nalgondaPl.items[0].length > 200, 'Provider handles 300+ character Telugu headlines without truncation');

  // Test 3: Missing Required Columns Handling
  const invalidCsv = `ColA,ColB,ColC
ValA,ValB,ValC`;

  const invalidRes = await provider.load({ csvText: invalidCsv });
  assert(invalidRes.playlists.length === 0, 'Invalid CSV without Label/News columns returns empty playlists array safely');

  // Test 4: ProviderFactory Creation
  const createdProvider = ProviderFactory.createProvider('google-sheet', { url: 'https://example.com/pub?output=csv' });
  assert(createdProvider instanceof GoogleSheetProvider, 'ProviderFactory creates GoogleSheetProvider instance');

  console.log('====================================================');
  console.log('✅ ALL TASK M2-1A GOOGLE SHEET PROVIDER TESTS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('google-sheet-provider.test.js')) {
  runTests();
}
