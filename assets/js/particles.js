/**
 * particles.js — Hero 배경 파티클 (Canvas)
 * 200개 점, 랜덤 위치·속도·투명도, 마우스 근접 시 끌리는 효과
 */

const PARTICLE_COUNT = 200;
const MOUSE_INFLUENCE = 0.02;
const MOVE_SPEED = 0.3;

let canvas, ctx, particles = [];
let mouseX = 0, mouseY = 0;
let rafId = 0;

function createParticles() {
  const w = canvas.width;
  const h = canvas.height;
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * MOVE_SPEED,
      vy: (Math.random() - 0.5) * MOVE_SPEED,
      radius: Math.random() * 1.5 + 0.5,
      opacity: 0.2 + Math.random() * 0.2,
      color: Math.random() > 0.5 ? 'rgba(176,111,216,0.4)' : 'rgba(0,212,255,0.2)',
    });
  }
}

function draw() {
  if (!ctx || !canvas) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  particles.forEach((p) => {
    const dx = mouseX - p.x;
    const dy = mouseY - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150 && dist > 0) {
      const force = (150 - dist) / 150 * MOUSE_INFLUENCE;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }
    p.vx *= 0.99;
    p.vy *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
    p.x = Math.max(0, Math.min(w, p.x));
    p.y = Math.max(0, Math.min(h, p.y));

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  rafId = requestAnimationFrame(draw);
}

function resize() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  createParticles();
}

export function initParticles() {
  canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();
  createParticles();

  const onResize = debounce(resize, 100);
  window.addEventListener('resize', onResize);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length) {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.touches[0].clientX - rect.left;
      mouseY = e.touches[0].clientY - rect.top;
    }
  }, { passive: true });

  draw();
}

function debounce(fn, ms) {
  let t;
  return function () {
    clearTimeout(t);
    t = setTimeout(fn, ms);
  };
}

export function destroyParticles() {
  cancelAnimationFrame(rafId);
}
