/**
 * 스크롤: 헤더 숨김/표시, 진행률 바, 섹션 네비 활성화
 */
(function () {
  var lastScrollY = window.scrollY || 0;
  var header = document.getElementById('siteHeader');
  var progressFill = document.getElementById('progressFill');
  var navLinks = document.querySelectorAll('.nav-link[data-nav]');

  function onScroll() {
    var y = window.scrollY || 0;

    if (header) {
      if (y > 80) {
        header.classList.add('scrolled');
        if (y > lastScrollY && y > 200) {
          header.classList.add('header-hidden');
        } else {
          header.classList.remove('header-hidden');
        }
      } else {
        header.classList.remove('scrolled', 'header-hidden');
      }
    }

    if (progressFill) {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
      progressFill.style.width = pct + '%';
    }

    if (navLinks.length) {
      var sections = [];
      navLinks.forEach(function (a) {
        var id = a.getAttribute('data-nav');
        var el = document.getElementById(id);
        if (el) sections.push({ id: id, top: el.getBoundingClientRect().top + y });
      });
      var current = sections.filter(function (s) { return s.top <= y + 150; }).pop();
      var activeId = current ? current.id : (sections[0] && sections[0].id);
      navLinks.forEach(function (a) {
        if (a.getAttribute('data-nav') === activeId) {
          a.classList.add('active');
        } else {
          a.classList.remove('active');
        }
      });
    }

    lastScrollY = y;
  }

  window.addEventListener('scroll', BeautyKurly.throttle(onScroll, 100), { passive: true });
  onScroll();
})();
