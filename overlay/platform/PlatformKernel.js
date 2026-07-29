import { ENGINE_LAYER_MAP, KERNEL_STATES, PLATFORM_VERSION } from './constants.js';
import { OBSAdapter } from './OBSAdapter.js';
import { OverlayRegistry } from './OverlayRegistry.js';
import { OverlayRuntime } from './OverlayRuntime.js';
import { PlatformConfig } from './config/PlatformConfig.js';
import { CapabilityRegistry } from './registry/CapabilityRegistry.js';
import { RuntimeManifest } from './version/RuntimeManifest.js';
import { HealthSnapshot } from './monitoring/HealthSnapshot.js';
import { ObservabilityEndpoints } from './monitoring/ObservabilityEndpoints.js';
import { DiagnosticsEngine } from './diagnostics/DiagnosticsEngine.js';
import { ErrorRecoverySystem } from './recovery/ErrorRecoverySystem.js';
import { FrameScheduler } from './runtime/FrameScheduler.js';
import { PerformanceMonitor } from './monitoring/PerformanceMonitor.js';
import { MemoryMonitor } from './monitoring/MemoryMonitor.js';
import { EventQueueOptimizer } from './events/EventQueueOptimizer.js';
import { ResourceManager } from './runtime/ResourceManager.js';

export class PlatformKernel {
  constructor({
    rootElement,
    canvasElement,
    diagnosticsElement,
    eventBus,
    config = {},
    registry = new OverlayRegistry()
  } = {}) {
    this.platformConfig = new PlatformConfig();
    this.config = {
      devMode: true,
      obs: { width: 1920, height: 1080 },
      ...this.platformConfig.get('app'),
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

    // M1 / M2 Services Integration
    const semver = (typeof PLATFORM_VERSION === 'object' && PLATFORM_VERSION.version) ? PLATFORM_VERSION.version : '0.1.0-m1';
    this.health = new HealthSnapshot();
    this.health.setState('BOOTING');
    this.capabilities = new CapabilityRegistry(semver);
    this.manifest = new RuntimeManifest({ kernelVersion: semver });
    this.diagnostics = new DiagnosticsEngine();
    this.recovery = new ErrorRecoverySystem(this);
    this.endpoints = new ObservabilityEndpoints(this);

    this.frameScheduler = new FrameScheduler({ targetFps: 60 });
    this.perfMonitor = new PerformanceMonitor();
    this.memMonitor = new MemoryMonitor();
    this.eventQueue = new EventQueueOptimizer();
    this.resources = new ResourceManager();

    this.frameScheduler.addCallback((deltaMs) => {
      this.perfMonitor.recordFrame(deltaMs);
      this.diagnostics.recordFrameLatency(deltaMs);
    });

    this.capabilities.registerModule({
      id: 'platform-kernel',
      supportsVersion: '^1.0.0',
      requiresKernel: semver,
      dependencies: [],
      capabilities: ['lifecycle', 'config', 'health', 'diagnostics', 'recovery', 'scheduler', 'performance', 'memory', 'event-optimizer', 'resources']
    });
  }

  async boot() {
    try {
      this.state = KERNEL_STATES.BOOTING;
      this.health.setState('BOOTING');
      this.obsAdapter.connect();
      this.runtime.mountAll();
      this.bindEventBus();
      this.state = KERNEL_STATES.READY;
      this.health.setState('READY');
      
      this.runtime.startFrameLoop(() => {
        if (this.state === KERNEL_STATES.READY) {
          this.state = KERNEL_STATES.RUNNING;
          this.health.setState('RUNNING');
        }
        this.frameScheduler.tick();
        this.obsAdapter.report(this.getHealthSnapshot());
      });

      this.obsAdapter.report(this.getHealthSnapshot());
      return this.getHealthSnapshot();
    } catch (error) {
      this.state = KERNEL_STATES.ERROR;
      this.health.setState('ERROR');
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
    this.diagnostics.traceEvent(normalized.engine, normalized);
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

  getHealthState() {
    return this.health.getState();
  }

  getHealthSnapshot() {
    return {
      version: PLATFORM_VERSION,
      kernelState: this.state,
      obs: this.obsAdapter.getSnapshot(),
      eventBusStatus: this.eventBusStatus,
      frame: this.runtime.getFrameSnapshot(),
      lastEvent: this.lastEvent,
      layers: this.registry.snapshot(),
      performance: this.perfMonitor.getMetrics(),
      memory: this.memMonitor.getMetrics(),
      scheduler: this.frameScheduler.getMetrics(),
      eventQueue: this.eventQueue.getMetrics(),
      resources: this.resources.getMetrics()
    };
  }

  getRuntimeManifest() {
    return this.manifest.getManifest();
  }

  destroy() {
    this.frameScheduler.stop();
    this.resources.disposeAll();
    this.runtime.destroy();
    this.health.setState('STOPPED');
  }
}
