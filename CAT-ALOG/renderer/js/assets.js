/* Scheda «Asset»: immagini, SVG, Lottie, video e font con anteprima, peso e frammenti pronti da copiare. */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var S = App.S;
  var h = App.h;

  var FILTRI = [
    { id: 'tutti', label: 'Tutti' },
    { id: 'immagine', label: 'Immagini' },
    { id: 'svg', label: 'SVG' },
    { id: 'lottie', label: 'Lottie' },
    { id: 'video', label: 'Video' },
    { id: 'font', label: 'Font' },
    { id: 'documento', label: 'Documenti' }
  ];

  var MIME = { mp4: 'video/mp4', webm: 'video/webm' };
  var FORMAT = { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' };

  function kb(n) {
    if (n >= 1048576) return (Math.round(n / 10485.76) / 100) + ' MB';
    return Math.max(1, Math.round(n / 1024)) + ' KB';
  }

  /* Frammenti pronti: i percorsi sono relativi alla cartella assets/ del sito. */
  function snippets(a) {
    var path = 'assets/' + a.nome;
    var dims = a.w && a.h ? ' width="' + a.w + '" height="' + a.h + '"' : '';
    var out = [{ label: 'Copia il percorso', text: path }];
    if (a.tipo === 'immagine' || a.tipo === 'svg') {
      out.push({ label: 'Copia <img>', text: '<img src="' + path + '"' + dims + ' alt="" loading="lazy" decoding="async">' });
      out.push({ label: 'Copia sfondo CSS', text: 'background-image: url("' + path + '");\nbackground-size: cover;\nbackground-position: center;' });
    }
    if (a.tipo === 'svg') {
      out.push({ label: 'Copia maschera CSS (colore del testo)', text: '-webkit-mask: url("' + path + '") center / contain no-repeat;\nmask: url("' + path + '") center / contain no-repeat;\nbackground-color: currentColor;' });
    }
    if (a.tipo === 'lottie') {
      out.push({
        label: 'Copia il codice Lottie',
        text: '<div id="animazione" role="img" aria-label="Animazione"' + (a.w && a.h ? ' style="max-width:' + a.w + 'px"' : '') + '></div>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>\n<script>\n  lottie.loadAnimation({\n    container: document.getElementById("animazione"),\n    renderer: "svg",\n    loop: true,\n    autoplay: !matchMedia("(prefers-reduced-motion: reduce)").matches,\n    path: "' + path + '"\n  });\n</script>'
      });
    }
    if (a.tipo === 'video') {
      out.push({ label: 'Copia <video>', text: '<video controls playsinline preload="metadata"' + dims + '>\n  <source src="' + path + '" type="' + (MIME[a.ext] || 'video/mp4') + '">\n</video>' });
      out.push({ label: 'Copia video di sfondo', text: '<video autoplay muted loop playsinline aria-hidden="true">\n  <source src="' + path + '" type="' + (MIME[a.ext] || 'video/mp4') + '">\n</video>' });
    }
    if (a.tipo === 'font') {
      var famiglia = a.nome.replace(/\.[a-z0-9]+$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      out.push({
        label: 'Copia @font-face',
        text: '@font-face {\n  font-family: "' + famiglia + '";\n  src: url("' + path + '") format("' + (FORMAT[a.ext] || a.ext) + '");\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}'
      });
    }
    if (a.tipo === 'documento') {
      out.push({ label: 'Copia il link', text: '<a href="' + path + '" download>Scarica il PDF</a>' });
    }
    return out;
  }

  App.defineTab({
    id: 'asset',
    label: 'Asset',
    create: function () {
      var st = { items: [], filter: 'tutti', sel: null, search: '' };

      var root = h('section', {
        class: 'tab-body classi assets',
        role: 'tabpanel',
        id: 'panel-asset',
        'aria-label': 'Asset',
        hidden: true
      });

      var search = h('input', { type: 'search', placeholder: 'Cerca un file…', 'aria-label': 'Cerca un file' });
      var addBtn = h('button', { type: 'button', class: 'btn primary', text: '+ Aggiungi' });
      var filterList = h('ul', { class: 'list' });
      root.appendChild(h('div', { class: 'col-list' }, [h('div', { class: 'list-head' }, [search, addBtn]), filterList]));

      var grid = h('ul', { class: 'asset-grid' });
      var summary = h('p', { class: 'hint asset-summary' });
      root.appendChild(h('div', { class: 'col-main' }, [summary, grid]));

      var detail = h('div', { class: 'asset-detail' });
      root.appendChild(h('div', { class: 'col-editor' }, [detail]));

      /* ----- disegno ----- */

      function visible() {
        var q = S.str(st.search).toLowerCase().trim();
        return st.items.filter(function (a) {
          return (st.filter === 'tutti' || a.tipo === st.filter) && (!q || a.nome.toLowerCase().indexOf(q) !== -1);
        });
      }

      function renderFilters() {
        filterList.textContent = '';
        FILTRI.forEach(function (f) {
          var n = f.id === 'tutti' ? st.items.length : st.items.filter(function (a) { return a.tipo === f.id; }).length;
          filterList.appendChild(
            h('li', null, [
              h('button', {
                type: 'button',
                class: 'list-btn',
                'aria-current': st.filter === f.id ? 'true' : null,
                onclick: function () { st.filter = f.id; renderAll(); }
              }, [f.label, h('small', { text: n + (n === 1 ? ' file' : ' file') })])
            ])
          );
        });
      }

      function thumb(a) {
        if (a.tipo === 'immagine' || a.tipo === 'svg') return h('img', { class: 'asset-thumb', src: a.url, alt: '', loading: 'lazy' });
        var icon = { lottie: '✨', video: '🎬', font: 'Aa', documento: '📄' }[a.tipo] || '📁';
        return h('span', { class: 'asset-thumb asset-icon', 'aria-hidden': 'true', text: icon });
      }

      function renderGrid() {
        grid.textContent = '';
        var list = visible();
        summary.textContent = st.items.length
          ? list.length + ' di ' + st.items.length + ' file · ' + kb(list.reduce(function (n, a) { return n + a.byte; }, 0)) + ' in totale'
          : '';
        if (!list.length) {
          grid.appendChild(h('li', { class: 'empty', text: st.items.length ? 'Nessun risultato.' : 'Ancora vuoto. Premi «+ Aggiungi» per portare qui immagini, SVG, Lottie, video o font.' }));
          return;
        }
        list.forEach(function (a) {
          grid.appendChild(
            h('li', null, [
              h('button', {
                type: 'button',
                class: 'asset-card',
                'aria-current': a.nome === st.sel ? 'true' : null,
                onclick: function () { st.sel = a.nome; renderGrid(); renderDetail(); }
              }, [
                thumb(a),
                h('span', { class: 'asset-name', text: a.nome }),
                h('small', { text: kb(a.byte) + (a.w && a.h ? ' · ' + a.w + '×' + a.h : '') }),
                a.avvisi.length ? h('small', { class: 'asset-warn', text: '▲ ' + a.avvisi.length + (a.avvisi.length === 1 ? ' avviso' : ' avvisi') }) : null
              ])
            ])
          );
        });
      }

      function previewBig(a) {
        if (a.tipo === 'immagine' || a.tipo === 'svg') return h('img', { class: 'asset-big', src: a.url, alt: a.nome });
        if (a.tipo === 'video') return h('video', { class: 'asset-big', src: a.url, controls: true, preload: 'metadata', muted: true });
        return h('div', { class: 'asset-big asset-icon', 'aria-hidden': 'true', text: { lottie: '✨', font: 'Aa', documento: '📄' }[a.tipo] || '📁' });
      }

      function renderDetail() {
        detail.textContent = '';
        var a = st.items.filter(function (x) { return x.nome === st.sel; })[0];
        if (!a) {
          detail.appendChild(h('p', { class: 'hint', text: 'Scegli un file per vederne l\'anteprima e copiare i frammenti pronti.' }));
          return;
        }
        detail.appendChild(h('h3', { class: 'asset-title', text: a.nome }));
        detail.appendChild(previewBig(a));
        detail.appendChild(h('p', { class: 'asset-facts', text:
          kb(a.byte) + ' · ' + a.ext.toUpperCase() + (a.w && a.h ? ' · ' + a.w + ' × ' + a.h + ' px' : '') + (a.info ? ' · ' + a.info : '') }));
        if (a.avvisi.length) {
          detail.appendChild(h('ul', { class: 'asset-warnings' }, a.avvisi.map(function (t) { return h('li', { text: '▲ ' + t }); })));
        }
        detail.appendChild(h('div', { class: 'group-label', text: 'Copia' }));
        detail.appendChild(h('div', { class: 'btn-row' }, snippets(a).map(function (sn) {
          return h('button', { type: 'button', class: 'btn small', text: sn.label, onclick: function () { App.copyText(sn.text, sn.label.replace(/^Copia /, '')); } });
        })));
        detail.appendChild(h('p', { class: 'hint', text: 'I percorsi sono relativi: metti la cartella assets/ accanto alla tua pagina. «Esporta tutto» la copia insieme al resto.' }));
        detail.appendChild(h('div', { class: 'group-label', text: 'Altre azioni' }));
        detail.appendChild(h('div', { class: 'btn-row' }, [
          h('button', { type: 'button', class: 'btn', text: 'Rinomina', onclick: function () { rename(a); } }),
          h('button', { type: 'button', class: 'btn danger', text: 'Elimina', onclick: function () { remove(a); } })
        ]));
      }

      function renderAll() {
        renderFilters();
        renderGrid();
        renderDetail();
      }

      /* ----- azioni ----- */

      function refresh() {
        return App.run(function () { return window.api.listAssets(); }).then(function (list) {
          if (!list) return;
          st.items = list;
          if (st.sel && !list.some(function (a) { return a.nome === st.sel; })) st.sel = null;
          renderAll();
        });
      }

      function add() {
        return App.run(function () { return window.api.addAssets(); }).then(function (r) {
          if (!r || r.annullato) return;
          return refresh().then(function () {
            if (r.aggiunti.length) {
              st.sel = r.aggiunti[r.aggiunti.length - 1];
              st.filter = 'tutti';
              renderAll();
            }
            var msg = r.aggiunti.length + ' file aggiunti';
            if (r.errori.length) msg += ' · non aggiunti: ' + r.errori.map(function (e) { return e.file + ' (' + e.messaggio + ')'; }).join('; ');
            App.toast(msg, r.errori.length > 0 && !r.aggiunti.length);
          });
        });
      }

      function rename(a) {
        return App.askForm({
          title: 'Rinomina «' + a.nome + '»',
          intro: 'L\'estensione (.' + a.ext + ') resta. Se il file è già usato in una pagina, cambia anche il percorso lì.',
          fields: [{ name: 'nome', label: 'Nuovo nome', value: a.nome.replace(/\.[a-z0-9]+$/, '') }],
          okLabel: 'Rinomina',
          validate: function (v) { return v.nome.trim() ? null : 'Scrivi un nome'; }
        }).then(function (v) {
          if (!v) return;
          return App.run(function () { return window.api.renameAsset(a.nome, v.nome); }).then(function (r) {
            if (!r) return;
            st.sel = r.nome;
            return refresh().then(function () { App.toast('Rinominato in ' + r.nome); });
          });
        });
      }

      function remove(a) {
        return App.askConfirm({
          title: 'Eliminare «' + a.nome + '»?',
          message: 'Va nel cestino della cartella dei dati, non viene cancellato per sempre.',
          okLabel: 'Elimina',
          danger: true
        }).then(function (yes) {
          if (!yes) return;
          return App.run(function () { return window.api.removeAsset(a.nome); }).then(function (r) {
            if (!r) return;
            st.sel = null;
            return refresh().then(function () { App.toast('Spostato nel cestino'); });
          });
        });
      }

      search.addEventListener('input', function () { st.search = search.value; renderGrid(); });
      addBtn.addEventListener('click', add);

      return {
        el: root,
        show: function () { return refresh(); },
        isDirty: function () { return false; },
        save: function () { return Promise.resolve(true); },
        discard: function () {},
        reset: function () { st.items = []; st.sel = null; },
        state: st
      };
    }
  });
})();
