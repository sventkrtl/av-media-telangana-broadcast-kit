/**
 * Single Overlay Platform Kernel Walking Skeleton Tests
 * Validates M0-M5 architecture without importing legacy overlay engines.
 */

import fs from 'fs';
import path from 'path';
import { DEFAULT_LAYER_DEFINITIONS, KERNEL_STATES } from '../overlay/platform/constants.js';
import { OverlayRegistry } from '../overlay/platform/OverlayRegistry.js';
import { PlatformKernel } from '../overlay/platform/PlatformKernel.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAILED] ${message}`);
  }
  console.log(`[PASSED] ${message}`);
}

class MockClassList {
  constructor() {
    this.values = new Set();
  }

  add(value) {
    this.values.add(value);
  }

  remove(value) {
    this.values.delete(value);
  }

  contains(value) {
    return this.values.has(value);
  }
}

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.dataset = {};
    this.className = '';
    this.id = '';
    this.hidden = false;
    this.innerHTML = '';
    this.textContent = '';
    this.classList = new MockClassList();
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    this.children = this.children.filter((item) => item !== child);
    child.parentNode = null;
  }

  querySelector() {
    return null;
  }
}

class MockEventBus {
  constructor() {
    this.listeners = [];
    this.statusListeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  onStatusChange(callback) {
    this.statusListeners.push(callback);
    callback('CONNECTED');
  }

  emitMessage(message) {
    this.listeners.forEach((listener) => listener(message));
  }
}

function installDomMocks() {
  let frame = 0;
  global.document = {
    createElement: (tagName) => new MockElement(tagName)
  };
  global.requestAnimationFrame = (callback) => {
    frame += 1;
    if (frame <= 3) {
      setTimeout(() => callback(frame * 16), 0);
    }
    return frame;
  };
  global.cancelAnimationFrame = () => {};
}

function createRegistry() {
  const registry = new OverlayRegistry();
  DEFAULT_LAYER_DEFINITIONS.forEach((definition) => registry.register(definition));
  return registry;
}

export async function runTests() {
  console.log('====================================================');
  console.log('Running Single Overlay Platform Kernel Tests');
  console.log('====================================================');

  installDomMocks();

  const overlayDir = path.resolve('overlay');
  assert(fs.existsSync(path.join(overlayDir, 'index.html')), '/overlay/index.html exists');
  assert(fs.existsSync(path.join(overlayDir, 'overlay.js')), '/overlay/overlay.js exists');
  assert(fs.existsSync(path.join(overlayDir, 'overlay.css')), '/overlay/overlay.css exists');

  const html = fs.readFileSync(path.join(overlayDir, 'index.html'), 'utf8');
  assert(html.includes('overlay-canvas'), 'Overlay bootstrap contains canvas mount');
  assert(html.includes('overlay-diagnostics'), 'Overlay bootstrap contains diagnostics mount');

  const registry = createRegistry();
  const orderedIds = registry.getOrderedLayers().map((layer) => layer.id);
  assert(
    orderedIds.join(',') === 'future,logo,clock,ticker,secondary,primary,breaking',
    'Registry loads deterministic layer priority order'
  );

  const rootElement = new MockElement('main');
  const canvasElement = new MockElement('section');
  const diagnosticsElement = new MockElement('aside');
  const eventBus = new MockEventBus();
  const kernel = new PlatformKernel({
    rootElement,
    canvasElement,
    diagnosticsElement,
    eventBus,
    registry,
    config: { devMode: true, obs: { width: 1920, height: 1080 } }
  });

  const bootSnapshot = await kernel.boot();
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert(
    bootSnapshot.kernelState === KERNEL_STATES.RUNNING || bootSnapshot.kernelState === KERNEL_STATES.READY,
    'Kernel starts and reaches READY/RUNNING state'
  );
  assert(rootElement.dataset.obsWidth === '1920', 'OBS adapter locks 1920px width');
  assert(rootElement.dataset.obsHeight === '1080', 'OBS adapter locks 1080px height');
  assert(rootElement.dataset.obsTransparent === 'true', 'OBS adapter marks transparent canvas');
  assert(canvasElement.children.length === DEFAULT_LAYER_DEFINITIONS.length, 'Overlay runtime mounts all registered layers');

  eventBus.emitMessage({
    version: 1,
    timestamp: 1000,
    requestId: 'test_primary_update',
    source: 'control-panel',
    engine: 'primary-headline',
    action: 'update',
    payload: { headlines: ['Walking skeleton primary event'] }
  });

  const primary = registry.get('primary');
  assert(primary.visible === true, 'Event bus update makes primary layer visible');
  assert(primary.state.lastAction === 'update', 'Kernel writes event state into target layer');
  assert(kernel.getHealthSnapshot().lastEvent.layerId === 'primary', 'Kernel records normalized last event');

  eventBus.emitMessage({
    version: 1,
    timestamp: 1001,
    requestId: 'test_breaking_preempt',
    source: 'control-panel',
    engine: 'breaking-news',
    action: 'preempt',
    payload: { headline: 'Breaking test' }
  });

  assert(registry.get('breaking').visible === true, 'Breaking preempt makes breaking layer visible');
  assert(registry.get('primary').visible === false, 'Breaking preempt hides primary layer');

  eventBus.emitMessage({
    version: 1,
    timestamp: 1002,
    requestId: 'test_breaking_release',
    source: 'control-panel',
    engine: 'breaking-news',
    action: 'release',
    payload: {}
  });

  assert(registry.get('breaking').visible === false, 'Breaking release hides breaking layer');
  assert(registry.get('primary').visible === true, 'Breaking release restores primary layer visibility');
  assert(kernel.getHealthSnapshot().frame.frameCount > 0, 'Frame render loop records at least one frame');

  kernel.destroy();

  console.log('====================================================');
  console.log('ALL SINGLE OVERLAY PLATFORM KERNEL TESTS PASSED');
  console.log('====================================================');
}

if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('single-overlay-platform-kernel.test.js')) {
  runTests();
}
