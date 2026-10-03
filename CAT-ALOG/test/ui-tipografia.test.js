'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const T = require('../lib/typography');
const { boot } = require('./helpers/boot');

test('coppie di font: ids unici, stack e link Google ben formati', () => {
  const ids = T.coppie.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  T.coppie.forEach((c) => {
    assert.ok(c.titoli && c.testo && c.nome, c.id);
    if (c.google) assert.match(c.google, /^https:\/\/fonts\.googleapis\.com\/css2\?family=.+&display=swap$/, c.id);
  });
  assert.ok(T.coppie.some((c) => !c.google), 'ci sono coppie solo di sistema');
});

test('scheda Tipografia: scegliere una coppia, cambiare la scala e scrivere nel Root', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  await H.showTab('tipografia');
  const panel = H.tab('tipografia');
  assert.equal(panel.querySelectorAll('.col-list .list-btn').length, T.coppie.length);
  assert.match(panel.querySelector('.css-out').textContent, /--cat-text-base: clamp\(/);

  H.click(H.find(panel, '.list-btn', 'Baloo 2 + Nunito'));
  await H.waitFor(() => /Baloo 2/.test(panel.querySelector('.css-out').textContent), 'font scelti');
  assert.ok(panel.querySelector('iframe').srcdoc.includes('fonts.googleapis.com'));
  assert.equal(H.button(panel, 'Copia il link dei font').disabled, false);

  H.click(H.find(panel, '.list-btn', 'Sistema moderno'));
  await H.waitFor(() => H.button(panel, 'Copia il link dei font').disabled, 'senza link');

  const minSize = panel.querySelector('input[type="number"]');
  H.type(minSize, '17');
  await H.waitFor(() => /--cat-text-base: clamp\(1\.0625rem/.test(panel.querySelector('.css-out').textContent), 'scala ricalcolata');

  H.click(H.button(panel, 'Copia :root'));
  await H.waitFor(() => /:root \{/.test(String(H.state.clip[H.state.clip.length - 1])), 'copiato');

  H.click(H.button(panel, 'Scrivi nel Root'));
  const dlg = await H.dialog();
  assert.match(dlg.textContent, /nuove vengono aggiunte/);
  H.click(H.button(dlg, 'Scrivi nel Root'));
  await H.noDialog();
  await H.waitFor(() => /Root aggiornato/.test(H.toast()), 'root salvato');
  const rootJson = JSON.parse(fs.readFileSync(path.join(H.dataDir, 'root', 'root.json'), 'utf8'));
  const nomi = [];
  rootJson.gruppi.forEach((g) => g.variabili.forEach((v) => nomi.push(v.nome)));
  assert.ok(nomi.includes('--cat-text-4xl') && nomi.includes('--cat-line-height-heading'));
  assert.equal(new Set(nomi).size, nomi.length);
  assert.match(fs.readFileSync(path.join(H.dataDir, 'root', 'root.css'), 'utf8'), /--cat-text-base: clamp\(1\.0625rem/);
  assert.deepEqual(H.state.errors, []);
});
