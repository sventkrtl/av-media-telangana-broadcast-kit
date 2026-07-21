/**
 * Task 3A Badge Motion Engine Test Suite
 * Validates BADGE_IN, BADGE_HOLD, BADGE_OUT, repeated transitions, rapid switching, & empty timeline handling.
 */

import { BadgeMotionEngine } from '../modules/secondary-playlist/motion/index.js';
import { TimelineEvent, EVENT_TYPES } from '../modules/secondary-playlist/interpreter/index.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

class MockElement {
  constructor() {
    this.style = {
      transform: '',
      opacity: '',
      willChange: '',
      transition: ''
    };
  }
}

export async function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task 3A Badge Motion Engine Unit Tests');
  console.log('====================================================');

  const motionEngine = new BadgeMotionEngine();
  const mockBadge = new MockElement();

  // Test 1: BADGE_IN Animation Sequence
  const inEvent = new TimelineEvent({ type: EVENT_TYPES.BADGE_IN, label: 'జగిత్యాల' });
  const inRes = await motionEngine.processEvent(mockBadge, inEvent);
  assert(inRes === 'IN_COMPLETE', 'BADGE_IN transition resolves with IN_COMPLETE');
  assert(mockBadge.style.transform === 'translate3d(0, 0, 0)', 'BADGE_IN sets transform translate3d(0, 0, 0)');
  assert(mockBadge.style.opacity === '1', 'BADGE_IN sets opacity 1');

  // Test 2: BADGE_HOLD State Sequence
  const holdEvent = new TimelineEvent({ type: EVENT_TYPES.BADGE_HOLD, label: 'జగిత్యాల' });
  const holdRes = await motionEngine.processEvent(mockBadge, holdEvent);
  assert(holdRes === 'HOLD_ACTIVE', 'BADGE_HOLD transition resolves with HOLD_ACTIVE');
  assert(mockBadge.style.transform === 'translate3d(0, 0, 0)', 'BADGE_HOLD maintains transform translate3d(0, 0, 0)');

  // Test 3: BADGE_OUT Animation Sequence
  const outEvent = new TimelineEvent({ type: EVENT_TYPES.BADGE_OUT, label: 'జగిత్యాల' });
  const outRes = await motionEngine.processEvent(mockBadge, outEvent);
  assert(outRes === 'OUT_COMPLETE', 'BADGE_OUT transition resolves with OUT_COMPLETE');
  assert(mockBadge.style.transform === 'translate3d(-100%, 0, 0)', 'BADGE_OUT sets transform translate3d(-100%, 0, 0)');
  assert(mockBadge.style.opacity === '0', 'BADGE_OUT sets opacity 0');

  // Test 4: Ignore Non-Badge Events (NEWS_START, LOGO_SEPARATOR)
  const newsEvent = new TimelineEvent({ type: EVENT_TYPES.NEWS_START, label: 'జగిత్యాల', newsIndex: 0 });
  const newsRes = await motionEngine.processEvent(mockBadge, newsEvent);
  assert(newsRes === 'OUT', 'Non-badge event ignored without altering current status');

  // Test 5: Repeated Badge Transitions & Rapid Playlist Switching
  for (let i = 0; i < 5; i++) {
    await motionEngine.processEvent(mockBadge, inEvent);
    assert(mockBadge.style.opacity === '1', `Rapid iteration ${i}: BADGE_IN successful`);
    await motionEngine.processEvent(mockBadge, outEvent);
    assert(mockBadge.style.opacity === '0', `Rapid iteration ${i}: BADGE_OUT successful`);
  }

  // Test 6: Empty Timeline / Null Event Handling
  const emptyRes = await motionEngine.processEvent(mockBadge, null);
  assert(emptyRes !== null, 'Null event handled gracefully without throwing');

  console.log('====================================================');
  console.log('✅ ALL TASK 3A BADGE MOTION ENGINE TESTS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('badge-motion-engine.test.js')) {
  runTests();
}
