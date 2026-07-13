/**
 * main.js — Cybersecurity Portfolio
 * Assumes globals: THREE (r128), gsap, ScrollTrigger, Lenis
 */
(function () {
  'use strict';

  // ──────────────────────────────────────────────
  // 1. LENIS SMOOTH SCROLL
  // ──────────────────────────────────────────────
  var lenis = new Lenis({ autoRaf: false });

  gsap.registerPlugin(ScrollTrigger);

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // ──────────────────────────────────────────────
  // 2. THREE.JS WIREFRAME TERRAIN
  // ──────────────────────────────────────────────
  (function () {
    var canvas = document.getElementById('terrain-canvas');
    if (!canvas) return;

    // --- Noise functions ---
    function noise2D(x, y) {
      var n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return n - Math.floor(n);
    }

    function smoothNoise(x, y) {
      var ix = Math.floor(x), iy = Math.floor(y);
      var fx = x - ix, fy = y - iy;
      fx = fx * fx * (3 - 2 * fx);
      fy = fy * fy * (3 - 2 * fy);
      var a = noise2D(ix, iy), b = noise2D(ix + 1, iy);
      var c = noise2D(ix, iy + 1), d = noise2D(ix + 1, iy + 1);
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    }

    function fbm(x, y) {
      var val = 0, amp = 1, freq = 1;
      for (var i = 0; i < 4; i++) {
        val += smoothNoise(x * freq, y * freq) * amp;
        amp *= 0.5;
        freq *= 2;
      }
      return val;
    }

    // --- Scene setup ---
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Terrain geometry ---
    var geometry = new THREE.PlaneGeometry(30, 30, 60, 60);
    geometry.rotateX(-Math.PI / 2.2);

    var posAttr = geometry.getAttribute('position');
    for (var i = 0; i < posAttr.count; i++) {
      var x = posAttr.getX(i);
      var y = posAttr.getY(i);
      var z = posAttr.getZ(i);
      z += fbm(x * 0.3, y * 0.3) * 2;
      posAttr.setZ(i, z);
    }
    posAttr.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // --- Mouse tracking ---
    var mouse = { x: 0, y: 0 };

    document.addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // --- Animation control via IntersectionObserver ---
    var isHeroVisible = true;
    var animFrameId = null;

    var heroSection = document.getElementById('hero');
    if (heroSection && 'IntersectionObserver' in window) {
      var heroObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            isHeroVisible = entry.isIntersecting;
            if (isHeroVisible && !animFrameId) {
              animate();
            }
          });
        },
        { threshold: 0 }
      );
      heroObserver.observe(heroSection);
    }

    // --- Render loop ---
    function animate() {
      if (!isHeroVisible) {
        animFrameId = null;
        return;
      }
      animFrameId = requestAnimationFrame(animate);

      // Camera parallax
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
      camera.position.y = 5 + mouse.y * 0.5;
      camera.lookAt(0, 0, 0);

      // Slow terrain rotation
      mesh.rotation.z += 0.001;

      renderer.render(scene, camera);
    }

    animate();

    // --- Resize handler ---
    window.addEventListener('resize', function () {
      var width = canvas.clientWidth;
      var height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
  })();

  // ──────────────────────────────────────────────
  // 3. GSAP SCROLL ANIMATIONS
  // ──────────────────────────────────────────────

  // Hero reveals (immediate on page load, no ScrollTrigger)
  gsap.to('.reveal-hero', {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    duration: 1,
    stagger: 0.15,
    ease: 'power3.out',
    delay: 0.3
  });

  // Section reveals (ScrollTrigger-driven)
  var reveals = document.querySelectorAll('.reveal');
  reveals.forEach(function (el) {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out'
    });
  });

  // ──────────────────────────────────────────────
  // 4. NAVIGATION (scroll spy, hamburger, mobile menu)
  // ──────────────────────────────────────────────

  // Scroll spy
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link[data-section]');

  lenis.on('scroll', function () {
    var scrollY = window.scrollY + window.innerHeight / 3;
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === id) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  // Hamburger + mobile menu
  var menuBtn = document.getElementById('menu-btn');
  var mobileOverlay = document.getElementById('mobile-overlay');
  var html = document.documentElement;

  if (menuBtn && mobileOverlay) {
    menuBtn.addEventListener('click', function () {
      menuBtn.classList.toggle('active');
      mobileOverlay.classList.toggle('mobile-overlay--hidden');
      html.style.overflow = mobileOverlay.classList.contains('mobile-overlay--hidden') ? '' : 'hidden';
    });

    mobileOverlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuBtn.classList.remove('active');
        mobileOverlay.classList.add('mobile-overlay--hidden');
        html.style.overflow = '';
      });
    });
  }

  // ──────────────────────────────────────────────
  // 5. STAT COUNTER ANIMATION
  // ──────────────────────────────────────────────
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

    var statObserver = new IntersectionObserver(
      function (entries) {
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
      },
      { threshold: 0.5 }
    );

    statEls.forEach(function (el) {
      statObserver.observe(el);
    });
  })();

  // ──────────────────────────────────────────────
  // 6. CUSTOM CURSOR (desktop only)
  // ──────────────────────────────────────────────
  (function () {
    if (window.matchMedia('(hover: none)').matches) return;

    var dot = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    var mouseX = 0, mouseY = 0;
    var ringX = 0, ringY = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      // Direct update for dot
      dot.style.transform = 'translate(' + mouseX + 'px, ' + mouseY + 'px)';
      
      // Interpolated update for trailing ring
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px)';
      
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Expand ring on interactive elements
    var interactives = document.querySelectorAll('a, button, .skill-item, .contact-card, .credential-card');
    interactives.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        ring.style.width = '56px';
        ring.style.height = '56px';
        ring.style.borderColor = 'var(--accent)';
        dot.style.opacity = '0.5';
      });
      el.addEventListener('mouseleave', function () {
        ring.style.width = '36px';
        ring.style.height = '36px';
        ring.style.borderColor = 'rgba(0, 240, 255, 0.4)';
        dot.style.opacity = '1';
      });
    });
  })();

})();
