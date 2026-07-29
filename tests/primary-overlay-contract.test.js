import { PrimaryOverlay } from '../overlay/modules/primary/PrimaryOverlay.js';

function assert(cond, msg) {
  if (!cond) throw new Error(`[FAILED] ${msg}`);
  console.log(`[PASSED] ${msg}`);
}

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.children = [];
    this.style = {
      setProperty: (k, v) => { this.style[k] = v; }
    };
    this.classList = {
      add: (cls) => this.children.push(cls),
      remove: (cls) => { this.children = this.children.filter(c => c !== cls); }
    };
    this.textContent = '';
    this.className = '';
    this.id = '';
  }
  appendChild(child) { return child; }
  removeChild() {}
}

export function runTests() {
  console.log('====================================================');
  console.log('Running Primary Overlay Runtime Contract Tests');
  console.log('====================================================');

  const mockDoc = { createElement: (tag) => new MockElement(tag), body: new MockElement('body') };
  const overlay = new PrimaryOverlay();

  // Test 1: init() contract
  const initialized = overlay.init({ document: mockDoc });
  assert(initialized === true, 'PrimaryOverlay.init() succeeds with valid document');
  assert(overlay.container !== null, 'PrimaryOverlay initializes DOM container');

  // Test 2: show() contract
  const shown = overlay.show({ headline: 'Telangana News Update', category: 'POLITICS' });
  assert(shown === true, 'PrimaryOverlay.show() succeeds');
  assert(overlay.isVisible === true, 'PrimaryOverlay marks visible state as true');

  // Test 3: update() contract
  const updated = overlay.update({ headline: 'Updated Breaking Headline', category: 'BREAKING' });
  assert(updated === true, 'PrimaryOverlay.update() succeeds');
  assert(overlay.headlineElement.textContent === 'Updated Breaking Headline', 'PrimaryOverlay updates headline text');
  assert(overlay.badgeElement.textContent === 'BREAKING', 'PrimaryOverlay updates category badge');

  // Test 4: hide() contract
  const hidden = overlay.hide();
  assert(hidden === true, 'PrimaryOverlay.hide() succeeds');
  assert(overlay.isVisible === false, 'PrimaryOverlay marks visible state as false');

  // Test 5: destroy() contract
  const destroyed = overlay.destroy();
  assert(destroyed === true, 'PrimaryOverlay.destroy() succeeds');
  assert(overlay.container === null, 'PrimaryOverlay clears container references');

  console.log('====================================================');
  console.log('ALL PRIMARY OVERLAY RUNTIME CONTRACT TESTS PASSED');
  console.log('====================================================');
}

if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('primary-overlay-contract.test.js')) {
  runTests();
}
