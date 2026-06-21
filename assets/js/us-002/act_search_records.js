/**
 * US-002 Action: Search Records
 *
 * Filters the Record Operations list by query and dropdown filters.
 */
(function () {
  'use strict';

  function getStateApi() {
    return window.US002RecordState || null;
  }

  function getInputValue(selector) {
    const el = document.querySelector(selector);
    return el ? String(el.value || '').trim() : '';
  }

  function applyCurrentFilters() {
    const stateApi = getStateApi();
    if (!stateApi) return;

    const query = getInputValue('[data-action-id="search-records"]');
    const type = getInputValue('[data-filter="type"]') || 'all';
    const status = getInputValue('[data-filter="status"]') || 'all';

    stateApi.setState({
      query: query,
      filters: { type: type, status: status }
    });
  }

  function clearFilters() {
    const searchInput = document.querySelector('[data-action-id="search-records"]');
    const typeSelect = document.querySelector('[data-filter="type"]');
    const statusSelect = document.querySelector('[data-filter="status"]');

    if (searchInput) searchInput.value = '';
    if (typeSelect) typeSelect.value = 'all';
    if (statusSelect) statusSelect.value = 'all';

    applyCurrentFilters();
  }

  function handleInput() {
    applyCurrentFilters();
  }

  function handleClick(event) {
    const button = event.target.closest('button[data-action-id]');
    if (!button) return;
    const actionId = button.getAttribute('data-action-id');

    if (actionId === 'filter-options') {
      applyCurrentFilters();
      return;
    }

    if (actionId === 'clear-filters') {
      clearFilters();
      return;
    }
  }

  function init() {
    const searchInput = document.querySelector('[data-action-id="search-records"]');
    if (searchInput) {
      searchInput.addEventListener('input', handleInput);
    }

    const typeSelect = document.querySelector('[data-filter="type"]');
    const statusSelect = document.querySelector('[data-filter="status"]');
    if (typeSelect) typeSelect.addEventListener('change', applyCurrentFilters);
    if (statusSelect) statusSelect.addEventListener('change', applyCurrentFilters);

    document.addEventListener('click', handleClick);

    // Ensure the list reflects any persisted query/filters on load.
    applyCurrentFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
