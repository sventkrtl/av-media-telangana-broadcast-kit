export class ObservabilityEndpoints {
  constructor(kernel) {
    this.kernel = kernel;
  }

  handleStatus() {
    const currentState = this.kernel ? this.kernel.getHealthState() : 'STOPPED';
    return {
      statusCode: 200,
      body: { status: currentState }
    };
  }

  handleReady() {
    const currentState = this.kernel ? this.kernel.getHealthState() : 'STOPPED';
    const isReady = (currentState === 'READY' || currentState === 'RUNNING');
    return {
      statusCode: isReady ? 200 : 503,
      body: {
        ready: isReady,
        status: currentState
      }
    };
  }

  handleStartup() {
    const currentState = this.kernel ? this.kernel.getHealthState() : 'STOPPED';
    const isStarted = (currentState !== 'BOOTING' && currentState !== 'STOPPED');
    return {
      statusCode: isStarted ? 200 : 503,
      body: {
        started: isStarted,
        status: currentState
      }
    };
  }

  handleHealth() {
    const snapshot = this.kernel ? this.kernel.getHealthSnapshot() : { status: 'STOPPED' };
    return {
      statusCode: snapshot.status === 'ERROR' ? 500 : 200,
      body: snapshot
    };
  }

  handleVersion() {
    const manifest = this.kernel ? this.kernel.getRuntimeManifest() : {};
    return {
      statusCode: 200,
      body: manifest
    };
  }
}
