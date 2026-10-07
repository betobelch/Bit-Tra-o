// Roda antes da página aparecer, para o tema certo não "piscar".
(function () {
  var theme = 'dark';
  try {
    var saved = localStorage.getItem('bt-theme');
    if (saved === 'light' || saved === 'dark') {
      theme = saved;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      theme = 'light';
    }
  } catch (e) {
    /* sem localStorage: usa o tema padrão */
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
