/* Avvio dell'app: schede, scorciatoie, impostazioni, esporta tutto. */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var h = App.h;

  if (!window.api) {
    document.body.textContent = 'Questa pagina funziona solo dentro l\'app Catalogo MD.';
    return;
  }

  var tabs = [];
  var byId = {};
  var current = null;
  var tabsNav = document.getElementById('tabs');
  var main = document.getElementById('main');

  App.config = { dataDir: '', prefisso: 'md' };
  App.tabs = tabs;

  function anyDirty() {
    return tabs.some(function (t) { return t.isDirty(); });
  }

  /* ---------- schede ---------- */

  function showTab(id, force) {
    var next = byId[id];
    if (!next) return Promise.resolve();
    if (!force && current === next) return Promise.resolve();
    var leaving = current && current !== next ? current : null;
    return App.guardDirty(leaving).then(function (ok) {
      if (!ok) return;
      current = next;
      tabs.forEach(function (t) {
        var on = t === next;
        t.button.setAttribute('aria-selected', String(on));
        t.button.tabIndex = on ? 0 : -1;
        t.el.hidden = !on;
      });
      return next.show();
    });
  }

  function reloadAll() {
    tabs.forEach(function (t) {
      if (t.reset) t.reset();
    });
    App.invalidateGlobal();
    return current ? showTab(current.id, true) : Promise.resolve();
  }

  function buildTabs() {
    App.tabDefs.forEach(function (def, index) {
      var t = def.create();
      t.id = def.id;
      t.label = def.label;
      t.button = h('button', {
        type: 'button',
        class: 'tab',
        role: 'tab',
        id: 'tab-' + def.id,
        'aria-selected': 'false',
        'aria-controls': 'panel-' + def.id,
        'aria-keyshortcuts': 'Control+' + (index + 1),
        tabindex: '-1',
        text: def.label,
        onclick: function () { showTab(def.id); }
      });
      t.el.setAttribute('aria-labelledby', 'tab-' + def.id);
      tabs.push(t);
      byId[def.id] = t;
      tabsNav.appendChild(t.button);
      main.appendChild(t.el);
    });

    tabsNav.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(current);
      var to = -1;
      if (e.key === 'ArrowRight') to = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') to = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = tabs.length - 1;
      if (to < 0) return;
      e.preventDefault();
      showTab(tabs[to].id).then(function () { tabs[to].button.focus(); });
    });
  }

  /* ---------- esporta tutto ---------- */

  function exportAll() {
    var dirty = tabs.filter(function (t) { return t.isDirty(); });
    var ask = dirty.length
      ? App.askConfirm({
          title: 'Ci sono modifiche non salvate',
          message:
            'L\'esportazione usa solo quello che hai già salvato. Da salvare: ' +
            dirty.map(function (t) { return t.label; }).join(', ') +
            '. Esporto lo stesso?',
          okLabel: 'Esporta lo stesso'
        })
      : Promise.resolve(true);
    return ask.then(function (yes) {
      if (!yes) return;
      return App.run(function () { return window.api.exportAll(); }).then(function (r) {
        if (r && !r.annullato) {
          App.toast('Esportato in: ' + r.cartella + ' (' + r.strutture + ' strutture, ' + r.componenti + ' componenti)');
        }
      });
    });
  }

  /* ---------- impostazioni ---------- */

  function openSettings() {
    return App.modal(function (d, finish) {
      var pathEl = h('code', { class: 'mono', text: App.config.dataDir });
      var prefixInput = h('input', {
        type: 'text',
        value: App.config.prefisso,
        spellcheck: 'false',
        autocomplete: 'off',
        'aria-label': 'Prefisso del file CSS delle classi'
      });
      var msg = h('p', { class: 'muted', role: 'status' });

      function say(text, isError) {
        msg.textContent = text;
        msg.className = isError ? 'form-error' : 'muted';
      }

      function small(label, fn) {
        return h('button', { type: 'button', class: 'btn small', text: label, onclick: fn });
      }

      d.appendChild(
        h('div', { class: 'modal-form' }, [
          h('h2', { text: 'Impostazioni' }),
          h('div', { class: 'field' }, [h('span', { text: 'Cartella dei dati' }), pathEl]),
          h('div', { class: 'btn-row' }, [
            small('Apri la cartella', function () {
              Promise.resolve(window.api.openDataDir()).catch(function (e) { say(App.cleanError(e), true); });
            }),
            small('Cambia cartella…', function () {
              if (anyDirty()) {
                say('Prima salva o annulla le modifiche nelle schede, poi cambia cartella.', true);
                return;
              }
              Promise.resolve(window.api.chooseDataDir())
                .then(function (r) {
                  if (r.annullato) return;
                  App.config = { dataDir: r.dataDir, prefisso: r.prefisso };
                  pathEl.textContent = r.dataDir;
                  prefixInput.value = r.prefisso;
                  say('Cartella cambiata. Ora l\'app usa i dati di questa cartella.', false);
                  return reloadAll();
                })
                .catch(function (e) { say(App.cleanError(e), true); });
            })
          ]),
          h('label', { class: 'field' }, [
            h('span', { text: 'Prefisso del file CSS delle classi (esempio: md → md-classi.css)' }),
            prefixInput
          ]),
          h('div', { class: 'btn-row' }, [
            small('Salva prefisso', function () {
              Promise.resolve(window.api.setPrefix(prefixInput.value))
                .then(function (r) {
                  App.config = r;
                  say('Prefisso salvato: ' + r.prefisso, false);
                })
                .catch(function (e) { say(App.cleanError(e), true); });
            })
          ]),
          msg,
          h('div', { class: 'modal-actions' }, [
            h('button', { type: 'button', class: 'btn primary', text: 'Chiudi', onclick: function () { finish(true); } })
          ])
        ])
      );
    });
  }

  /* ---------- scorciatoie e uscita ---------- */

  document.addEventListener('keydown', function (e) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || document.querySelector('dialog[open]')) return;
    if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      if (current) current.save();
      return;
    }
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= tabs.length) {
      e.preventDefault();
      showTab(tabs[n - 1].id);
    }
  });

  window.addEventListener('beforeunload', function (e) {
    if (anyDirty()) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  document.getElementById('btn-export-all').addEventListener('click', exportAll);
  document.getElementById('btn-settings').addEventListener('click', openSettings);

  /* ---------- avvio ---------- */

  App.showTab = showTab;
  App.anyDirty = anyDirty;
  App.exportAll = exportAll;
  App.openSettings = openSettings;
  App.reloadAll = reloadAll;

  buildTabs();

  App.ready = Promise.resolve()
    .then(function () { return window.api.getConfig(); })
    .then(function (cfg) { App.config = cfg; })
    .catch(function (e) { App.toast(App.cleanError(e), true); })
    .then(function () { return showTab(App.tabDefs[0].id); });
})();
