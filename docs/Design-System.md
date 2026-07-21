# Design System Specifications

The **AV Media Telangana Broadcast Kit** uses a high-visibility, broadcast-grade design system optimized for 1080p and 4K displays.

---

## 🎨 Color Palette & Themes

### Core Brand Palette
- **Primary Red (Breaking / Main)**: `#E50914` / `#D32F2F`
- **Telangana Gold / Yellow Accent**: `#FFC107` / `#FFB300`
- **Deep Navy / Dark Theme Base**: `#0B1325` / `#101827`
- **Crisp White (Text / Contrast)**: `#FFFFFF`
- **Muted Slate Gray**: `#64748B`

### Theme Tokens (`shared/css/variables.css`)
```css
:root {
  --color-primary: #E50914;
  --color-accent: #FFC107;
  --color-bg-dark: #0B1325;
  --color-bg-light: #FFFFFF;
  --color-text-main: #FFFFFF;
  --color-text-dark: #000000;
  
  --font-family-headline: 'Outfit', 'Noto Sans Telugu', sans-serif;
  --font-family-body: 'Inter', 'Noto Sans Telugu', sans-serif;
}
```

---

## 🔤 Typography & Language Support

- **English Typography**: `Outfit` for bold headlines, `Inter` for body & captions.
- **Telugu Typography**: `Noto Sans Telugu` / `Ramabhadra` for crisp broadcast readability.

---

## 📐 Safe Margins & Resolution Targets

- **Target Resolution**: 1920x1080 (1080p Full HD Base Canvas)
- **Title Safe Margin**: 5% inset from all edges (96px horizontal, 54px vertical)
- **Lower Third Base Alignment**: 80px from canvas bottom edge.
