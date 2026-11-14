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

  /* ---------- Library ---------- */

  function coverCard(b) {
    return '<a class="cover-card" href="#/book/' + esc(b.id) + '" style="--cover:' + esc(b.cover) + '">' +
      '<span class="cover-spine" aria-hidden="true"></span>' +
      artCanvas(b.id, 'cover-art') +
      '<span class="cover-title">' + esc(L(b.title)) + '</span>' +
      '<span class="cover-sub">' + esc(L(b.subtitle)) + '</span>' +
      (b.placeholder ? '<span class="badge cover-badge">' + esc(t('comingSoon')) + '</span>' : '') +
    '</a>';
  }

  VIEWS.library = function () {
    var groups = [{ body: 'moon', label: t('moon') }, { body: 'mars', label: t('mars') }];
    app.innerHTML =
      '<section class="library">' +
        '<h1 class="h1">' + esc(t('libraryTitle')) + '</h1>' +
        '<p class="lead">' + esc(t('libraryIntro')) + '</p>' +
        groups.map(function (g) {
          var list = DATA.books.filter(function (b) { return b.body === g.body; });
          return '<div class="shelf-group">' +
            '<h2 class="h2 shelf-label"><canvas class="pix shelf-icon" data-orb="' + g.body + '" aria-hidden="true"></canvas>' + esc(g.label) + '</h2>' +
            '<div class="shelf">' + list.map(coverCard).join('') + '</div>' +
            '<div class="shelf-board" aria-hidden="true"></div>' +
          '</div>';
        }).join('') +
      '</section>';
  };

  /* ---------- Book reader ----------
     Pages: cover -> 5 story pages -> color-by-number -> quiz -> back cover.
     Each page type registers in PAGES with html() and an optional hydrate(). */

  var PAGES = {};
  var reader = { id: null, page: 0, turning: false };
  var currentAudio = null;
  var audioOK = {};   // narration src -> true (exists) / false (missing)

  function bookPages(book) {
    var list = [{ type: 'cover' }];
    book.pages.forEach(function (p, i) { list.push({ type: 'story', i: i }); });
    ['color', 'quiz'].forEach(function (k) { if (PAGES[k]) list.push({ type: k }); });
    list.push({ type: 'back' });
    return list;
  }

  PAGES.cover = {
    cls: 'page-cover',
    html: function (book) {
      return '<div class="cover-inner">' +
        '<p class="cover-kicker">' + esc(t(book.body === 'moon' ? 'coverKickerMoon' : 'coverKickerMars')) + '</p>' +
        '<h1 class="book-title">' + esc(L(book.title)) + '</h1>' +
        artCanvas(book.id, 'book-cover-art', L(book.craftName)) +
        '<p class="book-sub">' + esc(L(book.subtitle)) + '</p>' +
        '<button type="button" class="btn js-next">' + esc(t('openBook')) + ' &#9654;</button>' +
      '</div>';
    }
  };

  PAGES.story = {
    cls: 'page-paper',
    html: function (book, pg) {
      var p = book.pages[pg.i];
      var note = pending(p.text);
      return '<header class="page-head">' +
          '<span class="page-kicker">' + esc(t('part', { n: pg.i + 1 })) + '</span>' +
          '<h2 class="page-title">' + esc(L(p.title)) + '</h2>' +
          '<button type="button" class="btn btn-small btn-audio" hidden aria-pressed="false">' +
            '<span class="audio-icon" aria-hidden="true">&#9654;</span><span class="audio-label">' + esc(t('listen')) + '</span></button>' +
        '</header>' +
        (note ? '<p class="pending-note">' + esc(t('translationPending')) + '</p>' : '') +
        '<div class="story"' + (note ? ' lang="en"' : '') + '>' + paragraphs(L(p.text)) + '</div>' +
        '<footer class="folio">' + (pg.i + 1) + '</footer>';
    },
    hydrate: function (el, book, pg) {
      setupAudio(el, 'audio/' + book.id + '-p' + (pg.i + 1) + '-' + state.lang + '.m4a');
    }
  };

  PAGES.back = {
    cls: 'page-back',
    html: function (book) {
      return '<div class="back-inner">' +
        artCanvas(book.id, 'back-art') +
        '<p class="back-text">' + esc(book.backText ? L(book.backText) : t('backCover')) + '</p>' +
        '<div class="back-actions">' +
          '<button type="button" class="btn js-restart">' + esc(t('readAgain')) + '</button>' +
          '<a class="btn btn-ghost" href="#/library">' + esc(t('backToLibrary')) + '</a>' +
        '</div>' +
      '</div>';
    }
  };

  /* narration: the button stays hidden unless the file is found */

  function stopAudio() {
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  }

  function setupAudio(pageEl, src) {
    var btn = pageEl.querySelector('.btn-audio');
    stopAudio();
    if (!btn || audioOK[src] === false) return;
    var a = new Audio();
    a.preload = 'metadata';
    function show() { audioOK[src] = true; btn.hidden = false; }
    function hide() { audioOK[src] = false; btn.hidden = true; if (currentAudio === a) currentAudio = null; }
    function sync(playing) {
      btn.setAttribute('aria-pressed', String(playing));
      btn.querySelector('.audio-icon').innerHTML = playing ? 'II' : '&#9654;';
      btn.querySelector('.audio-label').textContent = t(playing ? 'pause' : 'listen');
    }
    a.addEventListener('loadedmetadata', show);
    a.addEventListener('error', hide);
    a.addEventListener('play', function () { sync(true); });
    a.addEventListener('pause', function () { sync(false); });
    a.addEventListener('ended', function () { a.currentTime = 0; sync(false); });
    btn.addEventListener('click', function () {
      if (a.paused) { var p = a.play(); if (p && p.catch) p.catch(function () { /* blocked or missing */ }); }
      else a.pause();
    });
    a.src = src;
    currentAudio = a;
    if (audioOK[src]) { show(); return; }
    // Some phones never preload metadata, so also ask the server directly
    if (/^https?:/.test(location.protocol) && window.fetch) {
      fetch(src, { method: 'HEAD' }).then(function (r) { if (r.ok) show(); else hide(); }).catch(function () {});
    }
  }

  /* ---------- Color by number ----------
     Uses the book's pixel art: each palette key is the number on the cell.
     Progress is kept per book while the site is open.                    */

  var cbnState = {};

  // The background color (art.background) starts filled so kids paint the craft, not the sky
  function cbnKeys(book) {
    return Object.keys(book.art.palette).filter(function (k) { return k !== book.art.background; });
  }

  function blankFill(book) {
    return book.art.grid.join('').split('').map(function (k) { return k === book.art.background; });
  }

  function getCbn(book) {
    var s = cbnState[book.id];
    if (!s) s = cbnState[book.id] = { filled: blankFill(book), sel: cbnKeys(book)[0], cell: null };
    return s;
  }

  PAGES.color = {
    cls: 'page-paper page-activity',
    html: function (book) {
      var s = getCbn(book), pal = book.art.palette;
      return '<header class="page-head">' +
          '<span class="page-kicker">' + esc(t('activity')) + '</span>' +
          '<h2 class="page-title">' + esc(t('colorTitle')) + '</h2>' +
        '</header>' +
        '<p class="help">' + esc(t('colorHelp')) + '</p>' +
        '<div class="palette" role="radiogroup" aria-label="' + esc(t('colors')) + '">' +
          cbnKeys(book).map(function (k) {
            return '<button type="button" class="swatch" role="radio" aria-checked="' + (s.sel === k) + '" data-k="' + esc(k) + '" style="--sw:' + esc(pal[k].color) + '">' +
              '<span class="sw-chip">' + esc(k) + '</span><span class="sw-name">' + esc(L(pal[k].name)) + '</span></button>';
          }).join('') +
        '</div>' +
        '<div class="cbn-tools">' +
          '<button type="button" class="btn btn-small btn-ghost cbn-zoom" data-z="-1" aria-label="' + esc(t('zoomOut')) + '">&minus;</button>' +
          '<button type="button" class="btn btn-small btn-ghost cbn-zoom" data-z="1" aria-label="' + esc(t('zoomIn')) + '">+</button>' +
          '<span class="cbn-left" aria-live="polite"></span>' +
          '<button type="button" class="btn btn-small btn-ghost cbn-reset">' + esc(t('reset')) + '</button>' +
        '</div>' +
        '<div class="cbn-scroll"><div class="cbn-grid" style="--cols:' + book.art.grid[0].length + '"></div></div>' +
        '<p class="cbn-done" role="status" hidden></p>';
    },
    hydrate: function (el, book) {
      var s = getCbn(book), art = book.art, rows = art.grid, w = rows[0].length;
      var grid = el.querySelector('.cbn-grid'), scroll = el.querySelector('.cbn-scroll');
      var leftEl = el.querySelector('.cbn-left'), doneEl = el.querySelector('.cbn-done');
      var MIN = 12, MAX = 56;

      // build the cells
      var frag = document.createDocumentFragment();
      for (var y = 0; y < rows.length; y++) {
        for (var x = 0; x < w; x++) {
          var i = y * w + x, k = rows[y][x], c = document.createElement('div');
          c.className = 'cell';
          c.setAttribute('data-i', i);
          c.setAttribute('data-k', k);
          c.textContent = k;
          frag.appendChild(c);
        }
      }
      grid.appendChild(frag);
      var cells = grid.children;

      function paint(i) {
        var c = cells[i];
        c.classList.add('filled');
        c.style.background = art.palette[c.getAttribute('data-k')].color;
      }
      function highlight() {
        for (var j = 0; j < cells.length; j++) {
          cells[j].classList.toggle('hl', cells[j].getAttribute('data-k') === s.sel && !s.filled[j]);
        }
      }
      function progress() {
        var left = s.filled.filter(function (f) { return !f; }).length;
        leftEl.textContent = t('squaresLeft', { n: left });
        doneEl.hidden = left > 0;
        el.classList.toggle('cbn-complete', left === 0);
        if (left === 0) doneEl.textContent = t('colorDone', { name: L(book.craftName) });
      }
      function setCell(px) {
        s.cell = Math.max(MIN, Math.min(MAX, Math.round(px)));
        grid.style.setProperty('--cell', s.cell + 'px');
      }

      s.filled.forEach(function (f, i) { if (f) paint(i); });
      // fit the width, leaving room for padding, borders and a scrollbar
      if (!s.cell) setCell(scroll.clientWidth ? Math.min(34, (scroll.clientWidth - 28) / w) : 20);
      else setCell(s.cell);
      highlight();
      progress();

      // pick a color
      el.querySelector('.palette').addEventListener('click', function (e) {
        var b = e.target.closest('.swatch');
        if (!b) return;
        s.sel = b.getAttribute('data-k');
        el.querySelectorAll('.swatch').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        highlight();
      });

      function tryFill(c, shake) {
        var i = +c.getAttribute('data-i');
        if (s.filled[i]) return;
        if (c.getAttribute('data-k') === s.sel) {
          s.filled[i] = true;
          paint(i);
          c.classList.remove('hl');
          progress();
        } else if (shake) {
          c.classList.remove('nope');
          void c.offsetWidth; // restart the shake
          c.classList.add('nope');
        }
      }

      // tap a cell (touch, pen, keyboard-less mouse click)
      grid.addEventListener('click', function (e) {
        var c = e.target.closest('.cell');
        if (c) tryFill(c, true);
      });

      // with a mouse, click and drag to paint many cells (wrong cells are skipped)
      var dragging = false;
      grid.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse' && e.button === 0) dragging = true; });
      grid.addEventListener('pointerover', function (e) {
        if (!dragging) return;
        var c = e.target.closest('.cell');
        if (c) tryFill(c, false);
      });
      function stopDrag() { dragging = false; }
      window.addEventListener('pointerup', stopDrag);
      onLeave(function () { window.removeEventListener('pointerup', stopDrag); });

      el.querySelectorAll('.cbn-zoom').forEach(function (b) {
        b.addEventListener('click', function () { setCell(s.cell + 6 * +b.getAttribute('data-z')); });
      });

      el.querySelector('.cbn-reset').addEventListener('click', function () {
        s.filled = blankFill(book);
        for (var j = 0; j < cells.length; j++) {
          cells[j].classList.remove('filled'); cells[j].style.background = '';
          if (s.filled[j]) paint(j);
        }
        highlight();
        progress();
      });

      // pinch to zoom (two fingers); one finger scrolls and taps
      var pinch = null;
      scroll.addEventListener('touchstart', function (e) {
        if (e.touches.length === 2) {
          pinch = { d: dist(e.touches), cell: s.cell };
        }
      }, { passive: true });
      scroll.addEventListener('touchmove', function (e) {
        if (pinch && e.touches.length === 2) {
          e.preventDefault();
          setCell(pinch.cell * dist(e.touches) / pinch.d);
        }
      }, { passive: false });
      scroll.addEventListener('touchend', function (e) { if (e.touches.length < 2) pinch = null; }, { passive: true });
      // ctrl + wheel / trackpad pinch on desktop
      scroll.addEventListener('wheel', function (e) {
        if (!e.ctrlKey) return;
        e.preventDefault();
        setCell(s.cell * (e.deltaY < 0 ? 1.1 : 0.9));
      }, { passive: false });

      function dist(tl) {
        var dx = tl[0].clientX - tl[1].clientX, dy = tl[0].clientY - tl[1].clientY;
        return Math.sqrt(dx * dx + dy * dy) || 1;
      }
    }
  };

  /* page rendering and turning */

  function renderPageInto(el, book) {
    var pg = bookPages(book)[reader.page];
    var def = PAGES[pg.type];
    el.className = 'page ' + (def.cls || '');
    el.setAttribute('data-type', pg.type);
    el.style.setProperty('--cover', book.cover);
    el.innerHTML = def.html(book, pg);
    hydrateArt(el);
    if (def.hydrate) def.hydrate(el, book, pg);
  }

  function updateNav(book) {
    var total = bookPages(book).length, i = reader.page, dots = '';
    for (var k = 0; k < total; k++) dots += '<span class="dot' + (k === i ? ' on' : '') + '"></span>';
    app.querySelector('.js-prev').disabled = i === 0;
    app.querySelector('.js-nextnav').disabled = i === total - 1;
    app.querySelector('.page-count').textContent = t('pageOf', { n: i + 1, t: total });
    app.querySelector('.page-dots').innerHTML = dots;
  }

  function afterAnim(el, fn) {
    var fired = false;
    function go() {
      if (fired) return;
      fired = true;
      if (el.isConnected) fn();
      reader.turning = false;
    }
    el.addEventListener('animationend', go, { once: true });
    setTimeout(go, 900);
  }

  function goTo(n) {
    var book = getBook(reader.id);
    var total = bookPages(book).length;
    if (n < 0 || n >= total || n === reader.page || reader.turning) return;
    var forward = n > reader.page;
    var stage = app.querySelector('.book-stage');
    var base = document.getElementById('page-base');
    stopAudio();

    if (REDUCED) {
      reader.page = n; renderPageInto(base, book); updateNav(book);
      return;
    }
    reader.turning = true;
    var ov;
    if (forward) {
      // the old page lifts off the stack and turns over to the left
      ov = base.cloneNode(true);
      ov.removeAttribute('id');
      stage.appendChild(ov);
      hydrateArt(ov);
      ov.classList.add('page-overlay', 'flip-out');
      reader.page = n;
      renderPageInto(base, book);
      afterAnim(ov, function () { ov.remove(); });
    } else {
      // the previous page turns back over from the left
      ov = document.createElement('article');
      stage.appendChild(ov);
      reader.page = n;
      renderPageInto(ov, book);
      ov.classList.add('page-overlay', 'flip-in');
      afterAnim(ov, function () { renderPageInto(base, book); ov.remove(); });
    }
    updateNav(book);
  }

  function turn(dir) { goTo(reader.page + dir); }

  VIEWS.book = function (r) {
    var book = getBook(r.arg);
    if (!book) { location.replace('#/library'); return; }
    if (reader.id !== book.id) { reader.id = book.id; reader.page = 0; }
    reader.turning = false;

    app.innerHTML =
      '<section class="reader" aria-label="' + esc(L(book.title)) + '">' +
        '<div class="reader-top">' +
          '<a class="btn btn-small btn-ghost" href="#/library">&#9664; ' + esc(t('backToLibrary')) + '</a>' +
          '<span class="page-count" aria-live="polite"></span>' +
        '</div>' +
        '<div class="book-stage"><article class="page" id="page-base"></article></div>' +
        '<div class="reader-nav">' +
          '<button type="button" class="btn js-prev">&#9664; ' + esc(t('prev')) + '</button>' +
          '<div class="page-dots" aria-hidden="true"></div>' +
          '<button type="button" class="btn js-nextnav">' + esc(t('next')) + ' &#9654;</button>' +
        '</div>' +
        '<p class="reader-hint">' + esc(t('readerHint')) + '</p>' +
      '</section>';

    var stage = app.querySelector('.book-stage');
    renderPageInto(document.getElementById('page-base'), book);
    updateNav(book);

    app.querySelector('.js-prev').addEventListener('click', function () { turn(-1); });
    app.querySelector('.js-nextnav').addEventListener('click', function () { turn(1); });
    stage.addEventListener('click', function (e) {
      if (e.target.closest('.js-next')) turn(1);
      else if (e.target.closest('.js-restart')) goTo(0);
    });

    function onKey(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
    }
    document.addEventListener('keydown', onKey);

    // swipe to turn (ignored on the coloring grid and during pinch)
    var sx = null, sy = null, multi = false;
    stage.addEventListener('touchstart', function (e) {
      if (e.touches.length > 1) { multi = true; sx = null; return; }
      if (e.target.closest('.cbn-scroll')) { sx = null; return; }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (e.touches.length === 0 && multi) { multi = false; sx = null; return; }
      if (sx == null) return;
      var p = e.changedTouches[0], dx = p.clientX - sx, dy = p.clientY - sy;
      sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) turn(dx < 0 ? 1 : -1);
    }, { passive: true });

    onLeave(function () { document.removeEventListener('keydown', onKey); stopAudio(); });
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
