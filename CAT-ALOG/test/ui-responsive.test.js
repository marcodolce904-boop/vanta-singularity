'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const R = require('../lib/responsive');
const { boot } = require('./helpers/boot');

test('catalogo responsive: ids unici, soglie e CSS completo', () => {
  const ids = R.lista().map((x) => x.voce.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(R.gruppi.length >= 9);
  assert.equal(R.breakpointFor(575), 'xs');
  assert.equal(R.breakpointFor(576), 'sm');
  assert.equal(R.breakpointFor(1400), 'xxl');
  const css = R.buildCss();
  ['(min-width: 768px)', '(max-width: 767.98px)', '(prefers-reduced-motion: reduce)', '(pointer: coarse)', '@container', 'print'].forEach((s) =>
    assert.ok(css.includes(s), s)
  );
  assert.ok(!css.includes('<meta'), 'le voci HTML non finiscono nel CSS');
  const solo = R.buildCss(['mobile-first']);
  assert.ok(solo.includes('min-width: 992px') && !solo.includes('prefers-color-scheme'));
  R.lista().filter((x) => x.voce.lang === 'css').forEach((x) => {
    assert.equal((x.voce.codice.match(/{/g) || []).length, (x.voce.codice.match(/}/g) || []).length, x.voce.id);
  });
});

test('scheda Responsive: gruppi, copia, ricerca, esporta', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  await H.showTab('responsive');
  const panel = H.tab('responsive');
  assert.equal(panel.querySelectorAll('.col-list .list-btn').length, R.gruppi.length);
  assert.match(panel.querySelector('.group-title').textContent, /Punti di rottura/);
  assert.equal(panel.querySelectorAll('.resp-row').length, R.gruppi[0].voci.length);
  assert.match(panel.querySelector('.resp-live').textContent, /punto di rottura/);

  H.click(panel.querySelector('.resp-row .btn'));
  await H.waitFor(() => H.state.clip && H.state.clip.length, 'copiato');

  H.type(panel.querySelector('input[type="search"]'), 'reduced-motion');
  assert.ok(panel.querySelectorAll('.resp-row').length >= 1);
  assert.match(panel.querySelector('.group-title').textContent, /Risultati/);
  H.type(panel.querySelector('input[type="search"]'), 'zzzz');
  assert.match(panel.querySelector('.rows').textContent, /Nessun risultato/);

  H.type(panel.querySelector('input[type="search"]'), '');
  H.click(H.button(panel, 'Copia il gruppo'));
  await H.waitFor(() => /min-width: 576px/.test(String(H.state.clip[H.state.clip.length - 1] || '')), 'gruppo copiato');

  assert.ok(panel.querySelector('iframe').srcdoc.includes('min-width:768px'));
  assert.ok(H.button(panel, 'iPhone SE 375'));
  H.click(H.button(panel, 'iPhone SE 375'));
  assert.equal(panel.querySelector('iframe').style.width, '375px');
  assert.deepEqual(H.state.errors, []);
});

test('esporta tutto include css/responsive.css', async () => {
  const { createStore } = require('../lib/store');
  const os = require('os');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cat-resp-'));
  const s = createStore(path.join(dir, 'd'));
  s.init();
  const r = s.exportAll(path.join(dir, 'out'));
  assert.match(fs.readFileSync(path.join(r.cartella, 'css', 'responsive.css'), 'utf8'), /@media \(min-width: 576px\)/);
});
