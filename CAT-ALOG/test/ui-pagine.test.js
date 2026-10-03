'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { boot } = require('./helpers/boot');

test('scheda Pagine: pagina di esempio, anteprima, riordino, aggiunta, salvataggio ed esportazione', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  await H.showTab('pagine');
  const panel = H.tab('pagine');
  await H.waitFor(() => panel.querySelectorAll('.col-list .list-btn').length >= 2, 'pagine di esempio');
  await H.waitFor(() => panel.querySelectorAll('.sec-row').length === 6, 'sezioni caricate');
  await H.waitFor(() => /<style>/.test(panel.querySelector('iframe').srcdoc) && /Hero|Ciao|Costruisci/.test(panel.querySelector('iframe').srcdoc), 'anteprima');
  assert.equal(panel.querySelector('.status').textContent, 'Tutto salvato');

  const names = () => Array.from(panel.querySelectorAll('.sec-name b')).map((b) => b.textContent);
  assert.equal(names()[0], 'Header logo, menu e pulsante');
  H.click(panel.querySelectorAll('.sec-row')[1].querySelector('button[aria-label="Sposta su"]'));
  assert.equal(names()[0], 'Hero con gradiente e badge');
  assert.match(panel.querySelector('.status').textContent, /Modifiche non salvate/);

  H.click(H.button(panel, '+ Aggiungi sezione…'));
  const dlg = await H.dialog();
  await H.waitFor(() => dlg.querySelectorAll('.global-results .list-btn').length > 10, 'elenco sezioni');
  H.type(dlg.querySelector('input[type="search"]'), 'Pagina 404');
  await H.waitFor(() => dlg.querySelectorAll('.global-results .list-btn').length === 1, 'filtro');
  H.click(dlg.querySelector('.global-results .list-btn'));
  await H.noDialog();
  assert.equal(names().length, 7);
  assert.equal(names()[6], 'Pagina 404');

  H.click(panel.querySelectorAll('.sec-row')[6].querySelector('button[aria-label="Togli la sezione"]'));
  assert.equal(names().length, 6);
  H.click(H.button(panel, 'Salva'));
  await H.waitFor(() => panel.querySelector('.status').textContent === 'Tutto salvato', 'salvata');
  const saved = JSON.parse(fs.readFileSync(path.join(H.dataDir, 'pagine', 'pagina-vetrina-esempio', 'pagina.json'), 'utf8'));
  assert.equal(saved.sezioni[0].id, 'hero-con-gradiente-e-badge');

  H.state.folder = path.join(H.dataDir, '..', 'uscita');
  fs.mkdirSync(H.state.folder, { recursive: true });
  H.click(H.button(panel, 'Esporta cartella'));
  await H.waitFor(() => /Esportata in/.test(H.toast()), 'esportata');
  assert.ok(fs.existsSync(path.join(H.state.folder, 'pagina-vetrina-esempio', 'index.html')));

  H.click(H.button(panel, 'Copia HTML'));
  await H.waitFor(() => H.state.clip.some((c) => /<!doctype html>/.test(String(c))), 'copiato');
  assert.deepEqual(H.state.errors, []);
});

test('scheda Pagine: nuova pagina, kit del sito ed eliminazione', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  await H.showTab('pagine');
  const panel = H.tab('pagine');
  await H.waitFor(() => panel.querySelectorAll('.col-list .list-btn').length >= 2, 'pagine');

  H.click(H.button(panel, '+ Nuova'));
  const dlg = await H.dialog();
  H.type(dlg.querySelector('input'), 'Contatti');
  H.click(H.button(dlg, 'Crea'));
  await H.noDialog();
  await H.waitFor(() => fs.existsSync(path.join(H.dataDir, 'pagine', 'contatti', 'pagina.json')), 'creata');
  await H.waitFor(() => /Nessuna sezione/.test(panel.querySelector('.sec-list').textContent), 'pagina vuota');

  H.state.folder = path.join(H.dataDir, '..', 'sito');
  fs.mkdirSync(H.state.folder, { recursive: true });
  H.click(H.button(panel, 'Esporta il sito (kit)…'));
  const k = await H.dialog();
  H.type(k.querySelector('input[type="text"]'), 'Sito Prova');
  H.click(H.button(k, 'Scegli la cartella ed esporta'));
  await H.noDialog();
  await H.waitFor(() => /Sito esportato in/.test(H.toast()), 'kit esportato');
  const out = path.join(H.state.folder, 'sito-prova');
  ['index.html', 'kit.json', 'LEGGIMI.txt', 'css/root.css'].forEach((f) => assert.ok(fs.existsSync(path.join(out, f)), f));
  assert.equal(JSON.parse(fs.readFileSync(path.join(H.dataDir, 'kit', 'kit.json'), 'utf8')).nome, 'Sito Prova');

  H.click(H.button(panel, 'Elimina'));
  const d2 = await H.dialog();
  H.click(H.button(d2, 'Elimina'));
  await H.noDialog();
  await H.waitFor(() => !fs.existsSync(path.join(H.dataDir, 'pagine', 'contatti')), 'eliminata');
  assert.deepEqual(H.state.errors, []);
});
