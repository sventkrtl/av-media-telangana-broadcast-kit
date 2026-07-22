/**
 * AV Media Telangana - Primary Static Renderer Test Suite (Task P1-3)
 *
 * Validates:
 *   1. DOM Hierarchy initialization (container, bar, text)
 *   2. Headline text rendering & sanitization (single-line, emoji/bullet stripping, newline collapse)
 *   3. Center alignment & color rules (Always Blue bar, Always White text)
 *   4. Clear & Destroy lifecycle
 *   5. Error handling (null container, uninitialized rendering)
 *
 * Strictly adheres to PRIMARY_HEADLINE_ENGINE_SPEC.md v1.0.
 */

import { PrimaryStaticRenderer, PRIMARY_RENDER_CONSTANTS } from '../modules/primary-headline/renderer/PrimaryStaticRenderer.js';

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

// Mock container helper for Node execution
function createMockContainer() {
  const children = [];
  return {
    style: {},
    appendChild: (child) => children.push(child),
    children
  };
}

export function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task P1-3 Primary Static Renderer Unit Tests');
  console.log('====================================================');

  const renderer = new PrimaryStaticRenderer();

  // Test 1: Initialization Error Handling
  assertThrows(
    () => renderer.initialize(null),
    'Container element is required',
    'Initializing with null container throws error'
  );

  assertThrows(
    () => renderer.renderHeadline('వర్షాలు'),
    'initialize()',
    'Rendering headline before initialization throws error'
  );

  // Test 2: DOM Hierarchy Initialization
  const mockContainer = createMockContainer();
  const domRefs = renderer.initialize(mockContainer);

  assert(renderer.isInitialized === true, 'Renderer initializes successfully');
  assert(domRefs.barElement !== null, 'Blue Bar element created');
  assert(domRefs.textElement !== null, 'Headline Text element created');
  assert(domRefs.barElement.style.backgroundColor === PRIMARY_RENDER_CONSTANTS.BAR_BG_COLOR, 'Blue Bar uses Always Blue color (#0F172A)');
  assert(domRefs.textElement.style.color === PRIMARY_RENDER_CONSTANTS.TEXT_COLOR, 'Headline Text uses Always White color (#FFFFFF)');
  assert(domRefs.textElement.style.textAlign === 'center', 'Headline Text is center aligned');

  // Test 3: Text Sanitization & Single Line Enforcement
  const clean1 = renderer.sanitizeHeadlineText('వార్త 1 \n వార్త 2 \r\n వార్త 3');
  assert(!clean1.includes('\n') && !clean1.includes('\r'), 'Newlines stripped and collapsed to single line');

  const clean2 = renderer.sanitizeHeadlineText('✦ హైదరాబాద్ వార్తలు 😀');
  assert(!clean2.includes('✦') && !clean2.includes('😀'), 'Icons and emojis stripped');

  const rendered = renderer.renderHeadline('   ధర్మపురి గోదావరి పుష్కర ఘాట్ వద్ద పెరిగిన నీటిమట్టం   ');
  assert(rendered === 'ధర్మపురి గోదావరి పుష్కర ఘాట్ వద్ద పెరిగిన నీటిమట్టం', 'Rendered text trimmed properly');
  assert(renderer.currentText === 'ధర్మపురి గోదావరి పుష్కర ఘాట్ వద్ద పెరిగిన నీటిమట్టం', 'currentText state updated');

  // Test 4: Clear Method
  renderer.clear();
  assert(renderer.currentText === '', 'Clear resets currentText to empty string');
  assert(domRefs.textElement.textContent === '', 'Clear empties textElement textContent');

  // Test 5: Destroy Method
  renderer.destroy();
  assert(renderer.isInitialized === false, 'Destroy resets isInitialized to false');
  assert(renderer.containerElement === null, 'Destroy clears container reference');
  assert(renderer.barElement === null, 'Destroy clears bar reference');
  assert(renderer.textElement === null, 'Destroy clears text reference');

  console.log('====================================================');
  console.log('✅ ALL TASK P1-3 PRIMARY STATIC RENDERER TESTS PASSED!');
  console.log('====================================================');
}

// Execute tests if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('primary-static-renderer.test.js')) {
  runTests();
}
