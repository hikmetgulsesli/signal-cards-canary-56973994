/**
 * US-002 Action Handler: ACT_CANCEL_EDIT
 *
 * Abandons the record editor and returns to Record Operations.
 */
(function () {
  'use strict';

  function navigateBack() {
    window.location.href = 'record-operations-signal-cards-canary.html';
  }

  function init() {
    const buttons = document.querySelectorAll('[data-action-id="ACT_CANCEL_EDIT"], [data-action-id="close-form"]');
    buttons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        navigateBack();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
