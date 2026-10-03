/* Campo di codice migliorato: colori, numeri di riga, indentazione automatica, Tab su più righe, Ctrl+/ per commentare. */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var h = App.h;
  var HL = window.CatalogoHighlight;
  var E = window.CatalogoEditing;

  /* Sostituisce una parte del testo mantenendo la cronologia di annulla (Ctrl+Z) quando il browser lo permette. */
  function replaceRange(ta, r) {
    ta.focus();
    ta.setSelectionRange(r.from, r.to);
    var ok = false;
    try {
      ok = document.execCommand('insertText', false, r.text);
    } catch (x) {
      ok = false;
    }
    if (!ok || ta.value.slice(r.from, r.from + r.text.length) !== r.text) {
      ta.setRangeText(r.text, r.from, r.to, 'end');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
    ta.setSelectionRange(r.selStart, r.selEnd);
  }

  /* Tab indenta (anche più righe), Maiusc+Tab toglie, Invio mantiene l'indentazione, Ctrl+/ commenta.
     Esc e poi Tab (o Maiusc+Tab) fa uscire dal campo con la tastiera. */
  function codeKeys(ta, getLang) {
    var escaped = false;
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        escaped = true;
        return;
      }
      var plainMod = !e.ctrlKey && !e.metaKey && !e.altKey;
      if (e.key === 'Tab' && plainMod) {
        if (escaped) {
          escaped = false;
          return;
        }
        e.preventDefault();
        var s = ta.selectionStart;
        var en = ta.selectionEnd;
        var multi = ta.value.slice(s, en).indexOf('\n') !== -1;
        if (e.shiftKey || multi) {
          replaceRange(ta, E.indentLines(ta.value, s, en, e.shiftKey));
        } else {
          replaceRange(ta, { from: s, to: en, text: E.UNIT, selStart: s + E.UNIT.length, selEnd: s + E.UNIT.length });
        }
        return;
      }
      escaped = false;
      if (e.key === 'Enter' && plainMod && !e.shiftKey) {
        e.preventDefault();
        replaceRange(ta, E.onEnter(ta.value, ta.selectionStart, ta.selectionEnd));
        return;
      }
      if ((e.key === '/' || e.key === ';') && (e.ctrlKey || e.metaKey) && !e.altKey) {
        e.preventDefault();
        replaceRange(ta, E.toggleComment(ta.value, ta.selectionStart, ta.selectionEnd, getLang()));
      }
    });
  }

  function pref() {
    try {
      return window.localStorage.getItem('cat-colori') !== '0';
    } catch (e) {
      return true;
    }
  }

  function setPref(on) {
    try {
      window.localStorage.setItem('cat-colori', on ? '1' : '0');
    } catch (e) { /* senza memoria locale: vale per questa sessione */ }
  }

  /* Avvolge il campo `ta` con numeri di riga e colori. Ritorna { el, refresh, toggle }. */
  function makeCodeBox(ta, getLang) {
    var pre = h('pre', { class: 'code-hl', 'aria-hidden': 'true' });
    var gutter = h('div', { class: 'code-gutter', 'aria-hidden': 'true' });
    var stack = h('div', { class: 'code-stack' }, [pre, ta]);
    var box = h('div', { class: 'code-box' }, [gutter, stack]);
    var toggle = h('input', { type: 'checkbox' });
    toggle.checked = pref();
    var label = h('label', { class: 'code-toggle' }, [toggle, 'Colori e numeri di riga']);
    var wrap = h('div', { class: 'code-wrap' }, [box, label]);
    var lastLines = -1;

    function apply() {
      box.classList.toggle('no-hl', !toggle.checked);
    }

    function refresh() {
      if (!toggle.checked) return;
      var v = ta.value;
      pre.innerHTML = HL.highlight(v, getLang()) + '\n';
      var n = v.split('\n').length;
      if (n !== lastLines) {
        var nums = '';
        for (var i = 1; i <= n; i++) nums += i + '\n';
        gutter.textContent = nums;
        lastLines = n;
      }
      sync();
    }

    function sync() {
      pre.scrollTop = ta.scrollTop;
      pre.scrollLeft = ta.scrollLeft;
      gutter.scrollTop = ta.scrollTop;
    }

    ta.addEventListener('input', refresh);
    ta.addEventListener('scroll', sync);
    toggle.addEventListener('change', function () {
      setPref(toggle.checked);
      apply();
      lastLines = -1;
      refresh();
    });
    apply();
    return { el: wrap, refresh: refresh, textarea: ta };
  }

  App.codeKeys = codeKeys;
  App.makeCodeBox = makeCodeBox;
})();
