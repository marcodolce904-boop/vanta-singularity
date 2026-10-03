'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { boot } = require('./helpers/boot');
const seed = require('../lib/seed');

const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');

async function open() {
  const H = await boot();
  await H.showTab('root');
  const panel = H.tab('root');
  const P = {
    H,
    panel,
    groups: () => Array.from(panel.querySelectorAll('fieldset.var-group')),
    rows: () => Array.from(panel.querySelectorAll('.var-row')),
    row: (nome) => P.rows().find((r) => r.querySelector('.var-name').value === nome),
    err: (nome) => P.row(nome).parentNode.querySelector('.row-error').textContent,
    text: (nome) => P.row(nome).querySelector('.var-text'),
    picker: (nome) => P.row(nome).querySelector('input[type="color"]'),
    status: () => panel.querySelector('.toolbar .status').textContent,
    out: () => panel.querySelector('pre.css-out').textContent,
    frame: panel.querySelector('iframe'),
    select: panel.querySelector('select'),
    btn: (t) => H.button(panel, t),
    contrast: () => Array.from(panel.querySelectorAll('.contrast li')),
    saved: () => read(H.dataDir, 'root', 'root.css'),
    json: () => JSON.parse(read(H.dataDir, 'root', 'root.json'))
  };
  return P;
}

test('Root: gruppi, variabili, anteprima, CSS e contrasto', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  assert.deepEqual(P.groups().map((g) => g.querySelector('legend').textContent), seed.root.gruppi.map((g) => g.nome));
  const totale = seed.root.gruppi.reduce((n, g) => n + g.variabili.length, 0);
  assert.equal(P.rows().length, totale);
  assert.equal(P.status(), 'Tutto salvato');

  assert.equal(P.text('--cat-color-primary').value, '#111111');
  assert.equal(P.picker('--cat-color-primary').value, '#111111');
  assert.equal(P.picker('--cat-space-1'), null, 'solo i colori hanno il selettore');
  assert.match(P.out(), /:root \{/);
  assert.match(P.out(), /--cat-color-primary: #111111;/);

  const doc = P.frame.srcdoc;
  ['var(--cat-color-primary)', 'var(--cat-space-3)', 'var(--cat-shadow-md)', 'var(--cat-radius-lg)', 'font-family:var(--cat-font-heading)', 'font-size:var(--cat-text-xl)'].forEach((frag) => {
    assert.ok(doc.includes(frag), 'nell\'anteprima manca ' + frag);
  });
  assert.ok(doc.includes('--cat-color-primary: #111111;'), 'le variabili sono nell\'anteprima');
  assert.ok(!doc.includes('var(--cat-weight-bold)'), 'i valori senza una vista non entrano');

  const righe = P.contrast();
  assert.ok(righe.length > 0);
  assert.ok(righe.every((li) => /AA/.test(li.textContent)));
  assert.ok(righe.some((li) => li.querySelector('.ok')));
  assert.deepEqual(P.H.state.errors, []);
});

test('Root: cambiare un colore, salvare, e ritrovarlo nelle altre schede', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  const nome = '--cat-color-primary';

  H.type(P.text(nome), '#ff0000');
  assert.equal(P.picker(nome).value, '#ff0000', 'il selettore segue il testo');
  assert.match(P.status(), /Modifiche non salvate/);
  await H.waitFor(() => P.out().includes('--cat-color-primary: #ff0000;'), 'CSS generato aggiornato');
  await H.waitFor(() => P.frame.srcdoc.includes('--cat-color-primary: #ff0000;'), 'anteprima aggiornata');
  assert.ok(!P.saved().includes('#ff0000'), 'su disco non c\'è ancora');

  H.type(P.picker(nome), '#00ff00');
  assert.equal(P.text(nome).value, '#00ff00', 'il testo segue il selettore');
  H.click(P.btn('Salva'));
  await H.waitFor(() => P.status() === 'Tutto salvato', 'salvataggio');
  assert.match(P.saved(), /--cat-color-primary: #00ff00;/);
  assert.equal(P.json().gruppi[0].variabili.find((v) => v.nome === nome).valore, '#00ff00');
  assert.equal(H.toast(), 'Salvato');
  assert.ok(fs.existsSync(path.join(H.dataDir, 'root', 'root.json.bak')));

  await H.showTab('strutture');
  await H.waitFor(() => H.tab('strutture').querySelector('iframe').srcdoc.includes('--cat-color-primary: #00ff00;'), 'anteprima di Strutture');
  assert.deepEqual(H.state.errors, []);
});

test('Root: valori e nomi non validi vengono segnalati e non si salvano', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  const prima = P.saved();

  H.type(P.text('--cat-space-1'), 'red; } body { display: none');
  assert.match(P.err('--cat-space-1'), /parentesi graffe/);
  H.click(P.btn('Salva'));
  await H.waitFor(() => /parentesi graffe/.test(H.toast()), 'errore al salvataggio');
  assert.equal(H.d.getElementById('toast').className, 'errore');
  assert.equal(P.saved(), prima);
  assert.doesNotMatch(P.out(), /display: none/, 'il CSS generato salta la variabile non valida');
  H.type(P.text('--cat-space-1'), 'x; y');
  assert.match(P.err('--cat-space-1'), /punto e virgola/);
  H.type(P.text('--cat-space-1'), '');
  assert.match(P.err('--cat-space-1'), /Valore vuoto/);
  H.type(P.text('--cat-space-1'), '0.25rem');
  assert.equal(P.err('--cat-space-1'), '');

  // un colore scritto senza il # non è un colore CSS valido
  H.type(P.text('--cat-color-primary'), '111111');
  assert.match(P.err('--cat-color-primary'), /Manca il #/);
  H.type(P.text('--cat-color-primary'), '#111111');
  assert.equal(P.err('--cat-color-primary'), '');

  const nomeInput = P.row('--cat-space-2').querySelector('.var-name');
  H.type(nomeInput, '--cat-space-3');
  assert.match(P.err('--cat-space-3'), /duplicato/);
  H.click(P.btn('Salva'));
  await H.waitFor(() => /duplicata/.test(H.toast()), 'errore duplicata');
  H.type(nomeInput, 'senza-trattini');
  assert.match(P.err('senza-trattini'), /Nome variabile non valido/);
  H.type(nomeInput, '--cat-space-2');
  assert.equal(P.err('--cat-space-2'), '');
  assert.equal(P.saved(), prima);
  assert.deepEqual(H.state.errors, []);
});

test('Root: aggiungere e togliere variabili e gruppi', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  const gruppo = P.groups()[2];
  const prima = gruppo.querySelectorAll('.var-row').length;

  H.click(H.button(gruppo, '+ Variabile'));
  let righe = P.groups()[2].querySelectorAll('.var-row');
  assert.equal(righe.length, prima + 1);
  const nuova = righe[righe.length - 1];
  assert.equal(nuova.querySelector('.var-name').value, '--cat-', 'il nome parte dal prefisso');
  assert.equal(nuova.parentNode.querySelector('.row-error').textContent, '', 'nessun errore su una riga appena creata');
  H.type(nuova.querySelector('.var-name'), '--cat-nuova');
  H.type(nuova.querySelector('.var-text'), '2px');

  H.click(H.button(P.groups()[2], '+ Colore'));
  righe = P.groups()[2].querySelectorAll('.var-row');
  const colore = righe[righe.length - 1];
  assert.equal(colore.querySelector('.var-text').value, '#000000');
  assert.ok(colore.querySelector('input[type="color"]'));
  H.type(colore.querySelector('.var-name'), '--cat-color-extra');

  H.click(P.btn('Salva'));
  await H.waitFor(() => P.status() === 'Tutto salvato', 'salvataggio');
  assert.match(P.saved(), /--cat-nuova: 2px;/);
  assert.match(P.saved(), /--cat-color-extra: #000000;/);
  assert.equal(P.json().gruppi[2].variabili.find((v) => v.nome === '--cat-color-extra').tipo, 'colore');

  H.click(H.button(P.row('--cat-nuova'), 'Togli'));
  assert.equal(P.row('--cat-nuova'), undefined);
  assert.match(P.status(), /Modifiche non salvate/);
  H.click(P.btn('Ripristina'));
  await H.answer('Annulla le modifiche');
  assert.ok(P.row('--cat-nuova'), 'Ripristina la riporta');

  const n = P.groups().length;
  H.click(P.btn('+ Gruppo'));
  await H.fillDialog({ nome: 'Z-index' }, 'Crea');
  await H.noDialog();
  assert.equal(P.groups().length, n + 1);
  H.click(H.button(P.groups()[n], 'Rinomina gruppo'));
  await H.fillDialog({ nome: 'Livelli' }, 'Rinomina');
  await H.noDialog();
  assert.equal(P.groups()[n].querySelector('legend').textContent, 'Livelli');
  H.click(H.button(P.groups()[n], 'Elimina gruppo'));
  await H.answer('Elimina gruppo');
  assert.equal(P.groups().length, n);
  assert.deepEqual(H.state.errors, []);
});

test('Root: preset salvati, applicati (uniti alla bozza) ed eliminati', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  const applica = () => P.btn('Applica');
  const nome = '--cat-color-primary';
  assert.equal(P.select.options.length, 1);
  assert.match(P.select.options[0].textContent, /Nessun preset/);
  assert.equal(applica().disabled, true);
  assert.equal(P.btn('Elimina preset').disabled, true);

  H.click(P.btn('Salva come preset'));
  let dlg = await H.dialog();
  H.click(H.button(dlg, 'Salva preset'));
  await H.waitFor(() => /Scrivi un nome/.test(dlg.textContent));
  H.type(dlg.querySelector('[name="nome"]'), 'Palette uno');
  H.click(H.button(dlg, 'Salva preset'));
  await H.noDialog();
  await H.waitFor(() => P.select.value === 'palette-uno', 'preset in elenco');
  assert.equal(applica().disabled, false);
  assert.ok(fs.existsSync(path.join(H.dataDir, 'root', 'presets', 'palette-uno.json')));

  // cambio un colore e applico il preset: torna il valore del preset
  H.type(P.text(nome), '#123456');
  H.click(applica());
  await H.waitFor(() => /valori cambiati/.test(H.toast()), 'preset applicato');
  assert.match(H.toast(), /1 valori cambiati, 0 variabili aggiunte/);
  assert.equal(P.text(nome).value, '#111111');

  // un preset con una variabile in più: applicandolo la variabile torna
  H.click(H.button(P.groups()[2], '+ Variabile'));
  const nuova = Array.from(P.groups()[2].querySelectorAll('.var-row')).pop();
  H.type(nuova.querySelector('.var-name'), '--cat-extra');
  H.type(nuova.querySelector('.var-text'), '9px');
  H.click(P.btn('Salva come preset'));
  await H.fillDialog({ nome: 'Con extra' }, 'Salva preset');
  await H.noDialog();
  await H.waitFor(() => P.select.value === 'con-extra');
  H.click(H.button(P.row('--cat-extra'), 'Togli'));
  assert.equal(P.row('--cat-extra'), undefined);
  H.click(applica());
  await H.waitFor(() => /1 variabili aggiunte/.test(H.toast()), 'variabile riaggiunta');
  assert.equal(P.text('--cat-extra').value, '9px');

  // stesso nome: chiede se sovrascrivere
  H.click(P.btn('Salva come preset'));
  await H.fillDialog({ nome: 'Palette uno' }, 'Salva preset');
  dlg = await H.dialog();
  assert.match(dlg.textContent, /Esiste già/);
  H.click(H.button(dlg, 'Annulla'));
  await H.noDialog();
  assert.equal(JSON.parse(read(H.dataDir, 'root', 'presets', 'palette-uno.json')).gruppi[2].variabili.some((v) => v.nome === '--cat-extra'), false);

  // elimina
  H.click(P.btn('Elimina preset'));
  await H.answer('Sposta nel cestino');
  await H.waitFor(() => !fs.existsSync(path.join(H.dataDir, 'root', 'presets', 'con-extra.json')), 'preset eliminato');
  assert.ok(fs.readdirSync(path.join(H.dataDir, '_cestino')).some((n) => n.startsWith('preset-con-extra')));
  await H.waitFor(() => !Array.from(P.select.options).some((o) => o.value === 'con-extra'), 'elenco dei preset aggiornato');
  assert.equal(P.btn('Applica').disabled, true);
  assert.deepEqual(H.state.errors, []);
});

test('Root: il controllo contrasto segnala i colori sotto AA', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  assert.equal(P.panel.querySelectorAll('.contrast .ko').length, 0, 'i dati di esempio passano');
  H.type(P.text('--cat-color-text'), '#eeeeee');
  await H.waitFor(() => P.panel.querySelectorAll('.contrast .ko').length > 0, 'contrasto basso segnalato');
  const ko = P.panel.querySelector('.contrast .ko').textContent;
  assert.match(ko, /sotto AA/);
  assert.match(ko, /--cat-color-text|:1/);
  H.type(P.text('--cat-color-text'), '#111111');
  await H.waitFor(() => P.panel.querySelectorAll('.contrast .ko').length === 0, 'tornato a posto');
});

test('Root: copia ed esporta CSS e token per Figma', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  H.type(P.text('--cat-color-primary'), '#abcdef');
  await H.waitFor(() => P.out().includes('#abcdef'));

  H.click(P.btn('Copia :root'));
  await H.waitFor(() => H.state.clip.length === 1);
  assert.equal(H.state.clip[0], P.out());

  const css = path.join(H.base, 'mio-root.css');
  const json = path.join(H.base, 'mio-token.json');
  H.state.saveFile = css;
  H.click(P.btn('Salva root.css'));
  await H.waitFor(() => fs.existsSync(css), 'root.css scritto');
  assert.equal(read(css), P.out(), 'si esporta la bozza, anche non salvata');
  assert.ok(!P.saved().includes('#abcdef'));

  H.state.saveFile = json;
  H.click(P.btn('Esporta token Figma'));
  await H.waitFor(() => fs.existsSync(json), 'token scritti');
  const tok = JSON.parse(read(json));
  assert.equal(tok.global.color.primary.value, '#abcdef');
  assert.equal(tok.global.color.primary.type, 'color');

  // con un errore nella bozza non si esporta
  fs.rmSync(css);
  H.type(P.text('--cat-space-1'), 'x; y');
  H.click(P.btn('Salva root.css'));
  await H.waitFor(() => /punto e virgola/.test(H.toast()), 'esportazione bloccata');
  assert.equal(fs.existsSync(css), false);
  assert.deepEqual(H.state.errors, []);
});

test('Root: uscire con modifiche non salvate chiede cosa fare', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  H.type(P.text('--cat-color-accent'), '#112233');
  H.click(H.d.getElementById('tab-classi'));
  const dlg = await H.dialog();
  assert.match(dlg.textContent, /Root/);
  H.click(H.button(dlg, 'Salva e continua'));
  await H.noDialog();
  await H.waitFor(() => H.d.getElementById('tab-classi').getAttribute('aria-selected') === 'true', 'passa a Classi');
  assert.match(P.saved(), /--cat-color-accent: #112233;/);
  assert.equal(H.w.CatalogoApp.anyDirty(), false);
});

test('Root: l\'anteprima funziona con qualunque nome di variabile', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const sample = H.w.CatalogoApp.buildRootSample({
    gruppi: [
      {
        nome: 'x',
        variabili: [
          { nome: '--brand', valore: '#336699', tipo: 'colore' },
          { nome: '--sfondo-bg', valore: '#fafafa', tipo: 'colore' },
          { nome: '--serif', valore: 'Georgia, serif', tipo: 'testo' },
          { nome: '--cattiva', valore: 'a; b', tipo: 'testo' },
          { nome: '--space-huge', valore: '4rem', tipo: 'testo' },
          { nome: '--shadow-big', valore: '0 8px 24px rgb(0 0 0 / .2)', tipo: 'testo' }
        ]
      }
    ]
  });
  assert.match(sample.html, /var\(--brand\)/);
  assert.match(sample.html, /font-family:var\(--serif\)/);
  assert.match(sample.html, /width:var\(--space-huge\)/);
  assert.match(sample.html, /box-shadow:var\(--shadow-big\)/);
  assert.doesNotMatch(sample.html, /cattiva/);
  assert.match(sample.css, /background:var\(--sfondo-bg,#fff\)/);
  const vuoto = H.w.CatalogoApp.buildRootSample({ gruppi: [] });
  assert.match(vuoto.html, /Aggiungi delle variabili/);
});

test('strumenti colore: mostra la scala e la aggiunge come gruppo', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  await H.showTab('root');
  const panel = H.tab('root');
  const before = panel.querySelectorAll('fieldset, .group').length;
  H.click(H.button(panel, 'Strumenti colore…'));
  const dlg = await H.dialog();
  await H.waitFor(() => dlg.querySelectorAll('.sw').length >= 15, 'campioni di colore');
  assert.match(dlg.textContent, /CMYK approssimato/);
  assert.match(dlg.textContent, /deuteranopia/);
  H.click(H.button(dlg, 'Aggiungi la scala come variabili'));
  await H.noDialog();
  await H.waitFor(() => panel.querySelectorAll('fieldset, .group').length === before + 1, 'nuovo gruppo');
  assert.match(H.toast(), /scala/i);
  assert.deepEqual(H.state.errors, []);
});
