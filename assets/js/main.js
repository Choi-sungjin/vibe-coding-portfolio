/**
 * 진입점: 스크롤 fade-up, 통계 count-up, 연락처 폼/복사, 모바일 메뉴, TOP
 */
(function () {
  if (window.__portfolioMainInitialized) return;
  window.__portfolioMainInitialized = true;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function countUp(el, target, duration) {
    var start = 0;
    var startTime = null;
    target = parseInt(target, 10);
    var suffix = el.getAttribute('data-suffix') || (target >= 100 ? '+' : '');
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = easeOutCubic(progress);
      var current = Math.round(start + (target - start) * eased);
      el.textContent = (target >= 1000 ? current.toLocaleString() : current) + (progress >= 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function init() {
    var body = document.body;

    /* 스크롤 fade-up (프로젝트 카드, about 등) */
    var fadeEls = document.querySelectorAll('.fade-up');
    var fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
    );
    fadeEls.forEach(function (el) {
      if (el.closest('.skill-panel') && !el.closest('.skill-panel.active')) return;
      fadeObserver.observe(el);
    });

    /* 통계 count-up */
    var statNumbers = document.querySelectorAll('.stat-card .number[data-count]');
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = el.getAttribute('data-count');
          if (target && !el.dataset.done) {
            el.dataset.done = '1';
            countUp(el, target, 2000);
            statObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );
    statNumbers.forEach(function (el) { statObserver.observe(el); });

    /* 이메일 복사 */
    var copyEmail = document.getElementById('copyEmail');
    if (copyEmail) {
      copyEmail.addEventListener('click', function () {
        var email = this.getAttribute('data-email') || this.textContent.trim();
        BeautyKurly.copyToClipboard(email);
      });
    }

    /* 연락처 이메일 링크 */
    var contactEmail = document.getElementById('contactEmail');
    if (contactEmail) {
      contactEmail.addEventListener('click', function (e) {
        e.preventDefault();
        BeautyKurly.copyToClipboard('hello@choiseongjin.dev');
      });
    }

    /* 연락처 폼 전송 (UI만) */
    var form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = document.getElementById('formSubmit');
        if (!btn) return;
        btn.disabled = true;
        btn.textContent = '전송 중...';
        setTimeout(function () {
          btn.textContent = '✓ 전송 완료';
          btn.style.background = 'var(--color-neon-green)';
          btn.style.color = '#1A0A2E';
          setTimeout(function () {
            btn.disabled = false;
            btn.textContent = '보내기';
            btn.style.background = '';
            btn.style.color = '';
          }, 2000);
        }, 800);
      });
    }

    /* 모바일 메뉴 */
    var btnMenu = document.getElementById('btnMenu');
    var navOverlay = document.getElementById('navOverlay');
    var navClose = document.getElementById('navClose');
    function openNav() {
      if (navOverlay) {
        navOverlay.classList.add('is-open');
        navOverlay.setAttribute('aria-hidden', 'false');
        body.style.overflow = 'hidden';
      }
    }
    function closeNav() {
      if (navOverlay) {
        navOverlay.classList.remove('is-open');
        navOverlay.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
      }
    }
    if (btnMenu) btnMenu.addEventListener('click', openNav);
    if (navClose) navClose.addEventListener('click', closeNav);
    ['navLinkAbout', 'navLinkSkills', 'navLinkWorks', 'navLinkContact'].forEach(function (id) {
      var link = document.getElementById(id);
      if (link) link.addEventListener('click', closeNav);
    });

    /* TOP 버튼 */
    var btnTop = document.getElementById('btnTop');
    if (btnTop) {
      window.addEventListener('scroll', BeautyKurly.throttle(function () {
        if (window.scrollY > 400) btnTop.classList.add('visible');
        else btnTop.classList.remove('visible');
      }, 150), { passive: true });
      btnTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* 스무스 스크롤 (앵커) */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === '#') return;
      a.addEventListener('click', function (e) {
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
