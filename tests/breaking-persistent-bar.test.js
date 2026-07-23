/**
 * AV Media Telangana - Task B1-2E Persistent Breaking Bar Unit Tests
 *
 * Test Suite verifying:
 *   1. BAR_IN executes ONCE when operator triggers SHOW NOW.
 *   2. Red Bar remains visible while text transitions (TEXT_IN ➔ TEXT_HOLD ➔ TEXT_OUT) execute.
 *   3. Zero BAR_OUT or BAR_IN occurs between headlines during ACTIVE session.
 *   4. Manual STOP executes BAR_OUT ONCE, resets index to 0, and releases Primary Engine.
 *   5. Duplicate SHOW NOW while ACTIVE is safely ignored.
 *
 * Run with: node tests/breaking-persistent-bar.test.js
 */

import assert from 'assert';
import { BreakingNewsProfile } from '../modules/breaking-news/BreakingNewsProfile.js';
import { StateEngine } from '../shared/js/state-engine.js';

console.log('====================================================');
console.log('🧪 Running Task B1-2E Persistent Breaking Bar Unit Tests');
console.log('====================================================');

function createMockDomContainer() {
  const styleObj = { backgroundColor: '', transform: '', opacity: '', clipPath: '' };
  return {
    appendChild: () => {},
    style: styleObj,
    querySelector: () => ({ style: styleObj, textContent: '', innerHTML: '' })
  };
}

const stateEngine = new StateEngine('test_persistent_bar_channel');
const profile = new BreakingNewsProfile({ stateEngine });
await profile.initialize({ containerElement: createMockDomContainer() });

// Track motion engine stage calls
const stageHistory = [];
const origPlay = profile.runtime.motionEngine.play.bind(profile.runtime.motionEngine);
profile.runtime.motionEngine.play = async (stage, barEl, textEl) => {
  stageHistory.push(stage);
  // Instant resolution for test speed
  profile.runtime.motionEngine.currentStage = stage;
  profile.runtime.motionEngine.isAnimating = false;
  return { status: 'COMPLETED', stage, durationMs: 10 };
};

// 1. Trigger SHOW NOW
const showPromise = profile.showNow({ headlines: ['Headline A', 'Headline B'], selectedIndex: 0 });

// Allow BAR_IN tick to finish
await new Promise(resolve => setTimeout(resolve, 20));

// Verify state transitions: IDLE -> BAR_VISIBLE -> ACTIVE_TEXT_LOOP
assert.strictEqual(profile.isActive, true);
assert.strictEqual(profile.feedModel.state, 'ACTIVE_TEXT_LOOP');

// 2. Duplicate SHOW NOW protection
let duplicateWarning = false;
const origWarn = console.warn;
console.warn = (msg) => {
  if (msg.includes('Duplicate showNow ignored')) duplicateWarning = true;
};
profile.showNow({ headlines: ['Headline A'], selectedIndex: 0 });
console.warn = origWarn;
assert.strictEqual(duplicateWarning, true);
console.log('[PASSED] Duplicate SHOW NOW ignored while ACTIVE');

// Allow loop to cycle once
await new Promise(resolve => setTimeout(resolve, 50));

// 3. Trigger manual STOP
let releaseEmitted = false;
stateEngine.subscribe(msg => {
  if (msg.action === 'release') releaseEmitted = true;
});

await profile.stop();

assert.strictEqual(profile.isActive, false);
assert.strictEqual(profile.feedModel.state, 'IDLE');
assert.strictEqual(profile.feedModel.selectedIndex, 0);
assert.strictEqual(releaseEmitted, true);
console.log('[PASSED] Manual STOP executes final BAR_OUT once & releases Primary');

// 4. Verify BAR_IN and BAR_OUT counts
const barInCount = stageHistory.filter(s => s === 'BAR_IN').length;
const barOutCount = stageHistory.filter(s => s === 'BAR_OUT').length;
const textInCount = stageHistory.filter(s => s === 'TEXT_IN').length;

assert.strictEqual(barInCount, 1);
assert.strictEqual(barOutCount, 1);
assert.strictEqual(textInCount >= 1, true);
console.log(`[PASSED] Stage execution count verified: BAR_IN (${barInCount}), TEXT_IN (${textInCount}), BAR_OUT (${barOutCount})`);

console.log('====================================================');
console.log('✅ ALL TASK B1-2E PERSISTENT BREAKING BAR TESTS PASSED!');
console.log('====================================================');
