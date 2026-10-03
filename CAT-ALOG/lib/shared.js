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
    if (!VAR_NAME_RE.test(nome)) return 'Nome variabile non valido (esempio: --cat-color-primary)';
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

  /* ---------- importa codice incollato ---------- */

  function sniffLang(code) {
    var t = code.trim();
    if (/^</.test(t)) return 'html';
    if (/^(?:@[\w-]+|[.#:\[*]?[\w-][^{;]*)\s*\{[\s\S]*\}\s*$/.test(t) && !/\b(?:function|const|let|var|=>)\b/.test(t)) return 'css';
    return 'js';
  }

  /* Divide codice incollato (pagina intera, frammento o blocchi ``` di una chat)
     in { html, css, js, avvisi }. L'ordine dei blocchi si mantiene. */
  function splitCode(text) {
    var out = { html: [], css: [], js: [], avvisi: [] };
    var src = str(text).replace(/\r\n?/g, '\n');
    var fence = /```[ \t]*([\w+-]*)[^\n]*\n([\s\S]*?)```/g;
    var blocks = [];
    var m;
    while ((m = fence.exec(src))) blocks.push({ lang: m[1].toLowerCase(), code: m[2] });
    if (!blocks.length) blocks.push({ lang: '', code: src });

    blocks.forEach(function (b) {
      if (!b.code.trim()) return;
      var lang = b.lang;
      if (lang === 'javascript' || lang === 'mjs' || lang === 'jsx' || lang === 'tsx' || lang === 'ts') lang = 'js';
      if (lang === 'htm') lang = 'html';
      if (lang !== 'html' && lang !== 'css' && lang !== 'js') lang = sniffLang(b.code);
      var code = b.code;
      if (/\bimport\s+React\b|from\s+['"]react['"]|\bclassName=|export\s+default\s+function/.test(code)) {
        out.avvisi.push('Sembra codice React (JSX): non lo converto. Lo metto nel campo JS così com\'è.');
        out.js.push(code.trim());
        return;
      }
      if (lang === 'css') {
        out.css.push(code.trim());
      } else if (lang === 'js') {
        out.js.push(code.trim());
      } else {
        var html = code.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, function (_, css) {
          out.css.push(css.trim());
          return '';
        });
        html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, function (all, attrs, js) {
          if (/\bsrc\s*=/i.test(attrs)) {
            out.avvisi.push('Script esterno lasciato nell\'HTML: ' + all.slice(0, 80));
            return all;
          }
          if (js.trim()) out.js.push(js.trim());
          return '';
        });
        var body = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(html);
        if (body) html = body[1];
        else html = html.replace(/<!doctype[^>]*>/i, '').replace(/<\/?(?:html|body)\b[^>]*>/gi, '').replace(/<head\b[^>]*>[\s\S]*?<\/head>/i, '');
        html = html.replace(/\n{3,}/g, '\n\n').trim();
        if (html) out.html.push(html);
      }
    });

    return {
      html: out.html.length ? out.html.join('\n\n') + '\n' : '',
      css: out.css.length ? out.css.join('\n\n') + '\n' : '',
      js: out.js.length ? out.js.join('\n\n') + '\n' : '',
      avvisi: out.avvisi
    };
  }

  /* ---------- Root in altri formati (SCSS, JSON, override Bootstrap 5.3) ---------- */

  function flatRoot(rootData) {
    var out = [];
    (rootData && rootData.gruppi || []).forEach(function (g) {
      (g.variabili || []).forEach(function (v) {
        if (v && v.nome && str(v.valore).trim()) out.push({ nome: v.nome, valore: str(v.valore).trim() });
      });
    });
    return out;
  }

  function buildRootScss(rootData) {
    var lines = ['// Variabili generate da CAT-ALOG', ''];
    flatRoot(rootData).forEach(function (v) {
      lines.push('$' + v.nome.replace(/^--/, '') + ': ' + v.valore + ';');
    });
    lines.push('', '// Mappa (@use "sass:map"; poi map.get($cat-tokens, "nome"))', '$cat-tokens: (');
    var flat = flatRoot(rootData);
    flat.forEach(function (v, i) {
      lines.push('  "' + v.nome.replace(/^--/, '') + '": ' + (v.valore.indexOf(',') !== -1 ? '(' + v.valore + ')' : v.valore) + (i < flat.length - 1 ? ',' : ''));
    });
    lines.push(');', '');
    return lines.join('\n');
  }

  function buildRootJson(rootData) {
    var o = {};
    flatRoot(rootData).forEach(function (v) { o[v.nome] = v.valore; });
    return JSON.stringify(o, null, 2) + '\n';
  }

  /* Cerca la variabile dal suffisso del nome (indipendente dal prefisso): --cat-color-primary -> color-primary. */
  var BOOTSTRAP_MAP = [
    ['color-primary', '$primary'],
    ['color-secondary', '$secondary'],
    ['color-success', '$success'],
    ['color-warning', '$warning'],
    ['color-error', '$danger'],
    ['color-bg', '$body-bg'],
    ['color-text', '$body-color'],
    ['color-text-muted', '$text-muted'],
    ['color-border', '$border-color'],
    ['font-body', '$font-family-sans-serif'],
    ['font-mono', '$font-family-monospace'],
    ['radius-md', '$border-radius'],
    ['radius-sm', '$border-radius-sm'],
    ['radius-lg', '$border-radius-lg']
  ];

  function buildBootstrapOverride(rootData) {
    var flat = flatRoot(rootData);
    var lines = [
      '// Override per Bootstrap 5.3 (Sass), generato da CAT-ALOG.',
      '// Mettilo PRIMA di: @import "bootstrap/scss/bootstrap";',
      ''
    ];
    var n = 0;
    BOOTSTRAP_MAP.forEach(function (m) {
      var hit = flat.filter(function (v) {
        var name = v.nome.replace(/^--[a-z0-9]+-/i, '');
        return name === m[0];
      })[0];
      if (!hit) return;
      var val = /^var\(/.test(hit.valore) ? null : hit.valore;
      if (val === null) return;
      lines.push(m[1] + ': ' + val + ';');
      n += 1;
    });
    if (!n) lines.push('// Nessuna variabile riconosciuta: servono nomi come --cat-color-primary o --cat-radius-md.');
    lines.push('');
    return lines.join('\n');
  }

  /* ---------- strumenti colore ---------- */

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var l = (max + min) / 2, hh = 0, ss = 0;
    if (max !== min) {
      var d = max - min;
      ss = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) hh = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) hh = (b - r) / d + 2;
      else hh = (r - g) / d + 4;
      hh /= 6;
    }
    return [hh, ss, l];
  }

  function hslToRgb(hh, ss, l) {
    function f(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    if (ss === 0) return [l, l, l].map(function (v) { return Math.round(v * 255); });
    var q = l < 0.5 ? l * (1 + ss) : l + ss - l * ss;
    var p = 2 * l - q;
    return [f(p, q, hh + 1 / 3), f(p, q, hh), f(p, q, hh - 1 / 3)].map(function (v) { return Math.round(v * 255); });
  }

  function rgbToHex(rgb) {
    return '#' + rgb.map(function (v) {
      var n = Math.max(0, Math.min(255, Math.round(v)));
      return (n < 16 ? '0' : '') + n.toString(16);
    }).join('');
  }

  /* Scala 50-900 dallo stesso colore: stessa tinta, luminosità da 97% a 12%.
     Il passo 500 è il colore di partenza solo se la sua luminosità è già vicina al centro. */
  var SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  var SCALE_LIGHT = [0.97, 0.93, 0.85, 0.74, 0.62, 0.5, 0.4, 0.31, 0.22, 0.14];

  function colorScale(hex) {
    var rgb = parseHex(hex);
    if (!rgb) return null;
    var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    var out = SCALE_STEPS.map(function (step, i) {
      var sat = hsl[1] * (i === 0 ? 0.6 : i === 1 ? 0.8 : 1);
      return { passo: step, hex: rgbToHex(hslToRgb(hsl[0], sat, SCALE_LIGHT[i])) };
    });
    return out;
  }

  /* Conversione RGB -> CMYK approssimata: solo indicativa, la stampa vera dipende dal profilo ICC. */
  function hexToCmyk(hex) {
    var rgb = parseHex(hex);
    if (!rgb) return null;
    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    var k = 1 - Math.max(r, g, b);
    if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 };
    return {
      c: Math.round(((1 - r - k) / (1 - k)) * 100),
      m: Math.round(((1 - g - k) / (1 - k)) * 100),
      y: Math.round(((1 - b - k) / (1 - k)) * 100),
      k: Math.round(k * 100)
    };
  }

  /* Simulazione daltonismo (matrici di Machado et al. 2009, gravità 1.0), calcolata sui valori lineari. */
  var CVD = {
    protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
    tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]]
  };

  function toLinear(c) {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function fromLinear(c) {
    c = Math.max(0, Math.min(1, c));
    return Math.round((c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255);
  }

  function simulateColorBlind(hex, tipo) {
    var rgb = parseHex(hex);
    var m = CVD[tipo];
    if (!rgb || !m) return null;
    var lin = rgb.map(toLinear);
    return rgbToHex(m.map(function (row) {
      return fromLinear(row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]);
    }));
  }

  /* Versione scura: tiene la tinta, inverte la luminosità dei colori di sfondo/testo/bordo. */
  function darkVariant(hex) {
    var rgb = parseHex(hex);
    if (!rgb) return null;
    var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    return rgbToHex(hslToRgb(hsl[0], hsl[1], 1 - hsl[2]));
  }

  /* ---------- opzioni dell'anteprima (tema scuro, senza animazioni, griglia) ---------- */

  function applyPreviewOptions(doc, o) {
    var opt = o || {};
    var out = str(doc);
    var css = '';
    if (opt.dark) {
      out = out.replace('<html ', '<html data-theme="dark" style="color-scheme:dark" ');
      css += 'html[data-theme="dark"] body{background:#121211;color:#f2f2ee}';
    }
    if (opt.still) css += '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}';
    if (opt.grid) {
      css += 'body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:2147483647;' +
        'background-image:repeating-linear-gradient(0deg,rgb(255 0 80/.18) 0 1px,transparent 1px 8px),' +
        'repeating-linear-gradient(90deg,rgb(255 0 80/.18) 0 1px,transparent 1px 8px)}';
    }
    if (!css) return out;
    var tag = '<style>' + css + '</style>';
    /* dopo il CSS dell'utente, così vince lui solo dove non c'è !important */
    return out.indexOf('</head>') !== -1 ? out.replace('</head>', tag + '</head>') : tag + out;
  }

  /* ---------- controllo qualità ---------- */

  /* parts = { html, css, js }; parse(html) -> Document (nel browser: DOMParser). Ritorna una lista di controlli:
     { id, stato: 'ok' | 'avviso' | 'errore', titolo, dettaglio } */
  function qualityCheck(parts, parse) {
    var html = str(parts && parts.html);
    var css = str(parts && parts.css);
    var res = [];
    function add(id, stato, titolo, dettaglio) {
      res.push({ id: id, stato: stato, titolo: titolo, dettaglio: dettaglio || '' });
    }
    var doc = null;
    try {
      doc = parse ? parse(html) : new DOMParser().parseFromString(html, 'text/html');
    } catch (e) {
      doc = null;
    }

    if (doc) {
      var h1 = doc.querySelectorAll('h1').length;
      if (h1 > 1) add('h1', 'errore', 'Un solo h1 per pagina', 'Ce ne sono ' + h1 + '.');
      else add('h1', 'ok', 'Un solo h1 per pagina');

      var imgs = Array.prototype.slice.call(doc.querySelectorAll('img'));
      var noAlt = imgs.filter(function (i) { return !i.hasAttribute('alt'); });
      if (noAlt.length) add('alt', 'errore', 'Immagini con alt', noAlt.length + ' immagine/i senza attributo alt (usa alt="" se è decorativa).');
      else add('alt', 'ok', 'Immagini con alt');

      var nameless = Array.prototype.slice.call(doc.querySelectorAll('button, a[href], [role="button"]')).filter(function (el) {
        if ((el.textContent || '').trim()) return false;
        if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title')) return false;
        var img = el.querySelector('img[alt]:not([alt=""])');
        var svgTitle = el.querySelector('svg title');
        return !img && !svgTitle;
      });
      if (nameless.length) add('nomi', 'errore', 'Pulsanti e link con nome', nameless.length + ' senza testo né aria-label.');
      else add('nomi', 'ok', 'Pulsanti e link con nome');

      var fields = Array.prototype.slice.call(doc.querySelectorAll('input, select, textarea')).filter(function (el) {
        var t = (el.getAttribute('type') || '').toLowerCase();
        return ['hidden', 'submit', 'button', 'reset', 'image'].indexOf(t) === -1;
      });
      var unlabeled = fields.filter(function (el) {
        if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title')) return false;
        if (el.closest('label')) return false;
        var id = el.getAttribute('id');
        return !(id && doc.querySelector('label[for="' + id.replace(/"/g, '') + '"]'));
      });
      if (unlabeled.length) add('label', 'errore', 'Campi con etichetta', unlabeled.length + ' campo/i senza label o aria-label.');
      else if (fields.length) add('label', 'ok', 'Campi con etichetta');

      var ids = {};
      var dup = [];
      Array.prototype.forEach.call(doc.querySelectorAll('[id]'), function (el) {
        var id = el.getAttribute('id');
        if (ids[id]) dup.push(id);
        ids[id] = true;
      });
      if (dup.length) add('id', 'errore', 'Id unici', 'Ripetuti: ' + dup.slice(0, 3).join(', '));
    } else {
      add('html', 'avviso', 'HTML non analizzabile', 'Non riesco a leggere l\'HTML qui.');
    }

    /* movimento */
    var moves = /animation\s*:|animation-name\s*:|transition\s*:|transition-property\s*:/.test(css);
    var reduced = /prefers-reduced-motion/.test(css);
    if (moves && !reduced) add('motion', 'avviso', 'Rispetta prefers-reduced-motion', 'Ci sono animazioni o transizioni ma nessuna regola @media (prefers-reduced-motion: reduce).');
    else if (moves) add('motion', 'ok', 'Rispetta prefers-reduced-motion');

    var heavy = [];
    var kf = /@keyframes\s+[\w-]+\s*\{([\s\S]*?\})\s*\}/g;
    var m;
    while ((m = kf.exec(css))) {
      var props = {};
      m[1].replace(/([a-z-]+)\s*:/g, function (_, p) { props[p] = true; return _; });
      Object.keys(props).forEach(function (p) {
        if (['transform', 'opacity', 'offset-distance', 'animation-timing-function', 'visibility'].indexOf(p) === -1 && heavy.indexOf(p) === -1) heavy.push(p);
      });
    }
    if (heavy.length) add('props', 'avviso', 'Anima solo transform e opacity', 'Anima anche: ' + heavy.slice(0, 4).join(', ') + ' (può essere meno fluido).');
    else if (/@keyframes/.test(css)) add('props', 'ok', 'Anima solo transform e opacity');

    var longMs = [];
    css.replace(/(?:transition|animation)[a-z-]*\s*:[^;{}]*?\b(\d*\.?\d+)(ms|s)\b/g, function (_, n, u) {
      var ms = parseFloat(n) * (u === 's' ? 1000 : 1);
      if (ms > 400 && ms <= 2000 && !/infinite/.test(_)) longMs.push(ms);
      return _;
    });
    if (longMs.length) add('durata', 'avviso', 'Transizioni tra 150 e 400 ms', 'Almeno una dura ' + Math.round(Math.max.apply(null, longMs)) + ' ms.');

    /* focus */
    if (/outline\s*:\s*(none|0)\b/.test(css) && !/:focus-visible|:focus-within/.test(css)) {
      add('focus', 'errore', 'Focus visibile', 'Togli l\'outline ma non c\'è uno stile :focus-visible alternativo.');
    } else if (/:focus-visible/.test(css)) {
      add('focus', 'ok', 'Focus visibile');
    }

    /* contrasto: solo regole con colore e sfondo scritti come #hex nella stessa regola */
    var bad = [];
    var checked = 0;
    css.replace(/([^{}@]+)\{([^{}]*)\}/g, function (_, sel, body) {
      var fg = /(?:^|[;\s])color\s*:\s*(#[0-9a-fA-F]{3,6})\b/.exec(body);
      var bg = /background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6})\b/.exec(body);
      if (fg && bg && normalizeHex(fg[1]) && normalizeHex(bg[1])) {
        checked += 1;
        var r = contrastRatio(normalizeHex(fg[1]), normalizeHex(bg[1]));
        if (r < 4.5) bad.push(sel.trim().split(',')[0].trim() + ' ' + (Math.round(r * 100) / 100) + ':1');
      }
      return _;
    });
    if (bad.length) add('contrasto', 'errore', 'Contrasto del testo (AA 4,5:1)', bad.slice(0, 3).join('; '));
    else if (checked) add('contrasto', 'ok', 'Contrasto del testo (AA 4,5:1)', checked + ' coppia/e controllata/e.');

    return res;
  }

  /* ---------- tipografia: scala fluida con clamp() ---------- */

  var SCALE_NAMES = { '-2': 'xs', '-1': 'sm', '0': 'base', '1': 'lg', '2': 'xl', '3': '2xl', '4': '3xl', '5': '4xl', '6': '5xl' };

  function num(v, def) {
    var n = parseFloat(v);
    return isFinite(n) ? n : def;
  }

  function r4(n) {
    return Math.round(n * 10000) / 10000;
  }

  /* opts: minSize, maxSize (px del testo base alle larghezze minVw e maxVw), minRatio, maxRatio, minVw, maxVw, giu, su */
  function fluidScale(opts) {
    var o = opts || {};
    var minSize = Math.max(8, num(o.minSize, 16));
    var maxSize = Math.max(minSize, num(o.maxSize, 18));
    var minRatio = Math.max(1, num(o.minRatio, 1.2));
    var maxRatio = Math.max(1, num(o.maxRatio, 1.25));
    var minVw = Math.max(200, num(o.minVw, 320));
    var maxVw = Math.max(minVw + 100, num(o.maxVw, 1240));
    var giu = Math.min(3, Math.max(0, Math.round(num(o.giu, 2))));
    var su = Math.min(6, Math.max(0, Math.round(num(o.su, 6))));
    var out = [];
    for (var i = -giu; i <= su; i++) {
      var min = minSize * Math.pow(minRatio, i);
      var max = maxSize * Math.pow(maxRatio, i);
      var slope = (max - min) / (maxVw - minVw);
      var intercept = min - slope * minVw;
      var lo = r4(min / 16);
      var hi = r4(max / 16);
      var valore = lo === hi
        ? lo + 'rem'
        : 'clamp(' + lo + 'rem, ' + r4(intercept / 16) + 'rem + ' + r4(slope * 100) + 'vw, ' + hi + 'rem)';
      out.push({ passo: i, nome: SCALE_NAMES[String(i)], min: r4(min), max: r4(max), valore: valore });
    }
    return out;
  }

  /* Variabili Root per la tipografia: famiglie, scala, interlinee. */
  function typographyVars(opts, fonts) {
    var f = fonts || {};
    var vars = [];
    if (str(f.titoli).trim()) vars.push({ nome: '--cat-font-heading', valore: str(f.titoli).trim() });
    if (str(f.testo).trim()) vars.push({ nome: '--cat-font-body', valore: str(f.testo).trim() });
    fluidScale(opts).forEach(function (s) {
      vars.push({ nome: '--cat-text-' + s.nome, valore: s.valore });
    });
    var o = opts || {};
    vars.push({ nome: '--cat-line-height', valore: String(num(o.lhTesto, 1.6)) });
    vars.push({ nome: '--cat-line-height-heading', valore: String(num(o.lhTitoli, 1.15)) });
    return vars;
  }

  /* Mette le variabili dentro i dati Root: aggiorna quelle che esistono già (ovunque siano)
     e aggiunge le nuove nel gruppo `gruppo` (lo crea se manca). Non modifica l'originale. */
  function mergeRootVars(rootData, vars, gruppo) {
    var data = JSON.parse(JSON.stringify(normalizeRoot(rootData)));
    var byName = {};
    data.gruppi.forEach(function (g) { g.variabili.forEach(function (v) { byName[v.nome] = v; }); });
    var target = null;
    data.gruppi.forEach(function (g) { if (g.nome === gruppo) target = g; });
    var aggiornate = 0;
    var aggiunte = 0;
    vars.forEach(function (v) {
      if (byName[v.nome]) {
        if (byName[v.nome].valore !== v.valore) aggiornate += 1;
        byName[v.nome].valore = v.valore;
        return;
      }
      if (!target) {
        target = { id: uid('g'), nome: gruppo, variabili: [] };
        data.gruppi.push(target);
      }
      target.variabili.push({ id: uid('v'), nome: v.nome, valore: v.valore, tipo: 'testo' });
      aggiunte += 1;
    });
    return { data: data, aggiunte: aggiunte, aggiornate: aggiornate };
  }

  /* ---------- palette neutra: dalla vecchia (verde) a quella a contrasto alto ---------- */

  var NEUTRAL_MAP = {
    '#2f6f4e': '#111111',
    '#3f9a6e': '#333333',
    '#4a5568': '#404040',
    '#d97706': '#005fcc',
    '#d9d9d2': '#8f8f8f',
    '#5c5c57': '#4a4a4a',
    '#1c1c1a': '#111111',
    '#fafaf7': '#f5f5f5',
    '#2f7d32': '#1e7a34',
    '#b26a00': '#8a5a00',
    '#b3261e': '#b00020',
    '#e9f2ec': '#ededed',
    '#8ad1a8': '#e5e5e5',
    '#f2f2ee': '#f2f2f2'
  };

  /* Sostituisce i colori della vecchia palette con quelli della nuova, in qualsiasi testo (CSS, HTML, JSON).
     Tocca solo i colori esattamente uguali a quelli di prima: gli altri restano. */
  function neutralizeColors(text) {
    return str(text)
      /* riempimenti (segnaposto, skeleton, tracce): prima usavano il colore del bordo, ora ne hanno uno più chiaro; gli interruttori no */
      .replace(/background: var\(--cat-color-border, #d9d9d2\)/g, function (m, offset, whole) {
        var prev = whole.slice(Math.max(0, offset - 260), offset).split('}').pop();
        return /switch/.test(prev) ? m : 'background: var(--cat-color-placeholder, #e2e2e2)';
      })
      .replace(/#[0-9a-fA-F]{6}\b/g, function (m) {
        var to = NEUTRAL_MAP[m.toLowerCase()];
        return to || m;
      })
      .replace(/rgb\(\s*47\s+111\s+78\s*\/\s*([0-9.]+)\s*\)/g, 'rgb(17 17 17 / $1)')
      .replace(/color\(display-p3 0\.15 0\.45 0\.3\)/g, 'color(display-p3 0 0.35 0.8)');
  }

  return {
    neutralizeColors: neutralizeColors,
    NEUTRAL_MAP: NEUTRAL_MAP,
    fluidScale: fluidScale,
    typographyVars: typographyVars,
    mergeRootVars: mergeRootVars,
    applyPreviewOptions: applyPreviewOptions,
    qualityCheck: qualityCheck,
    colorScale: colorScale,
    hexToCmyk: hexToCmyk,
    simulateColorBlind: simulateColorBlind,
    darkVariant: darkVariant,
    buildRootScss: buildRootScss,
    buildRootJson: buildRootJson,
    buildBootstrapOverride: buildBootstrapOverride,
    splitCode: splitCode,
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
