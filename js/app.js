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
  // Recording mode (open the site with ?record, e.g. .../?record#/home): a lighter
  // page for screen recording on slower laptops. No scanlines, sky effects on
  // their own layers, sprites stop blinking, no ambient sound. Looks the same.
  var RECORD = /[?&]record\b/.test(location.search);
  if (RECORD) document.documentElement.classList.add('rec-mode');

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

  // Draw every [data-art] / [data-orb] canvas inside root.
  // Detailed 64px sprites (js/sprites.js) are used when available;
  // the simple grid in books.js is the fallback (and the coloring page).
  var SPRITES = window.ABNF_SPRITES;
  var frame = 0;

  function spriteId(c) {
    var orb = c.getAttribute('data-orb');
    return orb ? 'orb:' + orb : c.getAttribute('data-art');
  }

  function drawCanvas(c) {
    var id = spriteId(c);
    if (SPRITES && SPRITES.has(id)) { SPRITES.draw(c, id, frame, c.getAttribute('data-variant') || ''); return; }
    if (c.hasAttribute('data-orb')) { drawOrb(c, c.getAttribute('data-orb')); return; }
    var b = getBook(id);
    if (b) drawArt(c, b.art);
  }

  function hydrateArt(root) {
    root.querySelectorAll('canvas[data-art], canvas[data-orb]').forEach(drawCanvas);
  }

  // idle animation: blinking beacons, twinkling stars, the GRAIL link
  function startAnimation() {
    if (REDUCED || !SPRITES || RECORD) return;
    setInterval(function () {
      if (document.hidden) return;
      frame = (frame + 1) % SPRITES.FRAMES;
      document.querySelectorAll('canvas[data-art], canvas[data-orb]').forEach(drawCanvas);
    }, 450);
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

  // an occasional shooting star
  function startMeteors() {
    var box = document.getElementById('meteors');
    if (!box || REDUCED) return;
    (function next() {
      setTimeout(function () {
        if (!document.hidden) {
          var m = document.createElement('span');
          m.style.left = (20 + Math.random() * 70) + '%';
          m.style.top = (Math.random() * 35) + '%';
          box.appendChild(m);
          setTimeout(function () { m.remove(); }, 1400);
        }
        next();
      }, 5000 + Math.random() * 7000);
    })();
  }

  /* ---------- language ---------- */

  var LANG_KEY = 'abnf-lang';

  // Always opens in English for first-time visitors (the site is judged in
  // English); a visitor who picks ES keeps it on their device after that.
  function initialLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) { /* storage blocked: fall through */ }
    return 'en';
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
    soundButton();
  }

  /* ---------- router ---------- */

  var cleanups = [];          // functions run before the next render (stop audio, unbind keys…)
  function onLeave(fn) { cleanups.push(fn); }

  function parseRoute() {
    var parts = (location.hash || '').replace(/^#\/?/, '').split('/');
    return { name: parts[0] || 'home', arg: parts[1] || null };
  }

  function render(animate) {
    while (cleanups.length) { try { cleanups.pop()(); } catch (e) { /* ignore */ } }
    var r = parseRoute();
    var view = VIEWS[r.name] || VIEWS.home;
    view(r);
    hydrateArt(app);
    // entrance animation on navigation (not on a language switch)
    app.classList.remove('view-in');
    if (animate && !REDUCED) { void app.offsetWidth; app.classList.add('view-in'); }
    document.querySelectorAll('.mainnav a').forEach(function (a) {
      var on = a.getAttribute('data-route') === (r.name === 'book' ? 'library' : r.name);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------- Home ---------- */

  VIEWS.home = function () {
    app.innerHTML =
      '<section class="hero">' +
        '<div class="hero-text">' +
          '<p class="kicker">' + esc(t('homeKicker')) + '</p>' +
          '<h1>' + esc(t('homeTitle')) + '</h1>' +
          '<p class="tagline">' + esc(t('homeTagline')) + '</p>' +
          '<p class="intro">' + esc(t('homeIntro')) + '</p>' +
          '<div class="hero-cta">' +
            '<a class="btn btn-big" href="#/library">' + esc(t('homeBtnLibrary')) + ' &#9654;</a>' +
          '</div>' +
        '</div>' +
        '<figure class="feed">' +
          '<div class="feed-bar"><span class="rec" aria-hidden="true"></span>' + esc(t('feedLive')) + '<span class="feed-coord">0.67&deg;N 23.47&deg;E</span></div>' +
          artCanvas('eagle', 'feed-art', L(getBook('eagle').craftName)) +
          '<figcaption>' + esc(t('heroCaption')) + '</figcaption>' +
        '</figure>' +
      '</section>' +
      '<ul class="stats">' +
        '<li><b>4</b>' + esc(t('statBooks')) + '</li>' +
        '<li><b>2</b>' + esc(t('statWorlds')) + '</li>' +
        '<li><b>EN/ES</b>' + esc(t('statLangs')) + '</li>' +
      '</ul>' +
      '<nav class="tiles" aria-label="' + esc(t('homeExplore')) + '">' +
        tile('#/library', 'eagle', 'homeBtnLibrary', 'tileLibrary') +
        tile('#/where', 'opportunity', 'homeBtnWhere', 'tileWhere') +
        tile('#/map', 'viking1', 'homeBtnMap', 'tileMap') +
        tile('#/mission', 'grail', 'homeBtnMission', 'tileMission') +
      '</nav>';
  };

  function tile(href, art, titleKey, textKey) {
    return '<a class="tile" href="' + href + '">' + artCanvas(art, 'tile-art') +
      '<span class="tile-title">' + esc(t(titleKey)) + '</span>' +
      '<span class="tile-text">' + esc(t(textKey)) + '</span></a>';
  };

  /* ---------- Library ---------- */

  function coverCard(b) {
    return '<a class="cover-card" href="#/book/' + esc(b.id) + '" style="--cover:' + esc(b.cover) + '">' +
      '<span class="cover-spine" aria-hidden="true"></span>' +
      artCanvas(b.id, 'cover-art') +
      '<span class="cover-title">' + esc(L(b.title)) + '</span>' +
      '<span class="cover-sub">' + esc(L(b.subtitle)) + '</span>' +
      (b.placeholder ? '<span class="badge cover-badge">' + esc(t('comingSoon')) + '</span>' : '') +
      '<span class="cover-shine" aria-hidden="true"></span>' +
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

  // cover, contents, 5 story pages, coloring, quiz, back cover (10 = 5 sheets of paper)
  function bookPages(book) {
    var list = [{ type: 'cover' }, { type: 'contents' }];
    book.pages.forEach(function (p, i) { list.push({ type: 'story', i: i }); });
    ['color', 'quiz'].forEach(function (k) { if (PAGES[k]) list.push({ type: k }); });
    list.push({ type: 'back' });
    list.forEach(function (pg, n) { pg.n = n; });
    return list;
  }

  PAGES.contents = {
    cls: 'page-paper page-contents',
    html: function (book) {
      var rows = bookPages(book).map(function (pg) {
        var label = pg.type === 'story' ? t('part', { n: pg.i + 1 }) + ': ' + L(book.pages[pg.i].title)
          : pg.type === 'color' ? t('colorTitle')
          : pg.type === 'quiz' ? t('quizTitle') : null;
        if (!label) return '';
        return '<li><button type="button" class="toc-link js-goto" data-n="' + pg.n + '">' +
          '<span class="toc-label">' + esc(label) + '</span><span class="toc-dots" aria-hidden="true"></span>' +
          '<span class="toc-n">' + (pg.n + 1) + '</span></button></li>';
      }).join('');
      return '<div class="contents-inner">' +
        artCanvas(book.id, 'contents-art') +
        '<p class="page-kicker">' + esc(t('contents')) + '</p>' +
        '<h2 class="page-title">' + esc(L(book.title)) + '</h2>' +
        '<p class="contents-sub">' + esc(L(book.subtitle)) + '</p>' +
        '<ol class="toc">' + rows + '</ol>' +
      '</div>';
    }
  };

  PAGES.cover = {
    cls: 'page-cover',
    html: function (book) {
      return '<div class="cover-inner">' +
        '<p class="cover-kicker">' + esc(t(book.body === 'moon' ? 'coverKickerMoon' : 'coverKickerMars')) + '</p>' +
        '<h1 class="book-title">' + esc(L(book.title)) + '</h1>' +
        artCanvas(book.id, 'book-cover-art', L(book.craftName)) +
        '<p class="book-sub">' + esc(L(book.subtitle)) + '</p>' +
        '<div class="cover-actions">' +
          '<button type="button" class="btn js-next">' + esc(t('openBook')) + ' &#9654;</button>' +
          '<button type="button" class="btn btn-ghost js-listen"' + (bookHasAudio(book) ? '' : ' hidden') + '>' + esc(t('listenBook')) + '</button>' +
        '</div>' +
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
          '<span class="np" data-part="' + pg.i + '" hidden><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>' + esc(t('nowPlaying')) + '</span>' +
        '</header>' +
        (note ? '<p class="pending-note">' + esc(t('translationPending')) + '</p>' : '') +
        '<div class="story"' + (note ? ' lang="en"' : '') + '>' + paragraphs(L(p.text)) + '</div>' +
        '<footer class="folio">' + (pg.n + 1) + '</footer>';
    },
    hydrate: function () { abUpdate(); }
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

  /* ---------- Audiobook ----------
     Narration files: audio/{bookid}-p{1-5}-{en|es}.m4a
     One <audio> element is reused for every part: phones only let audio
     keep playing on its own after the first tap if it is the same element.
     The player follows the book: when a part ends, the next one starts,
     turning the page when needed (two-page spreads read left, then right).
     The player bar only appears when narration exists for the book.     */

  var AUDIO_EXT = 'm4a';
  var audioFound = {};             // "eagle-p1-en" -> src, or false when missing
  var narrator = null;
  var ab = { playing: false, auto: true, rate: 1, part: -1, want: -1, token: 0, msg: '' };
  var RATES = [1, 1.25, 0.75];

  function audioKey(book, i) { return book.id + '-p' + (i + 1) + '-' + state.lang; }
  function partPage(i) { return i + 2; }            // cover and contents come first

  function bookHasAudio(book) {
    return book.pages.some(function (p, i) { return !!audioFound[audioKey(book, i)]; });
  }

  function probe(src) {
    return new Promise(function (resolve) {
      if (/^https?:/.test(location.protocol) && window.fetch) {
        fetch(src, { method: 'HEAD', cache: 'no-cache' })
          .then(function (r) { resolve(r.ok); })
          .catch(function () { resolve(false); });
        return;
      }
      // opened straight from disk: ask an <audio> element instead
      var a = new Audio(), done = false;
      function fin(ok) { if (!done) { done = true; resolve(ok); } }
      a.preload = 'metadata';
      a.addEventListener('loadedmetadata', function () { fin(true); });
      a.addEventListener('error', function () { fin(false); });
      setTimeout(function () { fin(false); }, 4000);
      a.src = src;
    });
  }

  function probeBook(book) {
    return Promise.all(book.pages.map(function (p, i) {
      var key = audioKey(book, i);
      if (key in audioFound) return audioFound[key];
      var src = 'audio/' + key + '.' + AUDIO_EXT;
      return probe(src).then(function (ok) { return (audioFound[key] = ok ? src : false); });
    }));
  }

  function getNarrator() {
    if (narrator) return narrator;
    narrator = new Audio();
    narrator.preload = 'auto';
    ['timeupdate', 'loadedmetadata', 'play', 'pause'].forEach(function (ev) { narrator.addEventListener(ev, abUpdate); });
    narrator.addEventListener('ended', abEnded);
    narrator.addEventListener('error', function () { if (narrator.getAttribute('src') && ab.playing) abEnded(); });
    return narrator;
  }

  // which page numbers / story parts are on screen right now
  function visiblePages() {
    if (isSpread()) { var k = spreadK(); return [2 * k - 1, 2 * k]; }
    return [reader.page];
  }
  function visibleParts() {
    var book = getBook(reader.id), list = bookPages(book);
    return visiblePages().map(function (n) { return list[n]; })
      .filter(function (pg) { return pg && pg.type === 'story'; })
      .map(function (pg) { return pg.i; });
  }
  function partVisible(i) { return visiblePages().indexOf(partPage(i)) !== -1; }

  function stopAudio() {
    if (narrator) narrator.pause();
    ab.playing = false; ab.part = -1; ab.want = -1; ab.msg = '';
    clearTimeout(syncTimer);
    ambientRefresh();
  }

  // play part i, turning to its page first if it isn't on screen
  function playPart(i) {
    ab.playing = true; ab.msg = '';
    if (partVisible(i)) { ab.want = -1; startPart(getBook(reader.id), i); }
    else { ab.want = i; abUpdate(); goTo(partPage(i)); }   // abSync starts it after the turn
  }

  function abPlay() {
    var book = getBook(reader.id);
    if (!book) return;
    var n = getNarrator();
    if (ab.part >= 0 && n.getAttribute('src') && !n.ended && partVisible(ab.part)) {   // resume
      ab.playing = true; ab.msg = '';
      var p = n.play(); if (p && p.catch) p.catch(function () { ab.playing = false; abUpdate(); });
      return;
    }
    var vis = visibleParts();
    playPart(vis.length ? vis[0] : 0);
  }

  function abPause() { ab.playing = false; if (narrator) narrator.pause(); abUpdate(); }

  function startPart(book, i) {
    var n = getNarrator(), token = ++ab.token, key = audioKey(book, i);
    ab.part = i; ab.msg = '';
    n.pause();
    function go(src) {
      if (token !== ab.token || !ab.playing) return;
      if (!src) {
        ab.msg = t('noNarration');
        abUpdate();
        if (ab.auto) setTimeout(function () { if (token === ab.token && ab.playing) abEnded(); }, 1600);
        else { ab.playing = false; abUpdate(); }
        return;
      }
      n.src = src;
      n.defaultPlaybackRate = n.playbackRate = ab.rate;
      var p = n.play();
      if (p && p.catch) p.catch(function () { if (token === ab.token) { ab.playing = false; abUpdate(); } });
      mediaSession(book, i);
      abUpdate();
    }
    // start right away when the file is already known (keeps the user's tap valid on phones)
    if (key in audioFound) go(audioFound[key]);
    else probeBook(book).then(function () { go(audioFound[key]); });
  }

  function abEnded() {
    var book = getBook(reader.id);
    if (!book || !ab.playing) return;
    var next = ab.part + 1;
    if (ab.auto && next < book.pages.length) { playPart(next); return; }
    ab.playing = false;
    if (next >= book.pages.length) { ab.part = -1; ab.msg = t('abEnd'); }
    abUpdate();
  }

  function abStep(dir) {
    var book = getBook(reader.id);
    if (!book) return;
    if (dir < 0 && narrator && ab.part >= 0 && narrator.currentTime > 3) { narrator.currentTime = 0; return; }
    var vis = visibleParts(), from = ab.part >= 0 ? ab.part : (vis.length ? vis[0] : -1);
    var target = Math.max(0, Math.min(book.pages.length - 1, from + dir));
    if (ab.playing) playPart(target);
    else { ab.part = -1; goTo(partPage(target)); }
  }

  // after any page change, keep the narration and the pages in step
  var syncTimer = 0;
  function abSoon() { clearTimeout(syncTimer); syncTimer = setTimeout(abSync, 90); }
  function abSync() {
    if (!reader.id) return;
    if (reader.turning) { abSoon(); return; }
    if (ab.playing) {
      if (ab.want >= 0) {
        if (partVisible(ab.want)) { var w = ab.want; ab.want = -1; startPart(getBook(reader.id), w); }
      } else if (ab.part >= 0 && !partVisible(ab.part)) {
        // the reader turned pages by hand: read what's on screen now
        var vis = visibleParts();
        if (vis.length) startPart(getBook(reader.id), vis[0]);
        else { abPause(); ab.part = -1; }
      }
    }
    abUpdate();
  }

  function fmt(s) {
    if (!isFinite(s)) s = 0;
    s = Math.floor(s);
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  var ICONS = {
    play: '<svg viewBox="0 0 8 8" aria-hidden="true"><path d="M2 1h1v1h1v1h1v1h1v0H5v1H4v1H3v1H2z"/></svg>',
    pause: '<svg viewBox="0 0 8 8" aria-hidden="true"><path d="M2 1h1v6H2zM5 1h1v6H5z"/></svg>',
    prev: '<svg viewBox="0 0 8 8" aria-hidden="true"><path d="M1 1h1v6H1zM6 1h1v6H6V6H5V5H4V4H3V3h1V2h1V1h1z"/></svg>',
    next: '<svg viewBox="0 0 8 8" aria-hidden="true"><path d="M6 1h1v6H6zM1 1h1v1h1v1h1v1h1v0H4v1H3v1H2v1H1z"/></svg>'
  };

  function abBarHTML() {
    return '<div class="ab" hidden>' +
      '<button type="button" class="ab-play" aria-pressed="false"></button>' +
      '<div class="ab-mid">' +
        '<div class="ab-title"><span class="ab-kicker">' + esc(t('audiobook')) + '</span><span class="ab-part"></span></div>' +
        '<div class="ab-track">' +
          '<input type="range" class="ab-seek" min="0" max="1000" value="0" aria-label="' + esc(t('abSeek')) + '">' +
          '<span class="ab-time">0:00 / 0:00</span>' +
        '</div>' +
      '</div>' +
      '<div class="ab-btns">' +
        '<button type="button" class="ab-btn ab-prev" aria-label="' + esc(t('abPrev')) + '" title="' + esc(t('abPrev')) + '">' + ICONS.prev + '</button>' +
        '<button type="button" class="ab-btn ab-next" aria-label="' + esc(t('abNext')) + '" title="' + esc(t('abNext')) + '">' + ICONS.next + '</button>' +
        '<button type="button" class="ab-btn ab-rate" title="' + esc(t('abSpeed')) + '"></button>' +
        '<button type="button" class="ab-btn ab-auto" aria-pressed="true">' + esc(t('abAuto')) + '</button>' +
      '</div>' +
      '<p class="ab-msg" role="status" hidden></p>' +
    '</div>';
  }

  // refresh the bar and the "now playing" marks on the pages
  function abUpdate() {
    ambientRefresh();   // fade the ambient sound out / back in with the narration
    var bar = app.querySelector('.ab'), book = getBook(reader.id);
    if (!bar || !book) return;
    var n = narrator, sounding = ab.playing && n && !n.paused;
    var vis = visibleParts(), shown = ab.part >= 0 ? ab.part : (ab.want >= 0 ? ab.want : (vis.length ? vis[0] : 0));
    var play = bar.querySelector('.ab-play');
    play.innerHTML = (ab.playing ? ICONS.pause : ICONS.play) +
      '<span class="ab-play-label">' + esc(t(ab.playing ? 'pause' : (ab.part >= 0 ? 'abResume' : 'abPlay'))) + '</span>';
    play.setAttribute('aria-pressed', String(ab.playing));
    bar.classList.toggle('is-playing', !!sounding);
    bar.querySelector('.ab-part').textContent = t('abPartOf', { n: shown + 1, t: book.pages.length }) + ' · ' + L(book.pages[shown].title);
    var dur = n && ab.part >= 0 ? n.duration : 0, cur = n && ab.part >= 0 ? n.currentTime : 0;
    var seek = bar.querySelector('.ab-seek');
    if (!seek.matches(':active')) seek.value = dur ? Math.round(cur / dur * 1000) : 0;
    seek.disabled = !dur;
    seek.style.setProperty('--pct', (dur ? cur / dur * 100 : 0) + '%');
    bar.querySelector('.ab-time').textContent = fmt(cur) + ' / ' + fmt(dur);
    bar.querySelector('.ab-rate').innerHTML = String(ab.rate).replace('.', state.lang === 'es' ? ',' : '.') + '&times;';
    var auto = bar.querySelector('.ab-auto');
    auto.setAttribute('aria-pressed', String(ab.auto));
    auto.innerHTML = '<span class="sw" aria-hidden="true"><span class="sw-knob"></span></span>' +
      '<span>' + esc(t('abAuto')) + ': ' + esc(t(ab.auto ? 'on' : 'off')) + '</span>';
    var msg = bar.querySelector('.ab-msg');
    msg.textContent = ab.msg; msg.hidden = !ab.msg;
    app.querySelectorAll('.np').forEach(function (el) { el.hidden = !(sounding && +el.getAttribute('data-part') === ab.part); });
  }

  function initAudiobook(book) {
    var bar = app.querySelector('.ab');
    bar.querySelector('.ab-play').addEventListener('click', function () { if (ab.playing) abPause(); else abPlay(); });
    bar.querySelector('.ab-prev').addEventListener('click', function () { abStep(-1); });
    bar.querySelector('.ab-next').addEventListener('click', function () { abStep(1); });
    bar.querySelector('.ab-rate').addEventListener('click', function () {
      ab.rate = RATES[(RATES.indexOf(ab.rate) + 1) % RATES.length];
      if (narrator) narrator.defaultPlaybackRate = narrator.playbackRate = ab.rate;
      abUpdate();
    });
    var tipTimer = 0;
    bar.querySelector('.ab-auto').addEventListener('click', function () {
      ab.auto = !ab.auto;
      // say what the switch does, then clear the message
      ab.msg = t(ab.auto ? 'abAutoOnTip' : 'abAutoOffTip');
      clearTimeout(tipTimer);
      tipTimer = setTimeout(function () { if (ab.msg === t('abAutoOnTip') || ab.msg === t('abAutoOffTip')) { ab.msg = ''; abUpdate(); } }, 3500);
      // a part finished while it was off: carry on to the next one now
      var bk = getBook(reader.id);
      if (ab.auto && !ab.playing && narrator && narrator.ended && ab.part >= 0 && ab.part < bk.pages.length - 1) playPart(ab.part + 1);
      abUpdate();
    });
    bar.querySelector('.ab-seek').addEventListener('input', function (e) {
      if (narrator && narrator.duration) narrator.currentTime = e.target.value / 1000 * narrator.duration;
    });
    abUpdate();
    var lang = state.lang;
    probeBook(book).then(function (found) {
      if (lang !== state.lang || !bar.isConnected) return;
      var any = found.some(Boolean);
      bar.hidden = !any;
      app.querySelectorAll('.js-listen').forEach(function (b) { b.hidden = !any; });
      abUpdate();
    });
  }

  // lock-screen and headphone controls on phones
  function mediaSession(book, i) {
    if (!('mediaSession' in navigator) || !window.MediaMetadata) return;
    try {
      var art = [];
      if (SPRITES && SPRITES.has(book.id)) {
        var c = document.createElement('canvas');
        SPRITES.draw(c, book.id, 0);
        art.push({ src: c.toDataURL('image/png'), sizes: c.width + 'x' + c.height, type: 'image/png' });
      }
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t('abPartOf', { n: i + 1, t: book.pages.length }) + ': ' + L(book.pages[i].title),
        artist: t('siteTitle'),
        album: L(book.title),
        artwork: art
      });
      navigator.mediaSession.setActionHandler('play', abPlay);
      navigator.mediaSession.setActionHandler('pause', abPause);
      navigator.mediaSession.setActionHandler('previoustrack', function () { abStep(-1); });
      navigator.mediaSession.setActionHandler('nexttrack', function () { abStep(1); });
    } catch (e) { /* not supported */ }
  }

  /* ---------- Color by number ----------
     Built from the book's detailed 64x64 drawing (js/sprites.js): the sky,
     ground and black outlines come pre-colored, and every spacecraft pixel
     becomes a numbered square. It is drawn on a canvas you can paint, pan
     and zoom freely with fingers, mouse, wheel or trackpad. When finished,
     the full-detail drawing is revealed. Falls back to the simple grid in
     books.js if the sprites are not available.                           */

  var cbnState = {};
  var cbnCache = {};

  function cbnData(book) {
    if (cbnCache[book.id]) return cbnCache[book.id];
    var d = { w: 0, h: 0, fixed: [], key: [], reveal: [], keys: [], color: {}, name: {} };
    var src = SPRITES && SPRITES.coloring ? SPRITES.coloring(book.id) : null;
    if (src) {
      d.w = src.w; d.h = src.h;
      var famOf = {}, used = {}, fams = [];
      DATA.colorFamilies.forEach(function (fam, fi) { fam.match.forEach(function (n) { famOf[n] = fi; }); });
      for (var i = 0; i < src.px.length; i++) {
        var hex = src.px[i] || '#000000';
        var fi = src.craft[i] ? famOf[src.nameOf(hex)] : undefined;
        d.reveal.push(hex);
        if (fi === undefined) { d.fixed.push(hex); fams.push(null); }
        else { d.fixed.push(null); fams.push(fi); used[fi] = true; }
      }
      // number the crayons 1..n in the order of DATA.colorFamilies
      var n = 0, num = {};
      DATA.colorFamilies.forEach(function (fam, fi) {
        if (!used[fi]) return;
        var k = String(++n);
        num[fi] = k; d.keys.push(k); d.color[k] = fam.color; d.name[k] = fam.name;
      });
      d.key = fams.map(function (fi) { return fi === null ? null : num[fi]; });
    } else {
      var art = book.art, rows = art.grid;
      d.w = rows[0].length; d.h = rows.length;
      rows.join('').split('').forEach(function (k) {
        var c = art.palette[k].color;
        d.reveal.push(c);
        if (k === art.background) { d.fixed.push(c); d.key.push(null); }
        else { d.fixed.push(null); d.key.push(k); }
      });
      Object.keys(art.palette).forEach(function (k) {
        if (k === art.background) return;
        d.keys.push(k); d.color[k] = art.palette[k].color; d.name[k] = art.palette[k].name;
      });
    }
    // squares not painted yet show the finished drawing in light grays (like a
    // black-and-white photo), so the spacecraft's shape and shading are visible
    // from the start and the numbers stay readable on top
    d.gray = d.reveal.map(function (hex) {
      var n = parseInt(String(hex).slice(1), 16) || 0;
      var lum = ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11);
      var g = Math.round(150 + lum * 0.4);
      return 'rgb(' + g + ',' + g + ',' + g + ')';
    });
    return (cbnCache[book.id] = d);
  }

  // see-through wash of a crayon color, laid over the gray squares that match it
  function tint(hex) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (r * 0.3 + g * 0.59 + b * 0.11 > 215) return 'rgba(95,168,255,.4)';   // white crayon: a cool blue hint instead
    return 'rgba(' + r + ',' + g + ',' + b + ',.45)';
  }

  function getCbn(book) {
    var d = cbnData(book);
    if (!cbnState[book.id]) {
      cbnState[book.id] = { filled: new Uint8Array(d.w * d.h), sel: d.keys[0], mode: 'paint', view: null, findFrom: 0 };
    }
    return cbnState[book.id];
  }

  PAGES.color = {
    cls: 'page-paper page-activity',
    html: function (book) {
      var d = cbnData(book), s = getCbn(book);
      return '<header class="page-head">' +
          '<span class="page-kicker">' + esc(t('activity')) + '</span>' +
          '<h2 class="page-title">' + esc(t('colorTitle')) + '</h2>' +
        '</header>' +
        '<p class="help">' + esc(t('colorHelp')) + '</p>' +
        '<div class="palette" role="radiogroup" aria-label="' + esc(t('colors')) + '">' +
          d.keys.map(function (k) {
            return '<button type="button" class="swatch" role="radio" aria-checked="' + (s.sel === k) + '" data-k="' + k + '" style="--sw:' + d.color[k] + '">' +
              '<span class="sw-chip">' + k + '</span><span class="sw-name">' + esc(L(d.name[k])) + '</span></button>';
          }).join('') +
        '</div>' +
        '<div class="cbn-tools">' +
          '<div class="seg" role="group">' +
            '<button type="button" class="seg-btn" data-mode="paint" aria-pressed="' + (s.mode === 'paint') + '">' + esc(t('toolPaint')) + '</button>' +
            '<button type="button" class="seg-btn" data-mode="move" aria-pressed="' + (s.mode === 'move') + '">' + esc(t('toolMove')) + '</button>' +
          '</div>' +
          '<button type="button" class="btn btn-small btn-ghost cbn-zoom" data-z="-1" aria-label="' + esc(t('zoomOut')) + '">&minus;</button>' +
          '<button type="button" class="btn btn-small btn-ghost cbn-zoom" data-z="1" aria-label="' + esc(t('zoomIn')) + '">+</button>' +
          '<button type="button" class="btn btn-small btn-ghost cbn-fit">' + esc(t('fit')) + '</button>' +
          '<button type="button" class="btn btn-small btn-ghost cbn-find" title="' + esc(t('findHint')) + '">' + esc(t('find')) + '</button>' +
          '<span class="cbn-left" aria-live="polite"></span>' +
          '<button type="button" class="btn btn-small btn-ghost cbn-reset">' + esc(t('reset')) + '</button>' +
        '</div>' +
        '<div class="cbn-view"><canvas class="cbn-canvas" role="img" aria-label="' + esc(t('colorTitle') + ': ' + L(book.craftName)) + '"></canvas></div>' +
        '<p class="cbn-done" role="status" hidden></p>';
    },
    hydrate: function (el, book) { colorCanvas(el, book); }
  };

  function colorCanvas(el, book) {
    var d = cbnData(book), s = getCbn(book);
    var box = el.querySelector('.cbn-view'), cv = el.querySelector('.cbn-canvas'), ctx = cv.getContext('2d');
    var leftEl = el.querySelector('.cbn-left'), doneEl = el.querySelector('.cbn-done');
    var W = 0, H = 0, dpr = 1, raf = 0, flash = null, done = false;
    var MAX_SCALE = 56;

    /* ---- view: s.view = { sc: screen px per square, ox, oy: grid origin } ---- */
    function fitScale() { return Math.min(W / d.w, H / d.h); }
    function fit() {
      var sc = fitScale();
      s.view = { sc: sc, ox: (W - d.w * sc) / 2, oy: (H - d.h * sc) / 2 };
    }
    function clampView() {
      var v = s.view, m = 48;
      v.ox = Math.min(W - m, Math.max(m - d.w * v.sc, v.ox));
      v.oy = Math.min(H - m, Math.max(m - d.h * v.sc, v.oy));
    }
    function zoomAt(px, py, sc) {
      var v = s.view;
      sc = Math.max(fitScale() * 0.6, Math.min(MAX_SCALE, sc));
      v.ox = px - (px - v.ox) * sc / v.sc;
      v.oy = py - (py - v.oy) * sc / v.sc;
      v.sc = sc;
      clampView(); draw();
    }
    function size() {
      var w = Math.round(box.clientWidth);
      if (!w) return false;
      var h = Math.round(Math.min(w, window.innerHeight * 0.62));
      if (w === W && h === H) return true;
      W = w; H = h; dpr = window.devicePixelRatio || 1;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.height = H + 'px';
      if (!s.view) fit(); else clampView();
      draw();
      return true;
    }

    /* ---- drawing ---- */
    function draw() { if (!raf) raf = requestAnimationFrame(paint); }
    function paint() {
      raf = 0;
      if (!s.view) return;
      // work in real device pixels so squares meet with no seams
      var v = s.view, sc = v.sc * dpr, ox = v.ox * dpr, oy = v.oy * dpr, DW = cv.width, DH = cv.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#e6dcc0';
      ctx.fillRect(0, 0, DW, DH);
      var x0 = Math.max(0, Math.floor(-ox / sc)), y0 = Math.max(0, Math.floor(-oy / sc));
      var x1 = Math.min(d.w, Math.ceil((DW - ox) / sc)), y1 = Math.min(d.h, Math.ceil((DH - oy) / sc));
      var grid = v.sc >= 7, nums = v.sc >= 13, line = Math.max(1, Math.round(dpr));
      var hl = tint(d.color[s.sel]);
      if (nums) {
        ctx.font = Math.floor(sc * 0.8) + 'px VT323, monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      }
      for (var y = y0; y < y1; y++) {
        var py = Math.floor(oy + y * sc), ph = Math.floor(oy + (y + 1) * sc) - py;
        for (var x = x0; x < x1; x++) {
          var i = y * d.w + x, k = d.key[i], open = k && !s.filled[i] && !done;
          var px = Math.floor(ox + x * sc), pw = Math.floor(ox + (x + 1) * sc) - px;
          ctx.fillStyle = done ? d.reveal[i]
            : !k ? d.fixed[i]
            : s.filled[i] ? d.color[k]
            : flash && flash.i === i ? flash.c
            : d.gray[i];
          ctx.fillRect(px, py, pw, ph);
          if (!open) continue;
          if (k === s.sel && !(flash && flash.i === i)) { ctx.fillStyle = hl; ctx.fillRect(px, py, pw, ph); }
          if (grid) {
            ctx.fillStyle = 'rgba(52,38,26,.3)';
            ctx.fillRect(px + pw - line, py, line, ph);
            ctx.fillRect(px, py + ph - line, pw, line);
          }
          if (nums) {
            ctx.fillStyle = k === s.sel ? '#0a0a0a' : 'rgba(52,38,26,.7)';
            ctx.fillText(k, px + pw / 2, py + ph / 2 + 1);
          }
        }
      }
    }

    /* ---- painting ---- */
    function cellAt(cx, cy) {
      var v = s.view, x = Math.floor((cx - v.ox) / v.sc), y = Math.floor((cy - v.oy) / v.sc);
      return x < 0 || y < 0 || x >= d.w || y >= d.h ? -1 : y * d.w + x;
    }
    function flashCell(i, c) {
      flash = { i: i, c: c };
      draw();
      setTimeout(function () { if (flash && flash.i === i) { flash = null; draw(); } }, 450);
    }
    var dirty = false;
    function paintCell(i, tap) {
      if (i < 0 || done) return;
      var k = d.key[i];
      if (!k || s.filled[i]) return;
      if (k === s.sel) { s.filled[i] = 1; dirty = true; }
      else if (tap) flashCell(i, '#ff9c8a');
    }
    function paintLine(ax, ay, bx, by) {
      var steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / Math.max(2, s.view.sc / 2)));
      for (var j = 1; j <= steps; j++) paintCell(cellAt(ax + (bx - ax) * j / steps, ay + (by - ay) * j / steps), false);
    }
    function afterPaint() { if (dirty) { dirty = false; progress(); draw(); } }

    function progress() {
      var left = 0, perKey = {};
      for (var i = 0; i < d.key.length; i++) {
        if (d.key[i] && !s.filled[i]) { left++; perKey[d.key[i]] = 1; }
      }
      leftEl.textContent = t('squaresLeft', { n: left });
      el.querySelectorAll('.swatch').forEach(function (b) { b.classList.toggle('done', !perKey[b.getAttribute('data-k')]); });
      done = left === 0;
      doneEl.hidden = !done;
      el.classList.toggle('cbn-complete', done);
      if (done) doneEl.textContent = t('colorDone', { name: L(book.craftName) });
    }

    /* ---- pointer input: 1 finger/mouse paints (or moves), 2 fingers pinch + pan ---- */
    var ptrs = {}, gesture = null, last = null, pinch = null, space = false, tapStart = null;
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function setCursor() { cv.style.cursor = s.mode === 'move' || space ? (gesture === 'pan' ? 'grabbing' : 'grab') : 'crosshair'; }

    cv.addEventListener('pointerdown', function (e) {
      if (!s.view) return;
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      ptrs[e.pointerId] = pos(e);
      var ids = Object.keys(ptrs);
      if (ids.length === 2) {
        var a = ptrs[ids[0]], b = ptrs[ids[1]];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, sc: s.view.sc, ox: s.view.ox, oy: s.view.oy };
        gesture = 'pinch';
      } else if (ids.length === 1) {
        last = ptrs[e.pointerId];
        gesture = (s.mode === 'move' || space || e.button === 1 || e.button === 2) ? 'pan'
          // a finger on a touch screen: a tap paints, a drag moves the drawing
          : e.pointerType === 'touch' ? 'touch'
          : 'paint';
        if (gesture === 'touch') tapStart = { x: last.x, y: last.y };
        if (gesture === 'paint') { paintCell(cellAt(last.x, last.y), true); afterPaint(); }
      }
      setCursor();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!ptrs[e.pointerId]) return;
      var p = pos(e);
      ptrs[e.pointerId] = p;
      if (gesture === 'pinch') {
        var ids = Object.keys(ptrs);
        if (ids.length < 2) return;
        var a = ptrs[ids[0]], b = ptrs[ids[1]];
        var dd = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        var sc = Math.max(fitScale() * 0.6, Math.min(MAX_SCALE, pinch.sc * dd / pinch.d));
        s.view.sc = sc;
        s.view.ox = mx - (pinch.mx - pinch.ox) * sc / pinch.sc;
        s.view.oy = my - (pinch.my - pinch.oy) * sc / pinch.sc;
        clampView(); draw();
      } else if (gesture === 'touch') {
        // moved far enough to be a drag, not a tap: start moving the drawing
        if (Math.hypot(p.x - tapStart.x, p.y - tapStart.y) > 8) { gesture = 'pan'; setCursor(); }
      }
      if (gesture === 'pan') {
        s.view.ox += p.x - last.x; s.view.oy += p.y - last.y; last = p;
        clampView(); draw();
      } else if (gesture === 'paint') {
        paintLine(last.x, last.y, p.x, p.y); last = p; afterPaint();
      }
    });
    function lift(e) {
      // a finger lifted without dragging: that was a tap, so paint the square
      if (gesture === 'touch' && e.type === 'pointerup' && ptrs[e.pointerId]) {
        paintCell(cellAt(tapStart.x, tapStart.y), true); afterPaint();
      }
      delete ptrs[e.pointerId];
      var n = Object.keys(ptrs).length;
      if (n === 0) gesture = null;
      else if (gesture === 'pinch') gesture = 'none';   // don't paint with the finger left behind
      setCursor();
    }
    cv.addEventListener('pointerup', lift);
    cv.addEventListener('pointercancel', lift);
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    // mouse wheel zooms; trackpad pinch zooms; trackpad two-finger scroll pans
    cv.addEventListener('wheel', function (e) {
      if (!s.view) return;
      e.preventDefault();
      var p = pos(e);
      var mouseWheel = e.deltaMode !== 0 || (e.deltaX === 0 && Math.abs(e.deltaY) >= 40 && Math.round(e.deltaY) === e.deltaY);
      if (e.ctrlKey) zoomAt(p.x, p.y, s.view.sc * Math.exp(-e.deltaY * 0.012));
      else if (mouseWheel) zoomAt(p.x, p.y, s.view.sc * Math.exp(-e.deltaY * (e.deltaMode ? 0.06 : 0.0018)));
      else { s.view.ox -= e.deltaX; s.view.oy -= e.deltaY; clampView(); draw(); }
    }, { passive: false });

    // hold Space to drag the drawing around with the mouse
    var hover = false;
    cv.addEventListener('pointerenter', function () { hover = true; });
    cv.addEventListener('pointerleave', function () { hover = false; });
    function key(e) {
      if (!cv.isConnected) { unbind(); return; }
      if (e.key !== ' ' || !hover) return;
      e.preventDefault();
      space = e.type === 'keydown';
      setCursor();
    }
    document.addEventListener('keydown', key);
    document.addEventListener('keyup', key);

    /* ---- toolbar ---- */
    el.querySelector('.palette').addEventListener('click', function (e) {
      var b = e.target.closest('.swatch');
      if (!b) return;
      s.sel = b.getAttribute('data-k'); s.findFrom = 0;
      el.querySelectorAll('.swatch').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
      draw();
    });
    el.querySelectorAll('.seg-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        s.mode = b.getAttribute('data-mode');
        el.querySelectorAll('.seg-btn').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        setCursor();
      });
    });
    el.querySelectorAll('.cbn-zoom').forEach(function (b) {
      b.addEventListener('click', function () { zoomAt(W / 2, H / 2, s.view.sc * (+b.getAttribute('data-z') > 0 ? 1.5 : 1 / 1.5)); });
    });
    el.querySelector('.cbn-fit').addEventListener('click', function () { fit(); draw(); });
    el.querySelector('.cbn-find').addEventListener('click', function () {
      var n = d.key.length;
      for (var j = 0; j < n; j++) {
        var i = (s.findFrom + j) % n;
        if (d.key[i] === s.sel && !s.filled[i]) {
          s.findFrom = i + 1;
          var sc = Math.max(s.view.sc, 22), x = i % d.w, y = Math.floor(i / d.w);
          s.view.sc = Math.min(MAX_SCALE, sc);
          s.view.ox = W / 2 - (x + 0.5) * s.view.sc;
          s.view.oy = H / 2 - (y + 0.5) * s.view.sc;
          clampView();
          flashCell(i, '#8ff6ff');
          return;
        }
      }
    });
    el.querySelector('.cbn-reset').addEventListener('click', function () {
      s.filled = new Uint8Array(d.w * d.h);
      progress(); fit(); draw();
    });

    // pages are re-drawn while turning; a canvas that left the page unhooks itself
    function onResize() { if (!cv.isConnected) unbind(); else size(); }
    function unbind() {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', key);
      document.removeEventListener('keyup', key);
    }
    window.addEventListener('resize', onResize);
    onLeave(unbind);

    progress();
    setCursor();
    if (!size()) requestAnimationFrame(function () { size(); });
  }

  /* ---------- Quiz ----------
     5 random questions from the book's pool, answers shuffled.
     State stores indexes only, so switching language keeps progress. */

  var QUIZ_LEN = 5;
  var quizState = {};
  var BEST_KEY = 'abnf-best-';

  // best percentage per book, kept on this device
  function bestScore(id) {
    try { return +localStorage.getItem(BEST_KEY + id) || 0; } catch (e) { return 0; }
  }
  function saveBest(id, pct) {
    try { localStorage.setItem(BEST_KEY + id, String(pct)); } catch (e) { /* ignore */ }
  }

  function newQuiz(book) {
    var idx = shuffle(book.quiz.map(function (_, i) { return i; })).slice(0, Math.min(QUIZ_LEN, book.quiz.length));
    return {
      items: idx.map(function (qi) {
        return { q: qi, order: shuffle(book.quiz[qi].answers.map(function (_, j) { return j; })), pick: null };
      }),
      cur: 0,
      done: false
    };
  }

  function drawQuiz(body, book) {
    var qs = quizState[book.id], total = qs.items.length;

    if (qs.done) {
      var score = qs.items.filter(function (it) { return it.pick === book.quiz[it.q].correct; }).length;
      var msg = score === total ? 'scorePerfect' : score >= Math.ceil(total * 0.6) ? 'scoreGood' : 'scoreTryAgain';
      var pct = Math.round(score / total * 100);
      // record the best once per finished quiz (redraws on language switch don't count again)
      if (!qs.saved) {
        qs.saved = true;
        qs.newBest = pct > 0 && pct > bestScore(book.id);
        if (qs.newBest) saveBest(book.id, pct);
      }
      var best = Math.max(bestScore(book.id), pct);
      body.innerHTML =
        '<div class="quiz-score" role="status">' +
          '<div class="score-stars" aria-hidden="true">' +
            qs.items.map(function (it) { return '<span class="' + (it.pick === book.quiz[it.q].correct ? 'on' : '') + '"></span>'; }).join('') +
          '</div>' +
          '<p class="score-pct">' + pct + '%</p>' +
          '<div class="score-bar" aria-hidden="true"><span style="width:' + pct + '%"></span></div>' +
          '<p class="score-big">' + esc(t('score', { s: score, t: total })) + '</p>' +
          '<p class="score-best">' + esc(qs.newBest ? t('newBest') : t('bestScore', { p: best })) + '</p>' +
          '<p>' + esc(t(msg)) + '</p>' +
          '<button type="button" class="btn js-newq">' + esc(t('newQuestions')) + '</button>' +
        '</div>';
      return;
    }

    var it = qs.items[qs.cur], q = book.quiz[it.q], answered = it.pick !== null;
    var ok = answered && it.pick === q.correct;
    body.innerHTML =
      '<p class="q-count">' + esc(t('questionOf', { n: qs.cur + 1, t: total })) + '</p>' +
      '<p class="q-text">' + esc(L(q.q)) + '</p>' +
      '<div class="answers">' +
        it.order.map(function (j, n) {
          var cls = !answered ? '' : j === q.correct ? ' right' : j === it.pick ? ' wrong' : '';
          return '<button type="button" class="answer' + cls + '" data-j="' + j + '"' + (answered ? ' disabled' : '') + '>' +
            '<span class="a-letter" aria-hidden="true">' + 'ABCDEF'[n] + '</span>' + esc(L(q.answers[j])) + '</button>';
        }).join('') +
      '</div>' +
      (answered
        ? '<p class="q-feedback ' + (ok ? 'ok' : 'bad') + '" role="status">' +
            esc(ok ? t('correct') : t('wrong', { a: L(q.answers[q.correct]) })) + '</p>' +
          '<button type="button" class="btn js-nextq">' + esc(t(qs.cur === total - 1 ? 'seeScore' : 'nextQuestion')) + '</button>'
        : '');
  }

  PAGES.quiz = {
    cls: 'page-paper page-activity',
    html: function () {
      return '<header class="page-head">' +
          '<span class="page-kicker">' + esc(t('activity')) + '</span>' +
          '<h2 class="page-title">' + esc(t('quizTitle')) + '</h2>' +
        '</header>' +
        '<p class="help">' + esc(t('quizHelp')) + '</p>' +
        '<div class="quiz-body"></div>';
    },
    hydrate: function (el, book) {
      var body = el.querySelector('.quiz-body');
      if (!quizState[book.id]) quizState[book.id] = newQuiz(book);
      drawQuiz(body, book);
      body.addEventListener('click', function (e) {
        var qs = quizState[book.id], focusSel = null;
        var a = e.target.closest('.answer');
        if (a && !a.disabled) {
          qs.items[qs.cur].pick = +a.getAttribute('data-j');
          focusSel = '.js-nextq';
        } else if (e.target.closest('.js-nextq')) {
          if (qs.cur < qs.items.length - 1) qs.cur++; else qs.done = true;
          focusSel = qs.done ? '.js-newq' : '.answer';
        } else if (e.target.closest('.js-newq')) {
          quizState[book.id] = newQuiz(book);
          focusSel = '.answer';
        } else return;
        drawQuiz(body, book);
        var f = body.querySelector(focusSel);
        if (f) f.focus({ preventScroll: true });
      });
    }
  };

  /* page rendering and turning */

  // render page number idx (default: the current page) into el; out of range = blank
  function renderPageInto(el, book, idx, side) {
    if (idx == null) idx = reader.page;
    var pg = bookPages(book)[idx];
    var sideCls = side ? ' leaf leaf-' + side : '';
    if (!pg) { el.className = 'page leaf-empty' + sideCls; el.innerHTML = ''; el.removeAttribute('data-type'); return; }
    var def = PAGES[pg.type];
    el.className = 'page ' + (def.cls || '') + sideCls;
    el.setAttribute('data-type', pg.type);
    el.style.setProperty('--cover', book.cover);
    el.innerHTML = def.html(book, pg);
    hydrateArt(el);
    if (def.hydrate) def.hydrate(el, book, pg);
  }

  function updateNav(book) {
    var total = bookPages(book).length, i = reader.page, dots = '', label, first, last;
    if (isSpread()) {
      var k = spreadK(), a = 2 * k - 1, b = 2 * k;
      first = k === 0; last = k === maxSpread(book);
      var vis = [a, b].filter(function (n) { return n >= 0 && n < total; });
      label = vis.length === 2 ? t('pagesOf', { a: a + 1, b: b + 1, t: total }) : t('pageOf', { n: vis[0] + 1, t: total });
      for (var j = 0; j < total; j++) dots += '<span class="dot' + (vis.indexOf(j) !== -1 ? ' on' : '') + '"></span>';
    } else {
      first = i === 0; last = i === total - 1;
      label = t('pageOf', { n: i + 1, t: total });
      for (var m = 0; m < total; m++) dots += '<span class="dot' + (m === i ? ' on' : '') + '"></span>';
    }
    app.querySelector('.js-prev').disabled = first;
    app.querySelector('.js-nextnav').disabled = last;
    app.querySelector('.page-count').textContent = label;
    app.querySelector('.page-dots').innerHTML = dots;
    abSoon();
  }

  /* ---------- two-page spreads (wide screens) ----------
     Pages pair up into sheets of paper: (cover, contents), (part 1, part 2)…
     Spread k shows page 2k-1 on the left and 2k on the right; k = 0 is the
     closed front cover and the last spread is the closed back cover.
     Turning lifts the right-hand sheet: its front is the page you were
     reading, its back lands face up on the left, and the next page is
     already waiting underneath.                                          */

  var SPREAD_MQ = window.matchMedia ? window.matchMedia('(min-width: 900px)') : null;
  function isSpread() { return !!(SPREAD_MQ && SPREAD_MQ.matches && app.querySelector('.book-stage.spread')); }
  function spreadK() { return reader.page === 0 ? 0 : Math.floor((reader.page + 1) / 2); }
  function maxSpread(book) { return Math.ceil(bookPages(book).length / 2); }
  function firstOfSpread(k) { return k === 0 ? 0 : 2 * k - 1; }

  function setClosed(stage, book, k) {
    stage.classList.toggle('closed-front', k === 0);
    stage.classList.toggle('closed-back', k === maxSpread(book));
  }

  function renderSpread(book) {
    var k = spreadK(), stage = app.querySelector('.book-stage');
    renderPageInto(document.getElementById('page-left'), book, 2 * k - 1, 'l');
    renderPageInto(document.getElementById('page-right'), book, 2 * k, 'r');
    setClosed(stage, book, k);
  }

  function beginSheet(dir) {
    var book = getBook(reader.id), k = spreadK(), nk = k + dir;
    if (nk < 0 || nk > maxSpread(book) || reader.turning) return null;
    var stage = app.querySelector('.book-stage');
    var left = document.getElementById('page-left'), right = document.getElementById('page-right');
    var from = reader.page;
    reader.turning = true;

    var sheet = document.createElement('div');
    sheet.className = 'sheet';
    sheet.innerHTML = '<div class="face face-front"><article></article></div><div class="face face-back"><article></article></div>';
    stage.appendChild(sheet);
    var front = sheet.querySelector('.face-front article'), back = sheet.querySelector('.face-back article');

    if (dir > 0) {
      renderPageInto(front, book, 2 * k, 'r');          // the page being lifted
      renderPageInto(back, book, 2 * k + 1, 'l');       // what's printed on its back
      renderPageInto(right, book, 2 * k + 2, 'r');      // revealed underneath
    } else {
      renderPageInto(back, book, 2 * k - 1, 'l');       // the left page being lifted back
      renderPageInto(front, book, 2 * k - 2, 'r');
      renderPageInto(left, book, 2 * k - 3, 'l');       // revealed underneath
    }
    reader.page = firstOfSpread(nk);

    function set(p) {
      sheet.style.transform = 'rotateY(' + (dir > 0 ? -180 * p : -180 * (1 - p)) + 'deg)';
      sheet.style.setProperty('--shade', (Math.sin(p * Math.PI) * 0.7).toFixed(3));
    }
    set(0);
    updateNav(book);

    return {
      set: set,
      end: function (commit) {
        var finished = false;
        function fin() {
          if (finished) return;
          finished = true;
          if (commit) {
            if (dir > 0) renderPageInto(left, book, 2 * k + 1, 'l');
            else renderPageInto(right, book, 2 * k - 2, 'r');
          } else {
            reader.page = from;
            if (dir > 0) renderPageInto(right, book, 2 * k, 'r');
            else renderPageInto(left, book, 2 * k - 1, 'l');
            setClosed(stage, book, k);
          }
          sheet.remove();
          reader.turning = false;
          updateNav(book);
        }
        if (commit) setClosed(stage, book, nk);       // the book slides open / closed as it turns
        sheet.classList.add('sheet-settle');
        set(commit ? 1 : 0);
        sheet.addEventListener('transitionend', function (e) { if (e.target === sheet) fin(); });
        setTimeout(fin, REDUCED ? 0 : 750);
      }
    };
  }

  function spreadGo(n) {
    var book = getBook(reader.id), k = spreadK();
    var nk = n === 0 ? 0 : Math.floor((n + 1) / 2);
    if (nk === k || reader.turning) return;
    var stage = app.querySelector('.book-stage');
    if (stage.getBoundingClientRect().top < 0) stage.scrollIntoView({ block: 'start' });
    if (Math.abs(nk - k) === 1 && !REDUCED) {
      var c = beginSheet(nk > k ? 1 : -1);
      if (c) requestAnimationFrame(function () { requestAnimationFrame(function () { c.end(true); }); });
    } else {
      reader.page = firstOfSpread(nk);
      renderSpread(book);
      updateNav(book);
    }
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
    if (n < 0 || n >= total || reader.turning) return;
    if (isSpread()) { spreadGo(n); return; }
    if (n === reader.page) return;
    var forward = n > reader.page;
    var stage = app.querySelector('.book-stage');
    var base = document.getElementById('page-base');
    // after reading to the bottom of a long page, bring the top of the next one into view
    if (stage.getBoundingClientRect().top < 0) stage.scrollIntoView({ block: 'start' });

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
      ov.style.height = base.offsetHeight + 'px';   // keep the old page's shape while it turns
      stage.appendChild(ov);
      copyCanvases(base, ov);
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

  function turn(dir) {
    if (isSpread()) {
      var k = spreadK() + dir;
      if (k >= 0 && k <= maxSpread(getBook(reader.id))) spreadGo(firstOfSpread(k));
      return;
    }
    goTo(reader.page + dir);
  }

  // cloned pages lose their canvas pictures; copy them over
  function copyCanvases(from, to) {
    var a = from.querySelectorAll('canvas'), b = to.querySelectorAll('canvas');
    for (var i = 0; i < a.length && i < b.length; i++) {
      b[i].width = a[i].width; b[i].height = a[i].height;
      if (a[i].width && a[i].height) b[i].getContext('2d').drawImage(a[i], 0, 0);
    }
  }

  /* Turning a page by hand: the page follows the finger or mouse.
     Returns { set(progress 0..1), end(commit) } or null at the ends of the book. */
  function beginDrag(dir) {
    if (isSpread()) return beginSheet(dir);
    var book = getBook(reader.id), total = bookPages(book).length, from = reader.page, n = from + dir;
    if (n < 0 || n >= total || reader.turning) return null;
    var stage = app.querySelector('.book-stage'), base = document.getElementById('page-base'), ov;
    reader.turning = true;
    if (dir > 0) {
      // lift the current page; the next one is already underneath
      ov = base.cloneNode(true);
      ov.removeAttribute('id');
      ov.style.height = base.offsetHeight + 'px';
      stage.appendChild(ov);
      copyCanvases(base, ov);
      reader.page = n;
      renderPageInto(base, book);
    } else {
      // bring the previous page back over from the left
      ov = document.createElement('article');
      stage.appendChild(ov);
      reader.page = n;
      renderPageInto(ov, book);
    }
    ov.classList.add('page-overlay', 'page-drag');
    function set(p) {
      ov.style.transform = 'rotateY(' + (dir > 0 ? -100 * p : -100 * (1 - p)) + 'deg)';
      ov.style.setProperty('--shade', dir > 0 ? p : 1 - p);
    }
    set(0);
    updateNav(book);
    return {
      set: set,
      end: function (commit) {
        var finished = false;
        function fin() {
          if (finished) return;
          finished = true;
          if (dir > 0 && !commit) { reader.page = from; renderPageInto(base, book); }
          if (dir < 0) { if (commit) renderPageInto(base, book); else reader.page = from; }
          ov.remove();
          reader.turning = false;
          updateNav(book);
        }
        ov.classList.add('page-settle');
        set(commit ? 1 : 0);
        ov.addEventListener('transitionend', fin, { once: true });
        setTimeout(fin, 500);
      }
    };
  }

  VIEWS.book = function (r) {
    var book = getBook(r.arg);
    if (!book) { location.replace('#/library'); return; }
    if (reader.id !== book.id) { reader.id = book.id; reader.page = 0; }
    reader.turning = false;
    var wide = !!(SPREAD_MQ && SPREAD_MQ.matches);
    if (wide) reader.page = firstOfSpread(spreadK());

    app.innerHTML =
      '<section class="reader' + (wide ? ' is-spread' : '') + '" aria-label="' + esc(L(book.title)) + '">' +
        '<div class="reader-top">' +
          '<a class="btn btn-small btn-ghost" href="#/library">&#9664; ' + esc(t('backToLibrary')) + '</a>' +
          '<span class="page-count" aria-live="polite"></span>' +
        '</div>' +
        abBarHTML() +
        (wide
          ? '<div class="book-stage spread"><article class="page" id="page-left"></article><article class="page" id="page-right"></article></div>'
          : '<div class="book-stage"><article class="page" id="page-base"></article></div>') +
        '<div class="reader-nav">' +
          '<button type="button" class="btn js-prev">&#9664; ' + esc(t('prev')) + '</button>' +
          '<div class="page-dots" aria-hidden="true"></div>' +
          '<button type="button" class="btn js-nextnav">' + esc(t('next')) + ' &#9654;</button>' +
        '</div>' +
        '<p class="reader-hint">' + esc(t('readerHint')) + '</p>' +
      '</section>';

    var stage = app.querySelector('.book-stage');
    if (wide) renderSpread(book);
    else renderPageInto(document.getElementById('page-base'), book);
    updateNav(book);
    initAudiobook(book);

    app.querySelector('.js-prev').addEventListener('click', function () { turn(-1); });
    app.querySelector('.js-nextnav').addEventListener('click', function () { turn(1); });
    stage.addEventListener('click', function (e) {
      var go = e.target.closest('.js-goto');
      if (e.target.closest('.js-next')) turn(1);
      else if (e.target.closest('.js-listen')) abPlay();
      else if (e.target.closest('.js-restart')) goTo(0);
      else if (go) goTo(+go.getAttribute('data-n'));
    });

    // switch between one page and two-page spreads when the window size changes
    function onMode() { if (!reader.turning) { reader.keepAudio = true; render(); } }
    if (SPREAD_MQ) {
      if (SPREAD_MQ.addEventListener) SPREAD_MQ.addEventListener('change', onMode);
      else SPREAD_MQ.addListener(onMode);
    }

    function onKey(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
    }
    document.addEventListener('keydown', onKey);

    // drag the page sideways with a finger or the mouse; it follows, then
    // finishes turning (past ~30% or a quick flick) or falls back into place.
    // Vertical drags still scroll the page; the coloring canvas is left alone.
    var drag = null;
    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (reader.turning || e.target.closest('button, a, input, select, textarea, .cbn-view, .answer, .swatch')) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, w: stage.clientWidth * (wide ? 0.6 : 1), ctl: null, dir: 0, p: 0, lx: e.clientX, t: performance.now(), v: 0 };
    });
    function onDragMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.ctl) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
        drag.dir = dx < 0 ? 1 : -1;
        drag.ctl = beginDrag(drag.dir);
        if (!drag.ctl) { drag = null; return; }
        document.body.classList.add('dragging-page');
        try { window.getSelection().removeAllRanges(); } catch (err) { /* ignore */ }
      }
      var now = performance.now();
      drag.v = (e.clientX - drag.lx) / Math.max(1, now - drag.t);
      drag.lx = e.clientX; drag.t = now;
      drag.p = Math.max(0, Math.min(1, -drag.dir * dx / (drag.w * 0.8)));
      drag.ctl.set(drag.p);
    }
    function onDragEnd(e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.ctl) {
        var flick = -drag.dir * drag.v > 0.45;          // px per ms, in the turning direction
        drag.ctl.end(drag.p > 0.3 || (flick && drag.p > 0.05));
        document.body.classList.remove('dragging-page');
      }
      drag = null;
    }
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragEnd);
    window.addEventListener('pointercancel', onDragEnd);

    onLeave(function () {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', onDragEnd);
      window.removeEventListener('pointercancel', onDragEnd);
      if (SPREAD_MQ) {
        if (SPREAD_MQ.removeEventListener) SPREAD_MQ.removeEventListener('change', onMode);
        else SPREAD_MQ.removeListener(onMode);
      }
      document.body.classList.remove('dragging-page');
      // keep reading when only the layout changes (one page <-> two pages)
      if (reader.keepAudio) reader.keepAudio = false;
      else stopAudio();
    });
  };

  /* ---------- Where are they now? ----------
     Pick a spacecraft; a switch flips its picture between "on its mission"
     and "today, abandoned" (the 'today' sprite variant), with a timeline. */

  var whereState = { id: 'eagle', view: 'then' };

  function bodyName(body) { return t(body === 'moon' ? 'moon' : 'mars'); }

  // "≈ 22.48° N, 47.94° W" (W is "O" in Spanish)
  function coords(site) {
    var ns = site.lat >= 0 ? t('dirN') : t('dirS'), ew = site.lon >= 0 ? t('dirE') : t('dirW');
    return '≈ ' + Math.abs(site.lat).toFixed(2) + '° ' + ns + ', ' + Math.abs(site.lon).toFixed(2) + '° ' + ew;
  }

  VIEWS.where = function (r) {
    if (r.arg && getBook(r.arg)) whereState.id = r.arg;
    var b = getBook(whereState.id), now = whereState.view === 'now';
    app.innerHTML =
      '<section class="where">' +
        '<h1 class="h1">' + esc(t('whereTitle')) + '</h1>' +
        '<p class="lead">' + esc(t('whereIntro')) + '</p>' +
        '<div class="craft-picker" role="tablist" aria-label="' + esc(t('whereTitle')) + '">' +
          DATA.books.map(function (x) {
            return '<button type="button" role="tab" class="craft-tab" data-id="' + x.id + '" aria-selected="' + (x.id === b.id) + '">' +
              artCanvas(x.id, 'craft-tab-art') + '<span>' + esc(L(x.craftName)) + '</span></button>';
          }).join('') +
        '</div>' +
        '<div class="where-card panel' + (now ? ' show-now' : '') + '">' +
          '<figure class="then-now' + (now ? ' is-now' : '') + '">' +
            '<div class="tn-frame">' +
              artCanvas(b.id, 'tn-art tn-then', L(b.craftName) + ': ' + t('whereThen')) +
              '<canvas class="pix tn-art tn-now" data-art="' + b.id + '" data-variant="today" role="img" aria-label="' + esc(L(b.craftName) + ': ' + t('whereNow')) + '"></canvas>' +
              '<span class="tn-stamp">' + esc(now ? t('whereNow') : t('whereThen')) + '</span>' +
            '</div>' +
            '<div class="tn-switch" role="group" aria-label="' + esc(t('thenNow')) + '">' +
              '<button type="button" class="tn-btn" data-v="then" aria-pressed="' + !now + '">' + esc(t('whereThen')) + '</button>' +
              '<button type="button" class="tn-flip" aria-label="' + esc(t('thenNow')) + '"><span class="sw" aria-hidden="true"><span class="sw-knob"></span></span></button>' +
              '<button type="button" class="tn-btn" data-v="now" aria-pressed="' + now + '">' + esc(t('whereNow')) + '</button>' +
            '</div>' +
          '</figure>' +
          '<div class="where-info">' +
            '<p class="page-kicker">' + esc(bodyName(b.body)) + ' · ' + esc(L(b.site.name)) + '</p>' +
            '<h2 class="where-title">' + esc(L(b.title)) + (L(b.craftName) !== L(b.title) ? ' <span>' + esc(L(b.craftName)) + '</span>' : '') + '</h2>' +
            '<p class="where-status"><b>' + esc(t('statusLabel')) + ':</b> ' + esc(L(b.now.status)) + '</p>' +
            '<p class="where-text">' + esc(L(b.now.text)) + '</p>' +
            '<h3 class="tl-head">' + esc(t('whereTimeline')) + '</h3>' +
            '<ol class="timeline">' +
              // the switch lights up the events that match the picture:
              // during the mission, or after it (abandoned, today)
              b.timeline.map(function (e, i) {
                var split = b.timelineSplit != null ? b.timelineSplit : b.timeline.length - 1;
                return '<li class="' + (i < split ? 'tl-mission' : 'tl-after') + '"><span class="tl-date">' + esc(L(e.date)) + '</span><span class="tl-text">' + esc(L(e.text)) + '</span></li>';
              }).join('') +
            '</ol>' +
            '<div class="where-actions">' +
              '<a class="btn" href="#/book/' + b.id + '">' + esc(t('readItsBook')) + '</a>' +
              '<a class="btn btn-ghost" href="#/map/' + b.id + '">' + esc(t('seeOnMap')) + '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';

    var fig = app.querySelector('.then-now');
    function setView(v) {
      whereState.view = v;
      var isNow = v === 'now';
      fig.classList.toggle('is-now', isNow);
      app.querySelector('.where-card').classList.toggle('show-now', isNow);
      fig.classList.remove('flicker'); void fig.offsetWidth; fig.classList.add('flicker');
      fig.querySelector('.tn-stamp').textContent = t(isNow ? 'whereNow' : 'whereThen');
      fig.querySelectorAll('.tn-btn').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-v') === v)); });
      fig.querySelector('.tn-flip').setAttribute('aria-pressed', String(isNow));
    }
    fig.querySelector('.tn-flip').setAttribute('aria-pressed', String(now));
    fig.querySelectorAll('.tn-btn').forEach(function (x) { x.addEventListener('click', function () { setView(x.getAttribute('data-v')); }); });
    fig.querySelector('.tn-flip').addEventListener('click', function () { setView(whereState.view === 'now' ? 'then' : 'now'); });
    app.querySelectorAll('.craft-tab').forEach(function (x) {
      x.addEventListener('click', function () {
        whereState.id = x.getAttribute('data-id');
        try { history.replaceState(null, '', '#/where/' + whereState.id); } catch (e) { /* ignore */ }
        VIEWS.where({ arg: whereState.id });
        hydrateArt(app);
        var tab = app.querySelector('.craft-tab[data-id="' + whereState.id + '"]');
        if (tab) tab.focus({ preventScroll: true });
      });
    });
  };

  /* ---------- Graveyard map ----------
     Moon / Mars tabs, a pixel map with a pin at each resting place
     (locations approximate) and an info panel for the selected pin.     */

  var mapState = { body: 'moon', id: null };

  VIEWS.map = function (r) {
    if (r.arg && getBook(r.arg)) { mapState.id = r.arg; mapState.body = getBook(r.arg).body; }
    var body = mapState.body;
    var list = DATA.books.filter(function (b) { return b.body === body; });
    if (!mapState.id || getBook(mapState.id).body !== body) mapState.id = null;
    var sel = mapState.id ? getBook(mapState.id) : null;

    app.innerHTML =
      '<section class="graveyard">' +
        '<h1 class="h1">' + esc(t('mapTitle')) + '</h1>' +
        '<p class="lead">' + esc(t('mapIntro')) + '</p>' +
        '<div class="map-tabs" role="tablist">' +
          ['moon', 'mars'].map(function (x) {
            return '<button type="button" role="tab" class="map-tab" data-body="' + x + '" aria-selected="' + (x === body) + '">' +
              '<canvas class="pix map-tab-icon" data-orb="' + x + '" aria-hidden="true"></canvas>' + esc(bodyName(x)) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="map-layout">' +
          '<div class="map-frame panel">' +
            '<div class="map-box">' +
              '<canvas class="pix map-canvas" data-art="map:' + body + '" role="img" aria-label="' + esc(t('mapOf', { body: bodyName(body) })) + '"></canvas>' +
              list.map(function (b) {
                var x = (b.site.lon + 180) / 360 * 100, y = (90 - b.site.lat) / 180 * 100;
                return '<button type="button" class="pin' + (sel && sel.id === b.id ? ' is-sel' : '') + '" data-id="' + b.id + '" style="left:' + x.toFixed(2) + '%;top:' + y.toFixed(2) + '%"' +
                  ' aria-label="' + esc(L(b.craftName) + ', ' + L(b.site.name)) + '" aria-pressed="' + !!(sel && sel.id === b.id) + '">' +
                  '<span class="pin-dot" aria-hidden="true"></span><span class="pin-label">' + esc(L(b.craftName)) + '</span></button>';
              }).join('') +
            '</div>' +
            '<div class="map-axis"><span>180°' + esc(t('dirW')) + '</span><span>0°</span><span>180°' + esc(t('dirE')) + '</span></div>' +
          '</div>' +
          '<aside class="map-info panel" aria-live="polite">' +
            (sel
              ? artCanvas(sel.id, 'map-info-art', L(sel.craftName)) +
                '<p class="page-kicker">' + esc(t('restingPlace')) + '</p>' +
                '<h2 class="map-info-title">' + esc(L(sel.craftName)) + '</h2>' +
                '<p class="map-site">' + esc(L(sel.site.name)) + '</p>' +
                '<p class="map-coords">' + esc(coords(sel.site)) + ' <span class="approx">(' + esc(t('approx')) + ')</span></p>' +
                (sel.site.note ? '<p class="map-note-small">' + esc(L(sel.site.note)) + '</p>' : '') +
                '<p class="map-status">' + esc(L(sel.now.status)) + '</p>' +
                '<div class="map-actions">' +
                  '<a class="btn" href="#/book/' + sel.id + '">' + esc(t('readItsBook')) + '</a>' +
                  '<a class="btn btn-ghost" href="#/where/' + sel.id + '">' + esc(t('thenNow')) + '</a>' +
                '</div>'
              : '<p class="map-hint">' + esc(t('mapPick')) + '</p>' +
                '<ul class="map-list">' + list.map(function (b) {
                  return '<li><button type="button" class="map-list-btn" data-id="' + b.id + '">' + artCanvas(b.id, 'map-list-art') +
                    '<span>' + esc(L(b.craftName)) + '<small>' + esc(L(b.site.name)) + '</small></span></button></li>';
                }).join('') + '</ul>') +
          '</aside>' +
        '</div>' +
        '<p class="map-footnote">' + esc(t('mapNote')) + '</p>' +
      '</section>';

    function rerender() {
      try { history.replaceState(null, '', '#/map' + (mapState.id ? '/' + mapState.id : '')); } catch (e) { /* ignore */ }
      VIEWS.map({ arg: null });
      hydrateArt(app);
    }
    app.querySelectorAll('.map-tab').forEach(function (x) {
      x.addEventListener('click', function () {
        if (mapState.body === x.getAttribute('data-body')) return;
        mapState.body = x.getAttribute('data-body'); mapState.id = null; rerender();
        var tab = app.querySelector('.map-tab[data-body="' + mapState.body + '"]'); if (tab) tab.focus({ preventScroll: true });
      });
    });
    app.querySelectorAll('.pin, .map-list-btn').forEach(function (x) {
      x.addEventListener('click', function () {
        var id = x.getAttribute('data-id');
        mapState.id = mapState.id === id && x.classList.contains('pin') ? null : id;
        rerender();
        var pin = app.querySelector('.pin[data-id="' + id + '"]'); if (pin) pin.focus({ preventScroll: true });
      });
    });
  };

  VIEWS.mission = function () {
    app.innerHTML =
      '<section>' +
        '<h1 class="h1">' + esc(t('missionTitle')) + '</h1>' +
        '<div class="mission-list">' +
          DATA.mission.sections.map(function (s) {
            return '<article class="panel mission-card">' +
              '<h2>' + esc(L(s.h)) + '</h2>' +
              (s.p ? '<p>' + esc(L(s.p)) + '</p>' : '') +
              (s.links ? '<ul class="source-list">' + s.links.map(function (l) {
                return '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' + esc(L(l.label)) + '</a>' +
                  '<span class="source-url">' + esc(l.url.replace(/^https?:\/\//, '')) + '</span></li>';
              }).join('') + '</ul>' : '') +
              (s.list ? '<ul class="ai-list">' + s.list.map(function (it) {
                return '<li><b>' + esc(L(it.b)) + '</b> ' + esc(L(it.t)) + '</li>';
              }).join('') + '</ul>' : '') +
            '</article>';
          }).join('') +
        '</div>' +
      '</section>';
  };

  /* ---------- Ambient sound ----------
     A soft space drone, faint wind and the odd twinkle, made live with
     Web Audio (no file to download). Browsers only allow sound after the
     visitor's first tap or key press, so it starts then. It fades out
     while the audiobook is playing and comes back when narration stops.
     The on/off choice is remembered on this device.                    */

  var SOUND_KEY = 'abnf-sound';
  var AMB_VOL = 0.3;
  var amb = { enabled: true, unlocked: false, nodes: null, on: false, waitTimer: 0, chimeTimer: 0, chordTimer: 0, signalTimer: 0, chord: 0 };

  // Amaj7 -> B/A -> Dmaj7 -> E: bright and dreamy (the B over A is the
  // "wonder" sound sci-fi films use). About 10 s each, crossfading.
  // notes: bass, low, middle, top (Hz); chimes: high notes that fit the chord, low to high
  var CHORD_SECS = 10, CHORD_FADE = 3.5;
  var CHORDS = [
    { notes: [110, 164.81, 207.65, 277.18],   chimes: [880, 1108.73, 1318.51, 1661.22] },
    { notes: [110, 185, 246.94, 311.13],      chimes: [987.77, 1244.51, 1479.98, 1760] },
    { notes: [146.83, 220, 277.18, 369.99],   chimes: [1108.73, 1174.66, 1479.98, 1760] },
    { notes: [82.41, 246.94, 329.63, 415.3],  chimes: [987.77, 1318.51, 1661.22, 1975.53] }
  ];
  var VOICES = [
    { type: 'sine', level: 0.22, detune: 0 },
    { type: 'sine', level: 0.18, detune: 0 },
    { type: 'triangle', level: 0.14, detune: 5 },
    { type: 'triangle', level: 0.12, detune: -4 }
  ];

  function randomPick(list) { return list[Math.floor(Math.random() * list.length)]; }

  // left/right placement (skipped on browsers without stereo panning)
  function panTo(c, x, dest) {
    if (!c.createStereoPanner) return dest;
    var p = c.createStereoPanner();
    p.pan.value = x; p.connect(dest);
    return p;
  }

  var SOUND_ICONS = {
    on: '<svg viewBox="0 0 10 8" aria-hidden="true"><path d="M0 3h2v2H0zM2 3h1V2h1V1h1v6H4V6H3V5H2zM6 3h1v2H6zM8 1h1v6H8z"/></svg>',
    off: '<svg viewBox="0 0 10 8" aria-hidden="true"><path d="M0 3h2v2H0zM2 3h1V2h1V1h1v6H4V6H3V5H2zM6 2h1v1H6zM8 2h1v1H8zM7 3h1v2H7zM6 5h1v1H6zM8 5h1v1H8z"/></svg>'
  };

  function buildAmbient() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    var ctx = new AC();
    var master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    function lfo(rate, amount, target) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = rate; g.gain.value = amount;
      o.connect(g); g.connect(target); o.start();
    }

    // pad: the chord progression through a slowly opening and closing filter
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = 0.7;
    var drone = ctx.createGain();
    drone.gain.value = 0.5;
    lp.connect(drone); drone.connect(master);
    lfo(0.04, 400, lp.frequency);
    lfo(0.07, 0.15, drone.gain);

    // wind: looped brown noise through a band-pass
    var len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    var noise = ctx.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 0.8;
    var wind = ctx.createGain();
    wind.gain.value = 0.07;
    // the wind drifts slowly from one side to the other and its tone sweeps
    var windOut = panTo(ctx, 0, master);
    noise.connect(bp); bp.connect(wind); wind.connect(windOut);
    noise.start();
    lfo(0.03, 0.04, wind.gain);
    lfo(0.05, 180, bp.frequency);
    if (windOut.pan) lfo(0.02, 0.6, windOut.pan);

    // twinkles and signals go through a long echo, like they come from far away
    var delay = ctx.createDelay(2), fb = ctx.createGain(), wet = ctx.createGain(), chimes = ctx.createGain();
    delay.delayTime.value = 0.45; fb.gain.value = 0.45; wet.gain.value = 0.5; chimes.gain.value = 0.6;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
    chimes.connect(master); chimes.connect(delay);

    // radio band: signals sound thin, like they come through a transmitter
    var radio = ctx.createBiquadFilter();
    radio.type = 'bandpass'; radio.frequency.value = 1800; radio.Q.value = 1.2;
    radio.connect(chimes);

    var nodes = { ctx: ctx, master: master, chimes: chimes, radio: radio, pad: lp, voices: [] };
    playChord(nodes, amb.chord, 0.05);
    return nodes;
  }

  // fade in a fresh set of voices for chord idx while the old set fades out
  function playChord(nodes, idx, fade) {
    var c = nodes.ctx, now = c.currentTime;
    nodes.voices.forEach(function (v) {
      v.g.gain.cancelScheduledValues(now);
      v.g.gain.setValueAtTime(v.g.gain.value, now);
      v.g.gain.linearRampToValueAtTime(0, now + fade);
      v.o.stop(now + fade + 0.1);
    });
    nodes.voices = CHORDS[idx].notes.map(function (f, k) {
      var o = c.createOscillator(), g = c.createGain(), voice = VOICES[k];
      o.type = voice.type; o.frequency.value = f; o.detune.value = voice.detune;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(voice.level, now + fade);
      o.connect(g); g.connect(nodes.pad); o.start(now);
      return { o: o, g: g };
    });
  }

  function nextChord() {
    clearTimeout(amb.chordTimer);
    if (!amb.on || !amb.nodes) return;
    amb.chord = (amb.chord + 1) % CHORDS.length;
    playChord(amb.nodes, amb.chord, CHORD_FADE);
    amb.chordTimer = setTimeout(nextChord, CHORD_SECS * 1000);
  }

  // one music-box note: a pure tone plus a quicker-fading overtone
  function bell(f, at, pan) {
    var c = amb.nodes.ctx, out = panTo(c, pan, amb.nodes.chimes);
    [[1, 0.06, 2.6], [2, 0.02, 0.8]].forEach(function (h) {
      var o = c.createOscillator(), g = c.createGain();
      o.frequency.value = f * h[0];
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(h[1], at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + h[2]);
      o.connect(g); g.connect(out);
      o.start(at); o.stop(at + h[2] + 0.1);
    });
  }

  // a single twinkle, or now and then a little run of 2-3 rising notes
  function chime() {
    clearTimeout(amb.chimeTimer);
    if (!amb.on || !amb.nodes) return;
    var now = amb.nodes.ctx.currentTime, notes = CHORDS[amb.chord].chimes, pan = Math.random() * 1.2 - 0.6;
    if (Math.random() < 0.35) {
      var start = Math.floor(Math.random() * (notes.length - 1)), n = Math.min(notes.length - start, 2 + Math.floor(Math.random() * 2));
      for (var k = 0; k < n; k++) bell(notes[start + k], now + k * 0.18, pan);
    } else {
      bell(randomPick(notes), now, pan);
    }
    amb.chimeTimer = setTimeout(chime, 1500 + Math.random() * 2500);
  }

  // short blip for the radio beeps
  function blip(f, at, len, vol, out) {
    var c = amb.nodes.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.005);
    g.gain.setValueAtTime(vol, at + len - 0.01);
    g.gain.linearRampToValueAtTime(0, at + len);
    o.connect(g); g.connect(out);
    o.start(at); o.stop(at + len + 0.02);
  }

  // a far-off spacecraft signal: radio beeps most of the time, sometimes a sonar ping
  function signal() {
    clearTimeout(amb.signalTimer);
    if (!amb.on || !amb.nodes) return;
    var c = amb.nodes.ctx, now = c.currentTime, pan = Math.random() * 1.6 - 0.8;
    if (Math.random() < 0.7) {
      var out = panTo(c, pan, amb.nodes.radio), f = randomPick([1318.51, 1760, 2217.46]);
      var n = 2 + Math.floor(Math.random() * 3), alt = Math.random() < 0.5;
      for (var k = 0; k < n; k++) blip(alt && k % 2 ? f * 0.75 : f, now + k * 0.16, 0.07, 0.03, out);
    } else {
      var o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(1760, now);
      o.frequency.exponentialRampToValueAtTime(1700, now + 1.5);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.05, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
      o.connect(g); g.connect(panTo(c, pan, amb.nodes.chimes));
      o.start(now); o.stop(now + 2.3);
    }
    amb.signalTimer = setTimeout(signal, 8000 + Math.random() * 10000);
  }

  function fadeAmbient(to, secs) {
    var c = amb.nodes.ctx, gain = amb.nodes.master.gain, now = c.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(to, now + secs);
  }

  // narration counts as busy while it's loading too, so the two never overlap
  function narrationBusy() { return ab.playing || (narrator && !narrator.paused); }
  function ambientWanted() { return amb.enabled && amb.unlocked && !document.hidden && !narrationBusy() && !introOn; }

  function ambientRefresh() {
    if (!amb.nodes) return;
    var want = ambientWanted();
    if (!want) {
      clearTimeout(amb.waitTimer); amb.waitTimer = 0;
      if (!amb.on) return;
      amb.on = false;
      clearTimeout(amb.chimeTimer);
      clearTimeout(amb.chordTimer);
      clearTimeout(amb.signalTimer);
      fadeAmbient(0, narrationBusy() ? 0.5 : 0.8);
      setTimeout(function () { if (!amb.on && amb.nodes.ctx.state === 'running') amb.nodes.ctx.suspend(); }, 1000);
      return;
    }
    if (amb.on || amb.waitTimer) return;
    // wait a moment: between audiobook parts the narrator pauses only briefly
    amb.waitTimer = setTimeout(function () {
      amb.waitTimer = 0;
      if (!ambientWanted() || amb.on) return;
      amb.on = true;
      amb.nodes.ctx.resume();
      fadeAmbient(AMB_VOL, 2.5);
      amb.chimeTimer = setTimeout(chime, 1500);
      amb.chordTimer = setTimeout(nextChord, CHORD_SECS * 1000);
      amb.signalTimer = setTimeout(signal, 4000);
    }, 1200);
  }

  function soundButton() {
    var b = document.querySelector('.sound-toggle');
    if (!b) return;
    var label = t(amb.enabled ? 'soundOn' : 'soundOff');
    b.innerHTML = amb.enabled ? SOUND_ICONS.on : SOUND_ICONS.off;
    b.setAttribute('aria-pressed', String(amb.enabled));
    b.setAttribute('aria-label', label);
    b.title = label;
  }

  function initAmbient() {
    try { amb.enabled = localStorage.getItem(SOUND_KEY) !== 'off'; } catch (e) { /* keep default */ }
    var btn = document.querySelector('.sound-toggle');
    if (RECORD || !(window.AudioContext || window.webkitAudioContext)) { if (btn) btn.hidden = true; return; }
    soundButton();

    // the first tap or key press unlocks sound (the context must be made inside it)
    function unlock() {
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('keydown', unlock, true);
      amb.unlocked = true;
      if (!amb.nodes) amb.nodes = buildAmbient();
      if (amb.nodes) amb.nodes.ctx.resume();
      ambientRefresh();
    }
    document.addEventListener('pointerdown', unlock, true);
    document.addEventListener('keydown', unlock, true);

    if (btn) btn.addEventListener('click', function () {
      amb.enabled = !amb.enabled;
      try { localStorage.setItem(SOUND_KEY, amb.enabled ? 'on' : 'off'); } catch (e) { /* ignore */ }
      soundButton();
      ambientRefresh();
    });
    document.addEventListener('visibilitychange', ambientRefresh);
  }

  /* ---------- Intro: the first step on the Moon ----------
     A short full-screen film before the home page, once per visit (add
     ?intro to the address to see it every time, ?intro=12 to start 12 s in).
     It opens on a quiet "Press start" screen among the stars: browsers only
     allow sound after a click. Then black bars slide in like a film, the
     camera drifts down from the stars to Eagle on the Moon, Armstrong climbs
     down, pauses, takes the first step, walks out, plants the flag and
     salutes; the camera rises back to the stars for his words, and the film
     fades into the home page. Skip button or Esc ends it at any time.
     Sound is made live with Web Audio, like the ambient sound.
     The picture is pixel art at the 128 px scale, stretched to fill the
     screen: the Eagle sprite in the middle, with matching sky and ground
     (js/sprites.js backdrop) around it for any screen shape.               */

  var INTRO_KEY = 'abnf-intro';
  var SKY = 150;                   // extra sky above the scene for the camera moves
  var introOn = false;             // keeps the ambient sound quiet meanwhile

  // the film, in seconds after Start
  var TL = {
    revealFrom: 1, revealTo: 4.5,        // camera drifts down from the stars
    capFrom: 3.5, capTo: 8,              // date and place
    climbFrom: 5, climbTo: 7.8,          // down the ladder
    stepFrom: 8.2, stepTo: 8.6,          // the first step (lands at stepTo)
    walkFrom: 9, walkTo: 11.8,
    plant: 12, unrollFrom: 12.4, unrollTo: 13.2, salute: 13.3,
    riseFrom: 14.8, riseTo: 18.3,        // camera rises back to the stars
    // Armstrong's words keep their slow pace: about 10 s from first line to the end
    quote1: 17.8, quote2: 19.9, who: 21.9,
    fadeFrom: 26.3, end: 27.9
  };

  function shouldIntro() {
    // also skipped when the page opens in a background tab (it would play unseen)
    if (REDUCED || !SPRITES || !SPRITES.backdrop || document.hidden) return false;
    if (/[?&]intro\b/.test(location.search)) return true;
    if (parseRoute().name !== 'home') return false;     // a shared link to a book goes straight there
    try { return !sessionStorage.getItem(INTRO_KEY); } catch (e) { return true; }
  }

  // astronaut, 7 x 12 px, facing right. W suit, S suit shade, V gold visor,
  // K backpack / back of the suit, B boots
  var ASTRO = {
    stand:  ['..WWW..', '.WWWWS.', '.KWVVVS', '.KWWWWS', 'KKWWWWS', 'KKWWWWW', 'KKWWWWS', '.WWWWS.', '.WW.WS.', '.WW.WS.', '.WS..S.', '.BB.BB.'],
    walk:   ['..WWW..', '.WWWWS.', '.KWVVVS', '.KWWWWS', 'KKWWWWS', 'KKWWWWW', 'KKWWWWS', '.WWWWS.', '.WWWS..', 'WW..WS.', 'W....WS', 'BB...BB'],
    climbA: ['..WWW..', '.WWWWW.', '.SWWWS.', 'WKKKKKW', '.KKKKK.', '.KKKKK.', '.WWWWW.', '.WWWWS.', '.WW.WS.', '.WW.WS.', '.WS..S.', '.BB.BB.'],
    climbB: ['..WWW..', '.WWWWW.', '.SWWWS.', '.KKKKK.', 'WKKKKKW', '.KKKKK.', '.WWWWW.', '.WWWWS.', '.WW.WS.', '.WW.WS.', '.WS..S.', '.BB.BB.'],
    salute: ['..WWWW.', '.WWWWSW', '.KWVVVW', '.KWWWW.', 'KKWWWS.', 'KKWWWS.', 'KKWWWWS', '.WWWWS.', '.WW.WS.', '.WW.WS.', '.WS..S.', '.BB.BB.']
  };
  var ASTRO_C = { W: '#f2f4f8', S: '#aab2c4', V: '#e5a426', K: '#727b92', B: '#41475c' };

  function drawAstro(ctx, cx, feet, pose) {
    var rows = ASTRO[pose], x0 = Math.round(cx) - 3, y0 = Math.round(feet) - rows.length;
    // a 1 px dark outline first, like the rest of the pixel art
    ctx.fillStyle = '#0a0b16';
    rows.forEach(function (r, y) {
      for (var x = 0; x < r.length; x++) if (r[x] !== '.') {
        ctx.fillRect(x0 + x - 1, y0 + y, 3, 1); ctx.fillRect(x0 + x, y0 + y - 1, 1, 3);
      }
    });
    rows.forEach(function (r, y) {
      for (var x = 0; x < r.length; x++) if (r[x] !== '.') { ctx.fillStyle = ASTRO_C[r[x]]; ctx.fillRect(x0 + x, y0 + y, 1, 1); }
    });
  }

  function ease(p) { p = Math.max(0, Math.min(1, p)); return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function smooth(p) { p = Math.max(0, Math.min(1, p)); return p * p * (3 - 2 * p); }
  function span(t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); }

  // places in the 128 x 128 Eagle scene (pixels)
  var WALK_X0 = 71, WALK_X1 = 100, WALK_F0 = 108, WALK_F1 = 113, PRINTS = 9;
  var FLAG_X = 110, FLAG_TOP = 84, FLAG_BASE = 116, FLAG_W = 16, FLAG_H = 9;

  /* ---- sound ---- */
  function introSounds() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;    // always on otherwise: the visitor chose Start
    var c = new AC(), out = c.createGain();
    out.gain.value = 0.9;
    out.connect(c.destination);
    var noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate), nd = noiseBuf.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    function env(g, at, vol, attack, dur) {
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(vol, at + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    }
    function tone(f, at, dur, type, vol, fEnd, dest) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f, at);
      if (fEnd) o.frequency.exponentialRampToValueAtTime(fEnd, at + dur);
      env(g, at, vol, 0.005, dur);
      o.connect(g); g.connect(dest || out);
      o.start(at); o.stop(at + dur + 0.05);
    }
    function noise(at, dur, vol, type, f, fEnd, attack) {
      var src = c.createBufferSource(), flt = c.createBiquadFilter(), g = c.createGain();
      src.buffer = noiseBuf;
      flt.type = type; flt.frequency.setValueAtTime(f, at);
      if (fEnd) flt.frequency.exponentialRampToValueAtTime(fEnd, at + dur);
      env(g, at, vol, attack || 0.005, dur);
      src.connect(flt); flt.connect(g); g.connect(out);
      src.start(at); src.stop(at + dur + 0.05);
    }
    // a held chord that fades in and out (the film's music bed)
    function pad(freqs, at, to, vol, rise) {
      freqs.forEach(function (f, n) {
        var o = c.createOscillator(), g = c.createGain();
        o.frequency.value = f; o.detune.value = n % 2 ? 5 : -5;
        g.gain.setValueAtTime(0, at);
        g.gain.linearRampToValueAtTime(vol, at + rise);
        g.gain.setValueAtTime(vol, Math.max(at + rise, to - 2.5));
        g.gain.linearRampToValueAtTime(0, to);
        o.connect(g); g.connect(out); o.start(at); o.stop(to + 0.1);
      });
    }
    var chip = c.createBiquadFilter();       // softens the 8-bit square waves
    chip.type = 'lowpass'; chip.frequency.value = 3500;
    chip.connect(out);

    var fx = {
      // Apollo's "Quindar" radio beep
      beep: function (at) {
        var o = c.createOscillator(), g = c.createGain();
        o.frequency.value = 2525;
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.06, at + 0.01);
        g.gain.setValueAtTime(0.06, at + 0.23); g.gain.linearRampToValueAtTime(0, at + 0.25);
        o.connect(g); g.connect(out); o.start(at); o.stop(at + 0.3);
      },
      // low, slow music under the reveal; a warm chord under the quote
      opening: function (at) { pad([55, 82.41, 110, 164.81], at, at + 12, 0.035, 4); },
      closing: function (at) { pad([220, 277.18, 329.63, 440], at, at + (TL.end - TL.riseFrom), 0.028, 3); },
      clink: function (at) { tone(1800, at, 0.14, 'triangle', 0.06); tone(2730, at, 0.09, 'sine', 0.025); },
      firstStep: function (at) { tone(120, at, 0.6, 'sine', 0.5, 38); noise(at, 0.22, 0.2, 'lowpass', 700, 140); },
      step: function (at) { tone(100, at, 0.2, 'sine', 0.15, 50); noise(at, 0.08, 0.06, 'lowpass', 500); },
      thunk: function (at) { tone(170, at, 0.3, 'sine', 0.3, 55); noise(at, 0.1, 0.14, 'bandpass', 900); },
      swoosh: function (at) { noise(at, 0.9, 0.09, 'bandpass', 500, 2600, 0.3); },
      // a short "level clear" tune: C E G C ... G C, with a bass line
      win: function (at) {
        [[523.25, 0, 0.12], [659.25, 0.12, 0.12], [783.99, 0.24, 0.12], [1046.5, 0.36, 0.28],
         [783.99, 0.68, 0.12], [1046.5, 0.82, 0.7]].forEach(function (n) {
          tone(n[0], at + n[1], n[2] + 0.08, 'square', 0.045, null, chip);
        });
        [[130.81, 0, 0.34], [196, 0.36, 0.4], [261.63, 0.82, 0.7]].forEach(function (n) {
          tone(n[0], at + n[1], n[2], 'triangle', 0.11, null, chip);
        });
      }
    };

    var climbStep = (TL.climbTo - TL.climbFrom) / 6;
    var events = [[0.6, 'beep'], [0.8, 'opening'], [TL.stepTo, 'firstStep'], [TL.plant, 'thunk'],
      [TL.unrollFrom, 'swoosh'], [TL.salute + 0.05, 'win'], [TL.riseFrom, 'closing'], [TL.fadeFrom - 0.6, 'beep']];
    for (var k = 0; k < 6; k++) events.push([TL.climbFrom + (k + 0.5) * climbStep, 'clink']);
    for (var p = 0; p < PRINTS; p++) events.push([TL.walkFrom + p * (TL.walkTo - TL.walkFrom) / PRINTS, 'step']);

    return {
      // schedule everything from film time s0 (seconds) on, starting now
      play: function (s0) {
        var t0 = c.currentTime + 0.05;
        events.forEach(function (e) { if (e[0] >= s0) fx[e[1]](t0 + e[0] - s0); });
      },
      stop: function (secs) {
        var now = c.currentTime;
        out.gain.cancelScheduledValues(now);
        out.gain.setValueAtTime(out.gain.value, now);
        out.gain.linearRampToValueAtTime(0, now + (secs || 0.3));
        setTimeout(function () { try { c.close(); } catch (e) { /* ignore */ } }, (secs || 0.3) * 1000 + 200);
      }
    };
  }

  function playIntro() {
    try { sessionStorage.setItem(INTRO_KEY, '1'); } catch (e) { /* ignore */ }
    introOn = true;
    ambientRefresh();
    var quoteParts = t('introQuote').split(/,\s*/);
    var el = document.createElement('div');
    el.className = 'moon-intro title';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', t('introLabel'));
    el.innerHTML =
      '<canvas class="mi-scene" aria-hidden="true"></canvas>' +
      '<div class="mi-bar mi-bar-top"></div>' +
      '<div class="mi-bar mi-bar-bottom"><p class="mi-cap">' + esc(t('introDate')) + ' &nbsp;·&nbsp; ' + esc(t('introPlace')) + '</p></div>' +
      '<blockquote class="mi-quote">' +
        '<p><span class="mi-q1">' + esc(quoteParts[0] + (quoteParts.length > 1 ? ',' : '')) + '</span>' +
        '<span class="mi-q2">' + esc(quoteParts.slice(1).join(', ')) + '</span></p>' +
        '<footer class="mi-who">' + esc(t('introWho')) + '</footer>' +
      '</blockquote>' +
      '<div class="mi-start-wrap">' +
        '<p class="mi-hint">' + esc(t('introSoundHint')) + '</p>' +
        '<button type="button" class="mi-start">&#9654; ' + esc(t('introStart')) + '</button>' +
      '</div>' +
      '<button type="button" class="btn btn-small btn-ghost mi-skip">' + esc(t('introSkip')) + '</button>';
    document.body.appendChild(el);
    document.body.classList.add('moon-intro-open');
    var cv = el.querySelector('canvas'), ctx = cv.getContext('2d');
    var startBtn = el.querySelector('.mi-start');
    var parts = { cap: el.querySelector('.mi-cap'), q1: el.querySelector('.mi-q1'), q2: el.querySelector('.mi-q2'), who: el.querySelector('.mi-who') };

    // ---- the world: sky and ground around the Eagle scene, sized to the screen ----
    var W = 0, H = 0, ox = 0, top = 0, world = [], twinkles = [];
    var sprite = [];
    for (var f = 0; f < SPRITES.FRAMES; f++) {
      var sc = document.createElement('canvas');
      SPRITES.draw(sc, 'eagle', f, 'noflag', 128);
      sprite.push(sc);
    }
    function build() {
      var vw = window.innerWidth, vh = Math.max(1, window.innerHeight), aspect = vw / vh;
      // a strip of ground below the scene, as tall as the bottom film bar
      // (same size as in the CSS) so the bar never covers Armstrong's feet
      var bar = Math.min(120, Math.max(44, vh * 0.11));
      var below = Math.max(16, Math.ceil(bar * 128 / Math.max(1, vh - bar)) + 4);
      // wide screens: the scene plus that strip, as tall as the screen;
      // tall phone screens: 128 px wide, with more sky above
      if (aspect >= 128 / (128 + below)) { H = 128 + below; W = Math.round(H * aspect / 2) * 2; }
      else { W = 128; H = Math.round(128 / aspect / 2) * 2; }
      ox = Math.floor((W - 128) / 2);
      top = SKY + H - 128 - below;
      cv.width = W; cv.height = H;
      ctx.imageSmoothingEnabled = false;
      var bg = SPRITES.backdrop(W, SKY + H, top, 23);
      // the Eagle scene's left and right edges dissolve into the wider sky and
      // ground through the same dither pattern, so there is no visible seam
      var E = 16;
      world = sprite.map(function (src) {
        var m = document.createElement('canvas');
        m.width = 128; m.height = 128;
        var mc = m.getContext('2d');
        mc.drawImage(src, 0, 0);
        if (W > 128) {
          var img = mc.getImageData(0, 0, 128, 128), d = img.data;
          for (var y = 0; y < 128; y++) for (var x = 0; x < 128; x++) {
            var edge = Math.min(x, 127 - x);
            if (edge < E && SPRITES.bayer(x + ox, y + top) > (edge + 0.5) / E) d[(y * 128 + x) * 4 + 3] = 0;
          }
          mc.putImageData(img, 0, 0);
        }
        var w = document.createElement('canvas');
        w.width = W; w.height = SKY + H;
        var wc = w.getContext('2d');
        wc.drawImage(bg, 0, 0);
        wc.drawImage(m, ox, top);
        return w;
      });
      var r = rng(31);
      twinkles = [];
      for (var i = 0; i < Math.round(W * 0.25); i++) twinkles.push({ x: Math.floor(r() * W), y: Math.floor(r() * (top + 60)), p: r() * 6 });
    }
    build();

    // ?intro=12 starts 12 s into the film (handy for checking one moment)
    var from = /[?&]intro=(\d+(?:\.\d+)?)/.exec(location.search), s0 = from ? +from[1] : 0;
    var start = 0, timer = 0, safety = 0, started = false, ended = false, sound = null, born = performance.now();

    // camera: 0 = up in the stars, SKY = looking at Eagle
    function camAt(s) {
      if (!started) return 0;
      if (s < TL.riseFrom) return SKY * ease(span(s, TL.revealFrom, TL.revealTo));
      return SKY * (1 - ease(span(s, TL.riseFrom, TL.riseTo)));
    }

    function draw(s) {
      var tw = (performance.now() - born) / 1000;
      var cam = Math.round(camAt(s));
      var shake = started && s > TL.stepTo && s < TL.stepTo + 0.35 ? (Math.floor(s * 40) % 2 ? 1 : -1) : 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(world[Math.floor(tw * 2) % world.length], 0, -cam + shake);
      ctx.translate(0, -cam + shake);
      twinkles.forEach(function (st) {
        var v = Math.sin(tw * 1.7 + st.p);
        if (v > 0.6) { ctx.fillStyle = v > 0.93 ? '#ffffff' : '#c9d4ff'; ctx.fillRect(st.x, st.y, 1, 1); }
      });
      ctx.translate(ox, top);    // from here on: Eagle scene coordinates
      if (!started) return;

      // Armstrong
      var x, feet, pose, carrying = false;
      if (s < TL.climbFrom) { x = 64; feet = 82; pose = 'stand'; }
      else if (s < TL.climbTo) {
        x = 64; feet = 82 + 19 * span(s, TL.climbFrom, TL.climbTo);
        pose = Math.floor(s * 2.6) % 2 ? 'climbA' : 'climbB';
      } else if (s < TL.stepFrom) { x = 64; feet = 101; pose = 'stand'; }       // a pause on the footpad
      else if (s < TL.stepTo) {                                                // the small step
        var h = smooth(span(s, TL.stepFrom, TL.stepTo));
        x = 64 + (WALK_X0 - 64) * h; feet = 101 + (WALK_F0 - 101) * h - Math.sin(Math.PI * h) * 4; pose = 'walk';
      } else if (s < TL.walkFrom) { x = WALK_X0; feet = WALK_F0; pose = 'stand'; }
      else if (s < TL.walkTo) {
        var w = span(s, TL.walkFrom, TL.walkTo);
        x = WALK_X0 + (WALK_X1 - WALK_X0) * w; feet = WALK_F0 + (WALK_F1 - WALK_F0) * w;
        pose = Math.floor(s * 4.5) % 2 ? 'walk' : 'stand'; carrying = true;
      } else { x = WALK_X1; feet = WALK_F1; pose = s > TL.salute ? 'salute' : 'stand'; }

      // footprints: the first one where he lands, then one per step
      if (s >= TL.stepTo) {
        var n = 1 + (s >= TL.walkFrom ? Math.min(PRINTS - 1, Math.floor(span(s, TL.walkFrom, TL.walkTo) * PRINTS)) : 0);
        ctx.fillStyle = '#726d61';
        for (var k = 0; k < n; k++) {
          var pw = k / PRINTS;
          ctx.fillRect(Math.round(WALK_X0 + (WALK_X1 - WALK_X0) * pw) - 1, Math.round(WALK_F0 + (WALK_F1 - WALK_F0) * pw) + (k % 2 ? 1 : -1), 3, 1);
        }
      }

      // the flag: carried, pushed into the ground, then unrolled
      if (carrying) {
        ctx.fillStyle = '#0a0b16';
        ctx.fillRect(Math.round(x) + 4, Math.round(feet) - 27, 3, 26);
        ctx.fillStyle = '#dfe3ec';
        ctx.fillRect(Math.round(x) + 5, Math.round(feet) - 26, 1, 24);
      } else if (s >= TL.walkTo) {
        var sink = Math.round(5 * (1 - span(s, TL.plant, TL.plant + 0.4)));
        ctx.fillStyle = '#0a0b16';
        ctx.fillRect(FLAG_X - 1, FLAG_TOP - 1 - sink, 3, FLAG_BASE - FLAG_TOP + 2);
        ctx.fillStyle = '#dfe3ec';
        ctx.fillRect(FLAG_X, FLAG_TOP - sink, 1, FLAG_BASE - FLAG_TOP);
        var cols = Math.round(FLAG_W * smooth(span(s, TL.unrollFrom, TL.unrollTo)));
        if (cols > 0) {
          ctx.fillStyle = '#0a0b16';
          ctx.fillRect(FLAG_X, FLAG_TOP - 1 - sink, cols + 2, FLAG_H + 3);
          ctx.fillStyle = '#dfe3ec';
          ctx.fillRect(FLAG_X, FLAG_TOP - sink, cols + 1, 1);              // the top bar holding it out
          SPRITES.flag(ctx, FLAG_X + 1, FLAG_TOP + 1 - sink, FLAG_W, cols, FLAG_H);
        }
      }
      drawAstro(ctx, x, feet, pose);
    }

    function frame() {
      if (!started) { draw(0); return; }
      var s = (performance.now() - start) / 1000;
      draw(s);
      parts.cap.classList.toggle('show', s > TL.capFrom && s < TL.capTo);
      parts.q1.classList.toggle('show', s > TL.quote1 && s < TL.fadeFrom);
      parts.q2.classList.toggle('show', s > TL.quote2 && s < TL.fadeFrom);
      parts.who.classList.toggle('show', s > TL.who && s < TL.fadeFrom);
      el.classList.toggle('cinema', s < TL.fadeFrom);
      el.classList.toggle('dark', s < 0.9 || s > TL.fadeFrom);   // a beat of black at the start, a fade to black at the end
      if (s >= TL.end) finish(true);
    }

    function begin() {
      if (started || ended) return;
      started = true;
      el.classList.remove('title');
      el.classList.add('cinema');
      el.querySelector('.mi-skip').focus();
      try { sound = introSounds(); } catch (e) { sound = null; }
      if (sound) sound.play(s0);
      start = performance.now() - s0 * 1000;
      frame();
      // whatever happens, never keep visitors from the site for long
      safety = setTimeout(function () { finish(true); }, (TL.end - s0 + 2) * 1000);
    }

    // natural: the film reached its end (already faded to black)
    function finish(natural) {
      if (ended) return;
      ended = true;
      clearInterval(timer); clearTimeout(safety);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKey);
      if (sound) sound.stop(natural ? 0.3 : 0.6);
      el.classList.add('out');
      setTimeout(function () {
        el.remove();
        document.body.classList.remove('moon-intro-open');
        introOn = false;
        ambientRefresh();
        app.focus({ preventScroll: true });
      }, 900);
    }
    function onKey(e) { if (e.key === 'Escape') finish(false); }
    var resizeT = 0;
    function onResize() { clearTimeout(resizeT); resizeT = setTimeout(function () { build(); frame(); }, 150); }

    startBtn.addEventListener('click', begin);
    el.querySelector('.mi-skip').addEventListener('click', function () { finish(false); });
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    // a plain 30 fps timer, not requestAnimationFrame: some embedded views
    // pause animation frames, which would leave the intro stuck
    frame();
    timer = setInterval(frame, 33);
    setTimeout(function () { el.classList.add('on'); startBtn.focus({ preventScroll: true }); }, 30);
  }

  /* ---------- init ---------- */

  function init() {
    state.lang = initialLang();
    applyStatic();
    drawStars();
    makeTwinkles();
    hydrateArt(document.querySelector('.sky'));
    startAnimation();
    document.querySelectorAll('.lang-toggle button').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
    });
    var resizeTimer;
    window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawStars, 150); });
    window.addEventListener('hashchange', function () { render(true); window.scrollTo(0, 0); app.focus({ preventScroll: true }); });
    startMeteors();
    initAmbient();
    render(true);
    if (shouldIntro()) playIntro();
  }

  init();
})();
