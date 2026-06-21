/**
 * US-002 Action: Save Record
 *
 * Validates the record editor form, persists the record, and returns to the
 * Record Operations surface.
 */
(function () {
  'use strict';

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function setFeedback(message, type) {
    const feedback = document.querySelector('[data-testid="form-feedback"]');
    if (!feedback) return;
    feedback.textContent = String(message || '');
    feedback.className = 'feedback-message feedback-message--' + (type || 'error');
  }

  function clearFeedback() {
    const feedback = document.querySelector('[data-testid="form-feedback"]');
    if (!feedback) return;
    feedback.textContent = '';
    feedback.className = 'feedback-message';
  }

  function getFormValues(form) {
    const data = new FormData(form);
    return {
      title: String(data.get('title') || '').trim(),
      type: String(data.get('type') || '').trim(),
      severity: parseInt(data.get('severity'), 10),
      details: String(data.get('details') || '').trim()
    };
  }

  function validate(values) {
    if (!values.title) return 'Title is required.';
    if (!values.type) return 'Type is required.';
    if (!Number.isFinite(values.severity) || values.severity < 0 || values.severity > 5) {
      return 'Severity must be a number between 0 and 5.';
    }
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.target.closest('form[data-action-id="save-record"]');
    if (!form) return;

    const stateApi = window.US002RecordState;
    if (!stateApi) {
      setFeedback('Record state is not available.', 'error');
      return;
    }

    const values = getFormValues(form);
    const error = validate(values);
    if (error) {
      setFeedback(error, 'error');
      return;
    }

    clearFeedback();
    setFeedback('Saving...', 'success');

    const editId = getQueryParam('id');
    if (editId && stateApi.getRecordById(editId)) {
      stateApi.updateRecord(editId, values);
    } else {
      stateApi.addRecord(values);
    }

    window.setTimeout(function () {
      location.href = 'record-operations-signal-cards-canary.html';
    }, 150);
  }

  function populateForm() {
    const stateApi = window.US002RecordState;
    if (!stateApi) return;
    const editId = getQueryParam('id');

    const titleInput = document.getElementById('record-title');
    const typeInput = document.getElementById('record-type');
    const severityInput = document.getElementById('record-severity');
    const detailsInput = document.getElementById('record-details');

    if (editId) {
      const record = stateApi.getRecordById(editId);
      if (!record) return;
      if (titleInput) titleInput.value = String(record.title || '');
      if (typeInput) typeInput.value = String(record.type || '');
      if (severityInput) severityInput.value = String(record.severity != null ? record.severity : 0);
      if (detailsInput) detailsInput.value = String(record.details || '');
      return;
    }

    if (getQueryParam('new') === '1') {
      // Pre-fill a draft so the create-record flow can be exercised end-to-end.
      if (titleInput && !titleInput.value.trim()) titleInput.value = 'New Signal Record';
      if (typeInput && !typeInput.value.trim()) typeInput.value = 'anomaly';
      if (severityInput && !severityInput.value.trim()) severityInput.value = '0';
    }
  }

  function init() {
    const form = document.querySelector('form[data-action-id="save-record"]');
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
    populateForm();

    if (window.US002RecordState) {
      window.app = window.app || {};
      window.app.saveRecord = function (values) {
        const error = validate(values);
        if (error) return { ok: false, error: error };
        const editId = getQueryParam('id');
        if (editId && window.US002RecordState.getRecordById(editId)) {
          window.US002RecordState.updateRecord(editId, values);
        } else {
          window.US002RecordState.addRecord(values);
        }
        return { ok: true };
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
