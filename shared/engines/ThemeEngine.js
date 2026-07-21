/**
 * Broadcast Graphics SDK - Theme Engine
 * Controls dynamic theme switching, CSS token updates, and visual state styles.
 */

export class ThemeEngine {
  constructor(defaultTheme = 'default') {
    this.currentTheme = defaultTheme;
  }

  setTheme(themeName) {
    this.currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    console.log(`[SDK ThemeEngine] Active theme switched to: ${themeName}`);
  }

  getTheme() {
    return this.currentTheme;
  }
}
