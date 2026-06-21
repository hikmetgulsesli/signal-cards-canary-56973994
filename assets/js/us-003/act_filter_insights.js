/**
 * US-003 Action Handler: ACT_FILTER_INSIGHTS
 *
 * Computes and renders insight metrics from persisted records,
 * toggles the filter panel, and refreshes summaries when filters change.
 */
(function () {
  'use strict';

  const RECORDS_KEY = 'signal-cards-canary:records';

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
      console.error('Failed to load records for insights:', err);
    }
    return getDefaultRecords();
  }

  function saveRecords(records) {
    try {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save records for insights:', err);
    }
  }

  function seedIfEmpty() {
    try {
      const raw = localStorage.getItem(RECORDS_KEY);
      if (!raw) saveRecords(getDefaultRecords());
    } catch (err) {
      saveRecords(getDefaultRecords());
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
  }

  function getFilters() {
    const statusFilter = document.querySelector('[data-testid="insights-screen"] [data-filter-id="status"]');
    const typeFilter = document.querySelector('[data-testid="insights-screen"] [data-filter-id="type"]');
    return {
      status: statusFilter ? statusFilter.value : '',
      type: typeFilter ? typeFilter.value : ''
    };
  }

  function applyFilters(records) {
    const filters = getFilters();
    return records.filter(function (r) {
      if (filters.status && r.status !== filters.status) return false;
      if (filters.type && r.type !== filters.type) return false;
      return true;
    });
  }

  function computeMetrics(records) {
    const total = records.length;
    const open = records.filter(function (r) { return r.status === 'open'; }).length;
    const acknowledged = records.filter(function (r) { return r.status === 'acknowledged'; }).length;
    const resolved = records.filter(function (r) { return r.status === 'resolved'; }).length;
    const avgSeverity = total > 0
      ? records.reduce(function (sum, r) { return sum + (Number(r.severity) || 0); }, 0) / total
      : 0;
    return {
      total: total,
      open: open,
      acknowledged: acknowledged,
      resolved: resolved,
      avgSeverity: avgSeverity
    };
  }

  function renderMetrics(metrics) {
    const grid = document.querySelector('[data-testid="metrics-grid"]');
    if (!grid) return;

    const items = [
      { label: 'Total Records', value: metrics.total },
      { label: 'Open', value: metrics.open },
      { label: 'Acknowledged', value: metrics.acknowledged },
      { label: 'Resolved', value: metrics.resolved },
      { label: 'Avg Severity', value: metrics.avgSeverity.toFixed(1) }
    ];

    grid.innerHTML = items.map(function (item) {
      return '<article class="metric-card" data-testid="metric-card">' +
        '<span class="metric-label">' + escapeHtml(item.label) + '</span>' +
        '<span class="metric-value" data-testid="metric-value">' + escapeHtml(String(item.value)) + '</span>' +
        '</article>';
    }).join('');
  }

  function renderDistribution(records) {
    const list = document.querySelector('[data-testid="distribution-list"]');
    if (!list) return;

    if (records.length === 0) {
      list.innerHTML = '<p>No data to display.</p>';
      return;
    }

    const counts = {};
    records.forEach(function (r) {
      const status = r.status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
    });

    const total = records.length;
    const rows = Object.keys(counts).sort().map(function (status) {
      const count = counts[status];
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return '<div class="distribution-row" data-testid="distribution-row">' +
        '<span>' + escapeHtml(status.charAt(0).toUpperCase() + status.slice(1)) + '</span>' +
        '<div class="distribution-track">' +
        '<div class="distribution-fill" style="width: ' + pct + '%;"></div>' +
        '</div>' +
        '<span class="distribution-count">' + count + '</span>' +
        '</div>';
    }).join('');

    list.innerHTML = rows;
  }

  function renderActivity(records) {
    const list = document.querySelector('[data-testid="activity-list"]');
    if (!list) return;

    const sorted = records.slice().sort(function (a, b) {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    const recent = sorted.slice(0, 10);

    if (recent.length === 0) {
      list.innerHTML = '<p class="activity-item">No recent activity.</p>';
      return;
    }

    list.innerHTML = recent.map(function (r) {
      return '<article class="activity-item" data-testid="activity-item">' +
        '<strong>' + escapeHtml(r.title || 'Untitled') + '</strong> · ' +
        escapeHtml(r.status || 'unknown') +
        ' · <time>' + escapeHtml(formatDate(r.createdAt)) + '</time>' +
        '</article>';
    }).join('');
  }

  function renderHint(metrics) {
    const hint = document.querySelector('[data-testid="insights-hint"]');
    if (!hint) return;

    if (metrics.total === 0) {
      hint.textContent = 'Create your first record to start tracking insights.';
      hint.style.display = 'block';
      return;
    }

    if (metrics.open > 0) {
      hint.textContent = 'You have ' + metrics.open + ' open record' + (metrics.open === 1 ? '' : 's') + ' requiring attention.';
    } else if (metrics.acknowledged > 0) {
      hint.textContent = 'All open records are acknowledged. Review progress in Operations.';
    } else {
      hint.textContent = 'All records are resolved. Great work!';
    }
    hint.style.display = 'block';
  }

  function updateEmptyState(metrics) {
    const empty = document.querySelector('[data-testid="insights-empty-state"]');
    if (!empty) return;
    empty.style.display = metrics.total === 0 ? 'block' : 'none';
  }

  function renderAll() {
    const records = loadRecords();
    const filtered = applyFilters(records);
    const metrics = computeMetrics(filtered);

    renderMetrics(metrics);
    renderDistribution(filtered);
    renderActivity(filtered);
    renderHint(metrics);
    updateEmptyState(metrics);

    window.dispatchEvent(new CustomEvent('scc:insights:updated', {
      detail: { records: filtered, metrics: metrics }
    }));
  }

  function toggleFilterPanel() {
    const panel = document.querySelector('[data-testid="insights-filter-panel"]');
    if (!panel) return;
    panel.classList.toggle('is-open');
    const isOpen = panel.classList.contains('is-open');
    const toggleBtn = document.querySelector('[data-action-id="ACT_FILTER_INSIGHTS"]');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(isOpen));
  }

  function init() {
    seedIfEmpty();
    renderAll();

    const filterBtn = document.querySelector('[data-action-id="ACT_FILTER_INSIGHTS"]');
    if (filterBtn) {
      filterBtn.setAttribute('aria-expanded', 'false');
      filterBtn.addEventListener('click', function (event) {
        event.preventDefault();
        toggleFilterPanel();
      });
    }

    const statusFilter = document.querySelector('[data-testid="insights-screen"] [data-filter-id="status"]');
    const typeFilter = document.querySelector('[data-testid="insights-screen"] [data-filter-id="type"]');
    if (statusFilter) statusFilter.addEventListener('change', renderAll);
    if (typeFilter) typeFilter.addEventListener('change', renderAll);

    window.addEventListener('scc:records:changed', renderAll);

    const viewLogsBtn = document.querySelector('[data-action-id="ACT_VIEW_ALL_LOGS"]');
    if (viewLogsBtn) {
      viewLogsBtn.addEventListener('click', function (event) {
        event.preventDefault();
        const activityList = document.querySelector('[data-testid="activity-list"]');
        if (activityList) activityList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
