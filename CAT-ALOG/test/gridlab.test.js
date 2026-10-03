'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../lib/gridlab');

const txt = (s) => s.areas.map((r) => r.join(' ')).join(' | ');

test('griglia: i cinque layout di partenza sono validi', () => {
  assert.deepEqual(G.PRESETS.map((p) => p.nome), ['Holy grail', 'Sidebar', 'Dashboard', 'Magazine', 'Hero']);
  G.PRESETS.forEach((p) => {
    const s = G.fromPreset(p.id);
    assert.ok(G.isValid(s.areas), p.id);
    assert.equal(s.cols.length, s.areas[0].length, p.id + ' colonne');
    assert.equal(s.rows.length, s.areas.length, p.id + ' righe');
    assert.deepEqual(G.placed(s), ['header', 'nav', 'main', 'aside', 'footer'].filter((n) => G.rectOf(s.areas, n)));
  });
  const hg = G.fromPreset('holy-grail');
  assert.equal(txt(hg), 'header header header | nav main aside | footer footer footer');
  assert.deepEqual(G.rectOf(hg.areas, 'header'), { r1: 0, c1: 0, r2: 0, c2: 2 });
});

test('griglia: scambiare due aree, anche di forma diversa, mantiene tutto valido', () => {
  const hg = G.fromPreset('holy-grail');
  const s = G.swap(hg, 'nav', 'footer');
  assert.equal(txt(s), 'header header header | footer main aside | nav nav nav');
  assert.ok(G.isValid(s.areas));
  assert.equal(txt(hg), 'header header header | nav main aside | footer footer footer', 'l\'originale non cambia');
  assert.equal(G.swap(hg, 'nav', 'nav'), hg);
  G.PRESETS.forEach((p) => {
    const base = G.fromPreset(p.id);
    const names = G.placed(base);
    names.forEach((a) => names.forEach((b) => assert.ok(G.isValid(G.swap(base, a, b).areas), p.id + ' ' + a + '<->' + b)));
  });
});

test('griglia: spostare in una cella libera, allargare e restringere', () => {
  let s = G.fromPreset('magazine');
  s = G.removeTrack(s, 'cols').state;
  assert.equal(txt(s), 'header header | main main | footer nav');
  assert.equal(G.rectOf(s.areas, 'aside'), null, 'aside è sparita con la colonna');
  s = G.addTrack(s, 'cols');
  assert.equal(txt(s), 'header header . | main main . | footer nav .');
  assert.equal(txt(G.moveTo(s, 'nav', 0, 2)), 'header header nav | main main . | footer . .');
  const moved = G.moveTo(s, 'nav', 2, 2);
  assert.equal(txt(moved), 'header header . | main main . | footer . nav');
  assert.equal(G.moveTo(s, 'nav', 0, 0), null, 'cella occupata');
  assert.equal(G.moveTo(s, 'header', 1, 1), null, 'il rettangolo largo 2 non ci sta');
  const grown = G.resizeTo(s, 'nav', 2, 2);
  assert.equal(txt(grown), 'header header . | main main . | footer nav nav');
  assert.ok(G.isValid(grown.areas));
  const tall = G.resizeTo(grown, 'nav', 2, 2);
  assert.equal(tall, grown, 'stessa misura: nessuna modifica');
  assert.equal(G.resizeTo(s, 'footer', 2, 1), null, 'footer non può mangiare nav');
  const shrunk = G.resizeTo(G.fromPreset('holy-grail'), 'header', 0, 0);
  assert.equal(txt(shrunk), 'header . . | nav main aside | footer footer footer');
  assert.equal(G.resizeTo(shrunk, 'header', 5, 5), null, 'fuori dalla griglia');
});

test('griglia: tastiera, frecce per spostare e allargare', () => {
  let s = G.fromPreset('holy-grail');
  assert.equal(txt(G.nudge(s, 'nav', 0, 1)), 'header header header | main nav aside | footer footer footer', 'scambia con il vicino a destra');
  assert.equal(G.nudge(s, 'nav', 0, -1), null, 'a sinistra non c\'è niente');
  assert.equal(txt(G.nudge(s, 'nav', 1, 0)), 'header header header | footer main aside | nav nav nav');
  s = G.addTrack(G.fromPreset('holy-grail'), 'cols');
  assert.equal(txt(G.nudge(s, 'aside', 0, 1)), 'header header header . | nav main . aside | footer footer footer .', 'si sposta nella cella libera');
  assert.equal(txt(G.stretch(s, 'aside', 0, 1)), 'header header header . | nav main aside aside | footer footer footer .');
  assert.equal(txt(G.stretch(G.stretch(s, 'aside', 0, 1), 'aside', 0, -1)), txt(s));
  assert.equal(G.stretch(s, 'aside', -1, 0), null, 'non si restringe sotto una cella');
});

test('griglia: righe e colonne, valori validi, aree tolte e rimesse', () => {
  ['1fr', '240px', '50%', 'auto', 'min-content', 'max-content', '2.5rem', 'minmax(100px, 1fr)', 'fit-content(30ch)', '0'].forEach((v) => assert.ok(G.validTrack(v), v));
  ['', 'abc', '10', '1 fr', 'calc(1px)', 'url(x)', '1fr 2fr', 'minmax(1fr,'].forEach((v) => assert.ok(!G.validTrack(v), v));
  const s = G.fromPreset('holy-grail');
  assert.deepEqual(G.setTrack(s, 'cols', 1, ' 2FR ').cols, ['1fr', '2fr', '1fr']);
  assert.equal(G.setTrack(s, 'cols', 1, 'boh'), null);
  assert.equal(G.setTrack(s, 'cols', 9, '1fr'), null);

  const r = G.removeTrack(s, 'rows');
  assert.deepEqual(r.tolte, ['footer']);
  assert.equal(txt(r.state), 'header header header | nav main aside');
  const back = G.addTrack(r.state, 'rows');
  const re = G.place(back, 'footer');
  assert.equal(txt(re), 'header header header | nav main aside | footer . .');
  assert.equal(G.place(re, 'footer'), null, 'già in griglia');
  assert.equal(G.place(r.state, 'footer'), null, 'nessuna cella libera');
  assert.deepEqual(G.unplaced(r.state), ['footer']);
  assert.equal(G.removeTrack(G.fromPreset('sidebar'), 'cols').state.cols.length, 1);
  assert.equal(G.removeTrack(G.removeTrack(G.fromPreset('sidebar'), 'cols').state, 'cols'), null, 'minimo una colonna');
  let big = s;
  for (let i = 0; i < 10; i++) big = G.addTrack(big, 'cols') || big;
  assert.equal(big.cols.length, 8, 'massimo otto');
});

test('griglia: CSS e HTML generati', () => {
  const s = G.fromPreset('holy-grail');
  const css = G.buildCss(s);
  assert.match(css, /^\.layout \{\n  display: grid;\n  grid-template-columns: 1fr 3fr 1fr;\n  grid-template-rows: 1fr 3fr 1fr;\n  gap: 12px;\n  place-items: stretch;\n  grid-template-areas:\n    "header header header"\n    "nav main aside"\n    "footer footer footer";\n\}/);
  assert.match(css, /\.layout > \.header \{ grid-area: header; \}/);
  assert.match(css, /@media \(max-width: 767\.98px\)[\s\S]*"header"\n      "nav"\n      "main"\n      "aside"\n      "footer";/);
  assert.match(css, /border: 1px solid var\(--cat-color-border, #8f8f8f\)/);
  assert.doesNotMatch(G.buildCss(s, { base: false, stack: false }), /@media|border:/);
  const s2 = Object.assign(G.clone(s), { colGap: 8, rowGap: 20, place: 'center' });
  assert.match(G.buildCss(s2), /gap: 20px 8px;\n  place-items: center;/);
  const html = G.buildHtml(s);
  assert.equal(html, '<div class="layout">\n  <header class="header">Intestazione</header>\n  <nav class="nav">Navigazione</nav>\n  <main class="main">Contenuto principale</main>\n  <aside class="aside">Colonna laterale</aside>\n  <footer class="footer">Piè di pagina</footer>\n</div>\n');
  assert.equal(G.buildHtml(G.removeTrack(s, 'rows').state).includes('footer'), false);
  assert.match(G.buildCss(s, { cls: 'pagina' }), /^\.pagina \{/);
});
