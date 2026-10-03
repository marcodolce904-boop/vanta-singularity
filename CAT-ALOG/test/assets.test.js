'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const A = require('../lib/assetinfo');
const { createStore } = require('../lib/store');
const { boot } = require('./helpers/boot');

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cat-asset-'));
}

function png(w, h, extra) {
  const b = Buffer.alloc(33 + (extra || 0));
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b;
}

function gif(w, h) {
  const b = Buffer.alloc(13);
  b.write('GIF89a', 0, 'ascii');
  b.writeUInt16LE(w, 6);
  b.writeUInt16LE(h, 8);
  return b;
}

function jpeg(w, h) {
  /* SOI + APP0 finto + SOF0 */
  const app = Buffer.from([0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]);
  const sof = Buffer.from([0xff, 0xc0, 0x00, 0x11, 0x08, h >> 8, h & 255, w >> 8, w & 255, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1]);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), app, sof, Buffer.alloc(8)]);
}

function webpX(w, h) {
  const b = Buffer.alloc(30);
  b.write('RIFF', 0, 'ascii');
  b.write('WEBP', 8, 'ascii');
  b.write('VP8X', 12, 'ascii');
  b.writeUIntLE(w - 1, 24, 3);
  b.writeUIntLE(h - 1, 27, 3);
  return b;
}

test('assetinfo: dimensioni di PNG, GIF, JPEG, WebP, SVG e Lottie', () => {
  assert.deepEqual([A.inspect('a.png', png(640, 360), 100).w, A.inspect('a.png', png(640, 360), 100).h], [640, 360]);
  assert.equal(A.inspect('a.gif', gif(120, 80), 10).w, 120);
  const j = A.inspect('a.jpg', jpeg(1920, 1080), 10);
  assert.deepEqual([j.w, j.h], [1920, 1080]);
  const w = A.inspect('a.webp', webpX(800, 600), 10);
  assert.deepEqual([w.w, w.h], [800, 600]);
  const svg = A.inspect('a.svg', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 48"><path d="M0 0"/></svg>'), 80);
  assert.deepEqual([svg.w, svg.h], [24, 48]);
  const svg2 = A.inspect('b.svg', Buffer.from('<svg width="100px" height="50" viewBox="0 0 10 10"></svg>'), 80);
  assert.deepEqual([svg2.w, svg2.h], [100, 50]);
  const lot = A.inspect('x.json', Buffer.from(JSON.stringify({ v: '5', fr: 30, ip: 0, op: 60, w: 200, h: 100, layers: [{}, {}] })), 80);
  assert.equal(lot.tipo, 'lottie');
  assert.match(lot.info, /30 fps · 2 s · 2 livelli/);
  assert.equal(A.inspect('a.xyz', Buffer.alloc(4), 4).tipo, null);
});

test('assetinfo: avvisi di peso, script negli SVG e font non woff2', () => {
  assert.ok(A.inspect('g.png', png(100, 100), 900 * 1024).avvisi.some((x) => /Pesante/.test(x)));
  assert.equal(A.inspect('g.webp', webpX(100, 100), 900 * 1024).avvisi.length, 0);
  assert.ok(A.inspect('wide.png', png(4000, 100), 1000).avvisi.some((x) => /Molto larga/.test(x)));
  assert.ok(A.inspect('s.svg', Buffer.from('<svg><script>alert(1)</script></svg>'), 40).avvisi.some((x) => /script/.test(x)));
  assert.ok(A.inspect('s.svg', Buffer.from('<svg onload="x()"></svg>'), 40).avvisi.length >= 1);
  assert.ok(A.inspect('f.ttf', Buffer.alloc(4), 5000).avvisi.some((x) => /woff2/.test(x)));
  assert.ok(A.inspect('v.mp4', Buffer.alloc(4), 20 * 1048576).avvisi.some((x) => /Video pesante/.test(x)));
});

test('store: aggiungere, elencare, rinominare, eliminare asset, backup ed esportazione', () => {
  const src = tmp();
  fs.writeFileSync(path.join(src, 'Il Mio Logo!.png'), png(300, 120));
  fs.writeFileSync(path.join(src, 'anim.json'), JSON.stringify({ fr: 24, ip: 0, op: 48, w: 100, h: 100, layers: [] }));
  fs.writeFileSync(path.join(src, 'finto.json'), '{"a":1}');
  fs.writeFileSync(path.join(src, 'virus.exe'), 'MZ');
  const s = createStore(path.join(tmp(), 'd'));
  s.init();
  assert.deepEqual(s.listAssets(), []);
  const a = s.addAsset(path.join(src, 'Il Mio Logo!.png'));
  assert.equal(a.nome, 'il-mio-logo.png');
  assert.deepEqual([a.w, a.h, a.tipo], [300, 120, 'immagine']);
  assert.equal(s.addAsset(path.join(src, 'Il Mio Logo!.png')).nome, 'il-mio-logo-2.png', 'nome unico');
  assert.equal(s.addAsset(path.join(src, 'anim.json')).tipo, 'lottie');
  assert.throws(() => s.addAsset(path.join(src, 'finto.json')), /Lottie/);
  assert.throws(() => s.addAsset(path.join(src, 'virus.exe')), /non supportato/);
  assert.throws(() => s.addAsset(path.join(src, 'non-esiste.png')), /non trovato/);
  assert.equal(s.listAssets().length, 3);

  const r = s.renameAsset('il-mio-logo.png', 'Logo Principale');
  assert.equal(r.nome, 'logo-principale.png');
  assert.throws(() => s.renameAsset('logo-principale.png', 'il-mio-logo-2'), /Esiste già/);
  assert.throws(() => s.removeAsset('../config.json'), /non valido/);

  const zipBuf = s.backupZip();
  const out = s.exportAll(path.join(tmp(), 'out'));
  assert.ok(fs.existsSync(path.join(out.cartella, 'assets', 'logo-principale.png')));

  assert.ok(s.removeAsset('logo-principale.png').cestino);
  assert.equal(s.listAssets().length, 2);
  s.restoreZip(zipBuf);
  assert.equal(s.listAssets().length, 3, 'il backup contiene anche gli asset');
});

test('scheda Asset: aggiungere un file, vedere i frammenti e rinominare', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const src = tmp();
  const f = path.join(src, 'Foto.png');
  fs.writeFileSync(f, png(640, 360, 1200 * 1024));
  H.state.files = [f, path.join(src, 'brutto.exe')];
  fs.writeFileSync(path.join(src, 'brutto.exe'), 'MZ');

  await H.showTab('asset');
  const panel = H.tab('asset');
  assert.match(panel.textContent, /Ancora vuoto/);
  H.click(H.button(panel, '+ Aggiungi'));
  await H.waitFor(() => panel.querySelectorAll('.asset-card').length === 1, 'asset aggiunto');
  assert.match(H.toast(), /1 file aggiunti.*brutto\.exe/);
  assert.match(panel.querySelector('.asset-title').textContent, /foto\.png/);
  assert.match(panel.querySelector('.asset-facts').textContent, /640 × 360 px/);
  assert.match(panel.querySelector('.asset-warnings').textContent, /Pesante/);

  H.click(H.button(panel, 'Copia <img>'));
  await H.waitFor(() => /<img src="assets\/foto\.png" width="640" height="360" alt=""/.test(String(H.state.clip[H.state.clip.length - 1])), 'frammento img');
  H.click(H.button(panel, 'Copia sfondo CSS'));
  assert.match(String(H.state.clip[H.state.clip.length - 1]), /url\("assets\/foto\.png"\)/);

  H.click(H.button(panel, 'Rinomina'));
  const dlg = await H.dialog();
  H.type(dlg.querySelector('input'), 'Copertina');
  H.click(H.button(dlg, 'Rinomina'));
  await H.noDialog();
  await H.waitFor(() => /copertina\.png/.test(panel.querySelector('.asset-title').textContent), 'rinominato');
  assert.ok(fs.existsSync(path.join(H.dataDir, 'assets', 'copertina.png')));

  H.click(H.button(panel, 'Elimina'));
  const d2 = await H.dialog();
  H.click(H.button(d2, 'Elimina'));
  await H.noDialog();
  await H.waitFor(() => panel.querySelectorAll('.asset-card').length === 0, 'eliminato');
  assert.ok(fs.readdirSync(path.join(H.dataDir, '_cestino')).some((n) => n.startsWith('asset-copertina.png')));
  assert.deepEqual(H.state.errors, []);
});
