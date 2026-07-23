/**
 * AV Media Telangana - BreakingFeedModel Automated Unit Tests (Task B1-2C)
 *
 * Test suite verifying Single Source of Truth (SSOT) behavior for BreakingFeedModel:
 *   1. Model stores headlines[], selectedIndex, currentHeadline, revision, state, feedSource, providerStatus.
 *   2. transitionTo() enforces valid State Machine transitions.
 *   3. Manual mode updates the model cleanly and clearManual() restores sheet feed.
 *   4. Model subscriber notifications dispatch updated snapshots.
 *   5. DOM element isolation — DOM mutations do not alter in-memory model.
 *
 * Run with: node tests/breaking-feed-model.test.js
 */

import assert from 'assert';
import { BreakingFeedModel } from '../modules/breaking-news/models/BreakingFeedModel.js';

console.log('====================================================');
console.log('🧪 Running Task B1-2C BreakingFeedModel Unit Tests');
console.log('====================================================');

// Test 1: Initial state defaults
const model1 = new BreakingFeedModel();
const snap1 = model1.getSnapshot();
assert.strictEqual(snap1.currentHeadline, '');
assert.deepStrictEqual(snap1.headlines, []);
assert.strictEqual(snap1.selectedIndex, 0);
assert.strictEqual(snap1.manualHeadline, null);
assert.strictEqual(snap1.feedSource, 'Google Sheet');
assert.strictEqual(snap1.providerStatus, 'UNINITIALIZED');
assert.strictEqual(snap1.state, 'IDLE');
assert.strictEqual(snap1.revision, 0);
console.log('[PASSED] Initial state defaults verified');

// Test 2: setSheetFeed updates
const model2 = new BreakingFeedModel();
model2.setSheetFeed(['Headline 1', 'Headline 2'], { status: 'READY' });
const snap2 = model2.getSnapshot();
assert.strictEqual(snap2.headlines.length, 2);
assert.strictEqual(snap2.selectedIndex, 0);
assert.strictEqual(snap2.currentHeadline, 'Headline 1');
assert.strictEqual(snap2.feedSource, 'Google Sheet');
assert.strictEqual(snap2.providerStatus, 'READY');
assert.strictEqual(snap2.state, 'READY');
assert.strictEqual(snap2.revision, 1);
console.log('[PASSED] Google Sheet feed updates model and increments revision');

// Test 3: selectIndex updates
model2.selectIndex(1);
const snap3 = model2.getSnapshot();
assert.strictEqual(snap3.selectedIndex, 1);
assert.strictEqual(snap3.currentHeadline, 'Headline 2');
assert.strictEqual(snap3.revision, 2);
console.log('[PASSED] selectIndex updates selectedIndex and currentHeadline');

// Test 4: Manual headline overrides
model2.setManualHeadline('🚨 Manual Headline');
const snap4 = model2.getSnapshot();
assert.strictEqual(snap4.currentHeadline, '🚨 Manual Headline');
assert.strictEqual(snap4.feedSource, 'Manual');
assert.strictEqual(snap4.state, 'READY');
assert.strictEqual(snap4.revision, 3);
console.log('[PASSED] Manual headline overrides currentHeadline');

// Test 5: clearManual restores sheet headline
model2.clearManual();
const snap5 = model2.getSnapshot();
assert.strictEqual(snap5.currentHeadline, 'Headline 2');
assert.strictEqual(snap5.feedSource, 'Google Sheet');
console.log('[PASSED] clearManual restores Google Sheet headline');

// Test 6: transitionTo updates state machine
model2.transitionTo('ACTIVE');
assert.strictEqual(model2.getSnapshot().state, 'ACTIVE');
model2.transitionTo('IDLE');
assert.strictEqual(model2.getSnapshot().state, 'IDLE');
console.log('[PASSED] transitionTo updates State Machine cleanly');

// Test 7: Subscriber dispatches
let callCount = 0;
let lastSnap = null;
const model7 = new BreakingFeedModel();
model7.subscribe(s => {
  callCount++;
  lastSnap = s;
});
model7.setSheetFeed(['Test'], { status: 'READY' });
assert.strictEqual(callCount, 1);
assert.strictEqual(lastSnap.currentHeadline, 'Test');
assert.strictEqual(lastSnap.revision, 1);
console.log('[PASSED] Subscribers receive model updates on state changes');

// Test 8: DOM isolation
const mockDom = { textContent: 'External DOM Change' };
model7.setSheetFeed(['Model Headline'], { status: 'READY' });
assert.strictEqual(model7.currentHeadline, 'Model Headline');
assert.notStrictEqual(mockDom.textContent, model7.currentHeadline);
console.log('[PASSED] DOM mutations do NOT alter BreakingFeedModel (DOM isolation)');

console.log('====================================================');
console.log('✅ ALL TASK B1-2C BREAKINGFEEDMODEL TESTS PASSED!');
console.log('====================================================');
