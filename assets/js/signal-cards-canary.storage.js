/**
 * Signal Cards Canary - Storage Module
 *
 * localStorage persistence for counter state.
 * Gracefully degrades when storage is unavailable or restricted.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'signal-cards-canary:state';

  function storageAvailable() {
    try {
      const testKey = '__signal_cards_canary_storage_test__';
      global.localStorage.setItem(testKey, '1');
      global.localStorage.removeItem(testKey);
      return true;
    } catch (err) {
      return false;
    }
  }

  function load() {
    if (!storageAvailable()) return null;
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.counters) return null;
      return parsed;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('SignalCardsCanary storage load error:', err);
      return null;
    }
  }

  function save(state) {
    if (!storageAvailable() || !state || typeof state !== 'object') return false;
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('SignalCardsCanary storage save error:', err);
      return false;
    }
  }

  function clear() {
    if (!storageAvailable()) return false;
    try {
      global.localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('SignalCardsCanary storage clear error:', err);
      return false;
    }
  }

  const SignalCardsCanaryStorage = {
    STORAGE_KEY: STORAGE_KEY,
    load: load,
    save: save,
    clear: clear,
    isAvailable: storageAvailable
  };

  global.SignalCardsCanaryStorage = SignalCardsCanaryStorage;
})(typeof window !== 'undefined' ? window : globalThis);
