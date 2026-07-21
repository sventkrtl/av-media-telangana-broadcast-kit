/**
 * AV Media Telangana Broadcast Kit - Shared Animation Engine JS
 */

export class AnimationEngine {
  /**
   * Smoothly trigger in-out CSS animations on DOM elements
   * @param {HTMLElement} element 
   * @param {string} inClass 
   * @param {string} outClass 
   */
  static show(element, inClass = 'anim-slide-in-bottom') {
    if (!element) return;
    element.classList.remove('anim-slide-out-bottom', 'anim-slide-out-left', 'hidden');
    element.classList.add(inClass);
  }

  static hide(element, outClass = 'anim-slide-out-bottom', durationMs = 500) {
    if (!element) return;
    element.classList.remove('anim-slide-in-bottom', 'anim-slide-in-left');
    element.classList.add(outClass);
    return new Promise((resolve) => {
      setTimeout(() => {
        element.classList.add('hidden');
        resolve();
      }, durationMs);
    });
  }
}
