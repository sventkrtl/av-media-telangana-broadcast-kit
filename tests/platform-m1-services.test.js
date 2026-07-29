import { PlatformConfig } from '../overlay/platform/config/PlatformConfig.js';
import { CapabilityRegistry } from '../overlay/platform/registry/CapabilityRegistry.js';
import { RuntimeManifest } from '../overlay/platform/version/RuntimeManifest.js';
import { HealthSnapshot } from '../overlay/platform/monitoring/HealthSnapshot.js';
import { ObservabilityEndpoints } from '../overlay/platform/monitoring/ObservabilityEndpoints.js';
import { DiagnosticsEngine } from '../overlay/platform/diagnostics/DiagnosticsEngine.js';
import { ErrorRecoverySystem } from '../overlay/platform/recovery/ErrorRecoverySystem.js';

function assert(cond, msg) {
  if (!cond) throw new Error(`[FAILED] ${msg}`);
  console.log(`[PASSED] ${msg}`);
}

export function runTests() {
  console.log('====================================================');
  console.log('Running M1 Platform Services Tests');
  console.log('====================================================');

  const config = new PlatformConfig();
  assert(config.get('app', 'name').includes('AV Media Telangana'), 'PlatformConfig loads app configuration');
  assert(config.get('obs', 'width') === 1920, 'PlatformConfig loads OBS config');

  const registry = new CapabilityRegistry('0.1.0-m1');
  registry.registerModule({
    id: 'test-mod',
    supportsVersion: '^0.1.0',
    requiresKernel: '0.1.0-m1',
    dependencies: [],
    capabilities: ['cap-1']
  });
  assert(registry.hasCapability('cap-1') === true, 'CapabilityRegistry registers capabilities');

  const manifest = new RuntimeManifest();
  assert(manifest.getManifest().kernelVersion === '0.1.0-m1', 'RuntimeManifest exports semver manifest');

  const health = new HealthSnapshot();
  health.setState('READY');
  assert(health.getState() === 'READY', 'HealthSnapshot manages unified states');

  const endpoints = new ObservabilityEndpoints({
    getHealthState: () => 'RUNNING',
    getHealthSnapshot: () => ({ status: 'RUNNING' }),
    getRuntimeManifest: () => ({ kernelVersion: '0.1.0-m1' })
  });

  assert(endpoints.handleStatus().body.status === 'RUNNING', 'Endpoints /status returns status');
  assert(endpoints.handleReady().body.ready === true, 'Endpoints /ready returns readiness');
  assert(endpoints.handleVersion().body.kernelVersion === '0.1.0-m1', 'Endpoints /version returns version');

  console.log('====================================================');
  console.log('ALL M1 PLATFORM SERVICES TESTS PASSED');
  console.log('====================================================');
}

if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('platform-m1-services.test.js')) {
  runTests();
}
