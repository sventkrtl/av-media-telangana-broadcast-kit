import { StateEngine } from '../shared/js/state-engine.js';
import { createDefaultKernel } from './platform/createDefaultKernel.js';

const rootElement = document.getElementById('overlay-root');
const canvasElement = document.getElementById('overlay-canvas');
const diagnosticsElement = document.getElementById('overlay-diagnostics');

const urlParams = new URLSearchParams(window.location.search);
const devMode = urlParams.get('dev') === '1' || urlParams.get('debug') === 'true';

const kernel = createDefaultKernel({
  rootElement,
  canvasElement,
  diagnosticsElement,
  eventBus: new StateEngine('av_media_broadcast_channel'),
  config: {
    devMode,
    obs: {
      width: 1920,
      height: 1080
    }
  }
});

kernel.boot().catch((error) => {
  console.error('[OverlayPlatform] Kernel boot failed:', error);
});
