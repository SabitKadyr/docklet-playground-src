/* Docklet Liquid helper: shapes, morph timeline, goo filter, shape check. Plain JS, one global. */
(function () {
  var CX = 201.06, DW = 382.01, DH = 61.872, DOCK_REST = 784.93, LOBE = 31.118;
  var GEO = {
    rest: { w: 64, h: 32.882, top: 775, dock: DOCK_REST },
    tap: { w: DW, h: 203.906, top: 605.0, dock: 786.93 },
    v1: { w: DW, h: 423.906, top: 64.2, dock: 466.13 },
    v2: { w: DW, h: 433.906, top: 63.2, dock: 506.13 },
    v3: { w: DW, h: 423.906, top: 84.2, dock: 890 }
  };
  var GOO = '<filter id="lqGoo" x="-30%" y="-30%" width="160%" height="160%">' +
    '<feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"></feGaussianBlur>' +
    '<feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"></feColorMatrix></filter>';
  function n(v) { return Math.round(v * 1000) / 1000; }
  // the card's bottom lobe (cardPath at full width), 0.5px taller at the top where it overlaps the body
  var LOBE_MASK = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="87.334" height="31.618" viewBox="0 0 87.334 31.618" preserveAspectRatio="none">'
    + '<path fill="#fff" d="M0 0H87.334V0.5C80.833 0.5 75.729 5.857 73.24 11.863C68.433 23.461 57.003 31.618 43.667 31.618C30.331 31.618 18.901 23.461 14.094 11.863C11.605 5.857 6.501 0.5 0 0.5Z"/></svg>') + '")';

  function dockPath(w, h) {
    var cx = w / 2, R = h / 2;
    return "M" + n(w - R) + " 0 A" + n(R) + " " + n(R) + " 0 0 1 " + n(w - R) + " " + n(h) + " H" + n(R) + " A" + n(R) + " " + n(R) + " 0 0 1 " + n(R) + " 0"
      + " H" + n(cx - 36.777) + " C" + n(cx - 32.530) + " 0 " + n(cx - 29.966) + " 5.215 " + n(cx - 31.552) + " 9.155"
      + " C" + n(cx - 33.131) + " 13.076 " + n(cx - 34) + " 17.358 " + n(cx - 34) + " 21.844"
      + " C" + n(cx - 34) + " 40.621 " + n(cx - 18.778) + " 55.844 " + n(cx) + " 55.844"
      + " C" + n(cx + 18.778) + " 55.844 " + n(cx + 34) + " 40.621 " + n(cx + 34) + " 21.844"
      + " C" + n(cx + 34) + " 17.358 " + n(cx + 33.131) + " 13.076 " + n(cx + 31.552) + " 9.155"
      + " C" + n(cx + 29.966) + " 5.215 " + n(cx + 32.530) + " 0 " + n(cx + 36.777) + " 0 Z";
  }

  function cardPath(w, h, r) {
    if (r == null) r = 32;
    var cx = w / 2, k = Math.min(1, (w / 2) / 43.667);
    r = Math.min(r, w / 2, h / 2);
    var P = function (dx, dy) { return n(cx + dx * k) + " " + n(h + dy); };
    return "M" + n(r) + " 0 H" + n(w - r) + " A" + n(r) + " " + n(r) + " 0 0 1 " + n(w) + " " + n(r) + " V" + n(h - r) + " A" + n(r) + " " + n(r) + " 0 0 1 " + n(w - r) + " " + n(h)
      + " H" + n(cx + 43.667 * k) + " C" + P(37.166, 0) + " " + P(32.062, 5.357) + " " + P(29.573, 11.363)
      + " C" + P(24.766, 22.961) + " " + P(13.336, 31.118) + " " + n(cx) + " " + n(h + 31.118)
      + " C" + P(-13.336, 31.118) + " " + P(-24.766, 22.961) + " " + P(-29.573, 11.363)
      + " C" + P(-32.062, 5.357) + " " + P(-37.166, 0) + " " + n(cx - 43.667 * k) + " " + n(h)
      + " H" + n(r) + " A" + n(r) + " " + n(r) + " 0 0 1 0 " + n(h - r) + " V" + n(r) + " A" + n(r) + " " + n(r) + " 0 0 1 " + n(r) + " 0 Z";
  }

  function geo(view, kb) {
    var key = view === 2 ? (GEO[kb] ? kb : "v1") : view === 1 ? "tap" : "rest", g = GEO[key];
    return { w: g.w, h: g.h, top: g.top, dock: g.dock, away: view ? 1 : 0, key: key };
  }

  function check(view, kb) {
    var g = geo(view, kb);
    return {
      dock: dockPath(DW, DH), dockT: "translate(10.06," + g.dock + ")", pill: !view,
      card: view ? cardPath(DW, g.h) : "M0 0", cardT: "translate(10.06," + g.top + ")"
    };
  }

  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function ease(p) { return 1 - Math.pow(1 - p, 3); }
  function easeIn(p) { return p * p * p; }
  function spring(x, v, to, dt, k, c) { var a = -k * (x - to) - c * v; v += a * dt; return [x + v * dt, v]; }

  function smooth(x) { return x * x * (3 - 2 * x); }
  var FLAGS = [], XONLY = [], YONLY = [], CIRCLE = [];
  (function () {
    // token roles in cardPath: walk commands; A args: rx ry rot laf sf x y; H: x; V: y
    var s = cardPath(100, 100), cmd = "", argi = 0, k = 0;
    s.replace(/([MHVACZ])|(-?\d*\.?\d+)/g, function (all, c, num) {
      if (c) { cmd = c; argi = 0; return all; }
      var role;
      if (cmd === "H") role = "x"; else if (cmd === "V") role = "y";
      else if (cmd === "A") { var j = argi % 7; role = j < 2 ? "r" : j < 5 ? "f" : (j === 5 ? "x" : "y"); }
      else role = argi % 2 === 0 ? "x" : "y";
      FLAGS[k] = role === "r" || role === "f"; XONLY[k] = role === "x"; YONLY[k] = role === "y"; argi++; k++; return all;
    });
    var cx = 201.06, top = 775, l = 169.06, c = "M32 0 H32 A32 32 0 0 1 64 32 V32 A32 32 0 0 1 32 64 H32 C32 64 32 64 32 64 C32 64 32 64 32 64 C32 64 32 64 32 64 C32 64 32 64 32 64 H32 A32 32 0 0 1 0 32 V32 A32 32 0 0 1 32 0 Z", q = 0;
    c.replace(/-?\d*\.?\d+/g, function (m) { var v = +m; CIRCLE.push(FLAGS[q] ? v : v + (XONLY[q] ? l : top)); q++; return m; });
  })();
  function mix(a, b, u) { return a + (b - a) * u; }
  function rgba(c1, c2, u) { return "rgba(" + Math.round(mix(c1[0], c2[0], u)) + "," + Math.round(mix(c1[1], c2[1], u)) + "," + Math.round(mix(c1[2], c2[2], u)) + "," + n(mix(c1[3], c2[3], u)) + ")"; }
  function arcD(cx, cy, r, a0, a1) { var p = function (a) { a = a * Math.PI / 180; return n(cx + r * Math.cos(a)) + " " + n(cy + r * Math.sin(a)); }; return "M" + p(a0) + " A" + r + " " + r + " 0 0 1 " + p(a1); }
  function paint(R, g, mode) {
    var w = g.w, h = g.h, top = g.top, left = CX - w / 2, t = g.t || 0, u = clamp((t - 0.2) / 0.5, 0, 1);
    var card = cardPath(w, h), nums = [], i = 0;
    card.replace(/-?\d*\.?\d+(e-?\d+)?/g, function (m) { nums.push(+m); return m; });
    var C = CIRCLE.slice(), m = smooth(clamp(t / 0.35, 0, 1)), cdy = top + h + LOBE - 839;
    // the resting circle rides with the lobe, so the blended shape never trails behind the icon and dock
    for (var ci = 0; ci < C.length; ci++) { if (C[ci] === undefined || FLAGS[ci]) continue; var isY = YONLY[ci] || (!XONLY[ci] && ci % 2 === 1); if (isY) C[ci] += cdy; }
    var d = card.replace(/-?\d*\.?\d+(e-?\d+)?/g, function () { var v = nums[i], c = C[i], k = i; i++; if (FLAGS[k]) { var rr = (k >= 0 && C[k] !== undefined && Math.abs(C[k] - 32) < 1e-6 && v > 1.5) ? n(mix(32, v, m)) : String(v); return rr; } var off = (k % 2 === 0) ? left : top; if (XONLY[k]) off = left; else if (YONLY[k]) off = top; return n(mix(c, v + off, m)); });
    var grad = "linear-gradient(180deg," + rgba([145, 145, 145, 0.2], [8, 8, 8, 0.3], u) + "," + rgba([43, 43, 43, 0.2], [8, 8, 8, 0.3], u) + ")";
    // Once no circle is blended in, the shape is exactly a rounded card plus the lobe. Then the glass is drawn by
    // two plain elements: a border-radius body and a lobe with a fixed mask, both only moved and resized. A mask
    // rebuilt every frame on a full-screen backdrop-filter layer halved the frame rate on a mid-range phone, and
    // clip-path alone does not clip backdrop-filter (the blur fills the clip's bounding box).
    var split = m >= 1 && w >= 2 * 43.667 && R.body && R.lobe;
    if (R.glass) {
      var s = R.glass.style;
      s.transform = "none";
      s.clipPath = s.webkitClipPath = "path('" + d + "')";   // also the hit area for lqSwipe, so it stays in both modes
      if (split) {
        if (s.background !== "none") { s.backdropFilter = s.webkitBackdropFilter = "none"; s.webkitMaskImage = s.maskImage = "none"; s.background = "none"; }
      } else {
        s.backdropFilter = s.webkitBackdropFilter = "blur(24px) saturate(160%)";
        var mk = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="402" height="874"><path d="' + d + '"/></svg>') + '")';
        s.webkitMaskImage = s.maskImage = mk; s.webkitMaskSize = s.maskSize = "402px 874px"; s.webkitMaskRepeat = s.maskRepeat = "no-repeat";
        s.background = grad + " " + n(left) + "px " + n(top) + "px / " + n(w) + "px " + n(h + LOBE) + "px no-repeat";
      }
    }
    if (R.body && R.lobe) {
      var bs = R.body.style, ls = R.lobe.style;
      if (split) {
        var ll = CX - 43.667, ov = 0.5;   // the lobe overlaps the body by half a pixel so no hairline shows between them
        if (!ls.maskImage || ls.maskImage === "none") { ls.webkitMaskImage = ls.maskImage = LOBE_MASK; ls.webkitMaskSize = ls.maskSize = "100% 100%"; }
        bs.display = ls.display = "";
        bs.width = n(w) + "px"; bs.height = n(h) + "px"; bs.borderRadius = n(Math.min(32, w / 2, h / 2)) + "px";
        bs.transform = "translate(" + n(left) + "px," + n(top) + "px)";
        bs.background = grad + " 0 0 / " + n(w) + "px " + n(h + LOBE) + "px no-repeat";
        ls.transform = "translate(" + n(ll) + "px," + n(top + h - ov) + "px)";
        ls.background = grad + " " + n(left - ll) + "px " + n(ov - h) + "px / " + n(w) + "px " + n(h + LOBE) + "px no-repeat";
      } else if (bs.display !== "none") bs.display = ls.display = "none";
    }
    // the rim SVG only as large as the shape: a full-screen SVG re-rastered every frame cost a quarter of the frames
    var rs = R.rim && R.rim.ownerSVGElement;
    if (rs) {
      var bx = left - 3, by = top - 3, bw = w + 6, bh = h + LOBE + 6;
      rs.setAttribute("width", n(bw)); rs.setAttribute("height", n(bh)); rs.setAttribute("viewBox", n(bx) + " " + n(by) + " " + n(bw) + " " + n(bh));
      rs.style.transform = "translate(" + n(bx) + "px," + n(by) + "px)";
    }
    var tf = "";
    if (R.defs && !R.defs.querySelector("#lqCardRim")) R.defs.insertAdjacentHTML("beforeend", '<linearGradient id="lqCardRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.55"></stop><stop offset="0.05" stop-color="#fff" stop-opacity="0.3"></stop><stop offset="0.12" stop-color="#fff" stop-opacity="0.08"></stop><stop offset="0.5" stop-color="#fff" stop-opacity="0.05"></stop><stop offset="0.86" stop-color="#fff" stop-opacity="0.06"></stop><stop offset="0.95" stop-color="#fff" stop-opacity="0.24"></stop><stop offset="1" stop-color="#fff" stop-opacity="0.36"></stop></linearGradient><clipPath id="lqCardClip"><path></path></clipPath>');
    if (R.rim) {
      R.rim.setAttribute("d", d); R.rim.removeAttribute("transform");
      R.rim.setAttribute("stroke-width", "2"); R.rim.setAttribute("clip-path", "url(#lqCardClip)");
      var cp = R.defs && R.defs.querySelector("#lqCardClip path"); if (cp) cp.setAttribute("d", d);
      var st = R.defs && R.defs.querySelectorAll("#lqCardRim stop");
      if (st && st.length === 7) {
        var C = [[0.14, 0.62], [0.2, 0.42], [0.3, 0.1], [0.5, 0.04], [0.7, 0.06], [0.8, 0.28], [0.86, 0.44]], Q = [[0, 0.55], [0.05, 0.3], [0.12, 0.08], [0.5, 0.05], [0.86, 0.06], [0.95, 0.24], [1, 0.36]];
        for (var si = 0; si < 7; si++) { st[si].setAttribute("offset", n(mix(C[si][0], Q[si][0], u))); st[si].setAttribute("stop-opacity", n(mix(C[si][1], Q[si][1], u))); }
      }
    }
    var lx = CX, ly = top + h + LOBE - 32;
    if (R.spec) R.spec.style.opacity = "0";
    if (R.dark) { R.dark.setAttribute("d", arcD(lx, ly, 32.5, 35, 145)); R.dark.style.opacity = String(n(1 - u)); }
    if (R.x) {
      var k = clamp((t - 0.15) / 0.3, 0, 1);
      R.x.style.transform = "translate(" + CX + "px," + n(top + h + mix(-0.882, 7.7, t)) + "px)";
      var sc = R.x.children[0], xx = R.x.children[1];
      if (sc) { sc.style.opacity = String(n(1 - k)); sc.style.transform = "rotate(" + n(45 * k) + "deg)"; }
      if (xx) { xx.style.opacity = String(n(k)); xx.style.transform = "rotate(" + n(-45 * (1 - k)) + "deg)"; }
    }
    if (R.dock) {
      var a = g.away || 0, ds = R.dock.style;
      ds.translate = a > 0.001 || g.dock !== DOCK_REST ? "0 " + n(g.dock - DOCK_REST) + "px" : "";
      // never filter/fade the dock itself: that would cut off the glass blur behind it
      var on = a > 0.001, op = String(n(1 - 0.45 * a)), wrap = R.dockGlass && R.dockGlass.parentElement;
      for (var ci = 0; ci < R.dock.children.length; ci++) {
        var ch = R.dock.children[ci];
        if (ch === wrap) { for (var cj = 0; cj < wrap.children.length; cj++) if (wrap.children[cj] !== R.dockGlass) wrap.children[cj].style.opacity = on ? op : ""; }
        else ch.style.filter = on ? "blur(" + n(3 * a) + "px) opacity(" + op + ")" : "";
      }
      ds.filter = ""; ds.opacity = "";
    }
    if (R.dim) R.dim.style.opacity = String(n(g.away || 0));
  }
  function restoreGlass(el) { var s = el.style, o = s._o; if (!o) return; s.backdropFilter = o.bf; s.webkitBackdropFilter = o.wb; s.background = o.bg; s._o = null; }
  function notchPath(w) {
    var cx = w / 2;
    return "M" + n(cx - 36.777) + " 0 C" + n(cx - 32.530) + " 0 " + n(cx - 29.966) + " 5.215 " + n(cx - 31.552) + " 9.155"
      + " C" + n(cx - 33.131) + " 13.076 " + n(cx - 34) + " 17.358 " + n(cx - 34) + " 21.844"
      + " C" + n(cx - 34) + " 40.621 " + n(cx - 18.778) + " 55.844 " + n(cx) + " 55.844"
      + " C" + n(cx + 18.778) + " 55.844 " + n(cx + 34) + " 40.621 " + n(cx + 34) + " 21.844"
      + " C" + n(cx + 34) + " 17.358 " + n(cx + 33.131) + " 13.076 " + n(cx + 31.552) + " 9.155"
      + " C" + n(cx + 29.966) + " 5.215 " + n(cx + 32.530) + " 0 " + n(cx + 36.777) + " 0";
  }
  function rimMarkup(w, hh, px, py, pr) {
    var d = dockPath(w, hh), arc = function (r, a0, a1) { var p = function (a) { a = a * Math.PI / 180; return n(px + r * Math.cos(a)) + " " + n(py + r * Math.sin(a)); }; return "M" + p(a0) + " A" + r + " " + r + " 0 0 1 " + p(a1); };
    return '<defs><clipPath id="lqDockClip"><path d="' + d + '"></path></clipPath>'
      + '<clipPath id="lqPillClip"><circle cx="' + px + '" cy="' + py + '" r="' + pr + '"></circle></clipPath>'
      + '<linearGradient id="lqRimV" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + n((w + hh) / 2) + '" y2="' + n((w + hh) / 2) + '"><stop offset="0" stop-color="#fff" stop-opacity="0.55"></stop><stop offset="0.05" stop-color="#fff" stop-opacity="0.3"></stop><stop offset="0.12" stop-color="#fff" stop-opacity="0.08"></stop><stop offset="0.5" stop-color="#fff" stop-opacity="0.05"></stop><stop offset="0.86" stop-color="#fff" stop-opacity="0.06"></stop><stop offset="0.95" stop-color="#fff" stop-opacity="0.24"></stop><stop offset="1" stop-color="#fff" stop-opacity="0.36"></stop></linearGradient>'
      + '<linearGradient id="lqRimH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.15"></stop><stop offset="0.09" stop-color="#fff" stop-opacity="0"></stop><stop offset="0.91" stop-color="#fff" stop-opacity="0"></stop><stop offset="1" stop-color="#fff" stop-opacity="0.15"></stop></linearGradient>'
      + '<linearGradient id="lqNotch" gradientUnits="userSpaceOnUse" x1="' + n(w / 2 - 37) + '" y1="0" x2="' + n(w / 2 + 37) + '" y2="56"><stop offset="0" stop-color="#fff" stop-opacity="0.5"></stop><stop offset="0.12" stop-color="#fff" stop-opacity="0.12"></stop><stop offset="0.45" stop-color="#fff" stop-opacity="0.03"></stop><stop offset="0.62" stop-color="#fff" stop-opacity="0.05"></stop><stop offset="0.8" stop-color="#fff" stop-opacity="0.42"></stop><stop offset="0.9" stop-color="#fff" stop-opacity="0.2"></stop><stop offset="1" stop-color="#fff" stop-opacity="0.08"></stop></linearGradient><linearGradient id="lqLens" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.03"></stop><stop offset="0.08" stop-color="#fff" stop-opacity="0"></stop><stop offset="0.92" stop-color="#fff" stop-opacity="0"></stop><stop offset="1" stop-color="#fff" stop-opacity="0.03"></stop></linearGradient>'
      + '<radialGradient id="lqDockFillG" cx="0.5" cy="0" r="1" gradientTransform="scale(0.45 1)" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#787880" stop-opacity="0.5"></stop><stop offset="1" stop-color="#28282c" stop-opacity="0.5"></stop></radialGradient><linearGradient id="lqPillV" x1="0" y1="0" x2="1" y2="1"><stop offset="0.14" stop-color="#fff" stop-opacity="0.62"></stop><stop offset="0.2" stop-color="#fff" stop-opacity="0.42"></stop><stop offset="0.3" stop-color="#fff" stop-opacity="0.1"></stop><stop offset="0.5" stop-color="#fff" stop-opacity="0.04"></stop><stop offset="0.7" stop-color="#fff" stop-opacity="0.06"></stop><stop offset="0.8" stop-color="#fff" stop-opacity="0.28"></stop><stop offset="0.86" stop-color="#fff" stop-opacity="0.44"></stop></linearGradient></defs>'
      + '<path d="' + d + '" fill="url(#lqLens)"></path><g clip-path="url(#lqDockClip)" fill="none" stroke-width="2"><path d="' + d + '" stroke="url(#lqRimV)"></path><path d="' + notchPath(w) + '" stroke="url(#lqNotch)" stroke-width="2.4"></path></g>'
      + '<path data-lqdockfill="1" d="' + d + '" fill="url(#lqDockFillG)" style="opacity:0"></path>';
  }
  function fadeContent(el, show, delay, dur) {
    if (!el || !el.animate) return;
    el.getAnimations().forEach(function (an) { an.cancel(); });
    var a = { opacity: 0, filter: "blur(8px)", transform: "translateY(8px)" }, b = { opacity: 1, filter: "blur(0px)", transform: "none" };
    // a drag that let go before closing left the content part-faded: fade back from there, not from blank
    var o0 = el.style.opacity === "" ? 0 : +el.style.opacity;
    if (show && o0 > 0) { a = { opacity: o0, filter: "blur(0px)", transform: "none" }; delay = 0; }
    el.animate(show ? [a, b] : [b, { opacity: 0 }], { duration: dur, delay: delay, easing: "cubic-bezier(.2,.8,.2,1)", fill: show ? "both" : "forwards" });
  }

  var cur = null;
  function run(o) {
    if (cur) cancelAnimationFrame(cur.raf);
    var R = o.refs || {}, sp = o.speed || 1, mode = o.mode || "Liquid", A = o.from, B = o.to, kind = o.kind;
    if (R.defs && !R.defs.firstChild) R.defs.innerHTML = GOO;
    var t0 = performance.now(), last = t0, job = cur = { raf: 0 };
    var st = { w: A.w, h: A.h, vw: 0, vh: 0, top: A.top, vt: 0, dock: A.dock, vd: 0 };
    if (R.defs && !R.defs.querySelector("#lqCardRim")) R.defs.insertAdjacentHTML("beforeend", '<linearGradient id="lqCardRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.55"></stop><stop offset="0.05" stop-color="#fff" stop-opacity="0.3"></stop><stop offset="0.12" stop-color="#fff" stop-opacity="0.08"></stop><stop offset="0.5" stop-color="#fff" stop-opacity="0.05"></stop><stop offset="0.86" stop-color="#fff" stop-opacity="0.06"></stop><stop offset="0.95" stop-color="#fff" stop-opacity="0.24"></stop><stop offset="1" stop-color="#fff" stop-opacity="0.36"></stop></linearGradient>');
    if (mode === "Fade") { mode = "Shape"; sp *= 2.5; }
    if (kind === "close") { if (R.content && +R.content.style.opacity === 0) { R.content.style.transition = "none"; } else fadeContent(R.content, false, 0, 140); }
    else fadeContent(R.content, true, 380 / sp, 240 / sp);

    function finish(g) { paint(R, g, mode); if (kind === "close" && R.dock) R.dock.style.translate = ""; cur = null; if (o.onFrame) o.onFrame(g); if (o.done) o.done(); }

    function frame(now) {
      if (cur !== job) return;
      var dt = Math.min(0.032, (now - last) / 1000) * sp, e = (now - t0) * sp, g;
      last = now;
      if (kind === "open") {
        var p = clamp(e / (560 * (o.dur || 1)), 0, 1), lb1 = B.top + B.h + LOBE;
        var eh = ease(p), ew = smooth(clamp((p - 0.04) / 0.96, 0, 1)) * 0.35 + ease(clamp((p - 0.04) / 0.96, 0, 1)) * 0.65;
        g = { w: mix(64, B.w, ew), h: mix(32.882, B.h, eh) };
        g.top = mix(839, lb1, ease(p)) - LOBE - g.h; g.t = p;
        g.dock = mix(A.dock, B.dock, ease(p)); g.away = ease(p);
        if (p >= 1) return finish(Object.assign({}, B, { t: 1 }));
      } else if (kind === "move") {
        var pm = clamp(e / (560 * (o.dur || 1)), 0, 1), em = ease(pm);
        g = { w: mix(A.w, B.w, em), h: mix(A.h, B.h, em), top: mix(A.top, B.top, em), t: 1, dock: mix(A.dock, B.dock, em), away: 1 };
        if (pm >= 1) return finish(Object.assign({}, B, { t: 1 }));
      } else {
        // q runs 1 -> 0 with an ease-out, so the shape leaves at speed (carrying on a released swipe) and lands softly.
        // Easing it a second time, ease(1 - smooth(r)), held the shape still for the first third of the close.
        var r = clamp(e / (560 * (o.dur || 1)), 0, 1), q = 1 - ease(r), lb0 = A.top + A.h + LOBE;
        g = { w: mix(64, A.w, q), h: mix(32.882, A.h, q) };
        g.top = mix(839, lb0, q) - LOBE - g.h; g.t = q * (A.t == null ? 1 : A.t);
        g.dock = mix(B.dock, A.dock, q); g.away = q * (A.away == null ? 1 : A.away);
        if (r >= 1) return finish(Object.assign({}, B, { t: 0 }));
      }
      paint(R, g, mode);
      if (o.onFrame) o.onFrame(g);
      job.raf = requestAnimationFrame(frame);
    }
    job.raf = requestAnimationFrame(frame);
  }

  function mount(comp, el) {
    var frame = el.firstChild, grp = frame && frame.firstChild;
    var sync = function () {
      var d = comp.dockRef.current; if (!d) return;
      var ds = d.style, st = comp.state, rest = comp.lqAtRest ? comp.lqAtRest() : (!st.lqOpen && !st.lqView && !comp._lqRun);
      el.style.left = ds.left; el.style.top = ds.top; el.style.width = ds.width; el.style.height = ds.height;
      frame.style.left = -(parseFloat(ds.left) || 0) + "px"; frame.style.top = -(parseFloat(ds.top) || 0) + "px";
      el.style.transition = rest ? ds.transition : "none"; el.style.transformOrigin = ds.transformOrigin; el.style.transform = rest ? ds.transform : "none"; el.style.opacity = rest ? ds.opacity : "";
      el.style.translate = rest ? ds.translate : ""; el.style.rotate = rest ? ds.rotate : "";
      var p = d.querySelector("[data-lqpill]");
      if (grp) { grp.style.transform = rest && p ? (p.style.transform || "") : "none"; grp.style.scale = rest && p ? (p.style.scale || "") : ""; }
    };
    comp._lqSync = sync;
    var d = comp.dockRef.current;
    if (d && window.MutationObserver) new MutationObserver(sync).observe(d, { attributes: true, attributeFilter: ["style"], subtree: true });
    sync();
    paint(comp.lqRefs(), Object.assign(geo(0, comp.state.kbLayout), { t: 0 }), "Shape");
  }
  function dragPose(R, A, B, p, mode) {
    if (cur) { cancelAnimationFrame(cur.raf); cur = null; }
    if (R.defs && !R.defs.firstChild) R.defs.innerHTML = GOO;
    var q = clamp(p, 0, 1.15), lb1 = B.top + B.h + LOBE, e1 = clamp(q, 0, 1);
    var ew = smooth(clamp((e1 - 0.04) / 0.96, 0, 1)) * 0.35 + clamp((e1 - 0.04) / 0.96, 0, 1) * 0.65;
    var g = { w: mix(64, B.w, ew), h: mix(32.882, B.h, q), t: e1, away: e1 };
    g.top = mix(839, lb1, q) - LOBE - g.h; g.dock = mix(A.dock, B.dock, e1);
    paint(R, g, mode || "Liquid");
    // the content fades with the finger over the first stretch of the drag instead of vanishing on touch
    if (R.content) { if (R.content.getAnimations) R.content.getAnimations().forEach(function (x) { x.cancel(); }); R.content.style.transition = "none"; R.content.style.opacity = String(n(clamp((e1 - 0.88) / 0.12, 0, 1))); }
    return g;
  }
  window.DockletLiquid = { dragPose: dragPose, mount: mount, dockPath: dockPath, cardPath: cardPath, geo: geo, check: check, rimMarkup: rimMarkup, run: run, paint: paint, GOO: GOO };
})();
