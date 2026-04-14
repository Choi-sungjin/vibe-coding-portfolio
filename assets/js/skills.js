/**
 * 스킬 카드 스크롤 애니메이션 (Intersection Observer, stagger)
 */
(function () {
  var cards = document.querySelectorAll('.skill-card.fade-up');
  if (!cards.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var index = Array.prototype.indexOf.call(cards, el);
          setTimeout(function () {
            el.classList.add('visible');
          }, index * 50);
        }
      });
    },
    { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
  );

  cards.forEach(function (card) {
    observer.observe(card);
  });
})();
