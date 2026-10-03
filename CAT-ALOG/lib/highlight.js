(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CatalogoHighlight = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /*
   * Colorazione del codice senza librerie: HTML, CSS e JavaScript.
   * Non è un analizzatore completo: riconosce commenti, stringhe, numeri, parole chiave, proprietà, tag, attributi e colori.
   * Il testo restituito ha esattamente gli stessi caratteri dell'originale (solo racchiusi in <span>), così si può
   * sovrapporre a un campo di testo senza spostare nulla.
   */

  function esc(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function span(cls, text, extra) {
    return '<span class="hl-' + cls + '"' + (extra || '') + '>' + esc(text) + '</span>';
  }

  var JS_KEYWORDS = new Set((
    'break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new of return super switch this throw try typeof var void while with yield async await static get set'
  ).split(' '));
  var JS_LITERALS = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);

  /* ---------- CSS ---------- */

  function css(code) {
    var out = '';
    var i = 0;
    var n = code.length;
    var depth = 0;
    var m;
    while (i < n) {
      var rest = code.slice(i);
      if ((m = /^\/\*[\s\S]*?(\*\/|$)/.exec(rest))) { out += span('comment', m[0]); i += m[0].length; continue; }
      if ((m = /^("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)/.exec(rest))) { out += span('string', m[0]); i += m[0].length; continue; }
      if ((m = /^@[\w-]+/.exec(rest))) { out += span('keyword', m[0]); i += m[0].length; continue; }
      if ((m = /^#[0-9a-fA-F]{3,8}\b/.exec(rest)) && depth > 0) {
        var ok = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(m[0]);
        out += ok ? span('color', m[0], ' style="border-bottom:2px solid ' + m[0] + '"') : span('number', m[0]);
        i += m[0].length;
        continue;
      }
      if ((m = /^-?(?:\d*\.)?\d+(?:[a-zA-Z%]+)?/.exec(rest)) && depth > 0) { out += span('number', m[0]); i += m[0].length; continue; }
      if ((m = /^--[\w-]+|^[a-zA-Z_-][\w-]*/.exec(rest))) {
        var after = rest.slice(m[0].length);
        var isFn = /^\(/.test(after);
        var isProp = false;
        if (depth > 0 && /^\s*:(?!:)/.test(after)) {
          /* proprietà se, dopo i due punti, arriva prima «;» o «}» che «{» (altrimenti è un selettore come a:hover {) */
          var look = after.replace(/^\s*:/, '');
          var semi = look.search(/[;}]/);
          var brace = look.indexOf('{');
          isProp = semi !== -1 && (brace === -1 || semi < brace);
          if (semi === -1 && brace === -1) isProp = true;
        }
        out += span(isProp ? 'prop' : isFn ? 'fn' : 'plain', m[0]);
        i += m[0].length;
        continue;
      }
      var c = code[i];
      if (c === '{') depth += 1;
      else if (c === '}') depth = Math.max(0, depth - 1);
      out += esc(c);
      i += 1;
    }
    return out;
  }

  /* ---------- JavaScript ---------- */

  function js(code) {
    var out = '';
    var i = 0;
    var n = code.length;
    var m;
    while (i < n) {
      var rest = code.slice(i);
      if ((m = /^\/\/[^\n]*/.exec(rest)) || (m = /^\/\*[\s\S]*?(\*\/|$)/.exec(rest))) { out += span('comment', m[0]); i += m[0].length; continue; }
      if ((m = /^("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`(?:[^`\\]|\\[\s\S])*`?)/.exec(rest))) { out += span('string', m[0]); i += m[0].length; continue; }
      if ((m = /^(?:0[xX][0-9a-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?)/.exec(rest))) { out += span('number', m[0]); i += m[0].length; continue; }
      if ((m = /^[A-Za-z_$][\w$]*/.exec(rest))) {
        var w = m[0];
        var prev = code[i - 1];
        if (prev === '.') out += /^\s*\(/.test(rest.slice(w.length)) ? span('fn', w) : span('prop', w);
        else if (JS_KEYWORDS.has(w)) out += span('keyword', w);
        else if (JS_LITERALS.has(w)) out += span('number', w);
        else if (/^\s*\(/.test(rest.slice(w.length))) out += span('fn', w);
        else out += esc(w);
        i += w.length;
        continue;
      }
      out += esc(code[i]);
      i += 1;
    }
    return out;
  }

  /* ---------- HTML ---------- */

  function html(code) {
    var out = '';
    var i = 0;
    var n = code.length;
    var m;
    while (i < n) {
      var rest = code.slice(i);
      if ((m = /^<!--[\s\S]*?(-->|$)/.exec(rest))) { out += span('comment', m[0]); i += m[0].length; continue; }
      if ((m = /^<!doctype[^>]*>?/i.exec(rest))) { out += span('keyword', m[0]); i += m[0].length; continue; }
      if ((m = /^<(style|script)\b([^>]*)>([\s\S]*?)(<\/\1\s*>|$)/i.exec(rest))) {
        var tag = m[1].toLowerCase();
        out += span('tag', '<' + m[1]) + attrs(m[2]) + span('tag', '>') + (tag === 'style' ? css(m[3]) : js(m[3])) + (m[4] ? span('tag', m[4]) : '');
        i += m[0].length;
        continue;
      }
      if ((m = /^<\/?[a-zA-Z][\w:-]*((?:"[^"]*"|'[^']*'|[^>"'])*)(>?)/.exec(rest))) {
        var head = /^<\/?[a-zA-Z][\w:-]*/.exec(m[0])[0];
        out += span('tag', head) + attrs(m[1]) + (m[2] ? span('tag', '>') : '');
        i += m[0].length;
        continue;
      }
      if ((m = /^&[#\w]+;/.exec(rest))) { out += span('number', m[0]); i += m[0].length; continue; }
      out += esc(code[i]);
      i += 1;
    }
    return out;
  }

  function attrs(text) {
    var out = '';
    var i = 0;
    var m;
    while (i < text.length) {
      var rest = text.slice(i);
      if ((m = /^"[^"]*"?|^'[^']*'?/.exec(rest))) { out += span('string', m[0]); i += m[0].length; continue; }
      if ((m = /^[^\s=/"'<>]+/.exec(rest))) { out += span('attr', m[0]); i += m[0].length; continue; }
      out += esc(text[i]);
      i += 1;
    }
    return out;
  }

  var LIMITE = 200000;

  /* lang: 'html' | 'css' | 'js'. Oltre i 200000 caratteri non si colora (per non rallentare). */
  function highlight(code, lang) {
    var src = String(code == null ? '' : code);
    if (src.length > LIMITE) return esc(src);
    if (lang === 'css') return css(src);
    if (lang === 'js') return js(src);
    return html(src);
  }

  return { highlight: highlight, LIMITE: LIMITE };
});
