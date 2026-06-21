/**
 * US-003 Action Handler: ACT_EXPORT_SUMMARY
 *
 * Exports the current insights summary as a downloadable JSON file.
 */
(function () {
  'use strict';

  const RECORDS_KEY = 'signal-cards-canary:records';
  let lastSummary = null;

  function getDefaultRecords() {
    return [
      { id: 'rec-1', title: 'Q3 Metric Anomaly', type: 'anomaly', severity: 3, details: 'Observed spike in north region.', status: 'open', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'rec-2', title: 'Latency baseline drift', type: 'performance', severity: 2, details: 'P95 increased by 12%.', status: 'acknowledged', createdAt: new Date(Date.now() - 172800000).toISOString() },
      { id: 'rec-3', title: 'Disk pressure warning', type: 'infrastructure', severity: 4, details: 'Volume at 87% capacity.', status: 'resolved', createdAt: new Date(Date.now() - 259200000).toISOString() }
    ];
  }

  function loadRecords() {
    try {
      const raw = localStorage.getItem(RECORDS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load records for export:', err);
    }
    return getDefaultRecords();
  }

  function computeSummary(records) {
    const total = records.length;
    const byStatus = {};
    const byType = {};
    let severitySum = 0;

    records.forEach(function (r) {
      const status = r.status || 'unknown';
      const type = r.type || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
      byType[type] = (byType[type] || 0) + 1;
      severitySum += Number(r.severity) || 0;
    });

    return {
      exportedAt: new Date().toISOString(),
      totalRecords: total,
      averageSeverity: total > 0 ? Number((severitySum / total).toFixed(2)) : 0,
      byStatus: byStatus,
      byType: byType,
      recentRecords: records.slice().sort(function (a, b) {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      }).slice(0, 10).map(function (r) {
        return {
          id: r.id,
          title: r.title,
          status: r.status,
          type: r.type,
          severity: r.severity,
          createdAt: r.createdAt
        };
      })
    };
  }

  function downloadJson(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportSummary() {
    const summary = lastSummary || computeSummary(loadRecords());
    const filename = 'signal-cards-canary-insights-' + new Date().toISOString().slice(0, 10) + '.json';
    downloadJson(filename, summary);
  }

  function init() {
    window.addEventListener('scc:insights:updated', function (event) {
      if (event.detail && event.detail.records) {
        lastSummary = computeSummary(event.detail.records);
      }
    });

    const exportBtn = document.querySelector('[data-action-id="ACT_EXPORT_SUMMARY"]');
    if (exportBtn) {
      exportBtn.addEventListener('click', function (event) {
        event.preventDefault();
        exportSummary();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
