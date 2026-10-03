(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CatalogoEditing = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /*
   * Piccoli aiuti per scrivere codice in un campo di testo. Funzioni pure: ricevono testo e selezione
   * e dicono quale parte sostituire e dove mettere la selezione.
   * Ritorno: { from, to, text, selStart, selEnd }  (sostituire value[from..to] con text, poi selezionare selStart..selEnd)
   */

  var UNIT = '  ';

  function lineStart(v, i) {
    return v.lastIndexOf('\n', i - 1) + 1;
  }

  function lineEnd(v, i) {
    var e = v.indexOf('\n', i);
    return e === -1 ? v.length : e;
  }

  /* Invio: mantiene l'indentazione della riga e ne aggiunge una dopo { [ ( o dopo un tag aperto. */
  function onEnter(v, start, end) {
    var ls = lineStart(v, start);
    var line = v.slice(ls, start);
    var indent = /^[ \t]*/.exec(line)[0];
    var before = v.slice(0, start).replace(/\s+$/, '');
    var lastCh = before.charAt(before.length - 1);
    var nextCh = v.charAt(end);
    var extra = /[{[(]$/.test(line.replace(/\s+$/, '')) ? UNIT : '';
    if (!extra && /<[a-zA-Z][^<>/]*>$/.test(line.trim()) && !/<(br|hr|img|input|meta|link)\b/i.test(line) && !/<\/[a-zA-Z]+>$/.test(line.trim())) extra = UNIT;
    /* tra {} o () o [] o <tag></tag>: apre una riga vuota e porta la chiusura sotto */
    if ((lastCh === '{' && nextCh === '}') || (lastCh === '[' && nextCh === ']') || (lastCh === '(' && nextCh === ')')) {
      var mid = '\n' + indent + UNIT;
      var text = mid + '\n' + indent;
      return { from: start, to: end, text: text, selStart: start + mid.length, selEnd: start + mid.length };
    }
    var ins = '\n' + indent + extra;
    return { from: start, to: end, text: ins, selStart: start + ins.length, selEnd: start + ins.length };
  }

  /* Tab / Maiusc+Tab su più righe: aggiunge o toglie due spazi all'inizio di ogni riga toccata. */
  function indentLines(v, start, end, outdent) {
    var from = lineStart(v, start);
    var endAdj = end > start && v.charAt(end - 1) === '\n' ? end - 1 : end;
    var to = lineEnd(v, endAdj);
    var lines = v.slice(from, to).split('\n');
    var firstDelta = 0;
    var total = 0;
    var out = lines.map(function (l, idx) {
      var nl;
      if (outdent) {
        var m = /^( {1,2}|\t)/.exec(l);
        nl = m ? l.slice(m[0].length) : l;
      } else {
        nl = l.length ? UNIT + l : l;
      }
      var d = nl.length - l.length;
      if (idx === 0) firstDelta = d;
      total += d;
      return nl;
    });
    var text = out.join('\n');
    var s = Math.max(from, start + firstDelta);
    var e = Math.max(s, end + total);
    return { from: from, to: to, text: text, selStart: s, selEnd: e };
  }

  /* Ctrl+/ : commenta o scommenta le righe (// per JS, comment di blocco per CSS e HTML). */
  function toggleComment(v, start, end, lang) {
    var from = lineStart(v, start);
    var endAdj = end > start && v.charAt(end - 1) === '\n' ? end - 1 : end;
    var to = lineEnd(v, endAdj);
    var block = v.slice(from, to);
    if (lang === 'js') {
      var lines = block.split('\n');
      var all = lines.filter(function (l) { return l.trim(); }).every(function (l) { return /^\s*\/\//.test(l); });
      var out = lines.map(function (l) {
        if (!l.trim()) return l;
        return all ? l.replace(/^(\s*)\/\/ ?/, '$1') : l.replace(/^(\s*)/, '$1// ');
      });
      var text = out.join('\n');
      return { from: from, to: to, text: text, selStart: from, selEnd: from + text.length };
    }
    var open = lang === 'css' ? '/* ' : '<!-- ';
    var close = lang === 'css' ? ' */' : ' -->';
    var t = block.trim();
    var lead = /^\s*/.exec(block)[0];
    var tail = /\s*$/.exec(block)[0];
    var text2;
    if (t.indexOf(open.trim()) === 0 && t.slice(-close.trim().length) === close.trim()) {
      text2 = lead + t.slice(open.trim().length, t.length - close.trim().length).replace(/^ /, '').replace(/ $/, '') + tail;
    } else {
      text2 = lead + open + t + close + tail;
    }
    return { from: from, to: to, text: text2, selStart: from, selEnd: from + text2.length };
  }

  return { onEnter: onEnter, indentLines: indentLines, toggleComment: toggleComment, UNIT: UNIT };
});
