/* =====================================================================
   Pixel-art sprites, drawn in code on a true pixel grid.

   - Every scene is 64 x 64 pixels; the sky bodies are 32 x 32.
   - One fixed palette (P) keeps the whole site consistent.
   - Gradients use ordered (Bayer) dithering, like hand-made pixel art.
   - Each sprite has 4 animation frames (blinking lights, twinkling stars,
     the GRAIL laser link). Frames are rendered once and cached.

   Public API: window.ABNF_SPRITES.has(id) / .draw(canvas, id, frame)
   ids: eagle, grail, viking1, opportunity, orb:sun, orb:moon, orb:mars
   ===================================================================== */

(function () {
  'use strict';

  /* ---------- palette ---------- */
  var P = {
    ink: '#0a0b16',
    sp0: '#060a1c', sp1: '#0c1330', sp2: '#151f47', sp3: '#22305f',
    st0: '#ffffff', st1: '#c9d4ff', st2: '#6c7cb6',
    g0: '#fff4b0', g1: '#ffd23f', g2: '#e5a426', g3: '#a8660f', g4: '#5c360a',
    s0: '#ffffff', s1: '#dfe3ec', s2: '#aab2c4', s3: '#727b92', s4: '#41475c', s5: '#23263a',
    m0: '#ece8dc', m1: '#c6c1b3', m2: '#9e998a', m3: '#726d61', m4: '#4a463d', m5: '#2c2a25',
    r0: '#f7c49a', r1: '#e3854e', r2: '#c15d2c', r3: '#8f3b19', r4: '#5c220e', r5: '#341308',
    k0: '#f4d6b0', k1: '#e2b588', k2: '#c99068', k3: '#a06a4e',
    b0: '#a8d6ff', b1: '#4f8fe8', b2: '#2c58b2', b3: '#183372', b4: '#0d1c44',
    e0: '#8cc4ff', e1: '#3d7be0', e2: '#1f4aa0', eg: '#58b865', eg2: '#2f7a3c',
    red: '#ff4a3d', red2: '#9c1c14', cyan: '#8ff6ff', cyan2: '#3fb7d6'
  };

  /* ---------- tiny raster engine ---------- */

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function bayer(x, y) { return (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16; }

  // dithered gradient: t in 0..1 across colors
  function grad(colors, t, x, y) {
    t = Math.max(0, Math.min(1, t));
    var f = t * (colors.length - 1), i = Math.floor(f), r = f - i;
    if (i >= colors.length - 1) return colors[colors.length - 1];
    // keep flat color clusters; dither only a narrow band between shades
    r = Math.max(0, Math.min(1, (r - 0.5) * 2.6 + 0.5));
    return r > bayer(x, y) ? colors[i + 1] : colors[i];
  }

  function S(w, h) { this.w = w; this.h = h; this.p = new Array(w * h).fill(null); }
  S.prototype.set = function (x, y, c) {
    x = Math.floor(x); y = Math.floor(y);
    if (!c || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.p[y * this.w + x] = c;
  };
  S.prototype.get = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.p[y * this.w + x];
  };
  function col(c, x, y) { return typeof c === 'function' ? c(x, y) : c; }
  S.prototype.rect = function (x, y, w, h, c) {
    for (var j = y; j < y + h; j++) for (var i = x; i < x + w; i++) this.set(i, j, col(c, i, j));
    return this;
  };
  S.prototype.line = function (x0, y0, x1, y1, c) {
    var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, err = dx + dy;
    for (;;) {
      this.set(x0, y0, col(c, x0, y0));
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  };
  S.prototype.ellipse = function (cx, cy, rx, ry, c) {
    for (var y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) {
      for (var x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
        var a = (x + 0.5 - cx) / rx, b = (y + 0.5 - cy) / ry;
        if (a * a + b * b <= 1) this.set(x, y, col(c, x, y));
      }
    }
    return this;
  };
  S.prototype.poly = function (pts, c) {
    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    pts.forEach(function (p) { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
    for (var y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      for (var x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
        var px = x + 0.5, py = y + 0.5, inside = false;
        for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
          if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
        }
        if (inside) this.set(x, y, col(c, x, y));
      }
    }
    return this;
  };
  // 1px outline around everything drawn on this layer
  S.prototype.outline = function (c) {
    var add = [];
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) {
      if (this.get(x, y)) continue;
      if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push(x, y);
    }
    for (var i = 0; i < add.length; i += 2) this.set(add[i], add[i + 1], c);
    return this;
  };
  S.prototype.over = function (o) {
    for (var i = 0; i < o.p.length; i++) if (o.p[i]) this.p[i] = o.p[i];
    return this;
  };

  var rgbCache = {};
  function rgb(hex) {
    if (!rgbCache[hex]) rgbCache[hex] = [parseInt(hex.substr(1, 2), 16), parseInt(hex.substr(3, 2), 16), parseInt(hex.substr(5, 2), 16)];
    return rgbCache[hex];
  }
  S.prototype.toCanvas = function () {
    var c = document.createElement('canvas');
    c.width = this.w; c.height = this.h;
    var ctx = c.getContext('2d'), img = ctx.createImageData(this.w, this.h);
    for (var i = 0; i < this.p.length; i++) {
      if (!this.p[i]) continue;
      var v = rgb(this.p[i]);
      img.data[i * 4] = v[0]; img.data[i * 4 + 1] = v[1]; img.data[i * 4 + 2] = v[2]; img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c;
  };

  /* ---------- building blocks ---------- */

  var LIGHT = (function () { var x = -0.55, y = -0.6, z = 0.58, l = Math.sqrt(x * x + y * y + z * z); return [x / l, y / l, z / l]; })();

  // shaded ball; o.shade(nx, ny, t, x, y) may return a new t or a color
  function sphere(s, cx, cy, r, ramp, o) {
    o = o || {};
    for (var y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (var x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        var nx = (x + 0.5 - cx) / r, ny = (y + 0.5 - cy) / r, d2 = nx * nx + ny * ny;
        if (d2 > 1) continue;
        var nz = Math.sqrt(1 - d2), lit = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
        var t = 1 - (lit + 0.25) / 1.25;
        if (o.shade) t = o.shade(nx, ny, t, x, y);
        s.set(x, y, typeof t === 'string' ? t : grad(ramp, t, x, y));
      }
    }
  }

  function craterShade(list) {
    return function (nx, ny, t) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i], dx = nx - c[0], dy = ny - c[1], d = Math.sqrt(dx * dx + dy * dy) / c[2];
        if (d < 1) return t + (dx + dy < 0 ? 0.32 : -0.08);
        if (d < 1.3 && dx + dy > 0) return t - 0.18;
      }
      return t;
    };
  }

  function stars(s, y0, y1, seed, density, frame) {
    var r = rng(seed), n = Math.round(s.w * (y1 - y0) * density);
    for (var i = 0; i < n; i++) {
      var x = Math.floor(r() * s.w), y = y0 + Math.floor(r() * (y1 - y0)), b = r(), tw = r();
      // a few stars dim on alternate frames
      if (tw < 0.25 && (frame + i) % 4 < 2) b *= 0.3;
      s.set(x, y, b > 0.85 ? P.st0 : b > 0.5 ? P.st1 : P.st2);
      if (b > 0.97) { s.set(x - 1, y, P.st2); s.set(x + 1, y, P.st2); s.set(x, y - 1, P.st2); s.set(x, y + 1, P.st2); }
    }
  }

  function spaceSky(s, y1) {
    s.rect(0, 0, s.w, y1, function (x, y) { return grad([P.sp0, P.sp1, P.sp2, P.sp3], y / y1, x, y); });
  }

  function marsSky(s, y1) {
    s.rect(0, 0, s.w, y1, function (x, y) { return grad([P.k3, P.k2, P.k1, P.k0], y / y1, x, y); });
  }

  function crater(s, cx, cy, rx, ry, ramp) {
    s.ellipse(cx + 0.4, cy + 0.5, rx + 0.9, ry + 0.7, ramp[0]);
    s.ellipse(cx, cy, rx, ry, function (x, y) { return (y + 0.5) < cy ? ramp[3] : ramp[2]; });
  }

  function rock(s, cx, cy, rx, ry, ramp) {
    s.ellipse(cx + rx * 0.7, cy + ry * 0.55, rx, ry * 0.55, ramp[3]);            // cast shadow
    s.ellipse(cx, cy, rx, ry, function (x, y) {
      var k = (x + 0.5 - cx) / rx + (y + 0.5 - cy) / ry * 1.4;
      return k < -0.5 ? ramp[0] : k > 0.6 ? ramp[2] : ramp[1];
    });
  }

  function moonGround(s, y0, seed) {
    var r = rng(seed), h = s.h - y0;
    s.rect(0, y0, s.w, h, function (x, y) { return grad([P.m0, P.m1, P.m1, P.m2], (y - y0) / h, x, y); });
    for (var i = 0; i < 90; i++) s.set(Math.floor(r() * s.w), y0 + 1 + Math.floor(r() * h), r() > 0.45 ? P.m2 : P.m0);
    for (var j = 0; j < 6; j++) {
      var cy = y0 + 3 + r() * (h - 4), depth = (cy - y0) / h, rx = 2 + depth * 6 * r() + 1.5;
      crater(s, Math.floor(r() * s.w), cy, rx, Math.max(1, rx * 0.32), [P.m0, P.m1, P.m3, P.m4]);
    }
  }

  function marsGround(s, y0, seed, rockCount) {
    var r = rng(seed), h = s.h - y0;
    // distant hills, hazy
    for (var x = 0; x < s.w; x++) {
      var top = y0 - Math.round(2 + 2 * Math.sin(x * 0.11 + seed) + 1.4 * Math.sin(x * 0.31 + seed * 2));
      for (var y = top; y < y0; y++) s.set(x, y, grad([P.k2, P.k3], (y - top) / 4, x, y));
    }
    s.rect(0, y0, s.w, h, function (x, y) { return grad([P.r1, P.r1, P.r2, P.r1], (y - y0) / h, x, y); });
    for (var i = 0; i < 140; i++) s.set(Math.floor(r() * s.w), y0 + 1 + Math.floor(r() * h), r() > 0.5 ? P.r2 : P.r0);
    for (var j = 0; j < (rockCount || 10); j++) {
      var cy = y0 + 2 + r() * (h - 3), depth = (cy - y0) / h, rx = 0.8 + depth * 3.2 * (0.4 + r());
      rock(s, Math.floor(r() * s.w), cy, rx, Math.max(0.8, rx * 0.65), [P.r0, P.r2, P.r3, P.r4]);
    }
  }

  // crinkled metal foil: short horizontal streaks, offset row to row
  function foil(ramp, seed, bias) {
    var r = rng(seed);
    var cache = {};
    return function (x, y) {
      var k = y + ',' + Math.floor((x + (y * 5) % 4) / 4);
      if (!cache[k]) cache[k] = r();
      var v = cache[k] * 0.85 + (bias ? bias(x, y) : 0);
      return v < 0.14 ? ramp[0] : v < 0.6 ? ramp[1] : v < 0.82 ? ramp[2] : ramp[3];
    };
  }

  function strut(s, x0, y0, x1, y1, light, dark) {
    s.line(x0, y0, x1, y1, light);
    s.line(x0 + 1, y0, x1 + 1, y1, dark);
  }

  /* ---------- Apollo 11: Eagle at Tranquility Base ---------- */

  function eagle(f) {
    var bg = new S(64, 64), fg = new S(64, 64), fx = new S(64, 64);
    spaceSky(bg, 50);
    stars(bg, 0, 46, 11, 0.03, f);
    // Earth hanging in the black sky
    sphere(bg, 11, 11, 6.5, [P.e0, P.e1, P.e2], {
      shade: function (nx, ny, t, x, y) {
        if (t > 0.74) return grad([P.e2, P.sp1], (t - 0.74) / 0.26, x, y);
        var land = Math.sin(nx * 5 + 1) * Math.cos(ny * 4 + 0.5) + 0.5 * Math.sin(nx * 9 - ny * 3) > 0.55;
        var cloud = Math.sin(ny * 11 + nx * 4) > 0.82;
        if (cloud) return t < 0.4 ? P.s0 : P.s2;
        if (land) return t < 0.4 ? P.eg : P.eg2;
        return t < 0.3 ? P.e0 : t < 0.58 ? P.e1 : P.e2;
      }
    });
    moonGround(bg, 50, 5);
    bg.ellipse(38, 52.5, 18, 2.2, P.m4);                         // the lander's shadow (Sun low on the left)
    [[38, 56], [40, 58], [35, 59], [42, 60], [37, 61], [44, 57]].forEach(function (p) { bg.set(p[0], p[1], P.m3); bg.set(p[0] + 1, p[1], P.m3); });

    // legs, footpads
    strut(fg, 21, 37, 10, 50, P.s2, P.s3);
    fg.line(21, 41, 13, 47, P.s3);
    strut(fg, 42, 37, 53, 50, P.s3, P.s4);
    fg.line(42, 41, 51, 47, P.s4);
    fg.ellipse(10.5, 51, 3.6, 1.3, function (x, y) { return y < 51 ? P.s1 : P.s3; });
    fg.ellipse(54, 51, 3.6, 1.3, function (x, y) { return y < 51 ? P.s2 : P.s4; });

    // descent engine bell
    fg.poly([[28, 40], [36, 40], [38, 46], [26, 46]], function (x, y) { return grad([P.s1, P.s2, P.s3, P.s4], (x - 26) / 12, x, y); });
    fg.rect(27, 45, 11, 1, P.s5);

    // descent stage: gold foil centre, black foil sides
    var gold = foil([P.g0, P.g1, P.g2, P.g3], 3, function (x) { return (x - 24) / 40; });
    var black = foil([P.s3, P.s4, P.s5, P.ink], 4);
    fg.rect(18, 29, 28, 12, gold);
    fg.rect(18, 29, 5, 12, black);
    fg.rect(41, 29, 5, 12, black);
    fg.rect(23, 29, 1, 12, P.g4); fg.rect(40, 29, 1, 12, P.g4);
    fg.rect(24, 34, 16, 1, P.g3);
    fg.rect(18, 29, 28, 1, P.g0);
    fg.rect(18, 40, 28, 1, P.g4);

    // porch and ladder on the front leg
    fg.rect(28, 41, 8, 1, P.s2);
    fg.rect(30, 42, 1, 9, P.s2); fg.rect(34, 42, 1, 9, P.s3);
    for (var ry = 43; ry <= 49; ry += 2) fg.rect(31, ry, 3, 1, P.s1);
    fg.ellipse(32.5, 51, 3, 1.2, function (x, y) { return y < 51 ? P.s1 : P.s3; });

    // ascent stage (the crew cabin): wide, angular facets lit from the left
    var hull = [P.s0, P.s1, P.s2, P.s3, P.s4];
    fg.poly([[16, 29], [48, 29], [49, 22], [45, 17], [38, 15], [26, 15], [19, 17], [15, 22]],
      function (x, y) { return grad(hull, (x - 15) / 34 + (y < 19 ? -0.2 : 0), x, y); });
    fg.rect(17, 26, 31, 3, function (x, y) { return grad([P.s2, P.s3, P.s4], (x - 17) / 31, x, y); });   // aft bay band
    fg.rect(17, 26, 31, 1, P.s4);
    fg.poly([[25, 18], [39, 18], [37, 26], [27, 26]], function (x, y) { return grad([P.s1, P.s2, P.s3], (x - 25) / 14, x, y); }); // front face
    fg.poly([[25, 18], [29, 18], [29, 21]], P.ink); fg.set(26, 18, P.b0);              // left window
    fg.poly([[35, 18], [39, 18], [35, 21]], P.ink); fg.set(36, 18, P.e1);              // right window
    fg.rect(30, 21, 4, 5, P.s3); fg.rect(31, 22, 2, 3, P.s4); fg.set(33, 23, P.s1);   // hatch
    fg.rect(29, 12, 6, 3, P.s2); fg.rect(29, 12, 6, 1, P.s1); fg.rect(31, 12, 2, 1, P.s4);  // docking tunnel
    fg.rect(41, 19, 5, 4, P.s3); fg.rect(41, 19, 5, 1, P.s2);                          // side equipment
    [[14, 21], [50, 21]].forEach(function (q) {                                          // thruster quads
      fg.rect(q[0] - 1, q[1], 3, 1, P.s3); fg.rect(q[0], q[1] - 1, 1, 3, P.s3); fg.set(q[0], q[1], P.s1);
    });

    // flag with its horizontal top bar (no wind on the Moon)
    fg.rect(55, 36, 1, 15, P.s1);
    fg.rect(55, 36, 8, 1, P.s1);
    fg.rect(56, 37, 7, 5, function (x, y) { return y % 2 ? P.s0 : P.red; });
    fg.rect(56, 37, 3, 3, P.b2); fg.set(57, 38, P.s0);

    fg.outline(P.ink);

    // thin details drawn without outline
    fx.line(25, 15, 24, 12, P.s2); fx.ellipse(23.5, 11, 2.2, 1.6, P.s1); fx.set(23, 11, P.s3);        // rendezvous radar
    fx.line(42, 16, 46, 11, P.s2); fx.ellipse(47.5, 9.5, 2.6, 1.8, function (x) { return x < 47 ? P.s1 : P.s3; }); fx.set(47, 9, P.s4); // S-band dish
    fx.line(20, 17, 17, 10, P.s2); fx.set(17, 9, P.s1);                                                // VHF antenna
    if (f < 2) { fx.set(32, 11, P.red); fx.set(31, 11, P.red2); }                                      // beacon

    return bg.over(fg).over(fx);
  }

  /* ---------- GRAIL: Ebb and Flow mapping the Moon's gravity ---------- */

  function probe(s, fx, cx, cy, f, seed) {
    // solar panels
    [-1, 1].forEach(function (side) {
      var x0 = side < 0 ? cx - 14 : cx + 6;
      s.rect(x0, cy - 2, 9, 5, function (x, y) {
        if (y === cy - 2) return side < 0 ? P.b0 : P.b1;
        if ((x - x0) % 3 === 0 || y === cy + 1) return P.b3;
        return side < 0 ? P.b1 : P.b2;
      });
      s.rect(side < 0 ? cx - 5 : cx + 4, cy, 2, 1, P.s3);
    });
    // gold-foil body
    s.rect(cx - 4, cy - 4, 8, 8, foil([P.g0, P.g1, P.g2, P.g3], seed, function (x) { return (x - cx) / 10; }));
    s.rect(cx - 4, cy - 4, 8, 1, P.g0);
    s.rect(cx - 4, cy + 3, 8, 1, P.g4);
    s.rect(cx + 1, cy - 2, 2, 2, P.ink);                        // star camera
    s.ellipse(cx, cy + 5, 2.2, 1.2, P.s2);                      // antenna
    if ((f + seed) % 4 < 2) fx.set(cx - 3, cy - 5, P.red);
  }

  function grail(f) {
    var bg = new S(64, 64), fg = new S(64, 64), fx = new S(64, 64);
    spaceSky(bg, 64);
    stars(bg, 0, 50, 21, 0.035, f);
    // the Moon's limb filling the bottom of the frame
    sphere(bg, 30, 108, 62, [P.m0, P.m1, P.m2, P.m3, P.m4], {
      shade: craterShade([[-0.3, -0.92, 0.05], [0.05, -0.95, 0.04], [0.25, -0.9, 0.06], [-0.1, -0.86, 0.07], [0.38, -0.84, 0.05]])
    });
    probe(fg, fx, 18, 18, f, 2);
    probe(fg, fx, 46, 32, f, 5);
    fg.outline(P.ink);
    // the laser/radio link between the twins, marching
    var x0 = 23, y0 = 21, x1 = 41, y1 = 30, n = 24;
    for (var i = 0; i <= n; i++) {
      if ((i + f) % 4 < 2) fx.set(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), i % 2 ? P.cyan : P.cyan2);
    }
    return bg.over(fg).over(fx);
  }

  /* ---------- Viking 1 in Chryse Planitia ---------- */

  function viking1(f) {
    var bg = new S(64, 64), fg = new S(64, 64), fx = new S(64, 64);
    marsSky(bg, 44);
    marsGround(bg, 44, 7, 12);
    rock(bg, 6, 52, 5, 3.2, [P.r0, P.r2, P.r3, P.r4]);           // a big boulder, like "Big Joe"
    bg.ellipse(37, 52, 18, 2, P.r3);

    // legs
    strut(fg, 20, 39, 11, 50, P.s2, P.s3);
    strut(fg, 44, 39, 53, 50, P.s3, P.s4);
    fg.rect(32, 41, 2, 9, P.s3);
    fg.ellipse(11, 51, 3.4, 1.3, function (x, y) { return y < 51 ? P.s1 : P.s3; });
    fg.ellipse(54, 51, 3.4, 1.3, function (x, y) { return y < 51 ? P.s2 : P.s4; });
    fg.ellipse(33, 51, 3, 1.2, function (x, y) { return y < 51 ? P.s1 : P.s3; });

    // RTG power units with fins
    [[16, 26], [42, 26]].forEach(function (q) {
      fg.rect(q[0], q[1], 6, 6, function (x) { return (x - q[0]) % 2 ? P.s4 : P.s3; });
      fg.rect(q[0], q[1], 6, 1, P.s2);
    });
    // hexagonal body
    fg.poly([[16, 32], [48, 32], [50, 36], [48, 41], [16, 41], [14, 36]], function (x, y) {
      return grad([P.s0, P.s1, P.s2, P.s3, P.s4], (x - 14) / 36 * 0.7 + (y - 32) / 9 * 0.5, x, y);
    });
    fg.rect(15, 36, 35, 1, P.g2);
    fg.rect(24, 32, 1, 9, P.s3); fg.rect(40, 32, 1, 9, P.s3);
    // cameras
    [[30, 25], [36, 27]].forEach(function (q) {
      fg.rect(q[0], q[1] + 1, 2, 32 - q[1] - 1, P.s2);
      fg.rect(q[0] - 1, q[1], 4, 2, P.s1);
      fg.set(q[0], q[1] + 2, P.ink);
    });
    // high-gain dish on its mast
    fg.rect(26, 21, 2, 11, function (x) { return x === 26 ? P.s2 : P.s3; });
    fg.ellipse(25, 15, 8.5, 5, function (x, y) { return grad([P.s0, P.s1, P.s2, P.s3], (x - 17) / 17, x, y); });
    fg.ellipse(25.5, 15.5, 6, 3.2, function (x, y) { return grad([P.s2, P.s3], (x - 19) / 12, x, y); });
    // sampler arm
    fg.line(14, 36, 6, 42, P.s2); fg.line(14, 37, 6, 43, P.s3);
    fg.rect(3, 42, 3, 2, P.s3);
    fg.outline(P.ink);

    fx.line(25, 15, 25, 11, P.s2); fx.set(25, 10, P.s0);                       // feed horn
    fx.line(48, 32, 54, 24, P.s2); fx.rect(53, 22, 3, 2, P.s1);                 // weather boom
    if (f < 2) fx.set(25, 10, P.red);
    return bg.over(fg).over(fx);
  }

  /* ---------- Opportunity at Perseverance Valley ---------- */

  function opportunity(f) {
    var bg = new S(64, 64), fg = new S(64, 64), fx = new S(64, 64), r = rng(9);
    marsSky(bg, 42);
    marsGround(bg, 42, 13, 8);
    // tiny hematite "blueberries" in the soil
    for (var i = 0; i < 26; i++) bg.set(Math.floor(r() * 64), 46 + Math.floor(r() * 18), P.s4);
    // wheel tracks trailing behind
    for (var x = 0; x < 12; x++) if (x % 3 !== 2) { bg.set(x, 53, P.r3); bg.set(x, 56, P.r3); }
    bg.ellipse(33, 53, 24, 2, P.r3);

    // rocker-bogie suspension
    fg.line(22, 39, 13, 46, P.s3); fg.line(23, 39, 14, 46, P.s4);
    fg.line(22, 39, 38, 42, P.s3);
    fg.line(38, 42, 32, 46, P.s3); fg.line(38, 42, 51, 46, P.s3);
    // wheels
    [13, 32, 51].forEach(function (wx) {
      fg.ellipse(wx + 0.5, 48, 4.2, 4.2, function (x, y) { return (x + y) % 3 === 0 ? P.s5 : P.s4; });
      fg.ellipse(wx + 0.5, 48, 2.2, 2.2, P.s2);
      fg.set(wx, 47, P.s1);
    });
    // warm electronics box
    fg.rect(18, 34, 28, 6, function (x, y) { return grad([P.s0, P.s1, P.s2, P.s3], (x - 18) / 28 + (y - 34) / 12, x, y); });
    fg.rect(18, 39, 28, 1, P.g2);
    // solar deck (a little dusty)
    var dust = rng(4);
    fg.poly([[5, 33], [59, 33], [55, 29], [9, 29]], function (x, y) {
      if (y === 29) return P.b0;
      if (y === 33) return P.s3;
      if (dust() < 0.13) return P.k1;
      if (x % 3 === 0 || y === 31) return P.b3;
      return x < 32 ? P.b1 : P.b2;
    });
    // camera mast and Pancam head
    fg.rect(41, 13, 2, 16, function (x) { return x === 41 ? P.s1 : P.s3; });
    fg.rect(37, 8, 11, 5, function (x, y) { return y === 8 ? P.s0 : y === 12 ? P.s3 : P.s1; });
    fg.rect(38, 9, 3, 3, P.ink); fg.rect(44, 9, 3, 3, P.ink);
    // robotic arm stowed in front
    fg.line(46, 38, 55, 40, P.s3); fg.rect(54, 39, 3, 3, P.s2);
    fg.outline(P.ink);

    fx.set(39, 10, f % 2 ? P.b0 : P.cyan); fx.set(45, 10, f % 2 ? P.cyan : P.b0);  // camera lenses glint
    fx.line(20, 28, 20, 25, P.s3); fx.ellipse(20.5, 23.5, 3.6, 1.8, function (x) { return x < 20 ? P.s0 : P.s2; });  // high-gain dish
    fx.line(13, 28, 13, 21, P.s2); fx.set(13, 20, P.s0);                                                            // low-gain antenna
    return bg.over(fg).over(fx);
  }

  /* ---------- sky bodies (32 x 32) ---------- */

  function orbSun(f) {
    var s = new S(32, 32);
    // pixel rays, alternating length by frame
    for (var a = 0; a < 16; a++) {
      var ang = a * Math.PI / 8, len = (a + f) % 2 ? 14.5 : 13;
      for (var d = 11; d <= len; d++) s.set(16 + Math.cos(ang) * d, 16 + Math.sin(ang) * d, a % 2 ? '#f5a623' : '#ffd23f');
    }
    sphere(s, 16, 16, 10, ['#fffbe0', '#fff0a0', '#ffd23f', '#f5a623', '#e07b16']);
    return s;
  }
  function orbMoon() {
    var s = new S(32, 32);
    sphere(s, 16, 16, 13, [P.m0, P.m1, P.m2, P.m3, P.m4, P.m5], {
      shade: craterShade([[-0.35, -0.3, 0.2], [0.25, 0.3, 0.24], [-0.2, 0.45, 0.13], [0.4, -0.35, 0.12], [-0.55, 0.1, 0.1], [0.05, -0.05, 0.1]])
    });
    return s;
  }
  function orbMars() {
    var s = new S(32, 32);
    sphere(s, 16, 16, 13, [P.r0, P.r1, P.r2, P.r3, P.r4, P.r5], {
      shade: function (nx, ny, t, x, y) {
        if (ny < -0.8 && t < 0.8) return t < 0.5 ? '#ffffff' : P.s1;                       // polar cap
        var dark = Math.sin(nx * 4 + 1) * Math.cos(ny * 5) + 0.6 * Math.sin(nx * 7 + ny * 2) > 0.75;
        if (Math.abs(ny + 0.05) < 0.07 && nx > -0.6 && nx < 0.4) return t + 0.25;           // Valles Marineris
        return dark ? t + 0.2 : t;
      }
    });
    return s;
  }

  /* ---------- registry and cache ---------- */

  var MAKERS = {
    eagle: eagle, grail: grail, viking1: viking1, opportunity: opportunity,
    'orb:sun': orbSun, 'orb:moon': orbMoon, 'orb:mars': orbMars
  };
  var FRAMES = 4, cache = {};

  function frameCanvas(id, frame) {
    var key = id + '#' + frame;
    if (!cache[key]) cache[key] = MAKERS[id](frame).toCanvas();
    return cache[key];
  }

  window.ABNF_SPRITES = {
    FRAMES: FRAMES,
    has: function (id) { return !!MAKERS[id]; },
    draw: function (canvas, id, frame) {
      var src = frameCanvas(id, (frame || 0) % FRAMES);
      if (canvas.width !== src.width) { canvas.width = src.width; canvas.height = src.height; }
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(src, 0, 0);
    }
  };
})();
