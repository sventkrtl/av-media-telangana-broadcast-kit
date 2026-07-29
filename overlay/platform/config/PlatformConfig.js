import fs from 'fs';
import path from 'path';

export class PlatformConfig {
  constructor(configDir) {
    this.configDir = configDir || path.resolve('config');
    this.configs = {};
    this.fallbacks = {
      app: {
        name: "AV Media Telangana Broadcast Kit",
        id: "av-media-telangana-broadcast-kit",
        version: "0.1.0-m1",
        milestone: "M1",
        environment: "development",
        port: 3000,
        debug: true
      },
      environment: {
        env: "development",
        timezone: "Asia/Kolkata",
        logLevel: "info",
        features: { coldBootFallback: true, eventTracing: true, diagnosticsRingBuffer: true }
      },
      modules: {
        modules: [
          { id: "platform-kernel", enabled: true, priority: 0 },
          { id: "obs-adapter", enabled: true, priority: 10 },
          { id: "overlay-runtime", enabled: true, priority: 20 }
        ]
      },
      obs: {
        width: 1920,
        height: 1080,
        fps: 60,
        transparent: true,
        overlayUrl: "/overlay/",
        wsPort: 8080
      },
      graphics: {
        canvasWidth: 1920,
        canvasHeight: 1080,
        renderEngine: "2d",
        enableHardwareAcceleration: true,
        maxLayerDepth: 10
      },
      themes: {
        activeTheme: "dark-broadcast",
        themes: {
          "dark-broadcast": { primaryColor: "#1e1e2e", accentColor: "#89b4fa", textColor: "#cdd6f4" }
        }
      },
      shortcuts: {
        shortcuts: [
          { key: "F1", action: "toggle-diagnostics" },
          { key: "F2", action: "toggle-overlay-debug" }
        ]
      }
    };
    this.loadAll();
  }

  loadCategory(category) {
    const filePath = path.join(this.configDir, `${category}.json`);
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8').trim();
        if (raw.length > 0) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            this.configs[category] = parsed;
            return;
          }
        }
      }
    } catch (err) {
      // Fallback
    }
    this.configs[category] = JSON.parse(JSON.stringify(this.fallbacks[category] || {}));
  }

  loadAll() {
    const categories = ['app', 'environment', 'modules', 'obs', 'graphics', 'themes', 'shortcuts'];
    categories.forEach(cat => this.loadCategory(cat));
  }

  get(category, key, defaultValue = undefined) {
    if (!this.configs[category]) {
      this.loadCategory(category);
    }
    const catObj = this.configs[category] || {};
    if (key === undefined) {
      return catObj;
    }
    return catObj[key] !== undefined ? catObj[key] : defaultValue;
  }

  getAll() {
    return this.configs;
  }
}
