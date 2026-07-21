/**
 * AV Media Telangana - Data Provider Registry
 * Manages supported Data Provider registrations for the Secondary News Playlist Engine.
 */

import { JsonProvider } from './placeholders/JsonProvider.js';
import { ExcelProvider } from './placeholders/ExcelProvider.js';
import { GoogleSheetProvider } from './GoogleSheetProvider.js';
import { ApiProvider } from './placeholders/ApiProvider.js';
import { CustomProvider } from './placeholders/CustomProvider.js';

export class ProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.registerDefaultProviders();
  }

  registerDefaultProviders() {
    this.register('json', JsonProvider);
    this.register('excel', ExcelProvider);
    this.register('google-sheet', GoogleSheetProvider);
    this.register('api', ApiProvider);
    this.register('custom', CustomProvider);
  }

  register(type, providerClass) {
    if (!type || typeof type !== 'string') {
      throw new Error('Provider type must be a non-empty string.');
    }
    if (typeof providerClass !== 'function') {
      throw new Error('Provider class must be a valid constructor function.');
    }
    this.providers.set(type.toLowerCase().trim(), providerClass);
  }

  get(type) {
    if (!type || typeof type !== 'string') return null;
    return this.providers.get(type.toLowerCase().trim()) || null;
  }

  has(type) {
    if (!type || typeof type !== 'string') return false;
    return this.providers.has(type.toLowerCase().trim());
  }
}

export const globalProviderRegistry = new ProviderRegistry();
