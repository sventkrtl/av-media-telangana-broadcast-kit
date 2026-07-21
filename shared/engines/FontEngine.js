/**
 * Broadcast Graphics SDK - Font Engine
 * Manages dynamically loaded web fonts & verifies rendering readiness for Telugu & English scripts.
 */

export class FontEngine {
  static async loadFonts(fontFamilies = ['Outfit', 'Inter', 'Noto Sans Telugu', 'Ramabhadra']) {
    if ('fonts' in document) {
      try {
        await Promise.all(fontFamilies.map(font => document.fonts.load(`16px "${font}"`)));
        console.log('[SDK FontEngine] All broadcast fonts loaded successfully.');
      } catch (err) {
        console.warn('[SDK FontEngine] Font loading fallback active:', err);
      }
    }
  }
}
