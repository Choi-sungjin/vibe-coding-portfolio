/**
 * 스킬 카테고리 탭 전환
 */
(function () {
  var tabs = document.querySelectorAll('.skill-tab[data-skill]');
  var panels = document.querySelectorAll('.skill-panel[data-panel]');
  if (!tabs.length || !panels.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var skill = this.getAttribute('data-skill');
      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      panels.forEach(function (panel) {
        if (panel.getAttribute('data-panel') === skill) {
          panel.classList.add('active');
          panel.removeAttribute('hidden');
          panel.setAttribute('role', 'tabpanel');
          var cards = panel.querySelectorAll('.skill-card.fade-up');
          cards.forEach(function (card, i) {
            setTimeout(function () {
              card.classList.add('visible');
            }, i * 50);
          });
        } else {
          panel.classList.remove('active');
          panel.setAttribute('hidden', '');
        }
      });
    });
  });
})();
