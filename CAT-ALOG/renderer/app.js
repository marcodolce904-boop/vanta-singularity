/* Avvio dell'app: schede, scorciatoie, impostazioni, esporta tutto. */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var h = App.h;

  if (!window.api) {
    document.body.textContent = 'Questa pagina funziona solo dentro l\'app CAT-ALOG.';
    return;
  }

  /* ---------- aspetto (tema) ---------- */

  var TEMI = [
    ['classico', 'Classico (segue il tema del sistema)'],
    ['gatti', 'Gatti (chiaro, crema e arancio)'],
    ['gatti-scuro', 'Gatti scuro (notte)']
  ];

  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    return TEMI.some(function (x) { return x[0] === t; }) ? t : 'classico';
  }

  function applyTheme(t) {
    if (!TEMI.some(function (x) { return x[0] === t; })) t = 'classico';
    document.documentElement.setAttribute('data-theme', t);
    try {
      window.localStorage.setItem('cat-tema', t);
    } catch (e) { /* senza memoria locale il tema vale per questa sessione */ }
  }

  /* Il gatto del logo saluta solo se ci passi sopra con il mouse (e se non hai chiesto meno movimento). */
  (function () {
    var logo = document.getElementById('brand-logo');
    if (!logo || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var timer = null;
    logo.addEventListener('mouseenter', function () {
      logo.src = 'img/maneki-neko.svg';
      clearTimeout(timer);
      timer = setTimeout(function () { logo.src = 'img/maneki-neko-statico.svg'; }, 3600);
    });
  })();

  var tabs = [];
  var byId = {};
  var current = null;
  var tabsNav = document.getElementById('tabs');
  var main = document.getElementById('main');

  App.config = { dataDir: '', prefisso: 'cat', editor: 'code' };
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

  /* ---------- ricerca in tutte le schede (Ctrl/Cmd+K) ---------- */

  function norm(t) {
    return window.CatalogoApp.S.str(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function globalSearch() {
    var itemTabs = tabs.filter(function (t) { return typeof t.select === 'function'; });
    return Promise.all(
      itemTabs.map(function (t) {
        return Promise.resolve(window.api.list(t.id)).then(function (items) {
          return items.map(function (it) { return { tab: t, it: it }; });
        });
      })
    )
      .then(function (parts) {
        var all = [].concat.apply([], parts);
        return App.modal(function (d, finish) {
          var input = h('input', { type: 'search', placeholder: 'Cerca in tutte le schede…', 'aria-label': 'Cerca in tutte le schede' });
          var list = h('ul', { class: 'list global-results' });
          function render() {
            var q = norm(input.value);
            var hits = all.filter(function (x) {
              return !q || norm(x.it.nome + ' ' + x.it.descrizione + ' ' + x.it.tag.join(' ') + ' ' + x.tab.label).indexOf(q) !== -1;
            });
            hits.sort(function (a, b) { return (b.it.preferito ? 1 : 0) - (a.it.preferito ? 1 : 0); });
            list.textContent = '';
            if (!hits.length) list.appendChild(h('li', { class: 'empty', text: 'Nessun risultato.' }));
            hits.slice(0, 30).forEach(function (x) {
              list.appendChild(
                h('li', null, [
                  h('button', {
                    type: 'button',
                    class: 'list-btn',
                    onclick: function () { finish(x); }
                  }, [(x.it.preferito ? '★ ' : '') + x.it.nome, h('small', { text: x.tab.label + (x.it.descrizione ? ' · ' + x.it.descrizione : '') })])
                ])
              );
            });
          }
          input.addEventListener('input', render);
          input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
              var first = list.querySelector('.list-btn');
              if (first) first.click();
            }
          });
          d.appendChild(
            h('div', { class: 'modal-form' }, [
              h('h2', { text: 'Cerca' }),
              input,
              list,
              h('div', { class: 'modal-actions' }, [
                h('button', { type: 'button', class: 'btn', text: 'Chiudi', onclick: function () { finish(null); } })
              ])
            ])
          );
          render();
          setTimeout(function () { input.focus(); }, 0);
        });
      })
      .then(function (hit) {
        if (!hit) return;
        return showTab(hit.tab.id).then(function () {
          if (current === hit.tab) return hit.tab.select(hit.it.id);
        });
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
      var themeSelect = h('select', { 'aria-label': 'Aspetto dell\'app' }, TEMI.map(function (t) { return h('option', { value: t[0], text: t[1] }); }));
      themeSelect.value = currentTheme();
      themeSelect.addEventListener('change', function () { applyTheme(themeSelect.value); });
      var editorInput = h('input', {
        type: 'text',
        value: App.config.editor || 'code',
        spellcheck: 'false',
        autocomplete: 'off',
        'aria-label': 'Comando dell\'editor'
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
                  App.config = { dataDir: r.dataDir, prefisso: r.prefisso, editor: r.editor };
                  pathEl.textContent = r.dataDir;
                  prefixInput.value = r.prefisso;
                  say('Cartella cambiata. Ora l\'app usa i dati di questa cartella.', false);
                  return reloadAll();
                })
                .catch(function (e) { say(App.cleanError(e), true); });
            })
          ]),
          h('label', { class: 'field' }, [
            h('span', { text: 'Prefisso del file CSS delle classi (esempio: cat → cat-classi.css)' }),
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
          h('div', { class: 'field' }, [h('span', { text: 'Backup' })]),
          h('div', { class: 'btn-row' }, [
            small('Crea backup ZIP…', function () {
              Promise.resolve(window.api.backup())
                .then(function (r) {
                  if (r.annullato) return;
                  say('Backup salvato: ' + r.percorso, false);
                })
                .catch(function (e) { say(App.cleanError(e), true); });
            }),
            small('Ripristina da backup…', function () {
              if (anyDirty()) {
                say('Prima salva o annulla le modifiche nelle schede, poi ripristina.', true);
                return;
              }
              App.askConfirm({
                title: 'Ripristinare da un backup?',
                message: 'I dati attuali delle parti presenti nel backup vanno nel cestino (_cestino) e al loro posto arrivano quelli del backup.',
                okLabel: 'Scegli il backup',
                danger: true
              }).then(function (yes) {
                if (!yes) return;
                return Promise.resolve(window.api.restore()).then(function (r) {
                  if (r.annullato) return;
                  say('Ripristinati ' + r.file + ' file. I dati di prima sono in: ' + r.cestino, false);
                  return reloadAll();
                });
              }).catch(function (e) { say(App.cleanError(e), true); });
            })
          ]),
          h('label', { class: 'field' }, [
            h('span', { text: 'Aspetto' }),
            themeSelect
          ]),
          h('div', { class: 'field' }, [h('span', { text: 'Colori degli esempi' })]),
          h('p', { class: 'hint', text: 'Porta alla palette neutra (grigi e nero, contrasto alto) gli esempi già salvati che usano ancora i vecchi colori verdi. Cambia solo i colori identici a quelli di prima; la versione precedente resta in «Versioni…».' }),
          h('div', { class: 'btn-row' }, [
            small('Aggiorna i colori degli esempi', function () {
              if (anyDirty()) {
                say('Prima salva o annulla le modifiche nelle schede.', true);
                return;
              }
              App.askConfirm({
                title: 'Aggiornare i colori degli esempi?',
                message: 'Root, classi e tutti gli elementi che usano i vecchi colori passano alla palette neutra.',
                okLabel: 'Aggiorna'
              }).then(function (yes) {
                if (!yes) return;
                return Promise.resolve(window.api.neutralizeSaved()).then(function (r) {
                  say('Fatto: ' + r.root + ' variabili del Root, ' + r.classi + ' classi, ' + r.elementi + ' elementi.', false);
                  return reloadAll();
                });
              }).catch(function (e) { say(App.cleanError(e), true); });
            })
          ]),
          h('label', { class: 'field' }, [
            h('span', { text: 'Programma per «Apri in VS Code» (comando)' }),
            editorInput
          ]),
          h('div', { class: 'btn-row' }, [
            small('Salva comando', function () {
              Promise.resolve(window.api.setEditor(editorInput.value))
                .then(function (r) {
                  App.config = r;
                  editorInput.value = r.editor;
                  say('Comando salvato: ' + r.editor, false);
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
    if (e.key === 'k' || e.key === 'K') {
      e.preventDefault();
      globalSearch();
      return;
    }
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

  document.getElementById('btn-search').addEventListener('click', globalSearch);
  document.getElementById('btn-export-all').addEventListener('click', exportAll);
  document.getElementById('btn-settings').addEventListener('click', openSettings);

  /* ---------- avvio ---------- */

  App.showTab = showTab;
  App.anyDirty = anyDirty;
  App.exportAll = exportAll;
  App.globalSearch = globalSearch;
  App.openSettings = openSettings;
  App.reloadAll = reloadAll;
  App.applyTheme = applyTheme;
  App.currentTheme = currentTheme;

  buildTabs();

  App.ready = Promise.resolve()
    .then(function () { return window.api.getConfig(); })
    .then(function (cfg) { App.config = cfg; })
    .catch(function (e) { App.toast(App.cleanError(e), true); })
    .then(function () { return showTab(App.tabDefs[0].id); });
})();
