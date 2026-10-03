/* Scheda «Testi UI»: microcopy riusabile in italiano e inglese. */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var T = window.CatalogoTesti;
  var S = App.S;
  var h = App.h;

  function norm(t) {
    return S.str(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  App.defineTab({
    id: 'testi',
    label: 'Testi UI',
    create: function () {
      var st = { sel: T.gruppi[0].id, search: '' };

      var root = h('section', {
        class: 'tab-body classi testi',
        role: 'tabpanel',
        id: 'panel-testi',
        'aria-label': 'Testi UI',
        hidden: true
      });

      var search = h('input', { type: 'search', placeholder: 'Cerca un testo…', 'aria-label': 'Cerca un testo' });
      var groupList = h('ul', { class: 'list' });
      root.appendChild(h('div', { class: 'col-list' }, [h('div', { class: 'list-head' }, [search]), groupList]));

      var title = h('h2', { class: 'group-title' });
      var exportIt = h('button', { type: 'button', class: 'btn small', text: 'Salva it.json…' });
      var exportEn = h('button', { type: 'button', class: 'btn small', text: 'Salva en.json…' });
      var copyBoth = h('button', { type: 'button', class: 'btn small', text: 'Copia il gruppo (JSON)' });
      var rowsEl = h('ul', { class: 'rows testi-rows' });
      root.appendChild(h('div', { class: 'col-main' }, [h('div', { class: 'toolbar' }, [title, copyBoth, exportIt, exportEn]), rowsEl]));

      root.appendChild(
        h('div', { class: 'col-editor' }, [
          h('h3', { text: 'Come si usano' }),
          h('p', { class: 'hint', text: 'Clic su una lingua per copiarla. Le parti tra graffe, come {max} o {nome}, sono segnaposto da sostituire (o da lasciare se usi una libreria di traduzione).' }),
          h('p', { class: 'hint', text: '«Salva it.json / en.json» crea i file di traduzione di tutti i gruppi, con le chiavi annidate (azioni.invia), pronti per i18n.' }),
          h('h3', { text: 'Regole di scrittura' }),
          h('ul', { class: 'tips' }, [
            h('li', { text: 'Pulsanti: un verbo chiaro («Salva», non «OK»).' }),
            h('li', { text: 'Errori: dì cosa è successo e cosa fare, senza colpevolizzare.' }),
            h('li', { text: 'Stati vuoti: spiega e proponi il primo passo.' }),
            h('li', { text: 'Distruttivo: nomina l\'oggetto («Elimina il file»).' }),
            h('li', { text: 'Tono: stesso «tu» ovunque.' })
          ])
        ])
      );

      function matches(g, v, q) {
        return !q || norm(g.nome + ' ' + v.chiave + ' ' + v.it + ' ' + v.en + ' ' + v.nota).indexOf(q) !== -1;
      }

      function selGroup() {
        return T.gruppi.filter(function (g) { return g.id === st.sel; })[0] || T.gruppi[0];
      }

      function renderGroups() {
        groupList.textContent = '';
        T.gruppi.forEach(function (g) {
          groupList.appendChild(
            h('li', null, [
              h('button', {
                type: 'button',
                class: 'list-btn',
                'aria-current': !st.search.trim() && g.id === st.sel ? 'true' : null,
                onclick: function () { st.search = ''; search.value = ''; st.sel = g.id; renderAll(); }
              }, [g.nome, h('small', { text: g.voci.length + ' testi' })])
            ])
          );
        });
      }

      function lang(label, text) {
        var empty = !text;
        return h('button', {
          type: 'button',
          class: 'testo-lang',
          disabled: empty,
          title: 'Copia',
          onclick: function () { App.copyText(text, label); }
        }, [h('b', { text: label }), h('span', { text: empty ? '—' : text })]);
      }

      function row(g, v, withGroup) {
        return h('li', { class: 'row testo-row' }, [
          h('div', { class: 'testo-key' }, [h('code', { text: v.chiave }), withGroup ? h('small', { text: g.nome }) : null]),
          lang('IT', v.it),
          lang('EN', v.en),
          v.nota ? h('p', { class: 'hint testo-nota', text: v.nota }) : null
        ]);
      }

      function renderRows() {
        rowsEl.textContent = '';
        var q = norm(st.search.trim());
        if (q) {
          var n = 0;
          T.gruppi.forEach(function (g) {
            g.voci.forEach(function (v) {
              if (!matches(g, v, q)) return;
              n += 1;
              rowsEl.appendChild(row(g, v, true));
            });
          });
          title.textContent = 'Risultati (' + n + ')';
          if (!n) rowsEl.appendChild(h('li', { class: 'empty', text: 'Nessun risultato.' }));
        } else {
          var g2 = selGroup();
          title.textContent = g2.nome;
          g2.voci.forEach(function (v) { rowsEl.appendChild(row(g2, v, false)); });
        }
      }

      function renderAll() {
        renderGroups();
        renderRows();
      }

      search.addEventListener('input', function () { st.search = search.value; renderGroups(); renderRows(); });
      copyBoth.addEventListener('click', function () {
        var g = selGroup();
        var o = {};
        g.voci.forEach(function (v) { o[v.chiave.slice(g.id.length + 1)] = { it: v.it, en: v.en }; });
        App.copyText(JSON.stringify(o, null, 2), g.nome);
      });
      function saveLang(lng) {
        App.run(function () { return window.api.saveTextFile(lng + '.json', T.buildJson(lng)); }).then(function (r) {
          if (r && !r.annullato) App.toast('Salvato: ' + r.percorso);
        });
      }
      exportIt.addEventListener('click', function () { saveLang('it'); });
      exportEn.addEventListener('click', function () { saveLang('en'); });

      return {
        el: root,
        show: function () { renderAll(); return Promise.resolve(); },
        isDirty: function () { return false; },
        save: function () { return Promise.resolve(true); },
        discard: function () {},
        reset: function () {},
        state: st
      };
    }
  });
})();
