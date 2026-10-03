'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const S = require('../lib/shared');
const { boot } = require('./helpers/boot');

const css = fs.readFileSync(path.join(__dirname, '..', 'renderer', 'style.css'), 'utf8');

function vars(block) {
  const o = {};
  block.replace(/--([a-z-]+):\s*([^;]+);/g, (_, k, v) => { o[k] = v.trim(); return _; });
  return o;
}

function themeVars(selector) {
  const i = css.indexOf(selector + ' {');
  assert.ok(i >= 0, selector);
  return vars(css.slice(i, css.indexOf('}', i)));
}

const hex = (v) => S.normalizeHex(v);

test('temi: i colori rispettano il contrasto AA (4,5:1 per il testo, 3:1 per i bordi attivi)', () => {
  const temi = {
    classico: themeVars(':root'),
    gatti: themeVars(':root[data-theme="gatti"]'),
    'gatti-scuro': themeVars(':root[data-theme="gatti-scuro"]')
  };
  Object.keys(temi).forEach((nome) => {
    const t = temi[nome];
    const r = (a, b) => S.contrastRatio(hex(t[a]), hex(t[b]));
    assert.ok(r('ui-text', 'ui-bg') >= 4.5, nome + ' testo/sfondo ' + r('ui-text', 'ui-bg'));
    assert.ok(r('ui-text', 'ui-panel') >= 4.5, nome + ' testo/pannello');
    assert.ok(r('ui-muted', 'ui-bg') >= 4.5, nome + ' testo attenuato/sfondo ' + r('ui-muted', 'ui-bg'));
    assert.ok(r('ui-muted', 'ui-code-bg') >= 4.5, nome + ' testo attenuato/codice ' + r('ui-muted', 'ui-code-bg'));
    assert.ok(r('ui-accent-fg', 'ui-accent') >= 4.5, nome + ' testo del pulsante ' + r('ui-accent-fg', 'ui-accent'));
    assert.ok(r('ui-accent', 'ui-bg') >= 3, nome + ' accento/sfondo ' + r('ui-accent', 'ui-bg'));
    assert.ok(r('ui-danger-text', 'ui-bg') >= 4.5, nome + ' errore/sfondo ' + r('ui-danger-text', 'ui-bg'));
    assert.ok(r('ui-danger-fg', 'ui-danger-bg') >= 4.5, nome + ' pulsante elimina');
    assert.ok(r('ui-warn', 'ui-bg') >= 4.5, nome + ' avviso/sfondo');
    assert.ok(r('ui-text', 'ui-accent-soft') >= 4.5, nome + ' testo/accento chiaro');
  });
  ['hl-comment', 'hl-string', 'hl-keyword', 'hl-number', 'hl-prop', 'hl-tag', 'hl-fn'].forEach((k) => {
    ['gatti', 'gatti-scuro'].forEach((nome) => {
      assert.ok(S.contrastRatio(hex(temi[nome][k]), hex(temi[nome]['ui-panel'])) >= 4.5, nome + ' ' + k);
    });
  });
});

test('tema: il selettore in Impostazioni cambia l\'aspetto senza memoria locale', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const root = H.d.documentElement;
  H.click(H.d.getElementById('btn-settings'));
  const dlg = await H.dialog();
  const sel = dlg.querySelector('select[aria-label="Aspetto dell\'app"]');
  assert.equal(sel.value, 'classico');
  sel.value = 'gatti';
  sel.dispatchEvent(new H.w.Event('change', { bubbles: true }));
  assert.equal(root.getAttribute('data-theme'), 'gatti');
  sel.value = 'gatti-scuro';
  sel.dispatchEvent(new H.w.Event('change', { bubbles: true }));
  assert.equal(root.getAttribute('data-theme'), 'gatti-scuro');
  sel.value = 'inventato';
  sel.dispatchEvent(new H.w.Event('change', { bubbles: true }));
  assert.equal(root.getAttribute('data-theme'), 'classico', 'valori sconosciuti tornano al classico');
  assert.ok(H.d.getElementById('brand-logo').getAttribute('src').endsWith('maneki-neko-statico.svg'));
  assert.deepEqual(H.state.errors, []);
});

test('titolo: Montserrat Black è inclusa nell\'app e usata dal titolo', () => {
  const root = path.join(__dirname, '..', 'renderer');
  ['montserrat-latin-900-normal.woff2', 'montserrat-latin-ext-900-normal.woff2', 'LICENSE-Montserrat-OFL.txt'].forEach((f) => {
    assert.ok(fs.statSync(path.join(root, 'fonts', f)).size > 1000, f);
  });
  const head = fs.readFileSync(path.join(root, 'fonts', 'montserrat-latin-900-normal.woff2')).slice(0, 4).toString('latin1');
  assert.equal(head, 'wOF2', 'è un vero file woff2');
  assert.match(css, /font-family: "Montserrat";[\s\S]*?font-weight: 900;[\s\S]*?fonts\/montserrat-latin-900-normal\.woff2/);
  assert.match(css, /\.brand \{[^}]*font-family: "Montserrat"[^}]*font-weight: 900/);
  assert.match(css, /grid-template-areas:\s*"\. brand actions"\s*"tabs tabs tabs"/);
});

test('palette neutra degli esempi: contrasto alto e nessun verde rimasto', () => {
  const seed = require('../lib/seed');
  const lib = require('../lib/libreria');
  const vars = {};
  seed.root.gruppi.forEach((g) => g.variabili.forEach((v) => { vars[v.nome] = v.valore; }));
  const r = (a, b) => S.contrastRatio(a, b);
  const bg = vars['--cat-color-bg'];
  const surface = vars['--cat-color-surface'];
  assert.ok(r(vars['--cat-color-text'], bg) >= 12, 'testo/sfondo ' + r(vars['--cat-color-text'], bg));
  assert.ok(r(vars['--cat-color-text-muted'], bg) >= 7, 'testo attenuato/sfondo ' + r(vars['--cat-color-text-muted'], bg));
  assert.ok(r('#ffffff', vars['--cat-color-primary']) >= 12, 'testo sul pulsante primario');
  assert.ok(r('#ffffff', vars['--cat-color-secondary']) >= 7, 'testo sul pulsante secondario');
  assert.ok(r(vars['--cat-color-border'], surface) >= 3, 'bordi (3:1) ' + r(vars['--cat-color-border'], surface));
  assert.ok(r(vars['--cat-color-accent'], surface) >= 4.5, 'accento (focus)');
  ['success', 'warning', 'error'].forEach((k) => assert.ok(r(vars['--cat-color-' + k], surface) >= 4.5, k));

  /* nessuna traccia della vecchia palette verde negli esempi, nelle strutture, nei componenti */
  const tutto = JSON.stringify([seed, lib]);
  ['#2f6f4e', '#d9d9d2', '#5c5c57', '#d97706', '#4a5568', '#fafaf7', 'rgb(47 111 78'].forEach((old) => assert.ok(!tutto.toLowerCase().includes(old), old));

  /* il convertitore cambia solo i colori identici a quelli di prima */
  assert.equal(S.neutralizeColors('a{color:#2F6F4E;background:rgb(47 111 78 / 0.2);border:1px solid #123456}'), 'a{color:#111111;background:rgb(17 17 17 / 0.2);border:1px solid #123456}');
});

test('palette neutra: «Aggiorna i colori degli esempi» converte Root, classi ed elementi e conserva la cronologia', () => {
  const os = require('os');
  const { createStore } = require('../lib/store');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cat-neutro-'));
  const s = createStore(dir);
  s.init();
  /* simula una cartella dati vecchia: colori verdi dappertutto */
  const root = s.getRoot();
  root.gruppi[0].variabili.forEach((v) => { if (v.nome === '--cat-color-primary') v.valore = '#2f6f4e'; if (v.nome === '--cat-color-border') v.valore = '#d9d9d2'; });
  s.saveRoot(root);
  const el = s.save('componenti', null, { nome: 'Vecchio', html: '<p style="color:#2f6f4e">x</p>', css: '.a { color: #2f6f4e; background: rgb(47 111 78 / 0.1); }', js: '' });
  const r = s.neutralizeSaved();
  assert.ok(r.root >= 2 && r.elementi >= 1, JSON.stringify(r));
  assert.match(s.get('componenti', el.id).css, /color: #111111; background: rgb\(17 17 17 \/ 0\.1\)/);
  assert.match(s.get('componenti', el.id).html, /#111111/);
  assert.equal(s.listVersions('componenti', el.id).length, 1, 'la versione di prima resta');
  assert.match(s.listVersions('componenti', el.id).length ? s.getVersion('componenti', el.id, s.listVersions('componenti', el.id)[0].ver).css : '', /#2f6f4e/);
  assert.deepEqual(s.neutralizeSaved(), { root: 0, classi: 0, elementi: 0 }, 'la seconda volta non c\'è più niente da cambiare');
});

test('palette neutra: i riempimenti diventano più chiari ma l\'interruttore resta ben visibile', () => {
  const old = '.cat-skel { background: var(--cat-color-border, #d9d9d2); }\n.cat-switch__track { position: relative; background: var(--cat-color-border, #d9d9d2); }';
  const nuovo = S.neutralizeColors(old);
  assert.match(nuovo, /\.cat-skel \{ background: var\(--cat-color-placeholder, #e2e2e2\); \}/);
  assert.match(nuovo, /\.cat-switch__track \{ position: relative; background: var\(--cat-color-border, #8f8f8f\); \}/);
  const lib = require('../lib/libreria');
  const sw = lib.componenti.find((c) => c.nome === 'Interruttore (switch)');
  assert.match(sw.css, /cat-switch__track \{[^}]*background: var\(--cat-color-border, #8f8f8f\)/);
});
