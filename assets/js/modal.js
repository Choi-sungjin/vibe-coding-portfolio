/**
 * 프로젝트 상세 모달: 열기/닫기, ESC/오버레이
 */
(function () {
  var overlay = document.getElementById('projectModal');
  var closeBtn = document.getElementById('projectModalClose');
  var bodyEl = document.getElementById('projectModalBody');
  var titleEl = document.getElementById('projectModalTitle');

  if (!overlay) return;

  var projects = {
    1: { title: 'Project 01', desc: 'Fullstack Web App — 프론트엔드·백엔드·DB 연동 풀스택 서비스입니다. React, Node.js, PostgreSQL를 사용해 구현했습니다.', stack: 'React, Node.js, PostgreSQL, TypeScript' },
    2: { title: 'Project 02', desc: 'REST API Server — 인증·CRUD·파일 업로드 API 서버입니다. Express, MongoDB, JWT를 활용했습니다.', stack: 'Express, MongoDB, JWT' },
    3: { title: 'Project 03', desc: 'React SPA — 상태관리·라우팅·반응형 UI를 갖춘 단일 페이지 애플리케이션입니다.', stack: 'React, TypeScript, Vite' }
  };

  function openModal(projectId) {
    var p = projects[projectId];
    if (p && titleEl && bodyEl) {
      titleEl.textContent = p.title;
      bodyEl.innerHTML = '<p>' + p.desc + '</p><p><strong>기술 스택:</strong> ' + p.stack + '</p>';
    }
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.project-detail-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = this.getAttribute('data-project');
      if (id) openModal(id);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });
})();
