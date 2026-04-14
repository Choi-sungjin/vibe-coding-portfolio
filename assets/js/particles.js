/**
 * Hero 배경 파티클: 200개 점, 떠다니는 모션
 */
(function () {
  var container = document.getElementById('heroParticles');
  if (!container) return;

  var count = 200;
  var particles = [];
  var colors = ['rgba(176,111,216,0.4)', 'rgba(0,212,255,0.2)'];

  for (var i = 0; i < count; i++) {
    var p = document.createElement('span');
    p.style.position = 'absolute';
    p.style.width = '4px';
    p.style.height = '4px';
    p.style.borderRadius = '50%';
    p.style.background = colors[i % colors.length];
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.pointerEvents = 'none';
    container.appendChild(p);
    particles.push({
      el: p,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: 0.3 + Math.random() * 0.4
    });
  }

  function animate() {
    particles.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > 100) p.vx *= -1;
      if (p.y < 0 || p.y > 100) p.vy *= -1;
      p.el.style.left = p.x + '%';
      p.el.style.top = p.y + '%';
    });
    requestAnimationFrame(animate);
  }
  animate();
})();
