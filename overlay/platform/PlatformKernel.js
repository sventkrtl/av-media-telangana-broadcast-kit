import { ENGINE_LAYER_MAP, KERNEL_STATES, PLATFORM_VERSION } from './constants.js';
import { OBSAdapter } from './OBSAdapter.js';
import { OverlayRegistry } from './OverlayRegistry.js';
import { OverlayRuntime } from './OverlayRuntime.js';

export class PlatformKernel {
  constructor({
    rootElement,
    canvasElement,
    diagnosticsElement,
    eventBus,
    config = {},
    registry = new OverlayRegistry()
  }) {
    this.config = {
      devMode: true,
      obs: { width: 1920, height: 1080 },
      ...config
    };
    this.state = KERNEL_STATES.BOOTING;
    this.eventBus = eventBus;
    this.registry = registry;
    this.obsAdapter = new OBSAdapter({
      rootElement,
      canvasElement,
      diagnosticsElement,
      config: {
        ...this.config.obs,
        devMode: this.config.devMode
      }
    });
    this.runtime = new OverlayRuntime({ registry: this.registry, canvasElement });
    this.lastEvent = null;
    this.eventBusStatus = 'DISCONNECTED';
  }

  async boot() {
    try {
      this.state = KERNEL_STATES.BOOTING;
      this.obsAdapter.connect();
      this.runtime.mountAll();
      this.bindEventBus();
      this.state = KERNEL_STATES.READY;
      this.runtime.startFrameLoop(() => {
        if (this.state === KERNEL_STATES.READY) {
          this.state = KERNEL_STATES.RUNNING;
        }
        this.obsAdapter.report(this.getHealthSnapshot());
      });
      this.obsAdapter.report(this.getHealthSnapshot());
      return this.getHealthSnapshot();
    } catch (error) {
      this.state = KERNEL_STATES.ERROR;
      this.obsAdapter.showError(error);
      throw error;
    }
  }

  bindEventBus() {
    if (!this.eventBus) {
      this.eventBusStatus = 'UNAVAILABLE';
      return;
    }

    if (typeof this.eventBus.onStatusChange === 'function') {
      this.eventBus.onStatusChange((status) => {
        this.eventBusStatus = status;
        this.obsAdapter.report(this.getHealthSnapshot());
      });
    } else {
      this.eventBusStatus = 'CONNECTED';
    }

    if (typeof this.eventBus.subscribe === 'function') {
      this.eventBus.subscribe((message) => this.handleEvent(message));
    }
  }

  handleEvent(message) {
    const normalized = this.normalizeEvent(message);
    if (!normalized) return null;

    this.lastEvent = normalized;
    const layer = this.runtime.applyEvent(normalized.layerId, normalized);

    if (normalized.layerId === 'breaking' && normalized.action === 'preempt') {
      this.registry.setVisible('primary', false);
    }
    if (normalized.layerId === 'breaking' && normalized.action === 'release') {
      this.registry.setVisible('primary', true);
    }

    this.obsAdapter.report(this.getHealthSnapshot());
    return layer;
  }

  normalizeEvent(message) {
    if (!message || !message.engine || !message.action) return null;
    const layerId = ENGINE_LAYER_MAP[message.engine] || message.engine;
    if (!this.registry.get(layerId)) return null;

    return {
      version: message.version || 1,
      requestId: message.requestId || `${Date.now()}_kernel`,
      timestamp: message.timestamp || Date.now(),
      source: message.source || 'unknown',
      engine: message.engine,
      layerId,
      action: message.action,
      payload: message.payload || {}
    };
  }

  getHealthSnapshot() {
    return {
      version: PLATFORM_VERSION,
      kernelState: this.state,
      obs: this.obsAdapter.getSnapshot(),
      eventBusStatus: this.eventBusStatus,
      frame: this.runtime.getFrameSnapshot(),
      lastEvent: this.lastEvent,
      layers: this.registry.snapshot()
    };
  }

  destroy() {
    this.runtime.destroy();
  }
}
