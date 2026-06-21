/**
 * US-002 Action: Cancel Edit
 *
 * Closes the record editor without saving and returns to Record Operations.
 */
(function () {
  'use strict';

  function hasUnsavedChanges() {
    const titleInput = document.getElementById('record-title');
    const typeInput = document.getElementById('record-type');
    const severityInput = document.getElementById('record-severity');
    const detailsInput = document.getElementById('record-details');

    if (!titleInput || !typeInput || !severityInput || !detailsInput) return false;

    const title = String(titleInput.value || '').trim();
    const type = String(typeInput.value || '').trim();
    const severity = String(severityInput.value || '').trim();
    const details = String(detailsInput.value || '').trim();

    // If any field has been touched beyond the default severity of 0, treat as dirty.
    return title !== '' || type !== '' || details !== '' || severity !== '0';
  }

  function handleCancel() {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm('You have unsaved changes. Discard them?');
      if (!confirmed) return;
    }
    location.href = 'record-operations-signal-cards-canary.html';
  }

  function handleClick(event) {
    const button = event.target.closest('button[data-action-id="cancel-edit"]');
    if (!button) return;
    event.preventDefault();
    handleCancel();
  }

  function init() {
    document.addEventListener('click', handleClick);

    if (window.US002RecordState) {
      window.app = window.app || {};
      window.app.cancelEdit = function () {
        handleCancel();
        return true;
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
