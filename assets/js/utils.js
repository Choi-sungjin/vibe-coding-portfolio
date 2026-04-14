/**
 * 유틸: 디바운스, 스로틀, 토스트, 클립보드 복사
 */
(function (global) {
  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(this, args); }.bind(this), ms);
    };
  }

  function throttle(fn, ms) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message || '복사됨!';
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 2000);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        showToast('복사됨!');
      }).catch(function () {
        fallbackCopy(text);
      });
    }
    fallbackCopy(text);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('복사됨!');
    } catch (e) {}
    document.body.removeChild(ta);
  }

  global.BeautyKurly = global.BeautyKurly || {};
  global.BeautyKurly.debounce = debounce;
  global.BeautyKurly.throttle = throttle;
  global.BeautyKurly.showToast = showToast;
  global.BeautyKurly.copyToClipboard = copyToClipboard;
})(typeof window !== 'undefined' ? window : this);
