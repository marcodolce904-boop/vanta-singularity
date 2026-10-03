'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createStore } = require('../lib/store');
const seed = require('../lib/seed');
const lib = require('../lib/libreria');

function tmp() {
  return fs.mkdtempSync(path.join(process.env.TEST_TMPDIR || os.tmpdir(), 'catalogo-test-'));
}

function fresh() {
  const base = tmp();
  const dir = path.join(base, 'dati');
  const s = createStore(dir);
  const r = s.init();
  return { s, dir, base, seeded: r.seeded };
}

const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');

test('init crea cartelle e contenuti di esempio una volta sola', () => {
  const { s, dir, seeded } = fresh();
  assert.equal(seeded, true);
  assert.equal(s.list('strutture').length, (seed.strutture.length + lib.strutture.length));
  assert.equal(s.list('componenti').length, (seed.componenti.length + lib.componenti.length));
  assert.equal(s.getClassi().gruppi.length, seed.classi.gruppi.length);
  assert.equal(s.getRoot().gruppi.length, seed.root.gruppi.length);
  ['catalogo.json', 'classi/classi.json', 'classi/cat-classi.css', 'root/root.json', 'root/root.css'].forEach((f) =>
    assert.ok(fs.existsSync(path.join(dir, f)), f)
  );
  assert.equal(createStore(dir).init().seeded, false);
  assert.equal(createStore(dir).list('strutture').length, (seed.strutture.length + lib.strutture.length));
});

test('save crea, aggiorna e conserva la data di creazione', async () => {
  const { s, dir } = fresh();
  const a = s.save('strutture', null, { nome: 'Prova è così', descrizione: 'd', tag: 'x, y, x', html: '<p>1</p>', css: 'p{}' });
  assert.equal(a.id, 'prova-e-cosi');
  assert.deepEqual(a.tag, ['x', 'y']);
  assert.equal(a.js, '', 'le strutture non hanno JS');
  const b = s.save('strutture', null, { nome: 'Prova è così' });
  assert.equal(b.id, 'prova-e-cosi-2');
  await new Promise((r) => setTimeout(r, 5));
  const c = s.save('strutture', a.id, { nome: 'Nuovo nome', html: '<p>2</p>', css: '', js: 'alert(1)' });
  assert.equal(c.id, a.id, 'la cartella non cambia nome');
  assert.equal(c.nome, 'Nuovo nome');
  assert.equal(c.creato, a.creato);
  assert.notEqual(c.modificato, a.modificato);
  assert.equal(fs.existsSync(path.join(dir, 'strutture', a.id, 'script.js')), false);
  assert.equal(read(dir, 'strutture', a.id, 'markup.html'), '<p>2</p>');
  const comp = s.save('componenti', null, { nome: 'Con js', js: 'let a = 1;' });
  assert.equal(read(dir, 'componenti', comp.id, 'script.js'), 'let a = 1;');
  assert.equal(s.save('strutture', null, { nome: '   ' }).nome, 'Senza nome');
});

test('save e get rifiutano id e tipi non validi', () => {
  const { s, dir } = fresh();
  ['../x', 'a/b', '..', '', 'A'].forEach((id) => {
    assert.throws(() => s.get('strutture', id), /Identificatore non valido/, id);
    assert.throws(() => s.save('strutture', id, { nome: 'x' }), /Identificatore non valido/, id);
    assert.throws(() => s.remove('strutture', id), /Identificatore non valido/, id);
  });
  assert.throws(() => s.get('altro', 'a'), /Tipo non valido/);
  assert.throws(() => s.list('classi'), /Tipo non valido/);
  assert.throws(() => s.get('strutture', 'non-esiste'), /non trovato/);
  assert.throws(() => s.save('strutture', 'non-esiste', { nome: 'x' }), /non trovato/);
  assert.equal(fs.existsSync(path.join(dir, 'strutture', 'non-esiste')), false);
});

test('remove sposta nel cestino e duplicate fa una copia', () => {
  const { s, dir } = fresh();
  const first = s.list('strutture')[0];
  const copia = s.duplicate('strutture', first.id);
  assert.equal(copia.nome, first.nome + ' (copia)');
  assert.notEqual(copia.id, first.id);
  assert.equal(s.get('strutture', copia.id).html, s.get('strutture', first.id).html);
  const r = s.remove('strutture', first.id);
  assert.ok(fs.existsSync(r.cestino));
  assert.ok(fs.existsSync(path.join(r.cestino, 'markup.html')), 'i file sono nel cestino');
  assert.equal(fs.existsSync(path.join(dir, 'strutture', first.id)), false);
  assert.equal(s.list('strutture').some((x) => x.id === first.id), false);
  assert.ok(!s.list('strutture').some((x) => x.id.charAt(0) === '_'));
});

test('saveClassi controlla i nomi e scrive il CSS con una copia .bak', () => {
  const { s, dir } = fresh();
  const dati = s.getClassi();
  dati.gruppi[0].classi.push({ id: 'zz', nome: 'cat-nuova', descrizione: 'x', css: '.cat-nuova { color: red; }' });
  s.saveClassi(dati);
  assert.match(read(dir, 'classi', 'cat-classi.css'), /\.cat-nuova \{ color: red; \}/);
  assert.ok(fs.existsSync(path.join(dir, 'classi', 'classi.json.bak')));
  assert.throws(() => s.saveClassi({ gruppi: [{ nome: 'g', classi: [{ nome: '', css: '' }] }] }), /non ha il nome/);
  assert.throws(() => s.saveClassi({ gruppi: [{ nome: 'g', classi: [{ nome: '.punto', css: '' }] }] }), /Nome classe non valido/);
  assert.match(read(dir, 'classi', 'cat-classi.css'), /cat-nuova/, 'un salvataggio rifiutato non tocca i file');
});

test('saveRoot rifiuta valori non validi e duplicati', () => {
  const { s, dir } = fresh();
  const mk = (...vars) => ({ gruppi: [{ nome: 'g', variabili: vars }] });
  assert.throws(() => s.saveRoot(mk({ nome: 'senza-trattini', valore: '1' })), /Nome variabile non valido/);
  assert.throws(() => s.saveRoot(mk({ nome: '--a', valore: '' })), /Valore vuoto/);
  assert.throws(() => s.saveRoot(mk({ nome: '--a', valore: 'x; y' })), /punto e virgola/);
  assert.throws(() => s.saveRoot(mk({ nome: '--a', valore: '1' }, { nome: '--a', valore: '2' })), /duplicata/);
  const ok = s.saveRoot(mk({ nome: '--a', valore: '#fff', tipo: 'colore' }));
  assert.equal(ok.gruppi[0].variabili[0].tipo, 'colore');
  assert.match(read(dir, 'root', 'root.css'), /--a: #fff;/);
  assert.equal(s.getRoot().gruppi.length, 1);
});

test('preset: salva, elenca, legge, elimina', () => {
  const { s, dir } = fresh();
  assert.deepEqual(s.listPresets(), []);
  const r = s.savePreset('Palette autunno', { gruppi: [{ nome: 'Colori', variabili: [{ nome: '--cat-color-primary', valore: '#aa5500', tipo: 'colore' }] }] });
  assert.equal(r.id, 'palette-autunno');
  assert.deepEqual(s.listPresets().map((p) => p.nome), ['Palette autunno']);
  const p = s.getPreset('palette-autunno');
  assert.equal(p.gruppi[0].variabili[0].valore, '#aa5500');
  assert.throws(() => s.savePreset('  ', { gruppi: [] }), /nome/i);
  assert.throws(() => s.savePreset('x', { gruppi: [{ nome: 'g', variabili: [{ nome: 'no', valore: '1' }] }] }), /non valido/);
  assert.throws(() => s.getPreset('../x'), /Identificatore non valido/);
  assert.throws(() => s.getPreset('manca'), /non trovato/);
  const del = s.deletePreset('palette-autunno');
  assert.ok(fs.existsSync(del.cestino));
  assert.deepEqual(s.listPresets(), []);
  assert.equal(fs.existsSync(path.join(dir, 'root', 'presets', 'palette-autunno.json')), false);
});

test('JSON corrotto: si riparte da vuoto e resta una copia', () => {
  const { s, dir } = fresh();
  fs.writeFileSync(path.join(dir, 'root', 'root.json'), '{ rotto', 'utf8');
  fs.writeFileSync(path.join(dir, 'strutture', s.list('strutture')[0].id, 'meta.json'), 'nope', 'utf8');
  assert.deepEqual(s.getRoot().gruppi, []);
  assert.ok(fs.readdirSync(path.join(dir, 'root')).some((f) => f.startsWith('root.json.corrotto-')));
  assert.equal(s.list('strutture').length, (seed.strutture.length + lib.strutture.length), 'un meta.json rotto non nasconde la cartella');
});

test('il prefisso cambia il nome del file CSS delle classi', () => {
  const { s, dir } = fresh();
  assert.equal(s.getSettings().prefisso, 'cat');
  s.setSettings({ prefisso: 'Zz' });
  assert.equal(s.getSettings().prefisso, 'zz');
  assert.ok(fs.existsSync(path.join(dir, 'classi', 'zz-classi.css')));
  assert.equal(fs.existsSync(path.join(dir, 'classi', 'cat-classi.css')), false);
  assert.ok(fs.readdirSync(path.join(dir, '_cestino')).length >= 1);
  ['', 'a-b', '1a', 'x'.repeat(13), '../a'].forEach((p) => assert.throws(() => s.setSettings({ prefisso: p }), /Prefisso non valido/, p));
  assert.equal(s.getSettings().prefisso, 'zz');
});

test('exportItem scrive una pagina completa che si apre da sola', () => {
  const { s, base } = fresh();
  const dest = path.join(base, 'fuori');
  fs.mkdirSync(dest);
  const r = s.exportItem('componenti', { nome: 'Il mio Pulsante', html: '<button>x</button>', css: 'button{}', js: 'console.log(1)' }, dest);
  assert.deepEqual(r.file, ['index.html', 'style.css', 'script.js']);
  assert.equal(path.basename(r.cartella), 'il-mio-pulsante');
  const html = read(r.cartella, 'index.html');
  assert.match(html, /<link rel="stylesheet" href="style.css">/);
  assert.match(html, /<script src="script.js"><\/script>/);
  const r2 = s.exportItem('strutture', { nome: 'Il mio Pulsante', html: '<p>a</p>', css: '', js: '   ' }, dest);
  assert.equal(path.basename(r2.cartella), 'il-mio-pulsante-2');
  assert.deepEqual(r2.file, ['index.html', 'style.css']);
  assert.equal(fs.existsSync(path.join(r2.cartella, 'script.js')), false);
  assert.throws(() => s.exportItem('strutture', {}, ''), /Cartella/);
});

test('exportAll scrive la struttura completa per VS Code', () => {
  const { s, base } = fresh();
  const dest = path.join(base, 'export');
  fs.mkdirSync(dest);
  const r = s.exportAll(dest);
  assert.equal(r.strutture, (seed.strutture.length + lib.strutture.length));
  assert.equal(r.componenti, (seed.componenti.length + lib.componenti.length));
  ['css/root.css', 'css/cat-classi.css', 'tokens/figma-tokens.json'].forEach((f) =>
    assert.ok(fs.existsSync(path.join(r.cartella, f)), f)
  );
  const first = s.list('strutture')[0].id;
  const page = read(r.cartella, 'strutture', first, 'index.html');
  assert.match(page, /href="\.\.\/\.\.\/css\/root\.css"/);
  assert.match(page, /href="\.\.\/\.\.\/css\/cat-classi\.css"/);
  assert.ok(fs.existsSync(path.join(r.cartella, 'strutture', first, 'style.css')));
  const tokens = JSON.parse(read(r.cartella, 'tokens', 'figma-tokens.json'));
  assert.ok(tokens.global.color);
  assert.equal(s.exportAll(dest).cartella, r.cartella + '-2');
});

test('cssText e tokensText usano la bozza se viene passata', () => {
  const { s } = fresh();
  const bozza = { gruppi: [{ nome: 'g', variabili: [{ nome: '--cat-color-x', valore: '#123456', tipo: 'colore' }] }] };
  assert.match(s.cssText('root', bozza), /--cat-color-x: #123456;/);
  assert.doesNotMatch(s.cssText('root'), /--cat-color-x/);
  assert.match(s.tokensText(bozza), /#123456/);
  assert.throws(() => s.cssText('root', { gruppi: [{ nome: 'g', variabili: [{ nome: 'no', valore: '1' }] }] }), /non valido/);
  assert.throws(() => s.cssText('altro'), /non valido/);
  assert.match(s.cssText('classi'), /\.cat-flex \{/);
});

test('scrittura atomica: nessun file temporaneo resta nella cartella', () => {
  const { s, dir } = fresh();
  s.save('strutture', null, { nome: 'a' });
  s.saveRoot(s.getRoot());
  const stray = [];
  (function walk(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.includes('.tmp-')) stray.push(p);
    });
  })(dir);
  assert.deepEqual(stray, []);
});

test('importFolder: legge html, css e js di una cartella qualsiasi', () => {
  const fs2 = require('node:fs');
  const os2 = require('node:os');
  const path2 = require('node:path');
  const src = fs2.mkdtempSync(path2.join(os2.tmpdir(), 'imp-'));
  fs2.writeFileSync(path2.join(src, 'index.html'), '<body><h1>T</h1><script>a()</script></body>');
  fs2.writeFileSync(path2.join(src, 'main.css'), 'h1{margin:0}');
  fs2.mkdirSync(path2.join(src, 'js'));
  fs2.writeFileSync(path2.join(src, 'js', 'x.js'), 'b()');
  const s = createStore(fs2.mkdtempSync(path2.join(os2.tmpdir(), 'cat-')));
  s.init();
  const r = s.importFolder(src);
  assert.equal(r.html, '<h1>T</h1>\n');
  assert.match(r.css, /h1\{margin:0\}/);
  assert.match(r.js, /a\(\)[\s\S]*b\(\)/);
  assert.throws(() => s.importFolder(path2.join(src, 'nope')), /non trovata/);
  assert.equal(s.list('animazioni').length, 4 + lib.animazioni.length);
  assert.equal(s.list('interazioni').length, 5 + lib.interazioni.length);
});
