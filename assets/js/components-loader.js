/**
 * 컴포넌트 HTML(header, footer) 로드 후 주입. 완료 후 나머지 스크립트 실행.
 */
(function () {
  var HEADER_CONTAINER = 'header-container';
  var FOOTER_CONTAINER = 'footer-container';

  function inject(containerId, html) {
    var el = document.getElementById(containerId);
    if (el && html != null) el.innerHTML = html.trim();
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function fetchComponent(path) {
    return fetch(path).then(function (r) {
      if (!r.ok) throw new Error(path);
      return r.text();
    }).catch(function () { return ''; });
  }

  function loadAllScripts() {
    var list = [
      'assets/js/particles.js',
      'assets/js/typing.js',
      'assets/js/scroll.js',
      'assets/js/skills.js',
      'assets/js/main.js'
    ];
    return list.reduce(function (p, src) {
      return p.then(function () { return loadScript(src); });
    }, Promise.resolve());
  }

  var fallbackHeader = '<header class="site-header header-transition" id="siteHeader" role="banner"><a href="#" class="logo" aria-label="최성진 포트폴리오 홈">CSJ.</a><nav class="nav-desktop" aria-label="주 메뉴"><a href="#about" class="nav-link" data-nav="about">ABOUT</a><a href="#skills" class="nav-link" data-nav="skills">SKILLS</a><a href="#works" class="nav-link" data-nav="works">EXPERIENCE</a><a href="#contact" class="nav-link" data-nav="contact">CONTACT</a></nav><button type="button" class="btn-menu" id="btnMenu" aria-label="메뉴 열기">☰</button></header>';
  var fallbackFooter = '<footer class="site-footer" role="contentinfo"><div class="footer-logo">CSJ.</div><p class="footer-slogan">코드로 아이디어를 현실로 만드는 개발자, 최성진</p><nav class="footer-links" aria-label="소셜 링크"><a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">🐙</a><a href="#" aria-label="LinkedIn">💼</a><a href="#" aria-label="이메일">📧</a></nav><p class="footer-copy">© 2026 Choi Seongjin. Designed & Developed by 최성진.</p></footer>';

  Promise.all([
    fetchComponent('components/header.html'),
    fetchComponent('components/footer.html')
  ]).then(function (results) {
    inject(HEADER_CONTAINER, results[0] || fallbackHeader);
    inject(FOOTER_CONTAINER, results[1] || fallbackFooter);
  }).catch(function () {
    inject(HEADER_CONTAINER, fallbackHeader);
    inject(FOOTER_CONTAINER, fallbackFooter);
  }).finally(function () {
    document.dispatchEvent(new CustomEvent('componentsReady'));
    loadAllScripts();
  });
})();
