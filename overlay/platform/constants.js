export const KERNEL_STATES = Object.freeze({
  BOOTING: 'BOOTING',
  READY: 'READY',
  RUNNING: 'RUNNING',
  ERROR: 'ERROR'
});

export const PLATFORM_VERSION = Object.freeze({
  name: 'AV Media Telangana Single Overlay Platform',
  version: '0.0.1',
  milestone: 'M0',
  release: 'v0.0.1-m0-walking-skeleton',
  status: 'walking-skeleton-freeze',
  date: '2026-07-29'
});

export const DEFAULT_LAYER_DEFINITIONS = Object.freeze([
  { id: 'future', priority: 10, visibility: 'manual' },
  { id: 'logo', priority: 20, visibility: 'always' },
  { id: 'clock', priority: 30, visibility: 'always' },
  { id: 'ticker', priority: 100, visibility: 'manual' },
  { id: 'secondary', priority: 200, visibility: 'manual' },
  { id: 'primary', priority: 300, visibility: 'manual' },
  { id: 'breaking', priority: 900, visibility: 'preemptive' }
]);

export const ENGINE_LAYER_MAP = Object.freeze({
  'primary-headline': 'primary',
  'breaking-news': 'breaking',
  'secondary-playlist': 'secondary',
  ticker: 'ticker',
  clock: 'clock',
  logo: 'logo',
  future: 'future'
});
