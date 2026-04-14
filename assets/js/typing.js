/**
 * Hero 타이핑 이펙트: Web / PLC / 통합 포지셔닝 순환
 */
(function () {
  var target = document.getElementById('typingTarget');
  if (!target) return;

  var words = ['Web Developer', 'PLC Automation Engineer', 'Web & PLC Automation Engineer'];
  var typeSpeed = 80;
  var deleteSpeed = 40;
  var pauseAfter = 2000;
  var wordIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var timeoutId;

  function tick() {
    var current = words[wordIndex];
    if (isDeleting) {
      charIndex--;
      target.textContent = current.slice(0, charIndex);
      timeoutId = setTimeout(tick, deleteSpeed);
    } else {
      charIndex++;
      target.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        isDeleting = true;
        timeoutId = setTimeout(tick, pauseAfter);
        return;
      }
      timeoutId = setTimeout(tick, typeSpeed);
    }
    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      timeoutId = setTimeout(tick, typeSpeed);
    }
  }

  tick();
})();
