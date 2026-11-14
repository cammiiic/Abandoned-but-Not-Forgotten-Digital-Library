/* =====================================================================
   Abandoned but Not Forgotten — app logic (no build step, no libraries)
   Sections register themselves in VIEWS; content comes from data/books.js
   ===================================================================== */

(function () {
  'use strict';

  var DATA = window.ABNF_DATA;
  var LANGS = ['en', 'es'];
  var app = document.getElementById('app');
  var VIEWS = {};
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var state = { lang: 'en' };

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // UI string with {vars}
  function t(key, vars) {
    var s = DATA.ui[state.lang][key];
    if (s == null) s = DATA.ui.en[key];
    if (s == null) return key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }

  // Localized content field { en, es } -> string (falls back to English)
  function L(obj) {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    var v = obj[state.lang];
    return v ? v : (obj.en || '');
  }

  // True when the current language is missing for this field
  function pending(obj) {
    return state.lang !== 'en' && obj && typeof obj === 'object' && !obj[state.lang];
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function getBook(id) {
    for (var i = 0; i < DATA.books.length; i++) if (DATA.books[i].id === id) return DATA.books[i];
    return null;
  }

  function paragraphs(text) {
    return String(text).split(/\n\s*\n/).map(function (p) { return '<p>' + esc(p.trim()) + '</p>'; }).join('');
  }

  /* ---------- pixel art ---------- */

  // Draw a book's art grid onto a canvas at 1 canvas pixel per art pixel;
  // CSS scales it up with image-rendering: pixelated.
  function drawArt(canvas, art) {
    var rows = art.grid, h = rows.length, w = rows[0].length;
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var p = art.palette[rows[y][x]];
        if (!p) continue;
        ctx.fillStyle = p.color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  function artCanvas(bookId, cls, label) {
    return '<canvas class="pix ' + (cls || '') + '" data-art="' + esc(bookId) + '"' +
      (label ? ' role="img" aria-label="' + esc(label) + '"' : ' aria-hidden="true"') + '></canvas>';
  }

  // Draw every [data-art] / [data-orb] canvas inside root
  function hydrateArt(root) {
    root.querySelectorAll('canvas[data-art]').forEach(function (c) {
      var b = getBook(c.getAttribute('data-art'));
      if (b) drawArt(c, b.art);
    });
    root.querySelectorAll('canvas[data-orb]').forEach(function (c) { drawOrb(c, c.getAttribute('data-orb')); });
  }

  /* ---------- night sky ---------- */

  var ORBS = {
    sun:  { size: 22, r: 7.5, base: '#ffd23f', dark: '#f39c1d', light: '#fff3a8', rays: '#ffb627' },
    moon: { size: 16, r: 7.5, base: '#c9c6bd', dark: '#8f8c86', light: '#efece4',
            spots: [[5, 5], [6, 5], [9, 9], [10, 9], [9, 10], [4, 10], [11, 4]] },
    mars: { size: 16, r: 7.5, base: '#c1440e', dark: '#7e2a0a', light: '#e86a32',
            spots: [[6, 7], [7, 7], [7, 8], [10, 10], [11, 10], [4, 9]], cap: true }
  };

  function drawOrb(canvas, kind) {
    var o = ORBS[kind];
    if (!o) return;
    var n = o.size; canvas.width = n; canvas.height = n;
    var ctx = canvas.getContext('2d');
    var c = (n - 1) / 2;
    var spots = {};
    (o.spots || []).forEach(function (s) { spots[(s[0] + (n - 16) / 2) + ',' + (s[1] + (n - 16) / 2)] = 1; });
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        var dx = x - c, dy = y - c, d = Math.sqrt(dx * dx + dy * dy);
        if (d > o.r) {
          // sun rays: a pixel cross + diagonals just outside the disc
          if (o.rays && d < o.r + 3.2 && (Math.abs(dx) < 1 || Math.abs(dy) < 1 || Math.abs(Math.abs(dx) - Math.abs(dy)) < 1) && (x + y) % 2 === 0) {
            ctx.fillStyle = o.rays; ctx.fillRect(x, y, 1, 1);
          }
          continue;
        }
        var col = o.base;
        if (dx + dy > o.r * 0.55) col = o.dark;
        else if (dx + dy < -o.r * 0.9) col = o.light;
        if (spots[x + ',' + y]) col = o.dark;
        if (o.cap && dy < -o.r + 2.2) col = '#f4f1ea';
        ctx.fillStyle = col; ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // Seeded random so stars stay put when the window resizes
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  function drawStars() {
    var c = document.getElementById('stars');
    if (!c) return;
    var px = 3, w = Math.ceil(window.innerWidth / px), h = Math.ceil(window.innerHeight / px);
    c.width = w; c.height = h;
    var ctx = c.getContext('2d'), r = rng(42);
    var count = Math.round((w * h) / 260);
    for (var i = 0; i < count; i++) {
      var x = Math.floor(r() * w), y = Math.floor(r() * h), b = r();
      ctx.fillStyle = b > 0.92 ? '#ffffff' : b > 0.6 ? '#c9d4ff' : '#5f6fa6';
      ctx.fillRect(x, y, 1, 1);
    }
  }

  function makeTwinkles() {
    var box = document.getElementById('twinkles');
    if (!box || REDUCED) return;
    var r = rng(7), html = '';
    for (var i = 0; i < 14; i++) {
      html += '<span style="left:' + (r() * 100).toFixed(1) + '%;top:' + (r() * 100).toFixed(1) +
        '%;animation-delay:' + (r() * 3).toFixed(2) + 's"></span>';
    }
    box.innerHTML = html;
  }

  /* ---------- language ---------- */

  var LANG_KEY = 'abnf-lang';

  // Saved choice first, then the browser language, then English
  function initialLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) { /* storage blocked: fall through */ }
    var nav = (navigator.language || 'en').toLowerCase();
    return nav.indexOf('es') === 0 ? 'es' : 'en';
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1 || lang === state.lang) return;
    state.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
    applyStatic();
    render();   // views keep their own state (book page, quiz progress…)
  }

  // Translate static markup in index.html
  function applyStatic() {
    document.documentElement.lang = state.lang;
    document.title = t('siteTitle');
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
    document.querySelectorAll('.lang-toggle button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === state.lang));
    });
  }

  /* ---------- router ---------- */

  var cleanups = [];          // functions run before the next render (stop audio, unbind keys…)
  function onLeave(fn) { cleanups.push(fn); }

  function parseRoute() {
    var parts = (location.hash || '').replace(/^#\/?/, '').split('/');
    return { name: parts[0] || 'home', arg: parts[1] || null };
  }

  function render() {
    while (cleanups.length) { try { cleanups.pop()(); } catch (e) { /* ignore */ } }
    var r = parseRoute();
    var view = VIEWS[r.name] || VIEWS.home;
    view(r);
    hydrateArt(app);
    document.querySelectorAll('.mainnav a').forEach(function (a) {
      var on = a.getAttribute('data-route') === (r.name === 'book' ? 'library' : r.name);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------- Home ---------- */

  VIEWS.home = function () {
    app.innerHTML =
      '<section class="hero panel">' +
        '<p class="kicker">' + esc(t('homeKicker')) + '</p>' +
        '<h1>' + esc(t('homeTitle')) + '</h1>' +
        artCanvas('eagle', 'hero-art', L(getBook('eagle').craftName)) +
        '<p class="tagline">' + esc(t('homeTagline')) + '</p>' +
        '<p class="intro">' + esc(t('homeIntro')) + '</p>' +
        '<div class="btn-grid">' +
          '<a class="btn" href="#/library">' + esc(t('homeBtnLibrary')) + '</a>' +
          '<a class="btn" href="#/where">' + esc(t('homeBtnWhere')) + '</a>' +
          '<a class="btn" href="#/map">' + esc(t('homeBtnMap')) + '</a>' +
          '<a class="btn" href="#/mission">' + esc(t('homeBtnMission')) + '</a>' +
        '</div>' +
      '</section>';
  };

  /* ---------- placeholder sections (built in a later step) ---------- */

  function placeholderView(titleKey, introKey) {
    return function () {
      app.innerHTML =
        '<section class="placeholder">' +
          '<h1 class="h1">' + esc(t(titleKey)) + '</h1>' +
          '<p class="lead">' + esc(t(introKey)) + '</p>' +
          '<div class="panel construction"><canvas class="pix" data-orb="moon" style="width:48px;height:48px" aria-hidden="true"></canvas>' +
          '<span class="badge">' + esc(t('comingSoon')) + '</span><span>' + esc(t('underConstruction')) + '</span></div>' +
        '</section>';
    };
  }
  VIEWS.where = placeholderView('whereTitle', 'whereIntro');
  VIEWS.map = placeholderView('mapTitle', 'mapIntro');

  VIEWS.mission = function () {
    app.innerHTML =
      '<section>' +
        '<h1 class="h1">' + esc(t('missionTitle')) + '</h1>' +
        '<div class="panel mission-list">' +
          DATA.mission.sections.map(function (s) {
            return '<div><h2>' + esc(L(s.h)) + '</h2><p>' + esc(L(s.p)) + '</p></div>';
          }).join('') +
        '</div>' +
      '</section>';
  };

  /* ---------- init ---------- */

  function init() {
    state.lang = initialLang();
    applyStatic();
    drawStars();
    makeTwinkles();
    hydrateArt(document.querySelector('.sky'));
    document.querySelectorAll('.lang-toggle button').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
    });
    var resizeTimer;
    window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawStars, 150); });
    window.addEventListener('hashchange', function () { render(); window.scrollTo(0, 0); app.focus({ preventScroll: true }); });
    render();
  }

  init();
})();
