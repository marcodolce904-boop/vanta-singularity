'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { boot } = require('./helpers/boot');

test('scheda Icone: cerca, copia, sprite e pulisci SVG', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  await H.showTab('icone');
  const panel = H.tab('icone');
  assert.ok(panel.querySelectorAll('.icon-tile').length >= 70);
  H.type(panel.querySelector('input[type="search"]'), 'gatto');
  await H.waitFor(() => panel.querySelectorAll('.icon-tile').length >= 1 && panel.querySelectorAll('.icon-tile').length < 5, 'filtro');
  H.click(panel.querySelector('.icon-tile[title="Zampa"], .icon-tile[title="Gatto"]'));
  assert.match(panel.querySelector('.col-editor h3').textContent, /Zampa|Gatto/);
  H.click(H.button(panel, 'Copia SVG'));
  assert.match(String(H.state.clip[H.state.clip.length - 1]), /^<svg viewBox="0 0 24 24"[^>]*stroke="currentColor"/);
  H.click(H.button(panel, 'Copia <use>'));
  assert.match(String(H.state.clip[H.state.clip.length - 1]), /<use href="#icon-(paw|cat)"\/>/);

  H.click(H.button(panel, '+ Aggiungi allo sprite'));
  assert.match(panel.querySelector('.col-list').textContent, /1 icona nello sprite/);
  H.click(H.button(panel, 'Copia sprite'));
  assert.match(String(H.state.clip[H.state.clip.length - 1]), /<symbol id="icon-(paw|cat)"/);
  H.state.saveFile = path.join(H.dataDir, '..', 'sprite-test.svg');
  H.click(H.button(panel, 'Salva sprite.svg…'));
  await H.waitFor(() => fs.existsSync(H.state.saveFile), 'sprite salvato');
  assert.match(fs.readFileSync(H.state.saveFile, 'utf8'), /<symbol /);

  H.click(H.button(panel, 'Pulisci SVG…'));
  const dlg = await H.dialog();
  H.type(dlg.querySelector('textarea'), '<svg width="10" height="10" onload="x()"><script>1</script><path fill="#f00" d="M0 0"/></svg>');
  assert.doesNotMatch(dlg.querySelector('pre').textContent, /script|onload/);
  assert.match(dlg.textContent, /viewBox/);
  H.click(H.button(dlg, 'Copia il risultato'));
  assert.match(String(H.state.clip[H.state.clip.length - 1]), /fill="currentColor"/);
  assert.deepEqual(H.state.errors, []);
});

test('scheda Testi UI: gruppi, copia in due lingue, ricerca ed esporta', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  await H.showTab('testi');
  const panel = H.tab('testi');
  assert.match(panel.querySelector('.group-title').textContent, /Pulsanti e azioni/);
  const first = panel.querySelector('.testo-row');
  const [it, en] = first.querySelectorAll('.testo-lang');
  H.click(it);
  assert.equal(H.state.clip[H.state.clip.length - 1], 'Invia');
  H.click(en);
  assert.equal(H.state.clip[H.state.clip.length - 1], 'Send');

  H.type(panel.querySelector('input[type="search"]'), 'password dimenticata');
  assert.match(panel.querySelector('.group-title').textContent, /Risultati \(1\)/);
  H.type(panel.querySelector('input[type="search"]'), '');

  H.state.saveFile = path.join(H.dataDir, '..', 'en-test.json');
  H.click(H.button(panel, 'Salva en.json…'));
  await H.waitFor(() => fs.existsSync(H.state.saveFile), 'file salvato');
  assert.equal(JSON.parse(fs.readFileSync(H.state.saveFile, 'utf8')).azioni.invia, 'Send');
  assert.deepEqual(H.state.errors, []);
});

test('scheda Head e SEO: compila, controlla, copia e salva sul disco', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  await H.showTab('seo');
  const panel = H.tab('seo');
  assert.equal(panel.querySelector('.status').textContent, 'Tutto salvato');
  assert.match(panel.querySelector('.quality').textContent, /Titolo della pagina/);

  const inputs = panel.querySelectorAll('.seo-form input[type="text"], .seo-form textarea');
  const byLabel = (txt) => Array.from(panel.querySelectorAll('.seo-form label.field')).find((l) => l.textContent.startsWith(txt)).querySelector('input, textarea');
  H.type(byLabel('Titolo della pagina'), 'Studio Rossi · Grafica e siti web a Torino');
  H.type(byLabel('Descrizione'), 'Progettiamo siti veloci e belli per piccole attività: grafica, sviluppo e assistenza, dal primo schizzo alla pubblicazione.');
  H.type(byLabel('Indirizzo della pagina'), 'https://www.esempio.it/');
  assert.ok(inputs.length > 5);
  assert.match(panel.querySelector('.status').textContent, /Modifiche non salvate/);
  assert.match(panel.querySelector('.serp-title').textContent, /Studio Rossi/);
  assert.match(panel.querySelector('.seo-out').textContent, /<title>Studio Rossi/);
  assert.match(panel.querySelector('.seo-out').textContent, /rel="canonical" href="https:\/\/www\.esempio\.it\/"/);

  const ld = panel.querySelector('select[aria-label="Tipo"]');
  ld.value = 'WebSite';
  ld.dispatchEvent(new H.w.Event('change', { bubbles: true }));
  await H.waitFor(() => /application\/ld\+json/.test(panel.querySelector('.seo-out').textContent), 'dati strutturati');

  H.click(H.button(panel, 'Copia il blocco <head>'));
  assert.match(String(H.state.clip[H.state.clip.length - 1]), /<meta charset="utf-8">/);
  H.click(H.button(panel, 'Salva'));
  await H.waitFor(() => panel.querySelector('.status').textContent === 'Tutto salvato', 'salvato');
  const saved = JSON.parse(fs.readFileSync(path.join(H.dataDir, 'seo', 'seo.json'), 'utf8'));
  assert.equal(saved.titolo, 'Studio Rossi · Grafica e siti web a Torino');
  assert.equal(saved.ldTipo, 'WebSite');
  assert.deepEqual(H.state.errors, []);
});
