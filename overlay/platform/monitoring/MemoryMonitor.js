export class MemoryMonitor {
  constructor(options = {}) {
    this.leakThresholdMbPerMin = options.leakThresholdMbPerMin || 50;
    this.sampleHistory = [];
    this.maxSamples = options.maxSamples || 30;
  }

  takeSnapshot() {
    const mem = (typeof process !== 'undefined' && process.memoryUsage)
      ? process.memoryUsage()
      : { heapUsed: 0, heapTotal: 0, rss: 0, external: 0 };

    const snapshot = {
      heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
      externalMb: Math.round(((mem.external || 0) / 1024 / 1024) * 100) / 100,
      timestamp: Date.now()
    };

    this.sampleHistory.push(snapshot);
    if (this.sampleHistory.length > this.maxSamples) {
      this.sampleHistory.shift();
    }
    return snapshot;
  }

  detectMemoryLeakTrend() {
    if (this.sampleHistory.length < 3) {
      return { leakDetected: false, growthRateMbPerMin: 0 };
    }

    const first = this.sampleHistory[0];
    const last = this.sampleHistory[this.sampleHistory.length - 1];
    const timeDiffMin = (last.timestamp - first.timestamp) / (1000 * 60);

    if (timeDiffMin <= 0) {
      return { leakDetected: false, growthRateMbPerMin: 0 };
    }

    const memoryDiffMb = last.heapUsedMb - first.heapUsedMb;
    const growthRateMbPerMin = Math.round((memoryDiffMb / timeDiffMin) * 100) / 100;

    return {
      leakDetected: growthRateMbPerMin > this.leakThresholdMbPerMin,
      growthRateMbPerMin,
      totalGrowthMb: Math.round(memoryDiffMb * 100) / 100
    };
  }

  getMetrics() {
    const latest = this.takeSnapshot();
    const leakAnalysis = this.detectMemoryLeakTrend();
    return {
      latest,
      leakAnalysis
    };
  }
}
