export class ResourceManager {
  constructor() {
    this.resources = new Map();
  }

  acquire(resourceId, resourceObj, disposerFn = null) {
    if (this.resources.has(resourceId)) {
      this.release(resourceId);
    }

    this.resources.set(resourceId, {
      object: resourceObj,
      disposer: typeof disposerFn === 'function' ? disposerFn : null,
      acquiredAt: new Date().toISOString()
    });
    return resourceObj;
  }

  release(resourceId) {
    const entry = this.resources.get(resourceId);
    if (!entry) return false;

    try {
      if (entry.disposer) {
        entry.disposer(entry.object);
      }
    } catch (err) {
      // Disposer error isolation
    }

    this.resources.delete(resourceId);
    return true;
  }

  purgeUnused() {
    let count = 0;
    for (const [id, entry] of this.resources.entries()) {
      if (entry.object === null || entry.object === undefined) {
        this.release(id);
        count++;
      }
    }
    return count;
  }

  disposeAll() {
    let count = 0;
    for (const id of Array.from(this.resources.keys())) {
      this.release(id);
      count++;
    }
    return count;
  }

  getMetrics() {
    return {
      activeResourceCount: this.resources.size,
      registeredIds: Array.from(this.resources.keys())
    };
  }
}
