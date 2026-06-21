/**
 * Signal Cards Canary - State Module
 *
 * Lightweight observable state manager for the note counter.
 * Keeps counter values in memory and notifies subscribers on change.
 */
(function (global) {
  'use strict';

  const DEFAULT_STATE = {
    counters: {
      counterA: { id: 'counterA', label: 'Counter A', color: 'blue', value: 0 },
      counterB: { id: 'counterB', label: 'Counter B', color: 'amber', value: 0 },
      counterC: { id: 'counterC', label: 'Counter C', color: 'emerald', value: 0 }
    },
    lastUpdated: null,
    version: 1
  };

  let state = deepClone(DEFAULT_STATE);
  const listeners = new Set();

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function now() {
    return new Date().toISOString();
  }

  function notify() {
    const snapshot = deepClone(state);
    listeners.forEach(function (listener) {
      try {
        listener(snapshot);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('SignalCardsCanary state listener error:', err);
      }
    });
  }

  function getState() {
    return deepClone(state);
  }

  function setState(next) {
    if (!next || typeof next !== 'object') return;
    state = {
      counters: next.counters ? deepClone(next.counters) : deepClone(DEFAULT_STATE.counters),
      lastUpdated: next.lastUpdated || now(),
      version: typeof next.version === 'number' ? next.version : DEFAULT_STATE.version
    };
    notify();
  }

  function resetState() {
    state = deepClone(DEFAULT_STATE);
    state.lastUpdated = now();
    notify();
  }

  function incrementCounter(id, amount) {
    if (!state.counters[id]) return false;
    const delta = typeof amount === 'number' && Number.isFinite(amount) ? amount : 1;
    state.counters[id].value += delta;
    state.lastUpdated = now();
    notify();
    return true;
  }

  function resetCounter(id) {
    if (!state.counters[id]) return false;
    state.counters[id].value = 0;
    state.lastUpdated = now();
    notify();
    return true;
  }

  function resetAllCounters() {
    Object.keys(state.counters).forEach(function (id) {
      state.counters[id].value = 0;
    });
    state.lastUpdated = now();
    notify();
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return function () {};
    listeners.add(listener);
    listener(getState());
    return function unsubscribe() {
      listeners.delete(listener);
    };
  }

  const SignalCardsCanaryState = {
    DEFAULT_STATE: deepClone(DEFAULT_STATE),
    getState: getState,
    setState: setState,
    resetState: resetState,
    incrementCounter: incrementCounter,
    resetCounter: resetCounter,
    resetAllCounters: resetAllCounters,
    subscribe: subscribe
  };

  global.SignalCardsCanaryState = SignalCardsCanaryState;
})(typeof window !== 'undefined' ? window : globalThis);
