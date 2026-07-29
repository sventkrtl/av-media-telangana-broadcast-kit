export class PerformanceMonitor {
  constructor(options = {}) {
    this.fpsThreshold = options.fpsThreshold || 45;
    this.sampleWindowSize = options.sampleWindowSize || 60;
    this.frameDurations = [];
    this.fpsHistory = [];
    this.lastSecondTime = Date.now();
    this.framesInCurrentSecond = 0;
    this.currentFps = 60;
  }

  recordFrame(durationMs) {
    this.frameDurations.push(durationMs);
    if (this.frameDurations.length > this.sampleWindowSize) {
      this.frameDurations.shift();
    }

    this.framesInCurrentSecond++;
    const now = Date.now();
    if (now - this.lastSecondTime >= 1000) {
      this.currentFps = Math.round((this.framesInCurrentSecond * 1000) / (now - this.lastSecondTime));
      this.fpsHistory.push(this.currentFps);
      if (this.fpsHistory.length > 30) {
        this.fpsHistory.shift();
      }
      this.framesInCurrentSecond = 0;
      this.lastSecondTime = now;
    }
  }

  getMetrics() {
    const avgDuration = this.frameDurations.length > 0
      ? this.frameDurations.reduce((a, b) => a + b, 0) / this.frameDurations.length
      : 0;
    const maxDuration = this.frameDurations.length > 0 ? Math.max(...this.frameDurations) : 0;
    const minDuration = this.frameDurations.length > 0 ? Math.min(...this.frameDurations) : 0;

    return {
      currentFps: this.currentFps,
      fpsThreshold: this.fpsThreshold,
      isDegraded: this.currentFps < this.fpsThreshold,
      averageFrameDurationMs: Math.round(avgDuration * 100) / 100,
      minFrameDurationMs: Math.round(minDuration * 100) / 100,
      maxFrameDurationMs: Math.round(maxDuration * 100) / 100
    };
  }
}
