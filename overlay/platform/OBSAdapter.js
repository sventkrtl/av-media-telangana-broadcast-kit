export class OBSAdapter {
  constructor({ rootElement, canvasElement, diagnosticsElement, config = {} }) {
    this.rootElement = rootElement;
    this.canvasElement = canvasElement;
    this.diagnosticsElement = diagnosticsElement;
    this.config = {
      width: 1920,
      height: 1080,
      devMode: true,
      ...config
    };
    this.status = 'UNKNOWN';
    this.lastError = null;
  }

  connect() {
    if (!this.rootElement || !this.canvasElement) {
      this.status = 'ERROR';
      this.lastError = 'Overlay root and canvas elements are required.';
      throw new Error(`[OBSAdapter] ${this.lastError}`);
    }

    this.rootElement.style.width = `${this.config.width}px`;
    this.rootElement.style.height = `${this.config.height}px`;
    this.canvasElement.style.width = `${this.config.width}px`;
    this.canvasElement.style.height = `${this.config.height}px`;
    this.rootElement.dataset.obsWidth = String(this.config.width);
    this.rootElement.dataset.obsHeight = String(this.config.height);
    this.rootElement.dataset.obsTransparent = 'true';
    this.status = 'CONNECTED';
    return this.getSnapshot();
  }

  report(snapshot) {
    if (!this.diagnosticsElement) return;
    if (!this.config.devMode) {
      this.diagnosticsElement.classList.remove('visible');
      this.diagnosticsElement.textContent = '';
      return;
    }

    this.diagnosticsElement.classList.add('visible');
    this.diagnosticsElement.innerHTML = [
      '<strong>Overlay Platform</strong>',
      `Kernel: ${snapshot.kernelState}`,
      `OBS: ${this.status} ${this.config.width}x${this.config.height}`,
      `Event Bus: ${snapshot.eventBusStatus}`,
      `Frames: ${snapshot.frame.frameCount}`,
      `Layers: ${snapshot.layers.map((layer) => `${layer.id}:${layer.visible ? 'on' : 'off'}`).join(' | ')}`
    ].join('<br>');
  }

  showError(error) {
    this.status = 'ERROR';
    this.lastError = error && error.message ? error.message : String(error);
    if (this.diagnosticsElement) {
      this.diagnosticsElement.classList.add('visible');
      this.diagnosticsElement.textContent = `Overlay Platform ERROR: ${this.lastError}`;
    }
  }

  getSnapshot() {
    return {
      status: this.status,
      width: this.config.width,
      height: this.config.height,
      transparent: true,
      lastError: this.lastError
    };
  }
}
