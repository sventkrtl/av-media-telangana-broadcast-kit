/**
 * Broadcast Graphics SDK - Audio Engine
 * Plays audio stingers, news alerts, and broadcast sound effects.
 */

export class AudioEngine {
  constructor() {
    this.sounds = new Map();
  }

  loadSound(key, url) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.sounds.set(key, audio);
  }

  playSound(key, volume = 1.0) {
    const sound = this.sounds.get(key);
    if (sound) {
      sound.currentTime = 0;
      sound.volume = volume;
      sound.play().catch(err => console.warn(`[SDK AudioEngine] Play blocked:`, err));
    }
  }
}
