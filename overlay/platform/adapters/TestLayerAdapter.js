export class TestLayerAdapter {
  init({ surface }) {
    if (surface) surface.innerHTML = '';
  }

  update() {}

  show({ layer }) {
    if (layer && layer.element) layer.element.hidden = false;
  }

  hide({ layer }) {
    if (layer && layer.element) layer.element.hidden = true;
  }

  destroy({ layer }) {
    const surface = layer && layer.element ? layer.element.querySelector('.overlay-layer-surface') : null;
    if (surface) surface.innerHTML = '';
  }
}
