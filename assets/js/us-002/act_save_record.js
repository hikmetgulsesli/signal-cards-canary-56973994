/**
 * US-002 Action Handler: ACT_SAVE_RECORD
 *
 * Persists the record editor form and returns to Record Operations.
 */
(function () {
  'use strict';

  const RECORDS_KEY = 'signal-cards-canary:records';

  function loadRecords() {
    try {
      const raw = localStorage.getItem(RECORDS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load records:', err);
    }
    return [];
  }

  function saveRecords(records) {
    try {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save records:', err);
    }
  }

  function getRecordIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  function generateId() {
    return 'rec-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  function getFormValues() {
    const titleInput = document.querySelector('[data-field-id="title"]');
    const typeInput = document.querySelector('[data-field-id="type"]');
    const severityInput = document.querySelector('[data-field-id="severity"]');
    const detailsInput = document.querySelector('[data-field-id="details"]');
    const statusInput = document.querySelector('[data-field-id="status"]');

    return {
      title: titleInput ? titleInput.value.trim() : '',
      type: typeInput ? typeInput.value : 'anomaly',
      severity: severityInput ? Math.max(0, Math.min(5, parseInt(severityInput.value, 10) || 0)) : 0,
      details: detailsInput ? detailsInput.value.trim() : '',
      status: statusInput ? statusInput.value : 'open'
    };
  }

  function populateForm(record) {
    const titleInput = document.querySelector('[data-field-id="title"]');
    const typeInput = document.querySelector('[data-field-id="type"]');
    const severityInput = document.querySelector('[data-field-id="severity"]');
    const detailsInput = document.querySelector('[data-field-id="details"]');
    const statusInput = document.querySelector('[data-field-id="status"]');

    if (titleInput) titleInput.value = record.title || '';
    if (typeInput) typeInput.value = record.type || 'anomaly';
    if (severityInput) severityInput.value = record.severity || 0;
    if (detailsInput) detailsInput.value = record.details || '';
    if (statusInput) statusInput.value = record.status || 'open';
  }

  function init() {
    const recordId = getRecordIdFromUrl();
    const records = loadRecords();
    let record = null;
    if (recordId) {
      record = records.find(function (r) {
        return r.id === recordId;
      });
      if (record) {
        populateForm(record);
      } else {
        const statusEl = document.querySelector('[data-testid="editor-status"]');
        if (statusEl) statusEl.textContent = 'Record not found.';
      }
    }

    const form = document.querySelector('[data-testid="record-editor-form"]');
    const saveButton = document.querySelector('[data-action-id="ACT_SAVE_RECORD"]');

    function saveHandler(event) {
      event.preventDefault();
      const values = getFormValues();
      if (!values.title) {
        const statusEl = document.querySelector('[data-testid="editor-status"]');
        if (statusEl) statusEl.textContent = 'Title is required.';
        return;
      }

      const updatedRecords = loadRecords();
      const existingIndex = recordId
        ? updatedRecords.findIndex(function (r) {
            return r.id === recordId;
          })
        : -1;

      if (existingIndex >= 0) {
        updatedRecords[existingIndex] = Object.assign({}, updatedRecords[existingIndex], values);
      } else {
        updatedRecords.push(Object.assign({ id: generateId() }, values));
      }

      saveRecords(updatedRecords);
      window.location.href = 'record-operations-signal-cards-canary.html';
    }

    if (form) {
      form.addEventListener('submit', saveHandler);
    }
    if (saveButton && !form) {
      saveButton.addEventListener('click', saveHandler);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
