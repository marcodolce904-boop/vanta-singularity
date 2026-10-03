/* Scheda «Tipografia»: coppie di font, scala fluida dei titoli con clamp(), scrittura nel Root. */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var T = window.CatalogoTypography;
  var S = App.S;
  var h = App.h;

  var DEFAULTS = { minSize: 16, maxSize: 18, minRatio: 1.2, maxRatio: 1.25, minVw: 320, maxVw: 1240, giu: 2, su: 6, lhTesto: 1.6, lhTitoli: 1.15 };

  function esc(t) {
    return S.escapeHtml(t);
  }

  App.defineTab({
    id: 'tipografia',
    label: 'Tipografia',
    create: function () {
      var st = {
        sel: T.coppie[0].id,
        opts: Object.assign({}, DEFAULTS),
        titoli: T.coppie[0].titoli,
        testo: T.coppie[0].testo,
        search: ''
      };

      var root = h('section', {
        class: 'tab-body classi tipografia',
        role: 'tabpanel',
        id: 'panel-tipografia',
        'aria-label': 'Tipografia',
        hidden: true
      });

      /* ----- colonna coppie ----- */
      var search = h('input', { type: 'search', placeholder: 'Cerca una coppia…', 'aria-label': 'Cerca una coppia di font' });
      var list = h('ul', { class: 'list' });
      root.appendChild(h('div', { class: 'col-list' }, [h('div', { class: 'list-head' }, [search]), list]));

      /* ----- colonna anteprima ----- */
      var preview = App.makePreview({ title: 'Anteprima della tipografia', getDoc: previewDoc, advanced: false });
      root.appendChild(h('div', { class: 'col-main' }, [preview.el]));

      /* ----- colonna controlli ----- */
      var fields = {};
      function numField(key, label, step, min, max) {
        var input = h('input', { type: 'number', step: String(step), min: String(min), max: String(max), value: String(st.opts[key]) });
        input.addEventListener('input', function () {
          var v = parseFloat(input.value);
          if (isFinite(v)) st.opts[key] = v;
          update();
        });
        fields[key] = input;
        return h('label', { class: 'field' }, [h('span', { text: label }), input]);
      }

      var fTitoli = h('input', { type: 'text', spellcheck: 'false', value: st.titoli, 'aria-label': 'Font dei titoli' });
      var fTesto = h('input', { type: 'text', spellcheck: 'false', value: st.testo, 'aria-label': 'Font del testo' });
      fTitoli.addEventListener('input', function () { st.titoli = fTitoli.value; update(); });
      fTesto.addEventListener('input', function () { st.testo = fTesto.value; update(); });

      var tableEl = h('table', { class: 'scale-table' });
      var cssOut = h('pre', { class: 'css-out', tabindex: '0', 'aria-label': 'CSS generato' });
      var linkBtn = h('button', { type: 'button', class: 'btn small', text: 'Copia il link dei font' });
      var copyBtn = h('button', { type: 'button', class: 'btn small', text: 'Copia :root' });
      var applyBtn = h('button', { type: 'button', class: 'btn small primary', text: 'Scrivi nel Root' });
      var resetBtn = h('button', { type: 'button', class: 'btn small', text: 'Valori di partenza' });
      var note = h('p', { class: 'hint' });

      root.appendChild(
        h('div', { class: 'col-editor' }, [
          h('h3', { text: 'Font' }),
          h('label', { class: 'field' }, [h('span', { text: 'Titoli' }), fTitoli]),
          h('label', { class: 'field' }, [h('span', { text: 'Testo' }), fTesto]),
          note,
          h('h3', { text: 'Scala dei caratteri' }),
          h('div', { class: 'num-grid' }, [
            numField('minSize', 'Testo base, schermo piccolo (px)', 1, 10, 30),
            numField('maxSize', 'Testo base, schermo grande (px)', 1, 10, 40),
            numField('minRatio', 'Rapporto, schermo piccolo', 0.01, 1, 2),
            numField('maxRatio', 'Rapporto, schermo grande', 0.01, 1, 2),
            numField('minVw', 'Schermo piccolo (px)', 10, 200, 1000),
            numField('maxVw', 'Schermo grande (px)', 10, 400, 3000),
            numField('lhTesto', 'Interlinea del testo', 0.05, 1, 2.5),
            numField('lhTitoli', 'Interlinea dei titoli', 0.05, 0.8, 2)
          ]),
          h('p', { class: 'hint', text: 'Rapporti comuni: 1,125 (discreto) · 1,2 (terza minore) · 1,25 (terza maggiore) · 1,333 (quarta) · 1,5 (quinta).' }),
          tableEl,
          h('h3', { text: 'CSS generato' }),
          cssOut,
          h('div', { class: 'btn-row' }, [copyBtn, linkBtn, applyBtn, resetBtn])
        ])
      );

      /* ----- calcoli ----- */

      function pair() {
        return T.coppie.filter(function (c) { return c.id === st.sel; })[0] || T.coppie[0];
      }

      function vars() {
        return S.typographyVars(st.opts, { titoli: st.titoli, testo: st.testo });
      }

      function rootCss() {
        return ':root {\n' + vars().map(function (v) { return '  ' + v.nome + ': ' + v.valore + ';'; }).join('\n') + '\n}\n';
      }

      function previewDoc() {
        var scale = S.fluidScale(st.opts);
        var by = {};
        scale.forEach(function (s) { by[s.nome] = s.valore; });
        var p = pair();
        var head = '';
        if (p.google) head = '<link rel="stylesheet" href="' + esc(p.google) + '">';
        var css =
          ':root{--h:' + st.titoli + ';--b:' + st.testo + '}' +
          'body{margin:0;padding:24px;font-family:var(--b);font-size:' + (by.base || '1rem') + ';line-height:' + st.opts.lhTesto + ';color:#111111;background:#fff}' +
          'h1,h2,h3,h4{font-family:var(--h);line-height:' + st.opts.lhTitoli + ';margin:1.2em 0 .4em}' +
          'h1{font-size:' + (by['4xl'] || by['3xl'] || '2.5rem') + '}h2{font-size:' + (by['3xl'] || by['2xl'] || '2rem') + '}' +
          'h3{font-size:' + (by['2xl'] || '1.5rem') + '}h4{font-size:' + (by.xl || '1.25rem') + '}' +
          'p{max-width:65ch}small{font-size:' + (by.sm || '.875rem') + '}.eyebrow{font-family:var(--b);font-size:' + (by.sm || '.875rem') + ';text-transform:uppercase;letter-spacing:.08em;color:#111111}' +
          'blockquote{margin:1em 0;padding-left:1em;border-left:4px solid #111111;font-family:var(--h);font-size:' + (by.lg || '1.25rem') + '}';
        return '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' + head +
          '<style>' + css + '</style></head><body>' +
          '<p class="eyebrow">Anteprima · ' + esc(p.nome) + '</p>' +
          '<h1>Un titolo che si legge bene</h1>' +
          '<p>Il testo corrente accompagna il titolo: deve restare comodo da leggere su telefono e su monitor grande. Provate a cambiare larghezza per vedere i caratteri crescere in modo fluido.</p>' +
          '<h2>Sottotitolo di sezione</h2>' +
          '<p>Una riga di testo normale con una parola in <strong>grassetto</strong>, una in <em>corsivo</em> e <a href="#">un link</a>.</p>' +
          '<h3>Titolo di terzo livello</h3>' +
          '<blockquote>Una citazione usa il font dei titoli per staccarsi dal testo.</blockquote>' +
          '<h4>Titolo di quarto livello</h4><p><small>Testo piccolo per note e didascalie.</small></p></body></html>';
      }

      /* ----- disegno ----- */

      function renderList() {
        var q = S.str(st.search).toLowerCase().trim();
        list.textContent = '';
        T.coppie.filter(function (c) {
          return !q || (c.nome + ' ' + c.descrizione).toLowerCase().indexOf(q) !== -1;
        }).forEach(function (c) {
          list.appendChild(
            h('li', null, [
              h('button', {
                type: 'button',
                class: 'list-btn',
                'aria-current': c.id === st.sel ? 'true' : null,
                onclick: function () { choose(c); }
              }, [c.nome, h('small', { text: c.descrizione })])
            ])
          );
        });
      }

      function choose(c) {
        st.sel = c.id;
        st.titoli = c.titoli;
        st.testo = c.testo;
        fTitoli.value = c.titoli;
        fTesto.value = c.testo;
        renderList();
        update();
      }

      function renderTable() {
        tableEl.textContent = '';
        tableEl.appendChild(h('thead', null, [h('tr', null, ['Nome', 'Piccolo', 'Grande'].map(function (t) { return h('th', { scope: 'col', text: t }); }))]));
        var body = h('tbody');
        S.fluidScale(st.opts).forEach(function (s) {
          body.appendChild(h('tr', null, [
            h('td', null, [h('code', { text: '--cat-text-' + s.nome })]),
            h('td', { text: s.min + ' px' }),
            h('td', { text: s.max + ' px' })
          ]));
        });
        tableEl.appendChild(body);
      }

      function update() {
        var p = pair();
        note.textContent = p.google
          ? 'Questa coppia usa font di Google Fonts: serve la connessione. Copia il link e mettilo nel <head> del sito.'
          : 'Solo font già presenti nel sistema: niente da scaricare.';
        linkBtn.disabled = !p.google;
        renderTable();
        cssOut.textContent = rootCss();
        preview.refresh();
      }

      /* ----- azioni ----- */

      search.addEventListener('input', function () {
        st.search = search.value;
        renderList();
      });

      copyBtn.addEventListener('click', function () { App.copyText(rootCss(), ':root'); });

      linkBtn.addEventListener('click', function () {
        var p = pair();
        if (!p.google) return;
        App.copyText('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="' + p.google + '">\n', 'Link dei font');
      });

      resetBtn.addEventListener('click', function () {
        st.opts = Object.assign({}, DEFAULTS);
        Object.keys(fields).forEach(function (k) { fields[k].value = String(st.opts[k]); });
        update();
      });

      applyBtn.addEventListener('click', function () {
        if (App.anyDirty()) {
          App.toast('Prima salva o annulla le modifiche nelle altre schede, poi scrivi nel Root', true);
          return;
        }
        App.run(function () { return window.api.getRoot(); }).then(function (data) {
          if (!data) return;
          var merged = S.mergeRootVars(data, vars(), 'Tipografia');
          return App.askConfirm({
            title: 'Scrivere nel Root?',
            message: merged.aggiornate + ' variabili esistenti cambiano valore e ' + merged.aggiunte + ' nuove vengono aggiunte (gruppo «Tipografia»). Si salva subito.',
            okLabel: 'Scrivi nel Root'
          }).then(function (yes) {
            if (!yes) return;
            return App.run(function () { return window.api.saveRoot(merged.data); }).then(function (res) {
              if (!res) return;
              App.invalidateGlobal();
              App.toast('Root aggiornato: ' + merged.aggiornate + ' cambiate, ' + merged.aggiunte + ' aggiunte');
            });
          });
        });
      });

      return {
        el: root,
        show: function () {
          renderList();
          update();
          return Promise.resolve();
        },
        isDirty: function () { return false; },
        save: function () { return Promise.resolve(true); },
        discard: function () {},
        reset: function () {},
        state: st
      };
    }
  });
})();
