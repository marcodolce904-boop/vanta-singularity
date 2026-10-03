'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const I = require('../lib/icone');
const T = require('../lib/testi');
const Seo = require('../lib/seo');
const { JSDOM } = require('jsdom');

test('icone: ids unici, SVG validi e frammenti', () => {
  const ids = I.icone.map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(I.icone.length >= 70);
  I.icone.forEach((ic) => {
    const doc = new JSDOM('<!doctype html><body>' + I.svgInline(ic)).window.document;
    assert.ok(doc.querySelector('svg'), ic.id);
    assert.ok(doc.querySelector('svg').children.length >= 1, ic.id);
  });
  const home = I.icone.find((x) => x.id === 'home');
  assert.match(I.svgInline(home, { size: 32 }), /width="32" height="32"[^>]*aria-hidden="true"/);
  assert.match(I.svgInline(home, { label: 'Casa' }), /role="img" aria-label="Casa"/);
  assert.match(I.symbol(home), /^<symbol id="icon-home" viewBox="0 0 24 24">/);
  const sp = I.sprite([home, I.icone[1]]);
  assert.equal((sp.match(/<symbol /g) || []).length, 2);
  assert.match(I.useTag(home), /<use href="#icon-home"\/>/);
  assert.doesNotMatch(I.dataUri(home), /currentColor|#000"|"/, 'data uri senza virgolette né currentColor');
  assert.match(I.cssMask(home), /mask: url\("data:image\/svg\+xml,/);
});

test('icone: pulire un SVG incollato', () => {
  const r = I.cleanSvg('<?xml version="1.0"?><!-- c --><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24" onload="x()"><title>t</title><script>a()</script><a xlink:href="javascript:alert(1)"><path fill="#ff0000" stroke="black" d="M0 0h24v24H0z"/></a><image href="https://evil.example/x.png"/></svg>');
  assert.doesNotMatch(r.svg, /script|onload|javascript|evil|<!--|<\?xml|<title/i);
  assert.match(r.svg, /viewBox="0 0 24 24"/);
  assert.match(r.svg, /fill="currentColor"/);
  assert.match(r.svg, /stroke="currentColor"/);
  assert.match(r.svg, /aria-hidden="true"/);
  assert.ok(r.avvisi.length >= 3);
  assert.equal(I.cleanSvg('non è un svg').svg, '');
  const sized = I.cleanSvg('<svg viewBox="0 0 10 10" width="99" height="99"><path d="M0 0"/></svg>', { size: 20 });
  assert.match(sized.svg, /width="20" height="20"/);
  assert.doesNotMatch(sized.svg, /99/);
});

test('testi UI: chiavi uniche, coppie it/en ed esportazione JSON', () => {
  const k = T.lista().map((x) => x.voce.chiave);
  assert.equal(new Set(k).size, k.length);
  assert.ok(k.length >= 120);
  T.lista().forEach((x) => {
    if (x.voce.chiave.includes('immagine_decorativa')) return;
    assert.ok(x.voce.it && x.voce.en, x.voce.chiave);
  });
  const en = JSON.parse(T.buildJson('en'));
  assert.equal(en.azioni.invia, 'Send');
  assert.equal(JSON.parse(T.buildJson('it')).azioni.invia, 'Invia');
  assert.deepEqual(Object.keys(JSON.parse(T.buildJson('it', ['cta']))), ['cta']);
  assert.ok(!('immagine_decorativa' in en.accessibilita), 'le voci vuote non si esportano');
});

test('SEO: blocco head, controlli e dati strutturati', () => {
  const v = {
    titolo: 'Studio Rossi · Grafica e siti web a Torino', descrizione: 'Progettiamo siti veloci e belli per piccole attività: grafica, sviluppo e assistenza, dal primo schizzo alla pubblicazione.',
    url: 'https://www.esempio.it/', immagine: 'https://www.esempio.it/og.png', nomeSito: 'Studio Rossi', twitter: 'studiorossi', ldTipo: 'LocalBusiness',
    ldTelefono: '+39 011 000 0000', ldSocial: 'https://instagram.com/studiorossi\nhttps://linkedin.com/company/studiorossi'
  };
  const head = Seo.buildHead(v);
  ['<title>Studio Rossi', 'name="description"', 'rel="canonical" href="https://www.esempio.it/"', 'property="og:image"', 'name="twitter:card" content="summary_large_image"', 'name="twitter:site" content="@studiorossi"', 'application/ld+json'].forEach((s) =>
    assert.ok(head.includes(s), s)
  );
  const ld = JSON.parse(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(head)[1]);
  assert.equal(ld['@type'], 'LocalBusiness');
  assert.deepEqual(ld.sameAs.length, 2);
  assert.equal(Seo.htmlTag({ lingua: 'en' }), '<html lang="en">');
  assert.ok(Seo.checks(v).every((c) => c.stato === 'ok'), JSON.stringify(Seo.checks(v).filter((c) => c.stato !== 'ok')));

  const bad = Seo.checks({ titolo: '', url: 'http://x.it', immagine: '/og.png', lingua: 'italiano', robots: 'noindex' });
  const st = (id) => bad.find((c) => c.id === id).stato;
  assert.equal(st('titolo'), 'errore');
  assert.equal(st('url'), 'errore');
  assert.equal(st('immagine'), 'errore');
  assert.equal(st('lingua'), 'errore');
  assert.equal(st('robots'), 'avviso');
  assert.equal(Seo.checks({ titolo: 'x'.repeat(80) }).find((c) => c.id === 'titolo').stato, 'avviso');

  const xss = Seo.buildHead({ titolo: '"><script>alert(1)</script>', descrizione: 'a"b', ldTipo: 'WebSite', ldNome: '</script><b>' });
  assert.doesNotMatch(xss, /<script>alert/);
  const doc = new JSDOM('<!doctype html><html><head>' + xss + '</head></html>').window.document;
  assert.equal(doc.querySelectorAll('script[type="application/ld+json"]').length, 1);
  assert.equal(JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent).name, '</script><b>');
});
