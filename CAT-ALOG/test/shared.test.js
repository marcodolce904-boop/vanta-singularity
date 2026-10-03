'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../lib/shared');
const seed = require('../lib/seed');

test('slugify toglie accenti e simboli', () => {
  assert.equal(S.slugify('Perché è così!'), 'perche-e-cosi');
  assert.equal(S.slugify('Card (copia)'), 'card-copia');
  assert.equal(S.slugify('   '), 'senza-nome');
  assert.equal(S.slugify('???'), 'senza-nome');
  assert.ok(S.slugify('a'.repeat(200)).length <= 60);
});

test('uniqueSlug aggiunge un numero solo se serve', () => {
  assert.equal(S.uniqueSlug('a', ['a']), 'a-2');
  assert.equal(S.uniqueSlug('a', new Set(['a', 'a-2'])), 'a-3');
  assert.equal(S.uniqueSlug('b', ['a']), 'b');
});

test('isValidId blocca i percorsi pericolosi', () => {
  ['../x', 'a/b', 'a\\b', '', '.', '..', 'A', '-a', 'a b', null, undefined, 42, 'x'.repeat(81)].forEach((id) => {
    assert.equal(S.isValidId(id), false, String(id));
  });
  ['a', 'a-1', '0abc', 'x'.repeat(80)].forEach((id) => assert.equal(S.isValidId(id), true, id));
});

test('colori: normalizeHex e contrasto', () => {
  assert.equal(S.normalizeHex('#FFF'), '#ffffff');
  assert.equal(S.normalizeHex('abc'), '#aabbcc');
  assert.equal(S.normalizeHex(' #1F5F46 '), '#1f5f46');
  assert.equal(S.normalizeHex('red'), null);
  assert.equal(S.normalizeHex('#12345'), null);
  assert.equal(S.normalizeHex(5), null);
  assert.equal(Math.round(S.contrastRatio('#000', '#fff')), 21);
  assert.equal(S.contrastRatio('#fff', 'red'), null);
  assert.ok(S.contrastRatio('#777777', '#ffffff') < 4.5);
  assert.ok(S.contrastRatio('#767676', '#ffffff') >= 4.5);
});

test('validaVariabile accetta valori CSS veri e rifiuta quelli pericolosi', () => {
  const ok = (nome, valore) => assert.equal(S.validaVariabile({ nome, valore }), null, nome + ': ' + valore);
  const ko = (nome, valore) => assert.notEqual(S.validaVariabile({ nome, valore }), null, nome + ': ' + valore);
  ok('--md-color-primary', '#2f6f4e');
  ok('--md-font', '"Inter", system-ui, sans-serif');
  ok('--md-text', 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)');
  ok('--md-img', 'url("a;b.png")');
  ok('--md-label', '"a;b"');
  ko('md-color', '#fff');
  ko('--', '#fff');
  ko('--a b', '#fff');
  ko('--a', '');
  ko('--a', '   ');
  ko('--a', 'red; } body { display: none');
  ko('--a', 'red }');
  ko('--a', 'red\nblue');
});

test('un valore come 700 non è un colore: serve il # davanti', () => {
  ['#fff', '#FFFFFF', ' #123abc '].forEach((v) => assert.equal(S.isHexColor(v), true, v));
  ['700', '400', 'fff', '123456', '#ffff', '#12', 'red', 5, null].forEach((v) => assert.equal(S.isHexColor(v), false, String(v)));
  assert.match(S.validaVariabile({ nome: '--c', valore: 'fff', tipo: 'colore' }), /Manca il #/);
  assert.equal(S.validaVariabile({ nome: '--c', valore: '#fff', tipo: 'colore' }), null);
  assert.equal(S.validaVariabile({ nome: '--weight', valore: '700', tipo: 'testo' }), null);
  const root = S.normalizeRoot({
    gruppi: [{ nome: 'x', variabili: [{ nome: '--md-weight-bold', valore: '700' }, { nome: '--md-text-weight', valore: '400' }, { nome: '--md-color-bg', valore: '#ffffff' }] }]
  });
  assert.equal(S.toTokens(root).global.weight.bold.type, 'fontWeights');
  assert.deepEqual(S.contrastReport(root), [], 'i numeri non diventano colori');
});

test('validaClasseNome', () => {
  ['md-center', '_x', '-x', 'a1'].forEach((n) => assert.equal(S.validaClasseNome(n), true, n));
  ['', '1a', '.md', 'a b', 'a.b', 'a>b'].forEach((n) => assert.equal(S.validaClasseNome(n), false, n));
});

test('buildRootCss salta le variabili non valide', () => {
  const css = S.buildRootCss(
    S.normalizeRoot({
      gruppi: [
        {
          nome: 'Colori */ body{}',
          variabili: [
            { nome: '--a', valore: '#fff' },
            { nome: '--cattiva', valore: 'red; } body { display: none' },
            { nome: '--b', valore: ' 1rem ' }
          ]
        },
        { nome: 'Vuoto', variabili: [{ nome: 'senza-trattini', valore: '1' }] }
      ]
    })
  );
  assert.match(css, /:root \{/);
  assert.match(css, /--a: #fff;/);
  assert.match(css, /--b: 1rem;/);
  assert.doesNotMatch(css, /cattiva/);
  assert.doesNotMatch(css, /Vuoto/);
  assert.doesNotMatch(css, /\*\/ body/);
  assert.ok(css.endsWith('}\n'));
});

test('buildClassiCss può filtrare per gruppo', () => {
  const classi = S.normalizeClassi({
    gruppi: [
      { id: 'g1', nome: 'Uno', classi: [{ nome: 'a', css: '.a { color: red; }' }] },
      { id: 'g2', nome: 'Due', classi: [{ nome: 'b', css: '.b { color: blue; }' }] },
      { id: 'g3', nome: 'Vuoto', classi: [{ nome: 'c', css: '' }] }
    ]
  });
  const tutto = S.buildClassiCss(classi);
  assert.match(tutto, /\.a \{/);
  assert.match(tutto, /\.b \{/);
  assert.doesNotMatch(tutto, /Vuoto/);
  const solo = S.buildClassiCss(classi, { gruppiIds: ['g2'] });
  assert.doesNotMatch(solo, /\.a \{/);
  assert.match(solo, /\.b \{/);
});

test('normalize* non si rompe con dati sporchi', () => {
  assert.deepEqual(S.normalizeClassi(null).gruppi, []);
  assert.deepEqual(S.normalizeRoot({ gruppi: 'no' }).gruppi, []);
  const r = S.normalizeRoot({ gruppi: [{ variabili: [{ nome: ' --a ', valore: 5, tipo: 'boh' }, null] }] });
  assert.equal(r.gruppi[0].nome, 'Senza nome');
  assert.equal(r.gruppi[0].variabili[0].nome, '--a');
  assert.equal(r.gruppi[0].variabili[0].valore, '5');
  assert.equal(r.gruppi[0].variabili[0].tipo, 'testo');
  assert.ok(r.gruppi[0].variabili[0].id);
});

test('toTokens: nomi che sono prefisso di altri non si sovrascrivono', () => {
  const t = S.toTokens(
    S.normalizeRoot({
      gruppi: [
        {
          nome: 'x',
          variabili: [
            { nome: '--md-color-text', valore: '#111111', tipo: 'colore' },
            { nome: '--md-color-text-muted', valore: '#666666', tipo: 'colore' },
            { nome: '--md-space-1', valore: '0.25rem' },
            { nome: '--md-space', valore: '1rem' },
            { nome: '--md-radius-sm', valore: '4px' }
          ]
        }
      ]
    })
  );
  assert.equal(t.global.color.text.base.value, '#111111');
  assert.equal(t.global.color.text.muted.value, '#666666');
  assert.equal(t.global.color.text.muted.type, 'color');
  assert.equal(t.global.space.base.value, '1rem');
  assert.equal(t.global.space['1'].value, '0.25rem');
  assert.equal(t.global.space['1'].type, 'spacing');
  assert.equal(t.global.radius.sm.type, 'borderRadius');
});

test('contrastReport legge i colori dai nomi', () => {
  const rep = S.contrastReport(S.normalizeRoot(seed.root));
  assert.ok(rep.length > 0);
  const pair = rep.find((r) => r.primo === '--md-color-text' && r.sfondo === '--md-color-bg');
  assert.ok(pair && pair.ok && pair.soglia === 4.5);
  rep.forEach((r) => {
    assert.equal(typeof r.rapporto, 'number');
    assert.equal(r.ok, r.rapporto >= r.soglia);
  });
  const nessuno = S.contrastReport(S.normalizeRoot({ gruppi: [{ nome: 'a', variabili: [{ nome: '--x', valore: '1' }] }] }));
  assert.deepEqual(nessuno, []);
  const bad = S.contrastReport(
    S.normalizeRoot({
      gruppi: [{ nome: 'a', variabili: [{ nome: '--c-text', valore: '#777777' }, { nome: '--c-bg', valore: '#ffffff' }] }]
    })
  );
  assert.equal(bad.length, 1);
  assert.equal(bad[0].ok, false);
});

test('buildPreviewDoc non lascia chiudere script e style dall\'interno', () => {
  const { JSDOM } = require('jsdom');
  const doc = S.buildPreviewDoc({
    html: '<p>x</p>',
    css: 'p{}</style><b id="iniettato-css">x</b>',
    js: 'var a = "</script><i id=\'iniettato-js\'>";',
    rootCss: ':root{}',
    classiCss: '.a{}'
  });
  const dom = new JSDOM(doc);
  const d = dom.window.document;
  assert.equal(d.querySelectorAll('style').length, 4);
  assert.equal(d.querySelectorAll('script').length, 1);
  assert.equal(d.querySelector('#iniettato-css'), null);
  assert.equal(d.querySelector('#iniettato-js'), null);
  assert.equal(d.body.querySelectorAll('p').length, 1);
  assert.match(d.querySelector('script').textContent, /var a = "<\\\/script>/);
  assert.equal(S.buildPreviewDoc({ html: 'a' }).includes('<script>'), false);
});

test('buildFullPage collega i file giusti', () => {
  const page = S.buildFullPage({ titolo: 'A "b" <c>', html: '<p>ciao</p>\n\n', js: true, links: ['../root.css'] });
  assert.match(page, /<title>A &quot;b&quot; &lt;c&gt;<\/title>/);
  assert.ok(page.indexOf('../root.css') < page.indexOf('style.css'));
  assert.match(page, /<script src="script\.js"><\/script>/);
  assert.match(page, /<html lang="it">/);
  assert.equal(S.buildFullPage({ titolo: 'x', html: '', js: false }).includes('script.js'), false);
});

test('i dati di esempio sono validi', () => {
  const root = S.normalizeRoot(seed.root);
  const nomi = new Set();
  root.gruppi.forEach((g) =>
    g.variabili.forEach((v) => {
      assert.equal(S.validaVariabile(v), null, v.nome);
      assert.ok(!nomi.has(v.nome), 'duplicata ' + v.nome);
      nomi.add(v.nome);
    })
  );
  const classi = S.normalizeClassi(seed.classi);
  const visti = new Set();
  classi.gruppi.forEach((g) =>
    g.classi.forEach((c) => {
      assert.ok(S.validaClasseNome(c.nome), c.nome);
      assert.ok(!visti.has(c.nome), 'duplicata ' + c.nome);
      visti.add(c.nome);
    })
  );
});
