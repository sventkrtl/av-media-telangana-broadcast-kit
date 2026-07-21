/**
 * AV Media Telangana - Data Provider Factory
 * Instantiates registered Data Providers without direct class coupling.
 */

import { globalProviderRegistry } from './ProviderRegistry.js';
import { BaseDataProvider } from './BaseDataProvider.js';

export class ProviderFactory {
  static createProvider(type, options = {}, registry = globalProviderRegistry) {
    if (!type || typeof type !== 'string') {
      throw new Error('[ProviderFactory] Invalid provider type specified.');
    }

    const normType = type.toLowerCase().trim();
    if (!registry.has(normType)) {
      throw new Error(`[ProviderFactory] Unknown data provider type: "${type}"`);
    }

    const ProviderClass = registry.get(normType);
    const instance = new ProviderClass(options);

    if (!(instance instanceof BaseDataProvider)) {
      throw new Error(`[ProviderFactory] Provider "${type}" does not implement BaseDataProvider interface.`);
    }

    return instance;
  }
}
