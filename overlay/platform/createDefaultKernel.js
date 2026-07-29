import { DEFAULT_LAYER_DEFINITIONS } from './constants.js';
import { OverlayRegistry } from './OverlayRegistry.js';
import { PlatformKernel } from './PlatformKernel.js';
import { TestLayerAdapter } from './adapters/TestLayerAdapter.js';
import { PrimaryOverlay } from '../modules/primary/PrimaryOverlay.js';

export function createDefaultKernel(options) {
  const registry = new OverlayRegistry();

  DEFAULT_LAYER_DEFINITIONS.forEach((definition) => {
    let adapter;
    if (definition.id === 'primary') {
      const primaryInstance = new PrimaryOverlay();
      adapter = {
        init: ({ surface }) => {
          const doc = surface.ownerDocument || (typeof document !== 'undefined' ? document : null);
          if (doc) {
            primaryInstance.init({ parentNode: surface, document: doc });
          }
        },
        show: ({ event }) => {
          primaryInstance.show(event ? (event.payload || {}) : {});
        },
        update: ({ event }) => {
          primaryInstance.update(event ? (event.payload || {}) : {});
        },
        hide: () => {
          primaryInstance.hide();
        },
        destroy: () => {
          primaryInstance.destroy();
        }
      };
    } else {
      adapter = new TestLayerAdapter();
    }

    registry.register({
      ...definition,
      adapter
    });
  });

  return new PlatformKernel({
    ...options,
    registry
  });
}
