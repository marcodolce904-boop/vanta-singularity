/* Funzioni di base dell'app: elementi, avvisi, finestre di dialogo. */
(function () {
  'use strict';

  var App = (window.CatalogoApp = window.CatalogoApp || {});
  App.S = window.CatalogoShared;
  App.tabDefs = [];
  App.defineTab = function (def) {
    App.tabDefs.push(def);
  };

  /* ---------- elementi ---------- */

  function appendKids(el, kids) {
    (Array.isArray(kids) ? kids : [kids]).forEach(function (k) {
      if (k == null || k === false) return;
      if (Array.isArray(k)) appendKids(el, k);
      else el.appendChild(typeof k === 'object' ? k : document.createTextNode(String(k)));
    });
  }

  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    var value;
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'value') value = v;
      else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    });
    appendKids(el, kids);
    if (value !== undefined) el.value = value;
    return el;
  }

  /* ---------- avvisi ---------- */

  var toastTimer = null;

  function toast(message, isError) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.className = isError ? 'errore' : '';
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.hidden = true;
    }, isError ? 7000 : 2800);
  }

  function cleanError(e) {
    var m = e && e.message ? e.message : String(e);
    return m
      .replace(/^Error invoking remote method '[^']*':\s*/, '')
      .replace(/^(Type|Range)?Error:\s*/, '');
  }

  /* Esegue fn (che può restituire una promessa). Se fallisce mostra l'errore e restituisce undefined. */
  function run(fn) {
    return new Promise(function (resolve) {
      resolve(fn());
    }).catch(function (e) {
      toast(cleanError(e), true);
      return undefined;
    });
  }

  function debounce(fn, ms) {
    var t = null;
    var wrapped = function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () {
        t = null;
        fn.apply(null, args);
      }, ms);
    };
    wrapped.cancel = function () {
      clearTimeout(t);
      t = null;
    };
    return wrapped;
  }

  function copyText(text, label) {
    return run(function () {
      return window.api.copy(text);
    }).then(function (r) {
      if (r) toast((label || 'Testo') + ' copiato negli appunti');
      return !!r;
    });
  }

  /* ---------- CSS globale: root e classi salvate (per le anteprime) ---------- */

  var globalCache = null;

  App.getGlobal = function () {
    if (!globalCache) {
      globalCache = Promise.resolve(window.api.getGlobalCss()).catch(function (e) {
        globalCache = null;
        throw e;
      });
    }
    return globalCache;
  };

  App.invalidateGlobal = function () {
    globalCache = null;
  };

  /* ---------- finestre di dialogo ---------- */

  function openDialog(d) {
    if (typeof d.showModal === 'function') d.showModal();
    else d.setAttribute('open', '');
  }

  function closeDialog(d) {
    if (typeof d.close === 'function') {
      try {
        d.close();
      } catch (e) {
        d.removeAttribute('open');
      }
    } else {
      d.removeAttribute('open');
    }
  }

  /* Ogni finestra è un <dialog> nuovo, così una chiusura in ritardo non tocca la finestra successiva. */
  function modal(build) {
    return new Promise(function (resolve) {
      var d = h('dialog', { class: 'modal' });
      var done = false;

      function finish(value) {
        if (done) return;
        done = true;
        closeDialog(d);
        if (d.parentNode) d.parentNode.removeChild(d);
        resolve(value);
      }

      d.addEventListener('close', function () {
        finish(null);
      });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          finish(null);
        }
      });

      build(d, finish);
      document.body.appendChild(d);
      openDialog(d);
      var first = d.querySelector('input, textarea, select, button');
      if (first) first.focus();
    });
  }

  function actionButtonClass(danger) {
    return 'btn ' + (danger ? 'danger solid' : 'primary');
  }

  /* opts: { title, intro, fields:[{name,label,value,type,placeholder,hint,rows}], okLabel, danger, validate(values) }
     Restituisce una promessa con i valori, oppure null se annullata. */
  function askForm(opts) {
    return modal(function (d, finish) {
      var inputs = {};
      var err = h('p', { class: 'form-error', role: 'alert' });
      var form = h('form', { class: 'modal-form', novalidate: true }, [h('h2', { text: opts.title })]);
      if (opts.intro) form.appendChild(h('p', { class: 'muted', text: opts.intro }));

      (opts.fields || []).forEach(function (f) {
        var input =
          f.type === 'textarea'
            ? h('textarea', { name: f.name, rows: f.rows || 5, placeholder: f.placeholder, spellcheck: 'false' })
            : h('input', { type: 'text', name: f.name, placeholder: f.placeholder, autocomplete: 'off', spellcheck: 'false' });
        input.value = f.value || '';
        inputs[f.name] = input;
        form.appendChild(
          h('label', { class: 'field' }, [
            h('span', { text: f.label }),
            input,
            f.hint ? h('small', { class: 'muted', text: f.hint }) : null
          ])
        );
      });

      form.appendChild(err);
      form.appendChild(
        h('div', { class: 'modal-actions' }, [
          h('button', {
            type: 'button',
            class: 'btn',
            text: 'Annulla',
            onclick: function () {
              finish(null);
            }
          }),
          h('button', { type: 'submit', class: actionButtonClass(opts.danger), text: opts.okLabel || 'OK' })
        ])
      );

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var values = {};
        Object.keys(inputs).forEach(function (k) {
          values[k] = inputs[k].value;
        });
        var msg = opts.validate ? opts.validate(values) : null;
        if (msg) {
          err.textContent = msg;
          return;
        }
        finish(values);
      });

      d.appendChild(form);
    });
  }

  /* opts: { title, message, okLabel, cancelLabel, danger } -> promessa con true / false */
  function askConfirm(opts) {
    return modal(function (d, finish) {
      d.appendChild(
        h('div', { class: 'modal-form' }, [
          h('h2', { text: opts.title }),
          opts.message ? h('p', { text: opts.message }) : null,
          h('div', { class: 'modal-actions' }, [
            h('button', {
              type: 'button',
              class: 'btn',
              text: opts.cancelLabel || 'Annulla',
              onclick: function () {
                finish(false);
              }
            }),
            h('button', {
              type: 'button',
              class: actionButtonClass(opts.danger),
              text: opts.okLabel || 'OK',
              onclick: function () {
                finish(true);
              }
            })
          ])
        ])
      );
    }).then(function (v) {
      return v === true;
    });
  }

  /* opts: { title, message, choices:[{value,label,kind}] } -> promessa con il valore scelto, oppure null */
  function askChoice(opts) {
    return modal(function (d, finish) {
      var buttons = opts.choices.map(function (c) {
        return h('button', {
          type: 'button',
          class: 'btn' + (c.kind ? ' ' + c.kind : ''),
          text: c.label,
          onclick: function () {
            finish(c.value);
          }
        });
      });
      d.appendChild(
        h('div', { class: 'modal-form' }, [
          h('h2', { text: opts.title }),
          opts.message ? h('p', { text: opts.message }) : null,
          h('div', { class: 'modal-actions' }, buttons)
        ])
      );
    });
  }

  /* ---------- modifiche non salvate ---------- */

  /* Restituisce true se si può proseguire (niente da salvare, salvato, oppure scartato). */
  function guardDirty(tab) {
    if (!tab || !tab.isDirty()) return Promise.resolve(true);
    return askChoice({
      title: 'Modifiche non salvate',
      message: 'Cosa faccio con le modifiche in «' + tab.label + '»?',
      choices: [
        { value: 'cancel', label: 'Annulla' },
        { value: 'discard', label: 'Scarta le modifiche', kind: 'danger' },
        { value: 'save', label: 'Salva e continua', kind: 'primary' }
      ]
    }).then(function (v) {
      if (v === 'save') return tab.save();
      if (v === 'discard') {
        tab.discard();
        return true;
      }
      return false;
    });
  }

  App.h = h;
  App.toast = toast;
  App.cleanError = cleanError;
  App.run = run;
  App.debounce = debounce;
  App.copyText = copyText;
  App.modal = modal;
  App.askForm = askForm;
  App.askConfirm = askConfirm;
  App.askChoice = askChoice;
  App.guardDirty = guardDirty;
})();
