// Menu, destaque da seção atual, copiar e-mail e formulário de contato.
(function () {
  'use strict';

  // Quando tiver um serviço de formulário (Formspree, Getform, Basin...), cole o endereço aqui
  // e libere o domínio dele em "connect-src" na tag de CSP do index.html.
  var FORM_ENDPOINT = '';

  var BT = window.BT;
  var $ = function (id) { return document.getElementById(id); };

  // mostra uma mensagem que acompanha a troca de idioma
  function showMsg(el, key) {
    if (!el) return;
    if (key) {
      el.setAttribute('data-msg', key);
      el.textContent = BT.t(key);
      el.hidden = false;
    } else {
      el.removeAttribute('data-msg');
      el.textContent = '';
      if (el.classList.contains('field-error')) el.hidden = true;
    }
  }

  // ano no rodapé
  var year = $('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // menu no celular
  var menuBtn = $('menu-btn');
  var panel = $('panel');
  function setMenu(open) {
    if (!menuBtn || !panel) return;
    panel.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  if (menuBtn && panel) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    panel.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.nav a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 960) setMenu(false); });
  }

  // destaca no menu a seção que está na tela
  var links = {};
  Array.prototype.forEach.call(document.querySelectorAll('.nav a[href^="#"]'), function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (id) { links[id].removeAttribute('aria-current'); });
        var a = links[en.target.id];
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) {
      var sec = $(id);
      if (sec) io.observe(sec);
    });
  }

  // vitrine de projetos: abas (sem JavaScript, os quatro projetos aparecem um embaixo do outro)
  var tabList = document.querySelector('.tabs');
  var cases = Array.prototype.slice.call(document.querySelectorAll('.case'));
  if (tabList && cases.length) {
    var tabs = cases.map(function (panel, i) {
      var name = panel.querySelector('h3').textContent;
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'tab';
      tab.id = 'tab-' + (i + 1);
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      tab.textContent = name;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      tabList.appendChild(tab);
      return tab;
    });

    var selectTab = function (index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        cases[i].hidden = !on;
      });
      var cur = tabs[index];
      tabList.scrollLeft = cur.offsetLeft - (tabList.clientWidth - cur.offsetWidth) / 2;
      if (focus) cur.focus();
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(i, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        selectTab(next, true);
      });
    });

    tabList.hidden = false;
    selectTab(0, false);
  }

  // copiar e-mail
  var copyBtn = $('copy-btn');
  var copyStatus = $('copy-status');
  var copyTimer = 0;
  function copyFlash(key) {
    showMsg(copyStatus, key);
    clearTimeout(copyTimer);
    copyTimer = setTimeout(function () { showMsg(copyStatus, null); }, 4000);
  }
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var addr = $('email-addr').textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(addr).then(
          function () { copyFlash('copy.ok'); },
          function () { copyFlash('copy.fail'); }
        );
      } else {
        copyFlash('copy.fail');
      }
    });
  }

  // formulário
  var form = $('contact-form');
  if (!form) return;
  var status = $('form-status');
  var submit = $('submit-btn');
  var fields = [
    { input: $('f-name'), err: $('f-name-err'), kind: 'text' },
    { input: $('f-email'), err: $('f-email-err'), kind: 'email' },
    { input: $('f-msg'), err: $('f-msg-err'), kind: 'text' }
  ];
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(f) {
    var v = f.input.value.trim();
    var key = null;
    if (!v) key = 'form.errRequired';
    else if (f.kind === 'email' && !EMAIL_RE.test(v)) key = 'form.errEmail';
    showMsg(f.err, key);
    if (key) {
      f.input.setAttribute('aria-invalid', 'true');
      f.input.setAttribute('aria-describedby', f.err.id);
    } else {
      f.input.removeAttribute('aria-invalid');
      f.input.removeAttribute('aria-describedby');
    }
    return !key;
  }

  fields.forEach(function (f) {
    f.input.addEventListener('input', function () {
      if (f.input.getAttribute('aria-invalid') === 'true') validate(f);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showMsg(status, null);
    var firstBad = null;
    fields.forEach(function (f) {
      if (!validate(f) && !firstBad) firstBad = f.input;
    });
    if (firstBad) { firstBad.focus(); return; }

    if (!FORM_ENDPOINT) { showMsg(status, 'form.noEndpoint'); return; }

    submit.disabled = true;
    showMsg(status, 'form.sending');
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: fields[0].input.value.trim(),
        email: fields[1].input.value.trim(),
        message: fields[2].input.value.trim()
      })
    }).then(function (res) {
      if (!res.ok) throw new Error('http ' + res.status);
      form.reset();
      showMsg(status, 'form.ok');
    }).catch(function () {
      showMsg(status, 'form.fail');
    }).then(function () {
      submit.disabled = false;
    });
  });
})();
