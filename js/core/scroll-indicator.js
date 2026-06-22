// js/core/scroll-indicator.js
export function initScrollIndicator() {
  const line = document.createElement('div');
  line.className = 'scroll-indicator-line';
  document.body.appendChild(line);

  let hideTimer;

  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    line.style.setProperty('--scroll-pct', `${pct.toFixed(1)}%`);
    line.classList.add('visible');

    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => line.classList.remove('visible'), 800);
  }, { passive: true });
}
