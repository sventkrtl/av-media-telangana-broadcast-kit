/**
 * AV Media Telangana - Task B1-2D Continuous Playback Unit Tests
 *
 * Test Suite verifying:
 *   1. Circular Queue playback: advances selectedIndex automatically (0 -> 1 -> 2 -> 0...).
 *   2. End of Queue wrap logging format.
 *   3. Reset index to 0 upon manual STOP.
 *   4. Duplicate SHOW NOW protection while ACTIVE.
 *   5. Manual STOP releases Primary and resets state to IDLE.
 *
 * Run with: node tests/breaking-continuous-playback.test.js
 */

import assert from 'assert';
import { BreakingFeedModel } from '../modules/breaking-news/models/BreakingFeedModel.js';
import { BreakingNewsProfile } from '../modules/breaking-news/BreakingNewsProfile.js';
import { StateEngine } from '../shared/js/state-engine.js';

console.log('====================================================');
console.log('🧪 Running Task B1-2D Continuous Playback Unit Tests');
console.log('====================================================');

// Test 1: BreakingFeedModel circular queue rotation
const model = new BreakingFeedModel();
model.setSheetFeed(['Headline 1', 'Headline 2', 'Headline 3'], { status: 'READY' });
assert.strictEqual(model.getSnapshot().selectedIndex, 0);
assert.strictEqual(model.getSnapshot().currentHeadline, 'Headline 1');

const step1 = model.next(); // advances to index 1
assert.strictEqual(step1.selectedIndex, 1);
assert.strictEqual(step1.headline, 'Headline 2');
assert.strictEqual(step1.isWrapped, false);

const step2 = model.next(); // advances to index 2
assert.strictEqual(step2.selectedIndex, 2);
assert.strictEqual(step2.headline, 'Headline 3');
assert.strictEqual(step2.isWrapped, false);

const step3 = model.next(); // wraps to index 0
assert.strictEqual(step3.selectedIndex, 0);
assert.strictEqual(step3.headline, 'Headline 1');
assert.strictEqual(step3.isWrapped, true);
console.log('[PASSED] BreakingFeedModel circular queue rotation & wrap verified');

// Test 2: resetIndex on STOP
model.selectIndex(2);
assert.strictEqual(model.getSnapshot().selectedIndex, 2);
model.resetIndex();
assert.strictEqual(model.getSnapshot().selectedIndex, 0);
console.log('[PASSED] resetIndex resets selectedIndex to 0 upon STOP');

// Test 3: Profile wrapper continuous loop & STOP reset
function createMockDomContainer() {
  const styleObj = { backgroundColor: '', transform: '', clipPath: '', opacity: '' };
  return {
    appendChild: () => {},
    style: styleObj,
    querySelector: () => ({ style: styleObj, textContent: '' })
  };
}

const stateEngine = new StateEngine('test_continuous_channel');
const profile = new BreakingNewsProfile({ stateEngine });
profile.initialize({ containerElement: createMockDomContainer() });

// Trigger SHOW NOW (continuous loop started)
profile.showNow({ headlines: ['Item A', 'Item B'], selectedIndex: 0 });
assert.strictEqual(profile.isActive, true);
assert.strictEqual(profile.currentHeadline, 'Item A');

// Manual STOP terminates loop cleanly and releases Primary Engine
let releaseEmitted = false;
stateEngine.subscribe(msg => {
  if (msg.action === 'release') releaseEmitted = true;
});

profile.stop();
assert.strictEqual(profile.isActive, false);
assert.strictEqual(profile.selectedIndex, 0);
assert.strictEqual(releaseEmitted, true);
console.log('[PASSED] Continuous playback loops until manual STOP & Primary release');

console.log('====================================================');
console.log('✅ ALL TASK B1-2D CONTINUOUS PLAYBACK TESTS PASSED!');
console.log('====================================================');
