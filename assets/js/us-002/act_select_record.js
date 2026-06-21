/**
 * US-002 Action: Select Record
 *
 * Selects a record from the operations table and updates record status via
 * acknowledge / resolve actions.
 */
(function () {
  'use strict';

  function getStateApi() {
    return window.US002RecordState || null;
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
    const recordId = button.getAttribute('data-record-id');
    const stateApi = getStateApi();
    if (!stateApi) return;

    if (actionId === 'select-record' && recordId) {
      stateApi.selectRecord(recordId);
      const record = stateApi.getRecordById(recordId);
      if (record) {
        showToast('Selected: ' + record.title);
      }
      return;
    }

    if (actionId === 'acknowledge' && recordId) {
      stateApi.updateRecord(recordId, { status: 'acknowledged' });
      showToast('Record acknowledged');
      return;
    }

    if (actionId === 'resolve' && recordId) {
      stateApi.updateRecord(recordId, { status: 'resolved' });
      showToast('Record resolved');
      return;
    }
  }

  function handleRowClick(event) {
    const row = event.target.closest('tr[data-record-id]');
    if (!row) return;
    if (event.target.closest('button[data-action-id]')) return;

    const recordId = row.getAttribute('data-record-id');
    const stateApi = getStateApi();
    if (!stateApi || !recordId) return;
    stateApi.selectRecord(recordId);
  }

  function init() {
    document.addEventListener('click', handleClick);

    const table = document.querySelector('[data-testid="record-table"]');
    if (table) {
      table.addEventListener('click', handleRowClick);
    }

    if (window.US002RecordState) {
      window.app = window.app || {};
      window.app.selectRecord = function (recordId) {
        if (!recordId) return false;
        window.US002RecordState.selectRecord(recordId);
        return true;
      };
      window.app.updateRecordStatus = function (recordId, status) {
        if (!recordId || ['open', 'acknowledged', 'resolved'].indexOf(status) === -1) return false;
        return window.US002RecordState.updateRecord(recordId, { status: status });
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
