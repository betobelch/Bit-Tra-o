// Português fica no HTML (bom para buscadores e para quem está sem JavaScript).
// O inglês vem deste dicionário. Elementos usam data-i18n="chave" (texto)
// e data-i18n-attr="atributo:chave, atributo2:chave2" (atributos).
(function () {
  'use strict';

  // Textos que só existem no JavaScript (mensagens do formulário, rótulos dos botões).
  var PT_JS = {
    'theme.toLight': 'Mudar para o tema claro',
    'theme.toDark': 'Mudar para o tema escuro',
    'anim.pause': 'Pausar animação de fundo',
    'anim.play': 'Retomar animação de fundo',
    'copy.ok': 'E-mail copiado.',
    'copy.fail': 'Não foi possível copiar. Selecione o endereço e copie manualmente.',
    'form.errRequired': 'Preencha este campo.',
    'form.errEmail': 'Digite um e-mail válido, como nome@exemplo.com.',
    'form.sending': 'Enviando…',
    'form.ok': 'Mensagem enviada. Respondemos por e-mail.',
    'form.fail': 'Não foi possível enviar. Tente de novo ou escreva para o e-mail ao lado.',
    'form.noEndpoint': 'O formulário ainda não está ativo. Escreva direto para o e-mail ao lado.'
  };

  var EN = {
    'meta.title': 'Bit & Traço — web design and development',
    'meta.desc': 'A two-person studio: Nicole designs, Roberto codes. Websites from first sketch to launch, for clients in Brazil and abroad.',
    'skip': 'Skip to content',
    'nav.home': 'Bit & Traço, home',
    'nav.aria': 'Main',
    'nav.services': 'Services',
    'nav.cases': 'Projects',
    'nav.about': 'About us',
    'nav.process': 'Process',
    'nav.contact': 'Contact',
    'lang.aria': 'Language',
    'menu.label': 'Menu',
    'hero.title': 'Websites designed and built by the same two people.',
    'hero.lead': 'Nicole designs in Figma and Roberto turns the design into code. You talk to the people doing the work, from the first sketch to a live website.',
    'hero.cta1': 'See projects',
    'hero.cta2': 'Get in touch',
    'hero.legendL': 'design',
    'hero.legendR': 'code',
    'services.title': 'What we do',
    'svc1.t': 'Company websites and portfolios',
    'svc1.d': 'Clear, fast pages to present your business or your work, in one or two languages.',
    'svc2.t': 'Menus, stores and online ordering',
    'svc2.d': 'From catalog to cart to checkout, built for people shopping on their phones.',
    'svc3.t': 'Visual identity and interfaces',
    'svc3.d': 'Colors, typography and screens designed in Figma, with a design system ready for code.',
    'svc4.t': 'Code review and security',
    'svc4.d': 'We read the code you already have, point out flaws such as SQL injection and XSS, and deliver tested fixes.',
    'tag.design': 'design',
    'tag.frontend': 'front-end',
    'tag.security': 'security',
    'tag.tests': 'tests',
    'tag.own': 'own project',
    'tag.ai': 'AI',
    'tag.code': 'code',
    'cases.title': 'Projects',
    'cases.lead': 'A few projects that show how we think and work.',
    'cases.tabs': 'Projects',
    'case1.alt': 'Home screen of the Yakisoba Lucky prototype: dark background with a bowl of yakisoba front and center.',
    'case1.kind': 'Restaurant website prototype',
    'case1.d': 'Seven pages: home, menu, product, cart, checkout, confirmation and the design system page.',
    'case2.alt': 'XSS demo from Secure Code Review: the injected script is shown running inside an isolated frame.',
    'case2.kind': 'Vulnerable code, fixed and tested',
    'case2.d': 'Two example flaws, SQL injection and XSS, each with a vulnerable version, a fixed version, automated tests (30 in total) and a report. The presentation page includes an XSS demo isolated in a sandbox.',
    'case3.alt': 'Illustration of a code snippet with the buggy line marked in red and the fix in green.',
    'case3.kind': 'Code evaluation with AI',
    'case3.d': 'A workflow for evaluating code with AI support: find the bug, explain why it happens and suggest the fix.',
    'case4.alt': 'Illustration of a 0 to 100 gauge next to bars for weighted criteria.',
    'case4.kind': 'Tests for AI skills',
    'case4.d': 'A tester that runs cases defined in a file and gives a score from 0 to 100, adding up criteria with different weights.',
    'about.title': 'About us',
    'about.lead': 'We are a web design and development duo. We work with clients in Brazil and abroad, in Portuguese and in English.',
    'about.nicole.role': 'Designer',
    'about.nicole.d': 'Takes care of visual identity and screens in Figma. Decides how the site should look and how people will use it.',
    'about.roberto.role': 'Web Developer',
    'about.roberto.d': 'Builds the website and handles performance, security and publishing. Makes sure the design reaches the browser as intended.',
    'process.title': 'How we work',
    'step1.t': 'Conversation',
    'step1.d': 'We learn about your goal, your audience and your deadline.',
    'step2.t': 'Design',
    'step2.d': 'Nicole designs the screens in Figma. You approve them before a single line of code is written.',
    'step3.t': 'Code',
    'step3.d': 'Roberto builds the site and tests it on phones and computers.',
    'step4.t': 'Launch',
    'step4.d': 'We publish the site and show you how to update it.',
    'who.both': 'Nicole and Roberto',
    'who.nicole': 'Nicole',
    'who.roberto': 'Roberto',
    'contact.title': 'Let’s talk about your project',
    'contact.lead': 'Tell us what you need and we will reply by email.',
    'contact.emailLabel': 'Email',
    'contact.copy': 'Copy email',
    'form.name': 'Name',
    'form.email': 'Your email',
    'form.msg': 'About the project',
    'form.msgPh': 'What do you want to build? By when?',
    'form.submit': 'Send message',
    'footer.credit': 'Design: Nicole. Code: Roberto.',
    'theme.toLight': 'Switch to light theme',
    'theme.toDark': 'Switch to dark theme',
    'anim.pause': 'Pause background animation',
    'anim.play': 'Resume background animation',
    'copy.ok': 'Email copied.',
    'copy.fail': 'Could not copy. Select the address and copy it manually.',
    'form.errRequired': 'Fill in this field.',
    'form.errEmail': 'Enter a valid email, like name@example.com.',
    'form.sending': 'Sending…',
    'form.ok': 'Message sent. We will reply by email.',
    'form.fail': 'Could not send. Try again or write to the email beside it.',
    'form.noEndpoint': 'The form is not active yet. Write directly to the email beside it.'
  };

  var root = document.documentElement;
  var PT = {};
  Object.keys(PT_JS).forEach(function (k) { PT[k] = PT_JS[k]; });

  var textEls = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var attrEls = Array.prototype.slice.call(document.querySelectorAll('[data-i18n-attr]'));

  function pairs(el) {
    return el.getAttribute('data-i18n-attr').split(',').map(function (p) {
      var i = p.indexOf(':');
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    });
  }

  // Guarda o português que já está no HTML.
  textEls.forEach(function (el) { PT[el.getAttribute('data-i18n')] = el.textContent; });
  attrEls.forEach(function (el) {
    pairs(el).forEach(function (p) { PT[p[1]] = el.getAttribute(p[0]); });
  });

  var lang = 'pt';

  function t(key) {
    var dict = lang === 'en' ? EN : PT;
    return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key;
  }

  function apply() {
    root.lang = lang === 'en' ? 'en' : 'pt-BR';
    textEls.forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    attrEls.forEach(function (el) {
      pairs(el).forEach(function (p) { el.setAttribute(p[0], t(p[1])); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-msg]'), function (el) {
      el.textContent = t(el.getAttribute('data-msg'));
    });
    document.dispatchEvent(new CustomEvent('bt:langchange'));
  }

  function setLang(next) {
    if (next !== 'pt' && next !== 'en') return;
    lang = next;
    try { localStorage.setItem('bt-lang', next); } catch (e) { /* ignora */ }
    apply();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });

  var initial = null;
  try { initial = localStorage.getItem('bt-lang'); } catch (e) { /* ignora */ }
  if (initial !== 'pt' && initial !== 'en') {
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'pt';
    initial = /^pt/i.test(nav) ? 'pt' : 'en';
  }

  window.BT = { t: t, getLang: function () { return lang; } };
  lang = initial;
  if (lang === 'en') { apply(); } else { document.dispatchEvent(new CustomEvent('bt:langchange')); }
})();
