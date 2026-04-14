/**
 * Hero 포지셔닝 문구 로테이션
 * 첫 화면에서는 빠른 타자 효과보다 안정적인 문구 전환이 더 읽기 쉽다.
 */
(function () {
  var target = document.getElementById('typingTarget');
  if (!target) return;

  var words = ['Web Developer', 'PLC Automation Engineer', 'Web & PLC Automation Engineer'];
  var displayDuration = 3200;
  var fadeDuration = 220;
  var wordIndex = 0;
  var timeoutId = null;

  if (window.__heroTypingTimer) {
    clearTimeout(window.__heroTypingTimer);
  }

  target.textContent = words[wordIndex];
  target.classList.remove('is-switching');

  function scheduleNext() {
    timeoutId = setTimeout(function () {
      target.classList.add('is-switching');

      window.__heroTypingTimer = setTimeout(function () {
        wordIndex = (wordIndex + 1) % words.length;
        target.textContent = words[wordIndex];
        target.classList.remove('is-switching');
        scheduleNext();
      }, fadeDuration);
    }, displayDuration);

    window.__heroTypingTimer = timeoutId;
  }

  scheduleNext();
})();
