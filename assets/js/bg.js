// Fundo animado: "design vira código".
// À esquerda, curvas suaves com pontos de ancoragem (como no Figma).
// Conforme a curva avança para a direita, ela é encaixada na grade e vira pixels.
// Tudo se move sozinho. Respeita "reduzir movimento" e tem botão de pausa.
(function () {
  'use strict';

  var canvas = document.getElementById('bg');
  var btn = document.getElementById('anim-btn');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var root = document.documentElement;
  var reduceMq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  var INTRO_MS = 2000;
  var W = 0, H = 0, dpr = 1, cell = 28, cy = 0;
  var colors = { fg: [255, 255, 255], bg: [0, 0, 0], accent: [255, 90, 31] };
  var gridLayer = null;
  var t = 0, lastNow = 0, raf = 0;
  var introStart = null, introDone = false;
  var paused = false;

  // curvas cinza (desenho) e a curva laranja (a principal)
  var curves = [
    { amp: 0.070, k: 1.15, sp: 0.35, ph: 0.0, off: -0.15, a: 0.30, lw: 1.25 },
    { amp: 0.085, k: 0.90, sp: -0.28, ph: 1.7, off: -0.05, a: 0.24, lw: 1.25 },
    { amp: 0.060, k: 1.50, sp: 0.42, ph: 3.1, off: 0.08, a: 0.20, lw: 1.25 },
    { amp: 0.100, k: 1.00, sp: 0.30, ph: 0.6, off: 0.0, a: 1.0, lw: 2.5, orange: true }
  ];

  function clamp01(v) { return Math.min(1, Math.max(0, v)); }
  function smooth(a, b, x) { var u = clamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  function parseHex(v, fallback) {
    v = (v || '').trim().replace('#', '');
    if (v.length === 3) v = v.replace(/./g, '$&$&');
    if (!/^[0-9a-fA-F]{6}$/.test(v)) return fallback;
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
  }

  function readColors() {
    var cs = getComputedStyle(root);
    colors.fg = parseHex(cs.getPropertyValue('--fg'), colors.fg);
    colors.bg = parseHex(cs.getPropertyValue('--bg'), colors.bg);
    colors.accent = parseHex(cs.getPropertyValue('--accent'), colors.accent);
  }

  function yAt(c, x, time) {
    var u = (x / W) * Math.PI * 2 * c.k;
    return cy + c.off * H + c.amp * H * (Math.sin(u + time * c.sp + c.ph) + 0.35 * Math.sin(u * 2.1 - time * c.sp * 0.7 + c.ph * 2));
  }

  function buildGrid() {
    gridLayer = document.createElement('canvas');
    gridLayer.width = Math.max(1, Math.round(W * dpr));
    gridLayer.height = Math.max(1, Math.round(H * dpr));
    var g = gridLayer.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (var x = 0; x <= W; x += cell) {
      var a = 0.10 + 0.32 * smooth(W * 0.3, W * 0.72, x);
      g.fillStyle = rgba(colors.fg, a);
      for (var y = 0; y <= H; y += cell) g.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
    }
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = W < 700 ? 22 : 28;
    cy = H * 0.76;
    buildGrid();
    drawNow();
  }

  function gradient(stops) {
    var g = ctx.createLinearGradient(0, 0, W, 0);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    return g;
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);

    var xLim = W + cell * 2;
    if (!introDone) {
      if (introStart === null) introStart = now;
      var p = clamp01((now - introStart) / INTRO_MS);
      xLim = (1 - Math.pow(1 - p, 3)) * (W + cell * 2);
      if (p >= 1) introDone = true;
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, xLim, H);
    ctx.clip();

    ctx.drawImage(gridLayer, 0, 0, W, H);

    var startX = Math.floor((W * 0.3) / cell) * cell;
    var i, c, x, y, x0, yq;

    for (i = 0; i < curves.length; i++) {
      c = curves[i];
      var col = c.orange ? colors.accent : colors.fg;
      ctx.lineWidth = c.lw;
      ctx.lineJoin = 'round';

      // parte "desenho": linha suave que some perto do meio
      ctx.strokeStyle = gradient([[0, rgba(col, c.a)], [0.3, rgba(col, c.a)], [0.64, rgba(col, 0)], [1, rgba(col, 0)]]);
      ctx.beginPath();
      for (x = 0; x <= W * 0.7; x += 6) {
        y = yAt(c, x, t);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // parte "código": a mesma curva encaixada na grade
      if (c.orange) {
        for (x0 = startX; x0 < W; x0 += cell) {
          y = yAt(c, x0 + cell / 2, t);
          var top = Math.floor(y / cell) * cell;
          var al = smooth(W * 0.26, W * 0.62, x0 + cell / 2) * 0.92;
          ctx.fillStyle = rgba(col, al);
          ctx.fillRect(x0 + 1.5, top + 1.5, cell - 3, cell - 3);
        }
      } else {
        ctx.strokeStyle = gradient([[0, rgba(col, 0)], [0.36, rgba(col, 0)], [0.72, rgba(col, c.a)], [1, rgba(col, c.a)]]);
        ctx.beginPath();
        for (x0 = startX; x0 < W; x0 += cell) {
          yq = Math.round(yAt(c, x0 + cell / 2, t) / cell) * cell;
          if (x0 === startX) ctx.moveTo(x0, yq); else ctx.lineTo(x0, yq);
          ctx.lineTo(x0 + cell, yq);
        }
        ctx.stroke();
      }
    }

    // pontos de ancoragem e alças na curva laranja (só no lado "desenho")
    var orange = curves[curves.length - 1];
    var anchors = [0.07, 0.17, 0.27];
    var handle = Math.min(54, W * 0.05);
    for (i = 0; i < anchors.length; i++) {
      x = W * anchors[i];
      var fade = 1 - smooth(W * 0.3, W * 0.5, x);
      if (fade <= 0.02) continue;
      y = yAt(orange, x, t);
      var slope = (yAt(orange, x + 2, t) - yAt(orange, x - 2, t)) / 4;
      var len = Math.sqrt(1 + slope * slope);
      var dx = (1 / len) * handle, dy = (slope / len) * handle;

      ctx.strokeStyle = rgba(colors.fg, 0.55 * fade);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - dx, y - dy);
      ctx.lineTo(x + dx, y + dy);
      ctx.stroke();

      ctx.fillStyle = rgba(colors.bg, fade);
      ctx.strokeStyle = rgba(colors.fg, 0.8 * fade);
      [[x - dx, y - dy], [x + dx, y + dy]].forEach(function (pt) {
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      ctx.fillStyle = rgba(colors.bg, fade);
      ctx.strokeStyle = rgba(colors.accent, fade);
      ctx.lineWidth = 2;
      ctx.fillRect(x - 5, y - 5, 10, 10);
      ctx.strokeRect(x - 5, y - 5, 10, 10);
    }

    ctx.restore();
  }

  function drawNow() { draw(performance.now()); }

  function frame(now) {
    raf = 0;
    if (!lastNow) lastNow = now;
    var dt = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;
    if (!paused) t += dt;
    draw(now);
    if (!paused || !introDone) raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf) return;
    lastNow = 0;
    raf = requestAnimationFrame(frame);
  }

  function label() {
    if (!btn) return;
    var text = window.BT.t(paused ? 'anim.play' : 'anim.pause');
    btn.setAttribute('aria-pressed', String(paused));
    btn.setAttribute('aria-label', text);
    btn.title = text;
  }

  function setPaused(p, remember) {
    paused = p;
    if (remember) { try { localStorage.setItem('bt-anim', p ? 'paused' : 'playing'); } catch (e) { /* ignora */ } }
    label();
    if (paused) {
      if (!introDone) introDone = true;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      drawNow();
    } else {
      start();
    }
  }

  // opacidade do fundo: forte no início da página, mais discreto ao rolar
  var scrollQueued = false;
  function applyScroll() {
    scrollQueued = false;
    var k = clamp01(window.scrollY / (H * 0.85));
    canvas.style.opacity = String(1 - 0.82 * k);
  }
  function queueScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(applyScroll);
  }

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });
  window.addEventListener('scroll', queueScroll, { passive: true });
  document.addEventListener('bt:themechange', function () { readColors(); buildGrid(); drawNow(); });
  document.addEventListener('bt:langchange', label);
  if (btn) btn.addEventListener('click', function () { setPaused(!paused, true); });

  // estado inicial: preferência salva > preferência do sistema (reduzir movimento)
  var saved = null;
  try { saved = localStorage.getItem('bt-anim'); } catch (e) { /* ignora */ }
  var startPaused = saved ? saved === 'paused' : reduceMq.matches;
  if (startPaused) { introDone = true; t = 2; }

  readColors();
  resize();
  applyScroll();
  paused = startPaused;
  label();
  if (!paused) start();
})();
