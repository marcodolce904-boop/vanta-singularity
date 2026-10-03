(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CatalogoPageBuilder = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /*
   * Mette insieme una pagina dalle sezioni scelte (strutture, componenti, animazioni, interazioni).
   * Funzioni pure: non leggono file. Il negozio dei dati le chiama dopo aver letto le sezioni.
   */

  function str(v) {
    return typeof v === 'string' ? v : v == null ? '' : String(v);
  }

  function esc(t) {
    return str(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Divide un CSS in blocchi di primo livello: regole, @media/@keyframes (con le graffe annidate) e istruzioni con «;». */
  function splitCssBlocks(css) {
    var s = str(css).replace(/\r\n?/g, '\n');
    var blocks = [];
    var i = 0;
    var n = s.length;
    var start = 0;
    var depth = 0;
    var quote = null;
    while (i < n) {
      var c = s[i];
      if (quote) {
        if (c === '\\') i += 1;
        else if (c === quote) quote = null;
      } else if (c === '"' || c === "'") {
        quote = c;
      } else if (c === '/' && s[i + 1] === '*') {
        var end = s.indexOf('*/', i + 2);
        i = end === -1 ? n : end + 1;
      } else if (c === '{') {
        depth += 1;
      } else if (c === '}') {
        depth -= 1;
        if (depth === 0) {
          blocks.push(s.slice(start, i + 1));
          start = i + 1;
        }
      } else if (c === ';' && depth === 0) {
        blocks.push(s.slice(start, i + 1));
        start = i + 1;
      }
      i += 1;
    }
    if (s.slice(start).trim()) blocks.push(s.slice(start));
    return blocks.map(function (b) { return b.trim(); }).filter(Boolean);
  }

  function blockKey(b) {
    return b.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};:,>])\s*/g, '$1').replace(/;}/g, '}').trim();
  }

  /* Unisce più CSS tenendo una sola volta i blocchi identici (per esempio il CSS del logo ripetuto in tre sezioni). */
  function dedupeCss(list) {
    var seen = Object.create(null);
    var out = [];
    var tolti = 0;
    list.forEach(function (item) {
      var css = typeof item === 'string' ? item : item.css;
      var label = typeof item === 'string' ? '' : item.nome;
      var mine = [];
      splitCssBlocks(css).forEach(function (b) {
        var k = blockKey(b);
        if (!k) return;
        if (seen[k]) { tolti += 1; return; }
        seen[k] = true;
        mine.push(b);
      });
      if (mine.length) out.push((label ? '/* ' + label.replace(/\*\//g, '* /') + ' */\n' : '') + mine.join('\n\n'));
    });
    return { css: out.join('\n\n') + (out.length ? '\n' : ''), tolti: tolti };
  }

  /* Ogni script gira nel suo ambiente: due sezioni con la stessa variabile non si pestano i piedi, e un errore non ferma le altre. */
  function wrapJs(js, label) {
    var body = str(js).trim();
    if (!body) return '';
    return '/* ' + str(label).replace(/\*\//g, '* /') + ' */\n(function () {\n  try {\n' +
      body.split('\n').map(function (l) { return l ? '    ' + l : l; }).join('\n') +
      '\n  } catch (e) {\n    console.error(' + JSON.stringify(str(label)) + ', e);\n  }\n})();\n';
  }

  function idsIn(html) {
    var ids = [];
    str(html).replace(/\sid\s*=\s*"([^"]+)"/g, function (_, id) { ids.push(id); return _; });
    return ids;
  }

  function assetsIn(text) {
    var out = [];
    str(text).replace(/assets\/([a-z0-9][a-z0-9._-]*\.[a-z0-9]+)/g, function (_, n) {
      if (out.indexOf(n) === -1) out.push(n);
      return _;
    });
    return out;
  }

  /*
   * page: { nome, titolo, descrizione, lingua, includi: { root, classi, responsive }, headExtra }
   * sezioni: [{ nome, kind, html, css, js }]
   * Ritorna { html, css, js, avvisi, assets, tolti } (html collega css/root.css, css/<prefisso>-classi.css, css/responsive.css e css/pagina.css)
   */
  function assemble(page, sezioni, opzioni) {
    var p = page || {};
    var o = opzioni || {};
    var inc = p.includi || {};
    var prefisso = o.prefisso || 'cat';
    var avvisi = [];

    if (!sezioni.length) avvisi.push('La pagina non ha ancora sezioni.');

    /* Stile di base: usa le variabili del Root se ci sono, altrimenti valori ragionevoli. */
    var BASE = 'body {\n  margin: 0;\n  background: var(--cat-color-bg, #fff);\n  color: var(--cat-color-text, #1c1c1a);\n  font-family: var(--cat-font-body, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);\n  font-size: var(--cat-text-base, 1rem);\n  line-height: var(--cat-line-height, 1.6);\n}\n\nh1, h2, h3, h4 {\n  font-family: var(--cat-font-heading, inherit);\n  line-height: var(--cat-line-height-heading, 1.2);\n}\n\nimg, svg, video {\n  max-width: 100%;\n}';
    var cssList = (o.base === false ? [] : [{ nome: 'Stile di base', css: BASE }]).concat(sezioni.map(function (s) { return { nome: s.nome, css: s.css }; }));
    var merged = dedupeCss(cssList);
    var js = sezioni.map(function (s) { return wrapJs(s.js, s.nome); }).filter(Boolean).join('\n');

    var seenIds = {};
    var dup = [];
    sezioni.forEach(function (s) {
      idsIn(s.html).forEach(function (id) {
        if (seenIds[id] && dup.indexOf(id) === -1) dup.push(id);
        seenIds[id] = true;
      });
    });
    if (dup.length) avvisi.push('Id ripetuti tra le sezioni (stesso componente usato due volte?): ' + dup.slice(0, 4).join(', ') + '. I componenti con JavaScript agganciano il primo.');

    sezioni.forEach(function (s) {
      if (/<\/?(html|body|head)\b/i.test(s.html)) avvisi.push('«' + s.nome + '» contiene <html>, <head> o <body>: non dovrebbe.');
    });
    var h1 = 0;
    sezioni.forEach(function (s) { h1 += (str(s.html).match(/<h1[\s>]/gi) || []).length; });
    if (h1 > 1) avvisi.push('Ci sono ' + h1 + ' titoli h1 nella pagina: ne basta uno.');

    var usaSticky = sezioni.some(function (s) { return /data-cat-offcanvas-backdrop/.test(s.html); });
    if (usaSticky && sezioni.filter(function (s) { return /data-cat-offcanvas-backdrop/.test(s.html); }).length > 1) {
      avvisi.push('Più off-canvas hanno ciascuno il proprio sfondo scuro: tienine uno solo.');
    }

    var body = sezioni.map(function (s) {
      return '<!-- ===== ' + str(s.nome).replace(/--/g, '- -') + ' ===== -->\n' + str(s.html).replace(/\s+$/, '') + '\n';
    }).join('\n');

    var head = [];
    head.push('  <meta charset="utf-8">');
    head.push('  <meta name="viewport" content="width=device-width, initial-scale=1">');
    head.push('  <title>' + esc(p.titolo || p.nome || 'Senza titolo') + '</title>');
    if (str(p.descrizione).trim()) head.push('  <meta name="description" content="' + esc(p.descrizione) + '">');
    if (str(p.headExtra).trim()) head.push(str(p.headExtra).replace(/\s+$/, '').split('\n').map(function (l) { return '  ' + l; }).join('\n'));
    if (inc.root) head.push('  <link rel="stylesheet" href="css/root.css">');
    if (inc.classi) head.push('  <link rel="stylesheet" href="css/' + prefisso + '-classi.css">');
    if (inc.responsive) head.push('  <link rel="stylesheet" href="css/responsive.css">');
    if (merged.css.trim()) head.push('  <link rel="stylesheet" href="css/pagina.css">');

    var html = '<!doctype html>\n<html lang="' + esc(p.lingua || 'it') + '">\n<head>\n' + head.join('\n') + '\n</head>\n<body>\n' + body +
      (js ? '\n<script src="js/pagina.js" defer></script>\n' : '') + '</body>\n</html>\n';

    var assets = [];
    assetsIn(html).concat(assetsIn(merged.css), assetsIn(js)).forEach(function (a) { if (assets.indexOf(a) === -1) assets.push(a); });

    return { html: html, css: merged.css, js: js, avvisi: avvisi, assets: assets, tolti: merged.tolti };
  }

  /* Pagina in un file solo (per l'anteprima): CSS e JS dentro, gli asset sostituiti dai dati già letti. */
  function inlinePreview(built, extraCss, assetMap) {
    var css = extraCss.filter(Boolean).join('\n') + '\n' + built.css;
    var html = built.html.replace(/\s*<link rel="stylesheet" href="css\/[^"]+">/g, '');
    html = html.replace('</head>', '<style>' + css.replace(/<\/style/gi, '<\\/style') + '</style>\n</head>');
    if (built.js) {
      html = html.replace(/<script src="js\/pagina\.js" defer><\/script>/, '<script>' + built.js.replace(/<\/script/gi, '<\\/script') + '</script>');
    }
    if (assetMap) {
      html = html.replace(/assets\/([a-z0-9][a-z0-9._-]*\.[a-z0-9]+)/g, function (m, name) { return assetMap[name] || m; });
    }
    return html;
  }

  return { splitCssBlocks: splitCssBlocks, dedupeCss: dedupeCss, wrapJs: wrapJs, assemble: assemble, inlinePreview: inlinePreview, assetsIn: assetsIn };
});
