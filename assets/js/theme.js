// Botão de tema claro/escuro. A escolha fica salva neste navegador.
(function () {
  'use strict';
  var root = document.documentElement;
  var btn = document.getElementById('theme-btn');
  if (!btn) return;

  function current() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }

  function label() {
    var text = window.BT.t(current() === 'dark' ? 'theme.toLight' : 'theme.toDark');
    btn.setAttribute('aria-label', text);
    btn.title = text;
  }

  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('bt-theme', next); } catch (e) { /* ignora */ }
    label();
    document.dispatchEvent(new CustomEvent('bt:themechange'));
  });

  document.addEventListener('bt:langchange', label);
  label();
})();
