/**
 * AV Media Telangana - Primary Headline Architecture Foundation Test Suite (Task P1-1)
 *
 * Validates:
 *   1. Timeline Event Definitions
 *   2. Timeline Builder (single & playlist event ordering, input validation, rejection of invalid inputs)
 *   3. State Machine (deterministic state sequence, illegal transition rejection, state listeners)
 *   4. Playback Contract (abstract interface contract, method signatures)
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0.
 */

import { EVENT_TYPES, HeadlineTimelineEvent } from '../modules/primary-headline/HeadlineTimelineEvent.js';
import { HeadlineTimelineBuilder } from '../modules/primary-headline/HeadlineTimelineBuilder.js';
import { HEADLINE_STATES, HeadlineStateMachine } from '../modules/primary-headline/HeadlineStateMachine.js';
import { HeadlinePlaybackContract } from '../modules/primary-headline/HeadlinePlaybackContract.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

function assertThrows(fn, expectedSubstr, message) {
  try {
    fn();
    throw new Error(`[FAILED] Expected exception containing "${expectedSubstr}", but no error was thrown: ${message}`);
  } catch (err) {
    if (err.message && err.message.includes(expectedSubstr)) {
      console.log(`[PASSED] ${message}`);
    } else if (err.message.startsWith('[FAILED]')) {
      throw err;
    } else {
      throw new Error(`[FAILED] Error message "${err.message}" did not contain "${expectedSubstr}": ${message}`);
    }
  }
}

export function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task P1-1 Primary Headline Architecture Unit Tests');
  console.log('====================================================');

  // ----------------------------------------------------
  // SECTION 1: HeadlineTimelineEvent Verification
  // ----------------------------------------------------
  const evt = new HeadlineTimelineEvent({
    type: EVENT_TYPES.TEXT_IN,
    headlineId: 'hl_100',
    headlineIndex: 0,
    payload: { headlineText: 'టెస్ట్ హెడ్‌లైన్' }
  });

  assert(evt.type === 'TEXT_IN', 'Event type is correctly set to TEXT_IN');
  assert(evt.headlineId === 'hl_100', 'Event headlineId is correctly set');
  assert(evt.duration === 300, 'Default duration for TEXT_IN is 300ms');
  assert(evt.payload.headlineText === 'టెస్ట్ హెడ్‌లైన్', 'Payload carries headline text');

  assertThrows(
    () => new HeadlineTimelineEvent({ type: 'INVALID_TYPE' }),
    'Invalid event type',
    'Invalid event type creation is correctly rejected'
  );

  // ----------------------------------------------------
  // SECTION 2: HeadlineTimelineBuilder Verification
  // ----------------------------------------------------
  const builder = new HeadlineTimelineBuilder();

  // Test 2.1: Single Headline Timeline Build
  const singleEvents = builder.buildSingleTimeline('హైదరాబాద్‌లో భారీ వర్షాలు');
  assert(singleEvents.length === 6, 'Single headline generates exactly 6 timeline events');
  assert(singleEvents[0].type === EVENT_TYPES.BAR_IN, 'Event 1 is BAR_IN');
  assert(singleEvents[1].type === EVENT_TYPES.TEXT_IN, 'Event 2 is TEXT_IN');
  assert(singleEvents[2].type === EVENT_TYPES.TEXT_HOLD, 'Event 3 is TEXT_HOLD');
  assert(singleEvents[3].type === EVENT_TYPES.TEXT_OUT, 'Event 4 is TEXT_OUT');
  assert(singleEvents[4].type === EVENT_TYPES.BAR_OUT, 'Event 5 is BAR_OUT');
  assert(singleEvents[5].type === EVENT_TYPES.HEADLINE_END, 'Event 6 is HEADLINE_END');

  assert(singleEvents[2].duration === 4000, 'TEXT_HOLD duration is 4000ms (Stage 3 Hold)');
  assert(singleEvents[0].duration === 300, 'BAR_IN duration is 300ms (Stage 1 Reveal)');
  assert(singleEvents[1].duration === 300, 'TEXT_IN duration is 300ms (Stage 2 Reveal)');

  // Test 2.2: Playlist Timeline Build
  const playlistHeadlines = [
    'తెలంగాణలో కొత్త పరిశ్రమల స్థాపన',
    'ఉప్పల్ స్టేడియంలో క్రికెట్ మ్యాచ్ ప్లాన్'
  ];
  const playlistEvents = builder.buildPlaylistTimeline(playlistHeadlines);
  assert(playlistEvents[0].type === EVENT_TYPES.BAR_IN, 'Playlist starts with BAR_IN');

  const textInEvents = playlistEvents.filter(e => e.type === EVENT_TYPES.TEXT_IN);
  assert(textInEvents.length === 2, 'Playlist contains 2 TEXT_IN events for 2 headlines');

  assert(playlistEvents[playlistEvents.length - 2].type === EVENT_TYPES.BAR_OUT, 'Playlist ends with BAR_OUT');
  assert(playlistEvents[playlistEvents.length - 1].type === EVENT_TYPES.HEADLINE_END, 'Playlist terminates with HEADLINE_END');

  // Test 2.3: Invalid Headline Rejections
  assertThrows(
    () => builder.validateHeadline(''),
    'empty',
    'Empty headline string is rejected'
  );
  assertThrows(
    () => builder.validateHeadline('   '),
    'empty',
    'Whitespace-only headline is rejected'
  );
  assertThrows(
    () => builder.validateHeadline(null),
    'null or undefined',
    'Null headline input is rejected'
  );
  assertThrows(
    () => builder.buildPlaylistTimeline([]),
    'non-empty array',
    'Empty playlist array is rejected'
  );

  // ----------------------------------------------------
  // SECTION 3: HeadlineStateMachine Verification
  // ----------------------------------------------------
  const sm = new HeadlineStateMachine();
  assert(sm.getState() === HEADLINE_STATES.IDLE, 'State machine initializes to IDLE state');

  // Test 3.1: Sequential Valid Transitions
  sm.transitionTo(HEADLINE_STATES.BAR_IN);
  assert(sm.getState() === HEADLINE_STATES.BAR_IN, 'Transition to BAR_IN successful');

  sm.transitionTo(HEADLINE_STATES.TEXT_IN);
  assert(sm.getState() === HEADLINE_STATES.TEXT_IN, 'Transition to TEXT_IN successful');

  sm.transitionTo(HEADLINE_STATES.HOLD);
  assert(sm.getState() === HEADLINE_STATES.HOLD, 'Transition to HOLD successful');

  sm.transitionTo(HEADLINE_STATES.TEXT_OUT);
  assert(sm.getState() === HEADLINE_STATES.TEXT_OUT, 'Transition to TEXT_OUT successful');

  sm.transitionTo(HEADLINE_STATES.BAR_OUT);
  assert(sm.getState() === HEADLINE_STATES.BAR_OUT, 'Transition to BAR_OUT successful');

  sm.transitionTo(HEADLINE_STATES.COMPLETE);
  assert(sm.getState() === HEADLINE_STATES.COMPLETE, 'Transition to COMPLETE successful');

  // Test 3.2: Illegal Transition Rejection (No State Skipping)
  sm.reset();
  assert(sm.getState() === HEADLINE_STATES.IDLE, 'State machine reset to IDLE');

  assertThrows(
    () => sm.transitionTo(HEADLINE_STATES.HOLD),
    'Illegal state transition',
    'Direct jump from IDLE to HOLD is blocked'
  );

  assertThrows(
    () => sm.transitionTo(HEADLINE_STATES.TEXT_OUT),
    'Illegal state transition',
    'Direct jump from IDLE to TEXT_OUT is blocked'
  );

  sm.transitionTo(HEADLINE_STATES.BAR_IN);
  assertThrows(
    () => sm.transitionTo(HEADLINE_STATES.HOLD),
    'Illegal state transition',
    'Direct jump from BAR_IN to HOLD (skipping TEXT_IN) is blocked'
  );

  // Test 3.3: Listener Notifications
  let notifiedState = null;
  const unsubscribe = sm.onStateChange((from, to) => {
    notifiedState = to;
  });
  sm.transitionTo(HEADLINE_STATES.TEXT_IN);
  assert(notifiedState === HEADLINE_STATES.TEXT_IN, 'State listener correctly notified of transition to TEXT_IN');
  unsubscribe();

  // ----------------------------------------------------
  // SECTION 4: HeadlinePlaybackContract Verification
  // ----------------------------------------------------
  assertThrows(
    () => new HeadlinePlaybackContract(),
    'Cannot instantiate Abstract Playback Contract directly',
    'Instantiating Abstract HeadlinePlaybackContract directly throws error'
  );

  class MockController extends HeadlinePlaybackContract {
    load(headlines) { return 'loaded'; }
    play() { return 'playing'; }
    pause() {}
    resume() {}
    stop() {}
    next() {}
    previous() {}
    reset() {}
    destroy() {}
  }

  const mock = new MockController();
  assert(mock.load([]) === 'loaded', 'Subclass implementing load() succeeds');
  assert(mock.play() === 'playing', 'Subclass implementing play() succeeds');

  console.log('====================================================');
  console.log('✅ ALL TASK P1-1 PRIMARY HEADLINE ARCHITECTURE TESTS PASSED!');
  console.log('====================================================');
}

// Execute tests if invoked directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('primary-headline-architecture.test.js')) {
  runTests();
}
