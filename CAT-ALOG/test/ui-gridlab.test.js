'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { boot } = require('./helpers/boot');

test('scheda Griglia CSS: preset, tastiera, tracce, gap, place-items e codice', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  await H.showTab('griglia-css');
  const p = H.tab('griglia-css');
  const code = () => p.querySelector('.gl-code').textContent;
  const boxes = () => Array.from(p.querySelectorAll('.gl-box')).map((b) => b.dataset.area);

  assert.equal(p.querySelectorAll('.gl-presets .btn').length, 5);
  assert.deepEqual(boxes().sort(), ['aside', 'footer', 'header', 'main', 'nav']);
  assert.match(code(), /grid-template-columns: 1fr 3fr 1fr;/);
  assert.match(code(), /"header header header"/);
  assert.equal(p.querySelectorAll('.gl-hl').length, 3, 'le righe di grid-template-areas sono evidenziate');
  assert.equal(p.querySelectorAll('.gl-chip').length, 6);

  /* preset */
  H.click(H.button(p, 'Sidebar'));
  assert.match(code(), /"aside header"/);
  assert.match(code(), /grid-template-columns: 1fr 3fr;/);

  /* tastiera: nav scambia con il vicino a destra */
  H.click(H.button(p, 'Holy grail'));
  H.key(p.querySelector('.gl-nav'), 'ArrowRight');
  assert.match(code(), /"main nav aside"/);
  /* Maiusc+freccia restringe/allarga: header non può mangiare nav */
  H.key(p.querySelector('.gl-header'), 'ArrowDown', { shiftKey: true });
  assert.match(p.querySelector('.gl-status').textContent, /Non si può/);

  /* tracce */
  const chip = p.querySelector('.gl-chip');
  H.type(chip, '200px');
  chip.dispatchEvent(new H.w.Event('change', { bubbles: true }));
  assert.match(code(), /grid-template-columns: 200px 3fr 1fr;/);
  const bad = p.querySelector('.gl-chip');
  H.type(bad, 'pippo');
  bad.dispatchEvent(new H.w.Event('change', { bubbles: true }));
  assert.match(p.querySelector('.gl-status').textContent, /non valido/);
  H.click(p.querySelector('[aria-label="Aggiungi una colonna"]'));
  assert.equal(p.querySelectorAll('.gl-chip').length, 7);
  H.click(p.querySelector('[aria-label="Togli una colonna"]'));
  assert.equal(p.querySelectorAll('.gl-chip').length, 6);

  /* gap e place-items */
  const gap = p.querySelector('[aria-label="column-gap"]');
  H.type(gap, '20');
  assert.match(code(), /gap: 12px 20px;/);
  H.click(H.button(p, 'center'));
  assert.match(code(), /place-items: center;/);

  /* HTML e opzioni */
  H.click(H.button(p, 'HTML'));
  assert.match(code(), /<header class="header">/);
  H.click(H.button(p, 'CSS'));
  const base = p.querySelectorAll('.gl-opt input');
  base[1].checked = false;
  base[1].dispatchEvent(new H.w.Event('change', { bubbles: true }));
  assert.ok(!/@media/.test(code()));

  /* copia */
  H.click(H.button(p, 'Copia'));
  await H.waitFor(() => H.state.clip.length, 'copiato');
  assert.match(H.state.clip[H.state.clip.length - 1], /\.layout \{/);

  /* salva come struttura */
  H.click(H.button(p, 'Salva come struttura'));
  await H.fillDialog({ nome: 'Layout prova' }, 'Salva');
  await H.waitFor(() => /Salvata/.test(H.toast()), 'salvata');
  const lista = await H.api.list('strutture');
  assert.ok(lista.some((x) => x.nome === 'Layout prova'));
  assert.deepEqual(H.state.errors, []);
});
