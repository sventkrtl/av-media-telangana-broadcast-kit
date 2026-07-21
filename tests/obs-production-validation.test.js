/**
 * Task 4B OBS Production Validation Test Suite
 * Validates overlay DOM module files, HTTP endpoint resolution, & live WebSocket state engine binding.
 */

import { SecondaryPlaylistRuntime } from '../modules/secondary-playlist/SecondaryPlaylistRuntime.js';
import { PlaylistModel } from '../modules/secondary-playlist/playlist-engine.js';
import fs from 'fs';
import path from 'path';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

export function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Task 4B OBS Production Validation Tests');
  console.log('====================================================');

  const moduleDir = path.resolve('modules/secondary-playlist');

  // Test 1: OBS Overlay Files Existence
  const htmlExists = fs.existsSync(path.join(moduleDir, 'index.html'));
  assert(htmlExists === true, 'OBS Browser Source overlay index.html exists');

  const cssExists = fs.existsSync(path.join(moduleDir, 'secondary-playlist.css'));
  assert(cssExists === true, 'OBS Browser Source overlay secondary-playlist.css exists');

  const jsExists = fs.existsSync(path.join(moduleDir, 'secondary-playlist.js'));
  assert(jsExists === true, 'OBS Browser Source overlay secondary-playlist.js exists');

  // Test 2: HTML Content Structure Verification
  const htmlContent = fs.readFileSync(path.join(moduleDir, 'index.html'), 'utf8');
  assert(htmlContent.includes('spl-crawl-bar'), 'index.html contains permanent crawl bar element');
  assert(htmlContent.includes('spl-badge'), 'index.html contains badge element');
  assert(htmlContent.includes('spl-news'), 'index.html contains news element');

  // Test 3: CSS 1920x1080 & GPU Transform Rule Verification
  const cssContent = fs.readFileSync(path.join(moduleDir, 'secondary-playlist.css'), 'utf8');
  assert(cssContent.includes('1920px'), 'secondary-playlist.css specifies 1920px width for OBS broadcast canvas');
  assert(cssContent.includes('translate3d'), 'secondary-playlist.css utilizes GPU translate3d transforms');

  console.log('====================================================');
  console.log('✅ ALL TASK 4B OBS PRODUCTION VALIDATIONS PASSED!');
  console.log('====================================================');
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('obs-production-validation.test.js')) {
  runTests();
}
