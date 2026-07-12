(function () {
  'use strict';

  /* ========================================
     DARK / LIGHT THEME TOGGLE
  ======================================== */
  const themeToggles = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
  const html = document.documentElement;

  function setTheme(dark) {
    if (dark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    setTheme(true);
  }

  function toggleTheme() {
    const isDark = html.classList.contains('dark');
    if (document.startViewTransition) {
      document.startViewTransition(() => setTheme(!isDark));
    } else {
      setTheme(!isDark);
    }
  }
  themeToggles.forEach(function (btn) {
    btn.addEventListener('click', toggleTheme);
  });

  /* ========================================
     LENIS SMOOTH SCROLL
   ======================================== */
  var lenis = new Lenis({ autoRaf: true, autoToggle: true, anchors: true });

  /* ========================================
     FLUID ISLAND — HAMBURGER MORPH + OVERLAY
   ======================================== */
  var menuBtn = document.getElementById('menu-btn');
  var mobileOverlay = document.getElementById('mobile-overlay');
  var navPill = document.getElementById('nav-pill');

  if (menuBtn && mobileOverlay) {
    menuBtn.addEventListener('click', function () {
      menuBtn.classList.toggle('active');
      mobileOverlay.classList.toggle('overlay-hidden');
      html.style.overflow = mobileOverlay.classList.contains('overlay-hidden') ? '' : 'hidden';
    });
    mobileOverlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuBtn.classList.remove('active');
        mobileOverlay.classList.add('overlay-hidden');
        html.style.overflow = '';
      });
    });
  }

  /* ========================================
     NAVBAR SCROLL EFFECT
  ======================================== */
  var navPillEl = document.getElementById('nav-pill');
  if (navPillEl) {
    lenis.on('scroll', function (e) {
      if (e.scrollY > 40) {
        navPillEl.classList.add('scrolled');
      } else {
        navPillEl.classList.remove('scrolled');
      }
    });
  }

  /* ========================================
     SCROLL REVEAL (Intersection Observer)
  ======================================== */
  var revealEls = document.querySelectorAll('.reveal, .reveal-hero');

  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ========================================
     SKILL BAR ANIMATION (Intersection Observer)
  ======================================== */
  var fillBars = document.querySelectorAll('.skill-bar-fill');

  if (fillBars.length && 'IntersectionObserver' in window) {
    var barObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var w = entry.target.getAttribute('data-width');
            if (w) { entry.target.style.width = w + '%'; }
            barObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    fillBars.forEach(function (bar) { barObserver.observe(bar); });
  } else {
    fillBars.forEach(function (bar) {
      var w = bar.getAttribute('data-width');
      if (w) { bar.style.width = w + '%'; }
    });
  }

  /* ========================================
     INTERACTIVE DOT GRID (cursor-reactive)
  ======================================== */
  (function () {
    var canvas = document.getElementById('dot-grid');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var dots = [];
    var mouse = { x: -9999, y: -9999 };
    var w, h, dpr;

    var SPACING = 30;
    var BASE_RADIUS = 1.2;
    var MAX_RADIUS = 3.5;
    var INFLUENCE = 130;
    var JITTER = 3;
    var LERP = 0.12;

    var isDark = html.classList.contains('dark');

    var themeWatcher = new MutationObserver(function () {
      isDark = html.classList.contains('dark');
    });
    themeWatcher.observe(html, { attributes: true, attributeFilter: ['class'] });

    function resize() {
      dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initDots() {
      dots = [];
      var cols = Math.floor(w / SPACING) + 2;
      var rows = Math.floor(h / SPACING) + 2;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          dots.push({
            x: c * SPACING + (Math.random() - 0.5) * JITTER,
            y: r * SPACING + (Math.random() - 0.5) * JITTER,
            cur: BASE_RADIUS,
            tgt: BASE_RADIUS,
          });
        }
      }
    }

    function render() {
      ctx.clearRect(0, 0, w, h);

      var baseAlpha = isDark ? 0.2 : 0.15;
      var peakAlpha = isDark ? 0.55 : 0.45;
      var rColor = isDark ? '237' : '27';
      var gColor = isDark ? '232' : '58';
      var bColor = isDark ? '224' : '75';

      for (var i = 0; i < dots.length; i++) {
        var dot = dots[i];
        var dx = mouse.x - dot.x;
        var dy = mouse.y - dot.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        var tgt = BASE_RADIUS;
        var alpha = baseAlpha;
        if (dist < INFLUENCE) {
          var t = 1 - dist / INFLUENCE;
          t = t * t * (3 - 2 * t);
          tgt = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * t;
          alpha = baseAlpha + (peakAlpha - baseAlpha) * t;
        }

        dot.cur += (tgt - dot.cur) * LERP;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.cur, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rColor + ',' + gColor + ',' + bColor + ',' + alpha + ')';
        ctx.fill();
      }

      requestAnimationFrame(render);
    }

    resize();
    initDots();
    render();

    window.addEventListener('resize', function () {
      resize();
      initDots();
    });

    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      if (t) {
        mouse.x = t.clientX;
        mouse.y = t.clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });
  })();

  /* ========================================
     STAT COUNTER ANIMATION
   ======================================== */
  (function () {
    var statEls = document.querySelectorAll('.stat-num');
    if (!statEls.length || !('IntersectionObserver' in window)) return;

    function parseStat(text) {
      var floatMatch = text.match(/^(\d+\.\d+)$/);
      if (floatMatch) return { type: 'float', target: parseFloat(floatMatch[1]), decimals: 2 };
      var intMatch = text.match(/^(\d+)\+(.*)$/);
      if (intMatch) return { type: 'intPlus', target: parseInt(intMatch[1], 10), suffix: intMatch[2] || '+' };
      var ordMatch = text.match(/^(\d+)(st|nd|rd|th)$/);
      if (ordMatch) return { type: 'ordinal', target: parseInt(ordMatch[1], 10), suffix: ordMatch[2] };
      var plainInt = text.match(/^(\d+)$/);
      if (plainInt) return { type: 'int', target: parseInt(plainInt[1], 10) };
      return { type: 'none' };
    }

    function formatVal(val, info) {
      if (info.type === 'float') return val.toFixed(info.decimals);
      if (info.type === 'intPlus') return Math.floor(val) + (info.suffix || '+');
      if (info.type === 'ordinal') return Math.floor(val) + info.suffix;
      if (info.type === 'int') return Math.floor(val).toString();
      return '';
    }

    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        statObserver.unobserve(entry.target);
        var el = entry.target;
        var info = parseStat(el.textContent.trim());
        if (info.type === 'none') return;
        var start = null;
        var duration = 1500;

        function easeOutExpo(t) {
          return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function step(ts) {
          if (!start) start = ts;
          var elapsed = ts - start;
          var progress = Math.min(elapsed / duration, 1);
          var eased = easeOutExpo(progress);
          el.textContent = formatVal(info.target * eased, info);
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    statEls.forEach(function (el) { statObserver.observe(el); });
  })();

  /* ========================================
     MAGNETIC BUTTON HOVER
   ======================================== */
  (function () {
    var btns = document.querySelectorAll('.btn-primary, .btn-secondary');
    if (!btns.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        var dist = Math.sqrt(x * x + y * y);
        var maxDist = Math.min(rect.width, rect.height) / 2;
        var strength = Math.min(dist / maxDist, 1);
        var pull = 10 * (1 - strength);
        var angle = Math.atan2(y, x);
        btn.style.transform = 'translate(' + Math.cos(angle) * pull + 'px, ' + Math.sin(angle) * pull + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  })();

  /* ========================================
     CARD CURSOR GLOW
   ======================================== */
  (function () {
    var cards = document.querySelectorAll('.db');
    if (!cards.length) return;

    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    cards.forEach(function (el) {
      var tick = false;
      el.addEventListener('pointermove', function (e) {
        if (tick) return;
        tick = true;
        requestAnimationFrame(function () {
          var r = el.getBoundingClientRect();
          el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
          el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
          tick = false;
        });
      });
    });
  })();

})();
