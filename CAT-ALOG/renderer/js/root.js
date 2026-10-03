/* Scheda «Root»: variabili :root (colori, font, spaziature…), preset, contrasto, esportazione. */
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

  /* Applica un preset alla bozza: aggiorna i valori delle variabili con lo stesso nome, aggiunge quelle nuove. */
  function mergePreset(data, preset) {
    var byName = {};
    data.gruppi.forEach(function (g) {
      g.variabili.forEach(function (v) { byName[v.nome] = v; });
    });
    var aggiornate = 0;
    var aggiunte = 0;
    preset.gruppi.forEach(function (pg) {
      var target = null;
      pg.variabili.forEach(function (pv) {
        var cur = byName[pv.nome];
        if (cur) {
          if (cur.valore !== pv.valore) {
            cur.valore = pv.valore;
            aggiornate += 1;
          }
          cur.tipo = pv.tipo;
          return;
        }
        if (!target) {
          target = data.gruppi.filter(function (g) { return norm(g.nome) === norm(pg.nome); })[0];
          if (!target) {
            target = { id: S.uid('g'), nome: pg.nome, variabili: [] };
            data.gruppi.push(target);
          }
        }
        var nv = { id: S.uid('v'), nome: pv.nome, valore: pv.valore, tipo: pv.tipo };
        target.variabili.push(nv);
        byName[nv.nome] = nv;
        aggiunte += 1;
      });
    });
    return { aggiornate: aggiornate, aggiunte: aggiunte };
  }

  /* Pagina di esempio che usa le variabili, qualunque nome abbiano. */
  function buildSample(data) {
    var cat = { colori: [], font: [], testo: [], spazi: [], raggi: [], ombre: [] };
    var bg = null;
    var fg = null;
    data.gruppi.forEach(function (g) {
      g.variabili.forEach(function (v) {
        if (S.validaVariabile(v)) return;
        var n = v.nome;
        var val = v.valore.trim();
        var isFont = /["']|sans-serif|(^|[\s,])serif|monospace|system-ui/i.test(val);
        var isLen = /^-?[\d.]+(px|rem|em|vw|vh|ch|%)$/i.test(val) || /^(clamp|calc|min|max)\(/i.test(val);
        if (v.tipo === 'colore' || S.isHexColor(val)) {
          cat.colori.push(n);
          if (!bg && /(^|-)(bg|background)(-|$)/i.test(n)) bg = n;
          if (!fg && /(^|-)(text|fg|foreground)(-|$)/i.test(n) && !/muted/i.test(n)) fg = n;
        } else if (/shadow/i.test(n)) cat.ombre.push(n);
        else if (/radius|rounded/i.test(n)) cat.raggi.push(n);
        else if (isFont) cat.font.push(n);
        else if (isLen && /space|spacing|gap|padding|margin/i.test(n)) cat.spazi.push(n);
        else if (isLen && /text|size|heading|(^|-)h[1-6](-|$)/i.test(n)) cat.testo.push(n);
      });
    });

    var esc = S.escapeHtml;
    var html = [];
    function section(titolo, lista, item) {
      if (!lista.length) return;
      html.push('<h4 class="s-h">' + esc(titolo) + '</h4>');
      html.push('<div class="s-grid">' + lista.map(item).join('') + '</div>');
    }
    section('Colori', cat.colori, function (n) {
      return '<div class="s-item"><span class="s-chip" style="background:var(' + n + ')"></span><code>' + esc(n) + '</code></div>';
    });
    section('Font', cat.font, function (n) {
      return '<div class="s-item s-wide"><div style="font-family:var(' + n + ');font-size:1.5rem">Aa — Prova di testo 0123</div><code>' + esc(n) + '</code></div>';
    });
    section('Dimensioni del testo', cat.testo, function (n) {
      return '<div class="s-item s-wide"><div style="font-size:var(' + n + ');line-height:1.2">Prova di testo</div><code>' + esc(n) + '</code></div>';
    });
    section('Spaziature', cat.spazi, function (n) {
      return '<div class="s-item s-wide"><div class="s-bar" style="width:var(' + n + ')"></div><code>' + esc(n) + '</code></div>';
    });
    section('Raggi', cat.raggi, function (n) {
      return '<div class="s-item"><div class="s-box" style="border-radius:var(' + n + ')"></div><code>' + esc(n) + '</code></div>';
    });
    section('Ombre', cat.ombre, function (n) {
      return '<div class="s-item"><div class="s-box" style="box-shadow:var(' + n + ')"></div><code>' + esc(n) + '</code></div>';
    });
    if (!html.length) html.push('<p>Aggiungi delle variabili: qui compare l\'anteprima.</p>');

    var css = [
      'body{background:' + (bg ? 'var(' + bg + ',#fff)' : '#fff') + ';color:' + (fg ? 'var(' + fg + ',#1b1b19)' : '#1b1b19') + '}',
      '.s-h{margin:1.25rem 0 .5rem;font:600 .75rem system-ui,sans-serif;text-transform:uppercase;letter-spacing:.05em;opacity:.75}',
      '.s-h:first-child{margin-top:0}',
      '.s-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.5rem,1fr));gap:.75rem}',
      '.s-item.s-wide{grid-column:1/-1}',
      '.s-chip{display:block;height:3rem;border:1px solid rgb(0 0 0 / .18);border-radius:6px}',
      '.s-item code{display:block;margin-top:.25rem;font-size:.7rem;overflow-wrap:anywhere}',
      '.s-bar{height:.75rem;max-width:100%;background:currentColor;opacity:.6}',
      '.s-box{width:7rem;height:4rem;background:#fff;border:1px solid rgb(0 0 0 / .12)}'
    ].join('\n');

    return { html: html.join('\n'), css: css };
  }

  App.mergePreset = mergePreset;
  App.buildRootSample = buildSample;

  App.defineTab({
    id: 'root',
    label: 'Root',
    create: function () {
      var st = { data: { gruppi: [] }, snapshot: JSON.stringify({ gruppi: [] }), presets: [], refs: [], showAll: false };

      var root = h('section', {
        class: 'tab-body root',
        role: 'tabpanel',
        id: 'panel-root',
        'aria-label': 'Root',
        hidden: true
      });

      /* ----- colonna variabili ----- */
      var presetSel = h('select', { 'aria-label': 'Preset salvati' });
      var applyBtn = h('button', { type: 'button', class: 'btn small', text: 'Applica' });
      var savePresetBtn = h('button', { type: 'button', class: 'btn small', text: 'Salva come preset…' });
      var delPresetBtn = h('button', { type: 'button', class: 'btn small danger', text: 'Elimina preset' });
      var status = h('span', { class: 'status', role: 'status' });
      var addGroupBtn = h('button', { type: 'button', class: 'btn', text: '+ Gruppo' });
      var revertBtn = h('button', { type: 'button', class: 'btn', text: 'Ripristina' });
      var saveBtn = h('button', { type: 'button', class: 'btn primary', text: 'Salva' });
      var groupsEl = h('div');

      root.appendChild(
        h('div', { class: 'col-main' }, [
          h('div', { class: 'toolbar presets' }, [
            h('span', { class: 'muted', text: 'Preset:' }),
            presetSel,
            applyBtn,
            savePresetBtn,
            delPresetBtn
          ]),
          h('div', { class: 'toolbar' }, [status, h('span', { class: 'spacer' }), addGroupBtn, revertBtn, saveBtn]),
          groupsEl
        ])
      );

      /* ----- colonna anteprima e CSS ----- */
      var contrastEl = h('ul', { class: 'contrast' });
      var contrastNote = h('p', {
        class: 'hint',
        text: 'Testo: minimo 4,5. Colori di accento (bottoni, bordi, icone): minimo 3. Legge solo i colori scritti come #rrggbb.'
      });
      var cssOut = h('pre', { class: 'css-out', tabindex: '0', 'aria-label': 'CSS generato' });
      var copyBtn = h('button', { type: 'button', class: 'btn small', text: 'Copia :root' });
      var downloadBtn = h('button', { type: 'button', class: 'btn small', text: 'Salva root.css…' });
      var tokensBtn = h('button', {
        type: 'button',
        class: 'btn small',
        text: 'Esporta token Figma…',
        title: 'File JSON nel formato del plugin Tokens Studio per Figma'
      });
      var colorToolsBtn = h('button', {
        type: 'button',
        class: 'btn small',
        text: 'Strumenti colore…',
        title: 'Scala 50-900, CMYK approssimato, daltonismo, versione scura'
      });
      var formatsBtn = h('button', {
        type: 'button',
        class: 'btn small',
        text: 'Altri formati…',
        title: 'SCSS, JSON oppure override per Bootstrap 5.3'
      });
      var preview = App.makePreview({ title: 'Anteprima delle variabili', getDoc: sampleDoc });

      root.appendChild(
        h('div', { class: 'col-editor' }, [
          preview.el,
          h('h3', { text: 'Contrasto (soglia AA)' }),
          contrastEl,
          contrastNote,
          h('h3', { text: 'CSS generato' }),
          cssOut,
          h('div', { class: 'btn-row' }, [copyBtn, downloadBtn, tokensBtn, formatsBtn, colorToolsBtn])
        ])
      );

      /* ----- dati ----- */

      function isDirty() {
        return JSON.stringify(st.data) !== st.snapshot;
      }

      function updateStatus() {
        var dirty = isDirty();
        status.textContent = dirty ? '● Modifiche non salvate' : 'Tutto salvato';
        status.className = 'status' + (dirty ? ' dirty' : '');
      }

      function prefix() {
        return (App.config && App.config.prefisso) || 'cat';
      }

      function sampleDoc() {
        var s = buildSample(st.data);
        return S.buildPreviewDoc({ html: s.html, css: s.css, rootCss: S.buildRootCss(st.data) });
      }

      function updateErrors() {
        var counts = {};
        st.data.gruppi.forEach(function (g) {
          g.variabili.forEach(function (v) { counts[v.nome] = (counts[v.nome] || 0) + 1; });
        });
        st.refs.forEach(function (r) {
          var msg = '';
          if (r.touched || st.showAll) {
            msg = S.validaVariabile(r.v) || '';
            if (!msg && counts[r.v.nome] > 1) msg = 'Nome duplicato: ' + r.v.nome;
          }
          r.err.textContent = msg;
        });
      }

      function firstError() {
        var seen = {};
        for (var i = 0; i < st.data.gruppi.length; i += 1) {
          var vars = st.data.gruppi[i].variabili;
          for (var j = 0; j < vars.length; j += 1) {
            var msg = S.validaVariabile(vars[j]);
            if (msg) return msg;
            if (seen[vars[j].nome]) return 'Variabile duplicata: ' + vars[j].nome;
            seen[vars[j].nome] = true;
          }
        }
        return null;
      }

      function updateOutputs() {
        cssOut.textContent = S.buildRootCss(st.data);
        contrastEl.textContent = '';
        var rep = S.contrastReport(st.data);
        if (!rep.length) {
          contrastEl.appendChild(
            h('li', {
              class: 'muted',
              text: 'Servono un colore di testo (nome con «text») e uno di sfondo (nome con «bg» o «surface»), in formato #rrggbb.'
            })
          );
          return;
        }
        rep.forEach(function (r) {
          contrastEl.appendChild(
            h('li', null, [
              h('span', { text: r.primo + ' su ' + r.sfondo }),
              h('span', {
                class: r.ok ? 'ok' : 'ko',
                text: r.rapporto + ':1 · ' + (r.ok ? 'AA ✓' : 'sotto AA ✗') + ' · min ' + r.soglia + (r.tipo === 'testo' ? ' (testo)' : ' (grafica)')
              })
            ])
          );
        });
      }

      var outputSoon = App.debounce(updateOutputs, 120);
      var previewSoon = App.debounce(function () { preview.refresh(); }, 250);

      function onChange() {
        updateStatus();
        updateErrors();
        outputSoon();
        previewSoon();
      }

      function setData(data) {
        st.data = data;
        st.snapshot = JSON.stringify(data);
        st.showAll = false;
        renderGroups();
        updateStatus();
        outputSoon.cancel();
        previewSoon.cancel();
        updateOutputs();
        preview.refresh();
      }

      /* ----- disegno ----- */

      function btn(label, fn, cls) {
        return h('button', { type: 'button', class: 'btn small' + (cls ? ' ' + cls : ''), text: label, onclick: fn });
      }

      function varRow(g, v) {
        var ref = { v: v, touched: false, err: h('small', { class: 'row-error', role: 'alert' }) };
        st.refs.push(ref);

        var name = h('input', {
          type: 'text',
          class: 'var-name',
          value: v.nome,
          placeholder: '--' + prefix() + '-nome',
          spellcheck: 'false',
          'aria-label': 'Nome della variabile'
        });
        var val = h('input', {
          type: 'text',
          class: 'var-text',
          value: v.valore,
          spellcheck: 'false',
          'aria-label': 'Valore della variabile'
        });
        var picker =
          v.tipo === 'colore'
            ? h('input', { type: 'color', value: S.isHexColor(v.valore) ? S.normalizeHex(v.valore) : '#000000', 'aria-label': 'Scegli il colore' })
            : null;

        name.addEventListener('input', function () {
          v.nome = name.value.trim();
          ref.touched = true;
          onChange();
        });
        val.addEventListener('input', function () {
          v.valore = val.value;
          ref.touched = true;
          if (picker && S.isHexColor(val.value)) picker.value = S.normalizeHex(val.value);
          onChange();
        });
        if (picker) {
          picker.addEventListener('input', function () {
            v.valore = picker.value;
            val.value = picker.value;
            ref.touched = true;
            onChange();
          });
        }

        var del = btn('Togli', function () {
          g.variabili = g.variabili.filter(function (x) { return x.id !== v.id; });
          renderGroups();
          onChange();
        }, 'danger');
        del.setAttribute('aria-label', 'Togli la variabile');

        return h('div', null, [
          h('div', { class: 'var-row' }, [name, h('div', { class: 'var-value' }, [picker, val]), del]),
          ref.err
        ]);
      }

      function addVar(g, tipo) {
        var v = { id: S.uid('v'), nome: '--' + prefix() + '-', valore: tipo === 'colore' ? '#000000' : '', tipo: tipo };
        g.variabili.push(v);
        renderGroups();
        onChange();
        var boxes = groupsEl.querySelectorAll('.var-name');
        if (boxes.length) boxes[boxes.length - 1].focus();
      }

      function renameGroup(g) {
        App.askForm({
          title: 'Rinomina il gruppo',
          fields: [{ name: 'nome', label: 'Nome del gruppo', value: g.nome }],
          okLabel: 'Rinomina',
          validate: needName
        }).then(function (v) {
          if (!v) return;
          g.nome = v.nome.trim();
          renderGroups();
          onChange();
        });
      }

      function deleteGroup(g) {
        App.askConfirm({
          title: 'Eliminare il gruppo «' + g.nome + '»?',
          message: 'Escono dall\'elenco il gruppo e le sue ' + g.variabili.length + ' variabili. Diventa definitivo quando premi Salva.',
          okLabel: 'Elimina gruppo',
          danger: true
        }).then(function (yes) {
          if (!yes) return;
          st.data.gruppi = st.data.gruppi.filter(function (x) { return x.id !== g.id; });
          renderGroups();
          onChange();
        });
      }

      function groupBox(g) {
        var rows = h('div');
        g.variabili.forEach(function (v) { rows.appendChild(varRow(g, v)); });
        return h('fieldset', { class: 'var-group' }, [
          h('legend', { text: g.nome }),
          rows,
          h('div', { class: 'group-actions' }, [
            btn('+ Variabile', function () { addVar(g, 'testo'); }),
            btn('+ Colore', function () { addVar(g, 'colore'); }),
            btn('Rinomina gruppo', function () { renameGroup(g); }),
            btn('Elimina gruppo', function () { deleteGroup(g); }, 'danger')
          ])
        ]);
      }

      function renderGroups() {
        groupsEl.textContent = '';
        st.refs = [];
        if (!st.data.gruppi.length) {
          groupsEl.appendChild(h('p', { class: 'empty', text: 'Nessun gruppo. Premi «+ Gruppo» per iniziare.' }));
        }
        st.data.gruppi.forEach(function (g) { groupsEl.appendChild(groupBox(g)); });
        updateErrors();
      }

      function renderPresets() {
        var cur = presetSel.value;
        presetSel.textContent = '';
        presetSel.appendChild(h('option', { value: '', text: st.presets.length ? 'Scegli un preset…' : 'Nessun preset salvato' }));
        st.presets.forEach(function (p) { presetSel.appendChild(h('option', { value: p.id, text: p.nome })); });
        presetSel.value = st.presets.some(function (p) { return p.id === cur; }) ? cur : '';
        applyBtn.disabled = !presetSel.value;
        delPresetBtn.disabled = !presetSel.value;
      }

      /* ----- azioni ----- */

      function refreshPresets() {
        return App.run(function () { return window.api.listPresets(); }).then(function (list) {
          if (list) st.presets = list;
          renderPresets();
        });
      }

      function applyPreset() {
        var id = presetSel.value;
        if (!id) return;
        App.run(function () { return window.api.getPreset(id); }).then(function (p) {
          if (!p) return;
          var r = mergePreset(st.data, p);
          renderGroups();
          onChange();
          App.toast('«' + p.nome + '»: ' + r.aggiornate + ' valori cambiati, ' + r.aggiunte + ' variabili aggiunte. Premi Salva per tenerli.');
        });
      }

      function savePreset() {
        var msg = firstError();
        if (msg) {
          st.showAll = true;
          updateErrors();
          App.toast(msg, true);
          return;
        }
        App.askForm({
          title: 'Salva come preset',
          intro: 'Il preset memorizza tutte le variabili che vedi adesso (anche quelle non ancora salvate).',
          fields: [{ name: 'nome', label: 'Nome del preset', value: '', placeholder: 'Palette autunno' }],
          okLabel: 'Salva preset',
          validate: needName
        })
          .then(function (v) {
            if (!v) return null;
            var exists = st.presets.some(function (p) { return p.id === S.slugify(v.nome); });
            if (!exists) return v;
            return App.askConfirm({
              title: 'Esiste già un preset con questo nome',
              message: 'Lo sovrascrivo con le variabili di adesso?',
              okLabel: 'Sovrascrivi',
              danger: true
            }).then(function (yes) { return yes ? v : null; });
          })
          .then(function (v) {
            if (!v) return;
            return App.run(function () { return window.api.savePreset(v.nome, st.data); }).then(function (p) {
              if (!p) return;
              return refreshPresets().then(function () {
                presetSel.value = p.id;
                renderPresets();
                App.toast('Preset «' + p.nome + '» salvato');
              });
            });
          });
      }

      function deletePreset() {
        var id = presetSel.value;
        if (!id) return;
        var p = st.presets.filter(function (x) { return x.id === id; })[0];
        App.askConfirm({
          title: 'Eliminare il preset «' + (p ? p.nome : id) + '»?',
          message: 'Il file viene spostato in «_cestino», dentro la cartella dei dati.',
          okLabel: 'Sposta nel cestino',
          danger: true
        }).then(function (yes) {
          if (!yes) return;
          return App.run(function () { return window.api.deletePreset(id); }).then(function (r) {
            if (!r) return;
            App.toast('Preset spostato nel cestino');
            return refreshPresets();
          });
        });
      }

      function addGroup() {
        App.askForm({
          title: 'Nuovo gruppo di variabili',
          fields: [{ name: 'nome', label: 'Nome del gruppo', value: '', placeholder: 'Colori' }],
          okLabel: 'Crea',
          validate: needName
        }).then(function (v) {
          if (!v) return;
          st.data.gruppi.push({ id: S.uid('g'), nome: v.nome.trim(), variabili: [] });
          renderGroups();
          onChange();
        });
      }

      function save() {
        var msg = firstError();
        if (msg) {
          st.showAll = true;
          updateErrors();
          App.toast(msg, true);
          return Promise.resolve(false);
        }
        return App.run(function () { return window.api.saveRoot(st.data); }).then(function (res) {
          if (!res) return false;
          setData(res);
          App.invalidateGlobal();
          App.toast('Salvato');
          return true;
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
          message: 'Torno all\'ultima versione salvata delle variabili.',
          okLabel: 'Annulla le modifiche',
          danger: true
        }).then(function (yes) {
          if (yes) discard();
        });
      }

      function exportWith(method, args) {
        var msg = firstError();
        if (msg) {
          st.showAll = true;
          updateErrors();
          App.toast(msg, true);
          return;
        }
        App.run(function () { return window.api[method].apply(null, args); }).then(function (r) {
          if (r && !r.annullato) App.toast('Salvato in: ' + r.percorso);
        });
      }

      /* ----- collegamenti ----- */

      presetSel.addEventListener('change', function () {
        applyBtn.disabled = !presetSel.value;
        delPresetBtn.disabled = !presetSel.value;
      });
      applyBtn.addEventListener('click', applyPreset);
      savePresetBtn.addEventListener('click', savePreset);
      delPresetBtn.addEventListener('click', deletePreset);
      addGroupBtn.addEventListener('click', addGroup);
      saveBtn.addEventListener('click', save);
      revertBtn.addEventListener('click', revert);
      copyBtn.addEventListener('click', function () {
        App.copyText(S.buildRootCss(st.data), ':root');
      });
      downloadBtn.addEventListener('click', function () {
        exportWith('exportCss', ['root', st.data]);
      });
      colorToolsBtn.addEventListener('click', function () {
        var colors = [];
        st.data.gruppi.forEach(function (g) {
          g.variabili.forEach(function (v) {
            if (S.normalizeHex(v.valore) && /^#/.test(v.valore.trim())) colors.push(v);
          });
        });
        if (!colors.length) {
          App.toast('Non ci sono colori scritti come #rrggbb', true);
          return;
        }
        App.modal(function (d, finish) {
          var sel = h('select', { 'aria-label': 'Colore' }, colors.map(function (v, i) {
            return h('option', { value: String(i), text: v.nome + '  ' + v.valore });
          }));
          var body = h('div', { class: 'color-tools' });
          var current = null;

          function sw(hex, label) {
            return h('div', { class: 'sw-cell' }, [
              h('span', { class: 'sw', style: 'background:' + hex }),
              h('small', { class: 'mono', text: label ? label + ' ' + hex : hex })
            ]);
          }

          function render() {
            var v = colors[Number(sel.value)];
            var hex = S.normalizeHex(v.valore);
            current = { v: v, hex: hex };
            body.textContent = '';
            var scale = S.colorScale(hex);
            var cmyk = S.hexToCmyk(hex);
            body.appendChild(h('h3', { text: 'Scala 50–900' }));
            body.appendChild(h('div', { class: 'sw-row' }, scale.map(function (x) { return sw(x.hex, String(x.passo)); })));
            body.appendChild(h('h3', { text: 'CMYK approssimato' }));
            body.appendChild(h('p', { class: 'mono', text: 'C ' + cmyk.c + '  M ' + cmyk.m + '  Y ' + cmyk.y + '  K ' + cmyk.k + '  (solo indicativo: la stampa dipende dal profilo colore)' }));
            body.appendChild(h('h3', { text: 'Come lo vede chi è daltonico' }));
            body.appendChild(h('div', { class: 'sw-row' }, [
              sw(hex, 'normale'),
              sw(S.simulateColorBlind(hex, 'protanopia'), 'protanopia'),
              sw(S.simulateColorBlind(hex, 'deuteranopia'), 'deuteranopia'),
              sw(S.simulateColorBlind(hex, 'tritanopia'), 'tritanopia')
            ]));
            body.appendChild(h('h3', { text: 'Versione scura (luminosità invertita)' }));
            body.appendChild(h('div', { class: 'sw-row' }, [sw(S.darkVariant(hex))]));
          }

          sel.addEventListener('change', render);
          d.appendChild(
            h('div', { class: 'modal-form' }, [
              h('h2', { text: 'Strumenti colore' }),
              h('label', { class: 'field' }, [h('span', { text: 'Colore' }), sel]),
              body,
              h('div', { class: 'modal-actions' }, [
                h('button', { type: 'button', class: 'btn', text: 'Chiudi', onclick: function () { finish(null); } }),
                h('button', {
                  type: 'button',
                  class: 'btn primary',
                  text: 'Aggiungi la scala come variabili',
                  onclick: function () { finish({ idx: Number(sel.value) }); }
                })
              ])
            ])
          );
          render();
        }).then(function (res) {
          if (!res) return;
          var v = colors[res.idx] || colors[0];
          var scale = S.colorScale(S.normalizeHex(v.valore));
          st.data.gruppi.push({
            id: S.uid('g'),
            nome: 'Scala ' + v.nome.replace(/^--[a-z0-9]+-/i, ''),
            variabili: scale.map(function (x) {
              return { id: S.uid('v'), nome: v.nome + '-' + x.passo, valore: x.hex, tipo: 'colore' };
            })
          });
          renderGroups();
          onChange();
          App.toast('Aggiunti 10 passi della scala');
        });
      });
      formatsBtn.addEventListener('click', function () {
        App.askChoice({
          title: 'Esporta le variabili come…',
          message: 'Bootstrap: usa i nomi come --cat-color-primary e --cat-radius-md; le variabili che puntano ad altre (var(…)) vengono saltate.',
          choices: [
            { value: 'cancel', label: 'Annulla' },
            { value: 'json', label: 'JSON' },
            { value: 'scss', label: 'SCSS' },
            { value: 'bootstrap', label: 'Override Bootstrap', kind: 'primary' }
          ]
        }).then(function (f) {
          if (f && f !== 'cancel') exportWith('exportRootFormat', [f, st.data]);
        });
      });
      tokensBtn.addEventListener('click', function () {
        exportWith('exportTokens', [st.data]);
      });

      /* ----- interfaccia della scheda ----- */

      function show() {
        return Promise.all([
          isDirty() ? null : App.run(function () { return window.api.getRoot(); }),
          refreshPresets()
        ]).then(function (r) {
          if (r[0]) setData(r[0]);
          else {
            updateOutputs();
            preview.refresh();
          }
        });
      }

      function reset() {
        setData({ gruppi: [] });
      }

      return { el: root, show: show, isDirty: isDirty, save: save, discard: discard, reset: reset, state: st };
    }
  });
})();
