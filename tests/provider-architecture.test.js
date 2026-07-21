/**
 * Task 1.1 Data Provider Architecture Test Suite
 * Validates Provider registration, lookup, creation, invalid/missing provider detection, & interface compliance.
 */

import {
  BaseDataProvider,
  ProviderResult,
  ProviderRegistry,
  ProviderFactory,
  JsonProvider,
  ExcelProvider,
  GoogleSheetProvider,
  ApiProvider,
  CustomProvider
} from '../modules/secondary-playlist/data-providers/index.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

export function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task 1.1 Data Provider Architecture Tests');
  console.log('====================================================');

  // Test 1: Abstract BaseDataProvider Cannot Be Instantiated Directly
  try {
    new BaseDataProvider();
    assert(false, 'BaseDataProvider direct instantiation should throw error');
  } catch (e) {
    assert(e.message.includes('Cannot instantiate abstract class'), 'BaseDataProvider blocks direct instantiation');
  }

  // Test 2: Registry Contains All Default Provider Placeholders
  const registry = new ProviderRegistry();
  assert(registry.has('json') === true, 'Registry has "json" provider');
  assert(registry.has('excel') === true, 'Registry has "excel" provider');
  assert(registry.has('google-sheet') === true, 'Registry has "google-sheet" provider');
  assert(registry.has('api') === true, 'Registry has "api" provider');
  assert(registry.has('custom') === true, 'Registry has "custom" provider');

  // Test 3: Provider Factory Creation & Interface Compliance
  const jsonProvider = ProviderFactory.createProvider('json', {
    playlists: [{ label: 'హైదరాబాద్', theme: 'district', items: ['వార్త 1'] }]
  }, registry);

  assert(jsonProvider instanceof BaseDataProvider, 'Created JsonProvider implements BaseDataProvider');
  assert(jsonProvider instanceof JsonProvider, 'Created JsonProvider is an instance of JsonProvider');

  const result = jsonProvider.getPlaylists();
  assert(result instanceof ProviderResult, 'Provider returns standardized ProviderResult object');
  assert(result.playlists.length === 1, 'ProviderResult contains 1 playlist');
  assert(result.playlists[0].label === 'హైదరాబాద్', 'ProviderResult contains standardized PlaylistModel object');

  // Test 4: Missing Provider Detection
  try {
    ProviderFactory.createProvider('non-existent-provider', {}, registry);
    assert(false, 'Factory creation of missing provider should throw error');
  } catch (e) {
    assert(e.message.includes('Unknown data provider type'), 'Factory detects missing provider type');
  }

  // Test 5: Invalid Provider Type Detection
  try {
    ProviderFactory.createProvider('', {}, registry);
    assert(false, 'Factory creation with empty type should throw error');
  } catch (e) {
    assert(e.message.includes('Invalid provider type'), 'Factory detects invalid empty provider type');
  }

  // Test 6: Custom Provider Registration & Factory Creation
  class MockCustomProvider extends BaseDataProvider {
    async initialize() { this.status = 'READY'; }
    async load() { return new ProviderResult({ status: 'success', playlists: [] }); }
    async refresh() { return this.load(); }
  }

  registry.register('mock-test', MockCustomProvider);
  assert(registry.has('mock-test') === true, 'Custom provider registered successfully');

  const customInst = ProviderFactory.createProvider('mock-test', {}, registry);
  assert(customInst instanceof BaseDataProvider, 'Custom registered provider implements BaseDataProvider');

  // Test 7: Placeholder Exception Compliance
  const excelInst = ProviderFactory.createProvider('excel', {}, registry);
  excelInst.initialize().catch(e => {
    assert(e.message.includes('Not Implemented'), 'ExcelProvider placeholder throws Not Implemented');
  });

  const gsInst = ProviderFactory.createProvider('google-sheet', {}, registry);
  gsInst.load().catch(e => {
    assert(e.message.includes('Not Implemented'), 'GoogleSheetProvider placeholder throws Not Implemented');
  });

  console.log('====================================================');
  console.log('✅ ALL TASK 1.1 PROVIDER ARCHITECTURE TESTS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('provider-architecture.test.js')) {
  runTests();
}
