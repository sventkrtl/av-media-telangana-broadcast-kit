/**
 * AV Media Telangana - Primary Playback Controller Test Suite (Task P1-4)
 *
 * Validates:
 *   1. Sequential stage execution order (BAR_IN -> TEXT_IN -> TEXT_HOLD -> TEXT_OUT -> BAR_OUT -> HEADLINE_END)
 *   2. Invalid timeline rejection
 *   3. Duplicate play() call protection
 *   4. Pause, Resume, Stop, Reset, and Destroy lifecycle
 *   5. Event callbacks (onStageStart, onStageComplete, onHeadlineComplete)
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0.
 */

import { PrimaryTimelinePlaybackController } from '../modules/primary-headline/playback/PrimaryTimelinePlaybackController.js';
import { HeadlineTimelineBuilder } from '../modules/primary-headline/HeadlineTimelineBuilder.js';
import { PrimaryMotionEngine, MOTION_STAGES } from '../modules/primary-headline/motion/PrimaryMotionEngine.js';

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

function createMockElement() {
  return {
    style: {
      willChange: '', transform: '', transformOrigin: '', clipPath: '', opacity: '', transition: ''
    }
  };
}

export async function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task P1-4 Primary Playback Controller Unit Tests');
  console.log('====================================================');

  const builder = new HeadlineTimelineBuilder({
    holdDuration: 50,
    revealDuration: 30,
    hideDuration: 30
  });

  const fastMotionEngine = new PrimaryMotionEngine({
    barInDuration: 30,
    textInDuration: 30,
    textHoldDuration: 50,
    textOutDuration: 30,
    barOutDuration: 30
  });

  const controller = new PrimaryTimelinePlaybackController({
    motionEngine: fastMotionEngine,
    loop: false
  });

  const mockBar = createMockElement();
  const mockText = createMockElement();

  // Test 1: Invalid Timeline Rejections
  assertThrows(
    () => controller.load([]),
    'empty or invalid timeline',
    'Loading empty timeline array throws error'
  );

  await assertRejects(
    () => controller.play(),
    'No loaded timeline events exist',
    'Playing without loading timeline throws error'
  );

  // Test 2: Valid Timeline Loading & Event Sequence Verification
  const timeline = builder.buildSingleTimeline('హైదరాబాద్‌లో భారీ వర్షాలు');
  controller.load(timeline);
  assert(controller.timeline.length === 6, 'Timeline loaded successfully with 6 events');

  // Test 3: Event Callback Registration & Sequential Execution
  const stageStarts = [];
  const stageCompletes = [];
  let headlineCompleted = false;

  controller.onStageStart(e => stageStarts.push(e.type));
  controller.onStageComplete(e => stageCompletes.push(e.type));
  controller.onHeadlineComplete(() => { headlineCompleted = true; });

  const playPromise = controller.play({ barElement: mockBar, textElement: mockText });

  // Test 4: Duplicate Play Protection
  await assertRejects(
    () => controller.play({ barElement: mockBar, textElement: mockText }),
    'Duplicate play() request rejected',
    'Duplicate play() call while actively playing is blocked'
  );

  const status = await playPromise;
  assert(status === 'PLAYBACK_FINISHED', 'Single timeline playback completed successfully');

  assert(stageStarts.join('->') === 'BAR_IN->TEXT_IN->TEXT_HOLD->TEXT_OUT->BAR_OUT->HEADLINE_END', 'Stage starts executed in strict sequential order');
  assert(stageCompletes.join('->') === 'BAR_IN->TEXT_IN->TEXT_HOLD->TEXT_OUT->BAR_OUT->HEADLINE_END', 'Stage completes executed in strict sequential order');
  assert(headlineCompleted === true, 'onHeadlineComplete callback triggered');

  // Test 5: Pause & Resume Controls
  const pauseController = new PrimaryTimelinePlaybackController({
    motionEngine: new PrimaryMotionEngine({ textHoldDuration: 200 }),
    loop: false
  });
  pauseController.load(builder.buildSingleTimeline('పాజ్ అండ్ రెజ్యూమ్'));

  const pausePlayPromise = pauseController.play({ barElement: mockBar, textElement: mockText });
  setTimeout(() => pauseController.pause(), 40);

  setTimeout(() => {
    assert(pauseController.isPaused === true, 'Playback correctly transitions to paused state');
    pauseController.resume();
    assert(pauseController.isPaused === false, 'Playback correctly resumes from paused state');
  }, 100);

  await pausePlayPromise;

  // Test 6: Stop & Reset Controls
  const stopController = new PrimaryTimelinePlaybackController({
    motionEngine: new PrimaryMotionEngine({ textHoldDuration: 500 }),
    loop: false
  });
  stopController.load(builder.buildSingleTimeline('స్టాప్ టెస్ట్'));
  stopController.play({ barElement: mockBar, textElement: mockText });

  stopController.stop();
  assert(stopController.isPlaying === false, 'Stop halts playback');
  assert(stopController.currentIndex === 0, 'Stop resets current index to 0');

  stopController.reset();
  assert(stopController.timeline.length === 0, 'Reset clears loaded timeline');

  stopController.destroy();
  assert(stopController.isDestroyed === true, 'Destroy flags controller as destroyed');

  console.log('====================================================');
  console.log('✅ ALL TASK P1-4 PRIMARY PLAYBACK CONTROLLER TESTS PASSED!');
  console.log('====================================================');
}

// Execute tests if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('primary-playback-controller.test.js')) {
  runTests();
}
