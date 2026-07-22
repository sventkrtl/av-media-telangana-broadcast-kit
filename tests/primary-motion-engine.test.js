/**
 * AV Media Telangana - Primary Motion Engine Test Suite (Task P1-2)
 *
 * Validates:
 *   1. 5-Stage Motion Lifecycle execution (BAR_IN, TEXT_IN, TEXT_HOLD, TEXT_OUT, BAR_OUT)
 *   2. Custom and default stage durations
 *   3. Overlapping stage call blocking
 *   4. Invalid stage rejection
 *   5. Pause / Resume playback controls
 *   6. Reset and Destroy lifecycle methods
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0.
 */

import { PrimaryMotionEngine, MOTION_STAGES } from '../modules/primary-headline/motion/PrimaryMotionEngine.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
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

// Mock element helper for Node execution
function createMockElement() {
  return {
    style: {
      willChange: '',
      transform: '',
      transformOrigin: '',
      clipPath: '',
      opacity: '',
      transition: ''
    }
  };
}

export async function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task P1-2 Primary Motion Engine Unit Tests');
  console.log('====================================================');

  const mockBar = createMockElement();
  const mockText = createMockElement();

  // Test 1: Fast test engine instance (using reduced durations for test speed)
  const engine = new PrimaryMotionEngine({
    barInDuration: 50,
    textInDuration: 50,
    textHoldDuration: 100,
    textOutDuration: 50,
    barOutDuration: 50
  });

  // Test 1.1: BAR_IN Stage
  const barInRes = await engine.play(MOTION_STAGES.BAR_IN, mockBar, mockText);
  assert(barInRes.status === 'STAGE_COMPLETE', 'BAR_IN stage completes successfully');
  assert(barInRes.stage === 'BAR_IN', 'BAR_IN stage name returned correctly');
  assert(mockBar.style.transform === 'scaleX(1)', 'BAR_IN applies scaleX(1) to bar element');
  assert(mockBar.style.transformOrigin === 'left center', 'BAR_IN applies transform-origin: left center');

  // Test 1.2: TEXT_IN Stage
  const textInRes = await engine.play(MOTION_STAGES.TEXT_IN, mockBar, mockText);
  assert(textInRes.status === 'STAGE_COMPLETE', 'TEXT_IN stage completes successfully');
  assert(mockText.style.clipPath === 'inset(0 0% 0 0%)', 'TEXT_IN applies clip-path inset(0 0% 0 0%) for center reveal');
  assert(mockText.style.opacity === '1', 'TEXT_IN applies opacity: 1');

  // Test 1.3: TEXT_HOLD Stage
  const holdRes = await engine.play(MOTION_STAGES.TEXT_HOLD, mockBar, mockText);
  assert(holdRes.status === 'STAGE_COMPLETE', 'TEXT_HOLD stage completes successfully');
  assert(holdRes.durationMs === 100, 'TEXT_HOLD respects configured duration');

  // Test 1.4: TEXT_OUT Stage
  const textOutRes = await engine.play(MOTION_STAGES.TEXT_OUT, mockBar, mockText);
  assert(textOutRes.status === 'STAGE_COMPLETE', 'TEXT_OUT stage completes successfully');
  assert(mockText.style.clipPath === 'inset(0 50% 0 50%)', 'TEXT_OUT applies clip-path inset(0 50% 0 50%) for center collapse');
  assert(mockText.style.opacity === '0', 'TEXT_OUT applies opacity: 0');

  // Test 1.5: BAR_OUT Stage
  const barOutRes = await engine.play(MOTION_STAGES.BAR_OUT, mockBar, mockText);
  assert(barOutRes.status === 'STAGE_COMPLETE', 'BAR_OUT stage completes successfully');
  assert(mockBar.style.transform === 'scaleX(0)', 'BAR_OUT applies scaleX(0) to bar element');
  assert(mockBar.style.transformOrigin === 'right center', 'BAR_OUT applies transform-origin: right center');

  // ----------------------------------------------------
  // SECTION 2: Overlapping & Invalid Call Protections
  // ----------------------------------------------------
  await assertRejects(
    () => engine.play('INVALID_STAGE', mockBar, mockText),
    'Invalid motion stage',
    'Invalid motion stage call is rejected'
  );

  const longEngine = new PrimaryMotionEngine({ textHoldDuration: 500 });
  const activePromise = longEngine.play(MOTION_STAGES.TEXT_HOLD, mockBar, mockText);

  await assertRejects(
    () => longEngine.play(MOTION_STAGES.TEXT_OUT, mockBar, mockText),
    'Overlapping stage call blocked',
    'Overlapping stage call during active animation is blocked'
  );

  await activePromise; // Clean up active hold stage

  // ----------------------------------------------------
  // SECTION 3: Pause, Resume, Reset & Destroy
  // ----------------------------------------------------
  const pauseEngine = new PrimaryMotionEngine({ textHoldDuration: 200 });
  const playPromise = pauseEngine.play(MOTION_STAGES.TEXT_HOLD, mockBar, mockText);

  pauseEngine.pause();
  assert(pauseEngine.isPaused === true, 'Pause halts active animation');

  pauseEngine.resume();
  assert(pauseEngine.isPaused === false, 'Resume restores active animation');
  await playPromise;

  pauseEngine.reset();
  assert(pauseEngine.isAnimating === false, 'Reset halts animation and resets state');
  assert(pauseEngine.currentBarElement === null, 'Reset clears element references');

  pauseEngine.destroy();
  assert(pauseEngine.currentStage === null, 'Destroy cleans up engine state');

  console.log('====================================================');
  console.log('✅ ALL TASK P1-2 PRIMARY MOTION ENGINE TESTS PASSED!');
  console.log('====================================================');
}

// Execute tests if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('primary-motion-engine.test.js')) {
  runTests();
}
