/* <wallet-card>: the wallet card, lit by the phone's motion, as a drop-in HTML element.
 * Built by wallet-native/tools/export-web.mjs from shaders/*.vert|frag and reference/tilt.js; do not edit
 * the generated wallet-card.js, edit wallet-native and re-export.
 *
 *   <script src="./wallet-card.js"></script>
 *   <wallet-card src="./assets/wallet/" style="display:block;width:372px;height:232px"></wallet-card>
 *
 * The card is fitted (contain) into the element and centred; the element is transparent elsewhere.
 * Attributes: src (assets folder, default ./assets/wallet/), shadow (present = draw the drop shadow and
 * leave room for it, as the native views do; absent = the card fills the element).
 * Light: DeviceMotionEvent.rotationRate on phones (Android WebView needs no permission; iOS Safari asks on
 * the first tap on the card), the pointer over the element on desktop. Renders only while on screen.
 */
(function () {
  if (window.customElements && customElements.get('wallet-card')) return;
  var VERT = "#version 300 es\n// One textured quad with no vertex buffers: draw 4 vertices as a triangle strip.\n// uRect = (left, top, right, bottom) in clip space. vUv (0,0) is the texture's top-left, row 0 of the file.\nuniform vec4 uRect;\nout vec2 vUv;\nvoid main() {\n  vec2 c = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));\n  vUv = c;\n  gl_Position = vec4(mix(uRect.x, uRect.z, c.x), mix(uRect.y, uRect.w, c.y), 0., 1.);\n}\n";
  var FRAG = "#version 300 es\n// The \"Material\" view of Material Detector.dc.html (FRAG), ported to GLSL ES 3.00.\n// The math is unchanged; removed: region highlight (uHi), mask view (uMask), pulse (uT).\n// smoothstep() is spelled out as ss() because envC() calls it with edge0 > edge1, which is\n// undefined in GLSL and MSL; ss() is the formula WebGL drivers evaluate.\nprecision highp float;\nin vec2 vUv;\nout vec4 fragColor;\n\nuniform sampler2D uImg;   // image.png, premultiplied RGBA, LINEAR, no mipmaps\nuniform sampler2D uReg;   // regions.png, R8, NEAREST\nuniform vec2 uTex;        // image.png size in pixels\nuniform vec2 uTilt;       // smoothed tilt, x right, y up, each -1..1\nuniform float uMetal[6], uRough[6], uRelief[6], uSheen[6], uCoat[6];\nuniform float uCrease;    // params.json relief.creases: 0 = the detector's 1-texel relief, 1 = crease scale\nuniform float uGuard;     // params.json light.guard: 0 = the detector's light path, 1 = never head-on\n\nfloat ss(float e0, float e1, float x) { float t = clamp((x - e0) / (e1 - e0), 0., 1.); return t * t * (3. - 2. * t); }\nfloat lum(vec2 p) { vec4 c = texture(uImg, p); return dot(c.rgb, vec3(.3, .59, .11)) * c.a; }\nfloat alp(vec2 p) { return texture(uImg, p).a; }\n\n// The studio: a graded room, a key strip right of centre and a cooler fill on the left.\nvec3 envC(vec3 d, float r) {\n  vec3 c = mix(vec3(.16, .15, .14), vec3(1., .97, .92), ss(-.5, .8, d.y));\n  float w = .12 + r * .35;\n  c += ss(w, 0., abs(d.x - .3)) * ss(.1, .5, d.y) * mix(1.8, .35, r);\n  c += ss(w * 1.4, 0., abs(d.x + .55)) * ss(-.2, .3, d.y) * mix(.7, .15, r) * vec3(.85, .9, 1.);\n  return c;\n}\n\nvoid main() {\n  vec2 uv = vUv;\n  vec4 c = texture(uImg, uv);\n  if (c.a < .01) { fragColor = vec4(0.); return; }\n  vec3 base = c.rgb / max(c.a, .001);\n\n  // region → material; pixels outside every region keep the detector's defaults\n  float id = floor(texture(uReg, uv).r * 255. / 40. + .5) - 1.;\n  float me = 0., ro = .6, re = .5, sh = 0., co = 0.;\n  int i = int(id);\n  if (i >= 0 && i < 6) { me = uMetal[i]; ro = uRough[i]; re = uRelief[i]; sh = uSheen[i]; co = uCoat[i]; }\n\n  // normal from luminance (relief) and from alpha (the silhouette rolls off)\n  vec2 e = 1. / uTex;\n  float hx = lum(uv + vec2(e.x, 0.)) - lum(uv - vec2(e.x, 0.));\n  float hy = lum(uv + vec2(0., e.y)) - lum(uv - vec2(0., e.y));\n  // not in the detector: the same slope measured across ±3 texels and three rows, so creases and\n  // folds tilt the normal while single-pixel pores average out (they made sharp glints)\n  if (uCrease > 0.) {\n    vec2 ex = vec2(e.x * 3., 0.), ey = vec2(0., e.y * 3.), sx = vec2(e.x, 0.), sy = vec2(0., e.y);\n    float cx = (lum(uv + ex) - lum(uv - ex) + lum(uv + ex + sy) - lum(uv - ex + sy) + lum(uv + ex - sy) - lum(uv - ex - sy)) / 3.;\n    float cy = (lum(uv + ey) - lum(uv - ey) + lum(uv + ey + sx) - lum(uv - ey + sx) + lum(uv + ey - sx) - lum(uv - ey - sx)) / 3.;\n    hx = mix(hx, cx, uCrease);\n    hy = mix(hy, cy, uCrease);\n  }\n  vec2 e3 = e * 4.;\n  float ax = alp(uv + vec2(e3.x, 0.)) - alp(uv - vec2(e3.x, 0.));\n  float ay = alp(uv + vec2(0., e3.y)) - alp(uv - vec2(0., e3.y));\n  vec3 N = normalize(vec3(-hx * re * 7. - ax * 1.4, hy * re * 7. + ay * 1.4, 1.));\n\n  // tilt moves the light and the reflected studio, never the geometry\n  vec3 V = vec3(0., 0., 1.);\n  // not in the detector: with uGuard, tipping the top away lowers the light only to .3 (≈ 19° off the view axis),\n  // so the narrow highlight can never line up with the flat leather and flood the whole card\n  float ly = .6 + uTilt.y * (uTilt.y < 0. ? mix(1.5, .3, uGuard) : 1.5);\n  vec3 L = normalize(vec3(.35 - uTilt.x * 1.5, ly, .85));\n  vec3 H = normalize(L + V);\n  float ndl = max(dot(N, L), 0.), ndh = max(dot(N, H), 0.);\n  vec3 R = reflect(-V, N); R.xy += vec2(-uTilt.x, uTilt.y) * 1.1; R = normalize(R);\n\n  float shin = mix(500., 10., ro);\n  float spec = pow(ndh, shin) * (1. - ro) * (1. - ro) * 2.2;\n  vec3 dif = base * (.78 + .34 * ndl);\n  vec3 env = envC(R, ro);\n  vec3 metalC = base * .32 * (.7 + .3 * ndl) + env * base * 1.05 + spec * base * 1.8;\n  vec3 col = mix(dif + vec3(spec) * .35 * (1. - me), metalC, me * .7);\n  col += sh * pow(ndh, 5.) * .18 * (base + .4);                                   // sheen (thread, fabric)\n  col += co * (pow(ndh, 320.) * 1.1                                               // clear coat\n             + envC(reflect(-V, normalize(vec3(N.xy * .3, 1.))) + vec3(-uTilt.x, uTilt.y, 0.), .05).r * .05);\n\n  fragColor = vec4(col * c.a, c.a);\n}\n";
  var SHADOW_FRAG = "#version 300 es\n// Drop shadow: the baked, blurred wallet alpha, as premultiplied black.\nprecision mediump float;\nin vec2 vUv;\nout vec4 fragColor;\nuniform sampler2D uShadow;   // shadow.png, R8, LINEAR\nuniform float uOpacity;      // card.json shadow.opacity\nvoid main() {\n  fragColor = vec4(0., 0., 0., texture(uShadow, vUv).r * uOpacity);\n}\n";

  // ---- motion: one shared source for every card on the page (same filter as TiltSource.swift / .kt) ----
  var motion = { turnX: 0, turnY: 0, last: 0, active: false, listening: false, subs: [] };
  // rotationRate in deg/s; browsers report alpha about the device's x axis and beta about y
  // (checked in Android WebView / Chromium with the emulator's gyroscope)
  function onMotion(e) {
    var r = e.rotationRate;
    if (!r || r.alpha == null || r.beta == null) return;
    var now = performance.now() / 1000, dt = motion.last ? Math.min(0.1, now - motion.last) : 0;
    motion.last = now;
    motion.active = true;
    motion.subs.forEach(function (f) { f(r.alpha, r.beta, dt); });
  }
  function listenMotion() {
    if (motion.listening) return;
    motion.listening = true;
    addEventListener('devicemotion', onMotion);
  }
  // Listen at once: where no permission is needed (Android, desktop) events just arrive. Where the
  // browser exposes requestPermission (iOS Safari, recent Chromium), it is also asked on the first tap.
  var D = window.DeviceMotionEvent;
  var needsPermission = !!(D && typeof D.requestPermission === 'function');
  listenMotion();

  // level = p.rest; a turn moves the light by amplitude · tanh(turn / softDeg), see wallet-native/reference/tilt.js
  function Tilt(p) {
    this.p = p; this.turn = [0, 0]; this.target = p.rest.slice(); this.value = p.rest.slice();
  }
  Tilt.prototype.rotate = function (rateX, rateY, dt) {
    var leak = Math.exp(-dt / this.p.neutralTau), k = this.p.amplitude, s = this.p.softDeg;
    this.turn[0] = (this.turn[0] + rateX * dt) * leak;
    this.turn[1] = (this.turn[1] + rateY * dt) * leak;
    this.target = [this.p.rest[0] + k * Math.tanh(this.turn[1] / s), this.p.rest[1] + k * Math.tanh(this.turn[0] / s)];
  };
  Tilt.prototype.point = function (q) {
    var r = this.p.rest, k = this.p.amplitude;
    this.target = q ? [r[0] + q[0] * k, r[1] + q[1] * k] : r.slice();
  };
  Tilt.prototype.step = function (dt) {
    var k = 1 - Math.exp(-dt * this.p.smoothing);
    this.value[0] += (this.target[0] - this.value[0]) * k;
    this.value[1] += (this.target[1] - this.value[1]) * k;
    return this.value;
  };

  var cache = {};
  function load(base) {
    if (cache[base]) return cache[base];
    var json = function (n) { return fetch(base + n).then(function (r) { if (!r.ok) throw new Error(base + n + ': ' + r.status); return r.json(); }); };
    var image = function (n) { return new Promise(function (ok, fail) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { fail(new Error(base + n)); }; i.src = base + n; }); };
    return (cache[base] = json('card.json').then(function (card) {
      return Promise.all([json('params.json'), image(card.image.file), image(card.regions.file), image(card.shadow.file)]).then(function (r) {
        // regions.png as raw bytes (an id map, not a colour)
        var c = document.createElement('canvas'); c.width = r[2].width; c.height = r[2].height;
        var cx = c.getContext('2d', { willReadFrequently: true }); cx.drawImage(r[2], 0, 0);
        var rgba = cx.getImageData(0, 0, c.width, c.height).data, reg = new Uint8Array(c.width * c.height);
        for (var i = 0; i < reg.length; i++) reg[i] = rgba[i * 4];
        return { card: card, params: r[0], img: r[1], reg: reg, shadow: r[3] };
      });
    }));
  }

  function program(gl, vs, fs) {
    var sh = function (t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    var p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  function texture(gl, unit, filter) {
    var t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  // GL objects for one context; rebuilt after a context loss
  function setUp(gl, a) {
    var wallet = program(gl, VERT, FRAG), shadow = program(gl, VERT, SHADOW_FRAG);
    var loc = function (p, n) { return gl.getUniformLocation(p, n); };
    gl.bindVertexArray(gl.createVertexArray());
    texture(gl, 0, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, a.img);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    texture(gl, 1, gl.NEAREST);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, a.card.regions.width, a.card.regions.height, 0, gl.RED, gl.UNSIGNED_BYTE, a.reg);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    texture(gl, 2, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, a.shadow);
    var arr = function (f) { var x = new Float32Array(6); a.card.materials.forEach(function (m, i) { if (i < 6) x[i] = f(m); }); return x; };
    var R = { uMetal: arr(function (m) { return m.metal; }), uRough: arr(function (m) { return m.rough; }), uRelief: arr(function (m) { return m.relief; }),
      uSheen: arr(function (m) { return m.sheen; }), uCoat: arr(function (m) { return m.coat; }) };
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // premultiplied over
    return function draw(w, h, withShadow, tilt) {
      var asp = a.card.image.width / a.card.image.height, s = a.card.shadow;
      var cw = withShadow ? Math.min(w / (1 + 2 * s.pad), h / (1 / asp + 2 * s.pad + s.offsetY)) : Math.min(w, h * asp);
      var ch = cw / asp, x = (w - cw) / 2, y = (h - ch) / 2 - (withShadow ? s.offsetY * cw / 2 : 0);
      var clip = function (rx, ry, rw, rh) { return [rx / w * 2 - 1, 1 - ry / h * 2, (rx + rw) / w * 2 - 1, 1 - (ry + rh) / h * 2]; };
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      if (withShadow) {
        var p = s.pad * cw;
        gl.useProgram(shadow);
        gl.uniform4fv(loc(shadow, 'uRect'), clip(x - p, y - p + s.offsetY * cw, cw + 2 * p, ch + 2 * p));
        gl.uniform1i(loc(shadow, 'uShadow'), 2); gl.uniform1f(loc(shadow, 'uOpacity'), s.opacity);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      gl.useProgram(wallet);
      gl.uniform4fv(loc(wallet, 'uRect'), clip(x, y, cw, ch));
      gl.uniform1i(loc(wallet, 'uImg'), 0); gl.uniform1i(loc(wallet, 'uReg'), 1);
      gl.uniform2f(loc(wallet, 'uTex'), a.card.image.width, a.card.image.height);
      gl.uniform2f(loc(wallet, 'uTilt'), tilt[0], tilt[1]);
      gl.uniform1f(loc(wallet, 'uCrease'), a.params.relief.creases);
      gl.uniform1f(loc(wallet, 'uGuard'), a.params.light.guard);
      for (var k in R) gl.uniform1fv(loc(wallet, k), R[k]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  }

  function WalletCard() { return Reflect.construct(HTMLElement, [], WalletCard); }
  WalletCard.prototype = Object.create(HTMLElement.prototype);
  WalletCard.prototype.constructor = WalletCard;
  Object.setPrototypeOf(WalletCard, HTMLElement);

  WalletCard.prototype.connectedCallback = function () {
    if (this._canvas) { this._start(); return; }
    var self = this;
    if (!this.style.display) this.style.display = 'block';
    // a host that clones its DOM (the Docklet runtime does) can hand us a stale copy of an earlier canvas
    Array.prototype.slice.call(this.querySelectorAll('canvas')).forEach(function (old) { old.remove(); });
    if (getComputedStyle(this).position === 'static') this.style.position = 'relative';
    var c = this._canvas = document.createElement('canvas');
    c.style.cssText = 'position:absolute;left:0;top:0;display:block;width:100%;height:100%;pointer-events:none';
    this.appendChild(c);
    this._pointer = null;
    this._onPointer = function (e) {
      if (e.pointerType === 'touch' || motion.active) return;
      var r = self.getBoundingClientRect();
      self._pointer = [((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * -2];
    };
    this._onLeave = function () { self._pointer = null; };
    this._onTap = function () { if (needsPermission && !motion.active) D.requestPermission().catch(function () {}); };
    this.addEventListener('pointermove', this._onPointer);
    this.addEventListener('pointerleave', this._onLeave);
    this.addEventListener('pointerdown', this._onTap);
    c.addEventListener('webglcontextlost', function (e) { e.preventDefault(); self._draw = null; });
    c.addEventListener('webglcontextrestored', function () { self._init(); });
    this._visible = true;
    if ('IntersectionObserver' in window) {
      this._io = new IntersectionObserver(function (es) { self._visible = es[es.length - 1].isIntersecting; if (self._visible) self._start(); });
      this._io.observe(this);
    }
    load(this.getAttribute('src') || './assets/wallet/').then(function (a) { self._assets = a; self._init(); })
      .catch(function (e) { console.error('wallet-card:', e); });
  };

  WalletCard.prototype._init = function () {
    var a = this._assets, self = this;
    if (!a) return;
    var gl = this._gl = this._canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) { console.error('wallet-card: WebGL2 is not available'); return; }
    this._draw = setUp(gl, a);
    if (!this._tilt) {
      this._tilt = new Tilt(a.params.tilt);
      this._sub = function (rx, ry, dt) { self._tilt.rotate(rx, ry, dt); };
      motion.subs.push(this._sub);
    }
    this._start();
  };

  WalletCard.prototype._start = function () {
    if (this._raf || !this._draw) return;
    var self = this, last = 0;
    var frame = function (t) {
      self._raf = 0;
      if (!self.isConnected || !self._visible || document.hidden || !self._draw) return;
      self._raf = requestAnimationFrame(frame);
      var dt = last ? Math.min(0.1, (t - last) / 1000) : 0;
      last = t;
      var c = self._canvas, r = c.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      // the prototype screen may be CSS-scaled: size the buffer to what is on screen
      var p = self._assets.params.render, scale = Math.min(devicePixelRatio || 1, p.maxScale) * p.supersample;
      var pw = Math.round(r.width * scale), ph = Math.round(r.height * scale);
      if (c.width !== pw || c.height !== ph) { c.width = pw; c.height = ph; }
      if (self._pointer || !motion.active) self._tilt.point(self._pointer);
      var tilt = self._tilt.step(dt);
      self._gl.viewport(0, 0, pw, ph);
      self._draw(c.clientWidth || r.width, c.clientHeight || r.height, self.hasAttribute('shadow'), tilt);
    };
    this._raf = requestAnimationFrame(frame);
  };

  WalletCard.prototype.disconnectedCallback = function () {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
  };

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) document.querySelectorAll('wallet-card').forEach(function (el) { if (el._start) el._start(); });
  });
  customElements.define('wallet-card', WalletCard);
})();
