(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CatalogoShared = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function str(v, def) {
    if (typeof v === 'string') return v;
    if (v == null) return def || '';
    return String(v);
  }

  var uidCounter = 0;
  function uid(prefix) {
    uidCounter += 1;
    return (prefix || 'x') + Date.now().toString(36) + uidCounter.toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function slugify(testo) {
    var base = str(testo)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      .replace(/-+$/g, '');
    return base || 'senza-nome';
  }

  function uniqueSlug(base, esistenti) {
    var set = esistenti instanceof Set ? esistenti : new Set(esistenti || []);
    if (!set.has(base)) return base;
    var n = 2;
    while (set.has(base + '-' + n)) n += 1;
    return base + '-' + n;
  }

  var ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;
  function isValidId(id) {
    return typeof id === 'string' && ID_RE.test(id);
  }

  /* ---------- colori e contrasto ---------- */

  function normalizeHex(v) {
    if (typeof v !== 'string') return null;
    var h = v.trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map(function (c) { return c + c; }).join('');
    if (!/^[0-9a-f]{6}$/i.test(h)) return null;
    return '#' + h.toLowerCase();
  }

  function parseHex(v) {
    var hex = normalizeHex(v);
    if (!hex) return null;
    return [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); });
  }

  /* Colore esadecimale scritto come in CSS: con il # davanti (#fff oppure #ffffff). */
  function isHexColor(v) {
    return typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
  }

  function luminance(rgb) {
    var c = rgb.map(function (v) {
      var x = v / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function contrastRatio(a, b) {
    var ca = parseHex(a);
    var cb = parseHex(b);
    if (!ca || !cb) return null;
    var la = luminance(ca);
    var lb = luminance(cb);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /* ---------- normalizzazione dati ---------- */

  function normalizeClassi(data) {
    var gruppi = data && Array.isArray(data.gruppi) ? data.gruppi : [];
    return {
      versione: 1,
      gruppi: gruppi.map(function (g) {
        var classi = g && Array.isArray(g.classi) ? g.classi : [];
        return {
          id: str(g && g.id) || uid('g'),
          nome: str(g && g.nome).trim() || 'Senza nome',
          classi: classi.map(function (c) {
            return {
              id: str(c && c.id) || uid('c'),
              nome: str(c && c.nome).trim(),
              descrizione: str(c && c.descrizione),
              css: str(c && c.css)
            };
          })
        };
      })
    };
  }

  function normalizeRoot(data) {
    var gruppi = data && Array.isArray(data.gruppi) ? data.gruppi : [];
    return {
      versione: 1,
      gruppi: gruppi.map(function (g) {
        var variabili = g && Array.isArray(g.variabili) ? g.variabili : [];
        return {
          id: str(g && g.id) || uid('g'),
          nome: str(g && g.nome).trim() || 'Senza nome',
          variabili: variabili.map(function (v) {
            return {
              id: str(v && v.id) || uid('v'),
              nome: str(v && v.nome).trim(),
              valore: str(v && v.valore),
              tipo: v && v.tipo === 'colore' ? 'colore' : 'testo'
            };
          })
        };
      })
    };
  }

  /* ---------- validazione variabili root ---------- */

  var VAR_NAME_RE = /^--[a-zA-Z0-9_-]+$/;

  function validaVariabile(v) {
    var nome = str(v && v.nome);
    if (!VAR_NAME_RE.test(nome)) return 'Nome variabile non valido (esempio: --md-color-primary)';
    var val = str(v && v.valore);
    if (!val.trim()) return 'Valore vuoto per ' + nome;
    if (v && v.tipo === 'colore' && /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val.trim())) {
      return 'Manca il # davanti al colore di ' + nome;
    }
    if (/[{}]/.test(val) || /[\r\n]/.test(val)) return 'Valore non valido per ' + nome + ' (niente parentesi graffe o a capo)';
    var senzaTesti = val.replace(/"[^"]*"|'[^']*'|url\([^)]*\)/g, '');
    if (senzaTesti.indexOf(';') !== -1) return 'Valore non valido per ' + nome + ' (niente punto e virgola)';
    return null;
  }

  function validaClasseNome(nome) {
    return /^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(str(nome).trim());
  }

  /* ---------- generazione CSS ---------- */

  function safeComment(t) {
    return str(t).replace(/\*\//g, '* /');
  }

  function buildClassiCss(classi, opzioni) {
    var sel = opzioni && Array.isArray(opzioni.gruppiIds) ? new Set(opzioni.gruppiIds) : null;
    var out = ["/* Classi del catalogo - file generato dall'app */"];
    classi.gruppi.forEach(function (g) {
      if (sel && !sel.has(g.id)) return;
      var blocchi = g.classi.map(function (c) { return str(c.css).trim(); }).filter(Boolean);
      if (!blocchi.length) return;
      out.push('', '/* ' + safeComment(g.nome) + ' */', blocchi.join('\n\n'));
    });
    return out.join('\n') + '\n';
  }

  function buildRootCss(rootData) {
    var out = ["/* Variabili root - file generato dall'app */", ':root {'];
    var primo = true;
    rootData.gruppi.forEach(function (g) {
      var validi = g.variabili.filter(function (v) { return !validaVariabile(v); });
      if (!validi.length) return;
      if (!primo) out.push('');
      primo = false;
      out.push('  /* ' + safeComment(g.nome) + ' */');
      validi.forEach(function (v) {
        out.push('  ' + v.nome + ': ' + v.valore.trim() + ';');
      });
    });
    out.push('}');
    return out.join('\n') + '\n';
  }

  /* ---------- documenti HTML ---------- */

  function escapeScript(js) {
    return str(js).replace(/<\/(script)/gi, '<\\/$1');
  }

  function escapeStyle(css) {
    return str(css).replace(/<\/(style)/gi, '<\\/$1');
  }

  function buildPreviewDoc(o) {
    var parts = [];
    parts.push('<!doctype html><html lang="it"><head><meta charset="utf-8">');
    parts.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
    parts.push('<style>body{margin:0;padding:1rem;font-family:system-ui,sans-serif}</style>');
    if (o.rootCss) parts.push('<style>' + escapeStyle(o.rootCss) + '</style>');
    if (o.classiCss) parts.push('<style>' + escapeStyle(o.classiCss) + '</style>');
    if (o.css) parts.push('<style>' + escapeStyle(o.css) + '</style>');
    parts.push('</head><body>');
    parts.push(str(o.html));
    if (str(o.js).trim()) parts.push('<script>' + escapeScript(o.js) + '</script>');
    parts.push('</body></html>');
    return parts.join('\n');
  }

  function escapeHtml(t) {
    return str(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildFullPage(o) {
    var out = [];
    out.push('<!doctype html>');
    out.push('<html lang="it">');
    out.push('<head>');
    out.push('  <meta charset="utf-8">');
    out.push('  <meta name="viewport" content="width=device-width, initial-scale=1">');
    out.push('  <title>' + escapeHtml(o.titolo || 'Senza nome') + '</title>');
    (o.links || []).concat(['style.css']).forEach(function (href) {
      out.push('  <link rel="stylesheet" href="' + escapeHtml(href) + '">');
    });
    out.push('</head>');
    out.push('<body>');
    out.push(str(o.html).replace(/\s+$/, ''));
    if (o.js) out.push('<script src="script.js"></script>');
    out.push('</body>');
    out.push('</html>');
    return out.join('\n') + '\n';
  }

  /* ---------- controllo del contrasto sulle variabili root ---------- */

  /* Cerca i colori esadecimali per nome: testo (text, fg), sfondo (bg, background, surface),
     accenti (primary, accent, ...). Restituisce le coppie con rapporto di contrasto e soglia AA. */
  function contrastReport(rootData) {
    var colori = [];
    rootData.gruppi.forEach(function (g) {
      g.variabili.forEach(function (v) {
        if (validaVariabile(v)) return;
        if (isHexColor(v.valore)) colori.push({ nome: v.nome, hex: normalizeHex(v.valore) });
      });
    });
    function per(re) {
      return colori.filter(function (c) { return re.test(c.nome); });
    }
    var sfondi = per(/(^|-)(bg|background|surface)(-|$)/i);
    var testi = per(/(^|-)(text|fg|foreground)(-|$)/i);
    var accenti = per(/(^|-)(primary|secondary|accent|success|warning|error|danger|info)(-|$)/i);
    var out = [];
    function add(a, b, soglia, tipo) {
      if (a.nome === b.nome) return;
      var r = contrastRatio(a.hex, b.hex);
      if (r == null) return;
      out.push({
        primo: a.nome,
        sfondo: b.nome,
        rapporto: Math.round(r * 100) / 100,
        soglia: soglia,
        tipo: tipo,
        ok: r >= soglia
      });
    }
    testi.forEach(function (t) {
      sfondi.forEach(function (b) { add(t, b, 4.5, 'testo'); });
    });
    accenti.forEach(function (a) {
      sfondi.forEach(function (b) { add(a, b, 3, 'grafica'); });
    });
    return out.slice(0, 40);
  }

  /* ---------- token per Figma (formato Tokens Studio) ---------- */

  function tokenType(segmento, valore) {
    var v = str(valore).trim();
    if (isHexColor(v) || /^(rgb|hsl|oklch|color)\(/i.test(v)) return 'color';
    switch (segmento) {
      case 'color': return 'color';
      case 'space': case 'gap': return 'spacing';
      case 'radius': return 'borderRadius';
      case 'shadow': return 'boxShadow';
      case 'font':
        return /["',]/.test(v) ? 'fontFamilies' : 'other';
      case 'text': return 'fontSizes';
      case 'weight': return 'fontWeights';
      case 'line': return 'lineHeights';
      default: return 'other';
    }
  }

  function isLeaf(o) {
    return !!o && typeof o === 'object' && o.value !== undefined;
  }

  function toTokens(rootData) {
    var set = {};
    rootData.gruppi.forEach(function (g) {
      g.variabili.forEach(function (v) {
        if (validaVariabile(v)) return;
        var parti = v.nome.replace(/^--/, '').split('-').filter(Boolean);
        if (parti.length > 1) parti.shift();
        if (!parti.length) return;
        var cursore = set;
        for (var i = 0; i < parti.length - 1; i += 1) {
          var k = parti[i];
          if (cursore[k] === undefined) cursore[k] = {};
          else if (isLeaf(cursore[k])) cursore[k] = { base: cursore[k] };
          cursore = cursore[k];
        }
        var foglia = parti[parti.length - 1];
        var token = { value: v.valore.trim(), type: tokenType(parti[0], v.valore) };
        if (cursore[foglia] !== undefined && !isLeaf(cursore[foglia])) cursore[foglia].base = token;
        else cursore[foglia] = token;
      });
    });
    return { global: set };
  }

  return {
    str: str,
    uid: uid,
    slugify: slugify,
    uniqueSlug: uniqueSlug,
    isValidId: isValidId,
    normalizeHex: normalizeHex,
    parseHex: parseHex,
    isHexColor: isHexColor,
    contrastRatio: contrastRatio,
    contrastReport: contrastReport,
    normalizeClassi: normalizeClassi,
    normalizeRoot: normalizeRoot,
    validaVariabile: validaVariabile,
    validaClasseNome: validaClasseNome,
    buildClassiCss: buildClassiCss,
    buildRootCss: buildRootCss,
    buildPreviewDoc: buildPreviewDoc,
    buildFullPage: buildFullPage,
    escapeHtml: escapeHtml,
    toTokens: toTokens
  };
});
