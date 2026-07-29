import { PrimaryOverlay } from '../overlay/modules/primary/PrimaryOverlay.js';

function assert(cond, msg) {
  if (!cond) throw new Error(`[FAILED] ${msg}`);
  console.log(`[PASSED] ${msg}`);
}

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.styleProps = {};
    this.style = {
      setProperty: (k, v) => { this.styleProps[k] = v; }
    };
    this.classList = { add: () => {}, remove: () => {} };
  }
  appendChild(child) { return child; }
  removeChild() {}
}

export function runTests() {
  console.log('====================================================');
  console.log('Running Primary Overlay Layout & Theme Tests');
  console.log('====================================================');

  const mockDoc = { createElement: (tag) => new MockElement(tag), body: new MockElement('body') };
  const overlay = new PrimaryOverlay();

  overlay.init({
    document: mockDoc,
    theme: {
      primaryBg: '#1e1e2e',
      categoryColor: '#e63946',
      headlineColor: '#ffffff'
    }
  });

  assert(overlay.layoutConfig.width === 1800, 'Layout metrics loaded from config/layout.json (width: 1800)');
  assert(overlay.layoutConfig.height === 110, 'Layout metrics loaded from config/layout.json (height: 110)');
  assert(overlay.container.styleProps['--primary-bg'] === '#1e1e2e', 'Theme token --primary-bg set dynamically');
  assert(overlay.container.styleProps['--category-color'] === '#e63946', 'Theme token --category-color set dynamically');

  overlay.setCategoryPreset('sports');
  assert(overlay.container.styleProps['--category-color'] === '#38b000', 'Category preset "sports" updates CSS variable token');

  overlay.destroy();

  console.log('====================================================');
  console.log('ALL PRIMARY OVERLAY LAYOUT & THEME TESTS PASSED');
  console.log('====================================================');
}

if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('primary-overlay-layout-theme.test.js')) {
  runTests();
}
