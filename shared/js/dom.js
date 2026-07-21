/**
 * AV Media Telangana Broadcast Kit - DOM Manipulation Helper
 */

export function createElement(tag, className = '', textContent = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}

export function safeText(element, text) {
  if (element && text !== undefined) {
    element.textContent = text;
  }
}
