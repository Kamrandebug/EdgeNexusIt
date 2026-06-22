/**
 * team-bench.js — 3D Flip Card Teams
 *
 * Animations:
 *  1. Scroll-trigger card reveal
 *  2. Keyboard accessibility for flip cards
 */

export function initTeamBench(isMobile = false, reducedMotion = false) {

  /* ─── Card entry reveal ─────────────────────────────── */
  ScrollTrigger.create({
    trigger: '#team-bench',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.to('.flip-card', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.1
      });
    }
  });

  /* ─── Keyboard accessibility ────────────────────────── */
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const inner = card.querySelector('.flip-card-inner');
        inner.style.transform =
          inner.style.transform === 'rotateY(180deg)'
            ? 'rotateY(0deg)'
            : 'rotateY(180deg)';
      }
    });
    card.addEventListener('mouseenter', () => {
      card.querySelector('.flip-front').setAttribute('aria-hidden', 'true');
      card.querySelector('.flip-back').setAttribute('aria-hidden', 'false');
    });
    card.addEventListener('mouseleave', () => {
      card.querySelector('.flip-front').setAttribute('aria-hidden', 'false');
      card.querySelector('.flip-back').setAttribute('aria-hidden', 'true');
    });
  });
}
