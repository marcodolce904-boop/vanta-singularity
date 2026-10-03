/* Scheda «Responsive»: media query già pronti, da copiare, con l'indicazione di quali valgono ora. */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var R = window.CatalogoResponsive;
  var S = App.S;
  var h = App.h;

  function norm(t) {
    return S.str(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  /* Pagina di prova per l'anteprima: i riquadri si accendono con i veri media query, alla larghezza dell'anteprima. */
  function testDoc() {
    var rows = R.soglie.map(function (s) {
      return '<li class="bp" data-k="' + s.k + '">' + s.k + (s.min ? ' <small>≥ ' + s.min + ' px</small>' : ' <small>base</small>') + '</li>';
    }).join('');
    var css = R.soglie.filter(function (s) { return s.min; }).map(function (s) {
      return '@media (min-width:' + s.min + 'px){.bp[data-k="' + s.k + '"]{background:#111111;color:#fff;border-color:#111111}}';
    }).join('\n');
    return '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>' +
      'body{margin:0;padding:12px;font:14px system-ui,sans-serif;color:#111111}' +
      'h1{margin:0 0 8px;font-size:15px}' +
      '.bp{display:inline-block;margin:0 6px 6px 0;padding:4px 10px;border:1px solid #bbb;border-radius:999px;list-style:none;background:#f2f2f2}' +
      '.bp[data-k="xs"]{background:#111111;color:#fff;border-color:#111111}' +
      'ul{margin:0;padding:0}.flag{margin:6px 0;color:#4a4a4a}.flag b{color:#111111}' +
      css + '</style></head><body>' +
      '<h1>Larghezza: <span id="w">…</span> · <span id="o">…</span></h1><ul>' + rows + '</ul>' +
      '<p class="flag">Puntatore: <b id="p">…</b></p><p class="flag">Tema: <b id="t">…</b></p>' +
      '<script>(function(){function u(){document.getElementById("w").textContent=innerWidth+" × "+innerHeight+" px";' +
      'document.getElementById("o").textContent=matchMedia("(orientation: portrait)").matches?"verticale":"orizzontale";' +
      'document.getElementById("p").textContent=matchMedia("(pointer: coarse)").matches?"touch":"mouse";' +
      'document.getElementById("t").textContent=matchMedia("(prefers-color-scheme: dark)").matches?"scuro":"chiaro"}' +
      'addEventListener("resize",u);u()})()</scr' + 'ipt></body></html>';
  }

  App.defineTab({
    id: 'responsive',
    label: 'Responsive',
    create: function () {
      var st = { sel: R.gruppi[0].id, search: '' };
      var live = []; /* { badge, query } */

      var root = h('section', {
        class: 'tab-body classi responsive',
        role: 'tabpanel',
        id: 'panel-responsive',
        'aria-label': 'Responsive',
        hidden: true
      });

      /* ----- colonna gruppi ----- */
      var search = h('input', { type: 'search', placeholder: 'Cerca un media query…', 'aria-label': 'Cerca un media query' });
      var groupList = h('ul', { class: 'list' });
      root.appendChild(h('div', { class: 'col-list' }, [h('div', { class: 'list-head' }, [search]), groupList]));

      /* ----- colonna voci ----- */
      var title = h('h2', { class: 'group-title' });
      var copyGroupBtn = h('button', { type: 'button', class: 'btn small', text: 'Copia il gruppo' });
      var copyAllBtn = h('button', { type: 'button', class: 'btn small', text: 'Copia tutto' });
      var exportBtn = h('button', { type: 'button', class: 'btn small primary', text: 'Esporta responsive.css…' });
      var nota = h('p', { class: 'hint resp-note' });
      var liveBar = h('p', { class: 'resp-live', role: 'status' });
      var rowsEl = h('ul', { class: 'rows resp-rows' });
      root.appendChild(
        h('div', { class: 'col-main' }, [
          h('div', { class: 'toolbar' }, [title, copyGroupBtn, copyAllBtn, exportBtn]),
          liveBar,
          nota,
          rowsEl
        ])
      );

      /* ----- colonna prova ----- */
      var preview = App.makePreview({ title: 'Prova della larghezza', getDoc: testDoc, advanced: false });
      var devList = h('div', { class: 'btn-row' });
      R.dispositivi.forEach(function (d) {
        devList.appendChild(
          h('button', {
            type: 'button',
            class: 'btn small',
            title: d.nome + ' · ' + d.w + ' × ' + d.h + ' px (' + d.tipo + ')',
            text: d.nome + ' ' + d.w,
            onclick: function () { preview.setWidth(d.w); }
          })
        );
      });
      root.appendChild(
        h('div', { class: 'col-editor' }, [
          h('h3', { text: 'Prova a una larghezza' }),
          h('p', { class: 'hint', text: 'Scegli un dispositivo: i riquadri qui sotto si accendono con i media query veri, alla larghezza dell\'anteprima.' }),
          devList,
          preview.el,
          h('p', { class: 'hint', text: 'Le variabili CSS (var(--…)) non funzionano dentro @media: le soglie vanno scritte come numeri.' })
        ])
      );

      /* ----- disegno ----- */

      function matches(g, v, q) {
        if (!q) return true;
        return norm(g.nome + ' ' + v.nome + ' ' + v.descrizione + ' ' + v.codice).indexOf(q) !== -1;
      }

      function selGroup() {
        return R.gruppi.filter(function (g) { return g.id === st.sel; })[0] || R.gruppi[0];
      }

      function renderGroups() {
        groupList.textContent = '';
        R.gruppi.forEach(function (g) {
          groupList.appendChild(
            h('li', null, [
              h('button', {
                type: 'button',
                class: 'list-btn',
                'aria-current': !st.search.trim() && g.id === st.sel ? 'true' : null,
                onclick: function () {
                  st.search = '';
                  search.value = '';
                  st.sel = g.id;
                  renderAll();
                }
              }, [g.nome, h('small', { text: g.voci.length + ' voci' })])
            ])
          );
        });
      }

      function entry(g, v, showGroup) {
        var badge = h('span', { class: 'resp-badge', hidden: !v.query, text: 'vale ora' });
        if (v.query) live.push({ badge: badge, query: v.query });
        return h('li', { class: 'row resp-row' }, [
          h('div', { class: 'resp-head' }, [
            h('strong', { text: v.nome }),
            badge,
            showGroup ? h('small', { class: 'group-tag', text: g.nome }) : null,
            h('button', {
              type: 'button',
              class: 'btn small',
              text: 'Copia',
              onclick: function () { App.copyText(v.codice, v.lang === 'html' ? 'HTML' : 'CSS'); }
            })
          ]),
          h('p', { class: 'desc resp-desc', text: v.descrizione }),
          h('pre', { class: 'css-out resp-code', tabindex: '0', 'aria-label': 'Codice di ' + v.nome, text: v.codice })
        ]);
      }

      function renderRows() {
        live = [];
        rowsEl.textContent = '';
        var q = norm(st.search.trim());
        if (q) {
          var hits = 0;
          R.gruppi.forEach(function (g) {
            g.voci.forEach(function (v) {
              if (!matches(g, v, q)) return;
              hits += 1;
              rowsEl.appendChild(entry(g, v, true));
            });
          });
          title.textContent = 'Risultati (' + hits + ')';
          nota.textContent = '';
          if (!hits) rowsEl.appendChild(h('li', { class: 'empty', text: 'Nessun risultato.' }));
        } else {
          var g = selGroup();
          title.textContent = g.nome;
          nota.textContent = g.nota || '';
          g.voci.forEach(function (v) { rowsEl.appendChild(entry(g, v, false)); });
        }
        updateLive();
      }

      function updateLive() {
        var w = window.innerWidth;
        liveBar.textContent =
          'Questa finestra: ' + w + ' × ' + window.innerHeight + ' px · punto di rottura ' + R.breakpointFor(w) +
          (window.devicePixelRatio ? ' · densità ' + window.devicePixelRatio + '×' : '');
        live.forEach(function (x) {
          var on = false;
          try {
            on = window.matchMedia(x.query).matches;
          } catch (e) {
            on = false;
          }
          x.badge.hidden = !on;
        });
      }

      function renderAll() {
        renderGroups();
        renderRows();
      }

      /* ----- azioni ----- */

      search.addEventListener('input', function () {
        st.search = search.value;
        renderGroups();
        renderRows();
      });

      copyGroupBtn.addEventListener('click', function () {
        App.copyText(R.buildCss([selGroup().id]), selGroup().nome);
      });
      copyAllBtn.addEventListener('click', function () {
        App.copyText(R.buildCss(), 'Tutti i media query');
      });
      exportBtn.addEventListener('click', function () {
        App.run(function () { return window.api.exportResponsive(); }).then(function (r) {
          if (r && !r.annullato) App.toast('Salvato: ' + r.percorso);
        });
      });

      var onResize = App.debounce(updateLive, 120);
      window.addEventListener('resize', onResize);

      var tab = {
        el: root,
        show: function () {
          renderAll();
          preview.refresh();
          return Promise.resolve();
        },
        isDirty: function () { return false; },
        save: function () { return Promise.resolve(true); },
        discard: function () {},
        reset: function () {},
        state: st
      };
      return tab;
    }
  });
})();
