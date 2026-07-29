export class OverlayRuntime {
  constructor({ registry, canvasElement }) {
    this.registry = registry;
    this.canvasElement = canvasElement;
    this.frameCount = 0;
    this.lastFrameAt = 0;
    this.animationFrameId = null;
    this.isRunning = false;
  }

  mountAll() {
    if (!this.canvasElement) {
      throw new Error('[OverlayRuntime] canvasElement is required.');
    }

    this.registry.getOrderedLayers().forEach((layer) => {
      if (layer.mounted) return;

      const element = document.createElement('section');
      element.className = 'overlay-layer';
      element.id = `overlay-layer-${layer.id}`;
      element.dataset.layerId = layer.id;
      element.dataset.priority = String(layer.priority);
      element.dataset.visible = String(layer.visible);
      element.style.zIndex = String(layer.priority);
      element.hidden = !layer.visible;

      const surface = document.createElement('div');
      surface.className = 'overlay-layer-surface';
      surface.dataset.layerSurface = layer.id;
      element.appendChild(surface);

      this.canvasElement.appendChild(element);
      layer.element = element;
      layer.mounted = true;

      if (layer.adapter && typeof layer.adapter.init === 'function') {
        layer.adapter.init({ layer, element, surface });
      }
    });
  }

  startFrameLoop(onFrame) {
    if (this.isRunning) return;
    this.isRunning = true;

    const tick = (timestamp) => {
      if (!this.isRunning) return;
      this.frameCount += 1;
      this.lastFrameAt = timestamp;
      if (typeof onFrame === 'function') {
        onFrame(this.getFrameSnapshot());
      }
      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  stopFrameLoop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  applyEvent(layerId, event) {
    const layer = this.registry.get(layerId);
    if (!layer) return null;

    this.registry.updateState(layerId, {
      lastAction: event.action,
      lastPayload: event.payload || {},
      lastUpdated: event.timestamp || Date.now()
    });

    if (event.action === 'update' || event.action === 'show' || event.action === 'preempt') {
      this.registry.setVisible(layerId, true);
      if (layer.adapter && typeof layer.adapter.show === 'function') {
        layer.adapter.show({ layer, event });
      }
    } else if (event.action === 'hide' || event.action === 'stop' || event.action === 'release') {
      this.registry.setVisible(layerId, false);
      if (layer.adapter && typeof layer.adapter.hide === 'function') {
        layer.adapter.hide({ layer, event });
      }
    }

    if (layer.adapter && typeof layer.adapter.update === 'function') {
      layer.adapter.update({ layer, event });
    }

    return layer;
  }

  destroy() {
    this.stopFrameLoop();
    this.registry.getOrderedLayers().forEach((layer) => {
      if (layer.adapter && typeof layer.adapter.destroy === 'function') {
        layer.adapter.destroy({ layer });
      }
      if (layer.element && layer.element.parentNode) {
        layer.element.parentNode.removeChild(layer.element);
      }
      layer.element = null;
      layer.mounted = false;
    });
  }

  getFrameSnapshot() {
    return {
      frameCount: this.frameCount,
      lastFrameAt: this.lastFrameAt
    };
  }
}
