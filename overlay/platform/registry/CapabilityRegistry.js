export class CapabilityRegistry {
  constructor(kernelVersion = '0.1.0-m1') {
    this.kernelVersion = kernelVersion;
    this.registeredModules = new Map();
  }

  validateDeclaration(declaration) {
    if (!declaration || typeof declaration !== 'object') {
      throw new Error("Invalid module declaration: must be an object");
    }
    const { id, supportsVersion, requiresKernel, dependencies, capabilities } = declaration;
    if (!id || typeof id !== 'string') {
      throw new Error("Module declaration missing required field: id");
    }
    if (!supportsVersion || typeof supportsVersion !== 'string') {
      throw new Error(`Module '${id}' missing required field: supportsVersion`);
    }
    if (!requiresKernel || typeof requiresKernel !== 'string') {
      throw new Error(`Module '${id}' missing required field: requiresKernel`);
    }
    if (!Array.isArray(dependencies)) {
      throw new Error(`Module '${id}' missing required array field: dependencies`);
    }
    if (!Array.isArray(capabilities)) {
      throw new Error(`Module '${id}' missing required array field: capabilities`);
    }
    return true;
  }

  registerModule(declaration) {
    this.validateDeclaration(declaration);
    for (const dep of declaration.dependencies) {
      if (!this.registeredModules.has(dep)) {
        throw new Error(`Cannot register module '${declaration.id}': missing dependency '${dep}'`);
      }
    }
    this.registeredModules.set(declaration.id, {
      ...declaration,
      registeredAt: new Date().toISOString()
    });
    return true;
  }

  getModule(id) {
    return this.registeredModules.get(id);
  }

  listModules() {
    return Array.from(this.registeredModules.values());
  }

  hasCapability(capabilityName) {
    for (const mod of this.registeredModules.values()) {
      if (mod.capabilities.includes(capabilityName)) {
        return true;
      }
    }
    return false;
  }
}
