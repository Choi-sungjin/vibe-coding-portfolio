/**
 * main.js — 초기화, 모든 모듈 로드 및 이벤트 바인딩
 */

import { initScroll } from './scroll.js';
import { initTyping } from './typing.js';
import { initParticles } from './particles.js';
import { initTabs } from './tab.js';
import { initSkills } from './skills.js';
import { openModal } from './modal.js';
import { copyToClipboard, showToast, easeOutCubic } from './utils.js';

const PROJECTS = [
  {
    id: 'p1',
    title: 'Project 01',
    description: 'Fullstack Web App. 사용자 경험과 확장성을 고려한 풀스택 웹 서비스입니다.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    image: '',
    github: 'https://github.com',
    demo: '#',
  },
  {
    id: 'p2',
    title: 'Project 02',
    description: 'REST API Server. 안정적인 API 설계와 문서화를 적용한 백엔드 프로젝트입니다.',
    tags: ['Express', 'MongoDB', 'TypeScript'],
    image: '',
    github: 'https://github.com',
    demo: '#',
  },
  {
    id: 'p3',
    title: 'Project 03',
    description: 'React SPA. 모던 프론트엔드 기술을 활용한 단일 페이지 애플리케이션입니다.',
    tags: ['React', 'Tailwind', 'Vite'],
    image: '',
    github: 'https://github.com',
    demo: '#',
  },
];

const CODE_WORDS = ['const', 'function()', '{}', '=>', 'async/await', 'import', 'export', 'return', 'Promise', 'useState', 'useEffect'];

function renderProjects() {
  const grid = document.getElementById('works-grid');
  if (!grid) return;

  grid.innerHTML = PROJECTS.map((project) => {
    const tagsHtml = project.tags.map((t) => `<span class="tag">${t}</span>`).join('');
    const thumbBg = project.image ? `url(${project.image})` : 'var(--color-bg-card)';
    return `
      <article class="project-card" data-project-id="${project.id}">
        <div class="project-card-thumb" style="background: ${thumbBg}; background-size: cover;">
          ${project.image ? `<img src="${project.image}" alt="${project.title} 썸네일" loading="lazy" width="400" height="225">` : ''}
          <div class="overlay">
            <button type="button" class="btn btn-primary project-detail-btn" data-project-id="${project.id}">자세히 보기</button>
          </div>
        </div>
        <div class="project-card-body">
          <h3 class="project-card-title">${project.title}</h3>
          <p class="project-card-desc">${project.description}</p>
          <div class="project-tags">${tagsHtml}</div>
          <div class="project-links">
            <a href="${project.github}" class="btn btn-outline" target="_blank" rel="noopener noreferrer" aria-label="GitHub 저장소">GitHub</a>
            <a href="${project.demo}" class="btn btn-primary" target="_blank" rel="noopener noreferrer" aria-label="라이브 데모">데모</a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  grid.querySelectorAll('.project-detail-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-project-id');
      const project = PROJECTS.find((p) => p.id === id);
      if (project) openModal(project);
    });
  });
}

function initCodeBackground() {
  const container = document.getElementById('hero-code-bg');
  if (!container) return;
  CODE_WORDS.forEach((word, i) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.style.left = Math.random() * 100 + '%';
    span.style.top = Math.random() * 100 + '%';
    span.style.transform = `rotate(${Math.random() * 360 - 180}deg)`;
    span.style.fontSize = (10 + Math.random() * 12) + 'px';
    container.appendChild(span);
  });
}

function initStatsCountUp() {
  const cards = document.querySelectorAll('.stat-value[data-target]');
  const duration = 2000;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(target)) return;
        const start = 0;
        const startTime = performance.now();

        function update(now) {
          const elapsed = now - startTime;
          const t = Math.min(elapsed / duration, 1);
          const eased = easeOutCubic(t);
          const value = Math.round(start + (target - start) * eased);
          el.textContent = target >= 1000 ? value.toLocaleString() + '+' : value + '+';
          if (t < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        io.unobserve(el);
      });
    },
    { threshold: 0.3 }
  );
  cards.forEach((c) => io.observe(c));
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit');
  if (!form || !submitBtn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.classList.add('done');
      submitBtn.textContent = '✓ 전송 완료';
      showToast('메시지가 전송되었습니다 (데모)');
      setTimeout(() => {
        submitBtn.classList.remove('done');
        submitBtn.textContent = '보내기';
        submitBtn.disabled = false;
      }, 2000);
    }, 1500);
  });
}

function initEmailCopy() {
  const email = 'hello@choiseongjin.dev';
  const copyEmailLink = document.getElementById('copy-email');
  const contactEmail = document.getElementById('contact-email');
  const footerEmail = document.getElementById('footer-email');

  const copy = () => {
    copyToClipboard(email);
  };

  if (copyEmailLink) {
    copyEmailLink.addEventListener('click', (e) => {
      e.preventDefault();
      copy();
    });
  }
  if (contactEmail) {
    contactEmail.addEventListener('click', copy);
    contactEmail.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        copy();
      }
    });
  }
  if (footerEmail) {
    footerEmail.addEventListener('click', (e) => {
      e.preventDefault();
      copy();
    });
  }
}

function initNavOverlay() {
  const toggle = document.querySelector('.nav-toggle');
  const overlay = document.getElementById('nav-overlay');
  if (!toggle || !overlay) return;

  const open = () => {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-label', '메뉴 닫기');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-label', '메뉴 열기');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    if (overlay.classList.contains('open')) close();
    else open();
  });
  overlay.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', close);
  });
}

function initTopButton() {
  const btn = document.getElementById('btn-top');
  if (!btn) return;

  const update = () => {
    if (window.scrollY > 400) btn.classList.add('visible');
    else btn.classList.remove('visible');
  };
  window.addEventListener('scroll', update, { passive: true });
  update();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    a.addEventListener('click', (e) => {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function init() {
  initScroll();
  initTyping();
  initParticles();
  initCodeBackground();
  initTabs();
  initSkills();
  renderProjects();
  initStatsCountUp();
  initContactForm();
  initEmailCopy();
  initNavOverlay();
  initTopButton();
  initSmoothScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
