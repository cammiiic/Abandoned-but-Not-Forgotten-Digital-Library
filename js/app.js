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
    if (SPRITES && SPRITES.has(id)) { SPRITES.draw(c, id, frame); return; }
    if (c.hasAttribute('data-orb')) { drawOrb(c, c.getAttribute('data-orb')); return; }
    var b = getBook(id);
    if (b) drawArt(c, b.art);
  }

  function hydrateArt(root) {
    root.querySelectorAll('canvas[data-art], canvas[data-orb]').forEach(drawCanvas);
  }

  // idle animation: blinking beacons, twinkling stars, the GRAIL link
  function startAnimation() {
    if (REDUCED || !SPRITES) return;
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
    return (cbnCache[book.id] = d);
  }

  // pale version of a crayon color, used to show which squares match it
  function tint(hex) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (r * 0.3 + g * 0.59 + b * 0.11 > 215) return '#cfe3ff';   // white crayon: a cool blue hint instead
    function m(c) { return Math.round(c * 0.35 + 255 * 0.65); }
    return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')';
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
            : k === s.sel ? hl : '#fffaf0';
          ctx.fillRect(px, py, pw, ph);
          if (!open) continue;
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
    var ptrs = {}, gesture = null, last = null, pinch = null, space = false;
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
        gesture = (s.mode === 'move' || space || e.button === 1 || e.button === 2) ? 'pan' : 'paint';
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
      } else if (gesture === 'pan') {
        s.view.ox += p.x - last.x; s.view.oy += p.y - last.y; last = p;
        clampView(); draw();
      } else if (gesture === 'paint') {
        paintLine(last.x, last.y, p.x, p.y); last = p; afterPaint();
      }
    });
    function lift(e) {
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
      body.innerHTML =
        '<div class="quiz-score" role="status">' +
          '<div class="score-stars" aria-hidden="true">' +
            qs.items.map(function (it) { return '<span class="' + (it.pick === book.quiz[it.q].correct ? 'on' : '') + '"></span>'; }).join('') +
          '</div>' +
          '<p class="score-big">' + esc(t('score', { s: score, t: total })) + '</p>' +
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
    startAnimation();
    document.querySelectorAll('.lang-toggle button').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
    });
    var resizeTimer;
    window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawStars, 150); });
    window.addEventListener('hashchange', function () { render(true); window.scrollTo(0, 0); app.focus({ preventScroll: true }); });
    startMeteors();
    render(true);
  }

  init();
})();
