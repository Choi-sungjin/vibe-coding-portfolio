/**
 * scroll.js — 헤더 스크롤 감지, 프로그레스 바, 섹션 활성화
 */

const HEADER = document.querySelector('.site-header');
const PROGRESS = document.getElementById('scroll-progress');
const SECTIONS = document.querySelectorAll('section[id]');
const NAV_LINKS = document.querySelectorAll('.nav-desktop a[data-section], .nav-overlay a[href^="#"]');

let lastScrollY = window.scrollY;
let ticking = false;

function updateProgress() {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const p = h > 0 ? (window.scrollY / h) * 100 : 0;
  if (PROGRESS) {
    PROGRESS.style.width = `${p}%`;
    PROGRESS.setAttribute('aria-valuenow', Math.round(p));
    PROGRESS.setAttribute('aria-valuemax', 100);
  }
}

function updateHeaderVisibility() {
  const y = window.scrollY;
  if (y > 80) {
    HEADER?.classList.add('scrolled');
    const goingDown = y > lastScrollY;
    if (goingDown && y > 200) {
      HEADER?.classList.add('hidden');
    } else {
      HEADER?.classList.remove('hidden');
    }
  } else {
    HEADER?.classList.remove('scrolled', 'hidden');
  }
  lastScrollY = y;
}

function updateActiveSection() {
  const viewportMid = window.scrollY + window.innerHeight / 2;
  let currentId = '';
  SECTIONS.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const bottom = top + rect.height;
    if (viewportMid >= top && viewportMid <= bottom) {
      currentId = section.id;
    }
  });
  NAV_LINKS.forEach((link) => {
    const href = link.getAttribute('href');
    const sectionId = href?.replace('#', '') || link.getAttribute('data-section');
    if (sectionId === currentId) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'location');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateProgress();
      updateHeaderVisibility();
      updateActiveSection();
      ticking = false;
    });
    ticking = true;
  }
}

export function initScroll() {
  updateProgress();
  updateHeaderVisibility();
  updateActiveSection();
  window.addEventListener('scroll', onScroll, { passive: true });
}
