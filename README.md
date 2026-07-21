# AV Media Telangana Broadcast Kit (v1.0)

A comprehensive, high-performance web graphics, overlay, and scene management suite designed for news, live streaming, and broadcast production in OBS Studio.

---

## 📁 Repository Structure

```
av-media-telangana-broadcast-kit/

├── README.md               # Main project documentation & quickstart
├── LICENSE                 # License terms
├── .gitignore              # Git ignore rules
├── CHANGELOG.md            # Release notes & version history
├── ROADMAP.md              # Planned features & version targets

├── docs/                   # Architectural & setup guides
│   ├── Architecture.md     # System design & overlay dataflow
│   ├── Design-System.md    # Typography, color tokens & visual rules
│   ├── OBS-Setup.md        # OBS Studio browser source setup guide
│   ├── Plugin-Setup.md     # Controller & WebSocket integration guide
│   └── Coding-Standards.md # JavaScript, CSS, & modular structure standards

├── assets/                 # Static media assets
│   ├── logos/              # Channel & partner branding logos
│   ├── fonts/              # Custom brand typography
│   ├── icons/              # Dynamic UI icons
│   ├── audio/              # Sound effects & stings
│   ├── backgrounds/        # Loop backgrounds & stinger videos
│   └── videos/             # Promo & intro clips

├── themes/                 # Visual theme definitions
│   ├── default/            # Standard broadcast theme
│   ├── dark/               # Low-light newsroom theme
│   ├── light/              # High-contrast daylight theme
│   └── breaking/           # Flash alert / red theme

├── modules/                # Broadcast Overlay Modules
│   ├── ticker/             # News ticker marquee banner
│   ├── lower-third/        # Dynamic lower-third lower graphics
│   ├── breaking-news/      # Full-width alert popups & banners
│   ├── reporter/           # On-air reporter name tags & location badges
│   ├── clock/              # Real-time date & time overlay
│   ├── weather/            # Live weather widget
│   ├── sponsor/            # Sponsor logo slideshow / rotator
│   └── countdown/          # Event & show start countdown timers

├── shared/                 # Shared resources & utilities
│   ├── css/                # Common resets, variables & keyframe animations
│   ├── js/                 # WebSockets, state engine & WebSocket controllers
│   ├── animations/         # Reusable CSS & JS animation libraries
│   ├── utils/              # Formatting helpers & DOM builders
│   └── config/             # Environment, layout & channel preset configurations

├── obs/                    # OBS Studio Assets & Scenes
│   ├── profiles/           # Pre-configured OBS production profiles
│   ├── scenes/             # Importable OBS scene collection templates
│   └── plugins/            # Helper scripts & OBS WebSocket scripts

└── tests/                  # Unit tests, visual regression & module testing
```

---

## ⚡ Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sventkrtl/av-media-telangana-broadcast-kit.git
   cd av-media-telangana-broadcast-kit
   ```

2. **Open Overlays in Browser**:
   Open any module under `modules/` (e.g., `modules/lower-third/index.html`) directly in a web browser or load it as a **Browser Source** in OBS Studio.

3. **Documentation**:
   - Refer to [Architecture Documentation](docs/Architecture.md) for data flow and state management.
   - Refer to [OBS Setup Guide](docs/OBS-Setup.md) to integrate graphics into OBS Studio.