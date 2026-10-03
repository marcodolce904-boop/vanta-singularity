'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { boot } = require('./helpers/boot');

const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');

function pick(H, kind, nome) {
  const panel = H.tab(kind);
  return {
    panel,
    items: () => Array.from(panel.querySelectorAll('.list-btn')),
    item: (n) => H.find(panel, '.list-btn', n),
    current: () => panel.querySelector('.list-btn[aria-current="true"]'),
    code: panel.querySelector('textarea.code'),
    status: () => panel.querySelector('.col-editor .status').textContent,
    nome: panel.querySelector('.col-editor input[type="text"]'),
    frame: panel.querySelector('iframe'),
    btn: (t) => H.button(panel, t)
  };
}

async function open(H, kind, nome) {
  const P = pick(H, kind);
  if (kind !== 'strutture') await H.showTab(kind);
  H.click(P.item(nome));
  await H.waitFor(() => P.current() && P.current().textContent.startsWith(nome), 'elemento ' + nome);
  return P;
}

test('modificare HTML e CSS e salvare scrive i file veri', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const P = await open(H, 'strutture', 'Due colonne');
  const id = 'due-colonne-50-50';
  assert.match(P.code.value, /cat-cols-2/);
  assert.equal(P.status(), 'Tutto salvato');

  H.type(P.code, '<div class="cat-cols-2"><p>NUOVO</p></div>');
  assert.match(P.status(), /Modifiche non salvate/);
  await H.waitFor(() => P.frame.srcdoc.includes('NUOVO'), 'anteprima aggiornata');

  H.click(P.btn('CSS'));
  assert.equal(P.btn('CSS').getAttribute('aria-pressed'), 'true');
  assert.equal(P.btn('HTML').getAttribute('aria-pressed'), 'false');
  assert.match(P.code.value, /display: flex/);
  H.type(P.code, '.cat-cols-2 { display: grid; }');

  H.click(P.btn('Salva'));
  await H.waitFor(() => P.status() === 'Tutto salvato', 'salvataggio');
  assert.equal(read(H.dataDir, 'strutture', id, 'markup.html'), '<div class="cat-cols-2"><p>NUOVO</p></div>');
  assert.equal(read(H.dataDir, 'strutture', id, 'style.css'), '.cat-cols-2 { display: grid; }');
  assert.equal(H.toast(), 'Salvato');

  // tornando all'HTML dopo il salvataggio si vede il testo salvato
  H.click(P.btn('HTML'));
  assert.match(P.code.value, /NUOVO/);
  assert.deepEqual(H.state.errors, []);
});

test('Strutture non ha il JS, Componenti sì', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const names = (panel) => Array.from(panel.querySelectorAll('.code-tabs button')).map((b) => b.textContent);
  assert.deepEqual(names(H.tab('strutture')), ['HTML', 'CSS']);
  assert.ok(!H.button(H.tab('strutture'), 'Copia JS'));
  await H.showTab('componenti');
  assert.deepEqual(names(H.tab('componenti')), ['HTML', 'CSS', 'JS']);
  assert.ok(H.button(H.tab('componenti'), 'Copia JS'));

  const P = await open(H, 'componenti', 'Accordion');
  H.click(P.btn('JS'));
  assert.ok(P.code.value.trim().length > 10, 'il JS del componente è caricato');
  H.type(P.code, 'console.log("ciao");');
  H.click(P.btn('Salva'));
  await H.waitFor(() => P.status() === 'Tutto salvato');
  assert.equal(read(H.dataDir, 'componenti', 'accordion', 'script.js'), 'console.log("ciao");');
  await H.waitFor(() => P.frame.srcdoc.includes('console.log("ciao");'), 'il JS entra nell\'anteprima');
  assert.deepEqual(H.state.errors, []);
});

test('modifiche non salvate: annulla, scarta, salva e continua', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const P = await open(H, 'strutture', 'Due colonne');
  const first = P.current().textContent;
  const other = P.items().find((b) => b.textContent !== first);
  const otherName = other.textContent;

  H.type(P.code, 'MODIFICATO A MANO');
  H.click(other);
  let dlg = await H.dialog();
  assert.match(dlg.textContent, /Modifiche non salvate/);
  H.click(H.button(dlg, 'Annulla'));
  await H.noDialog();
  assert.equal(P.current().textContent, first, 'resta sull\'elemento di prima');
  assert.equal(P.code.value, 'MODIFICATO A MANO', 'la modifica non si perde');

  H.click(other);
  await H.answer('Scarta le modifiche');
  await H.waitFor(() => P.current().textContent === otherName, 'passa all\'altro');
  assert.doesNotMatch(read(H.dataDir, 'strutture', 'due-colonne-50-50', 'markup.html'), /MODIFICATO/);

  H.type(P.code, 'SALVATO DAL DIALOGO');
  H.click(P.item('Due colonne'));
  await H.answer('Salva e continua');
  await H.waitFor(() => P.current().textContent.startsWith('Due colonne'), 'torna alla prima');
  const salvato = fs
    .readdirSync(path.join(H.dataDir, 'strutture'))
    .find((dir) => read(H.dataDir, 'strutture', dir, 'markup.html') === 'SALVATO DAL DIALOGO');
  assert.ok(salvato, 'il testo è stato salvato');
  assert.notEqual(salvato, 'due-colonne-50-50', 'sull\'elemento che stavo modificando, non su quello di destinazione');
  assert.deepEqual(H.state.errors, []);
});

test('«+ Nuovo» chiede il nome e crea la cartella', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const P = pick(H, 'strutture');
  const prima = P.items().length;
  H.click(P.btn('+ Nuovo'));
  let dlg = await H.dialog();
  H.click(H.button(dlg, 'Crea'));
  await H.waitFor(() => /Scrivi un nome/.test(dlg.textContent), 'errore nome vuoto');
  assert.ok(d(H).querySelector('dialog.modal'), 'la finestra resta aperta');
  H.type(dlg.querySelector('[name="nome"]'), 'La mia Griglia');
  H.click(H.button(dlg, 'Crea'));
  await H.noDialog();
  await H.waitFor(() => P.items().length === prima + 1, 'nuovo elemento in elenco');
  assert.ok(fs.existsSync(path.join(H.dataDir, 'strutture', 'la-mia-griglia', 'meta.json')));
  assert.equal(P.current().textContent.startsWith('La mia Griglia'), true);
  assert.equal(P.nome.value, 'La mia Griglia');
  assert.equal(P.code.value, '');
  assert.equal(P.status(), 'Tutto salvato');

  // Esc chiude la finestra senza creare niente
  H.click(P.btn('+ Nuovo'));
  dlg = await H.dialog();
  H.key(dlg, 'Escape');
  await H.noDialog();
  assert.equal(P.items().length, prima + 1);
  assert.deepEqual(H.state.errors, []);
});

function d(H) {
  return H.d;
}

test('duplica ed elimina (con conferma, nel cestino)', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const P = await open(H, 'strutture', 'Due colonne');
  const prima = P.items().length;

  H.click(P.btn('Duplica'));
  await H.waitFor(() => P.items().length === prima + 1, 'copia creata');
  assert.match(P.nome.value, /\(copia\)/);
  assert.ok(fs.existsSync(path.join(H.dataDir, 'strutture', 'due-colonne-50-50-copia')));

  H.click(P.btn('Elimina'));
  let dlg = await H.dialog();
  assert.match(dlg.textContent, /_cestino/);
  H.click(H.button(dlg, 'Annulla'));
  await H.noDialog();
  assert.equal(P.items().length, prima + 1);

  H.click(P.btn('Elimina'));
  await H.answer('Sposta nel cestino');
  await H.waitFor(() => P.items().length === prima, 'elemento tolto');
  assert.equal(fs.existsSync(path.join(H.dataDir, 'strutture', 'due-colonne-50-50-copia')), false);
  assert.ok(fs.readdirSync(path.join(H.dataDir, '_cestino')).some((n) => n.startsWith('strutture-due-colonne-50-50-copia')));
  assert.equal(P.panel.classList.contains('no-selection'), true);
  assert.equal(P.current(), null);
  assert.deepEqual(H.state.errors, []);
});

test('copia HTML, CSS, JS e tutto negli appunti', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const P = await open(H, 'componenti', 'Accordion');
  const html = read(H.dataDir, 'componenti', 'accordion', 'markup.html');
  const css = read(H.dataDir, 'componenti', 'accordion', 'style.css');
  const js = read(H.dataDir, 'componenti', 'accordion', 'script.js');

  H.click(P.btn('Copia HTML'));
  await H.waitFor(() => H.state.clip.length === 1);
  assert.equal(H.state.clip[0], html);
  await H.waitFor(() => /HTML copiato/.test(H.toast()), 'avviso di copia');
  H.click(P.btn('Copia CSS'));
  H.click(P.btn('Copia JS'));
  H.click(P.btn('Copia tutto'));
  await H.waitFor(() => H.state.clip.length === 4);
  assert.equal(H.state.clip[1], css);
  assert.equal(H.state.clip[2], js);
  const all = H.state.clip[3];
  assert.ok(all.indexOf('<style>') < all.indexOf(html.trim().slice(0, 20)));
  assert.ok(all.indexOf(html.trim().slice(0, 20)) < all.indexOf('<script>'));
  assert.ok(all.includes(css.trim()) && all.includes(js.trim()));

  // copia quello che si vede, anche non salvato
  H.type(P.code, 'ULTIMA');
  H.click(P.btn('JS'));
  H.type(P.code, 'let x;');
  H.click(P.btn('Copia JS'));
  await H.waitFor(() => H.state.clip.length === 5);
  assert.equal(H.state.clip[4], 'let x;');
});

test('esporta cartella: pagina completa con i file separati', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const P = await open(H, 'componenti', 'Accordion');
  const dest = path.join(H.base, 'fuori');
  fs.mkdirSync(dest);
  H.state.folder = null;
  H.click(P.btn('Esporta cartella'));
  await H.sleep(100);
  assert.deepEqual(fs.readdirSync(dest), [], 'dialogo annullato: niente file');
  H.state.folder = dest;
  H.click(P.btn('Esporta cartella'));
  await H.waitFor(() => /Esportato in/.test(H.toast()), 'esportato');
  const dir = path.join(dest, 'accordion');
  assert.deepEqual(fs.readdirSync(dir).sort(), ['index.html', 'script.js', 'style.css']);
  assert.match(read(dir, 'index.html'), /<script src="script.js">/);
});

test('ricerca, ripristina e Ctrl+S', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const P = await open(H, 'strutture', 'Due colonne');
  const search = P.panel.querySelector('input[type="search"]');
  const tutti = P.items().length;

  H.type(search, 'DUE colonne 50');
  assert.equal(P.items().length, 1);
  H.type(search, 'zzzz');
  assert.equal(P.items().length, 0);
  assert.match(P.panel.querySelector('.list').textContent, /Nessun risultato/);
  H.type(search, 'perche');
  H.type(search, '');
  assert.equal(P.items().length, tutti);

  H.click(P.btn('Ripristina'));
  assert.match(H.toast(), /Non ci sono modifiche/);

  H.type(P.nome, 'Altro nome');
  H.click(P.btn('Ripristina'));
  await H.answer('Annulla le modifiche');
  assert.equal(P.nome.value, 'Due colonne 50/50');
  assert.equal(P.status(), 'Tutto salvato');

  H.type(P.nome, 'Nome con scorciatoia');
  H.key(H.d.body, 's', { ctrlKey: true });
  await H.waitFor(() => P.status() === 'Tutto salvato', 'Ctrl+S');
  assert.equal(JSON.parse(read(H.dataDir, 'strutture', 'due-colonne-50-50', 'meta.json')).nome, 'Nome con scorciatoia');
  assert.ok(H.find(P.panel, '.list-btn', 'Nome con scorciatoia'), 'l\'elenco mostra il nuovo nome');
  assert.deepEqual(H.state.errors, []);
});

test('il campo del codice: Tab mette due spazi, Esc poi Tab esce', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const P = await open(H, 'strutture', 'Due colonne');
  P.code.value = 'ab';
  P.code.setSelectionRange(1, 1);
  const ev = new H.w.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  P.code.dispatchEvent(ev);
  assert.equal(ev.defaultPrevented, true);
  assert.equal(P.code.value, 'a  b');
  assert.match(P.status(), /Modifiche non salvate/);

  H.key(P.code, 'Escape');
  const ev2 = new H.w.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  P.code.dispatchEvent(ev2);
  assert.equal(ev2.defaultPrevented, false, 'dopo Esc il Tab sposta il focus');
  const ev3 = new H.w.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
  P.code.dispatchEvent(ev3);
  assert.equal(ev3.defaultPrevented, false, 'Maiusc+Tab sposta sempre il focus');
});

test('anteprima: larghezze e uso di root e classi', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const P = await open(H, 'strutture', 'Due colonne');
  await H.waitFor(() => P.frame.srcdoc.includes(':root {'), 'root nell\'anteprima');
  assert.match(P.frame.srcdoc, /\.cat-flex \{/);
  const chk = P.panel.querySelector('.preview-bar input[type="checkbox"]');
  assert.equal(chk.checked, true);
  chk.checked = false;
  chk.dispatchEvent(new H.w.Event('change', { bubbles: true }));
  assert.doesNotMatch(P.frame.srcdoc, /:root \{/);
  assert.match(P.frame.srcdoc, /cat-cols-2__item/, 'il CSS della struttura resta');

  assert.equal(P.frame.style.width, '100%');
  H.click(P.btn('375 px'));
  assert.equal(P.frame.style.width, '375px');
  assert.equal(P.btn('375 px').getAttribute('aria-pressed'), 'true');
  H.click(P.btn('1280 px'));
  assert.equal(P.frame.style.width, '1280px');
  assert.equal(P.btn('375 px').getAttribute('aria-pressed'), 'false');
  H.click(P.btn('Piena'));
  assert.equal(P.frame.style.width, '100%');
});

test('gli errori dell\'API arrivano come messaggi leggibili', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const P = await open(H, 'strutture', 'Due colonne');
  fs.rmSync(path.join(H.dataDir, 'strutture', 'due-colonne-50-50'), { recursive: true });
  H.type(P.nome, 'x');
  H.click(P.btn('Salva'));
  await H.waitFor(() => /non trovato/.test(H.toast()), 'messaggio di errore');
  assert.doesNotMatch(H.toast(), /Error invoking/);
  assert.equal(H.d.getElementById('toast').className, 'errore');
  assert.match(P.status(), /Modifiche non salvate/, 'dopo un errore la bozza resta com\'era');
});

test('preferiti: stella, salvataggio su disco, filtro e ordine', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const P = await open(H, 'strutture', 'Due colonne');
  const star = P.panel.querySelector('.star-btn');
  assert.equal(star.getAttribute('aria-pressed'), 'false');
  H.click(star);
  assert.equal(star.getAttribute('aria-pressed'), 'true');
  assert.match(P.status(), /Modifiche non salvate/);
  H.click(P.btn('Salva'));
  await H.waitFor(() => P.status() === 'Tutto salvato', 'salvataggio');
  assert.equal(JSON.parse(read(H.dataDir, 'strutture', 'due-colonne-50-50', 'meta.json')).preferito, true);
  await H.waitFor(() => P.items()[0].textContent.startsWith('★ Due colonne 50/50'), 'preferiti in cima');

  const chk = P.panel.querySelector('.fav-filter input');
  chk.checked = true;
  chk.dispatchEvent(new H.w.Event('change', { bubbles: true }));
  assert.equal(P.items().length, 1);
  assert.deepEqual(H.state.errors, []);
});

test('Ctrl+K cerca in tutte le schede e apre l\'elemento', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  H.key(H.d.body, 'k', { ctrlKey: true });
  await H.waitFor(() => H.d.querySelector('dialog[open] .global-results .list-btn'), 'finestra di ricerca');
  const input = H.d.querySelector('dialog[open] input[type="search"]');
  H.type(input, 'bento');
  await H.waitFor(() => H.d.querySelectorAll('dialog[open] .global-results .list-btn').length === 1, 'un risultato');
  H.click(H.d.querySelector('dialog[open] .global-results .list-btn'));
  await H.waitFor(() => {
    const cur = H.tab('strutture').querySelector('.list-btn[aria-current="true"]');
    return cur && /Bento grid/.test(cur.textContent);
  }, 'elemento selezionato');
  assert.deepEqual(H.state.errors, []);
});

test('controllo qualità e opzioni di anteprima', async (t) => {
  const H = await boot();
  t.after(() => H.close());
  const P = await open(H, 'strutture', 'Due colonne');
  const box = P.panel.querySelector('.quality-box summary');
  assert.match(box.textContent, /Controllo qualità/);

  H.type(P.code, '<h1>a</h1><h1>b</h1><img src="x.png">');
  assert.match(box.textContent, /da vedere/);
  assert.match(P.panel.querySelector('.quality').textContent, /Un solo h1/);
  assert.equal(box.className, 'q-ko');

  H.click(P.btn('Scuro'));
  await H.waitFor(() => P.frame.srcdoc.includes('data-theme="dark"'), 'anteprima scura');
  H.click(P.btn('Senza animazioni'));
  await H.waitFor(() => P.frame.srcdoc.includes('animation:none!important'), 'senza animazioni');
  H.click(P.btn('Scuro'));
  await H.waitFor(() => !P.frame.srcdoc.includes('data-theme="dark"'), 'tema chiaro');
  H.click(P.btn('375 px'));
  H.click(P.btn('Ruota'));
  assert.equal(P.frame.style.width, '667px');
  assert.deepEqual(H.state.errors, []);
});
