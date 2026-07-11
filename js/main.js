(function () {
  'use strict';

  const html = document.documentElement;

  /* ========================================
     DARK / LIGHT THEME TOGGLE
  ======================================== */
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');

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
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

  /* ========================================
     MOBILE MENU (Hamburger + Full-screen Overlay)
  ======================================== */
  const hamburger = document.getElementById('hamburger');
  const mobileOverlay = document.getElementById('mobile-overlay');

  if (hamburger && mobileOverlay) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileOverlay.classList.toggle('open');
      html.style.overflow = mobileOverlay.classList.contains('open') ? 'hidden' : '';
    });

    mobileOverlay.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileOverlay.classList.remove('open');
        html.style.overflow = '';
      });
    });
  }

  /* ========================================
     NAVBAR SCROLL EFFECT
  ======================================== */
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      navbar.style.transform = 'translateX(-50%) translateY(-2px)';
      navbar.style.opacity = '0.92';
    } else {
      navbar.style.transform = 'translateX(-50%) translateY(0)';
      navbar.style.opacity = '1';
    }
  }, { passive: true });

  /* ========================================
     SCROLL REVEAL (Intersection Observer)
  ======================================== */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ========================================
     SKILL BAR ANIMATION
  ======================================== */
  const skillFills = document.querySelectorAll('.skill-bar-fill');

  if ('IntersectionObserver' in window) {
    const skillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const w = entry.target.getAttribute('data-width');
            if (w) entry.target.style.width = w + '%';
            skillObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    skillFills.forEach((bar) => skillObserver.observe(bar));
  } else {
    skillFills.forEach((bar) => {
      const w = bar.getAttribute('data-width');
      if (w) bar.style.width = w + '%';
    });
  }

  /* ========================================
     SMOOTH SCROLL FOR NAV LINKS
  ======================================== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
