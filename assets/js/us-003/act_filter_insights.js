/**
 * US-003 Action Handler: ACT_FILTER_INSIGHTS
 *
 * Filters the insights record list by query text, status, severity,
 * and record type. Emits visible feedback and sanitizes date sorting.
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
      console.error('Failed to load records for insights:', err);
    }
    return getDefaultRecords();
  }

  function saveRecords(records) {
    try {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save records:', err);
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

  function getRecordListEl() {
    return document.querySelector('[data-testid="insights-record-list"]');
  }

  function getEmptyStateEl() {
    return document.querySelector('[data-testid="insights-empty-state"]');
  }

  function renderCount(count, total) {
    const countEl = document.querySelector('[data-testid="insights-record-count"]');
    if (countEl) countEl.textContent = String(count) + ' of ' + String(total);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderTypeBadge(type) {
    const safeType = escapeHtml(type || 'unknown');
    return '<span class="insight-type-badge">' + safeType + '</span>';
  }

  function formatDate(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString();
  }

  function renderRecords(records) {
    const list = getRecordListEl();
    const empty = getEmptyStateEl();
    if (!list) return;
    list.innerHTML = '';

    const sorted = records.slice().sort(function (a, b) {
      const aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const aTime = Number.isNaN(aVal) ? 0 : aVal;
      const bTime = Number.isNaN(bVal) ? 0 : bVal;
      return bTime - aTime;
    });

    if (sorted.length === 0) {
      if (empty) empty.style.display = 'block';
      const all = loadRecords();
      renderCount(0, all.length);
      return;
    }
    if (empty) empty.style.display = 'none';

    sorted.forEach(function (record) {
      const row = document.createElement('article');
      row.className = 'record-row';
      row.setAttribute('data-record-id', record.id);
      row.setAttribute('data-testid', 'insights-record-row');
      row.innerHTML =
        '<div class="record-row-main">' +
        '<h3 class="record-title">' + escapeHtml(record.title) + '</h3>' +
        '<span class="record-meta">' +
        renderTypeBadge(record.type) +
        ' · Severity ' + record.severity +
        ' · ' + escapeHtml(record.status) +
        ' · ' + formatDate(record.createdAt) +
        '</span>' +
        '</div>';
      list.appendChild(row);
    });

    const all = loadRecords();
    renderCount(sorted.length, all.length);
  }

  function filterRecords() {
    const searchInput = document.querySelector('[data-action-id="ACT_FILTER_INSIGHTS"]');
    const statusFilter = document.querySelector('[data-filter-id="insights-status"]');
    const severityFilter = document.querySelector('[data-filter-id="insights-severity"]');
    const typeFilter = document.querySelector('[data-filter-id="insights-type"]');

    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const status = statusFilter ? statusFilter.value : '';
    const severity = severityFilter ? severityFilter.value : '';
    const type = typeFilter ? typeFilter.value : '';

    let records = loadRecords();

    if (query) {
      records = records.filter(function (r) {
        const title = r.title ? String(r.title).toLowerCase() : '';
        const details = r.details ? String(r.details).toLowerCase() : '';
        const typeText = r.type ? String(r.type).toLowerCase() : '';
        return (
          title.indexOf(query) !== -1 ||
          details.indexOf(query) !== -1 ||
          typeText.indexOf(query) !== -1
        );
      });
    }

    if (status) {
      records = records.filter(function (r) {
        return r.status === status;
      });
    }

    if (severity) {
      records = records.filter(function (r) {
        return String(r.severity) === severity;
      });
    }

    if (type) {
      records = records.filter(function (r) {
        return r.type === type;
      });
    }

    renderRecords(records);
  }

  function init() {
    seedIfEmpty();
    filterRecords();

    const searchInput = document.querySelector('[data-action-id="ACT_FILTER_INSIGHTS"]');
    if (searchInput) {
      searchInput.addEventListener('input', filterRecords);
    }

    const statusFilter = document.querySelector('[data-filter-id="insights-status"]');
    const severityFilter = document.querySelector('[data-filter-id="insights-severity"]');
    const typeFilter = document.querySelector('[data-filter-id="insights-type"]');
    if (statusFilter) statusFilter.addEventListener('change', filterRecords);
    if (severityFilter) severityFilter.addEventListener('change', filterRecords);
    if (typeFilter) typeFilter.addEventListener('change', filterRecords);

    const clearBtn = document.querySelector('[data-action-id="insights-clear-filters"]');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (searchInput) searchInput.value = '';
        if (statusFilter) statusFilter.value = '';
        if (severityFilter) severityFilter.value = '';
        if (typeFilter) typeFilter.value = '';
        filterRecords();
      });
    }

    window.addEventListener('scc:records:changed', filterRecords);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
