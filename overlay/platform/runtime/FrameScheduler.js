export class FrameScheduler {
  constructor(options = {}) {
    this.targetFps = options.targetFps || 60;
    this.frameBudgetMs = 1000 / this.targetFps;
    this.isRunning = false;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.droppedFrames = 0;
    this.frameCallbacks = new Set();
    this.timerId = null;
  }

  addCallback(fn) {
    if (typeof fn === 'function') {
      this.frameCallbacks.add(fn);
    }
  }

  removeCallback(fn) {
    this.frameCallbacks.delete(fn);
  }

  tick() {
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const deltaMs = this.lastFrameTime ? (now - this.lastFrameTime) : this.frameBudgetMs;
    this.lastFrameTime = now;
    this.frameCount++;

    if (deltaMs > this.frameBudgetMs * 1.5) {
      this.droppedFrames++;
    }

    for (const callback of this.frameCallbacks) {
      try {
        callback(deltaMs, now);
      } catch (err) {
        // Error isolation inside scheduler
      }
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    const loop = () => {
      if (!this.isRunning) return;
      this.tick();
      if (typeof setTimeout !== 'undefined') {
        this.timerId = setTimeout(loop, Math.floor(this.frameBudgetMs));
      }
    };
    loop();
  }

  stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  getMetrics() {
    return {
      targetFps: this.targetFps,
      frameBudgetMs: Math.round(this.frameBudgetMs * 100) / 100,
      frameCount: this.frameCount,
      droppedFrames: this.droppedFrames,
      isRunning: this.isRunning
    };
  }
}
