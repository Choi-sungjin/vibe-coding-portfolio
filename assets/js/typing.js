/**
 * typing.js — Hero 타이핑 이펙트
 * 타이핑 80ms/글자, 삭제 40ms/글자, 다음 단어 대기 2000ms
 */

const WORDS = ['Frontend Developer', 'Backend Developer', 'Fullstack Developer'];
const TYPING_MS = 80;
const DELETING_MS = 40;
const PAUSE_MS = 2000;

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let timeoutId = null;

function type() {
  const el = document.getElementById('typing-text');
  const cursor = document.getElementById('typing-cursor');
  if (!el) return;

  const word = WORDS[wordIndex];
  if (isDeleting) {
    el.textContent = word.slice(0, charIndex - 1);
    charIndex--;
  } else {
    el.textContent = word.slice(0, charIndex + 1);
    charIndex++;
  }

  if (!isDeleting && charIndex === word.length) {
    isDeleting = true;
    timeoutId = setTimeout(type, PAUSE_MS);
    return;
  }
  if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % WORDS.length;
    timeoutId = setTimeout(type, TYPING_MS);
    return;
  }

  const delay = isDeleting ? DELETING_MS : TYPING_MS;
  timeoutId = setTimeout(type, delay);
}

export function initTyping() {
  const cursor = document.getElementById('typing-cursor');
  if (cursor) {
    setInterval(() => {
      cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
    }, 500);
  }
  type();
}

export function stopTyping() {
  if (timeoutId) clearTimeout(timeoutId);
}
