/* Schede «Strutture» e «Componenti»: elenco, anteprima, editor HTML/CSS/JS. */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var S = App.S;
  var h = App.h;

  function norm(t) {
    return S.str(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function field(label, input) {
    return h('label', { class: 'field' }, [h('span', { text: label }), input]);
  }

  function allSnippet(d) {
    var parts = [];
    if (d.css.trim()) parts.push('<style>\n' + d.css.trim() + '\n</style>');
    if (d.html.trim()) parts.push(d.html.trim());
    if (d.js.trim()) parts.push('<script>\n' + d.js.trim() + '\n</script>');
    return parts.join('\n\n') + '\n';
  }

  /* Tab inserisce due spazi; Esc e poi Tab (o Maiusc+Tab) fa uscire dal campo. */
  function codeKeys(ta) {
    var escaped = false;
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        escaped = true;
        return;
      }
      if (e.key !== 'Tab' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
        escaped = false;
        return;
      }
      if (escaped) {
        escaped = false;
        return;
      }
      e.preventDefault();
      var ok = false;
      try {
        ok = document.execCommand('insertText', false, '  ');
      } catch (x) {
        ok = false;
      }
      if (!ok) {
        ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  function createItemTab(kind, cfg) {
    var hasJs = !!cfg.hasJs;
    var st = {
      items: [],
      filter: '',
      id: null,
      draft: null,
      saved: null,
      snapshot: '',
      active: 'html',
      withGlobal: true,
      global: null,
      onlyFav: false
    };

    var root = h('section', {
      class: 'tab-body items no-selection',
      role: 'tabpanel',
      id: 'panel-' + kind,
      'aria-label': cfg.label,
      hidden: true
    });

    /* ----- colonna elenco ----- */
    var search = h('input', { type: 'search', placeholder: 'Cerca…', 'aria-label': 'Cerca in ' + cfg.label });
    var addBtn = h('button', { type: 'button', class: 'btn primary', text: '+ Nuovo' });
    var listEl = h('ul', { class: 'list' });
    var importBtn = h('button', { type: 'button', class: 'btn small import-btn', text: 'Importa…' });
    var favChk = h('input', { type: 'checkbox' });
    root.appendChild(
      h('div', { class: 'col-list' }, [h('div', { class: 'list-head' }, [search, addBtn]), h('div', { class: 'btn-row' }, [importBtn, h('label', { class: 'fav-filter' }, [favChk, '★ Solo preferiti'])]), listEl])
    );

    /* ----- colonna anteprima ----- */
    var globalChk = h('input', { type: 'checkbox', checked: true });
    var preview = App.makePreview({
      title: 'Anteprima di ' + cfg.label,
      getDoc: previewDoc,
      extra: [h('label', null, [globalChk, 'Usa root e classi'])]
    });
    root.appendChild(h('div', { class: 'col-main' }, [preview.el]));

    /* ----- colonna editor ----- */
    var status = h('span', { class: 'status', role: 'status' });
    var saveBtn = h('button', { type: 'button', class: 'btn primary', text: 'Salva' });
    var revertBtn = h('button', { type: 'button', class: 'btn', text: 'Ripristina' });
    var starBtn = h('button', { type: 'button', class: 'btn star-btn', 'aria-pressed': 'false', text: '☆ Preferito' });
    var fNome = h('input', { type: 'text' });
    var fDesc = h('input', { type: 'text' });
    var fTags = h('input', { type: 'text', placeholder: 'flex, card, griglia' });
    var code = h('textarea', { class: 'code', spellcheck: 'false', wrap: 'off' });
    var codeButtons = {};
    var codeTabs = h('div', { class: 'code-tabs', role: 'group', 'aria-label': 'Quale codice modificare' });
    (hasJs ? ['html', 'css', 'js'] : ['html', 'css']).forEach(function (which) {
      codeButtons[which] = h('button', {
        type: 'button',
        class: 'btn small',
        'aria-pressed': 'false',
        text: which.toUpperCase(),
        onclick: function () {
          setActive(which);
          code.focus();
        }
      });
      codeTabs.appendChild(codeButtons[which]);
    });
    codeKeys(code);

    function copyBtn(label, what) {
      return h('button', {
        type: 'button',
        class: 'btn small',
        text: label,
        onclick: function () {
          if (!st.draft) return;
          App.copyText(what === 'all' ? allSnippet(st.draft) : st.draft[what], what === 'all' ? 'Tutto' : what.toUpperCase());
        }
      });
    }

    var qualitySummary = h('summary', { text: 'Controllo qualità' });
    var qualityList = h('ul', { class: 'quality' });
    var manualList = h('ul', { class: 'quality manual' });
    [
      'Provato a 375, 768 e 1280 px',
      'Si usa solo da tastiera (Tab, Invio, Esc)',
      'Provato con lo zoom al 200%'
    ].forEach(function (t) {
      manualList.appendChild(h('li', null, [h('label', null, [h('input', { type: 'checkbox' }), t])]));
    });
    var qualityBox = h('details', { class: 'quality-box' }, [
      qualitySummary,
      qualityList,
      h('p', { class: 'hint', text: 'Da spuntare a mano (non si ricordano tra una sessione e l\'altra):' }),
      manualList
    ]);

    function updateQuality() {
      qualityList.textContent = '';
      if (!st.draft) return;
      var res = S.qualityCheck({ html: st.draft.html, css: st.draft.css, js: st.draft.js });
      var bad = res.filter(function (r) { return r.stato !== 'ok'; });
      qualitySummary.textContent = 'Controllo qualità · ' + (bad.length ? bad.length + ' da vedere' : 'tutto a posto');
      qualitySummary.className = bad.some(function (r) { return r.stato === 'errore'; }) ? 'q-ko' : bad.length ? 'q-warn' : 'q-ok';
      res.forEach(function (r) {
        qualityList.appendChild(
          h('li', { class: 'q-' + r.stato }, [
            h('span', { class: 'q-dot', 'aria-hidden': 'true', text: r.stato === 'ok' ? '●' : r.stato === 'avviso' ? '▲' : '■' }),
            h('span', { class: 'sr-only', text: r.stato + ': ' }),
            h('strong', { text: r.titolo }),
            r.dettaglio ? h('small', { text: ' ' + r.dettaglio }) : null
          ])
        );
      });
    }

    var copyRow = h('div', { class: 'btn-row' }, [copyBtn('Copia HTML', 'html'), copyBtn('Copia CSS', 'css')]);
    if (hasJs) copyRow.appendChild(copyBtn('Copia JS', 'js'));
    copyRow.appendChild(copyBtn('Copia tutto', 'all'));

    var dupBtn = h('button', { type: 'button', class: 'btn', text: 'Duplica' });
    var expBtn = h('button', { type: 'button', class: 'btn', text: 'Esporta cartella' });
    var pngBtn = h('button', { type: 'button', class: 'btn', text: 'Esporta PNG', title: 'Tre immagini a 375, 768 e 1280 px' });
    var verBtn = h('button', { type: 'button', class: 'btn', text: 'Versioni…', title: 'Torna a una versione salvata prima' });
    var delBtn = h('button', { type: 'button', class: 'btn danger', text: 'Elimina' });

    root.appendChild(
      h('div', { class: 'col-editor' }, [
        h('div', { class: 'toolbar' }, [status, h('span', { class: 'spacer' }), starBtn, revertBtn, saveBtn]),
        field('Nome', fNome),
        field('Descrizione', fDesc),
        field('Etichette (separate da virgola)', fTags),
        codeTabs,
        code,
        h('p', { class: 'hint', text: 'Tab inserisce 2 spazi. Per uscire dal campo: Esc, poi Tab.' }),
        qualityBox,
        h('div', { class: 'group-label', text: 'Copia negli appunti' }),
        copyRow,
        h('div', { class: 'group-label', text: 'Altre azioni' }),
        h('div', { class: 'btn-row' }, [dupBtn, expBtn, pngBtn, verBtn, delBtn])
      ])
    );

    /* ----- stato del form ----- */

    function payload() {
      return {
        nome: fNome.value,
        descrizione: fDesc.value,
        tag: fTags.value,
        html: st.draft.html,
        css: st.draft.css,
        js: hasJs ? st.draft.js : '',
        preferito: !!st.draft.pref
      };
    }

    function isDirty() {
      return !!st.draft && JSON.stringify(payload()) !== st.snapshot;
    }

    function updateStatus() {
      var dirty = isDirty();
      status.textContent = dirty ? '● Modifiche non salvate' : 'Tutto salvato';
      status.className = 'status' + (dirty ? ' dirty' : '');
    }

    function setActive(which) {
      st.active = which;
      Object.keys(codeButtons).forEach(function (k) {
        codeButtons[k].setAttribute('aria-pressed', String(k === which));
      });
      code.setAttribute('aria-label', 'Codice ' + which.toUpperCase());
      code.value = st.draft ? st.draft[which] : '';
    }

    function previewDoc() {
      var g = st.withGlobal && st.global ? st.global : {};
      return S.buildPreviewDoc({
        html: st.draft.html,
        css: st.draft.css,
        js: hasJs ? st.draft.js : '',
        rootCss: g.rootCss,
        classiCss: g.classiCss
      });
    }

    var refreshSoon = App.debounce(function () {
      if (st.draft) preview.refresh();
    }, 250);

    function syncStar() {
      var on = !!(st.draft && st.draft.pref);
      starBtn.setAttribute('aria-pressed', String(on));
      starBtn.textContent = on ? '★ Preferito' : '☆ Preferito';
    }

    function load(o) {
      st.id = o.id;
      st.saved = o;
      st.draft = { html: o.html, css: o.css, js: o.js, pref: !!o.preferito };
      syncStar();
      fNome.value = o.nome;
      fDesc.value = o.descrizione;
      fTags.value = (o.tag || []).join(', ');
      setActive(hasJs || st.active !== 'js' ? st.active : 'html');
      st.snapshot = JSON.stringify(payload());
      root.classList.remove('no-selection');
      updateStatus();
      updateQuality();
      renderList();
      refreshSoon.cancel();
      preview.refresh();
    }

    function onEdit(affectsPreview) {
      updateStatus();
      updateQuality();
      if (affectsPreview) refreshSoon();
    }

    /* ----- elenco ----- */

    function renderList() {
      var q = norm(st.filter);
      var shown = st.items.filter(function (it) {
        if (st.onlyFav && !it.preferito) return false;
        return !q || norm(it.nome + ' ' + it.descrizione + ' ' + it.tag.join(' ')).indexOf(q) !== -1;
      });
      shown.sort(function (a, b) {
        return (b.preferito ? 1 : 0) - (a.preferito ? 1 : 0);
      });
      listEl.textContent = '';
      if (!shown.length) {
        listEl.appendChild(
          h('li', { class: 'empty', text: st.items.length ? 'Nessun risultato.' : 'Ancora vuoto. Premi «+ Nuovo».' })
        );
        return;
      }
      shown.forEach(function (it) {
        listEl.appendChild(
          h('li', null, [
            h(
              'button',
              {
                type: 'button',
                class: 'list-btn',
                'aria-current': it.id === st.id ? 'true' : null,
                onclick: function () {
                  select(it.id);
                }
              },
              [(it.preferito ? '★ ' : '') + it.nome, it.descrizione ? h('small', { text: it.descrizione }) : null]
            )
          ])
        );
      });
    }

    function refreshList() {
      return App.run(function () {
        return window.api.list(kind);
      }).then(function (items) {
        if (items) {
          st.items = items;
          renderList();
        }
      });
    }

    function loadFromDisk(id) {
      return App.run(function () {
        return window.api.get(kind, id);
      }).then(function (o) {
        if (o) load(o);
        return !!o;
      });
    }

    function select(id) {
      if (id === st.id) return Promise.resolve();
      return App.guardDirty(tab).then(function (ok) {
        if (ok) return loadFromDisk(id);
      });
    }

    /* ----- azioni ----- */

    function create() {
      return App.guardDirty(tab)
        .then(function (ok) {
          if (!ok) return null;
          return App.askForm({
            title: 'Nuovo elemento in «' + cfg.label + '»',
            fields: [{ name: 'nome', label: 'Nome', value: '' }],
            okLabel: 'Crea',
            validate: function (v) {
              return v.nome.trim() ? null : 'Scrivi un nome';
            }
          });
        })
        .then(function (v) {
          if (!v) return;
          return App.run(function () {
            return window.api.save(kind, null, { nome: v.nome, descrizione: '', tag: [], html: '', css: '', js: '' });
          }).then(function (o) {
            if (!o) return;
            st.filter = '';
            search.value = '';
            return refreshList().then(function () {
              load(o);
              App.toast('Creato «' + o.nome + '»');
              code.focus();
            });
          });
        });
    }

    /* Importa: codice incollato (pagina, frammento, blocchi di una chat) o cartella. */
    function createFrom(data) {
      return App.run(function () {
        return window.api.save(kind, null, {
          nome: data.nome,
          descrizione: 'Importato',
          tag: ['importato'],
          html: data.html,
          css: data.css,
          js: hasJs ? data.js : ''
        });
      }).then(function (o) {
        if (!o) return;
        st.filter = '';
        search.value = '';
        return refreshList().then(function () {
          load(o);
          var extra = (data.avvisi || []).concat(!hasJs && data.js ? ['Questa scheda non ha il JS: l\'ho lasciato fuori.'] : []);
          App.toast('Importato «' + o.nome + '»' + (extra.length ? ' — ' + extra[0] : ''), extra.length > 0);
        });
      });
    }

    function importCode() {
      return App.askForm({
        title: 'Importa codice in «' + cfg.label + '»',
        intro: 'Incolla una pagina intera, un frammento, o i blocchi ``` copiati da una chat (v0, Magic Patterns…). Lo divido in HTML, CSS e JS.',
        fields: [
          { name: 'nome', label: 'Nome', value: '' },
          { name: 'codice', label: 'Codice', type: 'textarea', rows: 10 }
        ],
        okLabel: 'Importa',
        validate: function (v) {
          if (!v.nome.trim()) return 'Scrivi un nome';
          if (!v.codice.trim()) return 'Incolla del codice';
          return null;
        }
      }).then(function (v) {
        if (!v) return;
        var r = S.splitCode(v.codice);
        if (!r.html && !r.css && !r.js) {
          App.toast('Non ho trovato né HTML, né CSS, né JS', true);
          return;
        }
        r.nome = v.nome;
        return createFrom(r);
      });
    }

    function importDir() {
      return App.run(function () {
        return window.api.importFolder();
      }).then(function (r) {
        if (!r || r.annullato) return;
        return createFrom(r);
      });
    }

    function importAny() {
      return App.guardDirty(tab)
        .then(function (ok) {
          if (!ok) return null;
          return App.askChoice({
            title: 'Importa in «' + cfg.label + '»',
            message: 'Da dove prendo il codice?',
            choices: [
              { value: 'cancel', label: 'Annulla' },
              { value: 'dir', label: 'Da una cartella' },
              { value: 'code', label: 'Da codice incollato', kind: 'primary' }
            ]
          });
        })
        .then(function (v) {
          if (v === 'code') return importCode();
          if (v === 'dir') return importDir();
        });
    }

    function save() {
      if (!st.draft) return Promise.resolve(true);
      return App.run(function () {
        return window.api.save(kind, st.id, payload());
      }).then(function (o) {
        if (!o) return false;
        load(o);
        return refreshList().then(function () {
          App.toast('Salvato');
          return true;
        });
      });
    }

    function discard() {
      if (st.saved) load(st.saved);
    }

    function revert() {
      if (!isDirty()) {
        App.toast('Non ci sono modifiche da annullare');
        return;
      }
      App.askConfirm({
        title: 'Annullare le modifiche?',
        message: 'Torno all\'ultima versione salvata di «' + st.saved.nome + '».',
        okLabel: 'Annulla le modifiche',
        danger: true
      }).then(function (yes) {
        if (yes) discard();
      });
    }

    function duplicate() {
      if (!st.id) return;
      App.guardDirty(tab).then(function (ok) {
        if (!ok) return;
        return App.run(function () {
          return window.api.duplicate(kind, st.id);
        }).then(function (o) {
          if (!o) return;
          return refreshList().then(function () {
            load(o);
            App.toast('Creato «' + o.nome + '»');
          });
        });
      });
    }

    function remove() {
      if (!st.id) return;
      App.askConfirm({
        title: 'Eliminare «' + st.saved.nome + '»?',
        message: 'La cartella viene spostata in «_cestino», dentro la cartella dei dati. Puoi recuperarla a mano.',
        okLabel: 'Sposta nel cestino',
        danger: true
      }).then(function (yes) {
        if (!yes) return;
        return App.run(function () {
          return window.api.remove(kind, st.id);
        }).then(function (r) {
          if (!r) return;
          st.id = null;
          st.draft = null;
          st.saved = null;
          st.snapshot = '';
          root.classList.add('no-selection');
          App.toast('Spostato nel cestino');
          return refreshList();
        });
      });
    }

    function exportFolder() {
      if (!st.draft) return;
      App.run(function () {
        return window.api.exportItem(kind, payload());
      }).then(function (r) {
        if (r && !r.annullato) App.toast('Esportato in: ' + r.cartella);
      });
    }

    /* ----- collegamenti ----- */

    addBtn.addEventListener('click', create);
    importBtn.addEventListener('click', importAny);
    pngBtn.addEventListener('click', function () {
      if (!st.draft) return;
      App.run(function () { return window.api.exportPng(kind, payload()); }).then(function (r) {
        if (r && !r.annullato) App.toast('Salvate ' + r.files.length + ' immagini in: ' + r.cartella);
      });
    });
    verBtn.addEventListener('click', function () {
      if (!st.draft || !st.id) return;
      App.run(function () { return window.api.listVersions(kind, st.id); }).then(function (list) {
        if (!list) return;
        if (!list.length) {
          App.toast('Non ci sono ancora versioni precedenti: se ne crea una a ogni salvataggio che cambia qualcosa');
          return;
        }
        return App.modal(function (d, finish) {
          d.appendChild(
            h('div', { class: 'modal-form' }, [
              h('h2', { text: 'Versioni precedenti' }),
              h('p', { class: 'muted', text: 'Scegline una: va nell\'editor, ma non è salvata finché non premi Salva.' }),
              h('ul', { class: 'list global-results' }, list.map(function (v) {
                return h('li', null, [
                  h('button', { type: 'button', class: 'list-btn', onclick: function () { finish(v.ver); } },
                    [v.nome || '(senza nome)', h('small', { text: 'Salvata il ' + (v.salvato ? v.salvato.replace('T', ' ').slice(0, 16) : v.ver) })])
                ]);
              })),
              h('div', { class: 'modal-actions' }, [
                h('button', { type: 'button', class: 'btn', text: 'Chiudi', onclick: function () { finish(null); } })
              ])
            ])
          );
        }).then(function (ver) {
          if (!ver) return;
          return App.run(function () { return window.api.getVersion(kind, st.id, ver); }).then(function (o) {
            if (!o) return;
            st.draft.html = o.html;
            st.draft.css = o.css;
            st.draft.js = o.js;
            fNome.value = o.nome;
            fDesc.value = o.descrizione;
            fTags.value = (o.tag || []).join(', ');
            setActive(st.active);
            updateStatus();
            updateQuality();
            refreshSoon.cancel();
            preview.refresh();
            App.toast('Versione caricata nell\'editor: premi Salva per tenerla');
          });
        });
      });
    });
    favChk.addEventListener('change', function () {
      st.onlyFav = favChk.checked;
      renderList();
    });
    starBtn.addEventListener('click', function () {
      if (!st.draft) return;
      st.draft.pref = !st.draft.pref;
      syncStar();
      updateStatus();
    });
    saveBtn.addEventListener('click', save);
    revertBtn.addEventListener('click', revert);
    dupBtn.addEventListener('click', duplicate);
    delBtn.addEventListener('click', remove);
    expBtn.addEventListener('click', exportFolder);
    search.addEventListener('input', function () {
      st.filter = search.value;
      renderList();
    });
    [fNome, fDesc, fTags].forEach(function (el) {
      el.addEventListener('input', function () {
        onEdit(false);
      });
    });
    code.addEventListener('input', function () {
      if (!st.draft) return;
      st.draft[st.active] = code.value;
      onEdit(true);
    });
    globalChk.addEventListener('change', function () {
      st.withGlobal = globalChk.checked;
      if (st.draft) preview.refresh();
    });

    /* ----- interfaccia della scheda ----- */

    function show() {
      return Promise.all([
        refreshList(),
        App.run(function () {
          return App.getGlobal();
        })
      ]).then(function (r) {
        st.global = r[1] || null;
        if (st.draft) {
          preview.refresh();
          return;
        }
        if (st.items.length) return loadFromDisk(st.items[0].id);
      });
    }

    /* Dopo il cambio di cartella dei dati: toglie tutto ciò che è caricato. */
    function reset() {
      st.id = null;
      st.draft = null;
      st.saved = null;
      st.snapshot = '';
      st.items = [];
      root.classList.add('no-selection');
      renderList();
    }

    var tab = {
      el: root,
      show: show,
      isDirty: isDirty,
      save: save,
      discard: discard,
      reset: reset,
      select: select,
      kind: kind,
      state: st
    };
    return tab;
  }

  App.defineTab({
    id: 'strutture',
    label: 'Strutture',
    create: function () {
      return createItemTab('strutture', { label: 'Strutture', hasJs: false });
    }
  });

  App.defineTab({
    id: 'componenti',
    label: 'Componenti',
    create: function () {
      return createItemTab('componenti', { label: 'Componenti', hasJs: true });
    }
  });

  App.defineTab({
    id: 'animazioni',
    label: 'Animazioni',
    create: function () {
      return createItemTab('animazioni', { label: 'Animazioni', hasJs: true });
    }
  });

  App.defineTab({
    id: 'interazioni',
    label: 'Interazioni',
    create: function () {
      return createItemTab('interazioni', { label: 'Interazioni', hasJs: true });
    }
  });
})();
