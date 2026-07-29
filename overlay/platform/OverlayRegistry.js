export class OverlayRegistry {
  constructor() {
    this.layers = new Map();
  }

  register(definition) {
    if (!definition || !definition.id) {
      throw new Error('[OverlayRegistry] Layer definition requires an id.');
    }
    if (this.layers.has(definition.id)) {
      throw new Error(`[OverlayRegistry] Duplicate layer id: ${definition.id}`);
    }

    const layer = {
      id: definition.id,
      priority: Number.isFinite(definition.priority) ? definition.priority : 0,
      visibility: definition.visibility || 'manual',
      adapter: definition.adapter || null,
      mounted: false,
      visible: definition.visibility === 'always',
      state: {},
      element: null
    };

    this.layers.set(layer.id, layer);
    return layer;
  }

  get(id) {
    return this.layers.get(id) || null;
  }

  getOrderedLayers() {
    return Array.from(this.layers.values()).sort((a, b) => {
      if (a.priority === b.priority) return a.id.localeCompare(b.id);
      return a.priority - b.priority;
    });
  }

  setVisible(id, visible) {
    const layer = this.get(id);
    if (!layer) return null;
    layer.visible = Boolean(visible);
    if (layer.element) {
      layer.element.hidden = !layer.visible;
      layer.element.dataset.visible = String(layer.visible);
    }
    return layer;
  }

  updateState(id, patch = {}) {
    const layer = this.get(id);
    if (!layer) return null;
    layer.state = { ...layer.state, ...patch };
    return layer;
  }

  snapshot() {
    return this.getOrderedLayers().map((layer) => ({
      id: layer.id,
      priority: layer.priority,
      visibility: layer.visibility,
      mounted: layer.mounted,
      visible: layer.visible,
      state: layer.state
    }));
  }
}
