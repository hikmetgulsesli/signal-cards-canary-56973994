/**
 * US-002 Action Handler: ACT_RETRY_LOAD
 *
 * Retries loading records and restores the default seeded set.
 */
(function () {
  'use strict';

  const RECORDS_KEY = 'signal-cards-canary:records';

  function getDefaultRecords() {
    return [
      { id: 'rec-1', title: 'Q3 Metric Anomaly', type: 'anomaly', severity: 3, details: 'Observed spike in north region.', status: 'open' },
      { id: 'rec-2', title: 'Latency baseline drift', type: 'performance', severity: 2, details: 'P95 increased by 12%.', status: 'acknowledged' },
      { id: 'rec-3', title: 'Disk pressure warning', type: 'infrastructure', severity: 4, details: 'Volume at 87% capacity.', status: 'resolved' }
    ];
  }

  function saveRecords(records) {
    try {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save records:', err);
    }
  }

  function refreshList() {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('scc:records:changed', { detail: { source: 'ACT_RETRY_LOAD' } }));
    }
  }

  function init() {
    const buttons = document.querySelectorAll('[data-action-id="ACT_RETRY_LOAD"]');
    buttons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        saveRecords(getDefaultRecords());
        refreshList();
        const statusEl = document.querySelector('[data-testid="load-status"]');
        if (statusEl) statusEl.textContent = 'Records reloaded.';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
