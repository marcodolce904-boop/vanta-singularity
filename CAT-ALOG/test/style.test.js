'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const S = require('../lib/shared');

const css = fs.readFileSync(path.join(__dirname, '..', 'renderer', 'style.css'), 'utf8');

function block(re) {
  const m = re.exec(css);
  assert.ok(m, 'blocco non trovato: ' + re);
  return m[1];
}

function vars(text) {
  const out = {};
  const re = /--ui-([a-z-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g;
  let m;
  while ((m = re.exec(text))) out[m[1]] = m[2];
  return out;
}

const light = vars(block(/:root\s*\{([^}]*)\}/));
const dark = Object.assign({}, light, vars(block(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root\s*\{([^}]*)\}/)));

/* coppie testo / sfondo usate nell'interfaccia (soglia AA per il testo: 4,5) */
const PAIRS = [
  ['text', 'bg'],
  ['text', 'panel'],
  ['muted', 'bg'],
  ['muted', 'panel'],
  ['muted', 'code-bg'],
  ['text', 'code-bg'],
  ['text', 'accent-soft'],
  ['accent', 'bg'],
  ['accent', 'panel'],
  ['accent-fg', 'accent'],
  ['danger-text', 'bg'],
  ['danger-text', 'panel'],
  ['danger-fg', 'danger-bg'],
  ['bg', 'text']
];

[['chiaro', light], ['scuro', dark]].forEach(([nome, t]) => {
  test('contrasto AA nel tema ' + nome, () => {
    PAIRS.forEach(([a, b]) => {
      assert.ok(t[a] && t[b], 'variabile mancante: ' + a + ' o ' + b);
      const r = S.contrastRatio(t[a], t[b]);
      assert.ok(r >= 4.5, nome + ': ' + a + ' su ' + b + ' = ' + r.toFixed(2));
    });
  });
});

test('il tema scuro ridefinisce tutti i colori del tema chiaro che servono', () => {
  ['bg', 'panel', 'border', 'text', 'muted', 'accent', 'accent-fg', 'accent-soft', 'danger-text', 'danger-bg', 'danger-fg', 'code-bg'].forEach((k) => {
    assert.ok(light[k], 'manca nel chiaro: ' + k);
  });
  const soloScuro = vars(block(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root\s*\{([^}]*)\}/));
  assert.deepEqual(Object.keys(soloScuro).sort(), Object.keys(light).filter((k) => k !== 'radius' && k !== 'mono').sort());
});

test('rispetta le animazioni ridotte e mostra il focus', () => {
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /:focus-visible/);
});
