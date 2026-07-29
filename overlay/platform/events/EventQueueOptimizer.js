export class EventQueueOptimizer {
  constructor(options = {}) {
    this.maxQueueSize = options.maxQueueSize || 1000;
    this.queues = {
      CRITICAL: [],
      HIGH: [],
      NORMAL: [],
      LOW: []
    };
    this.processedCount = 0;
    this.droppedCount = 0;
  }

  enqueue(eventName, payload, priority = 'NORMAL') {
    const validPriority = this.queues[priority] ? priority : 'NORMAL';
    const totalInQueue = this.getTotalQueueSize();

    if (totalInQueue >= this.maxQueueSize) {
      if (this.queues.LOW.length > 0) {
        this.queues.LOW.shift();
        this.droppedCount++;
      } else if (this.queues.NORMAL.length > 0 && validPriority !== 'CRITICAL') {
        this.queues.NORMAL.shift();
        this.droppedCount++;
      } else {
        this.droppedCount++;
        return false;
      }
    }

    this.queues[validPriority].push({
      event: eventName,
      payload,
      enqueuedAt: Date.now()
    });
    return true;
  }

  dequeueBatch(batchSize = 50) {
    const batch = [];
    const priorities = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'];

    for (const prio of priorities) {
      while (this.queues[prio].length > 0 && batch.length < batchSize) {
        batch.push(this.queues[prio].shift());
        this.processedCount++;
      }
      if (batch.length >= batchSize) break;
    }

    return batch;
  }

  getTotalQueueSize() {
    return this.queues.CRITICAL.length +
           this.queues.HIGH.length +
           this.queues.NORMAL.length +
           this.queues.LOW.length;
  }

  getMetrics() {
    return {
      queueSize: this.getTotalQueueSize(),
      byPriority: {
        CRITICAL: this.queues.CRITICAL.length,
        HIGH: this.queues.HIGH.length,
        NORMAL: this.queues.NORMAL.length,
        LOW: this.queues.LOW.length
      },
      processedCount: this.processedCount,
      droppedCount: this.droppedCount
    };
  }
}
