/**
 * modal.js — 프로젝트 상세 모달
 */

let currentModal = null;

export function openModal(project) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'modal-title');

  const content = document.createElement('div');
  content.className = 'modal-content';

  const tagsHtml = (project.tags || [])
    .map((t) => `<span class="tag">${t}</span>`)
    .join('');

  content.innerHTML = `
    <div class="modal-header">
      <h2 id="modal-title" class="section-title">${project.title}</h2>
      <button type="button" class="modal-close" aria-label="모달 닫기">&times;</button>
    </div>
    <div class="modal-body">
      ${project.image ? `<div class="project-card-thumb"><img src="${project.image}" alt="${project.title}" loading="lazy"></div>` : ''}
      <p class="project-card-desc">${project.description || ''}</p>
      <div class="project-tags">${tagsHtml}</div>
      ${project.github ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">GitHub</a>` : ''}
      ${project.demo ? `<a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">라이브 데모</a>` : ''}
    </div>
  `;

  backdrop.appendChild(content);
  container.appendChild(backdrop);

  const close = () => {
    backdrop.classList.remove('open');
    setTimeout(() => backdrop.remove(), 300);
    currentModal = null;
    document.body.style.overflow = '';
  };

  content.querySelector('.modal-close')?.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => backdrop.classList.add('open'));
  currentModal = backdrop;
}

export function closeModal() {
  if (currentModal) {
    currentModal.classList.remove('open');
    setTimeout(() => currentModal.remove(), 300);
    currentModal = null;
    document.body.style.overflow = '';
  }
}
