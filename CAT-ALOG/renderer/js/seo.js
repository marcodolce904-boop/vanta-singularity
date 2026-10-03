/* Scheda «Head e SEO»: modulo che genera il blocco <head> completo, con controlli e anteprima di Google. */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var Seo = window.CatalogoSeo;
  var S = App.S;
  var h = App.h;

  App.defineTab({
    id: 'seo',
    label: 'Head e SEO',
    create: function () {
      var st = { v: Seo.normalize({}), snapshot: '' };
      st.snapshot = JSON.stringify(st.v);
      var inputs = {};

      var root = h('section', {
        class: 'tab-body classi seo',
        role: 'tabpanel',
        id: 'panel-seo',
        'aria-label': 'Head e SEO',
        hidden: true
      });

      /* ----- modulo ----- */
      var status = h('span', { class: 'status', role: 'status' });
      var saveBtn = h('button', { type: 'button', class: 'btn primary', text: 'Salva' });
      var revertBtn = h('button', { type: 'button', class: 'btn', text: 'Ripristina' });

      function field(key, label, opts) {
        var o = opts || {};
        var input = o.multiline
          ? h('textarea', { rows: String(o.rows || 3), spellcheck: 'false' })
          : h('input', { type: o.type || 'text', spellcheck: 'false', autocomplete: 'off', placeholder: o.placeholder || '' });
        input.value = st.v[key];
        input.addEventListener('input', function () { st.v[key] = input.value; update(); });
        inputs[key] = input;
        return h('label', { class: 'field' }, [h('span', { text: label }), input, o.hint ? h('small', { class: 'muted', text: o.hint }) : null]);
      }

      function select(key, label, options) {
        var sel = h('select', { 'aria-label': label }, options.map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
        sel.value = st.v[key];
        sel.addEventListener('change', function () { st.v[key] = sel.value; update(); });
        inputs[key] = sel;
        return h('label', { class: 'field' }, [h('span', { text: label }), sel]);
      }

      var ldBox = h('div', { class: 'ld-fields' });
      var favChk = h('input', { type: 'checkbox' });
      favChk.checked = st.v.favicon;
      favChk.addEventListener('change', function () { st.v.favicon = favChk.checked; update(); });
      inputs.favicon = favChk;

      var form = h('div', { class: 'col-list seo-form' }, [
        h('div', { class: 'toolbar' }, [status, h('span', { class: 'spacer' }), revertBtn, saveBtn]),
        field('titolo', 'Titolo della pagina', { hint: 'Circa 30-60 caratteri.' }),
        field('descrizione', 'Descrizione', { multiline: true, rows: 3, hint: 'Circa 70-160 caratteri.' }),
        field('url', 'Indirizzo della pagina (canonico)', { placeholder: 'https://www.esempio.it/' }),
        field('immagine', 'Immagine di anteprima (indirizzo completo)', { placeholder: 'https://www.esempio.it/og.png', hint: 'Consigliata 1200×630 px.' }),
        field('nomeSito', 'Nome del sito'),
        field('autore', 'Autore'),
        h('div', { class: 'num-grid' }, [
          field('lingua', 'Lingua', { placeholder: 'it' }),
          field('themeColor', 'Colore del tema', { placeholder: '#2f6f4e' }),
          select('tipoOg', 'Tipo di pagina', [['website', 'Sito'], ['article', 'Articolo'], ['product', 'Prodotto'], ['profile', 'Profilo']]),
          select('robots', 'Indicizzazione', [['index, follow', 'Sì (index, follow)'], ['noindex, follow', 'No (noindex)'], ['noindex, nofollow', 'No, e non seguire i link']])
        ]),
        field('twitter', 'Account Twitter / X', { placeholder: '@nome' }),
        h('label', { class: 'field inline' }, [favChk, h('span', { text: 'Includi le righe per favicon e manifest' })]),
        h('h3', { text: 'Dati strutturati (Google)' }),
        select('ldTipo', 'Tipo', Seo.LD_TIPI.map(function (t) { return [t.id, t.label]; })),
        ldBox
      ]);
      root.appendChild(form);

      function renderLd() {
        ldBox.textContent = '';
        var t = st.v.ldTipo;
        if (t === 'nessuno') return;
        ldBox.appendChild(field('ldNome', 'Nome (se diverso dal titolo)'));
        if (t === 'Organization' || t === 'LocalBusiness') {
          ldBox.appendChild(field('ldLogo', 'Logo (indirizzo completo)'));
          ldBox.appendChild(field('ldTelefono', 'Telefono'));
          ldBox.appendChild(field('ldEmail', 'Email'));
          ldBox.appendChild(field('ldIndirizzo', 'Indirizzo'));
          ldBox.appendChild(field('ldSocial', 'Profili social (uno per riga)', { multiline: true, rows: 3 }));
        }
        if (t === 'Article') ldBox.appendChild(field('ldData', 'Data di pubblicazione', { placeholder: '2026-10-03' }));
        if (t === 'Product') {
          ldBox.appendChild(field('ldPrezzo', 'Prezzo', { placeholder: '39.00' }));
          ldBox.appendChild(field('ldValuta', 'Valuta', { placeholder: 'EUR' }));
        }
      }

      /* ----- risultato ----- */
      var serp = h('div', { class: 'serp', 'aria-label': 'Anteprima su Google' });
      var checksEl = h('ul', { class: 'quality' });
      var headOut = h('pre', { class: 'css-out seo-out', tabindex: '0', 'aria-label': 'Blocco head generato' });
      var copyBtn = h('button', { type: 'button', class: 'btn primary', text: 'Copia il blocco <head>' });
      var copyHtmlBtn = h('button', { type: 'button', class: 'btn small', text: 'Copia <html lang>' });
      var saveFileBtn = h('button', { type: 'button', class: 'btn small', text: 'Salva head.html…' });

      root.appendChild(h('div', { class: 'col-main seo-result' }, [
        h('h3', { text: 'Come appare su Google' }),
        serp,
        h('h3', { text: 'Controlli' }),
        checksEl,
        h('h3', { text: 'Blocco <head>' }),
        h('div', { class: 'btn-row' }, [copyBtn, copyHtmlBtn, saveFileBtn]),
        headOut
      ]));
      root.appendChild(h('div', { class: 'col-editor' }, [
        h('h3', { text: 'Come si usa' }),
        h('p', { class: 'hint', text: 'Compila il modulo, controlla i segnali e copia il blocco dentro <head>. I valori si salvano con «Salva» e restano per la prossima volta.' }),
        h('p', { class: 'hint', text: 'Ogni pagina ha un titolo e una descrizione diversi: cambia questi due campi e copia di nuovo.' }),
        h('p', { class: 'hint', text: 'I file dell\'icona (favicon.ico, icon.svg, apple-touch-icon.png) e site.webmanifest vanno creati a parte; usa la scheda Asset per tenerli.' })
      ]));

      /* ----- calcoli e disegno ----- */

      function isDirty() {
        return JSON.stringify(st.v) !== st.snapshot;
      }

      function updateStatus() {
        var d = isDirty();
        status.textContent = d ? '● Modifiche non salvate' : 'Tutto salvato';
        status.className = 'status' + (d ? ' dirty' : '');
      }

      function trunc(t, n) {
        return t.length > n ? t.slice(0, n - 1).trim() + '…' : t;
      }

      function update() {
        var v = Seo.normalize(st.v);
        serp.textContent = '';
        var host = v.url ? v.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'www.esempio.it';
        serp.appendChild(h('div', { class: 'serp-url', text: (v.nomeSito ? v.nomeSito + ' · ' : '') + host }));
        serp.appendChild(h('div', { class: 'serp-title', text: trunc(v.titolo || 'Titolo della pagina', 60) }));
        serp.appendChild(h('div', { class: 'serp-desc', text: trunc(v.descrizione || 'La descrizione compare qui sotto il titolo.', 160) }));
        checksEl.textContent = '';
        Seo.checks(v).forEach(function (c) {
          checksEl.appendChild(h('li', { class: 'q-' + c.stato }, [
            h('span', { class: 'q-dot', 'aria-hidden': 'true', text: c.stato === 'ok' ? '●' : c.stato === 'avviso' ? '▲' : '■' }),
            h('span', { class: 'sr-only', text: c.stato + ': ' }),
            h('strong', { text: c.titolo }),
            c.dettaglio ? h('small', { text: ' ' + c.dettaglio }) : null
          ]));
        });
        headOut.textContent = Seo.buildHead(v);
        updateStatus();
      }

      function setValues(v) {
        st.v = Seo.normalize(v);
        st.snapshot = JSON.stringify(st.v);
        Object.keys(inputs).forEach(function (k) {
          if (k === 'favicon') inputs[k].checked = st.v[k];
          else inputs[k].value = st.v[k];
        });
        renderLd();
        update();
      }

      function save() {
        return App.run(function () { return window.api.saveSeo(st.v); }).then(function (res) {
          if (!res) return false;
          setValues(res);
          App.toast('Salvato');
          return true;
        });
      }

      function load() {
        return App.run(function () { return window.api.getSeo(); }).then(function (v) { if (v) setValues(v); });
      }

      copyBtn.addEventListener('click', function () { App.copyText(Seo.buildHead(st.v), '<head>'); });
      copyHtmlBtn.addEventListener('click', function () { App.copyText(Seo.htmlTag(st.v), '<html lang>'); });
      saveFileBtn.addEventListener('click', function () {
        App.run(function () { return window.api.saveTextFile('head.html', Seo.buildHead(st.v)); }).then(function (r) {
          if (r && !r.annullato) App.toast('Salvato: ' + r.percorso);
        });
      });
      saveBtn.addEventListener('click', save);
      revertBtn.addEventListener('click', function () {
        if (!isDirty()) { App.toast('Non ci sono modifiche da annullare'); return; }
        load();
      });
      st.v.ldTipo = 'nessuno';
      form.querySelectorAll('select').forEach(function (s) {
        if (s === inputs.ldTipo) s.addEventListener('change', renderLd);
      });

      return {
        el: root,
        show: function () { return isDirty() ? Promise.resolve(update()) : load(); },
        isDirty: isDirty,
        save: save,
        discard: function () { setValues(JSON.parse(st.snapshot || '{}')); },
        reset: function () { setValues({}); },
        state: st
      };
    }
  });
})();
