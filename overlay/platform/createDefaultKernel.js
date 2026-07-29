import { DEFAULT_LAYER_DEFINITIONS } from './constants.js';
import { OverlayRegistry } from './OverlayRegistry.js';
import { PlatformKernel } from './PlatformKernel.js';
import { TestLayerAdapter } from './adapters/TestLayerAdapter.js';

export function createDefaultKernel(options) {
  const registry = new OverlayRegistry();

  DEFAULT_LAYER_DEFINITIONS.forEach((definition) => {
    registry.register({
      ...definition,
      adapter: new TestLayerAdapter()
    });
  });

  return new PlatformKernel({
    ...options,
    registry
  });
}
