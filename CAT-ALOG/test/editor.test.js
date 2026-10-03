'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const H = require('../lib/highlight');
const E = require('../lib/editing');
const { JSDOM } = require('jsdom');

const plain = (html) => new JSDOM('<body>' + html).window.document.body.textContent;
const apply = (v, r) => v.slice(0, r.from) + r.text + v.slice(r.to);

test('colorazione: il testo resta identico e i pezzi principali sono riconosciuti', () => {
  const css = '/* c */\n.a:hover { color: #2f6f4e; margin: 0 auto; background: url("x.png"); }\n@media (min-width: 768px) { .b { width: calc(100% - 2rem); } }';
  const hc = H.highlight(css, 'css');
  assert.equal(plain(hc), css);
  assert.match(hc, /<span class="hl-comment">\/\* c \*\/<\/span>/);
  assert.match(hc, /<span class="hl-prop">color<\/span>/);
  assert.match(hc, /<span class="hl-color" style="border-bottom:2px solid #2f6f4e">#2f6f4e<\/span>/);
  assert.doesNotMatch(hc, /hl-prop">\.a:hover|hl-prop">a</, 'a:hover non è una proprietà');
  assert.match(hc, /<span class="hl-keyword">@media<\/span>/);
  assert.match(hc, /<span class="hl-fn">calc<\/span>/);
  assert.match(hc, /<span class="hl-string">"x\.png"<\/span>/);

  const html = '<!doctype html>\n<!-- n -->\n<div class="a" id=\'b\' hidden><p>Ciao &amp; <b>x</b></p></div>\n<style>.x { color: red; }</style>\n<script>const a = 1; // ok\nfunction f() { return "s"; }</script>';
  const hh = H.highlight(html, 'html');
  assert.equal(plain(hh), html);
  assert.match(hh, /<span class="hl-tag">&lt;div<\/span>/);
  assert.match(hh, /<span class="hl-attr">class<\/span>=<span class="hl-string">"a"<\/span>/);
  assert.match(hh, /<span class="hl-prop">color<\/span>/, 'il CSS dentro <style>');
  assert.match(hh, /<span class="hl-keyword">function<\/span>/, 'il JS dentro <script>');
  assert.match(hh, /<span class="hl-comment">\/\/ ok<\/span>/);

  const js = 'const x = 10; // c\nlet s = `a ${b}`; if (x > 1) { console.log("ok", true); }\nel.addEventListener("click", function () {});';
  const hj = H.highlight(js, 'js');
  assert.equal(plain(hj), js);
  assert.match(hj, /<span class="hl-keyword">const<\/span>/);
  assert.match(hj, /<span class="hl-number">10<\/span>/);
  assert.match(hj, /<span class="hl-fn">log<\/span>/);
  assert.match(hj, /<span class="hl-fn">addEventListener<\/span>/);
  assert.match(hj, /<span class="hl-number">true<\/span>/);
});

test('colorazione: codice rotto o incompleto non fa errori e il testo non cambia', () => {
  ['<div class="a', '<!-- aperto', '.a { color: ', '"stringa aperta', '/* aperto', '<style>.a{', '`aperto ${', '<', '&', '}}}{{{'].forEach((src) => {
    ['html', 'css', 'js'].forEach((lang) => assert.equal(plain(H.highlight(src, lang)), src, lang + ': ' + src));
  });
  const grande = 'x'.repeat(H.LIMITE + 1);
  assert.equal(H.highlight(grande, 'js'), grande, 'oltre il limite non si colora');
  assert.equal(H.highlight('a < b && c', 'js'), 'a &lt; b &amp;&amp; c');
});

test('editing: invio mantiene l\'indentazione e apre le graffe', () => {
  let v = '.a {\n  color: red;';
  let r = E.onEnter(v, v.length, v.length);
  assert.equal(apply(v, r), '.a {\n  color: red;\n  ');
  v = '.a {';
  r = E.onEnter(v, v.length, v.length);
  assert.equal(apply(v, r), '.a {\n  ');
  v = '.a {}';
  r = E.onEnter(v, 4, 4);
  assert.equal(apply(v, r), '.a {\n  \n}');
  assert.equal(r.selStart, 7);
  v = '<div>';
  r = E.onEnter(v, v.length, v.length);
  assert.equal(apply(v, r), '<div>\n  ');
  v = '<p>x</p>';
  assert.equal(apply(v, E.onEnter(v, v.length, v.length)), '<p>x</p>\n');
  v = '  <br>';
  assert.equal(apply(v, E.onEnter(v, v.length, v.length)), '  <br>\n  ');
});

test('editing: indenta e toglie l\'indentazione su più righe', () => {
  const v = 'a\n  b\nc';
  let r = E.indentLines(v, 0, v.length, false);
  assert.equal(apply(v, r), '  a\n    b\n  c');
  const v2 = apply(v, r);
  r = E.indentLines(v2, 0, v2.length, true);
  assert.equal(apply(v2, r), v);
  r = E.indentLines('x\ny', 0, 0, false);
  assert.equal(apply('x\ny', r), '  x\ny');
  assert.equal(apply('x', E.indentLines('x', 0, 1, true)), 'x', 'niente da togliere');
  const sel = E.indentLines('a\nb\n', 0, 4, false);
  assert.equal(apply('a\nb\n', sel), '  a\n  b\n');
});

test('editing: commenta e scommenta', () => {
  let v = 'a();\n  b();';
  let r = E.toggleComment(v, 0, v.length, 'js');
  assert.equal(apply(v, r), '// a();\n  // b();');
  v = apply(v, r);
  r = E.toggleComment(v, 0, v.length, 'js');
  assert.equal(apply(v, r), 'a();\n  b();');
  v = '.a { color: red; }';
  r = E.toggleComment(v, 0, 0, 'css');
  assert.equal(apply(v, r), '/* .a { color: red; } */');
  assert.equal(apply('/* .a { color: red; } */', E.toggleComment('/* .a { color: red; } */', 0, 0, 'css')), '.a { color: red; }');
  assert.equal(apply('<p>x</p>', E.toggleComment('<p>x</p>', 0, 0, 'html')), '<!-- <p>x</p> -->');
});
