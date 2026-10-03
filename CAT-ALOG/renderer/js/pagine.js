/* Scheda «Pagine»: si assembla una pagina mettendo in fila strutture e componenti, e si esporta (anche un sito intero). */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var S = App.S;
  var h = App.h;

  var KINDS = [
    { id: 'strutture', label: 'Strutture' },
    { id: 'componenti', label: 'Componenti' },
    { id: 'animazioni', label: 'Animazioni' },
    { id: 'interazioni', label: 'Interazioni' }
  ];

  function norm(t) {
    return S.str(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function kindLabel(id) {
    return (KINDS.filter(function (k) { return k.id === id; })[0] || { label: id }).label;
  }

  App.defineTab({
    id: 'pagine',
    label: 'Pagine',
    create: function () {
      var st = { pages: [], id: null, draft: null, snapshot: '', saved: null, names: {}, doc: '', avvisi: [], seq: 0 };

      var root = h('section', {
        class: 'tab-body items no-selection pagine',
        role: 'tabpanel',
        id: 'panel-pagine',
        'aria-label': 'Pagine',
        hidden: true
      });

      /* ----- elenco ----- */
      var addBtn = h('button', { type: 'button', class: 'btn primary', text: '+ Nuova' });
      var listEl = h('ul', { class: 'list' });
      var kitBtn = h('button', { type: 'button', class: 'btn', text: 'Esporta il sito (kit)…', title: 'Tutte le pagine in una cartella, con css, js, asset e token' });
      root.appendChild(
        h('div', { class: 'col-list' }, [
          h('div', { class: 'list-head' }, [h('span', { class: 'spacer' }), addBtn]),
          listEl,
          h('div', { class: 'btn-row' }, [kitBtn])
        ])
      );

      /* ----- anteprima ----- */
      var preview = App.makePreview({ title: 'Anteprima della pagina', getDoc: function () { return st.doc || '<!doctype html><p style="font:14px sans-serif;padding:1rem">Aggiungi una sezione per vedere la pagina.</p>'; }, advanced: true });
      root.appendChild(h('div', { class: 'col-main' }, [preview.el]));

      /* ----- editor ----- */
      var status = h('span', { class: 'status', role: 'status' });
      var saveBtn = h('button', { type: 'button', class: 'btn primary', text: 'Salva' });
      var revertBtn = h('button', { type: 'button', class: 'btn', text: 'Ripristina' });
      var fNome = h('input', { type: 'text' });
      var fTitolo = h('input', { type: 'text', placeholder: 'Titolo mostrato nella scheda del browser' });
      var fDesc = h('input', { type: 'text' });
      var fLingua = h('input', { type: 'text', placeholder: 'it' });
      function chk(label) {
        var input = h('input', { type: 'checkbox' });
        return { input: input, el: h('label', { class: 'field inline' }, [input, h('span', { text: label })]) };
      }
      var cRoot = chk('Collega root.css (colori e variabili)');
      var cClassi = chk('Collega le classi (cat-classi.css)');
      var cResp = chk('Collega responsive.css');
      var cSeo = chk('Aggiungi i meta social di «Head e SEO»');
      var secList = h('ol', { class: 'sec-list' });
      var addSecBtn = h('button', { type: 'button', class: 'btn small primary', text: '+ Aggiungi sezione…' });
      var warnEl = h('ul', { class: 'quality' });
      var dupBtn = h('button', { type: 'button', class: 'btn', text: 'Duplica' });
      var expBtn = h('button', { type: 'button', class: 'btn', text: 'Esporta cartella' });
      var copyBtn = h('button', { type: 'button', class: 'btn', text: 'Copia HTML' });
      var delBtn = h('button', { type: 'button', class: 'btn danger', text: 'Elimina' });

      root.appendChild(
        h('div', { class: 'col-editor' }, [
          h('div', { class: 'toolbar' }, [status, h('span', { class: 'spacer' }), revertBtn, saveBtn]),
          h('label', { class: 'field' }, [h('span', { text: 'Nome (nell\'app)' }), fNome]),
          h('label', { class: 'field' }, [h('span', { text: 'Titolo della pagina (<title>)' }), fTitolo]),
          h('label', { class: 'field' }, [h('span', { text: 'Descrizione' }), fDesc]),
          h('label', { class: 'field' }, [h('span', { text: 'Lingua' }), fLingua]),
          cRoot.el, cClassi.el, cResp.el, cSeo.el,
          h('div', { class: 'group-label', text: 'Sezioni, dall\'alto verso il basso' }),
          secList,
          h('div', { class: 'btn-row' }, [addSecBtn]),
          h('div', { class: 'group-label', text: 'Controlli' }),
          warnEl,
          h('div', { class: 'group-label', text: 'Azioni' }),
          h('div', { class: 'btn-row' }, [copyBtn, expBtn, dupBtn, delBtn])
        ])
      );

      /* ----- stato ----- */

      function payload() {
        return {
          nome: fNome.value,
          titolo: fTitolo.value,
          descrizione: fDesc.value,
          lingua: fLingua.value,
          includi: { root: cRoot.input.checked, classi: cClassi.input.checked, responsive: cResp.input.checked },
          usaSeo: cSeo.input.checked,
          sezioni: st.draft ? st.draft.sezioni.slice() : []
        };
      }

      function isDirty() {
        return !!st.draft && JSON.stringify(payload()) !== st.snapshot;
      }

      function updateStatus() {
        var d = isDirty();
        status.textContent = d ? '● Modifiche non salvate' : 'Tutto salvato';
        status.className = 'status' + (d ? ' dirty' : '');
      }

      function nameOf(z) {
        return st.names[z.kind + '/' + z.id] || null;
      }

      function renderSections() {
        secList.textContent = '';
        var list = st.draft ? st.draft.sezioni : [];
        if (!list.length) {
          secList.appendChild(h('li', { class: 'empty', text: 'Nessuna sezione. Premi «+ Aggiungi sezione».' }));
          return;
        }
        list.forEach(function (z, i) {
          var nm = nameOf(z);
          secList.appendChild(
            h('li', { class: 'sec-row' }, [
              h('span', { class: 'sec-name' }, [
                h('b', { text: nm || z.id }),
                h('small', { text: ' ' + kindLabel(z.kind) + (nm ? '' : ' · non trovata') })
              ]),
              h('button', { type: 'button', class: 'btn small', 'aria-label': 'Sposta su', disabled: i === 0, text: '↑', onclick: function () { move(i, -1); } }),
              h('button', { type: 'button', class: 'btn small', 'aria-label': 'Sposta giù', disabled: i === list.length - 1, text: '↓', onclick: function () { move(i, 1); } }),
              h('button', { type: 'button', class: 'btn small danger', 'aria-label': 'Togli la sezione', text: '✕', onclick: function () { list.splice(i, 1); changed(); } })
            ])
          );
        });
      }

      function renderWarnings() {
        warnEl.textContent = '';
        if (!st.draft) return;
        if (!st.avvisi.length) {
          warnEl.appendChild(h('li', { class: 'q-ok' }, [h('span', { class: 'q-dot', 'aria-hidden': 'true', text: '●' }), h('strong', { text: 'Nessun problema trovato' })]));
          return;
        }
        st.avvisi.forEach(function (a) {
          warnEl.appendChild(h('li', { class: 'q-' + a.stato }, [
            h('span', { class: 'q-dot', 'aria-hidden': 'true', text: a.stato === 'errore' ? '■' : '▲' }),
            h('span', { class: 'sr-only', text: a.stato + ': ' }),
            h('span', { text: a.testo })
          ]));
        });
      }

      function renderList() {
        listEl.textContent = '';
        if (!st.pages.length) {
          listEl.appendChild(h('li', { class: 'empty', text: 'Ancora nessuna pagina. Premi «+ Nuova».' }));
          return;
        }
        st.pages.forEach(function (pg) {
          listEl.appendChild(
            h('li', null, [
              h('button', {
                type: 'button',
                class: 'list-btn',
                'aria-current': pg.id === st.id ? 'true' : null,
                onclick: function () { select(pg.id); }
              }, [pg.nome, h('small', { text: pg.sezioni + (pg.sezioni === 1 ? ' sezione' : ' sezioni') })])
            ])
          );
        });
      }

      var refreshSoon = App.debounce(function () { refreshPreview(); }, 300);

      function refreshPreview() {
        if (!st.draft) return Promise.resolve();
        var mine = ++st.seq;
        return Promise.resolve(window.api.previewPage(payload())).then(function (r) {
          if (mine !== st.seq) return;
          st.doc = r.doc;
          var out = r.avvisi.map(function (t) { return { stato: 'avviso', testo: t }; });
          try {
            var body = new DOMParser().parseFromString(r.doc, 'text/html').body;
            body.querySelectorAll('script, style').forEach(function (n) { n.remove(); });
            S.qualityCheck({ html: body.innerHTML, css: '' }).forEach(function (c) {
              if (c.stato !== 'ok') out.push({ stato: c.stato, testo: c.titolo + ': ' + c.dettaglio });
            });
          } catch (e) { /* controlli non disponibili */ }
          st.avvisi = out;
          renderWarnings();
          preview.refresh();
        }).catch(function (e) {
          App.toast(App.cleanError(e), true);
        });
      }

      function changed() {
        updateStatus();
        renderSections();
        refreshSoon();
      }

      function move(i, d) {
        var l = st.draft.sezioni;
        var t = l[i];
        l[i] = l[i + d];
        l[i + d] = t;
        changed();
      }

      function load(o) {
        st.id = o.id;
        st.saved = o;
        st.draft = { sezioni: o.sezioni.map(function (z) { return { kind: z.kind, id: z.id }; }) };
        fNome.value = o.nome;
        fTitolo.value = o.titolo;
        fDesc.value = o.descrizione;
        fLingua.value = o.lingua;
        cRoot.input.checked = o.includi.root;
        cClassi.input.checked = o.includi.classi;
        cResp.input.checked = o.includi.responsive;
        cSeo.input.checked = o.usaSeo;
        st.snapshot = JSON.stringify(payload());
        root.classList.remove('no-selection');
        updateStatus();
        renderList();
        renderSections();
        refreshSoon.cancel();
        refreshPreview();
      }

      function loadNames() {
        return Promise.all(KINDS.map(function (k) {
          return Promise.resolve(window.api.list(k.id)).then(function (items) {
            items.forEach(function (it) { st.names[k.id + '/' + it.id] = it.nome; });
            return items.map(function (it) { return { kind: k.id, id: it.id, nome: it.nome, descrizione: it.descrizione, tag: it.tag }; });
          });
        })).then(function (parts) {
          st.all = [].concat.apply([], parts);
        });
      }

      function refreshList() {
        return App.run(function () { return window.api.listPages(); }).then(function (l) {
          if (l) { st.pages = l; renderList(); }
        });
      }

      function select(id) {
        if (id === st.id) return Promise.resolve();
        return App.guardDirty(tab).then(function (ok) {
          if (!ok) return;
          return App.run(function () { return window.api.getPage(id); }).then(function (o) { if (o) load(o); });
        });
      }

      /* ----- azioni ----- */

      function create() {
        return App.guardDirty(tab).then(function (ok) {
          if (!ok) return null;
          return App.askForm({
            title: 'Nuova pagina',
            fields: [{ name: 'nome', label: 'Nome', value: '' }],
            okLabel: 'Crea',
            validate: function (v) { return v.nome.trim() ? null : 'Scrivi un nome'; }
          });
        }).then(function (v) {
          if (!v) return;
          return App.run(function () { return window.api.savePage(null, { nome: v.nome, titolo: v.nome, sezioni: [] }); }).then(function (o) {
            if (!o) return;
            return refreshList().then(function () { load(o); App.toast('Creata «' + o.nome + '»'); });
          });
        });
      }

      function save() {
        if (!st.draft) return Promise.resolve(true);
        return App.run(function () { return window.api.savePage(st.id, payload()); }).then(function (o) {
          if (!o) return false;
          load(o);
          return refreshList().then(function () { App.toast('Salvato'); return true; });
        });
      }

      function addSection() {
        return loadNames().then(function () {
          return App.modal(function (d, finish) {
            var kindSel = h('select', { 'aria-label': 'Tipo' }, [h('option', { value: 'tutti', text: 'Tutti i tipi' })].concat(KINDS.map(function (k) { return h('option', { value: k.id, text: k.label }); })));
            var search = h('input', { type: 'search', placeholder: 'Cerca…', 'aria-label': 'Cerca una sezione' });
            var list = h('ul', { class: 'list global-results' });
            function render() {
              var q = norm(search.value);
              var hits = st.all.filter(function (x) {
                return (kindSel.value === 'tutti' || x.kind === kindSel.value) && (!q || norm(x.nome + ' ' + x.descrizione + ' ' + x.tag.join(' ')).indexOf(q) !== -1);
              });
              list.textContent = '';
              if (!hits.length) list.appendChild(h('li', { class: 'empty', text: 'Nessun risultato.' }));
              hits.slice(0, 60).forEach(function (x) {
                list.appendChild(h('li', null, [
                  h('button', { type: 'button', class: 'list-btn', onclick: function () { finish(x); } },
                    [x.nome, h('small', { text: kindLabel(x.kind) + (x.descrizione ? ' · ' + x.descrizione : '') })])
                ]));
              });
            }
            kindSel.addEventListener('change', render);
            search.addEventListener('input', render);
            d.appendChild(h('div', { class: 'modal-form' }, [
              h('h2', { text: 'Aggiungi una sezione' }),
              h('div', { class: 'list-head' }, [search, kindSel]),
              list,
              h('div', { class: 'modal-actions' }, [h('button', { type: 'button', class: 'btn', text: 'Chiudi', onclick: function () { finish(null); } })])
            ]));
            render();
            setTimeout(function () { search.focus(); }, 0);
          });
        }).then(function (x) {
          if (!x) return;
          st.draft.sezioni.push({ kind: x.kind, id: x.id });
          st.names[x.kind + '/' + x.id] = x.nome;
          changed();
        });
      }

      function exportOne() {
        if (!st.draft) return;
        App.run(function () { return window.api.exportPage(payload()); }).then(function (r) {
          if (r && !r.annullato) App.toast('Esportata in: ' + r.cartella);
        });
      }

      function exportKit() {
        var kit = null;
        return Promise.all([
          App.run(function () { return window.api.getKit(); }),
          App.run(function () { return window.api.listPages(); })
        ]).then(function (r) {
          kit = r[0];
          var pages = r[1];
          if (!kit || !pages) return;
          if (!pages.length) { App.toast('Crea almeno una pagina', true); return; }
          return App.modal(function (d, finish) {
            var nome = h('input', { type: 'text', value: kit.nome, 'aria-label': 'Nome del sito' });
            var checks = pages.map(function (pg) {
              var input = h('input', { type: 'checkbox' });
              input.checked = !kit.pagine.length || kit.pagine.indexOf(pg.id) !== -1;
              return { id: pg.id, input: input, el: h('label', { class: 'field inline' }, [input, h('span', { text: pg.nome })]) };
            });
            var asset = h('select', { 'aria-label': 'Asset' }, [
              h('option', { value: 'usati', text: 'Solo gli asset usati dalle pagine' }),
              h('option', { value: 'tutti', text: 'Tutti gli asset' }),
              h('option', { value: 'nessuno', text: 'Nessun asset' })
            ]);
            asset.value = kit.asset;
            var seo = h('input', { type: 'checkbox' });
            seo.checked = kit.seo;
            var tok = h('input', { type: 'checkbox' });
            tok.checked = kit.tokens;
            var err = h('p', { class: 'form-error', role: 'alert' });
            d.appendChild(h('div', { class: 'modal-form' }, [
              h('h2', { text: 'Esporta il sito' }),
              h('p', { class: 'muted', text: 'La prima pagina diventa index.html. Le altre si chiamano come la pagina. Dentro: css/, js/, assets/, tokens/ per Figma, seo/ e un file LEGGIMI.' }),
              h('label', { class: 'field' }, [h('span', { text: 'Nome del sito (nome della cartella)' }), nome]),
              h('div', { class: 'group-label', text: 'Pagine' })
            ].concat(checks.map(function (c) { return c.el; }), [
              h('label', { class: 'field' }, [h('span', { text: 'Asset' }), asset]),
              h('label', { class: 'field inline' }, [seo, h('span', { text: 'Includi il blocco <head> di «Head e SEO»' })]),
              h('label', { class: 'field inline' }, [tok, h('span', { text: 'Includi i token per Figma' })]),
              err,
              h('div', { class: 'modal-actions' }, [
                h('button', { type: 'button', class: 'btn', text: 'Annulla', onclick: function () { finish(null); } }),
                h('button', {
                  type: 'button',
                  class: 'btn primary',
                  text: 'Scegli la cartella ed esporta',
                  onclick: function () {
                    var sel = checks.filter(function (c) { return c.input.checked; }).map(function (c) { return c.id; });
                    if (!sel.length) { err.textContent = 'Scegli almeno una pagina'; return; }
                    if (!nome.value.trim()) { err.textContent = 'Scrivi il nome del sito'; return; }
                    finish({ nome: nome.value, pagine: checks.length === sel.length ? [] : sel, asset: asset.value, seo: seo.checked, tokens: tok.checked });
                  }
                })
              ])
            ])));
          });
        }).then(function (opts) {
          if (!opts) return;
          return App.run(function () { return window.api.saveKit(opts); }).then(function () {
            return App.run(function () { return window.api.exportKit(opts); });
          }).then(function (r) {
            if (r && !r.annullato) App.toast('Sito esportato in: ' + r.cartella + ' (' + r.pagine + ' pagine, ' + r.asset + ' asset)' + (r.avvisi.length ? ' · ' + r.avvisi.length + ' avvisi' : ''));
          });
        });
      }

      function discard() {
        if (st.saved) load(st.saved);
      }

      function revert() {
        if (!isDirty()) { App.toast('Non ci sono modifiche da annullare'); return; }
        App.askConfirm({ title: 'Annullare le modifiche?', message: 'Torni all\'ultima versione salvata.', okLabel: 'Annulla le modifiche', danger: true }).then(function (yes) {
          if (yes) discard();
        });
      }

      function duplicate() {
        if (!st.id) return;
        App.guardDirty(tab).then(function (ok) {
          if (!ok) return;
          return App.run(function () { return window.api.duplicatePage(st.id); }).then(function (o) {
            if (!o) return;
            return refreshList().then(function () { load(o); App.toast('Creata «' + o.nome + '»'); });
          });
        });
      }

      function remove() {
        if (!st.id) return;
        App.askConfirm({ title: 'Eliminare «' + st.saved.nome + '»?', message: 'Va nel cestino. Le sezioni (strutture e componenti) restano dove sono.', okLabel: 'Elimina', danger: true }).then(function (yes) {
          if (!yes) return;
          return App.run(function () { return window.api.removePage(st.id); }).then(function (r) {
            if (!r) return;
            st.id = null; st.draft = null; st.saved = null; st.snapshot = '';
            root.classList.add('no-selection');
            return refreshList().then(function () { App.toast('Spostata nel cestino'); });
          });
        });
      }

      [fNome, fTitolo, fDesc, fLingua].forEach(function (el) { el.addEventListener('input', function () { updateStatus(); refreshSoon(); }); });
      [cRoot.input, cClassi.input, cResp.input, cSeo.input].forEach(function (el) { el.addEventListener('change', function () { updateStatus(); refreshSoon(); }); });
      addBtn.addEventListener('click', create);
      saveBtn.addEventListener('click', save);
      revertBtn.addEventListener('click', revert);
      addSecBtn.addEventListener('click', addSection);
      expBtn.addEventListener('click', exportOne);
      copyBtn.addEventListener('click', function () {
        if (!st.draft) return;
        App.run(function () { return window.api.previewPage(payload()); }).then(function (r) {
          if (r) App.copyText(r.doc, 'HTML della pagina');
        });
      });
      dupBtn.addEventListener('click', duplicate);
      delBtn.addEventListener('click', remove);
      kitBtn.addEventListener('click', exportKit);

      var tab = {
        el: root,
        show: function () {
          return Promise.all([refreshList(), loadNames()]).then(function () {
            renderSections();
            if (!st.id && st.pages.length) return App.run(function () { return window.api.getPage(st.pages[0].id); }).then(function (o) { if (o) load(o); });
          });
        },
        isDirty: isDirty,
        save: save,
        discard: discard,
        reset: function () { st.id = null; st.draft = null; st.saved = null; st.snapshot = ''; st.pages = []; root.classList.add('no-selection'); renderList(); },
        state: st
      };
      return tab;
    }
  });
})();
