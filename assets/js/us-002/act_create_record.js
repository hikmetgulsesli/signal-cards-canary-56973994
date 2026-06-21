/**
 * US-002 Action Handler: ACT_CREATE_RECORD
 *
 * Opens the record editor for a new record.
 */
(function () {
  'use strict';

  function navigateToEditor() {
    window.location.href = 'record-editor-signal-cards-canary.html';
  }

  function init() {
    const buttons = document.querySelectorAll('[data-action-id="ACT_CREATE_RECORD"]');
    buttons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        navigateToEditor();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
