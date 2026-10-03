'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { boot } = require('./helpers/boot');
const seed = require('../lib/seed');
const lib = require('../lib/libreria');

test('avvio: sette schede, la prima è aperta e mostra il primo elemento', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const { d } = H;

  const tabs = Array.from(d.querySelectorAll('#tabs [role="tab"]'));
  assert.deepEqual(tabs.map((b) => b.textContent), ['Strutture', 'Componenti', 'Animazioni', 'Interazioni', 'Classi', 'Responsive', 'Root']);
  assert.deepEqual(tabs.map((b) => b.getAttribute('aria-selected')), ['true', 'false', 'false', 'false', 'false', 'false', 'false']);
  assert.deepEqual(tabs.map((b) => b.tabIndex), [0, -1, -1, -1, -1, -1, -1]);
  assert.equal(H.tab('strutture').hidden, false);
  assert.equal(H.tab('componenti').hidden, true);
  assert.equal(H.tab('strutture').getAttribute('aria-labelledby'), 'tab-strutture');

  const items = H.tab('strutture').querySelectorAll('.list-btn');
  assert.equal(items.length, (seed.strutture.length + lib.strutture.length));
  const current = H.tab('strutture').querySelector('.list-btn[aria-current="true"]');
  assert.ok(current, 'il primo elemento è già selezionato');
  assert.equal(H.tab('strutture').classList.contains('no-selection'), false);

  const frame = H.tab('strutture').querySelector('iframe');
  assert.equal(frame.getAttribute('sandbox'), 'allow-scripts');
  assert.match(frame.srcdoc, /<!doctype html>/);
  assert.deepEqual(H.state.errors, []);
});

test('le schede si cambiano con clic, frecce e Ctrl+numero', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const { d } = H;
  const selected = () => Array.from(d.querySelectorAll('#tabs [role="tab"]')).filter((b) => b.getAttribute('aria-selected') === 'true').map((b) => b.id);

  await H.showTab('classi');
  assert.deepEqual(selected(), ['tab-classi']);
  assert.equal(H.tab('classi').hidden, false);
  assert.equal(H.tab('strutture').hidden, true);

  H.key(d.getElementById('tabs'), 'ArrowRight');
  await H.waitFor(() => selected()[0] === 'tab-responsive', 'freccia destra');
  H.key(d.getElementById('tabs'), 'ArrowRight');
  await H.waitFor(() => selected()[0] === 'tab-root', 'freccia destra, ancora');
  H.key(d.getElementById('tabs'), 'ArrowRight');
  await H.waitFor(() => selected()[0] === 'tab-strutture', 'giro completo');
  H.key(d.getElementById('tabs'), 'End');
  await H.waitFor(() => selected()[0] === 'tab-root', 'fine');
  H.key(d.getElementById('tabs'), 'Home');
  await H.waitFor(() => selected()[0] === 'tab-strutture', 'inizio');

  H.key(d.body, '2', { ctrlKey: true });
  await H.waitFor(() => selected()[0] === 'tab-componenti', 'Ctrl+2');
  H.key(d.body, '7', { metaKey: true });
  await H.waitFor(() => selected()[0] === 'tab-root', 'Cmd+7');
  H.key(d.body, '9', { ctrlKey: true });
  await H.sleep(50);
  assert.deepEqual(selected(), ['tab-root'], 'un numero senza scheda non fa nulla');
  assert.deepEqual(H.state.errors, []);
});

test('impostazioni: cartella, apri cartella e prefisso con errori dentro la finestra', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const { d } = H;

  H.click(d.getElementById('btn-settings'));
  let dlg = await H.dialog();
  assert.ok(dlg.textContent.includes(H.dataDir));

  H.click(H.button(dlg, 'Apri la cartella'));
  await H.waitFor(() => H.state.opened.length === 1, 'cartella aperta');
  assert.equal(H.state.opened[0], H.dataDir);

  const input = dlg.querySelector('input');
  H.type(input, 'NO-no');
  H.click(H.button(dlg, 'Salva prefisso'));
  await H.waitFor(() => /Prefisso non valido/.test(dlg.textContent), 'errore nella finestra');
  assert.equal(JSON.parse(fs.readFileSync(path.join(H.dataDir, 'catalogo.json'), 'utf8')).prefisso, 'cat');

  H.type(input, 'ab');
  H.click(H.button(dlg, 'Salva prefisso'));
  await H.waitFor(() => /Prefisso salvato: ab/.test(dlg.textContent), 'prefisso salvato');
  assert.equal(JSON.parse(fs.readFileSync(path.join(H.dataDir, 'catalogo.json'), 'utf8')).prefisso, 'ab');
  assert.ok(fs.existsSync(path.join(H.dataDir, 'classi', 'ab-classi.css')));
  assert.equal(H.w.CatalogoApp.config.prefisso, 'ab');

  // scegliere un'altra cartella: l'app ricarica i dati di quella cartella
  const altra = path.join(H.base, 'altra');
  H.state.folder = altra;
  H.click(H.button(dlg, 'Cambia cartella'));
  await H.waitFor(() => /Cartella cambiata/.test(dlg.textContent), 'cartella cambiata');
  assert.equal(H.w.CatalogoApp.config.dataDir, altra);
  assert.ok(fs.existsSync(path.join(altra, 'catalogo.json')));
  H.click(H.button(dlg, 'Chiudi'));
  await H.noDialog();
  await H.settle();
  assert.equal(H.tab('strutture').querySelectorAll('.list-btn').length, (seed.strutture.length + lib.strutture.length));
  assert.deepEqual(H.state.errors, []);
});

test('esporta tutto: chiede conferma se ci sono modifiche e scrive la struttura', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const { d } = H;
  const dest = path.join(H.base, 'export');
  fs.mkdirSync(dest);
  H.state.folder = dest;

  // una modifica non salvata: l'app avvisa che l'esportazione usa solo il salvato
  H.type(H.tab('strutture').querySelector('.col-editor input[type="text"]'), 'Nome cambiato');
  H.click(d.getElementById('btn-export-all'));
  let dlg = await H.dialog();
  assert.match(dlg.textContent, /Strutture/);
  H.click(H.button(dlg, 'Annulla'));
  await H.noDialog();
  assert.deepEqual(fs.readdirSync(dest), []);

  H.click(d.getElementById('btn-export-all'));
  await H.answer('Esporta lo stesso');
  await H.waitFor(() => /Esportato in/.test(H.toast()), 'avviso di fine esportazione');
  const out = fs.readdirSync(dest);
  assert.deepEqual(out, ['catalogo-cat']);
  assert.ok(fs.existsSync(path.join(dest, 'catalogo-cat', 'css', 'root.css')));
  assert.ok(fs.existsSync(path.join(dest, 'catalogo-cat', 'tokens', 'figma-tokens.json')));
  assert.deepEqual(H.state.errors, []);
});
