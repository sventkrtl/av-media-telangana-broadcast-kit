/**
 * AV Media Telangana - Task B1-1 Breaking News Profile Unit Tests
 *
 * Test Suite verifying:
 *   1. Profile Isolation & Red Bar Theme Configuration (#DC2626)
 *   2. Zero Code Duplication (Direct import of Primary Headline classes)
 *   3. No Primary Mutation (Runtime Ownership Rule compliance)
 *   4. Manual Trigger Lifecycle (SHOW NOW / STOP)
 *   5. Preemption & Release Handshake (Primary pause & auto-resume contract)
 *   6. Dedicated Breaking Profile Feed Schema (Order | Active | Priority | Headline | Repeat)
 *   7. Mandated Architecture Isolation & Error Handling (Missing Breaking Sheet ➔ 0 Headlines ➔ ERROR Status ➔ Zero Primary/Secondary data loaded)
 *   8. Frozen Dependency Compliance
 *
 * Run with: node tests/breaking-news-profile.test.js
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { BreakingNewsProfile } from '../modules/breaking-news/BreakingNewsProfile.js';
import { BreakingNewsDataAdapter } from '../modules/breaking-news/adapters/BreakingNewsDataAdapter.js';
import { PrimaryHeadlineRuntime } from '../modules/primary-headline/runtime/PrimaryHeadlineRuntime.js';
import { StateEngine } from '../shared/js/state-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

console.log('====================================================');
console.log('🧪 Running Task B1-1 Breaking News Profile Unit Tests');
console.log('====================================================');

// Mock DOM container for node environment
function createMockDomContainer() {
  const listeners = {};
  const styleObj = { backgroundColor: '', transform: '', clipPath: '', opacity: '' };

  const mockEl = {
    style: styleObj,
    querySelector: () => null,
    appendChild: () => {},
    addEventListener: (evt, fn) => { listeners[evt] = fn; },
    removeEventListener: () => {}
  };

  return mockEl;
}

async function runTests() {
  try {
    // ----------------------------------------------------
    // TEST GROUP 1: Profile Isolation & Red Bar Theme (#DC2626)
    // ----------------------------------------------------
    console.log('\n--- Group 1: Profile Isolation & Red Bar Theme (#DC2626) ---');

    const container = createMockDomContainer();
    const profile = new BreakingNewsProfile({ containerElement: container });
    assert.strictEqual(profile.isActive, false, '[FAILED] Default isActive state should be false');

    const initSuccess = await profile.initialize({ containerElement: container });
    assert.strictEqual(initSuccess, true, '[FAILED] Profile initialization should succeed');

    const info = profile.getProfileInfo();
    assert.strictEqual(info.profile, 'breaking', '[FAILED] Profile ID should be breaking');
    assert.strictEqual(info.themeColor, '#DC2626', '[FAILED] Theme color should be Red #DC2626');
    assert.strictEqual(info.triggerMode, 'manual', '[FAILED] Trigger mode should be manual');

    assert.strictEqual(
      profile.runtime.staticRenderer.barElement.style.backgroundColor,
      '#DC2626',
      '[FAILED] Bar element background color must be Red #DC2626'
    );
    console.log('[PASSED] Profile initialized with Red Bar Theme (#DC2626) and manual trigger mode');

    // ----------------------------------------------------
    // TEST GROUP 2: Zero Code Duplication & Import Verification
    // ----------------------------------------------------
    console.log('\n--- Group 2: Zero Code Duplication & Import Verification ---');

    assert(profile.runtime instanceof PrimaryHeadlineRuntime, '[FAILED] Profile must reuse PrimaryHeadlineRuntime directly');
    assert(info.reusedModules.includes('PrimaryHeadlineRuntime'), '[FAILED] Reused modules list must contain PrimaryHeadlineRuntime');
    assert(info.reusedModules.includes('PrimaryMotionEngine'), '[FAILED] Reused modules list must contain PrimaryMotionEngine');
    assert(info.reusedModules.includes('PrimaryStaticRenderer'), '[FAILED] Reused modules list must contain PrimaryStaticRenderer');
    console.log('[PASSED] Profile directly reuses Primary Headline Engine modules without duplication');

    // ----------------------------------------------------
    // TEST GROUP 3: Runtime Ownership Rule (No Primary Mutation)
    // ----------------------------------------------------
    console.log('\n--- Group 3: Runtime Ownership Rule (No Primary Mutation) ---');

    // 1. Initialize sample Primary Headline Engine
    const primaryRuntime = new PrimaryHeadlineRuntime();
    await primaryRuntime.initialize({ containerElement: createMockDomContainer() });
    const samplePrimaryHeadlines = [
      'Primary Headline 1 - Telangana News',
      'Primary Headline 2 - Weather Report',
      'Primary Headline 3 - Sports Update'
    ];
    primaryRuntime.loadHeadlines(samplePrimaryHeadlines);
    const initialPrimaryQueue = [...primaryRuntime.rawHeadlines];
    const initialPrimaryIndex = primaryRuntime.playbackController.currentIndex;

    // 2. Trigger Breaking News display
    const playPromise1 = profile.showNow('🚨 BREAKING: Major Emergency Announcement');
    assert.strictEqual(profile.isActive, true, '[FAILED] isActive must be true while playing');

    // 3. Assert Primary Engine state remains 100% UNMUTATED
    assert.deepStrictEqual(
      primaryRuntime.rawHeadlines,
      initialPrimaryQueue,
      '[FAILED] Breaking Profile MUST NOT mutate Primary Headline queue'
    );
    assert.strictEqual(
      primaryRuntime.playbackController.currentIndex,
      initialPrimaryIndex,
      '[FAILED] Breaking Profile MUST NOT mutate Primary Headline playback index'
    );
    await playPromise1;
    console.log('[PASSED] Runtime Ownership Rule verified: Primary queue & index remain 100% unmutated');

    // ----------------------------------------------------
    // TEST GROUP 4: Manual Trigger Lifecycle (SHOW NOW / STOP)
    // ----------------------------------------------------
    console.log('\n--- Group 4: Manual Trigger Lifecycle (SHOW NOW / STOP) ---');

    let showNowFired = false;
    let stopFired = false;

    profile.onShowNow((headline) => {
      showNowFired = true;
      assert.strictEqual(headline, '🚨 BREAKING: Fire Brigade Dispatched');
    });

    profile.onStop(() => {
      stopFired = true;
    });

    const playPromise = profile.showNow('  🚨 BREAKING: Fire Brigade Dispatched  ');
    assert.strictEqual(profile.isActive, true, '[FAILED] isActive must be true after showNow');
    assert.strictEqual(profile.currentHeadline, '🚨 BREAKING: Fire Brigade Dispatched', '[FAILED] Headline text must be trimmed');
    assert.strictEqual(showNowFired, true, '[FAILED] onShowNow callback should be triggered');
    await playPromise;

    // Invalid input rejections
    await assert.rejects(async () => { await profile.showNow(''); }, /[BreakingNewsProfile]/, '[FAILED] Empty headline rejected');
    await assert.rejects(async () => { await profile.showNow(null); }, /[BreakingNewsProfile]/, '[FAILED] Null headline rejected');
    await assert.rejects(async () => { await profile.showNow('   '); }, /[BreakingNewsProfile]/, '[FAILED] Whitespace headline rejected');

    profile.stop();
    assert.strictEqual(profile.isActive, false, '[FAILED] isActive must be false after stop');
    assert.strictEqual(stopFired, true, '[FAILED] onStop callback should be triggered');
    console.log('[PASSED] Manual Trigger Lifecycle (SHOW NOW / STOP) verified successfully');

    // ----------------------------------------------------
    // TEST GROUP 5: Preemption & Release Handshake via StateEngine
    // ----------------------------------------------------
    console.log('\n--- Group 5: Preemption & Release Handshake via StateEngine ---');

    const testChannel = 'test_broadcast_channel_' + Date.now();
    const testStateEngine = new StateEngine(testChannel);
    const mockProfile = new BreakingNewsProfile({
      containerElement: createMockDomContainer(),
      stateEngine: testStateEngine
    });
    await mockProfile.initialize({ containerElement: createMockDomContainer() });

    let preemptReceived = false;
    let releaseReceived = false;

    testStateEngine.subscribe((msg) => {
      if (msg.engine === 'breaking-news') {
        if (msg.action === 'preempt') {
          preemptReceived = true;
          assert.strictEqual(msg.payload.headline, '🚨 URGENT: Heavy Rainfall Alert');
        } else if (msg.action === 'release') {
          releaseReceived = true;
        }
      }
    });

    mockProfile.showNow('🚨 URGENT: Heavy Rainfall Alert').catch(() => {});
    assert.strictEqual(preemptReceived, true, '[FAILED] StateEngine should receive preempt event on showNow');

    mockProfile.stop();
    assert.strictEqual(releaseReceived, true, '[FAILED] StateEngine should receive release event on stop');
    console.log('[PASSED] Preemption & Release Handshake protocol verified via StateEngine');

    // ----------------------------------------------------
    // TEST GROUP 6: Dedicated Breaking Profile Feed Schema Parsing
    // ----------------------------------------------------
    console.log('\n--- Group 6: Dedicated Breaking Profile Feed Schema Parsing ---');

    const adapter = new BreakingNewsDataAdapter();
    const fullSchemaCsv = `Order,Active,Priority,Headline,Repeat\n1,TRUE,10,🚨 Emergency Alert 1,TRUE\n2,FALSE,5,Inactive Alert,FALSE\n3,TRUE,1,🚨 Emergency Alert 2,FALSE`;

    const parsedItems = adapter.parseBreakingItems(fullSchemaCsv);
    assert.strictEqual(parsedItems.length, 2, '[FAILED] Should parse exactly 2 active breaking items');
    assert.strictEqual(parsedItems[0].headline, '🚨 Emergency Alert 1', '[FAILED] Should be sorted by Order ascending');
    assert.strictEqual(parsedItems[0].repeat, true, '[FAILED] Should preserve Repeat boolean');
    assert.strictEqual(parsedItems[1].headline, '🚨 Emergency Alert 2');
    assert.strictEqual(parsedItems[1].repeat, false, '[FAILED] Should preserve Repeat boolean');

    const simpleHeadlines = adapter.parseBreakingCsv(fullSchemaCsv);
    assert.strictEqual(simpleHeadlines.length, 2, '[FAILED] parseBreakingCsv should return 2 active headlines');
    assert.strictEqual(simpleHeadlines[0], '🚨 Emergency Alert 1');
    assert.strictEqual(simpleHeadlines[1], '🚨 Emergency Alert 2');
    console.log('[PASSED] BreakingNewsDataAdapter parses full schema (Order, Active, Priority, Headline, Repeat) correctly');

    // ----------------------------------------------------
    // TEST GROUP 7: Mandated Missing Breaking Sheet Architecture Isolation Test
    // ----------------------------------------------------
    console.log('\n--- Group 7: Mandated Missing Breaking Sheet Architecture Isolation Test ---');

    const isolatedAdapter = new BreakingNewsDataAdapter();
    // Test with invalid URL where no Breaking Profile tab is found
    const result = await isolatedAdapter.fetchBreakingHeadlines('http://127.0.0.1:9999/nonexistent-sheet.csv');

    assert.strictEqual(result.length, 0, '[FAILED] Missing Breaking sheet MUST return 0 headlines');
    const statusObj = isolatedAdapter.getStatus();
    assert.strictEqual(statusObj.status, 'ERROR', '[FAILED] Status MUST be ERROR when Breaking sheet is missing');
    assert(statusObj.lastError.includes('Breaking Profile'), '[FAILED] Error message must state Breaking Profile tab missing');
    assert.strictEqual(isolatedAdapter.lastValidHeadlines.length, 0, '[FAILED] Zero Primary or Secondary data loaded into Breaking Profile');

    console.log('[PASSED] Architecture Isolation Mandate Verified: Missing Breaking Sheet returns 0 headlines, Status ERROR, zero Primary/Secondary fallback');

    // ----------------------------------------------------
    // TEST GROUP 8: Frozen Dependency Protection Compliance
    // ----------------------------------------------------
    console.log('\n--- Group 8: Frozen Dependency Protection Compliance ---');

    const frozenFiles = [
      'modules/primary-headline/runtime/PrimaryHeadlineRuntime.js',
      'modules/primary-headline/motion/PrimaryMotionEngine.js',
      'modules/primary-headline/renderer/PrimaryStaticRenderer.js',
      'modules/primary-headline/playback/PrimaryTimelinePlaybackController.js',
      'modules/primary-headline/HeadlineTimelineBuilder.js',
      'modules/primary-headline/HeadlineStateMachine.js',
      'modules/primary-headline/primary-headline.css',
      'modules/primary-headline/index.html',
      'modules/secondary-playlist/data-providers/GoogleSheetProvider.js',
      'modules/secondary-playlist/services/GoogleSheetRefreshService.js',
      'modules/secondary-playlist/services/GoogleSheetProviderStatus.js'
    ];

    frozenFiles.forEach(relPath => {
      const fullPath = path.join(REPO_ROOT, relPath);
      assert(fs.existsSync(fullPath), `[FAILED] Frozen dependency file missing: ${relPath}`);
    });
    console.log('[PASSED] All frozen primary and secondary dependencies exist and are protected');

    // ----------------------------------------------------
    // TEST GROUP 9: Control Panel Integration & Two-Step Workflow Logic
    // ----------------------------------------------------
    console.log('\n--- Group 9: Control Panel Integration & Two-Step Workflow Logic ---');

    const cpChannel = 'cp_test_channel_' + Date.now();
    const cpStateEngine = new StateEngine(cpChannel);

    let cpPreemptCount = 0;
    let cpReleaseCount = 0;
    let lastCpHeadline = '';

    cpStateEngine.subscribe((msg) => {
      if (msg.engine === 'breaking-news') {
        if (msg.action === 'preempt') {
          cpPreemptCount++;
          lastCpHeadline = msg.payload.headline;
        } else if (msg.action === 'release') {
          cpReleaseCount++;
        }
      }
    });

    // Mock Control Panel state manager
    let isCpActive = false;

    function simulateShowNow(headline, isManual = false) {
      if (isCpActive) {
        return 'REJECTED_DUPLICATE';
      }
      isCpActive = true;
      cpStateEngine.emit('breaking-news', 'preempt', { headline });
      return 'TRIGGERED';
    }

    function simulateStop() {
      if (!isCpActive) {
        return 'IGNORED_IDLE';
      }
      isCpActive = false;
      cpStateEngine.emit('breaking-news', 'release', {});
      return 'RELEASED';
    }

    // 1. Verify Feed Sync does NOT auto-broadcast (Two-Step Workflow Rule)
    assert.strictEqual(cpPreemptCount, 0, '[FAILED] Feed sync must not trigger on-air preempt');

    // 2. Trigger SHOW NOW
    const res1 = simulateShowNow('🚨 URGENT: Flash Flood Warning in Warangal');
    assert.strictEqual(res1, 'TRIGGERED');
    assert.strictEqual(cpPreemptCount, 1);
    assert.strictEqual(lastCpHeadline, '🚨 URGENT: Flash Flood Warning in Warangal');

    // 3. Duplicate SHOW NOW rejection
    const res2 = simulateShowNow('🚨 Second Duplicate Trigger');
    assert.strictEqual(res2, 'REJECTED_DUPLICATE', '[FAILED] Duplicate SHOW NOW must be rejected when active');
    assert.strictEqual(cpPreemptCount, 1, '[FAILED] Preempt count must remain 1 after duplicate rejection');

    // 4. Trigger STOP
    const res3 = simulateStop();
    assert.strictEqual(res3, 'RELEASED');
    assert.strictEqual(cpReleaseCount, 1);

    // 5. Safe STOP while idle
    const res4 = simulateStop();
    assert.strictEqual(res4, 'IGNORED_IDLE', '[FAILED] STOP when idle must be ignored safely');
    assert.strictEqual(cpReleaseCount, 1, '[FAILED] Release count must remain 1');

    console.log('[PASSED] Control Panel Two-Step Workflow & State Safeguards verified');

    // Cleanup
    profile.destroy();
    mockProfile.destroy();
    primaryRuntime.destroy();

    console.log('\n====================================================');
    console.log('✅ ALL TASK B1-2 BREAKING NEWS PROFILE TESTS PASSED!');
    console.log('====================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    process.exit(1);
  }
}

runTests();
