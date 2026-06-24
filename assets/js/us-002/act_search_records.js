/**
 * US-002 Action Handler: ACT_SEARCH_RECORDS
 *
 * Filters the record list on Record Operations by query text,
 * status filter, and severity filter. Emits visible feedback.
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

  function loadRecords() {
    try {
      const raw = localStorage.getItem(RECORDS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load records:', err);
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
    return document.querySelector('[data-testid="record-list"]');
  }

  function getEmptyStateEl() {
    return document.querySelector('[data-testid="record-empty-state"]');
  }

  function renderCount(count, total) {
    const countEl = document.querySelector('[data-testid="record-count"]');
    if (countEl) countEl.textContent = String(count) + ' of ' + String(total);
  }

  function clearChildren(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function renderRecords(records) {
    const list = getRecordListEl();
    const empty = getEmptyStateEl();
    if (!list) return;
    clearChildren(list);

    if (records.length === 0) {
      if (empty) empty.style.display = 'block';
      const all = loadRecords();
      renderCount(0, all.length);
      return;
    }
    if (empty) empty.style.display = 'none';

    records.forEach(function (record) {
      const row = document.createElement('article');
      row.className = 'record-row';
      row.setAttribute('data-record-id', record.id);
      row.setAttribute('data-testid', 'record-row');

      const main = document.createElement('div');
      main.className = 'record-row-main';

      const title = document.createElement('h3');
      title.className = 'record-title';
      title.textContent = record.title;

      const meta = document.createElement('span');
      meta.className = 'record-meta';
      const type = record.type || 'unknown';
      const severity = record.severity !== undefined && record.severity !== null ? record.severity : '—';
      const status = record.status || 'unknown';
      meta.textContent = type + ' · Severity ' + severity + ' · ' + status;

      main.appendChild(title);
      main.appendChild(meta);

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn btn-ghost';
      editBtn.setAttribute('data-action-id', 'ACT_SELECT_RECORD');
      editBtn.setAttribute('data-record-id', record.id);
      editBtn.textContent = 'Edit';

      row.appendChild(main);
      row.appendChild(editBtn);
      list.appendChild(row);
    });

    const all = loadRecords();
    renderCount(records.length, all.length);
  }

  function filterRecords() {
    const searchInput = document.querySelector('[data-action-id="ACT_SEARCH_RECORDS"]');
    const statusFilter = document.querySelector('[data-filter-id="status"]');
    const severityFilter = document.querySelector('[data-filter-id="severity"]');

    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const status = statusFilter ? statusFilter.value : '';
    const severity = severityFilter ? severityFilter.value : '';

    let records = loadRecords();

    if (query) {
      records = records.filter(function (r) {
        const title = r.title ? String(r.title).toLowerCase() : '';
        const details = r.details ? String(r.details).toLowerCase() : '';
        const type = r.type ? String(r.type).toLowerCase() : '';
        return (
          title.indexOf(query) !== -1 ||
          details.indexOf(query) !== -1 ||
          type.indexOf(query) !== -1
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

    renderRecords(records);
  }

  function init() {
    seedIfEmpty();
    filterRecords();

    const searchInput = document.querySelector('[data-action-id="ACT_SEARCH_RECORDS"]');
    if (searchInput) {
      searchInput.addEventListener('input', filterRecords);
    }

    const statusFilter = document.querySelector('[data-filter-id="status"]');
    const severityFilter = document.querySelector('[data-filter-id="severity"]');
    if (statusFilter) statusFilter.addEventListener('change', filterRecords);
    if (severityFilter) severityFilter.addEventListener('change', filterRecords);

    const clearBtn = document.querySelector('[data-action-id="clear-filters"]');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (searchInput) searchInput.value = '';
        if (statusFilter) statusFilter.value = '';
        if (severityFilter) severityFilter.value = '';
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
