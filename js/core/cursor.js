// js/core/cursor.js
import { hasHover } from './performance.js';

export function initCursor() {
  // Only on devices with real hover capability (not touch-only)
  if (!hasHover) return;

  // Inject cursor DOM
  const dot  = createEl('div', 'cursor-dot');
  const ring = createEl('div', 'cursor-ring');
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  // Hide default cursor globally
  document.documentElement.style.cursor = 'none';

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    // Dot snaps
    dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
    if (!rafId) rafId = requestAnimationFrame(lerp);
  }, { passive: true });

  function lerp() {
    rafId = null;
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;

    if (Math.abs(mx - rx) > 0.5 || Math.abs(my - ry) > 0.5) {
      rafId = requestAnimationFrame(lerp);
    }
  }

  // Hover states
  document.querySelectorAll('a, button, .service-card, .node, .nav-link').forEach(el => {
    el.style.cursor = 'none';
    el.addEventListener('mouseenter', () => {
      dot.classList.add('cursor--hover');
      ring.classList.add('cursor--hover');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('cursor--hover');
      ring.classList.remove('cursor--hover');
    });
  });

  // Click pulse
  document.addEventListener('mousedown', () => {
    ring.classList.add('cursor--click');
    setTimeout(() => ring.classList.remove('cursor--click'), 300);
  });
}

function createEl(tag, cls) {
  const el = document.createElement(tag);
  el.className = cls;
  return el;
}
