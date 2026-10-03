/* Scheda «Griglia CSS»: un laboratorio visivo per CSS Grid. Si trascinano le aree, si cambiano colonne, righe, gap e
   place-items, e a destra il CSS si aggiorna in tempo reale. */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var G = window.CatalogoGridLab;
  var HL = window.CatalogoHighlight;
  var h = App.h;

  var PLACE_LABEL = { stretch: 'stretch', start: 'start', end: 'end', center: 'center' };

  /* Evidenzia (classe gl-hl) le righe di grid-template-areas del primo blocco. */
  function paintCss(css) {
    var raw = css.split('\n');
    var colored = HL.highlight(css, 'css').split('\n');
    var inBlock = true;
    return colored.map(function (line, i) {
      if (/^\}/.test(raw[i])) inBlock = false;
      return inBlock && /^\s+"[^"]*";?$/.test(raw[i]) ? '<span class="gl-hl">' + line + '</span>' : line;
    }).join('\n');
  }

  App.defineTab({
    id: 'griglia-css',
    label: 'Griglia CSS',
    create: function () {
      var st = { view: 'draw', w: 1024, s: G.fromPreset('holy-grail'), tracks: true, lang: 'css', base: true, stack: true, drag: null, over: null };

      var root = h('section', {
        class: 'tab-body gridlab',
        role: 'tabpanel',
        id: 'panel-griglia-css',
        'aria-label': 'Griglia CSS',
        hidden: true
      });

      /* ----- sinistra: preset, area di lavoro, controlli ----- */
      var presetRow = h('div', { class: 'btn-row gl-presets', role: 'group', 'aria-label': 'Layout di partenza' });
      var presetBtns = G.PRESETS.map(function (p) {
        var b = h('button', {
          type: 'button',
          class: 'btn small',
          title: p.descr,
          text: p.nome,
          onclick: function () { st.s = G.fromPreset(p.id); renderAll(); }
        });
        b.dataset.preset = p.id;
        presetRow.appendChild(b);
        return b;
      });

      var descr = h('p', { class: 'hint gl-descr' });
      var canvas = h('div', { class: 'gl-canvas', 'aria-label': 'Area di lavoro della griglia' });
      var viewDraw = h('button', { type: 'button', class: 'btn small', text: 'Disegna' });
      var viewResp = h('button', { type: 'button', class: 'btn small', text: 'Anteprima responsive' });
      var frame = h('iframe', { class: 'gl-frame', title: 'Anteprima responsive del layout', sandbox: '' });
      var frameHandle = h('div', { class: 'gl-frame-handle', tabindex: '0', role: 'slider', 'aria-label': 'Larghezza dell\'anteprima', 'aria-valuemin': '280', 'aria-valuemax': '1440' });
      var frameWrap = h('div', { class: 'gl-frame-wrap' }, [frame, frameHandle]);
      var wRange = h('input', { type: 'range', min: '280', max: '1440', step: '1', 'aria-label': 'Larghezza in pixel' });
      var wOut = h('output', { class: 'gl-val gl-wout', role: 'status' });
      var wBtns = h('div', { class: 'btn-row gl-widths', role: 'group', 'aria-label': 'Larghezze' });
      var respBox = h('div', { class: 'gl-resp', hidden: true }, [
        h('div', { class: 'btn-row' }, [wBtns, wRange, wOut]),
        h('div', { class: 'gl-frame-area' }, [frameWrap]),
        h('p', { class: 'hint', text: 'Trascina il bordo destro (o usa lo slider) per ridurre la finestra: sotto i 768 px il layout va su una colonna, se l\'opzione è attiva.' })
      ]);
      var status = h('p', { class: 'hint gl-status', role: 'status', 'aria-live': 'polite' });
      var trackBox = h('div', { class: 'gl-tracks' });
      var colGap = h('input', { type: 'range', min: '0', max: '48', step: '1', 'aria-label': 'column-gap' });
      var rowGap = h('input', { type: 'range', min: '0', max: '48', step: '1', 'aria-label': 'row-gap' });
      var colGapOut = h('output', { class: 'gl-val' });
      var rowGapOut = h('output', { class: 'gl-val' });
      var placeBox = h('div', { class: 'gl-place', role: 'group', 'aria-label': 'place-items' });
      var showTracks = h('input', { type: 'checkbox', checked: true });
      var missing = h('div', { class: 'btn-row gl-missing' });

      root.appendChild(
        h('div', { class: 'col-main gl-left' }, [
          h('div', { class: 'toolbar' }, [h('h2', { class: 'group-title', text: 'Griglia CSS' })]),
          presetRow,
          descr,
          h('div', { class: 'btn-row gl-views', role: 'group', 'aria-label': 'Vista' }, [viewDraw, viewResp]),
          canvas,
          respBox,
          status,
          missing,
          trackBox,
          h('div', { class: 'gl-ctl-row' }, [
            h('label', null, ['column-gap ', colGap, ' ', colGapOut]),
            h('label', null, ['row-gap ', rowGap, ' ', rowGapOut])
          ]),
          h('div', { class: 'gl-ctl-row' }, [h('strong', { text: 'place-items ' }), placeBox]),
          h('label', { class: 'gl-ctl-row' }, [showTracks, ' Mostra le tracce'])
        ])
      );

      /* ----- destra: codice ----- */
      var langCss = h('button', { type: 'button', class: 'btn small', text: 'CSS' });
      var langHtml = h('button', { type: 'button', class: 'btn small', text: 'HTML' });
      var optBase = h('input', { type: 'checkbox', checked: true });
      var optStack = h('input', { type: 'checkbox', checked: true });
      var pre = h('pre', { class: 'gl-code', tabindex: '0', 'aria-label': 'Codice generato' });
      var fileName = h('span', { class: 'gl-file', text: 'layout.css' });
      var copyBtn = h('button', { type: 'button', class: 'btn small primary', text: 'Copia' });
      var saveBtn = h('button', { type: 'button', class: 'btn small', text: 'Salva come struttura…' });
      root.appendChild(
        h('div', { class: 'col-side gl-right' }, [
          h('div', { class: 'toolbar' }, [langCss, langHtml, fileName]),
          pre,
          h('label', { class: 'gl-opt' }, [optBase, ' Stile di base (bordi, spazi)']),
          h('label', { class: 'gl-opt' }, [optStack, ' Una colonna sotto i 768 px']),
          h('div', { class: 'btn-row' }, [copyBtn, saveBtn])
        ])
      );

      /* ----- logica di disegno ----- */
      function opts() { return { cls: 'layout', base: st.base, stack: st.stack }; }
      function cssText() { return G.buildCss(st.s, opts()); }
      function htmlText() { return G.buildHtml(st.s, { cls: 'layout' }); }
      function say(t) { status.textContent = t || ''; }

      function applyGrid() {
        var s = st.s;
        canvas.style.gridTemplateColumns = s.cols.join(' ');
        canvas.style.gridTemplateRows = s.rows.join(' ');
        canvas.style.columnGap = s.colGap + 'px';
        canvas.style.rowGap = s.rowGap + 'px';
        canvas.style.placeItems = s.place;
        canvas.classList.toggle('show-tracks', st.tracks);
      }

      function renderCanvas() {
        canvas.textContent = '';
        applyGrid();
        var s = st.s;
        /* celle di fondo: servono a mostrare le tracce e a sapere dove si lascia un'area */
        for (var r = 0; r < s.rows.length; r++) {
          for (var c = 0; c < s.cols.length; c++) {
            var cell = h('div', { class: 'gl-cell', 'aria-hidden': 'true' });
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.style.gridRow = (r + 1) + '';
            cell.style.gridColumn = (c + 1) + '';
            cell.style.placeSelf = 'stretch';
            canvas.appendChild(cell);
          }
        }
        G.placed(s).forEach(function (id) {
          var def = G.AREAS.filter(function (a) { return a.id === id; })[0];
          var rc = G.rectOf(s.areas, id);
          var box = h('div', {
            class: 'gl-box gl-' + id,
            tabindex: '0',
            role: 'group',
            'aria-label': def.label + ': frecce per spostare, Maiusc+frecce per allargare'
          }, [
            h('span', { class: 'gl-name', text: def.label }),
            h('span', { class: 'gl-handle', title: 'Trascina per allargare o restringere', 'aria-hidden': 'true' })
          ]);
          box.dataset.area = id;
          box.style.gridArea = (rc.r1 + 1) + ' / ' + (rc.c1 + 1) + ' / ' + (rc.r2 + 2) + ' / ' + (rc.c2 + 2);
          box.addEventListener('pointerdown', onDown);
          box.addEventListener('keydown', onKey);
          canvas.appendChild(box);
        });
      }

      function renderTracks() {
        trackBox.textContent = '';
        [['cols', 'grid-template-columns'], ['rows', 'grid-template-rows']].forEach(function (ax) {
          var axis = ax[0];
          var line = h('div', { class: 'gl-track-line' }, [h('strong', { text: ax[1] })]);
          st.s[axis].forEach(function (v, i) {
            var inp = h('input', { type: 'text', value: v, class: 'gl-chip', size: '6', 'aria-label': ax[1] + ' ' + (i + 1) });
            inp.addEventListener('change', function () {
              var n = G.setTrack(st.s, axis, i, inp.value);
              if (n) { st.s = n; say(''); } else say('Valore non valido: usa per esempio 1fr, 200px, auto o minmax(100px, 1fr).');
              renderAll();
            });
            line.appendChild(inp);
          });
          line.appendChild(h('button', {
            type: 'button', class: 'btn small', text: '−', 'aria-label': 'Togli ' + (axis === 'cols' ? 'una colonna' : 'una riga'),
            onclick: function () {
              var r = G.removeTrack(st.s, axis);
              if (!r) return say('Ne serve almeno una.');
              st.s = r.state;
              say(r.tolte.length ? 'Aree tolte dalla griglia: ' + r.tolte.join(', ') + '. Rimettile coi pulsanti qui sotto.' : '');
              renderAll();
            }
          }));
          line.appendChild(h('button', {
            type: 'button', class: 'btn small', text: '+', 'aria-label': 'Aggiungi ' + (axis === 'cols' ? 'una colonna' : 'una riga'),
            onclick: function () {
              var n = G.addTrack(st.s, axis);
              if (!n) return say('Massimo 8.');
              st.s = n;
              say('');
              renderAll();
            }
          }));
          trackBox.appendChild(line);
        });
      }

      function renderMissing() {
        missing.textContent = '';
        G.unplaced(st.s).forEach(function (id) {
          missing.appendChild(h('button', {
            type: 'button', class: 'btn small', text: '+ ' + id,
            onclick: function () {
              var n = G.place(st.s, id);
              if (!n) return say('Non c\'è una cella libera: aggiungi una riga o una colonna.');
              st.s = n;
              say('');
              renderAll();
            }
          }));
        });
      }

      function renderCode() {
        var css = st.lang === 'css';
        fileName.textContent = css ? 'layout.css' : 'layout.html';
        langCss.setAttribute('aria-pressed', css ? 'true' : 'false');
        langHtml.setAttribute('aria-pressed', css ? 'false' : 'true');
        pre.innerHTML = css ? paintCss(cssText()) : HL.highlight(htmlText(), 'html');
        renderFrame();
      }

      function renderControls() {
        colGap.value = st.s.colGap;
        rowGap.value = st.s.rowGap;
        colGapOut.textContent = st.s.colGap + 'px';
        rowGapOut.textContent = st.s.rowGap + 'px';
        placeBox.textContent = '';
        G.PLACE.forEach(function (p) {
          placeBox.appendChild(h('button', {
            type: 'button', class: 'btn small', text: PLACE_LABEL[p], 'aria-pressed': st.s.place === p ? 'true' : 'false',
            onclick: function () { st.s.place = p; renderAll(); }
          }));
        });
        presetBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.preset === st.s.preset ? 'true' : 'false'); });
        var p = G.PRESETS.filter(function (x) { return x.id === st.s.preset; })[0];
        descr.textContent = p ? p.descr : 'Layout personalizzato.';
      }

      var COLORS = { header: '#9ec5fe', nav: '#a3e0b5', main: '#cdb4f6', aside: '#ffe08a', footer: '#f5a3b0' };
      function frameDoc() {
        var colors = Object.keys(COLORS).map(function (k) { return '.layout > .' + k + ' { background: ' + COLORS[k] + '; color: #111111; border-color: #111111; font-weight: 700; }'; }).join('\n');
        return '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>' +
          'body{margin:0;padding:12px;font:14px system-ui,sans-serif;box-sizing:border-box}.layout{min-height:300px}\n' +
          cssText() + colors + '</style></head><body>' + htmlText() + '</body></html>';
      }
      function scaleFor(w) {
        var avail = frameWrap.parentNode.clientWidth;
        return avail > 0 && w > avail - 14 ? (avail - 14) / w : 1;
      }
      function renderFrame() {
        if (st.view !== 'resp') return;
        var w = st.w, k = scaleFor(w);
        frame.style.width = w + 'px';
        frame.style.transform = k < 1 ? 'scale(' + k + ')' : '';
        frameWrap.style.width = Math.round(w * k) + 'px';
        frameWrap.style.height = Math.round(frame.offsetHeight ? frame.offsetHeight * k : 360 * k) + 'px';
        frame.setAttribute('srcdoc', frameDoc());
        wRange.value = w;
        frameHandle.setAttribute('aria-valuenow', w);
        wOut.textContent = w + ' px · ' + (w < 768 && st.stack ? 'una colonna' : 'layout a griglia');
        Array.prototype.forEach.call(wBtns.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.w) === String(w) ? 'true' : 'false'); });
      }
      function renderView() {
        var resp = st.view === 'resp';
        canvas.hidden = resp;
        respBox.hidden = !resp;
        viewDraw.setAttribute('aria-pressed', resp ? 'false' : 'true');
        viewResp.setAttribute('aria-pressed', resp ? 'true' : 'false');
        renderFrame();
      }
      [375, 768, 1024, 1280].forEach(function (w) {
        var b = h('button', { type: 'button', class: 'btn small', text: String(w), onclick: function () { st.w = w; renderFrame(); } });
        b.dataset.w = w;
        wBtns.appendChild(b);
      });
      function setW(v) { st.w = Math.max(280, Math.min(1440, Math.round(v))); renderFrame(); }
      wRange.addEventListener('input', function () { setW(parseInt(wRange.value, 10)); });
      viewDraw.addEventListener('click', function () { st.view = 'draw'; renderView(); });
      viewResp.addEventListener('click', function () { st.view = 'resp'; renderView(); });
      frameHandle.addEventListener('keydown', function (e) {
        var d = { ArrowLeft: -10, ArrowRight: 10 }[e.key];
        if (d) { e.preventDefault(); setW(st.w + (e.shiftKey ? d * 5 : d)); }
      });
      frameHandle.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        try { frameHandle.setPointerCapture(e.pointerId); } catch (x) { /* non fa nulla */ }
        var k = scaleFor(st.w), left = frameWrap.getBoundingClientRect().left;
        frameWrap.classList.add('dragging');
        function mv(ev) { setW((ev.clientX - left) / k); }
        function up() {
          frameWrap.classList.remove('dragging');
          frameHandle.removeEventListener('pointermove', mv);
          frameHandle.removeEventListener('pointerup', up);
          frameHandle.removeEventListener('pointercancel', up);
        }
        frameHandle.addEventListener('pointermove', mv);
        frameHandle.addEventListener('pointerup', up);
        frameHandle.addEventListener('pointercancel', up);
      });
      window.addEventListener('resize', App.debounce(renderFrame, 120));

      function renderAll() {
        renderControls();
        renderTracks();
        renderCanvas();
        renderMissing();
        renderCode();
        renderView();
      }

      /* ----- trascinamento ----- */
      function sums(list, gap) {
        var out = [], pos = 0;
        list.forEach(function (w) { out.push([pos, pos + w]); pos += w + gap; });
        return out;
      }
      function px(v) { return String(v).split(' ').map(parseFloat).filter(function (n) { return !isNaN(n); }); }

      /* Cella sotto il puntatore, in base alle misure vere calcolate dal browser. */
      function cellAt(e) {
        var box = canvas.getBoundingClientRect();
        var cs = getComputedStyle(canvas);
        var cols = sums(px(cs.gridTemplateColumns), st.s.colGap);
        var rows = sums(px(cs.gridTemplateRows), st.s.rowGap);
        var x = e.clientX - box.left - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.borderLeftWidth) || 0);
        var y = e.clientY - box.top - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.borderTopWidth) || 0);
        function find(list, v) {
          if (!list.length) return -1;
          for (var i = 0; i < list.length; i++) {
            var next = list[i + 1];
            if (v <= (next ? (list[i][1] + next[0]) / 2 : Infinity)) return i;
          }
          return list.length - 1;
        }
        return { r: Math.max(0, find(rows, y)), c: Math.max(0, find(cols, x)) };
      }

      function onDown(e) {
        if (e.button != null && e.button !== 0) return;
        var box = e.currentTarget;
        var handle = e.target.classList && e.target.classList.contains('gl-handle');
        st.drag = { id: box.dataset.area, mode: handle ? 'resize' : 'move', box: box };
        box.classList.add('dragging');
        box.focus();
        try { box.setPointerCapture(e.pointerId); } catch (x) { /* non fa nulla */ }
        box.addEventListener('pointermove', onMove);
        box.addEventListener('pointerup', onUp);
        box.addEventListener('pointercancel', onCancel);
        e.preventDefault();
      }
      function clearOver() {
        Array.prototype.forEach.call(canvas.querySelectorAll('.drop'), function (n) { n.classList.remove('drop'); });
      }
      function targetBoxAt(cell) {
        var n = st.s.areas[cell.r] && st.s.areas[cell.r][cell.c];
        return n && n !== '.' ? n : null;
      }
      function onMove(e) {
        var d = st.drag;
        if (!d) return;
        var cell = cellAt(e);
        clearOver();
        if (d.mode === 'move') {
          var t = targetBoxAt(cell);
          var el = t && t !== d.id ? canvas.querySelector('.gl-box[data-area="' + t + '"]') :
            canvas.querySelector('.gl-cell[data-r="' + cell.r + '"][data-c="' + cell.c + '"]');
          if (el) el.classList.add('drop');
        }
        d.cell = cell;
      }
      function endDrag() {
        var d = st.drag;
        if (!d) return null;
        d.box.removeEventListener('pointermove', onMove);
        d.box.removeEventListener('pointerup', onUp);
        d.box.removeEventListener('pointercancel', onCancel);
        d.box.classList.remove('dragging');
        clearOver();
        st.drag = null;
        return d;
      }
      function onCancel() { endDrag(); }
      function onUp(e) {
        var d = endDrag();
        if (!d) return;
        drop(d.id, d.mode, cellAt(e));
      }

      /* Rilascio: scambia con l'area trovata, oppure sposta nelle celle libere. */
      function drop(id, mode, cell) {
        var n = null;
        if (mode === 'resize') {
          n = G.resizeTo(st.s, id, cell.r, cell.c);
          if (!n) say('Qui non ci sta: le aree non possono sovrapporsi.');
        } else {
          var other = targetBoxAt(cell);
          if (other && other !== id) n = G.swap(st.s, id, other);
          else if (!other) {
            n = G.moveTo(st.s, id, cell.r, cell.c);
            if (!n) say('Qui non ci sta: servono celle libere abbastanza grandi.');
          }
        }
        if (n && n !== st.s) { st.s = n; st.s.preset = 'custom'; say(''); }
        renderAll();
        var again = canvas.querySelector('.gl-box[data-area="' + id + '"]');
        if (again) again.focus();
      }

      function onKey(e) {
        var id = e.currentTarget.dataset.area;
        var dir = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
        if (!dir) return;
        e.preventDefault();
        var n = e.shiftKey ? G.stretch(st.s, id, dir[0], dir[1]) : G.nudge(st.s, id, dir[0], dir[1]);
        if (!n) return say('Non si può andare oltre.');
        if (n !== st.s) { st.s = n; st.s.preset = 'custom'; }
        say('');
        renderAll();
        var again = canvas.querySelector('.gl-box[data-area="' + id + '"]');
        if (again) again.focus();
      }

      /* ----- eventi ----- */
      function gap(axis, out) {
        return function () { st.s[axis] = parseInt(this.value, 10) || 0; out.textContent = st.s[axis] + 'px'; applyGrid(); renderCode(); };
      }
      colGap.addEventListener('input', gap('colGap', colGapOut));
      rowGap.addEventListener('input', gap('rowGap', rowGapOut));
      showTracks.addEventListener('change', function () { st.tracks = showTracks.checked; applyGrid(); });
      langCss.addEventListener('click', function () { st.lang = 'css'; renderCode(); });
      langHtml.addEventListener('click', function () { st.lang = 'html'; renderCode(); });
      optBase.addEventListener('change', function () { st.base = optBase.checked; renderCode(); });
      optStack.addEventListener('change', function () { st.stack = optStack.checked; renderCode(); });
      copyBtn.addEventListener('click', function () {
        App.copyText(st.lang === 'css' ? cssText() : htmlText(), st.lang === 'css' ? 'CSS' : 'HTML');
      });
      saveBtn.addEventListener('click', function () {
        App.askForm({
          title: 'Salva come struttura',
          fields: [{ name: 'nome', label: 'Nome', value: 'Griglia ' + (st.s.preset || 'personalizzata') }],
          okLabel: 'Salva'
        }).then(function (v) {
          if (!v) return null;
          return window.api.save('strutture', null, {
            nome: v.nome,
            descrizione: 'Layout CSS Grid creato nel laboratorio.',
            tag: ['grid', 'layout'],
            html: htmlText(),
            css: cssText(),
            js: ''
          }).then(function () { App.invalidateGlobal(); App.toast('Salvata tra le strutture.'); });
        }).catch(function (err) { App.toast(App.cleanError(err)); });
      });

      renderAll();

      return {
        el: root,
        show: function () { renderAll(); return Promise.resolve(); },
        isDirty: function () { return false; },
        save: function () { return Promise.resolve(true); },
        discard: function () {},
        reset: function () {},
        state: st,
        drop: drop
      };
    }
  });
})();
