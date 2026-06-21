/**
 * US-002 Action: Create Record
 *
 * Owns the shared record state used by the Record Operations and Record Editor
 * surfaces. Provides create-record, sensors, and settings click handling.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'signal-cards-canary:records';

  const DEFAULT_RECORDS = [
    {
      id: 'r1',
      title: 'Q3 Metric Anomaly',
      type: 'anomaly',
      severity: 3,
      details: 'Unexpected latency spike detected in the canary service.',
      status: 'open',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'r2',
      title: 'Scheduled Maintenance Window',
      type: 'maintenance',
      severity: 1,
      details: 'Routine database patching during low-traffic hours.',
      status: 'resolved',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'r3',
      title: 'Incident-2042 Follow-up',
      type: 'incident',
      severity: 4,
      details: 'Post-incident review actions pending.',
      status: 'acknowledged',
      updatedAt: new Date().toISOString()
    }
  ];

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function now() {
    return new Date().toISOString();
  }

  function storageAvailable() {
    try {
      const testKey = '__us002_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (err) {
      return false;
    }
  }

  function loadRecords() {
    if (!storageAvailable()) return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.records)) return null;
      return parsed.records;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('US-002 loadRecords error:', err);
      return null;
    }
  }

  function persistRecords(records) {
    if (!storageAvailable()) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ records: records, savedAt: now() }));
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('US-002 persistRecords error:', err);
      return false;
    }
  }

  let state = {
    records: loadRecords() || deepClone(DEFAULT_RECORDS),
    selectedId: null,
    query: '',
    filters: { type: 'all', status: 'all' },
    sensorsActive: false,
    settingsOpen: false,
    loading: false,
    error: null
  };

  const listeners = new Set();

  function notify() {
    const snapshot = getState();
    listeners.forEach(function (listener) {
      try {
        listener(snapshot);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('US-002 state listener error:', err);
      }
    });
  }

  function getState() {
    return deepClone(state);
  }

  function setState(patch) {
    if (!patch || typeof patch !== 'object') return;
    Object.keys(patch).forEach(function (key) {
      state[key] = deepClone(patch[key]);
    });
    if (patch.records) {
      persistRecords(state.records);
    }
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

  function generateId() {
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function addRecord(record) {
    const next = deepClone(state.records);
    next.unshift({
      id: record.id || generateId(),
      title: String(record.title || '').trim(),
      type: String(record.type || 'anomaly').trim(),
      severity: Number.isFinite(record.severity) ? record.severity : 0,
      details: String(record.details || '').trim(),
      status: ['open', 'acknowledged', 'resolved'].indexOf(record.status) !== -1 ? record.status : 'open',
      updatedAt: now()
    });
    setState({ records: next });
    return next[0].id;
  }

  function updateRecord(id, patch) {
    const idx = state.records.findIndex(function (r) {
      return r.id === id;
    });
    if (idx === -1) return false;
    const next = deepClone(state.records);
    const record = next[idx];
    if (patch.title != null) record.title = String(patch.title).trim();
    if (patch.type != null) record.type = String(patch.type).trim();
    if (patch.severity != null) record.severity = Number.isFinite(patch.severity) ? patch.severity : record.severity;
    if (patch.details != null) record.details = String(patch.details).trim();
    if (patch.status != null && ['open', 'acknowledged', 'resolved'].indexOf(patch.status) !== -1) {
      record.status = patch.status;
    }
    record.updatedAt = now();
    setState({ records: next });
    return true;
  }

  function getRecordById(id) {
    return deepClone(state.records.find(function (r) {
      return r.id === id;
    }) || null);
  }

  function getFilteredRecords() {
    const query = String(state.query).toLowerCase().trim();
    const typeFilter = state.filters.type || 'all';
    const statusFilter = state.filters.status || 'all';
    return state.records.filter(function (record) {
      const matchesQuery = !query ||
        String(record.title).toLowerCase().indexOf(query) !== -1 ||
        String(record.details).toLowerCase().indexOf(query) !== -1;
      const matchesType = typeFilter === 'all' || record.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      return matchesQuery && matchesType && matchesStatus;
    });
  }

  function applyFilters() {
    notify();
  }

  function selectRecord(id) {
    setState({ selectedId: id });
  }

  function retryLoad() {
    setState({ loading: true, error: null });
    // Simulate a recoverable async load, then restore persisted or default data.
    window.setTimeout(function () {
      const persisted = loadRecords();
      setState({
        records: persisted || deepClone(DEFAULT_RECORDS),
        loading: false,
        error: null
      });
    }, 300);
    return true;
  }

  function showToast(message) {
    const toast = document.querySelector('[data-testid="toast"]');
    if (!toast) return;
    toast.textContent = String(message);
    toast.classList.add('toast--visible');
    window.setTimeout(function () {
      toast.classList.remove('toast--visible');
    }, 2000);
  }

  function handleClick(event) {
    const button = event.target.closest('button[data-action-id]');
    if (!button) return;
    const actionId = button.getAttribute('data-action-id');

    if (actionId === 'create-record') {
      location.href = 'record-editor-signal-cards-canary.html?new=1';
      return;
    }

    if (actionId === 'sensors') {
      setState({ sensorsActive: !state.sensorsActive });
      showToast(state.sensorsActive ? 'Sensors active' : 'Sensors paused');
      return;
    }

    if (actionId === 'settings') {
      setState({ settingsOpen: !state.settingsOpen });
      showToast(state.settingsOpen ? 'Settings panel opened' : 'Settings panel closed');
      return;
    }
  }

  window.US002RecordState = {
    STORAGE_KEY: STORAGE_KEY,
    getState: getState,
    setState: setState,
    subscribe: subscribe,
    addRecord: addRecord,
    updateRecord: updateRecord,
    getRecordById: getRecordById,
    getFilteredRecords: getFilteredRecords,
    applyFilters: applyFilters,
    selectRecord: selectRecord,
    retryLoad: retryLoad
  };

  document.addEventListener('click', handleClick);

  // Persist initial seed if storage was empty.
  persistRecords(state.records);
})();
