/**
 * Signal Cards Canary - Test Bridge
 *
 * Exposes deterministic verification hooks for the Setfarm runtime harness.
 */
(function () {
  'use strict';

  function resolveApp() {
    return typeof window !== 'undefined' && window.app && window.app.ready
      ? window.app
      : null;
  }

  function getState() {
    const app = resolveApp();
    return app && typeof app.getState === 'function' ? app.getState() : null;
  }

  window.__SETFARM_TEST_BRIDGE__ = {
    stack: 'static-html',
    ready: true,
    appName: 'signal-cards-canary',
    resolveApp: resolveApp,
    getState: getState,
    actions: {
      increment: function (counterId) {
        const app = resolveApp();
        return app && typeof app.increment === 'function' ? app.increment(counterId) : false;
      },
      reset: function (counterId) {
        const app = resolveApp();
        return app && typeof app.reset === 'function' ? app.reset(counterId) : false;
      },
      resetAll: function () {
        const app = resolveApp();
        return app && typeof app.resetAll === 'function' ? app.resetAll() : false;
      },
      clearStorage: function () {
        const app = resolveApp();
        return app && typeof app.clearStorage === 'function' ? app.clearStorage() : false;
      }
    }
  };

  // Legacy static flag for simple ready checks.
  window.setfarmStaticReady = true;
})();
