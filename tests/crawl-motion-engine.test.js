/**
 * Task 3B Crawl Motion Engine Test Suite
 * Validates short news, long news, 300+ char news, constant speed, & dynamic duration calculation.
 */

import { CrawlMotionEngine } from '../modules/secondary-playlist/motion/index.js';
import { TimelineEvent, EVENT_TYPES } from '../modules/secondary-playlist/interpreter/index.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

class MockElement {
  constructor() {
    this.style = { transform: '', willChange: '', transition: '' };
    this.offsetWidth = 0;
  }
}

export async function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task 3B Crawl Motion Engine Unit Tests');
  console.log('====================================================');

  const crawlEngine = new CrawlMotionEngine({
    pixelsPerSecond: 100, // Constant velocity = 100px / sec
    configuredGap: 50
  });

  const viewportWidth = 1920;

  // Test 1: Metric Formula Calculation Verification
  // TravelDistance = TextWidth (200) + Viewport (1920) + Gap (50) = 2170px
  // Duration = 2170 / 100 = 21.7s = 21700ms
  const metricsShort = crawlEngine.calculateCrawlMetrics(200, viewportWidth);
  assert(metricsShort.travelDistance === 2170, 'Short news travel distance is 2170px');
  assert(metricsShort.durationSeconds === 21.7, 'Short news duration is 21.7 seconds');
  assert(metricsShort.durationMs === 21700, 'Short news duration is 21700 ms');
  assert(metricsShort.startX === 1970, 'StartX is Viewport + Gap (1970px)');
  assert(metricsShort.endX === -200, 'EndX is -TextWidth (-200px)');

  // Test 2: Long News Metric Formula Verification
  // TravelDistance = TextWidth (1000) + Viewport (1920) + Gap (50) = 2970px
  // Duration = 2970 / 100 = 29.7s = 29700ms
  const metricsLong = crawlEngine.calculateCrawlMetrics(1000, viewportWidth);
  assert(metricsLong.travelDistance === 2970, 'Long news travel distance is 2970px');
  assert(metricsLong.durationSeconds === 29.7, 'Long news duration is 29.7 seconds');
  assert(metricsLong.durationMs === 29700, 'Long news duration is 29.700 ms');

  // Test 3: Very Long News (300+ characters) Verification
  const veryLongText = 'తెలంగాణ వర్షాలు అప్‌డేట్: రాష్ట్రవ్యాప్తంగా విస్తారంగా వర్షాలు కురుస్తున్నాయి. హైదరాబాద్, వరంగల్, ఖమ్మం, కరీంనగర్ జిల్లాల్లో రహదారులు జలమయమయ్యాయి. లోతట్టు ప్రాంతాల ప్రజలను సురక్షిత ప్రాంతాలకు తరలిస్తున్నారు. విపత్తు నిర్వహణ బృందాలు అలర్ట్ అయ్యాయి. కలెక్టర్ల కార్యాలయాల్లో కంట్రోల్ రూమ్‌లు ఏర్పాటు చేశారు.'.repeat(2);
  assert(veryLongText.length >= 300, 'Test headline contains 300+ characters');

  const estimatedWidth = crawlEngine.estimateTextWidth(veryLongText);
  assert(estimatedWidth >= 3000, '300+ character news estimated text width exceeds 3000px');

  const metricsVeryLong = crawlEngine.calculateCrawlMetrics(estimatedWidth, viewportWidth);
  assert(metricsVeryLong.durationSeconds > metricsLong.durationSeconds, 'Very long news duration exceeds long news duration organically');

  // Test 4: Speed Setting Modification Verification
  crawlEngine.setSpeed(200); // Double speed to 200px/sec
  const metricsFast = crawlEngine.calculateCrawlMetrics(1000, viewportWidth);
  assert(metricsFast.durationSeconds === 14.85, 'Doubling pixelsPerSecond halves the scroll duration (29.7s -> 14.85s)');

  // Test 5: Mock Element Crawl Execution Verification
  const mockEl = new MockElement();
  mockEl.offsetWidth = 500;

  const event = new TimelineEvent({
    type: EVENT_TYPES.NEWS_START,
    label: 'తాజా వార్తలు',
    newsIndex: 0,
    payload: { newsContent: 'వార్త 1' }
  });

  const crawlResult = await crawlEngine.processEvent(mockEl, event, viewportWidth);
  assert(crawlResult !== null && crawlResult.status === 'CRAWL_COMPLETE', 'Crawl execution returns CRAWL_COMPLETE');
  assert(mockEl.style.transform.includes('translate3d(-500px, 0, 0)'), 'News element transforms to -500px end position');

  console.log('====================================================');
  console.log('✅ ALL TASK 3B CRAWL MOTION ENGINE TESTS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('crawl-motion-engine.test.js')) {
  runTests();
}
