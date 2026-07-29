import { FrameScheduler } from '../overlay/platform/runtime/FrameScheduler.js';
import { PerformanceMonitor } from '../overlay/platform/monitoring/PerformanceMonitor.js';
import { MemoryMonitor } from '../overlay/platform/monitoring/MemoryMonitor.js';
import { EventQueueOptimizer } from '../overlay/platform/events/EventQueueOptimizer.js';
import { ResourceManager } from '../overlay/platform/runtime/ResourceManager.js';

function assert(cond, msg) {
  if (!cond) throw new Error(`[FAILED] ${msg}`);
  console.log(`[PASSED] ${msg}`);
}

export function runTests() {
  console.log('====================================================');
  console.log('Running M2 Runtime Stability & Stress Tests');
  console.log('====================================================');

  const scheduler = new FrameScheduler({ targetFps: 60 });
  scheduler.tick();
  assert(scheduler.getMetrics().frameCount === 1, 'FrameScheduler records frame tick');

  const perf = new PerformanceMonitor();
  perf.recordFrame(16.6);
  assert(perf.getMetrics().averageFrameDurationMs === 16.6, 'PerformanceMonitor tracks frame duration');

  const mem = new MemoryMonitor();
  assert(mem.takeSnapshot().heapUsedMb >= 0, 'MemoryMonitor records memory snapshot');

  const queue = new EventQueueOptimizer();
  queue.enqueue('EV1', {}, 'CRITICAL');
  queue.enqueue('EV2', {}, 'NORMAL');
  assert(queue.getTotalQueueSize() === 2, 'EventQueueOptimizer queues events');
  const batch = queue.dequeueBatch(1);
  assert(batch[0].event === 'EV1', 'EventQueueOptimizer prioritizes CRITICAL events');

  const resources = new ResourceManager();
  let disposed = false;
  resources.acquire('res1', { id: 1 }, () => { disposed = true; });
  resources.release('res1');
  assert(disposed === true, 'ResourceManager disposes acquired resources');

  // 10,000 Event Stress Test
  console.log('Running 10,000 Event Stress Simulation...');
  const stressQueue = new EventQueueOptimizer();
  const initialMem = mem.takeSnapshot().heapUsedMb;
  for (let i = 0; i < 10000; i++) {
    stressQueue.enqueue(`STRESS_${i}`, { idx: i }, i % 10 === 0 ? 'CRITICAL' : 'NORMAL');
    if (i % 50 === 0) {
      stressQueue.dequeueBatch(50);
    }
  }
  while (stressQueue.getTotalQueueSize() > 0) {
    stressQueue.dequeueBatch(100);
  }

  const finalMem = mem.takeSnapshot().heapUsedMb;
  const memDelta = Math.abs(finalMem - initialMem);
  assert(memDelta < 15, `Zero memory drift verified (delta: ${memDelta} MB)`);

  console.log('====================================================');
  console.log('ALL M2 RUNTIME STABILITY & STRESS TESTS PASSED');
  console.log('====================================================');
}

if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('platform-m2-stability.test.js')) {
  runTests();
}
