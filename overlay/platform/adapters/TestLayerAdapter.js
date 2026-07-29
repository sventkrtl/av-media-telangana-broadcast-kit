export class TestLayerAdapter {
  init({ surface }) {
    surface.innerHTML = `
      <div class="overlay-test-card">
        Overlay Kernel Walking Skeleton
        <small>Waiting for control-panel events...</small>
      </div>
    `;
  }

  update({ layer }) {
    const card = layer.element?.querySelector('.overlay-test-card');
    const action = layer.state.lastAction || 'ready';
    const payload = layer.state.lastPayload || {};
    const headline = payload.headline || payload.items?.[0] || payload.headlines?.[0] || payload.payloadText || '';

    if (card) {
      card.innerHTML = `
        ${layer.id.toUpperCase()} EVENT: ${action}
        <small>${headline ? this.escapeHtml(String(headline)).slice(0, 120) : 'State update received'}</small>
      `;
    }
  }

  show({ layer }) {
    if (layer.element) layer.element.hidden = false;
  }

  hide({ layer }) {
    if (layer.element) layer.element.hidden = true;
  }

  destroy({ layer }) {
    const surface = layer.element?.querySelector('.overlay-layer-surface');
    if (surface) surface.innerHTML = '';
  }

  escapeHtml(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
