export class DiagnosticsEngine {
  constructor(options = {}) {
    this.ringBufferCapacity = options.bufferCapacity || 100;
    this.logBuffer = [];
    this.eventTraces = [];
    this.frameLatencies = [];
  }

  log(level, message, meta = {}) {
    const entry = {
      level,
      message,
      meta,
      timestamp: new Date().toISOString()
    };
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.ringBufferCapacity) {
      this.logBuffer.shift();
    }
  }

  traceEvent(eventName, payload) {
    const trace = {
      event: eventName,
      payload,
      timestamp: new Date().toISOString()
    };
    this.eventTraces.push(trace);
    if (this.eventTraces.length > this.ringBufferCapacity) {
      this.eventTraces.shift();
    }
  }

  recordFrameLatency(latencyMs) {
    this.frameLatencies.push(latencyMs);
    if (this.frameLatencies.length > 100) {
      this.frameLatencies.shift();
    }
  }

  getAverageFrameLatency() {
    if (this.frameLatencies.length === 0) return 0;
    const sum = this.frameLatencies.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / this.frameLatencies.length) * 100) / 100;
  }

  getReport() {
    return {
      logCount: this.logBuffer.length,
      logs: [...this.logBuffer],
      recentEventTraces: [...this.eventTraces],
      averageFrameLatencyMs: this.getAverageFrameLatency(),
      generatedAt: new Date().toISOString()
    };
  }
}
