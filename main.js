/* Posada Exótica · Choroní — interacciones (IIFE, sin módulos) */
(function () {
  "use strict";

  var WA = "https://wa.me/584243211736?text=";

  function safe(fn, name) {
    try { fn(); } catch (e) { if (window.console) console.warn("[init " + name + "]", e); }
  }

  /* ---------- NAV ---------- */
  function initNav() {
    var nav = document.getElementById("nav");
    var burger = document.getElementById("burger");
    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 1 · COVERFLOW ---------- */
  function initCoverflow() {
    var stage = document.getElementById("cfStage");
    var cards = Array.prototype.slice.call(stage.querySelectorAll(".cf-card"));
    var bgs = document.querySelectorAll(".hero-bg-layer");
    var dotsWrap = document.getElementById("cfDots");
    var n = cards.length;
    var active = 0;
    var timer = null;
    var DELAY = 4200;

    if (dotsWrap.children.length === 0) {
      cards.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Imagen " + (i + 1));
        b.addEventListener("click", function () { go(i); restart(); });
        dotsWrap.appendChild(b);
      });
    }
    var dots = dotsWrap.querySelectorAll("button");

    function layout() {
      var w = cards[0].offsetWidth;
      var mobile = window.innerWidth < 640;
      var gap = w * (mobile ? 0.62 : 0.74);
      cards.forEach(function (c, i) {
        var o = i - active;
        if (o > n / 2) o -= n;
        if (o < -n / 2) o += n;
        var a = Math.abs(o);
        var x = o === 0 ? 0 : Math.sign(o) * (gap + (a - 1) * gap * 0.62);
        c.style.transform =
          "translate(-50%,-50%) translateX(" + x + "px) translateZ(" + (-a * 170) + "px) rotateY(" + (o * -24) + "deg) scale(" + (a === 0 ? 1 : 0.9) + ")";
        c.style.zIndex = String(20 - a);
        c.style.opacity = a > 2 ? "0" : a === 2 ? (mobile ? "0" : "1") : "1";
        c.style.pointerEvents = a > 2 ? "none" : "auto";
        c.classList.toggle("is-active", a === 0);
        c.setAttribute("aria-hidden", a === 0 ? "false" : "true");
      });
      bgs.forEach(function (b, i) { b.classList.toggle("is-active", i === active); });
      dots.forEach(function (d, i) { d.setAttribute("aria-selected", i === active ? "true" : "false"); });
    }
    function go(i) { active = (i + n) % n; layout(); }
    function next() { go(active + 1); }
    function prev() { go(active - 1); }
    function restart() { clearInterval(timer); timer = setInterval(next, DELAY); }

    cards.forEach(function (c, i) { c.addEventListener("click", function () { if (i !== active) { go(i); restart(); } }); });
    document.getElementById("cfNext").addEventListener("click", function () { next(); restart(); });
    document.getElementById("cfPrev").addEventListener("click", function () { prev(); restart(); });

    // swipe
    var sx = null;
    stage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); restart(); }
      sx = null;
    });
    // pausa al pasar el mouse
    stage.addEventListener("mouseenter", function () { clearInterval(timer); });
    stage.addEventListener("mouseleave", restart);
    document.addEventListener("visibilitychange", function () { document.hidden ? clearInterval(timer) : restart(); });

    window.addEventListener("resize", layout);
    layout();
    restart();
  }

  /* ---------- 2 · TARIFAS (Lun–Jue / Vie–Dom) ---------- */
  function initSeason() {
    var wrap = document.querySelector(".season");
    var xmasWrap = document.getElementById("xmasWrap");
    var xmasBtn = document.getElementById("xmasBtn");
    // el botón navideño desaparece solo al terminar la temporada (17/01/2027, hora de Venezuela)
    var XMAS_END = new Date("2027-01-18T00:00:00-04:00");
    if (xmasWrap && new Date() >= XMAS_END) { xmasWrap.hidden = true; xmasBtn = null; }
    var btns = Array.prototype.slice.call(wrap.querySelectorAll(".season-btn"));
    if (xmasBtn) btns.push(xmasBtn);
    var prices = document.querySelectorAll(".price");
    var books = document.querySelectorAll(".book-room");
    var note = document.getElementById("seasonNote");
    var label = { week: "lunes a jueves", weekend: "viernes a domingo", xmas: "temporada navideña (del 23/12/26 al 17/01/27)" };
    wrap.setAttribute("data-active", "weekend");

    function set(season) {
      wrap.setAttribute("data-active", season);
      btns.forEach(function (b) {
        var on = b.getAttribute("data-season") === season;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      prices.forEach(function (p) {
        var v = p.getAttribute("data-" + season) + "€";
        if (p.textContent === v) return;
        p.classList.remove("is-flip");
        void p.offsetWidth;
        p.classList.add("is-flip");
        setTimeout(function () { p.textContent = v; }, 250);
      });
      books.forEach(function (a) {
        a.href = WA + encodeURIComponent("Hola Posada Exótica, quiero reservar la habitación " + a.getAttribute("data-room") + (season === "xmas" ? " en " : " de ") + label[season]);
      });
      note.innerHTML = season === "xmas"
        ? "🎄 Tarifas de <b>temporada navideña</b>: del 23/12/2026 al 17/01/2027."
        : "Mostrando tarifas de <b>" + label[season] + "</b>.";
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { set(b.getAttribute("data-season")); }); });
  }

  /* ---------- 3 · ESCENA DENTRO DE ESCENA (parallax) ---------- */
  function initPip() {
    var sec = document.getElementById("lancha");
    var bg = document.getElementById("seaBg");
    var scene = document.getElementById("pipScene");
    var mx = 0, my = 0, ticking = false;

    function render() {
      ticking = false;
      var r = sec.getBoundingClientRect();
      var vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1..1
      bg.style.transform = "scale(1.12) translate3d(" + (mx * -14) + "px," + (p * 50 + my * -10) + "px,0)";
      
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    if (window.matchMedia("(hover: hover)").matches) {
      sec.addEventListener("mousemove", function (e) {
        mx = e.clientX / window.innerWidth - 0.5;
        my = e.clientY / window.innerHeight - 0.5;
        req();
      });
    }
    render();
  }

  /* ---------- 5 · MARQUEE infinito ---------- */
  function initMarquee() {
    var track = document.getElementById("marqueeTrack");
    if (track.getAttribute("data-cloned")) return;
    var items = Array.prototype.slice.call(track.children);
    items.forEach(function (it) {
      var c = it.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      var img = c.querySelector("img");
      if (img) img.alt = "";
      track.appendChild(c);
    });
    track.setAttribute("data-cloned", "1");
  }

  /* ---------- reveal on scroll + red de seguridad ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var t = en.target;
          t.classList.add("is-in");
          io.unobserve(t);
          setTimeout(function () { t.style.transitionDelay = ""; }, 1200);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e, i) {
      e.style.transitionDelay = (i % 4) * 0.08 + "s";
      io.observe(e);
    });
    setTimeout(function () { els.forEach(function (e) { e.classList.add("is-in"); }); }, 6000);
  }

  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function boot() {
    safe(initNav, "nav");
    safe(initCoverflow, "coverflow");
    safe(initSeason, "season");
    safe(initPip, "pip");
    safe(initMarquee, "marquee");
    safe(initReveal, "reveal");
    safe(initYear, "year");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
