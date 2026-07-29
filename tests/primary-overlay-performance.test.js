import { PrimaryOverlay } from '../overlay/modules/primary/PrimaryOverlay.js';
import { MemoryMonitor } from '../overlay/platform/monitoring/MemoryMonitor.js';

function assert(cond, msg) {
  if (!cond) throw new Error(`[FAILED] ${msg}`);
  console.log(`[PASSED] ${msg}`);
}

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.styleProps = {};
    this.style = { setProperty: (k, v) => { this.styleProps[k] = v; } };
    this.classList = { add: () => {}, remove: () => {} };
    this.textContent = '';
  }
  appendChild(child) { return child; }
  removeChild() {}
}

export function runTests() {
  console.log('====================================================');
  console.log('Running Primary Overlay Performance & Memory Audit');
  console.log('====================================================');

  const mem = new MemoryMonitor();
  const initialMem = mem.takeSnapshot().heapUsedMb;
  const mockDoc = { createElement: (tag) => new MockElement(tag), body: new MockElement('body') };

  for (let cycle = 0; cycle < 1000; cycle++) {
    const overlay = new PrimaryOverlay();
    overlay.init({ document: mockDoc });
    overlay.show({ headline: `Performance Headline ${cycle}`, category: 'CRIME' });
    overlay.update({ headline: `Updated Headline ${cycle}`, category: 'SPORTS' });
    overlay.hide();
    overlay.destroy();
  }

  const finalMem = mem.takeSnapshot().heapUsedMb;
  const memDelta = Math.abs(finalMem - initialMem);
  assert(memDelta < 10, `Primary Overlay 1,000 cycle memory drift verified (delta: ${memDelta} MB)`);

  console.log('====================================================');
  console.log('ALL PRIMARY OVERLAY PERFORMANCE TESTS PASSED');
  console.log('====================================================');
}

if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('primary-overlay-performance.test.js')) {
  runTests();
}
