/* Scheda «Icone»: set di icone SVG a tratto (currentColor), frammenti pronti, sprite e pulizia di un SVG incollato. */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var I = window.CatalogoIcone;
  var S = App.S;
  var h = App.h;

  function svgNode(markup) {
    var d = document.createElement('div');
    d.innerHTML = markup;
    return d.firstChild;
  }

  App.defineTab({
    id: 'icone',
    label: 'Icone',
    create: function () {
      var st = { sel: I.icone[0].id, search: '', size: 32, stroke: 2, color: '#1c1c1a', sprite: [] };

      var root = h('section', {
        class: 'tab-body classi icone',
        role: 'tabpanel',
        id: 'panel-icone',
        'aria-label': 'Icone',
        hidden: true
      });

      var search = h('input', { type: 'search', placeholder: 'Cerca (es. freccia, utente)…', 'aria-label': 'Cerca un\'icona' });
      var cleanBtn = h('button', { type: 'button', class: 'btn primary', text: 'Pulisci SVG…' });
      var spriteInfo = h('p', { class: 'hint' });
      var spriteCopy = h('button', { type: 'button', class: 'btn small', text: 'Copia sprite' });
      var spriteSave = h('button', { type: 'button', class: 'btn small', text: 'Salva sprite.svg…' });
      var spriteClear = h('button', { type: 'button', class: 'btn small', text: 'Svuota' });
      root.appendChild(
        h('div', { class: 'col-list' }, [
          h('div', { class: 'list-head' }, [search]),
          h('div', { class: 'btn-row' }, [cleanBtn]),
          h('h3', { text: 'Sprite' }),
          spriteInfo,
          h('div', { class: 'btn-row' }, [spriteCopy, spriteSave, spriteClear]),
          h('p', { class: 'hint', text: 'Uno sprite è un unico file con tante icone: la pagina le richiama con <use>.' })
        ])
      );

      var grid = h('ul', { class: 'icon-grid' });
      root.appendChild(h('div', { class: 'col-main' }, [grid]));

      var detail = h('div', { class: 'icon-detail' });
      root.appendChild(h('div', { class: 'col-editor' }, [detail]));

      function opts() {
        return { size: st.size, stroke: st.stroke };
      }

      function pick() {
        return I.icone.filter(function (x) { return x.id === st.sel; })[0] || I.icone[0];
      }

      function inSprite(id) {
        return st.sprite.indexOf(id) !== -1;
      }

      function renderGrid() {
        var q = S.str(st.search).toLowerCase().trim();
        grid.textContent = '';
        var list = I.icone.filter(function (ic) { return !q || (ic.id + ' ' + ic.nome + ' ' + ic.tag.join(' ')).toLowerCase().indexOf(q) !== -1; });
        if (!list.length) {
          grid.appendChild(h('li', { class: 'empty', text: 'Nessuna icona.' }));
          return;
        }
        list.forEach(function (ic) {
          var btn = h('button', {
            type: 'button',
            class: 'icon-tile',
            title: ic.nome,
            'aria-label': ic.nome,
            'aria-current': ic.id === st.sel ? 'true' : null,
            onclick: function () { st.sel = ic.id; renderGrid(); renderDetail(); }
          });
          btn.appendChild(svgNode(I.svgInline(ic, { size: 26 })));
          btn.appendChild(h('small', { text: ic.id }));
          if (inSprite(ic.id)) btn.classList.add('in-sprite');
          grid.appendChild(h('li', null, [btn]));
        });
      }

      function copyBtn(label, getText, what) {
        return h('button', { type: 'button', class: 'btn small', text: label, onclick: function () { App.copyText(getText(), what || label.replace(/^Copia /, '')); } });
      }

      function renderDetail() {
        var ic = pick();
        detail.textContent = '';
        var stage = h('div', { class: 'icon-stage', style: 'color:' + st.color });
        stage.appendChild(svgNode(I.svgInline(ic, { size: Math.max(st.size, 48), stroke: st.stroke })));
        detail.appendChild(h('h3', { text: ic.nome + ' · ' + ic.id }));
        detail.appendChild(stage);

        function slider(label, key, min, max, step) {
          var out = h('output', { text: String(st[key]) });
          var input = h('input', { type: 'range', min: String(min), max: String(max), step: String(step), value: String(st[key]), 'aria-label': label });
          input.addEventListener('input', function () {
            st[key] = parseFloat(input.value);
            out.textContent = input.value;
            stage.textContent = '';
            stage.appendChild(svgNode(I.svgInline(ic, { size: Math.max(st.size, 48), stroke: st.stroke })));
          });
          return h('label', { class: 'field inline' }, [h('span', { text: label }), input, out]);
        }
        var color = h('input', { type: 'color', value: st.color, 'aria-label': 'Colore di prova' });
        color.addEventListener('input', function () { st.color = color.value; stage.style.color = color.value; });
        detail.appendChild(slider('Dimensione (px)', 'size', 12, 96, 2));
        detail.appendChild(slider('Spessore del tratto', 'stroke', 1, 3, 0.25));
        detail.appendChild(h('label', { class: 'field inline' }, [h('span', { text: 'Colore di prova' }), color]));

        detail.appendChild(h('div', { class: 'group-label', text: 'Copia' }));
        detail.appendChild(h('div', { class: 'btn-row' }, [
          copyBtn('Copia SVG', function () { return I.svgInline(ic, opts()); }),
          copyBtn('Copia SVG con testo alternativo', function () { return I.svgInline(ic, Object.assign({ label: ic.nome }, opts())); }),
          copyBtn('Copia <symbol>', function () { return I.symbol(ic); }),
          copyBtn('Copia <use>', function () { return I.useTag(ic, opts()); }),
          copyBtn('Copia maschera CSS', function () { return I.cssMask(ic, { stroke: st.stroke }); }),
          copyBtn('Copia data URI', function () { return I.dataUri(ic, { stroke: st.stroke }); })
        ]));
        detail.appendChild(h('div', { class: 'group-label', text: 'Sprite' }));
        detail.appendChild(h('div', { class: 'btn-row' }, [
          h('button', {
            type: 'button',
            class: 'btn small',
            text: inSprite(ic.id) ? 'Togli dallo sprite' : '+ Aggiungi allo sprite',
            onclick: function () {
              if (inSprite(ic.id)) st.sprite.splice(st.sprite.indexOf(ic.id), 1);
              else st.sprite.push(ic.id);
              renderAll();
            }
          })
        ]));
        detail.appendChild(h('p', { class: 'hint', text: 'Le icone seguono il colore del testo (currentColor): cambia il colore con la proprietà color del genitore. Se l\'icona ha un significato da sola (non accanto a un testo), usa la versione con testo alternativo.' }));
      }

      function spriteList() {
        return st.sprite.map(function (id) { return I.icone.filter(function (x) { return x.id === id; })[0]; }).filter(Boolean);
      }

      function renderSprite() {
        var n = st.sprite.length;
        spriteInfo.textContent = n ? n + (n === 1 ? ' icona nello sprite' : ' icone nello sprite') + ': ' + st.sprite.join(', ') : 'Nessuna icona. Apri un\'icona e premi «+ Aggiungi allo sprite».';
        spriteCopy.disabled = !n;
        spriteSave.disabled = !n;
        spriteClear.disabled = !n;
      }

      function renderAll() {
        renderGrid();
        renderDetail();
        renderSprite();
      }

      search.addEventListener('input', function () { st.search = search.value; renderGrid(); });
      spriteCopy.addEventListener('click', function () { App.copyText(I.sprite(spriteList(), { stroke: st.stroke }), 'Sprite'); });
      spriteSave.addEventListener('click', function () {
        App.run(function () { return window.api.saveTextFile('sprite.svg', I.sprite(spriteList(), { stroke: st.stroke })); }).then(function (r) {
          if (r && !r.annullato) App.toast('Salvato: ' + r.percorso);
        });
      });
      spriteClear.addEventListener('click', function () { st.sprite = []; renderAll(); });

      cleanBtn.addEventListener('click', function () {
        App.modal(function (d, finish) {
          var input = h('textarea', { rows: 8, spellcheck: 'false', placeholder: '<svg …>…</svg>', 'aria-label': 'SVG da pulire' });
          var size = h('input', { type: 'number', min: '8', max: '512', placeholder: 'vuoto = lascia com\'è', 'aria-label': 'Dimensione' });
          var out = h('pre', { class: 'css-out', tabindex: '0', 'aria-label': 'SVG pulito' });
          var notes = h('ul', { class: 'asset-warnings' });
          var copy = h('button', { type: 'button', class: 'btn primary', text: 'Copia il risultato', disabled: true });
          var current = '';
          function run() {
            var r = I.cleanSvg(input.value, { size: size.value ? parseInt(size.value, 10) : 0 });
            current = r.svg;
            out.textContent = r.svg || '(niente da mostrare)';
            notes.textContent = '';
            r.avvisi.forEach(function (t) { notes.appendChild(h('li', { text: '▲ ' + t })); });
            copy.disabled = !r.svg;
          }
          input.addEventListener('input', run);
          size.addEventListener('input', run);
          copy.addEventListener('click', function () { App.copyText(current, 'SVG pulito'); });
          d.appendChild(
            h('div', { class: 'modal-form' }, [
              h('h2', { text: 'Pulisci un SVG' }),
              h('p', { class: 'muted', text: 'Incolla un SVG (da Figma, Illustrator, un sito…). Tolgo script, gestori di eventi, riferimenti esterni e metadati; i colori fissi diventano currentColor e aggiungo il viewBox se manca.' }),
              input,
              h('label', { class: 'field' }, [h('span', { text: 'Dimensione in pixel (facoltativa)' }), size]),
              notes,
              out,
              h('div', { class: 'modal-actions' }, [
                h('button', { type: 'button', class: 'btn', text: 'Chiudi', onclick: function () { finish(null); } }),
                copy
              ])
            ])
          );
          run();
        });
      });

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
