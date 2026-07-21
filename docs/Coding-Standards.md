# Coding Standards & Best Practices

All modules and scripts in the **AV Media Telangana Broadcast Kit** must adhere to the following standards to ensure 60fps smooth render performance in OBS Studio browser engine (Chromium).

---

## 🎨 CSS & Animation Standards

1. **Hardware Acceleration**: Always use GPU-accelerated CSS properties (`transform: translate3d()` and `opacity`) for animations. Avoid animating `top`, `left`, `width`, or `height`.
2. **CSS Variables**: Use design tokens defined in `shared/css/variables.css`. Do not hardcode hex color values inside module styles.
3. **Typography**: Ensure line-heights and padding prevent Telugu script font clipping (descenders/ascenders).

---

## ⚡ JavaScript Standards

1. **ES6+ Modules**: Code must be written using standard ES modules (`import`/`export`).
2. **DOM Performance**: Avoid forced synchronous reflows. Use `requestAnimationFrame` for continuous updates or timer ticks.
3. **Clean Teardown**: Event listeners and timers (`setInterval`, `setTimeout`) must be cleared when overlays hide to prevent memory leaks.

---

## 📁 File Naming Conventions

- Directory names: `kebab-case` (e.g., `lower-third`, `breaking-news`)
- File names: `kebab-case.extension` (e.g., `ticker-engine.js`, `main-theme.css`)
- Documentation: `PascalCase.md` (e.g., `Architecture.md`)
