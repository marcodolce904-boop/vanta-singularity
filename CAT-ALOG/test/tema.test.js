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
