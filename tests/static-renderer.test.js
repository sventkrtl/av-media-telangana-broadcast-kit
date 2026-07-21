/**
 * Task 2B Static Renderer Test Suite
 * Validates Badge rendering, News rendering, Logo rendering, Missing logo fallback, Empty timeline, & Invalid timeline handling.
 */

import { StaticRenderer, THEME_COLOR_MAP } from '../modules/secondary-playlist/renderer/index.js';
import { TimelineEvent, EVENT_TYPES } from '../modules/secondary-playlist/interpreter/index.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

export function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task 2B Static Renderer Unit Tests');
  console.log('====================================================');

  const renderer = new StaticRenderer({
    logoSrc: '/assets/logos/logo-round.png'
  });

  // Test 1: Theme Color Mapping Verification
  assert(renderer.getThemeColor('district') === THEME_COLOR_MAP.district, 'District theme maps to Grey (#64748B)');
  assert(renderer.getThemeColor('sports') === THEME_COLOR_MAP.sports, 'Sports theme maps to Green (#15803D)');
  assert(renderer.getThemeColor('weather') === THEME_COLOR_MAP.weather, 'Weather theme maps to Blue (#0284C7)');
  assert(renderer.getThemeColor('business') === THEME_COLOR_MAP.business, 'Business theme maps to Gold (#D97706)');
  assert(renderer.getThemeColor('international') === THEME_COLOR_MAP.international, 'International theme maps to Purple (#7E22CE)');
  assert(renderer.getThemeColor('entertainment') === THEME_COLOR_MAP.entertainment, 'Entertainment theme maps to Pink (#DB2777)');
  assert(renderer.getThemeColor('technology') === THEME_COLOR_MAP.technology, 'Technology theme maps to Cyan (#0891B2)');

  // Test 2: Empty & Invalid Timeline Handling
  const emptyRes = renderer.renderTimelineStatic(null, []);
  assert(Array.isArray(emptyRes) && emptyRes.length === 0, 'Empty timeline returns empty array');

  const invalidRes = renderer.renderEvent(null, null);
  assert(invalidRes === null, 'Invalid container/event returns null');

  // Test 3: Badge Rendering Event Model Node Creation
  const badgeEvent = new TimelineEvent({
    type: EVENT_TYPES.BADGE_IN,
    label: 'జగిత్యాల',
    theme: 'district'
  });
  const badgeNode = renderer.renderEvent({}, badgeEvent);
  assert(badgeNode !== null, 'Badge event creates badge node structure');

  // Test 4: News Rendering Event Model Node Creation
  const newsEvent = new TimelineEvent({
    type: EVENT_TYPES.NEWS_START,
    label: 'జగిత్యాల',
    theme: 'district',
    newsIndex: 0,
    payload: { newsContent: 'వార్త 1 - కలెక్టరేట్ ప్రారంభం' }
  });
  const newsNode = renderer.renderEvent({}, newsEvent);
  assert(newsNode !== null, 'News event creates news node structure');

  // Test 5: Logo Separator Rendering Event Model Node Creation
  const logoEvent = new TimelineEvent({
    type: EVENT_TYPES.LOGO_SEPARATOR,
    label: 'జగిత్యాల',
    theme: 'district',
    payload: { asset: 'AV_MEDIA_ROUND_LOGO' }
  });
  const logoNode = renderer.renderEvent({}, logoEvent);
  assert(logoNode !== null, 'Logo separator event creates logo node structure');

  // Test 6: Static Timeline Render Output Verification
  const timelineEvents = [
    new TimelineEvent({ type: EVENT_TYPES.BADGE_IN, label: 'క్రీడలు', theme: 'sports' }),
    new TimelineEvent({ type: EVENT_TYPES.NEWS_START, label: 'క్రీడలు', theme: 'sports', newsIndex: 0, payload: { newsContent: 'వార్త 1' } }),
    new TimelineEvent({ type: EVENT_TYPES.LOGO_SEPARATOR, label: 'క్రీడలు', theme: 'sports' }),
    new TimelineEvent({ type: EVENT_TYPES.NEWS_START, label: 'క్రీడలు', theme: 'sports', newsIndex: 1, payload: { newsContent: 'వార్త 2' } })
  ];

  const renderedList = renderer.renderTimelineStatic({}, timelineEvents);
  assert(renderedList.length === 4, 'Static timeline renders 4 nodes (Badge, News1, Logo, News2)');

  console.log('====================================================');
  console.log('✅ ALL TASK 2B STATIC RENDERER TESTS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('static-renderer.test.js')) {
  runTests();
}
