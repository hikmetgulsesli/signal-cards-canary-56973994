/**
 * US-002 Action: Retry Load
 *
 * Retries loading the record data and shows visible loading / recovered state.
 */
(function () {
  'use strict';

  function getStateApi() {
    return window.US002RecordState || null;
  }

  function getStatusEl() {
    return document.querySelector('[data-testid="retry-status"]');
  }

  function handleClick(event) {
    const button = event.target.closest('button[data-action-id="retry-load"]');
    if (!button) return;

    const stateApi = getStateApi();
    if (!stateApi) return;

    const statusEl = getStatusEl();
    if (statusEl) statusEl.textContent = 'Retrying load...';

    stateApi.retryLoad();

    window.setTimeout(function () {
      if (statusEl) statusEl.textContent = 'Data loaded';
    }, 350);
  }

  function init() {
    document.addEventListener('click', handleClick);

    if (window.US002RecordState) {
      window.app = window.app || {};
      window.app.retryLoad = function () {
        return window.US002RecordState.retryLoad();
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
