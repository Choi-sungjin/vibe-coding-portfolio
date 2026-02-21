/**
 * utils.js — 클립보드 복사, 토스트, 디바운스 등
 */

/**
 * 클립보드에 텍스트 복사 후 토스트 표시
 * @param {string} text
 * @param {HTMLElement} [toastContainer]
 */
export function copyToClipboard(text, toastContainer = document.getElementById('toast-container')) {
  if (!navigator.clipboard?.writeText) {
    fallbackCopy(text);
  } else {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  showToast('복사됨!', toastContainer);
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(ta);
  }
}

/**
 * 토스트 메시지 표시 (2초 후 제거)
 * @param {string} message
 * @param {HTMLElement} [container]
 */
export function showToast(message, container = document.getElementById('toast-container')) {
  if (!container) return;
  const existing = container.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

/**
 * 디바운스
 * @param {Function} fn
 * @param {number} ms
 */
export function debounce(fn, ms) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * easeOutCubic (count-up 등)
 * @param {number} t 0~1
 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
