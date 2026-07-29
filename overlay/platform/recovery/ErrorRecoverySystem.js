export class ErrorRecoverySystem {
  constructor(kernel, options = {}) {
    this.kernel = kernel;
    this.maxRetries = options.maxRetries || 3;
    this.retryMap = new Map();
  }

  handleComponentError(componentId, error) {
    const currentRetries = this.retryMap.get(componentId) || 0;
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (this.kernel && this.kernel.diagnostics) {
      this.kernel.diagnostics.log('ERROR', `Component '${componentId}' failed: ${errorMsg}`, { retries: currentRetries });
    }

    if (currentRetries < this.maxRetries) {
      const nextRetry = currentRetries + 1;
      this.retryMap.set(componentId, nextRetry);
      
      if (this.kernel && this.kernel.health) {
        this.kernel.health.setState('DEGRADED');
        this.kernel.health.recordFailure(componentId, error);
      }
      
      return { action: 'RETRY', attempt: nextRetry, delayMs: Math.pow(2, nextRetry) * 100 };
    } else {
      if (this.kernel && this.kernel.health) {
        this.kernel.health.setState('ERROR');
        this.kernel.health.recordFailure(componentId, `Exceeded max retries (${this.maxRetries}): ${errorMsg}`);
      }
      return { action: 'FAIL_SAFE', attempt: currentRetries, fatal: true };
    }
  }

  resetRetries(componentId) {
    this.retryMap.delete(componentId);
  }
}
