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
  ok('--cat-color-primary', '#2f6f4e');
  ok('--cat-font', '"Inter", system-ui, sans-serif');
  ok('--cat-text', 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)');
  ok('--cat-img', 'url("a;b.png")');
  ok('--cat-label', '"a;b"');
  ko('cat-color', '#fff');
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
    gruppi: [{ nome: 'x', variabili: [{ nome: '--cat-weight-bold', valore: '700' }, { nome: '--cat-text-weight', valore: '400' }, { nome: '--cat-color-bg', valore: '#ffffff' }] }]
  });
  assert.equal(S.toTokens(root).global.weight.bold.type, 'fontWeights');
  assert.deepEqual(S.contrastReport(root), [], 'i numeri non diventano colori');
});

test('validaClasseNome', () => {
  ['cat-center', '_x', '-x', 'a1'].forEach((n) => assert.equal(S.validaClasseNome(n), true, n));
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
            { nome: '--cat-color-text', valore: '#111111', tipo: 'colore' },
            { nome: '--cat-color-text-muted', valore: '#666666', tipo: 'colore' },
            { nome: '--cat-space-1', valore: '0.25rem' },
            { nome: '--cat-space', valore: '1rem' },
            { nome: '--cat-radius-sm', valore: '4px' }
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
  const pair = rep.find((r) => r.primo === '--cat-color-text' && r.sfondo === '--cat-color-bg');
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

test('splitCode: pagina intera, blocchi di chat e React', () => {
  const page = '<!doctype html><html><head><title>x</title><style>p{color:red}</style></head><body><p>Ciao</p><script>run()</script></body></html>';
  const a = S.splitCode(page);
  assert.equal(a.html, '<p>Ciao</p>\n');
  assert.equal(a.css, 'p{color:red}\n');
  assert.equal(a.js, 'run()\n');

  const chat = 'ecco:\n```html\n<div class="a">x</div>\n```\n```css\n.a{margin:0}\n```\n```javascript\nconsole.log(1)\n```';
  const b = S.splitCode(chat);
  assert.equal(b.html, '<div class="a">x</div>\n');
  assert.equal(b.css, '.a{margin:0}\n');
  assert.equal(b.js, 'console.log(1)\n');

  assert.equal(S.splitCode('.a { color: red; }').css, '.a { color: red; }\n');
  const r = S.splitCode('```jsx\nimport React from "react";\nexport default function A(){ return <p className="a"/>; }\n```');
  assert.equal(r.avvisi.length, 1);
  assert.match(r.js, /React/);
  assert.deepEqual(S.splitCode(''), { html: '', css: '', js: '', avvisi: [] });
});

test('Root in altri formati: SCSS, JSON e override Bootstrap', () => {
  const root = S.normalizeRoot({
    gruppi: [{ nome: 'Colori', variabili: [
      { nome: '--cat-color-primary', valore: '#2f6f4e', tipo: 'colore' },
      { nome: '--cat-color-error', valore: '#b3261e', tipo: 'colore' },
      { nome: '--cat-radius-md', valore: '0.5rem' },
      { nome: '--cat-color-bg', valore: 'var(--cat-color-primary)' }
    ] }]
  });
  const scss = S.buildRootScss(root);
  assert.match(scss, /\$cat-color-primary: #2f6f4e;/);
  assert.match(scss, /\$cat-tokens: \(/);
  assert.deepEqual(JSON.parse(S.buildRootJson(root)), {
    '--cat-color-primary': '#2f6f4e', '--cat-color-error': '#b3261e', '--cat-radius-md': '0.5rem', '--cat-color-bg': 'var(--cat-color-primary)'
  });
  const bs = S.buildBootstrapOverride(root);
  assert.match(bs, /\$primary: #2f6f4e;/);
  assert.match(bs, /\$danger: #b3261e;/);
  assert.match(bs, /\$border-radius: 0\.5rem;/);
  assert.doesNotMatch(bs, /body-bg/, 'le var(...) si saltano');
  assert.match(S.buildBootstrapOverride({ gruppi: [] }), /Nessuna variabile riconosciuta/);
});

test('strumenti colore: scala, CMYK, daltonismo e versione scura', () => {
  const sc = S.colorScale('#2f6f4e');
  assert.equal(sc.length, 10);
  assert.deepEqual(sc.map((x) => x.passo), [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
  assert.ok(sc.every((x) => /^#[0-9a-f]{6}$/.test(x.hex)));
  const lum = (h) => S.contrastRatio(h, '#000000');
  assert.ok(lum(sc[0].hex) > lum(sc[5].hex) && lum(sc[5].hex) > lum(sc[9].hex), 'dal chiaro allo scuro');
  assert.equal(S.colorScale('non-un-colore'), null);

  assert.deepEqual(S.hexToCmyk('#000000'), { c: 0, m: 0, y: 0, k: 100 });
  assert.deepEqual(S.hexToCmyk('#ffffff'), { c: 0, m: 0, y: 0, k: 0 });
  assert.deepEqual(S.hexToCmyk('#ff0000'), { c: 0, m: 100, y: 100, k: 0 });

  assert.equal(S.simulateColorBlind('#ffffff', 'deuteranopia'), '#ffffff');
  assert.equal(S.simulateColorBlind('#000000', 'protanopia'), '#000000');
  const rosso = S.simulateColorBlind('#ff0000', 'protanopia');
  assert.notEqual(rosso, '#ff0000');
  assert.equal(S.simulateColorBlind('#ff0000', 'boh'), null);

  assert.equal(S.darkVariant('#ffffff'), '#000000');
  assert.equal(S.darkVariant('#000000'), '#ffffff');
});

const { JSDOM } = require('jsdom');
const parseHtml = (html) => new JSDOM('<!doctype html><body>' + html).window.document;
const q = (parts) => S.qualityCheck(parts, parseHtml);
const by = (res, id) => res.find((r) => r.id === id);

test('controllo qualità: errori su HTML e CSS problematici', () => {
  const bad = q({
    html: '<h1>a</h1><h1>b</h1><img src="x.png"><button></button><input type="text"><div id="a"></div><div id="a"></div>',
    css: '.a { color: #777777; background: #888888; outline: none; animation: x 1s; } @keyframes x { from { left: 0; } to { left: 10px; } }'
  });
  ['h1', 'alt', 'nomi', 'label', 'id', 'focus', 'contrasto'].forEach((id) => assert.equal(by(bad, id).stato, 'errore', id));
  assert.equal(by(bad, 'motion').stato, 'avviso');
  assert.equal(by(bad, 'props').stato, 'avviso');
});

test('controllo qualità: HTML e CSS a posto', () => {
  const good = q({
    html: '<h1>t</h1><img src="x.png" alt=""><button>Ok</button><label>Nome <input type="text"></label><a href="#" aria-label="Home"></a>',
    css: '.a { color: #000000; background: #ffffff; transition: opacity 200ms; } .a:focus-visible { outline: 3px solid red; } @media (prefers-reduced-motion: reduce) { .a { transition: none; } }'
  });
  assert.ok(good.every((r) => r.stato === 'ok'), JSON.stringify(good.filter((r) => r.stato !== 'ok')));
});

test('opzioni di anteprima: tema scuro, senza animazioni, griglia', () => {
  const doc = '<!doctype html><html lang="it"><head></head><body>x</body></html>';
  assert.equal(S.applyPreviewOptions(doc, {}), doc);
  const d = S.applyPreviewOptions(doc, { dark: true, still: true, grid: true });
  assert.match(d, /data-theme="dark"/);
  assert.match(d, /animation:none!important/);
  assert.match(d, /repeating-linear-gradient/);
  assert.ok(d.indexOf('<style>') < d.indexOf('</head>'));
});

test('tipografia: scala fluida, variabili e unione nel Root', () => {
  const sc = S.fluidScale({ minSize: 16, maxSize: 20, minRatio: 1.2, maxRatio: 1.25, minVw: 320, maxVw: 1240, giu: 2, su: 3 });
  assert.deepEqual(sc.map((x) => x.nome), ['xs', 'sm', 'base', 'lg', 'xl', '2xl']);
  const base = sc.find((x) => x.nome === 'base');
  assert.equal(base.min, 16);
  assert.equal(base.max, 20);
  assert.match(base.valore, /^clamp\(1rem, [0-9.]+rem \+ [0-9.]+vw, 1\.25rem\)$/);
  /* a 320 px il clamp vale il minimo, a 1240 px il massimo: intercept + slope * vw */
  const m = /clamp\(([\d.]+)rem, ([\d.]+)rem \+ ([\d.]+)vw/.exec(base.valore);
  const at = (vw) => (parseFloat(m[2]) * 16 + (parseFloat(m[3]) / 100) * vw);
  assert.ok(Math.abs(at(320) - 16) < 0.05 && Math.abs(at(1240) - 20) < 0.05, at(320) + ' ' + at(1240));
  assert.ok(sc.every((x, i) => i === 0 || x.min > sc[i - 1].min), 'cresce');
  const fisso = S.fluidScale({ minSize: 16, maxSize: 16, minRatio: 1, maxRatio: 1, giu: 0, su: 0 });
  assert.equal(fisso[0].valore, '1rem');
  assert.equal(S.fluidScale({ minSize: 'abc' }).length, 9, 'valori sbagliati: si usano i predefiniti');

  const vars = S.typographyVars({ lhTesto: 1.5 }, { titoli: '"Baloo 2", sans-serif', testo: 'Nunito, sans-serif' });
  assert.ok(vars.some((v) => v.nome === '--cat-font-heading' && /Baloo/.test(v.valore)));
  assert.ok(vars.some((v) => v.nome === '--cat-line-height' && v.valore === '1.5'));

  const root = S.normalizeRoot(seed.root);
  const prima = JSON.stringify(root);
  const r = S.mergeRootVars(root, vars, 'Tipografia');
  assert.ok(r.aggiornate >= 3, 'font e text-base/lg/xl esistevano');
  assert.ok(r.aggiunte >= 5);
  assert.equal(JSON.stringify(root), prima, 'l\'originale non cambia');
  const nomi = [];
  r.data.gruppi.forEach((g) => g.variabili.forEach((v) => nomi.push(v.nome)));
  assert.equal(new Set(nomi).size, nomi.length, 'nessun nome doppio');
  const again = S.mergeRootVars(r.data, vars, 'Tipografia');
  assert.equal(again.aggiunte, 0);
  assert.equal(again.aggiornate, 0);
});
