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
      const VALID_COLORS = { blue: 1, amber: 1, emerald: 1 };
      const safeColor = VALID_COLORS[counter.color] ? counter.color : 'default';
      article.className = 'counter-card counter-card--' + safeColor;
      article.setAttribute('data-counter-id', String(counter.id));
      article.setAttribute('data-testid', 'counter-card');

      const meta = document.createElement('div');
      meta.className = 'counter-meta';
      const label = document.createElement('span');
      label.className = 'counter-label';
      label.textContent = counter.label;
      const accent = document.createElement('span');
      accent.className = 'counter-accent';
      meta.appendChild(label);
      meta.appendChild(accent);

      const valueEl = document.createElement('div');
      valueEl.className = 'counter-value';
      valueEl.setAttribute('data-testid', 'counter-value');
      valueEl.textContent = formatNumber(counter.value);

      const actions = document.createElement('div');
      actions.className = 'counter-actions';

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'btn btn-primary';
      addBtn.setAttribute('data-action-id', 'add');
      addBtn.setAttribute('data-counter-id', String(counter.id));
      addBtn.textContent = 'Add';

      const resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'btn btn-ghost';
      resetBtn.setAttribute('data-action-id', 'reset');
      resetBtn.setAttribute('data-counter-id', String(counter.id));
      resetBtn.textContent = 'Reset';

      actions.appendChild(addBtn);
      actions.appendChild(resetBtn);

      article.appendChild(meta);
      article.appendChild(valueEl);
      article.appendChild(actions);

      return article;
    }

    function render(state) {
      countersEl.innerHTML = '';
      Object.keys(state.counters).forEach(function (id) {
        countersEl.appendChild(renderCounter(state.counters[id]));
      });
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
      const counterId = button.closest('[data-counter-id]')
        ? button.closest('[data-counter-id]').getAttribute('data-counter-id')
        : null;

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
