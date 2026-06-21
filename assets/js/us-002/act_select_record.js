/**
 * US-002 Action Handler: ACT_SELECT_RECORD
 *
 * Opens the record editor for the selected existing record.
 */
(function () {
  'use strict';

  function navigateToEditor(recordId) {
    window.location.href = 'record-editor-signal-cards-canary.html?id=' + encodeURIComponent(recordId);
  }

  function init() {
    document.addEventListener('click', function (event) {
      const button = event.target.closest('[data-action-id="ACT_SELECT_RECORD"]');
      if (!button) return;
      event.preventDefault();
      const recordId = button.getAttribute('data-record-id');
      if (!recordId) return;
      navigateToEditor(recordId);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
