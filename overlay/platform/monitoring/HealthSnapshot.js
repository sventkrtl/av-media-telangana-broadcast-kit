export class HealthSnapshot {
  constructor(options = {}) {
    this.validStates = ['BOOTING', 'READY', 'RUNNING', 'DEGRADED', 'ERROR', 'STOPPED'];
    this.currentState = 'BOOTING';
    this.startTime = Date.now();
    this.componentStatus = new Map();
    this.failureLog = [];
  }

  setState(newState) {
    if (!this.validStates.includes(newState)) {
      throw new Error(`Invalid state '${newState}'. Allowed states: ${this.validStates.join(', ')}`);
    }
    this.currentState = newState;
  }

  getState() {
    return this.currentState;
  }

  setComponentStatus(name, available, meta = {}) {
    this.componentStatus.set(name, {
      available: Boolean(available),
      meta,
      lastChecked: new Date().toISOString()
    });
  }

  recordFailure(name, error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    this.failureLog.push({
      component: name,
      error: errorMsg,
      timestamp: new Date().toISOString()
    });
    this.setComponentStatus(name, false, { lastError: errorMsg });
  }

  getSnapshot() {
    const componentsObj = {};
    for (const [key, val] of this.componentStatus.entries()) {
      componentsObj[key] = val;
    }

    return {
      status: this.currentState,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      components: componentsObj,
      failureCount: this.failureLog.length,
      recentFailures: this.failureLog.slice(-5),
      timestamp: new Date().toISOString()
    };
  }
}
