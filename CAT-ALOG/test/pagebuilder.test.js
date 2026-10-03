'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const PB = require('../lib/pagebuilder');

test('CSS: divide in blocchi (anche @media annidati) e toglie i doppioni', () => {
  const css = '/* x */\n.a { color: red; }\n@media (min-width: 10px) {\n  .a { color: blue; }\n  .b { margin: 0; }\n}\n@import url("x.css");\n.c::after { content: "}{"; }';
  const b = PB.splitCssBlocks(css);
  assert.equal(b.length, 4, JSON.stringify(b));
  assert.match(b[1], /^@media/);
  assert.match(b[1], /\.b \{ margin: 0; \}\n\}$/);
  assert.match(b[3], /content: "\}\{"/);

  const r = PB.dedupeCss([
    { nome: 'Uno', css: '.logo { height: 2rem; }\n.uno { color: red; }' },
    { nome: 'Due', css: '.logo{height:2rem}\n.due { color: blue; }' },
    { nome: 'Tre', css: '.logo { height: 2rem; }' }
  ]);
  assert.equal((r.css.match(/\.logo/g) || []).length, 1);
  assert.equal(r.tolti, 2);
  assert.ok(r.css.includes('/* Uno */') && r.css.includes('/* Due */') && !r.css.includes('/* Tre */'));
});

test('JS: ogni script ha il suo ambiente e un errore non ferma gli altri', () => {
  const js = PB.wrapJs('var x = 1;\nboom();', 'Sezione A');
  assert.match(js, /\(function \(\) \{\n  try \{/);
  assert.equal(PB.wrapJs('  ', 'x'), '');
  const out = [];
  const g = { console: { error: (...a) => out.push(a[0]) }, boom() { throw new Error('x'); } };
  new Function('console', 'boom', PB.wrapJs('var x = 1; boom();', 'A') + PB.wrapJs('var x = 2; out.push("B ok");', 'B').replace('out.push', 'console.error'))(g.console, g.boom);
  assert.deepEqual(out, ['A', 'B ok']);
});

test('pagina: collega i CSS, mette i JS in un file, avvisa su id doppi e più h1', () => {
  const secs = [
    { nome: 'Hero', html: '<section id="a"><h1>Ciao</h1><img src="assets/foto.png" alt=""></section>', css: '.hero { color: red; }', js: '' },
    { nome: 'Menu', html: '<nav id="a"><h1>Altro</h1></nav>', css: '.hero { color: red; }\n.menu { color: blue; }', js: 'var q = 1;' }
  ];
  const r = PB.assemble({ nome: 'Home', titolo: 'La mia "home"', descrizione: 'Descrizione', lingua: 'it', includi: { root: true, classi: true, responsive: false } }, secs, { prefisso: 'cat' });
  assert.match(r.html, /<title>La mia &quot;home&quot;<\/title>/);
  assert.match(r.html, /<link rel="stylesheet" href="css\/root\.css">/);
  assert.match(r.html, /href="css\/cat-classi\.css"/);
  assert.doesNotMatch(r.html, /responsive\.css/);
  assert.match(r.html, /href="css\/pagina\.css"/);
  assert.match(r.html, /<script src="js\/pagina\.js" defer><\/script>/);
  assert.equal((r.css.match(/\.hero/g) || []).length, 1);
  assert.ok(r.avvisi.some((a) => /Id ripetuti.*a/.test(a)));
  assert.ok(r.avvisi.some((a) => /2 titoli h1/.test(a)));
  assert.deepEqual(r.assets, ['foto.png']);
  assert.ok(PB.assemble({}, [], {}).avvisi[0].includes('non ha ancora sezioni'));

  const flat = PB.inlinePreview(r, ['body{margin:0}'], { 'foto.png': 'data:image/png;base64,AAA' });
  assert.doesNotMatch(flat, /<link rel="stylesheet"/);
  assert.match(flat, /<style>body\{margin:0\}/);
  assert.match(flat, /src="data:image\/png;base64,AAA"/);
  assert.match(flat, /<script>\/\* Menu \*\//);
});
