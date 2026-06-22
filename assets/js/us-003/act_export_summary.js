/**
 * US-003 Action Handler: ACT_EXPORT_SUMMARY
 *
 * Computes an insights summary from persisted records and exports it
 * as a JSON file when the user clicks the export button.
 */
(function () {
  'use strict';

  const RECORDS_KEY = 'signal-cards-canary:records';

  function getDefaultRecords() {
    return [
      {
        id: 'rec-1',
        title: 'Q3 Metric Anomaly',
        type: 'anomaly',
        severity: 3,
        details: 'Observed spike in north region.',
        status: 'open',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'rec-2',
        title: 'Latency baseline drift',
        type: 'performance',
        severity: 2,
        details: 'P95 increased by 12%.',
        status: 'acknowledged',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'rec-3',
        title: 'Disk pressure warning',
        type: 'infrastructure',
        severity: 4,
        details: 'Volume at 87% capacity.',
        status: 'resolved',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ];
  }

  function loadRecords() {
    try {
      const raw = localStorage.getItem(RECORDS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load records for export:', err);
    }
    return getDefaultRecords();
  }

  function seedIfEmpty() {
    try {
      const raw = localStorage.getItem(RECORDS_KEY);
      if (!raw) localStorage.setItem(RECORDS_KEY, JSON.stringify(getDefaultRecords()));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to seed records for export:', err);
    }
  }

  function computeSummary(records) {
    const total = records.length;
    const byStatus = { open: 0, acknowledged: 0, resolved: 0 };
    const byType = {};
    let severeCount = 0;

    records.forEach(function (record) {
      const status = record.status || 'unknown';
      if (byStatus.hasOwnProperty(status)) {
        byStatus[status] += 1;
      } else {
        byStatus[status] = 1;
      }

      const type = record.type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;

      if (typeof record.severity === 'number' && record.severity >= 4) {
        severeCount += 1;
      }
    });

    const recentRecords = records.slice().sort(function (a, b) {
      const aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const aTime = Number.isNaN(aVal) ? 0 : aVal;
      const bTime = Number.isNaN(bVal) ? 0 : bVal;
      return bTime - aTime;
    }).slice(0, 10).map(function (r) {
      return { id: r.id, title: r.title, status: r.status, createdAt: r.createdAt };
    });

    return {
      generatedAt: new Date().toISOString(),
      total: total,
      byStatus: byStatus,
      byType: byType,
      severeCount: severeCount,
      recentRecords: recentRecords
    };
  }

  function renderSummary(summary) {
    const totalEl = document.querySelector('[data-testid="insights-total-records"]');
    const openEl = document.querySelector('[data-testid="insights-open-records"]');
    const severeEl = document.querySelector('[data-testid="insights-severe-records"]');

    if (totalEl) totalEl.textContent = String(summary.total);
    if (openEl) openEl.textContent = String(summary.byStatus.open || 0);
    if (severeEl) severeEl.textContent = String(summary.severeCount);
  }

  function downloadJson(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  function exportSummary() {
    const records = loadRecords();
    const summary = computeSummary(records);
    renderSummary(summary);
    downloadJson('signal-cards-canary-insights-summary.json', summary);
  }

  function init() {
    seedIfEmpty();

    const exportBtn = document.querySelector('[data-action-id="ACT_EXPORT_SUMMARY"]');
    if (exportBtn) {
      exportBtn.addEventListener('click', function (event) {
        event.preventDefault();
        exportSummary();
      });
    }

    const records = loadRecords();
    const summary = computeSummary(records);
    renderSummary(summary);

    window.addEventListener('scc:records:changed', function () {
      const updated = loadRecords();
      renderSummary(computeSummary(updated));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
