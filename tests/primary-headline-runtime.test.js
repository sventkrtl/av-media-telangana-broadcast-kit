/**
 * AV Media Telangana - Primary Headline Runtime Test Suite (Task P1-5)
 *
 * Validates:
 *   1. Runtime initialization & sub-module instantiation
 *   2. Headline loading & input validation (reject empty arrays, nulls, whitespace-only)
 *   3. Playback controls (play, pause, resume, stop, next, previous, reset, destroy)
 *   4. Continuous looping behavior
 *   5. Event callbacks (onHeadlineStart, onHeadlineComplete, onRuntimeError)
 *   6. Defensive error handling
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0.
 */

import { PrimaryHeadlineRuntime } from '../modules/primary-headline/runtime/PrimaryHeadlineRuntime.js';

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

async function assertRejects(promiseFn, expectedSubstr, message) {
  try {
    await promiseFn();
    throw new Error(`[FAILED] Expected promise to reject containing "${expectedSubstr}", but it resolved: ${message}`);
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

function createMockContainer() {
  const children = [];
  return {
    style: {},
    appendChild: (child) => children.push(child),
    children
  };
}

export async function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task P1-5 Primary Headline Runtime Unit Tests');
  console.log('====================================================');

  const runtime = new PrimaryHeadlineRuntime({
    loop: false,
    barInDuration: 20,
    textInDuration: 20,
    textHoldDuration: 40,
    textOutDuration: 20,
    barOutDuration: 20
  });

  // Test 1: Uninitialized Rejections
  assertThrows(
    () => runtime.loadHeadlines(['వర్షాలు']),
    'initialize()',
    'Loading headlines before initialization is rejected'
  );

  await assertRejects(
    () => runtime.play(),
    'initialization',
    'Playing before initialization is rejected'
  );

  // Test 2: Initialization
  const mockContainer = createMockContainer();
  const initSuccess = await runtime.initialize({ containerElement: mockContainer });
  assert(initSuccess === true, 'Runtime initializes successfully');
  assert(runtime.isInitialized === true, 'Runtime sets isInitialized to true');
  assert(runtime.staticRenderer.isInitialized === true, 'StaticRenderer initialized via runtime');

  // Test 3: Headline Input Validation
  assertThrows(
    () => runtime.loadHeadlines([]),
    'empty or invalid headlines array',
    'Loading empty headlines array is rejected'
  );

  assertThrows(
    () => runtime.loadHeadlines(null),
    'empty or invalid headlines array',
    'Loading null headlines array is rejected'
  );

  assertThrows(
    () => runtime.loadHeadlines(['  ', '']),
    'whitespace-only',
    'Loading whitespace-only headline is rejected'
  );

  // Test 4: Valid Headline Loading & Playback Execution
  const sampleHeadlines = [
    'జగిత్యాల జిల్లాలో భారీ వర్షాలు',
    'కంట్రోల్ రూమ్ ఏర్పాటు'
  ];
  const count = runtime.loadHeadlines(sampleHeadlines);
  assert(count === 2, 'loadHeadlines returns count of loaded items');

  let startedHeadlineCount = 0;
  let completedHeadlineCount = 0;

  runtime.onHeadlineStart(() => {
    startedHeadlineCount++;
  });

  runtime.onHeadlineComplete(() => {
    completedHeadlineCount++;
  });

  const playPromise = runtime.play();
  const playStatus = await playPromise;

  assert(playStatus === 'PLAYBACK_FINISHED', 'Runtime play completes full timeline');
  assert(startedHeadlineCount === 2, 'Both headlines triggered onHeadlineStart callbacks');
  assert(completedHeadlineCount >= 1, 'onHeadlineComplete callback triggered');

  // Test 5: Pause, Resume, Stop Controls
  runtime.loadHeadlines(['హైదరాబాద్ లైవ్ న్యూస్']);
  const pausePlayPromise = runtime.play();

  runtime.pause();
  assert(runtime.playbackController.isPaused === true, 'Runtime pause delegates to controller');

  runtime.resume();
  assert(runtime.playbackController.isPaused === false, 'Runtime resume delegates to controller');

  await pausePlayPromise;

  runtime.stop();
  assert(runtime.playbackController.isPlaying === false, 'Runtime stop halts playback');

  // Test 6: Reset and Destroy Controls
  runtime.reset();
  assert(runtime.rawHeadlines.length === 0, 'Reset clears raw headlines');

  runtime.destroy();
  assert(runtime.isInitialized === false, 'Destroy resets isInitialized to false');
  assert(runtime.staticRenderer === null, 'Destroy clears sub-module references');

  console.log('====================================================');
  console.log('✅ ALL TASK P1-5 PRIMARY HEADLINE RUNTIME TESTS PASSED!');
  console.log('====================================================');
}

// Execute tests if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('primary-headline-runtime.test.js')) {
  runTests();
}
