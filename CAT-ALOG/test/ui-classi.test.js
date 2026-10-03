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
  await H.showTab('classi');
  const panel = H.tab('classi');
  const P = {
    H,
    panel,
    groups: () => Array.from(panel.querySelectorAll('.col-list .list-btn')),
    group: (n) => H.find(panel, '.col-list .list-btn', n),
    rows: () => Array.from(panel.querySelectorAll('.rows > li.row')),
    row: (nome) => P.rows().find((r) => r.querySelector('.name') && r.querySelector('.name').textContent === nome),
    title: () => panel.querySelector('.group-title').textContent,
    status: () => panel.querySelector('.col-editor .status').textContent,
    sandbox: panel.querySelector('.col-editor textarea'),
    frame: panel.querySelector('iframe'),
    btn: (t) => H.button(panel, t),
    saved: () => JSON.parse(read(H.dataDir, 'classi', 'classi.json')),
    css: () => read(H.dataDir, 'classi', 'md-classi.css')
  };
  return P;
}

test('Classi: gruppi, righe, copia e prova', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  assert.equal(P.groups().length, seed.classi.gruppi.length);
  assert.equal(P.panel.querySelector('.col-list .list-btn[aria-current="true"]').textContent.startsWith(seed.classi.gruppi[0].nome), true);
  assert.equal(P.title(), seed.classi.gruppi[0].nome);
  assert.equal(P.rows().length, seed.classi.gruppi[0].classi.length);
  assert.equal(P.status(), 'Tutto salvato');

  const first = seed.classi.gruppi[0].classi[0];
  H.click(P.rows()[0].querySelector('.name'));
  await H.waitFor(() => H.state.clip.length === 1);
  assert.equal(H.state.clip[0], first.nome);
  H.click(H.button(P.rows()[0], 'Copia regola'));
  await H.waitFor(() => H.state.clip.length === 2);
  assert.equal(H.state.clip[1], first.css);

  H.click(H.button(P.rows()[0], 'Prova'));
  assert.match(P.sandbox.value, new RegExp('class="' + first.nome + '"'));
  assert.match(P.frame.srcdoc, new RegExp('class="' + first.nome + '"'));
  assert.match(P.frame.srcdoc, new RegExp('\\.' + first.nome + ' \\{'), 'il CSS della classe è nell\'anteprima');

  H.click(P.btn('Copia questo gruppo'));
  H.click(P.btn('Copia tutto il CSS'));
  await H.waitFor(() => H.state.clip.length === 4);
  assert.ok(H.state.clip[2].includes(first.css.trim()));
  assert.ok(H.state.clip[3].includes(first.css.trim()));
  assert.ok(H.state.clip[3].length > H.state.clip[2].length, 'tutto il CSS è più lungo del solo gruppo');
  assert.ok(!H.state.clip[2].includes(seed.classi.gruppi[1].classi[0].css.trim()), 'il gruppo non contiene gli altri gruppi');

  H.click(P.group(seed.classi.gruppi[1].nome));
  assert.equal(P.title(), seed.classi.gruppi[1].nome);
  assert.equal(P.rows().length, seed.classi.gruppi[1].classi.length);
  assert.deepEqual(H.state.errors, []);
});

test('Classi: aggiungere una classe, controlli sui nomi e salvataggio', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  const prima = P.rows().length;

  H.click(P.btn('+ Classe'));
  assert.equal(P.rows().length, prima + 1);
  const row = P.panel.querySelector('li.row.editing');
  assert.ok(row);
  const [nome, desc] = row.querySelectorAll('input[type="text"]');
  const css = row.querySelector('textarea');
  assert.match(P.status(), /Modifiche non salvate/);

  // nome vuoto: il salvataggio viene fermato
  H.click(P.btn('Salva'));
  await H.waitFor(() => /non ha il nome/.test(H.toast()), 'errore nome vuoto');
  assert.equal(H.d.getElementById('toast').className, 'errore');

  H.type(nome, '.punto');
  assert.match(row.textContent, /Nome non valido/);
  H.type(nome, 'md-nuova');
  assert.doesNotMatch(row.textContent, /Nome non valido/);
  H.type(desc, 'Una classe di prova');
  H.type(css, '.md-nuova {\n  color: rebeccapurple;\n}');

  // nome già usato in un altro gruppo
  const esistente = seed.classi.gruppi[1].classi[0].nome;
  H.type(nome, esistente);
  H.click(P.btn('Salva'));
  await H.waitFor(() => /duplicata/.test(H.toast()), 'errore classe duplicata');
  assert.ok(!P.saved().gruppi[0].classi.some((c) => c.descrizione === 'Una classe di prova'), 'niente è stato scritto');

  H.type(nome, 'md-nuova');
  H.click(H.button(row, 'Fatto'));
  assert.equal(P.panel.querySelector('li.row.editing'), null);
  assert.ok(P.row('md-nuova'));
  assert.match(P.row('md-nuova').textContent, /Una classe di prova/);

  H.click(P.btn('Salva'));
  await H.waitFor(() => P.status() === 'Tutto salvato', 'salvataggio');
  assert.ok(P.saved().gruppi[0].classi.some((c) => c.nome === 'md-nuova'));
  assert.match(P.css(), /\.md-nuova \{\n  color: rebeccapurple;\n\}/);
  assert.equal(H.toast(), 'Salvato');
  assert.ok(fs.existsSync(path.join(H.dataDir, 'classi', 'classi.json.bak')));

  // la classe salvata entra subito nelle anteprime delle altre schede
  await H.showTab('strutture');
  await H.waitFor(() => H.tab('strutture').querySelector('iframe').srcdoc.includes('rebeccapurple'), 'anteprima aggiornata');
  assert.deepEqual(H.state.errors, []);
});

test('Classi: modificare e togliere una classe', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  const target = seed.classi.gruppi[0].classi[1];
  H.click(H.button(P.row(target.nome), 'Modifica'));
  const row = P.panel.querySelector('li.row.editing');
  H.type(row.querySelectorAll('input[type="text"]')[1], 'Descrizione cambiata');
  H.click(H.button(row, 'Fatto'));
  H.click(P.btn('Salva'));
  await H.waitFor(() => P.status() === 'Tutto salvato');
  assert.equal(P.saved().gruppi[0].classi[1].descrizione, 'Descrizione cambiata');

  H.click(H.button(P.row(target.nome), 'Modifica'));
  H.click(H.button(P.panel.querySelector('li.row.editing'), 'Togli classe'));
  assert.equal(P.row(target.nome), undefined);
  assert.match(P.status(), /Modifiche non salvate/);
  assert.ok(P.saved().gruppi[0].classi.some((c) => c.nome === target.nome), 'su disco c\'è ancora finché non salvi');
  H.click(P.btn('Ripristina'));
  await H.answer('Annulla le modifiche');
  assert.ok(P.row(target.nome), 'Ripristina la riporta');
  assert.equal(P.status(), 'Tutto salvato');
});

test('Classi: gruppi nuovo, rinomina ed elimina', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  const n = P.groups().length;

  H.click(P.btn('+ Gruppo'));
  let dlg = await H.dialog();
  H.click(H.button(dlg, 'Crea'));
  await H.waitFor(() => /Scrivi un nome/.test(dlg.textContent));
  H.type(dlg.querySelector('[name="nome"]'), 'Miei');
  H.click(H.button(dlg, 'Crea'));
  await H.noDialog();
  assert.equal(P.groups().length, n + 1);
  assert.equal(P.title(), 'Miei');
  assert.match(P.panel.querySelector('.rows .empty').textContent, /Gruppo vuoto/);

  H.click(P.btn('Rinomina gruppo'));
  await H.fillDialog({ nome: 'Miei bis' }, 'Rinomina');
  await H.noDialog();
  assert.equal(P.title(), 'Miei bis');

  H.click(P.btn('+ Classe'));
  const nome = P.panel.querySelector('li.row.editing input[type="text"]');
  H.type(nome, 'md-mia');
  H.click(P.btn('Salva'));
  await H.waitFor(() => P.status() === 'Tutto salvato');
  assert.equal(P.saved().gruppi[n].nome, 'Miei bis');

  H.click(P.btn('Elimina gruppo'));
  let conferma = await H.dialog();
  assert.match(conferma.textContent, /Miei bis/);
  H.click(H.button(conferma, 'Annulla'));
  await H.noDialog();
  assert.equal(P.groups().length, n + 1);
  H.click(P.btn('Elimina gruppo'));
  await H.answer('Elimina gruppo');
  assert.equal(P.groups().length, n);
  assert.equal(P.saved().gruppi.length, n + 1, 'su disco resta finché non salvi');
  H.click(P.btn('Salva'));
  await H.waitFor(() => P.status() === 'Tutto salvato');
  assert.equal(P.saved().gruppi.length, n);
  assert.deepEqual(H.state.errors, []);
});

test('Classi: la ricerca guarda in tutti i gruppi', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  const search = P.panel.querySelector('input[type="search"]');
  H.type(search, 'CENTER');
  assert.match(P.title(), /Risultati per «CENTER»/);
  const trovate = P.rows();
  assert.ok(trovate.length > 1);
  assert.ok(trovate.every((r) => /center/i.test(r.textContent)));
  assert.ok(trovate.some((r) => r.querySelector('.group-tag')), 'si vede il gruppo di ogni risultato');
  assert.equal(P.btn('+ Classe').disabled, true);
  assert.equal(P.btn('Elimina gruppo').disabled, true);
  H.type(search, 'xyzxyz');
  assert.match(P.panel.querySelector('.rows .empty').textContent, /Nessuna classe trovata/);
  H.type(search, '');
  assert.equal(P.title(), seed.classi.gruppi[0].nome);
  assert.equal(P.btn('+ Classe').disabled, false);
});

test('Classi: uscire con modifiche non salvate, e provare classi non salvate', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  H.click(P.btn('+ Classe'));
  const row = P.panel.querySelector('li.row.editing');
  H.type(row.querySelectorAll('input[type="text"]')[0], 'md-bozza');
  H.type(row.querySelector('textarea'), '.md-bozza { outline: 3px solid hotpink; }');
  H.type(P.sandbox, '<p class="md-bozza">x</p>');
  await H.waitFor(() => P.frame.srcdoc.includes('hotpink') && P.frame.srcdoc.includes('class="md-bozza"'), 'prova con classe non salvata');
  assert.ok(!P.css().includes('hotpink'), 'su disco non c\'è');

  H.click(H.d.getElementById('tab-root'));
  let dlg = await H.dialog();
  assert.match(dlg.textContent, /Classi/);
  H.click(H.button(dlg, 'Annulla'));
  await H.noDialog();
  assert.equal(H.d.getElementById('tab-classi').getAttribute('aria-selected'), 'true');

  H.click(H.d.getElementById('tab-root'));
  await H.answer('Scarta le modifiche');
  await H.waitFor(() => H.d.getElementById('tab-root').getAttribute('aria-selected') === 'true', 'passa a Root');
  await H.showTab('classi');
  assert.equal(P.row('md-bozza'), undefined, 'la bozza scartata non torna');
  assert.equal(P.status(), 'Tutto salvato');
});

test('Classi: esporta il file CSS con la bozza', async (t) => {
  const P = await open();
  t.after(() => P.H.close());
  const { H } = P;
  const out = path.join(H.base, 'classi-esportate.css');
  H.state.saveFile = null;
  H.click(P.btn('Esporta file CSS'));
  await H.sleep(100);
  assert.equal(fs.existsSync(out), false);
  H.click(P.btn('+ Classe'));
  const row = P.panel.querySelector('li.row.editing');
  H.type(row.querySelectorAll('input[type="text"]')[0], 'md-esporta');
  H.type(row.querySelector('textarea'), '.md-esporta { color: red; }');
  H.state.saveFile = out;
  H.click(P.btn('Esporta file CSS'));
  await H.waitFor(() => /Salvato in/.test(H.toast()), 'esportato');
  assert.match(read(out), /\.md-esporta \{ color: red; \}/);
  assert.ok(!P.css().includes('md-esporta'), 'il file nei dati non cambia: serve Salva');
});
