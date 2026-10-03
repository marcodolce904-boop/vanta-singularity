/* Scheda «Classi»: gruppi di classi CSS pronte, modificabili, con prova dal vivo. */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var S = App.S;
  var h = App.h;

  function norm(t) {
    return S.str(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function needName(v) {
    return v.nome.trim() ? null : 'Scrivi un nome';
  }

  function firstLine(css) {
    var lines = S.str(css).split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (!lines.length) return '(regola vuota)';
    return lines.length > 1 ? lines[0] + ' …' : lines[0];
  }

  App.defineTab({
    id: 'classi',
    label: 'Classi',
    create: function () {
      var st = { data: { gruppi: [] }, snapshot: JSON.stringify({ gruppi: [] }), sel: null, search: '', editing: null, global: null };

      var root = h('section', {
        class: 'tab-body classi',
        role: 'tabpanel',
        id: 'panel-classi',
        'aria-label': 'Classi',
        hidden: true
      });

      /* ----- colonna gruppi ----- */
      var search = h('input', { type: 'search', placeholder: 'Cerca una classe…', 'aria-label': 'Cerca una classe' });
      var addGroupBtn = h('button', { type: 'button', class: 'btn primary', text: '+ Gruppo' });
      var groupList = h('ul', { class: 'list' });
      root.appendChild(h('div', { class: 'col-list' }, [h('div', { class: 'list-head' }, [search, addGroupBtn]), groupList]));

      /* ----- colonna classi ----- */
      var title = h('h2', { class: 'group-title' });
      var renameBtn = h('button', { type: 'button', class: 'btn small', text: 'Rinomina gruppo' });
      var delGroupBtn = h('button', { type: 'button', class: 'btn small danger', text: 'Elimina gruppo' });
      var addClassBtn = h('button', { type: 'button', class: 'btn small primary', text: '+ Classe' });
      var rowsEl = h('ul', { class: 'rows' });
      root.appendChild(
        h('div', { class: 'col-main' }, [
          h('div', { class: 'toolbar' }, [title, renameBtn, delGroupBtn, addClassBtn]),
          rowsEl
        ])
      );

      /* ----- colonna salvataggio e prova ----- */
      var status = h('span', { class: 'status', role: 'status' });
      var saveBtn = h('button', { type: 'button', class: 'btn primary', text: 'Salva' });
      var revertBtn = h('button', { type: 'button', class: 'btn', text: 'Ripristina' });
      var exportBtn = h('button', { type: 'button', class: 'btn small', text: 'Esporta file CSS' });
      var copyAllBtn = h('button', { type: 'button', class: 'btn small', text: 'Copia tutto il CSS' });
      var copyGroupBtn = h('button', { type: 'button', class: 'btn small', text: 'Copia questo gruppo' });
      var sandboxText = h('textarea', { rows: 5, spellcheck: 'false', 'aria-label': 'HTML da provare' });
      sandboxText.value = '<div class="cat-container">\n  <p>Scrivi qui il tuo HTML e usa le classi del catalogo.</p>\n</div>';
      var preview = App.makePreview({ title: 'Prova delle classi', getDoc: sandboxDoc });

      root.appendChild(
        h('div', { class: 'col-editor' }, [
          h('div', { class: 'toolbar' }, [status, h('span', { class: 'spacer' }), revertBtn, saveBtn]),
          h('div', { class: 'group-label', text: 'Copia ed esporta' }),
          h('div', { class: 'btn-row' }, [copyGroupBtn, copyAllBtn, exportBtn]),
          h('div', { class: 'group-label', text: 'Prova le classi (usa anche quelle non ancora salvate)' }),
          sandboxText,
          preview.el
        ])
      );

      /* ----- dati ----- */

      function selGroup() {
        return st.data.gruppi.filter(function (g) { return g.id === st.sel; })[0] || null;
      }

      function isDirty() {
        return JSON.stringify(st.data) !== st.snapshot;
      }

      function updateStatus() {
        var dirty = isDirty();
        status.textContent = dirty ? '● Modifiche non salvate' : 'Tutto salvato';
        status.className = 'status' + (dirty ? ' dirty' : '');
      }

      function sandboxDoc() {
        var g = st.global || {};
        return S.buildPreviewDoc({
          html: sandboxText.value,
          rootCss: g.rootCss,
          classiCss: S.buildClassiCss(S.normalizeClassi(st.data))
        });
      }

      var refreshSoon = App.debounce(function () { preview.refresh(); }, 250);

      function touch() {
        updateStatus();
        refreshSoon();
      }

      function setData(data) {
        st.data = data;
        st.snapshot = JSON.stringify(data);
        if (!selGroup()) st.sel = data.gruppi.length ? data.gruppi[0].id : null;
        var found = false;
        data.gruppi.forEach(function (g) {
          g.classi.forEach(function (c) { if (c.id === st.editing) found = true; });
        });
        if (!found) st.editing = null;
        renderAll();
        refreshSoon.cancel();
        preview.refresh();
      }

      /* ----- disegno ----- */

      function renderGroups() {
        groupList.textContent = '';
        if (!st.data.gruppi.length) {
          groupList.appendChild(h('li', { class: 'empty', text: 'Nessun gruppo. Premi «+ Gruppo».' }));
          return;
        }
        st.data.gruppi.forEach(function (g) {
          var n = g.classi.length;
          groupList.appendChild(
            h('li', null, [
              h(
                'button',
                {
                  type: 'button',
                  class: 'list-btn',
                  'aria-current': !st.search.trim() && g.id === st.sel ? 'true' : null,
                  onclick: function () {
                    st.search = '';
                    search.value = '';
                    st.sel = g.id;
                    st.editing = null;
                    renderAll();
                  }
                },
                [g.nome, h('small', { text: n + (n === 1 ? ' classe' : ' classi') })]
              )
            ])
          );
        });
      }

      function viewRow(c, g, showGroup) {
        return h('li', { class: 'row' }, [
          h('button', {
            type: 'button',
            class: 'name',
            title: 'Copia il nome della classe',
            text: c.nome || '(senza nome)',
            onclick: function () { App.copyText(c.nome, 'Nome'); }
          }),
          h('span', { class: 'desc' }, [c.descrizione, showGroup ? h('span', { class: 'group-tag', text: ' · ' + g.nome }) : null]),
          h('span', { class: 'btn-row' }, [
            h('button', {
              type: 'button',
              class: 'btn small',
              text: 'Prova',
              onclick: function () {
                sandboxText.value = '<div class="' + c.nome + '">\n  Prova di ' + c.nome + '\n</div>';
                preview.refresh();
              }
            }),
            h('button', {
              type: 'button',
              class: 'btn small',
              text: 'Copia regola',
              onclick: function () { App.copyText(c.css, 'Regola'); }
            }),
            h('button', {
              type: 'button',
              class: 'btn small',
              text: 'Modifica',
              onclick: function () {
                st.editing = c.id;
                renderAll();
              }
            })
          ]),
          h('code', { class: 'rule', text: firstLine(c.css) })
        ]);
      }

      function editRow(c, g) {
        var n = h('input', { type: 'text', value: c.nome, placeholder: 'cat-esempio', 'aria-label': 'Nome della classe, senza il punto' });
        var d = h('input', { type: 'text', value: c.descrizione, placeholder: 'A cosa serve', 'aria-label': 'Descrizione' });
        var css = h('textarea', { rows: 6, spellcheck: 'false', 'aria-label': 'Regola CSS' });
        css.value = c.css;
        var err = h('small', { class: 'row-error', role: 'alert' });

        function check() {
          err.textContent =
            c.nome.trim() && !S.validaClasseNome(c.nome) ? 'Nome non valido: usa lettere, numeri, - e _ (senza il punto).' : '';
        }

        n.addEventListener('input', function () { c.nome = n.value; check(); touch(); });
        d.addEventListener('input', function () { c.descrizione = d.value; touch(); });
        css.addEventListener('input', function () { c.css = css.value; touch(); });
        check();

        return h('li', { class: 'row editing' }, [
          h('label', { class: 'field' }, [h('span', { text: 'Nome classe' }), n]),
          h('label', { class: 'field' }, [h('span', { text: 'Descrizione' }), d]),
          h('label', { class: 'field' }, [h('span', { text: 'Regola CSS' }), css]),
          err,
          h('div', { class: 'btn-row' }, [
            h('button', {
              type: 'button',
              class: 'btn small primary',
              text: 'Fatto',
              onclick: function () { st.editing = null; renderAll(); }
            }),
            h('button', {
              type: 'button',
              class: 'btn small danger',
              text: 'Togli classe',
              onclick: function () {
                g.classi = g.classi.filter(function (x) { return x.id !== c.id; });
                st.editing = null;
                renderAll();
                touch();
                App.toast('Classe tolta dall\'elenco. Diventa definitivo quando premi Salva.');
              }
            })
          ])
        ]);
      }

      function renderRows() {
        rowsEl.textContent = '';
        var searching = !!st.search.trim();
        var g = selGroup();
        var entries = [];
        if (searching) {
          var q = norm(st.search.trim());
          st.data.gruppi.forEach(function (gr) {
            gr.classi.forEach(function (c) {
              if (norm(c.nome + ' ' + c.descrizione + ' ' + gr.nome).indexOf(q) !== -1) entries.push({ c: c, g: gr });
            });
          });
          title.textContent = 'Risultati per «' + st.search.trim() + '» (' + entries.length + ')';
        } else if (g) {
          entries = g.classi.map(function (c) { return { c: c, g: g }; });
          title.textContent = g.nome;
        } else {
          title.textContent = 'Nessun gruppo';
        }
        [renameBtn, delGroupBtn, addClassBtn, copyGroupBtn].forEach(function (b) { b.disabled = searching || !g; });
        if (!entries.length) {
          rowsEl.appendChild(
            h('li', { class: 'empty', text: searching ? 'Nessuna classe trovata.' : g ? 'Gruppo vuoto. Premi «+ Classe».' : 'Crea un gruppo per iniziare.' })
          );
        }
        entries.forEach(function (en) {
          rowsEl.appendChild(en.c.id === st.editing ? editRow(en.c, en.g) : viewRow(en.c, en.g, searching));
        });
      }

      function renderAll() {
        renderGroups();
        renderRows();
        updateStatus();
      }

      /* ----- azioni sui gruppi e sulle classi ----- */

      function addGroup() {
        App.askForm({
          title: 'Nuovo gruppo di classi',
          fields: [{ name: 'nome', label: 'Nome del gruppo', value: '' }],
          okLabel: 'Crea',
          validate: needName
        }).then(function (v) {
          if (!v) return;
          var g = { id: S.uid('g'), nome: v.nome.trim(), classi: [] };
          st.data.gruppi.push(g);
          st.sel = g.id;
          st.search = '';
          search.value = '';
          st.editing = null;
          renderAll();
          touch();
        });
      }

      function renameGroup() {
        var g = selGroup();
        if (!g) return;
        App.askForm({
          title: 'Rinomina il gruppo',
          fields: [{ name: 'nome', label: 'Nome del gruppo', value: g.nome }],
          okLabel: 'Rinomina',
          validate: needName
        }).then(function (v) {
          if (!v) return;
          g.nome = v.nome.trim();
          renderAll();
          touch();
        });
      }

      function deleteGroup() {
        var g = selGroup();
        if (!g) return;
        App.askConfirm({
          title: 'Eliminare il gruppo «' + g.nome + '»?',
          message: 'Escono dall\'elenco il gruppo e le sue ' + g.classi.length + ' classi. Diventa definitivo quando premi Salva.',
          okLabel: 'Elimina gruppo',
          danger: true
        }).then(function (yes) {
          if (!yes) return;
          st.data.gruppi = st.data.gruppi.filter(function (x) { return x.id !== g.id; });
          st.sel = st.data.gruppi.length ? st.data.gruppi[0].id : null;
          st.editing = null;
          renderAll();
          touch();
        });
      }

      function addClass() {
        var g = selGroup();
        if (!g) return;
        var c = { id: S.uid('c'), nome: '', descrizione: '', css: '' };
        g.classi.push(c);
        st.editing = c.id;
        renderAll();
        touch();
        var first = rowsEl.querySelector('.row.editing input');
        if (first) first.focus();
      }

      /* ----- salvataggio ----- */

      function validate() {
        var seen = {};
        for (var i = 0; i < st.data.gruppi.length; i += 1) {
          var g = st.data.gruppi[i];
          for (var j = 0; j < g.classi.length; j += 1) {
            var n = g.classi[j].nome.trim();
            if (!n) return 'Una classe del gruppo «' + g.nome + '» non ha il nome';
            if (!S.validaClasseNome(n)) return 'Nome classe non valido: ' + n;
            if (seen[n]) return 'Classe duplicata: ' + n;
            seen[n] = true;
          }
        }
        return null;
      }

      function save() {
        var msg = validate();
        if (msg) {
          App.toast(msg, true);
          return Promise.resolve(false);
        }
        return App.run(function () { return window.api.saveClassi(st.data); }).then(function (res) {
          if (!res) return false;
          setData(res);
          App.invalidateGlobal();
          return App.run(function () { return App.getGlobal(); }).then(function (g) {
            st.global = g || null;
            preview.refresh();
            App.toast('Salvato');
            return true;
          });
        });
      }

      function discard() {
        setData(JSON.parse(st.snapshot));
      }

      function revert() {
        if (!isDirty()) {
          App.toast('Non ci sono modifiche da annullare');
          return;
        }
        App.askConfirm({
          title: 'Annullare le modifiche?',
          message: 'Torno all\'ultima versione salvata delle classi.',
          okLabel: 'Annulla le modifiche',
          danger: true
        }).then(function (yes) {
          if (yes) discard();
        });
      }

      /* ----- collegamenti ----- */

      addGroupBtn.addEventListener('click', addGroup);
      renameBtn.addEventListener('click', renameGroup);
      delGroupBtn.addEventListener('click', deleteGroup);
      addClassBtn.addEventListener('click', addClass);
      saveBtn.addEventListener('click', save);
      revertBtn.addEventListener('click', revert);
      search.addEventListener('input', function () {
        st.search = search.value;
        st.editing = null;
        renderAll();
      });
      sandboxText.addEventListener('input', refreshSoon);
      copyAllBtn.addEventListener('click', function () {
        App.copyText(S.buildClassiCss(S.normalizeClassi(st.data)), 'CSS delle classi');
      });
      copyGroupBtn.addEventListener('click', function () {
        var g = selGroup();
        if (g) App.copyText(S.buildClassiCss(S.normalizeClassi(st.data), { gruppiIds: [g.id] }), 'CSS del gruppo');
      });
      exportBtn.addEventListener('click', function () {
        App.run(function () { return window.api.exportCss('classi', st.data); }).then(function (r) {
          if (r && !r.annullato) App.toast('Salvato in: ' + r.percorso);
        });
      });

      /* ----- interfaccia della scheda ----- */

      function show() {
        return Promise.all([
          isDirty() ? null : App.run(function () { return window.api.getClassi(); }),
          App.run(function () { return App.getGlobal(); })
        ]).then(function (r) {
          st.global = r[1] || null;
          if (r[0]) setData(r[0]);
          else preview.refresh();
        });
      }

      function reset() {
        st.editing = null;
        st.sel = null;
        setData({ gruppi: [] });
      }

      return { el: root, show: show, isDirty: isDirty, save: save, discard: discard, reset: reset, state: st };
    }
  });
})();
