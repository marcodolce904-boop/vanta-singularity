/* Anteprima: un iframe isolato (sandbox) con i pulsanti per la larghezza. */
(function () {
  'use strict';

  var App = window.CatalogoApp;
  var h = App.h;

  var WIDTHS = [
    { px: 375, label: '375 px' },
    { px: 768, label: '768 px' },
    { px: 1280, label: '1280 px' },
    { px: 0, label: 'Piena' }
  ];

  /* opts: { getDoc(): string, title, widths (default true), extra: [elementi da mettere nella barra] } */
  App.makePreview = function (opts) {
    var frame = h('iframe', { title: opts.title || 'Anteprima', sandbox: 'allow-scripts allow-forms allow-modals' });
    var holder = h('div', { class: 'frame-holder' }, frame);
    var bar = h('div', { class: 'preview-bar' });
    var buttons = [];
    var flags = { dark: false, still: false, grid: false, rotated: false };
    var currentPx = 0;
    var LANDSCAPE = { 375: 667, 768: 1024, 1280: 800 };

    function setWidth(px) {
      currentPx = px;
      var shown = px && flags.rotated && LANDSCAPE[px] ? LANDSCAPE[px] : px;
      frame.style.width = shown ? shown + 'px' : '100%';
      buttons.forEach(function (b) {
        b.el.setAttribute('aria-pressed', String(b.px === px));
      });
    }

    function toggle(label, key, title) {
      var el = h('button', {
        type: 'button',
        class: 'btn small',
        'aria-pressed': 'false',
        text: label,
        title: title,
        onclick: function () {
          flags[key] = !flags[key];
          el.setAttribute('aria-pressed', String(flags[key]));
          if (key === 'rotated') setWidth(currentPx);
          else refresh();
        }
      });
      return el;
    }

    if (opts.widths !== false) {
      bar.appendChild(h('span', { class: 'muted', text: 'Larghezza:' }));
      WIDTHS.forEach(function (w) {
        var el = h('button', {
          type: 'button',
          class: 'btn small',
          'aria-pressed': 'false',
          text: w.label,
          onclick: function () {
            setWidth(w.px);
          }
        });
        buttons.push({ el: el, px: w.px });
        bar.appendChild(el);
      });
    }

    if (opts.advanced !== false) {
      bar.appendChild(toggle('Ruota', 'rotated', 'Larghezza da orizzontale (667, 1024, 800 px)'));
      bar.appendChild(toggle('Scuro', 'dark', 'Imposta data-theme="dark" e color-scheme scuro'));
      bar.appendChild(toggle('Senza animazioni', 'still', 'Ferma animazioni e transizioni, come con prefers-reduced-motion'));
      bar.appendChild(toggle('Griglia 8 px', 'grid', 'Griglia di allineamento da 8 px'));
    }

    (opts.extra || []).forEach(function (x) {
      bar.appendChild(x);
    });

    function refresh() {
      frame.srcdoc = App.S.applyPreviewOptions(App.S.addPreviewShim(opts.getDoc()), flags);
    }

    setWidth(0);

    return {
      el: h('div', { class: 'preview' }, [bar, holder]),
      frame: frame,
      refresh: refresh,
      setWidth: setWidth
    };
  };
})();
