'use strict';

/* Informazioni sui file degli asset: tipo, dimensioni in pixel, avvisi di peso e sicurezza. Nessuna libreria. */

const TIPI = {
  png: 'immagine', jpg: 'immagine', jpeg: 'immagine', gif: 'immagine', webp: 'immagine', avif: 'immagine', ico: 'immagine',
  svg: 'svg',
  json: 'lottie',
  mp4: 'video', webm: 'video',
  woff2: 'font', woff: 'font', ttf: 'font', otf: 'font',
  pdf: 'documento'
};

const ETICHETTE = { immagine: 'Immagini', svg: 'SVG', lottie: 'Lottie', video: 'Video', font: 'Font', documento: 'Documenti' };

const MAX_BYTE = 50 * 1024 * 1024;

function extOf(nome) {
  const m = /\.([a-z0-9]+)$/i.exec(String(nome));
  return m ? m[1].toLowerCase() : '';
}

function tipoPer(ext) {
  return TIPI[String(ext).toLowerCase()] || null;
}

function sizeOfPng(b) {
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

function sizeOfGif(b) {
  if (b.length < 10 || b.toString('ascii', 0, 3) !== 'GIF') return null;
  return { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
}

function sizeOfJpeg(b) {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i += 1; continue; }
    const m = b[i + 1];
    if (m === 0xff) { i += 1; continue; }
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    }
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7) || m === 0x01) { i += 2; continue; }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

function sizeOfWebp(b) {
  if (b.length < 30 || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const fmt = b.toString('ascii', 12, 16);
  if (fmt === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (fmt === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (fmt === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

function sizeOfIco(b) {
  if (b.length < 8 || b.readUInt16LE(0) !== 0 || b.readUInt16LE(2) !== 1) return null;
  return { w: b[6] || 256, h: b[7] || 256 };
}

function sizeOfSvg(text) {
  const tag = /<svg\b[^>]*>/i.exec(text);
  if (!tag) return null;
  const attr = function (n) {
    const m = new RegExp('\\b' + n + '\\s*=\\s*["\']\\s*([0-9.]+)\\s*(?:px)?\\s*["\']', 'i').exec(tag[0]);
    return m ? Math.round(parseFloat(m[1])) : null;
  };
  let w = attr('width');
  let h = attr('height');
  if (!w || !h) {
    const vb = /viewBox\s*=\s*["']\s*[-0-9.]+[ ,]+[-0-9.]+[ ,]+([0-9.]+)[ ,]+([0-9.]+)\s*["']/i.exec(tag[0]);
    if (vb) { w = w || Math.round(parseFloat(vb[1])); h = h || Math.round(parseFloat(vb[2])); }
  }
  return w && h ? { w: w, h: h } : null;
}

function lottieInfo(text) {
  let j;
  try {
    j = JSON.parse(text);
  } catch (e) {
    return null;
  }
  if (!j || typeof j !== 'object' || !Array.isArray(j.layers) || typeof j.fr !== 'number') return null;
  const durata = j.fr > 0 && typeof j.op === 'number' ? Math.round(((j.op - (j.ip || 0)) / j.fr) * 100) / 100 : null;
  return { w: j.w || null, h: j.h || null, fps: j.fr, durata: durata, livelli: j.layers.length };
}

/* Legge il file (già in memoria, anche solo l'inizio) e dice cosa contiene. */
function inspect(nome, buf, byteTotali) {
  const ext = extOf(nome);
  const tipo = tipoPer(ext);
  const out = { tipo: tipo, ext: ext, byte: byteTotali, w: null, h: null, info: '', avvisi: [] };
  let dim = null;
  if (tipo === 'immagine') {
    dim = ext === 'png' ? sizeOfPng(buf) : ext === 'gif' ? sizeOfGif(buf) : ext === 'jpg' || ext === 'jpeg' ? sizeOfJpeg(buf) : ext === 'webp' ? sizeOfWebp(buf) : ext === 'ico' ? sizeOfIco(buf) : null;
    if (byteTotali > 500 * 1024 && ext !== 'webp' && ext !== 'avif') out.avvisi.push('Pesante (' + Math.round(byteTotali / 1024) + ' KB): prova WebP o riduci le dimensioni.');
    else if (byteTotali > 1024 * 1024) out.avvisi.push('Pesante (' + (Math.round(byteTotali / 1024 / 10.24) / 100) + ' MB).');
    if (dim && dim.w > 2560) out.avvisi.push('Molto larga (' + dim.w + ' px): per il web bastano di solito 1600-2000 px.');
  } else if (tipo === 'svg') {
    const text = buf.toString('utf8');
    dim = sizeOfSvg(text);
    if (/<script\b|\son[a-z]+\s*=|javascript:/i.test(text)) out.avvisi.push('Contiene script: usalo solo con <img> (lì non vengono eseguiti), mai in linea nella pagina.');
    if (byteTotali > 100 * 1024) out.avvisi.push('SVG pesante (' + Math.round(byteTotali / 1024) + ' KB): semplificalo o passa a un formato raster.');
  } else if (tipo === 'lottie') {
    const li = lottieInfo(buf.toString('utf8'));
    if (li) {
      dim = li.w && li.h ? { w: li.w, h: li.h } : null;
      out.info = li.fps + ' fps' + (li.durata != null ? ' · ' + li.durata + ' s' : '') + ' · ' + li.livelli + ' livelli';
    }
    if (byteTotali > 300 * 1024) out.avvisi.push('Lottie pesante (' + Math.round(byteTotali / 1024) + ' KB): rallenta le pagine, prova a semplificarlo.');
  } else if (tipo === 'video') {
    if (byteTotali > 10 * 1024 * 1024) out.avvisi.push('Video pesante (' + Math.round(byteTotali / 1048576) + ' MB): comprimilo prima di metterlo nel sito.');
  } else if (tipo === 'font') {
    if (ext === 'ttf' || ext === 'otf') out.avvisi.push('Meglio woff2: pesa circa la metà e lo leggono tutti i browser.');
  }
  if (dim) { out.w = dim.w; out.h = dim.h; }
  return out;
}

module.exports = { inspect: inspect, tipoPer: tipoPer, extOf: extOf, lottieInfo: lottieInfo, ETICHETTE: ETICHETTE, TIPI: TIPI, MAX_BYTE: MAX_BYTE, sizeOfSvg: sizeOfSvg };
