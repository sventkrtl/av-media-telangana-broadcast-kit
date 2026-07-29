export class RuntimeManifest {
  constructor(options = {}) {
    this.kernelVersion = options.kernelVersion || '0.1.0-m1';
    this.protocolVersion = options.protocolVersion || '1.0.0';
    this.configVersion = options.configVersion || '1.0.0';
    this.overlayRuntimeVersion = options.overlayRuntimeVersion || '0.1.0';
    this.obsAdapterVersion = options.obsAdapterVersion || '0.1.0';
    this.buildTimestamp = options.buildTimestamp || new Date().toISOString();
  }

  getManifest() {
    return {
      kernelVersion: this.kernelVersion,
      protocolVersion: this.protocolVersion,
      configVersion: this.configVersion,
      overlayRuntimeVersion: this.overlayRuntimeVersion,
      obsAdapterVersion: this.obsAdapterVersion,
      buildTimestamp: this.buildTimestamp
    };
  }
}
