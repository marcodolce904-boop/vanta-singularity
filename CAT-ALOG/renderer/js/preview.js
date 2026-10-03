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
    var frame = h('iframe', { title: opts.title || 'Anteprima', sandbox: 'allow-scripts' });
    var holder = h('div', { class: 'frame-holder' }, frame);
    var bar = h('div', { class: 'preview-bar' });
    var buttons = [];

    function setWidth(px) {
      frame.style.width = px ? px + 'px' : '100%';
      buttons.forEach(function (b) {
        b.el.setAttribute('aria-pressed', String(b.px === px));
      });
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

    (opts.extra || []).forEach(function (x) {
      bar.appendChild(x);
    });

    function refresh() {
      frame.srcdoc = opts.getDoc();
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
