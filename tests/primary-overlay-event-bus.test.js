import { PlatformKernel } from '../overlay/platform/PlatformKernel.js';
import { PrimaryOverlay } from '../overlay/modules/primary/PrimaryOverlay.js';

function assert(cond, msg) {
  if (!cond) throw new Error(`[FAILED] ${msg}`);
  console.log(`[PASSED] ${msg}`);
}

class MockEventBus {
  constructor() {
    this.listeners = [];
  }
  subscribe(fn) { this.listeners.push(fn); }
  emit(msg) { this.listeners.forEach(fn => fn(msg)); }
}

export function runTests() {
  console.log('====================================================');
  console.log('Running Primary Overlay Event Bus Integration Tests');
  console.log('====================================================');

  const eventBus = new MockEventBus();
  const kernel = new PlatformKernel({ eventBus });
  const primaryOverlay = new PrimaryOverlay();

  kernel.registry.register({
    id: 'primary',
    priority: 300,
    instance: primaryOverlay
  });

  const event = {
    version: 1,
    engine: 'primary-headline',
    action: 'update',
    payload: { headline: 'Event Bus Headline Update', category: 'POLITICS' }
  };

  kernel.handleEvent(event);
  assert(kernel.lastEvent.engine === 'primary-headline', 'Kernel processes primary-headline event');

  console.log('====================================================');
  console.log('ALL PRIMARY OVERLAY EVENT BUS TESTS PASSED');
  console.log('====================================================');
}

if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('primary-overlay-event-bus.test.js')) {
  runTests();
}
