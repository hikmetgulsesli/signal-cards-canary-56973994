/**
 * Signal Cards Canary - App Shell
 *
 * Loads persisted counter state, renders three colored counters,
 * wires add/reset buttons, and exposes window.app for smoke testing.
 */
(function () {
  'use strict';

  const stateApi = window.SignalCardsCanaryState;
  const storageApi = window.SignalCardsCanaryStorage;

  function loadSeed() {
    return fetch('assets/data/signal-cards-canary.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load seed data');
        return res.json();
      })
      .catch(function () {
        return stateApi.DEFAULT_STATE;
      });
  }

  function initApp() {
    const root = document.querySelector('[data-setfarm-root="baseline"]');
    if (!root) return;

    root.innerHTML = '';

    const header = document.createElement('header');
    header.className = 'app-header';
    header.innerHTML = '<h1>Signal Cards Canary</h1><p class="subtitle">Operational note counter</p>';
    root.appendChild(header);

    const countersEl = document.createElement('section');
    countersEl.className = 'counter-grid';
    countersEl.setAttribute('data-testid', 'counter-grid');
    root.appendChild(countersEl);

    const globalActions = document.createElement('div');
    globalActions.className = 'global-actions';
    globalActions.innerHTML =
      '<button type="button" class="btn btn-secondary" data-action-id="reset-all">Reset All</button>';
    root.appendChild(globalActions);

    function renderCounter(counter) {
      const article = document.createElement('article');
      article.className = 'counter-card counter-card--' + counter.color;
      article.setAttribute('data-counter-id', counter.id);
      article.setAttribute('data-testid', 'counter-card');

      article.innerHTML =
        '<div class="counter-meta">' +
        '<span class="counter-label">' + escapeHtml(counter.label) + '</span>' +
        '<span class="counter-accent"></span>' +
        '</div>' +
        '<div class="counter-value" data-testid="counter-value">' + formatNumber(counter.value) + '</div>' +
        '<div class="counter-actions">' +
        '<button type="button" class="btn btn-primary" data-action-id="add" data-counter-id="' + counter.id + '">Add</button>' +
        '<button type="button" class="btn btn-ghost" data-action-id="reset" data-counter-id="' + counter.id + '">Reset</button>' +
        '</div>';

      return article;
    }

    function render(state) {
      countersEl.innerHTML = '';
      Object.keys(state.counters).forEach(function (id) {
        countersEl.appendChild(renderCounter(state.counters[id]));
      });
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = String(text);
      return div.innerHTML;
    }

    function formatNumber(n) {
      return Number.isFinite(n) ? n.toLocaleString() : '0';
    }

    stateApi.subscribe(function (state) {
      render(state);
      if (storageApi && storageApi.save) {
        storageApi.save(state);
      }
    });

    root.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-action-id]');
      if (!button) return;

      const actionId = button.getAttribute('data-action-id');
      const counterId = button.getAttribute('data-counter-id');

      if (actionId === 'add' && counterId) {
        stateApi.incrementCounter(counterId, 1);
      } else if (actionId === 'reset' && counterId) {
        stateApi.resetCounter(counterId);
      } else if (actionId === 'reset-all') {
        stateApi.resetAllCounters();
      }
    });
  }

  function bootstrap() {
    if (!window.SignalCardsCanaryState || !window.SignalCardsCanaryStorage) {
      // Wait for modules if they are loaded later (should not happen with defer).
      setTimeout(bootstrap, 50);
      return;
    }

    const stored = storageApi.load();
    if (stored) {
      stateApi.setState(stored);
      initApp();
      exposeBridge();
    } else {
      loadSeed().then(function (seed) {
        stateApi.setState(seed);
        initApp();
        exposeBridge();
      });
    }
  }

  function exposeBridge() {
    window.app = {
      name: 'signal-cards-canary',
      ready: true,
      getState: stateApi.getState,
      increment: stateApi.incrementCounter,
      reset: stateApi.resetCounter,
      resetAll: stateApi.resetAllCounters,
      clearStorage: function () {
        if (storageApi.clear) storageApi.clear();
        stateApi.resetState();
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
