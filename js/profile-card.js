(function () {
  'use strict';

  var cards = document.querySelectorAll('.profile-card');
  if (!cards.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var AMPLITUDE = 10;

  cards.forEach(function (card) {
    var tiltEl = card.querySelector('.profile-card-tilt');
    if (!tiltEl) return;

    /* --- 3D tilt --- */
    var tick = false;

    card.addEventListener('pointermove', function (e) {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var rotY = (dx / (rect.width / 2)) * AMPLITUDE;
        var rotX = -(dy / (rect.height / 2)) * AMPLITUDE;
        tiltEl.style.transform =
          'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.04)';

        /* glow position */
        card.style.setProperty(
          '--mx',
          ((e.clientX - rect.left) / rect.width) * 100 + '%'
        );
        card.style.setProperty(
          '--my',
          ((e.clientY - rect.top) / rect.height) * 100 + '%'
        );

        tick = false;
      });
    });

    card.addEventListener('pointerleave', function () {
      tiltEl.style.transform = '';
    });
  });
})();
