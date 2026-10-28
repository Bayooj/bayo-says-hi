/* ==========================================================================
   BAYO SAYS HI — interactions
   Content comes from js/data.js. Nothing in here needs editing to add films.
   ========================================================================== */
(function () {
  "use strict";

  var SITE = window.SITE || {};
  var PROJECTS = (window.PROJECTS || []).slice();
  var SERVICES = window.SERVICES || [];
  var PROCESS = window.PROCESS || [];
  var PRICING = window.PRICING || [];

  /* ------------------------------------------------------------ helpers */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); };
  var pad2 = function (n) { return String(n).padStart(2, "0"); };
  var slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var motionOK = function () { return !reduceMotion.matches && typeof Element.prototype.animate === "function"; };

  function hashStr(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var a = typeof seed === "number" ? seed : hashStr(String(seed));
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var between = function (r, a, b) { return a + (b - a) * r(); };
  var fmtTime = function (t) { t = Math.max(0, Math.round(t)); return pad2(Math.floor(t / 60)) + ":" + pad2(t % 60); };

  /* --------------------------------------------------------- normalise data */
  PROJECTS.forEach(function (p, i) {
    p.id = p.id || slug(p.title || "film-" + i);
    if (!p.videos && p.video) p.videos = [p.video];
    p.videos = (p.videos || []).filter(Boolean);
    p.stills = (p.stills || []).map(function (s) { return typeof s === "string" ? { src: s } : s; }).filter(function (s) { return s && s.src; });
    var v0 = p.videos[0] || {};
    if (!p.poster) {
      if (p.stills[0]) p.poster = p.stills[0].src;
      else if (v0.type === "youtube" && v0.id) p.poster = "https://i.ytimg.com/vi/" + encodeURIComponent(v0.id) + "/hqdefault.jpg";
      else p.poster = "";
    }
    if (!p.stills.length && p.poster) p.stills = [{ src: p.poster }];
    p.category = p.category || "Films";
    p.cat = slug(p.category);
    p.format = p.format || "16:9";
  });

  /* ---------------------------------------------------------- torn paper */
  function tornPolygon(seed, depth, sides) {
    var r = rng(seed);
    sides = sides || { t: 1, r: 1, b: 1, l: 1 };
    var n = 30, pts = [], i;
    var bite = function (on) { if (!on) return 0; var k = r(); return (k < 0.18 ? 1 : 0.5) * r() * depth; };
    for (i = 0; i <= n; i++) pts.push((i / n * 100).toFixed(2) + "% " + bite(sides.t).toFixed(1) + "px");
    for (i = 1; i <= n; i++) pts.push("calc(100% - " + bite(sides.r).toFixed(1) + "px) " + (i / n * 100).toFixed(2) + "%");
    for (i = n - 1; i >= 0; i--) pts.push((i / n * 100).toFixed(2) + "% calc(100% - " + bite(sides.b).toFixed(1) + "px)");
    for (i = n - 1; i >= 1; i--) pts.push(bite(sides.l).toFixed(1) + "px " + (i / n * 100).toFixed(2) + "%");
    return "polygon(" + pts.join(",") + ")";
  }
  function applyTorn(root) {
    $$("[data-torn]", root).forEach(function (el, i) {
      if (el.style.getPropertyValue("--torn")) return;
      var d = parseFloat(el.getAttribute("data-torn")) || 5;
      el.style.setProperty("--torn", tornPolygon((el.className || "x") + i + (el.textContent || "").slice(0, 12), d));
    });
  }

  /* ------------------------------------------------ hand-drawn scribbles */
  function smoothPath(pts) {
    var d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) +
        " " + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) +
        " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
    }
    return d;
  }
  function loopPath(seed, w, h) {
    var r = rng(seed), pts = [], steps = 30;
    var start = between(r, -2.7, -2.1), turns = between(r, 1.06, 1.16);
    var w1 = between(r, 0, 6.28), w2 = between(r, 0, 6.28);
    for (var i = 0; i <= steps; i++) {
      var t = i / steps, a = start + t * Math.PI * 2 * turns;
      var k = 1 + 0.05 * Math.sin(a * 2 + w1) + 0.035 * Math.sin(a * 3 + w2) + t * 0.07;
      pts.push([w / 2 + Math.cos(a) * (w / 2 - 4) * k * 0.94, h / 2 + Math.sin(a) * (h / 2 - 4) * k * 0.88]);
    }
    return smoothPath(pts);
  }
  function loopSVG(seed, w, h, cls) {
    return '<svg class="' + cls + '" viewBox="0 0 ' + w + " " + h + '" aria-hidden="true" focusable="false"><path pathLength="1" d="' + loopPath(seed, w, h) + '"/></svg>';
  }
  function drawOn(path, dur, delay) {
    if (!motionOK() || !path) return;
    path.style.strokeDasharray = "1";
    path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: dur || 600, delay: delay || 0, easing: "cubic-bezier(.6,.05,.3,1)", fill: "backwards" });
  }

  /* ----------------------------------------------------- ransom-note title */
  var RANSOM = [
    { ff: "var(--f-tabloid)", fg: "#f4f2ed", bg: "#141210", up: true },
    { ff: "var(--f-news)", fw: 900, fst: "italic", fg: "#171412", bg: "paper" },
    { ff: "var(--f-gothic)", fg: "#171412", bg: "news" },
    { ff: "var(--f-type)", fg: "#171412", bg: "paper" },
    { ff: "var(--f-hand)", fg: "#f4f2ed", bg: "#d4372c" },
    { ff: "var(--f-tabloid)", fg: "#d4372c", bg: "paper", up: true },
    { ff: "var(--f-news)", fw: 700, fg: "#171412", bg: "blue" },
    { ff: "var(--f-body)", fw: 700, fg: "#ece7dd", bg: "none" },
    { ff: "var(--f-tabloid)", fg: "#171412", bg: "kraft", up: true }
  ];
  var BG = {
    paper: ["var(--paper)", "var(--tex-speck)"],
    news: ["var(--newsprint)", "var(--tex-speck), var(--halftone)"],
    blue: ["var(--blue-paper)", "var(--tex-speck)"],
    kraft: ["#c6a676", "var(--tex-speck)"],
    none: ["transparent", "none"]
  };
  function buildRansom(h1) {
    if (!h1) return;
    var text = h1.getAttribute("data-text") || h1.textContent;
    var r = rng("ransom-" + text);
    var last = -1, html = "", letters = [];
    Array.prototype.forEach.call(text, function (ch) {
      if (ch === " ") { html += '<span class="ransom__space" aria-hidden="true"></span>'; return; }
      var idx;
      do { idx = Math.floor(r() * RANSOM.length); } while (idx === last);
      last = idx;
      var s = RANSOM[idx], bg = BG[s.bg] || [s.bg, "var(--tex-speck)"];
      var c = function () { return between(r, 0, 7).toFixed(1); };
      var clip = "polygon(" + c() + "% " + c() + "%, " + (100 - c()) + "% " + c() + "%, 100% " + (100 - c()) + "%, " + c() + "% 100%)";
      var rot = between(r, -9, 9).toFixed(1), dy = between(r, -0.07, 0.07).toFixed(3), fs = between(r, 0.82, 1.06).toFixed(2);
      letters.push({ rot: rot, dy: dy });
      html += '<span class="ransom__l" aria-hidden="true" style="--ff:' + s.ff + ";--fg:" + s.fg + ";--bgc:" + bg[0] + ";--bgi:" + bg[1] +
        ";--clip:" + clip + ";--fs:" + fs + "em;" + (s.fw ? "--fw:" + s.fw + ";" : "") + (s.fst ? "--fst:" + s.fst + ";" : "") +
        "transform:translateY(" + dy + "em) rotate(" + rot + 'deg)"><span>' + esc(s.up ? ch.toUpperCase() : ch) + "</span></span>";
    });
    h1.innerHTML = html;
    if (!motionOK()) return;
    $$(".ransom__l", h1).forEach(function (el, i) {
      var L = letters[i];
      el.animate([
        { transform: "translateY(calc(" + L.dy + "em - 30px)) rotate(" + (parseFloat(L.rot) + 18) + "deg) scale(1.55)" },
        { transform: "translateY(" + L.dy + "em) rotate(" + L.rot + "deg) scale(1)" }
      ], { duration: 520, delay: 120 + i * 75, easing: "cubic-bezier(.2,.9,.25,1.25)", fill: "backwards" });
    });
  }

  /* -------------------------------------------------------------- the board */
  var FRAMES = {
    magazine: { lg: 5, md: 3, mw: 420 },
    strip: { lg: 3, md: 2, mw: 250 },
    clipping: { lg: 4, md: 3, mw: 430 },
    filmstrip: { lg: 7, md: 6, mw: 640 },
    instax: { lg: 3, md: 2, mw: 270 },
    print: { lg: 5, md: 3, mw: 460 },
    polaroid: { lg: 3, md: 3, mw: 320 }
  };
  var TAPES = {
    magazine: [["red", 14, -12, -9, 92], ["masking", 86, -10, 7, 88]],
    strip: [["green", 50, -14, -4, 84]],
    clipping: [["masking", 18, -12, -8, 86], ["masking", 84, -8, 6, 70]],
    filmstrip: [["masking", 6, 30, 82, 64], ["masking", 94, 30, -84, 64]],
    instax: [["red", 50, -13, 3, 76]],
    print: [["blue", 9, -6, -38, 64], ["blue", 91, -6, 38, 64]],
    polaroid: [["masking", 50, -14, -2, 96]]
  };

  function stillAt(p, i) { var s = p.stills[i] || p.stills[0]; return s ? s.src : p.poster; }
  function img(src, eager) {
    return src ? '<img src="' + esc(src) + '" alt="" decoding="async"' + (eager ? "" : ' loading="lazy"') + ">" : "";
  }
  function metaLine(p) { return [p.category, p.year, p.status].filter(Boolean).join(" · "); }

  function frameHTML(p, i) {
    var f = p.frame, eager = i < 4;
    var media = '<span class="pic__media" style="--ar:' + (f === "instax" ? "9 / 16" : "") + '">' + img(stillAt(p, 0), eager) + "</span>";
    media = media.replace(' style="--ar:"', "");
    if (f === "polaroid" || f === "instax") {
      return '<span class="pic__paper ' + f + '">' + media + '<span class="polaroid__cap">' + esc(p.title) + "</span></span>";
    }
    if (f === "strip") {
      return '<span class="pic__paper strip">' + media +
        '<span class="strip__frame">' + img(stillAt(p, 1), eager) + "</span>" +
        '<span class="strip__frame">' + img(stillAt(p, 2), eager) + "</span>" +
        '<span class="strip__foot">' + esc(p.title) + " · " + esc(p.year || "") + "</span></span>";
    }
    if (f === "clipping") {
      return '<span class="pic__paper clipping" data-torn="5"><span class="clipping__kicker"><span>' + esc(p.kicker || p.category) + "</span><span>" + esc(p.year || "") + "</span></span>" +
        '<span class="clipping__head">' + esc(p.title) + "</span>" + media +
        '<span class="clipping__body"><span class="clipping__by">By Bayo, Vancouver</span>' + esc(p.notes || "") + "</span></span>";
    }
    if (f === "magazine") {
      var words = esc(p.title).split(" ");
      var head = words.length > 1 ? words.slice(0, -1).join(" ") + " <em>" + words[words.length - 1] + "</em>" : "<em>" + words[0] + "</em>";
      return '<span class="pic__paper magazine" data-torn="3">' + media.replace('class="pic__media"', 'class="pic__media" style="--ar:4 / 5"') +
        '<span class="magazine__issue"><span>' + esc(p.category) + "</span><span>issue " + pad2(i + 1) + "</span></span>" +
        '<span class="magazine__head">' + head + "</span>" +
        '<span class="magazine__pg">p. ' + (12 + i * 4) + "</span></span>";
    }
    if (f === "filmstrip") {
      return '<span class="pic__paper filmstrip"><span class="filmstrip__edge"><span>BSH</span><span>24 FPS</span><span>' + esc((p.title || "").toUpperCase()) + "</span></span>" +
        '<span class="filmstrip__frames">' + media +
        '<span class="filmstrip__frame">' + img(stillAt(p, 1), eager) + "</span>" +
        '<span class="filmstrip__frame">' + img(stillAt(p, 2), eager) + "</span></span>" +
        '<span class="filmstrip__edge filmstrip__edge--b"><span>' + pad2(i * 3 + 7) + "</span><span>" + pad2(i * 3 + 8) + "</span><span>" + pad2(i * 3 + 9) + "</span></span></span>";
    }
    return '<span class="pic__paper print">' + media + "</span>";
  }

  function cardHTML(p, i) {
    if (!FRAMES[p.frame]) p.frame = "print";
    var fd = FRAMES[p.frame], r = rng("card-" + p.id);
    var rot = p.frame === "filmstrip" ? between(r, -1.4, 1.4) : between(r, -3.4, 3.4);
    var y = between(r, 0, 16);
    var tapes = (TAPES[p.frame] || []).map(function (t) {
      return '<span class="tape tape--' + t[0] + '" style="--tx:' + t[1] + "%;--ty:" + t[2] + "px;--tr:" + t[3] + "deg;--tw:" + t[4] + 'px"></span>';
    }).join("");
    var stamp = "";
    if (p.stamp) stamp = '<span class="stamp" style="--ss:1.05rem;--sr:-9deg;right:-6px;bottom:22%">' + esc(p.stamp) + "</span>";
    else if (r() < 0.34) stamp = '<span class="stamp" style="--ss:.95rem;--sr:' + between(r, -14, 12).toFixed(0) + 'deg;right:8%;bottom:10%">BSH</span>';
    var showTitle = !/^(polaroid|instax|clipping|magazine)$/.test(p.frame);
    var label = "Play " + p.title + ", " + metaLine(p);
    return '<li class="board__item" data-cat="' + p.cat + '" data-id="' + esc(p.id) + '" style="--lg:' + (p.span || fd.lg) + ";--md:" + fd.md + ";--mw:" + fd.mw + 'px">' +
      '<button class="pic" type="button" data-film="' + esc(p.id) + '" aria-label="' + esc(label) + '" style="--r:' + rot.toFixed(2) + "deg;--y:" + y.toFixed(0) + 'px">' +
      frameHTML(p, i) + tapes + stamp +
      '<span class="pic__play" aria-hidden="true">' + loopSVG("play-" + p.id, 110, 70, "") + "<span>play</span></span>" +
      '<span class="pic__caption">' + (showTitle ? '<span class="pic__title">' + esc(p.title) + "</span>" : "") +
      '<span class="pic__meta">' + esc(metaLine(p)) + "</span></span>" +
      "</button></li>";
  }

  var SCRAPS = {
    note: '<li class="board__item board__scrap" data-cat="scrap" aria-hidden="true" style="--lg:2;--md:2;--mw:230px">' +
      '<div class="scrap newsprint" data-torn="4" style="--r:4deg"><p class="scrap__text">every frame here was shot &amp; cut by me</p>' +
      '<span class="stamp stamp--paper" style="--ss:.8rem;--sr:-12deg;position:absolute;right:10px;bottom:-8px">BSH</span></div></li>',
    ticket: '<li class="board__item board__scrap" data-cat="scrap" aria-hidden="true" style="--lg:3;--md:3;--mw:300px">' +
      '<div class="ticket" style="--r:-3deg"><span class="ticket__small">BSH screening room</span><span class="ticket__no">No. 0427</span>' +
      '<span class="ticket__big">Admit one</span><span class="ticket__small">now showing: everything above</span></div></li>'
  };

  var board = $("[data-board]");
  var state = { filter: "all", route: null, pendingPackage: null, focusForm: false };

  function renderBoard() {
    if (!board) return;
    var html = "";
    PROJECTS.forEach(function (p, i) {
      html += cardHTML(p, i);
      if (i === 4) html += SCRAPS.note;
    });
    if (PROJECTS.length > 3) html += SCRAPS.ticket;
    board.innerHTML = html;
    applyTorn(board);
    var note = $("[data-sample-note]");
    if (note) note.hidden = !PROJECTS.some(function (p) { return p.sample; });
    $$(".board__item", board).forEach(watch);
    if (finePointer.matches) $$(".pic", board).forEach(attachPreview);
  }

  function layoutBoard() {
    if (!board || board.offsetParent === null) return;
    var cols = parseInt(getComputedStyle(board).getPropertyValue("--cols"), 10) || 1;
    var items = $$(".board__item", board);
    if (cols < 2) {
      board.classList.remove("is-masonry");
      items.forEach(function (li) { li.style.removeProperty("--rows"); });
      return;
    }
    board.classList.add("is-masonry");
    items.forEach(function (li) {
      if (li.hidden) return;
      li.style.setProperty("--rows", Math.ceil(li.getBoundingClientRect().height / 6));
    });
  }

  function renderFilters() {
    var wrap = $("[data-filters]");
    if (!wrap) return;
    var cats = [];
    PROJECTS.forEach(function (p) { if (cats.indexOf(p.category) < 0) cats.push(p.category); });
    if (cats.length < 2) { wrap.hidden = true; return; }
    var list = [{ key: "all", label: "all", n: PROJECTS.length }].concat(cats.map(function (c) {
      return { key: slug(c), label: c, n: PROJECTS.filter(function (p) { return p.category === c; }).length };
    }));
    wrap.innerHTML = list.map(function (f, i) {
      var tilt = (rng("filter" + i)() * 4 - 2).toFixed(1);
      return '<button class="filter" type="button" data-filter="' + f.key + '" aria-pressed="' + (f.key === "all") + '" style="--fr:' + tilt + 'deg">' +
        esc(f.label) + '<span class="filter__n" aria-hidden="true">' + pad2(f.n) + "</span></button>";
    }).join("");
    wrap.addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]");
      if (b) applyFilter(b.getAttribute("data-filter"));
    });
  }

  function applyFilter(key) {
    if (key === state.filter) return;
    state.filter = key;
    $$("[data-filter]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === key)); });
    var items = $$(".board__item", board);
    var first = new Map();
    items.forEach(function (li) { if (!li.hidden) first.set(li, li.getBoundingClientRect()); });
    items.forEach(function (li) {
      var cat = li.getAttribute("data-cat");
      li.hidden = key === "all" ? false : cat !== key;
    });
    layoutBoard();
    if (!motionOK()) return;
    items.forEach(function (li) {
      if (li.hidden) return;
      var last = li.getBoundingClientRect(), f = first.get(li);
      if (f) {
        var dx = f.left - last.left, dy = f.top - last.top;
        if (Math.abs(dx) + Math.abs(dy) > 1) li.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }], { duration: 560, easing: "cubic-bezier(.2,.8,.2,1)" });
      } else {
        li.animate([{ transform: "translateY(-26px) rotate(4deg) scale(.92)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 480, easing: "cubic-bezier(.2,.9,.25,1.2)" });
      }
    });
  }

  /* --------------------------------------------------- hover previews */
  function previewSrc(p) {
    if (p.preview) return p.preview;
    var v = p.videos[0];
    return v && v.type === "file" ? v.src : null;
  }
  function attachPreview(btn) {
    var p = byId(btn.getAttribute("data-film"));
    var src = p && previewSrc(p);
    if (!src) return;
    var media = $(".pic__media", btn);
    var start = function () {
      if (reduceMotion.matches || sr.open) return;
      var v = $("video", media);
      if (!v) {
        v = document.createElement("video");
        v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto";
        v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
        v.src = src;
        media.appendChild(v);
      }
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () {});
      media.classList.add("is-previewing");
    };
    var stop = function () {
      var v = $("video", media);
      if (v) v.pause();
      media.classList.remove("is-previewing");
    };
    btn.addEventListener("pointerenter", start);
    btn.addEventListener("pointerleave", stop);
    btn.addEventListener("focus", start);
    btn.addEventListener("blur", stop);
  }
  function stopAllPreviews() {
    $$(".pic__media video").forEach(function (v) { v.pause(); });
    $$(".pic__media.is-previewing").forEach(function (m) { m.classList.remove("is-previewing"); });
  }

  /* --------------------------------------------------- screening room */
  var sr = {
    el: $("#screening"),
    open: false, list: [], index: 0, cut: 0, origin: null, lastFocus: null, busy: false
  };
  if (sr.el) {
    sr.frame = $("[data-sr-frame]", sr.el);
    sr.player = $("[data-sr-player]", sr.el);
    sr.under = $("[data-sr-under]", sr.el);
    sr.title = $("[data-sr-title]", sr.el);
    sr.meta = $("[data-sr-meta]", sr.el);
    sr.notes = $("[data-sr-notes]", sr.el);
    sr.sample = $("[data-sr-sample]", sr.el);
    sr.count = $("[data-sr-count]", sr.el);
    sr.cutsWrap = $("[data-sr-cuts-wrap]", sr.el);
    sr.cuts = $("[data-sr-cuts]", sr.el);
    sr.scenesWrap = $("[data-sr-scenes-wrap]", sr.el);
    sr.scenes = $("[data-sr-scenes]", sr.el);
  }
  function byId(id) { for (var i = 0; i < PROJECTS.length; i++) if (PROJECTS[i].id === id) return PROJECTS[i]; return null; }
  function visibleProjects() {
    return state.filter === "all" ? PROJECTS : PROJECTS.filter(function (p) { return p.cat === state.filter; });
  }
  function cardFor(id) { return board ? $('.pic[data-film="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]', board) : null; }
  function parseFormat(f) {
    var m = String(f || "16:9").split(/[:/x]/).map(Number);
    return m.length === 2 && m[0] > 0 && m[1] > 0 ? m : [16, 9];
  }

  function stopPlayer() {
    $$("video", sr.player).forEach(function (v) { try { v.pause(); v.removeAttribute("src"); v.load(); } catch (e) { /* ignore */ } });
    sr.player.innerHTML = "";
  }

  function setPlayer(p, i) {
    var v = p.videos[i] || {};
    sr.cut = i;
    var ar = parseFormat(v.format || p.format);
    sr.frame.style.setProperty("--ar", ar[0] + " / " + ar[1]);
    sr.frame.style.setProperty("--arn", (ar[0] / ar[1]).toFixed(4));
    stopPlayer();
    var node, link = "", where = "";
    if (v.type === "youtube" && v.id) {
      node = document.createElement("iframe");
      node.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.id) + "?autoplay=1&rel=0&playsinline=1&modestbranding=1";
      link = "https://www.youtube.com/watch?v=" + encodeURIComponent(v.id); where = "YouTube";
    } else if (v.type === "vimeo" && v.id) {
      node = document.createElement("iframe");
      node.src = "https://player.vimeo.com/video/" + encodeURIComponent(v.id) + "?autoplay=1&title=0&byline=0&portrait=0&dnt=1";
      link = "https://vimeo.com/" + encodeURIComponent(v.id); where = "Vimeo";
    } else if (v.src) {
      var vid = document.createElement("video");
      vid.controls = true; vid.playsInline = true; vid.preload = "auto";
      vid.setAttribute("playsinline", "");
      if (v.poster || p.poster) vid.poster = v.poster || p.poster;
      vid.src = v.src;
      vid.setAttribute("aria-label", p.title + ", " + (v.label || "film"));
      node = vid;
    }
    if (node && node.tagName === "IFRAME") {
      node.title = p.title + " (" + (v.label || "film") + ")";
      node.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      node.setAttribute("allowfullscreen", "");
      node.loading = "eager";
    }
    if (node) sr.player.appendChild(node);
    var left = "<span>" + esc(p.title) + " · " + esc(v.label || "film") + "</span>";
    var right = link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">watch on ' + where + " ↗</a>" : "<span>" + esc(ar[0] + ":" + ar[1]) + "</span>";
    sr.under.innerHTML = left + right;
    $$("[data-cut]", sr.cuts).forEach(function (b) { b.setAttribute("aria-current", String(Number(b.getAttribute("data-cut")) === i)); });
    if (node && node.tagName === "VIDEO") {
      var pr = node.play();
      if (pr && pr.catch) pr.catch(function () {
        node.muted = true;
        var p2 = node.play();
        if (p2 && p2.then) p2.then(function () {
          sr.under.insertAdjacentHTML("beforeend", '<span class="sr-under__hint">playing muted: turn the sound on in the player</span>');
        }).catch(function () {});
      });
    }
  }

  function renderFilm() {
    var p = sr.list[sr.index];
    if (!p) return;
    sr.title.textContent = p.title;
    sr.count.textContent = pad2(sr.index + 1) + " / " + pad2(sr.list.length);
    var fmt = parseFormat(p.format);
    var rows = [["type", p.category], ["client", p.client], ["role", p.role], ["year", p.year], ["status", p.status],
      ["format", fmt[0] < fmt[1] ? "Vertical " + fmt[0] + ":" + fmt[1] : fmt[0] + ":" + fmt[1]]];
    sr.meta.innerHTML = rows.filter(function (r) { return r[1]; }).map(function (r) {
      return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>";
    }).join("");
    sr.notes.textContent = p.notes || "";
    sr.notes.hidden = !p.notes;
    sr.sample.hidden = !p.sample;
    if (p.videos.length > 1) {
      sr.cutsWrap.hidden = false;
      sr.cuts.innerHTML = p.videos.map(function (v, i) {
        return '<button class="sr-chip" type="button" data-cut="' + i + '" aria-current="' + (i === 0) + '"><img src="' + esc(v.poster || p.poster) + '" alt="">' + esc(v.label || "Cut " + (i + 1)) + "</button>";
      }).join("");
    } else { sr.cutsWrap.hidden = true; sr.cuts.innerHTML = ""; }
    var scenes = p.stills.filter(function (s) { return typeof s.t === "number"; }).sort(function (a, b) { return a.t - b.t; });
    if (scenes.length > 1 && p.videos[0] && p.videos[0].type !== "youtube" && p.videos[0].type !== "vimeo") {
      sr.scenesWrap.hidden = false;
      sr.scenes.innerHTML = scenes.map(function (s) {
        return '<button class="sr-chip" type="button" data-seek="' + s.t + '"><img src="' + esc(s.src) + '" alt="">' + fmtTime(s.t) + "</button>";
      }).join("");
    } else { sr.scenesWrap.hidden = true; sr.scenes.innerHTML = ""; }
    setPlayer(p, 0);
  }

  function openFilm(id, originEl, viaKeyboard) {
    if (!sr.el || sr.open) return;
    sr.list = visibleProjects();
    sr.index = Math.max(0, sr.list.findIndex(function (p) { return p.id === id; }));
    if (!sr.list[sr.index] || !sr.list[sr.index].videos.length) return;
    sr.origin = originEl || cardFor(id);
    sr.lastFocus = document.activeElement;
    stopAllPreviews();
    hideCursorTag();
    sr.el.hidden = false;
    sr.open = true;
    document.documentElement.classList.add("is-locked");
    renderFilm();
    if (motionOK()) {
      var media = sr.origin && $(".pic__media", sr.origin);
      var from = media ? media.getBoundingClientRect() : null;
      var to = sr.frame.getBoundingClientRect();
      $(".screening__backdrop", sr.el).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: "ease-out" });
      if (from && from.width && to.width) {
        sr.frame.animate([
          { transform: "translate(" + (from.left - to.left) + "px," + (from.top - to.top) + "px) scale(" + (from.width / to.width) + "," + (from.height / to.height) + ")" },
          { transform: "none" }
        ], { duration: 580, easing: "cubic-bezier(.2,.8,.2,1)" });
      }
      $$(".screening__bar, .sr-navs, .screening__info", sr.el).forEach(function (el, i) {
        el.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: 240 + i * 70, easing: "ease-out", fill: "backwards" });
      });
    }
    var target = viaKeyboard ? $(".sr-close", sr.el) : $(".screening__inner", sr.el);
    if (target) target.focus({ preventScroll: true });
  }

  function closeFilm() {
    if (!sr.open) return;
    sr.open = false;
    var finish = function () {
      stopPlayer();
      sr.el.hidden = true;
      document.documentElement.classList.remove("is-locked");
      var f = sr.origin && document.body.contains(sr.origin) ? sr.origin : sr.lastFocus;
      if (f && f.focus) f.focus({ preventScroll: true });
    };
    if (!motionOK()) { finish(); return; }
    var media = sr.origin && $(".pic__media", sr.origin);
    var to = media ? media.getBoundingClientRect() : null;
    var from = sr.frame.getBoundingClientRect();
    var anims = [$(".screening__backdrop", sr.el).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: "ease-in", fill: "forwards" })];
    $$(".screening__bar, .sr-navs, .screening__info", sr.el).forEach(function (el) {
      anims.push(el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" }));
    });
    if (to && to.width && to.bottom > 0 && to.top < window.innerHeight) {
      anims.push(sr.frame.animate([{ transform: "none" }, {
        transform: "translate(" + (to.left - from.left) + "px," + (to.top - from.top) + "px) scale(" + (to.width / from.width) + "," + (to.height / from.height) + ")"
      }], { duration: 440, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" }));
    } else {
      anims.push(sr.frame.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.96)" }], { duration: 240, fill: "forwards" }));
    }
    Promise.all(anims.map(function (a) { return a.finished; })).then(function () {
      finish();
      anims.forEach(function (a) { a.cancel(); });
    }, finish);
  }

  function go(delta) {
    if (!sr.open || sr.list.length < 2 || sr.busy) return;
    sr.index = (sr.index + delta + sr.list.length) % sr.list.length;
    sr.origin = cardFor(sr.list[sr.index].id) || sr.origin;
    if (!motionOK()) { renderFilm(); return; }
    sr.busy = true;
    var out = sr.frame.animate([{ transform: "none", opacity: 1 }, { transform: "translateX(" + (-delta * 46) + "px) rotate(" + (-delta * 2) + "deg)", opacity: 0 }], { duration: 170, easing: "ease-in" });
    out.onfinish = function () {
      renderFilm();
      sr.frame.animate([{ transform: "translateX(" + (delta * 46) + "px) rotate(" + (delta * 2) + "deg)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
      sr.busy = false;
    };
  }

  function trapFocus(e) {
    var f = $$('button:not([disabled]), a[href], video[controls], iframe, [tabindex]:not([tabindex="-1"])', sr.el).filter(function (el) { return el.offsetParent !== null || el.tagName === "IFRAME"; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function initScreening() {
    if (!sr.el) return;
    sr.el.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest("[data-close]")) { closeFilm(); return; }
      if (t.closest("[data-sr-prev]")) { go(-1); return; }
      if (t.closest("[data-sr-next]")) { go(1); return; }
      var cut = t.closest("[data-cut]");
      if (cut) { setPlayer(sr.list[sr.index], Number(cut.getAttribute("data-cut"))); return; }
      var seek = t.closest("[data-seek]");
      if (seek) {
        var v = $("video", sr.player);
        if (v) { v.currentTime = Number(seek.getAttribute("data-seek")); var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        return;
      }
      if (t === sr.el || t.classList.contains("screening__inner") || t.classList.contains("screening__stage")) closeFilm();
    });
    document.addEventListener("keydown", function (e) {
      if (!sr.open) return;
      if (e.key === "Escape") { e.preventDefault(); closeFilm(); }
      else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && !(e.target && (e.target.tagName === "VIDEO" || e.target.closest("input, textarea, select")))) {
        e.preventDefault(); go(e.key === "ArrowRight" ? 1 : -1);
      } else if (e.key === "Tab") trapFocus(e);
    });
    if (board) board.addEventListener("click", function (e) {
      var b = e.target.closest(".pic[data-film]");
      if (b) openFilm(b.getAttribute("data-film"), b, e.detail === 0);
    });
  }

  /* ---------------------------------------------------- cursor title tag */
  var tag = $("[data-cursor-tag]");
  function hideCursorTag() { if (tag) tag.classList.remove("is-on"); }
  function initCursorTag() {
    if (!tag || !finePointer.matches) return;
    var x = 0, y = 0, raf = 0, on = null;
    document.addEventListener("pointermove", function (e) {
      x = e.clientX; y = e.clientY;
      var pic = !sr.open && e.target && e.target.closest ? e.target.closest(".pic[data-film]") : null;
      if (pic !== on) {
        on = pic;
        if (pic) { var p = byId(pic.getAttribute("data-film")); tag.textContent = "▶ " + (p ? p.title : "play"); }
        tag.classList.toggle("is-on", !!pic);
      }
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; tag.style.transform = "translate(" + (x + 18) + "px," + (y + 20) + "px) rotate(-4deg)"; });
    }, { passive: true });
    document.addEventListener("pointerleave", hideCursorTag);
  }

  /* --------------------------------------------------------- services */
  function renderServices() {
    var ads = $("[data-services]");
    if (ads) ads.innerHTML = SERVICES.map(function (s) {
      return '<article class="ad"><h3 class="ad__title">' + esc(s.title) + '</h3><p class="ad__text">' + esc(s.text) + "</p></article>";
    }).join("");
    var list = $("[data-process]");
    if (list) {
      list.innerHTML = PROCESS.map(function (s, i) {
        var rot = (rng("slate" + i)() * 3 - 1.5).toFixed(2);
        return '<li class="slate-wrap" data-reveal="slate"><div class="slate" style="--r:' + rot + 'deg">' +
          '<div class="slate__stick" aria-hidden="true"></div><div class="slate__hinge" aria-hidden="true"></div>' +
          '<div class="slate__body"><div class="slate__row"><span>scene<b>' + (i + 1) + "</b></span><span>prod.<b>your film</b></span></div>" +
          '<h3 class="slate__title">' + esc(s.title) + '</h3><p class="slate__text">' + esc(s.text) + "</p></div></div></li>";
      }).join("");
      $$(".slate-wrap", list).forEach(watch);
    }
  }

  /* ---------------------------------------------------------- pricing */
  function renderPricing() {
    var wrap = $("[data-pricing]");
    if (!wrap) return;
    var count = 0;
    wrap.innerHTML = PRICING.map(function (g) {
      var parts = String(g.group).split(" ");
      var first = parts.shift();
      return '<section class="rate-group"><h2 class="rate-group__title">' + esc(first) + " <span>" + esc(parts.join(" ")) + '</span></h2><ul class="receipts">' +
        g.packages.map(function (p) {
          count++;
          var rot = (rng("rcpt" + count)() * 2.4 - 1.2).toFixed(2);
          var price = p.price
            ? '<span class="price">from $' + esc(String(p.price).replace(/^\$/, "")) + "</span>"
            : '<span class="price price--blank"><span aria-hidden="true">$ ______</span><span class="sr-only">price on request</span></span>';
          return '<li class="receipt-wrap" data-reveal><article class="receipt" style="--r:' + rot + 'deg">' +
            '<header class="receipt__head"><span>Bayo says hi</span><span>No. ' + String(count).padStart(4, "0") + "</span></header>" +
            '<h3 class="receipt__name">' + esc(p.name) + "</h3>" +
            (p.blurb ? '<p class="receipt__blurb">' + esc(p.blurb) + "</p>" : "") +
            '<ul class="receipt__items">' + (p.items || []).map(function (it) {
              return "<li><span>" + esc(it) + '</span><span class="receipt__dots" aria-hidden="true"></span><span class="receipt__tick" aria-hidden="true">✓</span></li>';
            }).join("") + "</ul>" +
            '<p class="receipt__total"><span>total</span>' + price + "</p>" +
            '<a class="btn-tag btn-tag--small" href="#about" data-goto-form data-package="' + esc(p.name) + '">Reach out to me</a>' +
            '<p class="receipt__foot">thank you · vancouver bc</p></article></li>';
        }).join("") + "</ul></section>";
    }).join("");
    $$(".receipt-wrap", wrap).forEach(watch);
  }

  /* ---------------------------------------------------- contact + form */
  function renderContact() {
    var email = SITE.email || "";
    $$("[data-email]").forEach(function (el) { el.textContent = email; });
    $$("[data-mailto]").forEach(function (a) { a.href = "mailto:" + email; });
    var socials = (SITE.socials || []).filter(function (s) { return s && s.url; });
    $$("[data-socials]").forEach(function (ul) {
      ul.innerHTML = socials.map(function (s) { return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + " ↗</a></li>"; }).join("");
      ul.hidden = !socials.length;
    });
  }

  function copyText(text, btn, fallbackEl) {
    var label = btn.textContent;
    var done = function (msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = label; }, 1800); };
    var fallback = function () {
      if (fallbackEl) {
        if (fallbackEl.select) { fallbackEl.focus(); fallbackEl.select(); }
        else {
          var range = document.createRange(); range.selectNodeContents(fallbackEl);
          var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        }
      }
      done("selected");
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done("copied"); }, fallback);
      else fallback();
    } catch (e) { fallback(); }
  }

  function initForm() {
    var form = $("#booking");
    if (!form) return;
    var typeSel = $("[data-type-select]", form), monthSel = $("[data-month-select]", form);
    var types = [];
    PRICING.forEach(function (g) { (g.packages || []).forEach(function (p) { if (types.indexOf(p.name) < 0) types.push(p.name); }); });
    ["Editing & colour only", "Something else"].forEach(function (t) { if (types.indexOf(t) < 0) types.push(t); });
    typeSel.innerHTML = '<option value="">Pick one</option>' + types.map(function (t) { return "<option>" + esc(t) + "</option>"; }).join("");
    var now = new Date(), months = [];
    for (var i = 0; i < 12; i++) {
      var d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push(d.toLocaleDateString("en-CA", { month: "long", year: "numeric" }));
    }
    monthSel.innerHTML = '<option value="">Not sure yet</option>' + months.map(function (m) { return "<option>" + esc(m) + "</option>"; }).join("");

    var checks = [
      ["bk-first", function (v) { return v.trim().length > 0; }],
      ["bk-email", function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }],
      ["bk-message", function (v) { return v.trim().length > 2; }]
    ];
    var setValid = function (el, ok) {
      el.closest(".field").classList.toggle("is-invalid", !ok);
      el.setAttribute("aria-invalid", String(!ok));
      var err = $('[data-error-for="' + el.id + '"]', form);
      if (err) { err.id = el.id + "-err"; if (!ok) el.setAttribute("aria-describedby", err.id); else el.removeAttribute("aria-describedby"); }
    };
    checks.forEach(function (c) {
      var el = $("#" + c[0]);
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") setValid(el, c[1](el.value)); });
    });

    var status = $("[data-status]", form);
    var submit = $('button[type="submit"]', form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      checks.forEach(function (c) {
        var el = $("#" + c[0]), ok = c[1](el.value);
        setValid(el, ok);
        if (!ok && !firstBad) firstBad = el;
      });
      if (firstBad) { firstBad.focus(); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
      var name = [data.firstName, data.lastName].filter(Boolean).join(" ");
      var body = [
        "Hi Bayo,", "", data.message, "",
        "Project: " + (data.projectType || "Not sure yet"),
        "When: " + (data.month || "Not sure yet"),
        "Budget: " + (data.budget || "Not sure yet"), "",
        name, data.email
      ].join("\n");
      status.hidden = false;

      if (SITE.formEndpoint) {
        submit.disabled = true;
        status.innerHTML = "<p>Sending…</p>";
        fetch(SITE.formEndpoint, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(data) })
          .then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            status.innerHTML = "<p>Thanks, " + esc(data.firstName) + ". Your message is in, and I'll reply to " + esc(data.email) + ".</p>";
            stampReceived(form);
            form.reset();
          })
          .catch(function () {
            status.innerHTML = "<p>That didn't go through. Check your connection and try again, or email me at " + esc(SITE.email) + ".</p>";
          })
          .then(function () { submit.disabled = false; });
        return;
      }

      var subject = "Project enquiry: " + (data.projectType || "new project") + " (" + name + ")";
      var href = "mailto:" + (SITE.email || "") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status.innerHTML = "<p>Your email app should open with this message, ready to send to <strong>" + esc(SITE.email) + "</strong>. If nothing opens, copy it and email it yourself.</p>" +
        '<label class="sr-only" for="bk-copy">Your message</label><textarea id="bk-copy" readonly>' + esc(body) + "</textarea>" +
        '<div><button class="mini-btn mini-btn--ink" type="button" data-copy-message>copy message</button></div>';
      var copyBtn = $("[data-copy-message]", status), ta = $("#bk-copy", status);
      copyBtn.addEventListener("click", function () { copyText(body, copyBtn, ta); });
      try { window.location.href = href; } catch (err) { /* email app not available */ }
    });
  }
  function stampReceived(form) {
    var s = document.createElement("span");
    s.className = "stamp stamp--paper booking__received";
    s.setAttribute("aria-hidden", "true");
    s.textContent = "received";
    form.appendChild(s);
    if (motionOK()) s.animate([{ transform: "rotate(-14deg) scale(2.2)", opacity: 0 }, { transform: "rotate(-14deg) scale(1)", opacity: 1 }], { duration: 380, easing: "cubic-bezier(.2,.9,.25,1.3)" });
  }

  function focusForm() {
    var form = $("#booking");
    if (!form) return;
    var pkg = state.pendingPackage;
    state.pendingPackage = null;
    if (pkg) {
      var sel = $("[data-type-select]", form);
      var has = $$("option", sel).some(function (o) { return o.value === pkg || o.textContent === pkg; });
      if (!has) sel.insertAdjacentHTML("beforeend", "<option>" + esc(pkg) + "</option>");
      sel.value = pkg;
    }
    form.scrollIntoView({ behavior: motionOK() ? "smooth" : "auto", block: "start" });
    var first = $("#bk-first", form);
    setTimeout(function () { if (first) first.focus({ preventScroll: true }); }, motionOK() ? 450 : 0);
  }

  /* ------------------------------------------------------------ router */
  var ROUTES = ["work", "services", "pricing", "about"];
  var wipeEl = $("[data-wipe]");
  function routeFromHash() {
    var h = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (ROUTES.indexOf(h) >= 0) return h;
    return h ? state.route || "work" : "work";
  }
  function jumpTop() {
    var root = document.documentElement, prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = prev;
  }
  function updateNav(route, animate) {
    $$(".nav__link").forEach(function (a) {
      var active = a.getAttribute("data-route") === route;
      var old = $(".nav__circle", a);
      if (active) {
        a.setAttribute("aria-current", "page");
        if (!old) {
          var w = Math.max(60, Math.round(a.offsetWidth * 1.32)), h = Math.max(30, Math.round(a.offsetHeight * 1.52));
          a.insertAdjacentHTML("beforeend", loopSVG("nav-" + route, w, h, "nav__circle"));
          if (animate) drawOn($(".nav__circle path", a), 650, 120);
        }
      } else {
        a.removeAttribute("aria-current");
        if (old) old.remove();
      }
    });
  }
  function wipe(route, midpoint) {
    if (!wipeEl) { midpoint(); return; }
    var label = $("[data-wipe-label]", wipeEl);
    if (label) label.textContent = route === "about" ? "about / contact" : route;
    wipeEl.style.setProperty("--torn", tornPolygon("wipe" + route + Date.now() % 97, 26, { t: 1, r: 0, b: 1, l: 0 }));
    wipeEl.hidden = false;
    var a1 = wipeEl.animate([{ transform: "translateY(110%)" }, { transform: "translateY(0%)" }], { duration: 340, easing: "cubic-bezier(.7,0,.3,1)", fill: "forwards" });
    a1.onfinish = function () {
      midpoint();
      var a2 = wipeEl.animate([{ transform: "translateY(0%)" }, { transform: "translateY(-112%)" }], { duration: 420, delay: 90, easing: "cubic-bezier(.7,0,.3,1)", fill: "forwards" });
      a2.onfinish = function () { wipeEl.hidden = true; a1.cancel(); a2.cancel(); };
    };
  }
  function showRoute(route, initial) {
    if (route === state.route) {
      if (state.focusForm && route === "about") { state.focusForm = false; focusForm(); }
      return;
    }
    var swap = function () {
      $$(".page").forEach(function (p) { p.hidden = p.getAttribute("data-page") !== route; });
      state.route = route;
      updateNav(route, !initial);
      closeMenu();
      if (!initial) jumpTop();
      if (route === "work") requestAnimationFrame(layoutBoard);
      if (state.focusForm && route === "about") { state.focusForm = false; setTimeout(focusForm, 60); }
      if (!initial && !state.focusForm) { var m = $("#main"); if (m) m.focus({ preventScroll: true }); }
    };
    if (initial || !motionOK()) swap(); else wipe(route, swap);
  }
  function initRouter() {
    window.addEventListener("hashchange", function () {
      if (sr.open) closeFilm();
      showRoute(routeFromHash(), false);
    });
    document.addEventListener("click", function (e) {
      var skip = e.target.closest(".skip-link");
      if (skip) {
        e.preventDefault();
        var m = $("#main");
        if (m) { m.focus(); m.scrollIntoView({ block: "start" }); }
        return;
      }
      var go = e.target.closest("[data-goto-form]");
      if (go) {
        e.preventDefault();
        state.pendingPackage = go.getAttribute("data-package") || null;
        state.focusForm = true;
        if (routeFromHash() === "about" && state.route === "about") { state.focusForm = false; focusForm(); }
        else location.hash = "about";
        return;
      }
      var link = e.target.closest(".nav__link, .brand");
      if (link && link.getAttribute("href") === "#" + state.route) {
        e.preventDefault();
        closeMenu();
        window.scrollTo({ top: 0, behavior: motionOK() ? "smooth" : "auto" });
      }
    });
    showRoute(routeFromHash(), true);
  }

  /* -------------------------------------------------------------- menu */
  var masthead = $(".masthead"), menuBtn = $(".menu-btn");
  function closeMenu() {
    if (!masthead || !masthead.classList.contains("is-open")) return;
    masthead.classList.remove("is-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }
  function initMenu() {
    if (!menuBtn) return;
    menuBtn.addEventListener("click", function () {
      var open = !masthead.classList.contains("is-open");
      masthead.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      if (open) { updateNav(state.route, true); var a = $(".nav__link", masthead); if (a) a.focus(); }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    document.addEventListener("click", function (e) { if (masthead.classList.contains("is-open") && !e.target.closest(".masthead")) closeMenu(); });
  }

  /* ------------------------------------------------------------ reveal */
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      settle(en.target);
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }) : null;
  function watch(el) { if (io && motionOK()) io.observe(el); }
  function settle(el) {
    if (!motionOK()) return;
    var r = rng("settle" + (el.getAttribute("data-id") || el.textContent.slice(0, 24)));
    var rot = between(r, -4, 4).toFixed(1);
    el.animate([{ transform: "translateY(-18px) rotate(" + rot + "deg) scale(1.045)" }, { transform: "none" }], { duration: 640, easing: "cubic-bezier(.2,.9,.25,1.2)" });
    if (el.getAttribute("data-reveal") === "slate") {
      var stick = $(".slate__stick", el);
      if (stick) stick.animate([
        { transform: "rotate(0deg)" }, { transform: "rotate(-24deg)", offset: 0.42 },
        { transform: "rotate(0deg)", offset: 0.7 }, { transform: "rotate(-4deg)", offset: 0.82 }, { transform: "rotate(0deg)" }
      ], { duration: 950, delay: 260, easing: "ease-in-out" });
    }
  }

  /* -------------------------------------------------------------- misc */
  function initMisc() {
    var d = new Date();
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], mons = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    $$("[data-today]").forEach(function (el) { el.textContent = "Vancouver, B.C. · " + days[d.getDay()] + " " + d.getDate() + " " + mons[d.getMonth()] + " " + d.getFullYear(); });
    $$("[data-year]").forEach(function (el) { el.textContent = d.getFullYear(); });
    $$("[data-to-top]").forEach(function (b) { b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: motionOK() ? "smooth" : "auto" }); }); });
    $$("[data-copy-email]").forEach(function (b) {
      b.addEventListener("click", function () { copyText(SITE.email || "", b, $("[data-email]")); });
    });
    var arrow = $(".hand-arrow");
    if (arrow) $$("path", arrow).forEach(function (p, i) { drawOn(p, 700, 1400 + i * 500); });
    applyTorn(document);
  }

  /* -------------------------------------------------------------- boot */
  buildRansom($(".ransom"));
  renderFilters();
  renderBoard();
  renderServices();
  renderPricing();
  renderContact();
  initForm();
  initScreening();
  initCursorTag();
  initMenu();
  initMisc();
  initRouter();
  layoutBoard();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutBoard);
  window.addEventListener("load", layoutBoard);
  if ("ResizeObserver" in window && board) {
    var lastW = 0;
    new ResizeObserver(function (entries) {
      var w = Math.round(entries[0].contentRect.width);
      if (w !== lastW) { lastW = w; layoutBoard(); }
    }).observe(board);
  }
})();
